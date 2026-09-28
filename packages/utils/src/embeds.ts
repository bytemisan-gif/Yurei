import { EmbedBuilder } from 'discord.js';
import { BOT_CONFIG } from '@misan/config';

export function createBaseEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BOT_CONFIG.colors.primary)
    .setFooter({ text: BOT_CONFIG.footerText })
    .setTimestamp();
}

export function createSuccessEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BOT_CONFIG.colors.success)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setFooter({ text: BOT_CONFIG.footerText })
    .setTimestamp();
}

export function createErrorEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BOT_CONFIG.colors.error)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setFooter({ text: BOT_CONFIG.footerText })
    .setTimestamp();
}

export function createWarningEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BOT_CONFIG.colors.warning)
    .setTitle(`⚠️ ${title}`)
    .setDescription(description)
    .setFooter({ text: BOT_CONFIG.footerText })
    .setTimestamp();
}

export function createPremiumUpgradeEmbed(reason?: string, featureKey?: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xffd700) // Gold
    .setTitle('🔒 Premium Feature Required')
    .setDescription(
      `${
        reason || 'This advanced feature requires an active Yurei Premium subscription.'
      }\n\n**Why Yurei Premium?**\n• Full Anti-Nuke and Auto-Recovery Engine\n• Unlimited Custom Commands & Autoresponders\n• Multi-Panel Ticket Systems & Transcripts\n• 24/7 Voice & High-Fidelity Music Filters\n• Automated Full-Server Backups\n\nGet Premium: ${BOT_CONFIG.supportInviteUrl}`
    )
    .addFields(
      { name: 'Feature Key', value: `\`${featureKey || 'advanced_feature'}\``, inline: true },
      { name: 'Upgrade Today', value: `[Join Discord Support](${BOT_CONFIG.supportInviteUrl})`, inline: true }
    )
    .setFooter({ text: 'Yurei Premium • Developed by Misan' })
    .setTimestamp();
}
