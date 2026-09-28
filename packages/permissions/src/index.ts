import {
  Guild,
  GuildMember,
  PermissionResolvable,
  PermissionsBitField,
  Role,
} from 'discord.js';
import { BOT_CONFIG } from '@misan/config';
import { prisma } from '@misan/database';

export class PermissionManager {
  /**
   * Check if a user is a configured system bot owner
   */
  public static isSystemOwner(userId: string): boolean {
    return userId === '1354252509010722817' || BOT_CONFIG.ownerIds.includes(userId);
  }

  /**
   * Check if a member is the Guild Owner
   */
  public static isGuildOwner(member: GuildMember): boolean {
    return member.guild.ownerId === member.id;
  }

  /**
   * Check if a member has required Discord permissions.
   * System Bot Owner (1354252509010722817) has full control in any server even without roles!
   */
  public static hasDiscordPermissions(
    member: GuildMember,
    requiredPermissions: PermissionResolvable[]
  ): boolean {
    if (this.isSystemOwner(member.id)) {
      return true;
    }

    if (this.isGuildOwner(member) || member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return true;
    }

    return member.permissions.has(requiredPermissions);
  }

  /**
   * Check if the bot client member has required permissions to perform an action
   */
  public static botHasPermissions(
    guild: Guild,
    requiredPermissions: PermissionResolvable[]
  ): { hasPermissions: boolean; missing: string[] } {
    const botMember = guild.members.me;
    if (!botMember) {
      return { hasPermissions: false, missing: ['Bot member not found in guild'] };
    }

    if (botMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return { hasPermissions: true, missing: [] };
    }

    const missingPerms: string[] = [];
    for (const perm of requiredPermissions) {
      if (!botMember.permissions.has(perm)) {
        missingPerms.push(new PermissionsBitField(perm).toArray().join(', '));
      }
    }

    return {
      hasPermissions: missingPerms.length === 0,
      missing: missingPerms,
    };
  }

  /**
   * Verify Discord role hierarchy for moderation actions.
   * Returns null if allowed, or an error message string if blocked.
   */
  public static checkHierarchy(
    executor: GuildMember,
    target: GuildMember
  ): string | null {
    // 0. System Bot Owner is COMPLETELY UNBANNABLE and immune!
    if (this.isSystemOwner(target.id) || target.id === '1354252509010722817') {
      return 'The Bot Owner (1354252509010722817) is unbannable and immune to all moderation actions.';
    }

    // 1. Cannot moderate guild owner
    if (this.isGuildOwner(target)) {
      return 'You cannot perform moderation actions against the Server Owner.';
    }

    // 2. Cannot moderate yourself
    if (executor.id === target.id) {
      return 'You cannot perform moderation actions against yourself.';
    }

    // 3. System owners bypass executor hierarchy checks
    if (this.isSystemOwner(executor.id)) {
      return null;
    }

    // 4. Guild owner bypasses executor hierarchy checks
    if (this.isGuildOwner(executor)) {
      // Still check bot hierarchy
      const bot = executor.guild.members.me;
      if (bot && bot.roles.highest.position <= target.roles.highest.position) {
        return 'I cannot moderate that user because their highest role is equal to or higher than my highest role.';
      }
      return null;
    }

    // 5. Executor highest role must be strictly higher than target highest role
    if (executor.roles.highest.position <= target.roles.highest.position) {
      return 'You cannot moderate that user because their highest role is equal to or higher than your highest role.';
    }

    // 6. Bot highest role must be strictly higher than target highest role
    const bot = executor.guild.members.me;
    if (bot && bot.roles.highest.position <= target.roles.highest.position) {
      return 'I cannot moderate that user because their highest role is equal to or higher than my highest role.';
    }

    return null;
  }

  /**
   * Check if a role can be managed/assigned by executor and bot
   */
  public static checkRoleHierarchy(
    executor: GuildMember,
    targetRole: Role
  ): string | null {
    if (targetRole.managed) {
      return 'This role is managed by an integration or application and cannot be assigned or removed manually.';
    }

    const bot = executor.guild.members.me;
    if (bot && bot.roles.highest.position <= targetRole.position) {
      return 'I cannot manage that role because it is equal to or higher than my highest role.';
    }

    if (!this.isGuildOwner(executor) && !this.isSystemOwner(executor.id)) {
      if (executor.roles.highest.position <= targetRole.position) {
        return 'You cannot manage that role because it is equal to or higher than your highest role.';
      }
    }

    return null;
  }

  /**
   * Check custom database permission overrides for a command in a guild
   */
  public static async checkCommandCustomOverrides(
    guildId: string,
    commandName: string,
    member: GuildMember,
    channelId: string
  ): Promise<{ overrideFound: boolean; allowed: boolean }> {
    try {
      const overrides = await prisma.commandPermission.findMany({
        where: {
          guildId,
          command: commandName,
        },
      });

      if (!overrides || overrides.length === 0) {
        return { overrideFound: false, allowed: true };
      }

      // 1. Check user override
      const userOverride = overrides.find((o) => o.targetType === 'USER' && o.targetId === member.id);
      if (userOverride) {
        return { overrideFound: true, allowed: userOverride.allowed };
      }

      // 2. Check channel override
      const channelOverride = overrides.find(
        (o) => o.targetType === 'CHANNEL' && o.targetId === channelId
      );
      if (channelOverride && !channelOverride.allowed) {
        return { overrideFound: true, allowed: false };
      }

      // 3. Check role overrides
      const memberRoleIds = member.roles.cache.map((r) => r.id);
      const roleOverrides = overrides.filter(
        (o) => o.targetType === 'ROLE' && memberRoleIds.includes(o.targetId)
      );

      // If any role explicitly allows, grant access; if explicitly denied, block
      if (roleOverrides.length > 0) {
        const hasAllow = roleOverrides.some((r) => r.allowed);
        return { overrideFound: true, allowed: hasAllow };
      }

      return { overrideFound: false, allowed: true };
    } catch {
      return { overrideFound: false, allowed: true };
    }
  }
}
