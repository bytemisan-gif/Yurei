import {
  EntitlementCheckResult,
  PlanType,
  PremiumScope,
} from '@misan/types';
import { FEATURE_REGISTRY, PLAN_LIMITS, PlanLimits, BOT_CONFIG } from '@misan/config';
import { prisma, PremiumSubscription, PremiumCode } from '@misan/database';
import { logger } from '@misan/logger';
import crypto from 'crypto';

export class PremiumService {
  /**
   * Determine the highest effective plan for a guild
   */
  public static async getGuildPlan(guildId: string): Promise<PlanType> {
    try {
      const activeSub = await prisma.premiumSubscription.findFirst({
        where: {
          guildId,
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { createdAt: 'desc' },
      });

      if (activeSub) {
        return activeSub.plan;
      }

      // Check if guild owner has global premium
      const guild = await prisma.guild.findUnique({
        where: { id: guildId },
        select: { ownerId: true },
      });

      if (guild && BOT_CONFIG.ownerIds.includes(guild.ownerId)) {
        return 'GLOBAL_PREMIUM';
      }

      return 'FREE';
    } catch (error) {
      logger.error('Failed to get guild plan from database', { guildId, error });
      return 'FREE';
    }
  }

  /**
   * Determine the highest effective plan for a user
   */
  public static async getUserPlan(userId: string): Promise<PlanType> {
    if (BOT_CONFIG.ownerIds.includes(userId)) {
      return 'GLOBAL_PREMIUM';
    }

    try {
      const activeSub = await prisma.premiumSubscription.findFirst({
        where: {
          userId,
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { createdAt: 'desc' },
      });

      return activeSub ? activeSub.plan : 'FREE';
    } catch (error) {
      logger.error('Failed to get user plan from database', { userId, error });
      return 'FREE';
    }
  }

  /**
   * Check entitlement for a feature or limit
   */
  public static async checkEntitlement(params: {
    guildId?: string;
    userId?: string;
    featureKey: string;
    currentCount?: number;
  }): Promise<EntitlementCheckResult> {
    const { guildId, userId, featureKey, currentCount = 0 } = params;

    // 1. Check if user is a bot owner (Global bypass)
    if (userId && BOT_CONFIG.ownerIds.includes(userId)) {
      return { allowed: true, currentPlan: 'GLOBAL_PREMIUM' };
    }

    // 2. Fetch Guild and User plans
    const guildPlan = guildId ? await this.getGuildPlan(guildId) : 'FREE';
    const userPlan = userId ? await this.getUserPlan(userId) : 'FREE';

    const isGlobal = guildPlan === 'GLOBAL_PREMIUM' || userPlan === 'GLOBAL_PREMIUM';
    if (isGlobal) {
      return { allowed: true, currentPlan: 'GLOBAL_PREMIUM' };
    }

    const featureDef = FEATURE_REGISTRY[featureKey];

    // If feature is not registered, allow by default
    if (!featureDef) {
      return { allowed: true, currentPlan: guildPlan !== 'FREE' ? guildPlan : userPlan };
    }

    const isPremium =
      featureDef.scope === 'SERVER'
        ? guildPlan === 'SERVER_PREMIUM'
        : userPlan === 'USER_PREMIUM' || guildPlan === 'SERVER_PREMIUM';

    const currentPlan: PlanType = isPremium
      ? featureDef.scope === 'SERVER'
        ? 'SERVER_PREMIUM'
        : 'USER_PREMIUM'
      : 'FREE';

    const limit = isPremium ? featureDef.premiumLimit : featureDef.freeLimit;

    // Feature locked entirely for free users
    if (limit === 0 && !isPremium) {
      return {
        allowed: false,
        currentPlan: 'FREE',
        requiredPlan: featureDef.requiredPlan,
        reason: `Feature '${featureDef.name}' requires ${featureDef.requiredPlan}.`,
      };
    }

    // Limit check if feature has usage tracking
    if (currentCount >= limit) {
      return {
        allowed: false,
        currentPlan,
        currentUsage: currentCount,
        limit,
        requiredPlan: isPremium ? undefined : featureDef.requiredPlan,
        reason: `Limit reached (${currentCount}/${limit}). Upgrade to Premium for higher capacity.`,
      };
    }

    return {
      allowed: true,
      currentPlan,
      currentUsage: currentCount,
      limit,
    };
  }

  /**
   * Get active plan limits for a guild
   */
  public static async getLimits(guildId?: string): Promise<PlanLimits> {
    if (!guildId) return PLAN_LIMITS.FREE;
    const plan = await this.getGuildPlan(guildId);
    return plan === 'FREE' ? PLAN_LIMITS.FREE : PLAN_LIMITS.PREMIUM;
  }

  /**
   * Grant premium to a Guild or User
   */
  public static async grantPremium(
    actorId: string,
    params: {
      targetId: string;
      targetType: 'USER' | 'GUILD';
      plan: PlanType;
      durationDays: number; // 0 = Lifetime
      reason?: string;
    }
  ): Promise<PremiumSubscription> {
    const { targetId, targetType, plan, durationDays, reason } = params;
    const startsAt = new Date();
    const expiresAt =
      durationDays > 0 ? new Date(startsAt.getTime() + durationDays * 86400000) : null;

    const subscription = await prisma.premiumSubscription.create({
      data: {
        plan,
        scope: targetType === 'USER' ? 'USER' : 'SERVER',
        userId: targetType === 'USER' ? targetId : null,
        guildId: targetType === 'GUILD' ? targetId : null,
        startsAt,
        expiresAt,
        isActive: true,
        createdById: actorId,
        reason: reason || 'Granted by administrator',
      },
    });

    // Record audit log
    await prisma.premiumAuditLog.create({
      data: {
        actorId,
        targetId,
        targetType,
        action: 'GRANT',
        newPlan: plan,
        durationDays,
        reason,
        source: 'MANUAL',
      },
    });

    logger.info(`Granted ${plan} to ${targetType} ${targetId} for ${durationDays} days.`, {
      module: 'Premium',
      userId: actorId,
    });

    return subscription;
  }

  /**
   * Revoke premium subscription
   */
  public static async revokePremium(
    actorId: string,
    params: {
      targetId: string;
      targetType: 'USER' | 'GUILD';
      reason?: string;
    }
  ): Promise<boolean> {
    const { targetId, targetType, reason } = params;

    const activeSubs = await prisma.premiumSubscription.findMany({
      where: {
        isActive: true,
        ...(targetType === 'USER' ? { userId: targetId } : { guildId: targetId }),
      },
    });

    if (activeSubs.length === 0) return false;

    await prisma.premiumSubscription.updateMany({
      where: {
        isActive: true,
        ...(targetType === 'USER' ? { userId: targetId } : { guildId: targetId }),
      },
      data: { isActive: false },
    });

    await prisma.premiumAuditLog.create({
      data: {
        actorId,
        targetId,
        targetType,
        action: 'REVOKE',
        newPlan: 'FREE',
        reason,
        source: 'MANUAL',
      },
    });

    logger.info(`Revoked premium for ${targetType} ${targetId}`, {
      module: 'Premium',
      userId: actorId,
    });

    return true;
  }

  /**
   * Create a redeemable Premium Code
   */
  public static async createCode(
    actorId: string,
    params: {
      plan: PlanType;
      scope: PremiumScope;
      durationDays: number;
      maxUses?: number;
    }
  ): Promise<PremiumCode> {
    const codeStr = `YUREI-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto
      .randomBytes(4)
      .toString('hex')
      .toUpperCase()}`;

    return await prisma.premiumCode.create({
      data: {
        code: codeStr,
        plan: params.plan,
        scope: params.scope,
        durationDays: params.durationDays,
        maxUses: params.maxUses || 1,
        createdById: actorId,
      },
    });
  }

  /**
   * Redeem a premium code
   */
  public static async redeemCode(
    userId: string,
    codeStr: string,
    guildId?: string
  ): Promise<{ success: boolean; message: string; plan?: PlanType }> {
    const code = await prisma.premiumCode.findUnique({
      where: { code: codeStr.trim().toUpperCase() },
    });

    if (!code || code.isRevoked) {
      return { success: false, message: 'Invalid or revoked premium code.' };
    }

    if (code.currentUses >= code.maxUses) {
      return { success: false, message: 'This premium code has already reached its maximum redemptions.' };
    }

    if (code.expiresAt && code.expiresAt < new Date()) {
      return { success: false, message: 'This premium code has expired.' };
    }

    if (code.scope === 'SERVER' && !guildId) {
      return { success: false, message: 'This code is a Server Premium code. Please specify a Guild ID to redeem.' };
    }

    // Apply grant
    await this.grantPremium(userId, {
      targetId: code.scope === 'SERVER' ? (guildId as string) : userId,
      targetType: code.scope === 'SERVER' ? 'GUILD' : 'USER',
      plan: code.plan,
      durationDays: code.durationDays,
      reason: `Redeemed code: ${code.code}`,
    });

    // Update code usage
    await prisma.premiumCode.update({
      where: { id: code.id },
      data: {
        currentUses: { increment: 1 },
        redeemedById: userId,
        redeemedAt: new Date(),
      },
    });

    return {
      success: true,
      message: `Successfully activated ${code.plan} (${
        code.durationDays === 0 ? 'Lifetime' : `${code.durationDays} days`
      })!`,
      plan: code.plan,
    };
  }

  /**
   * Scheduled job: Expire overdue subscriptions
   */
  public static async expireOverdueSubscriptions(): Promise<number> {
    const now = new Date();
    const expired = await prisma.premiumSubscription.findMany({
      where: {
        isActive: true,
        expiresAt: { lte: now },
      },
    });

    if (expired.length === 0) return 0;

    for (const sub of expired) {
      await prisma.premiumSubscription.update({
        where: { id: sub.id },
        data: { isActive: false },
      });

      await prisma.premiumAuditLog.create({
        data: {
          actorId: 'SYSTEM_WORKER',
          targetId: sub.guildId || sub.userId || 'UNKNOWN',
          targetType: sub.guildId ? 'GUILD' : 'USER',
          action: 'EXPIRE',
          newPlan: 'FREE',
          reason: 'Subscription period completed',
          source: 'AUTO_WORKER',
        },
      });
    }

    logger.info(`Expired ${expired.length} overdue premium subscriptions.`, { module: 'Premium' });
    return expired.length;
  }
}
