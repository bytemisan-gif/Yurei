import {
  Guild,
  GuildAuditLogsEntry,
  GuildMember,
  AuditLogEvent,
  PermissionsBitField,
} from 'discord.js';
import { prisma } from '@misan/database';
import { logger } from '@misan/logger';
import { BOT_CONFIG } from '@misan/config';

interface ActionRecord {
  timestamp: number;
}

export class AntinukeEngine {
  // In-memory sliding window counters: key -> `${guildId}:${actorId}:${actionType}` -> timestamps[]
  private static actionLogs = new Map<string, ActionRecord[]>();

  /**
   * Check if a user or role is whitelisted/trusted
   */
  public static async isWhitelisted(
    guildId: string,
    member: GuildMember
  ): Promise<boolean> {
    // 0. System Bot Owner is ALWAYS exempt and cannot trigger antinuke
    if (member.id === '1354252509010722817' || BOT_CONFIG.ownerIds.includes(member.id)) return true;

    // 1. Guild owner is always exempt
    if (member.guild.ownerId === member.id) return true;

    // 2. Bot itself is exempt
    if (member.id === member.client.user.id) return true;

    try {
      const entries = await prisma.whitelistEntry.findMany({
        where: {
          guildId,
          whitelistType: { in: ['ANTINUKE', 'ALL'] },
        },
      });

      // Check User ID
      if (entries.some((e) => e.targetType === 'USER' && e.targetId === member.id)) {
        return true;
      }

      // Check Role IDs
      const memberRoleIds = member.roles.cache.map((r) => r.id);
      if (entries.some((e) => e.targetType === 'ROLE' && memberRoleIds.includes(e.targetId))) {
        return true;
      }

      // Check Bot Whitelist
      if (member.user.bot && entries.some((e) => e.targetType === 'BOT' && e.targetId === member.id)) {
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to check antinuke whitelist', { guildId, userId: member.id, error });
      return false;
    }
  }

  /**
   * Register an action and assess if the actor exceeded the threshold in the time window
   */
  public static async registerAction(
    guild: Guild,
    actorId: string,
    actionType:
      | 'BAN'
      | 'KICK'
      | 'ROLE_DELETE'
      | 'ROLE_CREATE'
      | 'CHANNEL_DELETE'
      | 'CHANNEL_CREATE'
      | 'WEBHOOK_CREATE'
      | 'BOT_ADD'
  ): Promise<boolean> {
    const config = await prisma.antinukeConfig.findUnique({
      where: { guildId: guild.id },
    });

    if (!config || !config.enabled) return false;

    // Fetch actor GuildMember
    let member: GuildMember | null = null;
    try {
      member = await guild.members.fetch(actorId).catch(() => null);
    } catch {
      member = null;
    }

    if (!member) return false;

    // Whitelist check
    if (await this.isWhitelisted(guild.id, member)) return false;

    const now = Date.now();
    const key = `${guild.id}:${actorId}:${actionType}`;

    let threshold = 3;
    let windowMs = 10000;

    switch (actionType) {
      case 'BAN':
        threshold = config.banThreshold;
        windowMs = config.banWindowSec * 1000;
        break;
      case 'KICK':
        threshold = config.kickThreshold;
        windowMs = config.kickWindowSec * 1000;
        break;
      case 'CHANNEL_DELETE':
        threshold = config.channelDelThreshold;
        windowMs = config.channelDelWindowSec * 1000;
        break;
      case 'CHANNEL_CREATE':
        threshold = config.channelCreateThreshold;
        windowMs = config.channelCreateWindowSec * 1000;
        break;
      case 'ROLE_DELETE':
        threshold = config.roleDelThreshold;
        windowMs = config.roleDelWindowSec * 1000;
        break;
      case 'ROLE_CREATE':
        threshold = config.roleCreateThreshold;
        windowMs = config.roleCreateWindowSec * 1000;
        break;
      case 'WEBHOOK_CREATE':
        threshold = config.webhookThreshold;
        windowMs = config.webhookWindowSec * 1000;
        break;
      case 'BOT_ADD':
        threshold = 1; // Instant trigger if bot protection is active
        windowMs = 60000;
        break;
    }

    const records = (this.actionLogs.get(key) || []).filter((r) => now - r.timestamp <= windowMs);
    records.push({ timestamp: now });
    this.actionLogs.set(key, records);

    if (records.length >= threshold) {
      // Threshold breached! Execute punishment
      await this.punishActor(guild, member, config.punishment, actionType, records.length);
      this.actionLogs.delete(key);
      return true;
    }

    return false;
  }

  /**
   * Punish malicious actor according to configured policy
   */
  private static async punishActor(
    guild: Guild,
    member: GuildMember,
    punishment: string,
    actionType: string,
    count: number
  ): Promise<void> {
    const reason = `[Yurei Antinuke] Triggered threshold breach for ${actionType} (${count} actions in window).`;
    logger.warn(`ANTINUKE TRIGGER: Punishing ${member.user.tag} (${member.id}) in ${guild.name} with ${punishment}`);

    try {
      if (punishment === 'BAN') {
        if (member.bannable) {
          await member.ban({ reason });
        }
      } else if (punishment === 'KICK') {
        if (member.kickable) {
          await member.kick(reason);
        }
      } else if (punishment === 'STRIP_ROLES') {
        // Remove all dangerous permissions roles
        const dangerousRoles = member.roles.cache.filter(
          (role) =>
            role.id !== guild.id &&
            !role.managed &&
            role.permissions.has([
              PermissionsBitField.Flags.Administrator,
              PermissionsBitField.Flags.ManageGuild,
              PermissionsBitField.Flags.ManageRoles,
              PermissionsBitField.Flags.ManageChannels,
              PermissionsBitField.Flags.BanMembers,
              PermissionsBitField.Flags.KickMembers,
            ])
        );

        for (const role of dangerousRoles.values()) {
          await member.roles.remove(role, reason).catch(() => null);
        }
      } else {
        // Fallback: Timeout for 28 days
        if (member.moderatable) {
          await member.timeout(28 * 24 * 60 * 60 * 1000, reason).catch(() => null);
        }
      }

      // Record Security Incident in database
      await prisma.securityEvent.create({
        data: {
          guildId: guild.id,
          eventType: `ANTINUKE_${actionType}`,
          actorId: member.id,
          actionTaken: punishment,
          details: reason,
        },
      });
    } catch (error) {
      logger.error('Failed to execute antinuke punishment', { guildId: guild.id, userId: member.id, error });
    }
  }

  /**
   * Helper to retrieve recent audit log entry with retry backoff
   */
  public static async fetchAuditActor(
    guild: Guild,
    type: AuditLogEvent
  ): Promise<GuildAuditLogsEntry | null> {
    for (let i = 0; i < 3; i++) {
      try {
        const auditLogs = await guild.fetchAuditLogs({ limit: 1, type });
        const entry = auditLogs.entries.first();
        if (entry && Date.now() - entry.createdTimestamp < 5000) {
          return entry;
        }
      } catch {
        // Ignore fetch error
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    return null;
  }
}
