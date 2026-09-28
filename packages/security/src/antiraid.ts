import { GuildMember, PermissionsBitField } from 'discord.js';
import { prisma } from '@misan/database';
import { logger } from '@misan/logger';

interface JoinRecord {
  timestamp: number;
}

export class AntiraidEngine {
  private static joinLogs = new Map<string, JoinRecord[]>();

  public static async handleMemberJoin(member: GuildMember): Promise<void> {
    const guild = member.guild;
    const config = await prisma.antiraidConfig.findUnique({
      where: { guildId: guild.id },
    });

    if (!config || !config.enabled) return;

    // Check account age in days
    const accountAgeMs = Date.now() - member.user.createdTimestamp;
    const accountAgeDays = Math.floor(accountAgeMs / (1000 * 60 * 60 * 24));

    if (accountAgeDays < config.minAccountAgeDays) {
      logger.warn(`ANTIRAID: Kicking ${member.user.tag} (Account age ${accountAgeDays}d < min ${config.minAccountAgeDays}d)`);
      if (member.kickable) {
        await member.kick(`[Zenith Anti-Raid] Account age (${accountAgeDays} days) below server requirement.`);
      }
      return;
    }

    // Velocity tracker
    const now = Date.now();
    const windowMs = config.joinWindowSec * 1000;
    const records = (this.joinLogs.get(guild.id) || []).filter((r) => now - r.timestamp <= windowMs);
    records.push({ timestamp: now });
    this.joinLogs.set(guild.id, records);

    if (records.length >= config.joinThreshold) {
      logger.error(`ANTIRAID TRIGGER: Raid wave detected in ${guild.name} (${records.length} joins in ${config.joinWindowSec}s).`);
      
      // Lockdown guild channels if enabled
      if (config.lockdownEnabled) {
        await this.triggerEmergencyLockdown(guild);
      }

      await prisma.securityEvent.create({
        data: {
          guildId: guild.id,
          eventType: 'ANTIRAID_TRIGGER',
          actorId: member.id,
          actionTaken: config.lockdownEnabled ? 'LOCKDOWN' : 'ALERT_ONLY',
          details: `Detected ${records.length} joins within ${config.joinWindowSec} seconds.`,
        },
      });
    }
  }

  public static async triggerEmergencyLockdown(guild: { id: string; name: string; channels: any }): Promise<void> {
    try {
      const channels = await guild.channels.fetch();
      for (const channel of channels.values()) {
        if (channel && channel.isTextBased() && 'permissionOverwrites' in channel) {
          await channel.permissionOverwrites.edit(guild.id, {
            SendMessages: false,
            AddReactions: false,
          }).catch(() => null);
        }
      }
      logger.warn(`EMERGENCY LOCKDOWN engaged on guild ${guild.name} (${guild.id})`);
    } catch (error) {
      logger.error('Failed to trigger emergency lockdown', { guildId: guild.id, error });
    }
  }
}
