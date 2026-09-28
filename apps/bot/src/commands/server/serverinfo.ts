import {
  SlashCommandBuilder,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { createBaseEmbed } from '@misan/utils';

export const ServerinfoCommand: MisanCommand = {
  name: 'serverinfo',
  description: 'Display comprehensive server statistics and details',
  category: 'Server',
  userPermissions: [],
  botPermissions: [],
  cooldown: 5,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Display server information and statistics') as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    if (!guild) return;

    const owner = await guild.fetchOwner();
    const channels = await guild.channels.fetch();
    const roles = await guild.roles.fetch();

    const embed = createBaseEmbed()
      .setTitle(`🏰 ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 256 }) || null)
      .addFields(
        { name: 'Owner', value: `${owner.user.tag} (<@${owner.id}>)`, inline: true },
        { name: 'Server ID', value: `\`${guild.id}\``, inline: true },
        { name: 'Created At', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Members', value: `👥 **${guild.memberCount}** total`, inline: true },
        { name: 'Channels', value: `📁 **${channels.size}** channels`, inline: true },
        { name: 'Roles', value: `🎭 **${roles.size}** roles`, inline: true },
        { name: 'Boost Level', value: `Tier ${guild.premiumTier} (${guild.premiumSubscriptionCount || 0} boosts)`, inline: true },
        { name: 'Verification Level', value: `Level ${guild.verificationLevel}`, inline: true }
      );

    if (guild.bannerURL()) {
      embed.setImage(guild.bannerURL({ size: 1024 }) || null);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
