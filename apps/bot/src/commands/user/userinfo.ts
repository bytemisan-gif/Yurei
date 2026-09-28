import {
  SlashCommandBuilder,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { createBaseEmbed } from '@misan/utils';

export const UserinfoCommand: ZenithCommand = {
  name: 'userinfo',
  description: 'Display detailed account and guild member information',
  category: 'User',
  userPermissions: [],
  botPermissions: [],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Display user and member information')
    .addUserOption((opt) => opt.setName('target').setDescription('Target user')) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    const targetUser = interaction.options.getUser('target') || interaction.user;
    const member = guild ? await guild.members.fetch(targetUser.id).catch(() => null) : null;

    const embed = createBaseEmbed()
      .setTitle(`👤 ${targetUser.tag}`)
      .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'User ID', value: `\`${targetUser.id}\``, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Bot Account', value: targetUser.bot ? '🤖 Yes' : '👤 No', inline: true }
      );

    if (member) {
      const roles = member.roles.cache
        .filter((r) => r.id !== guild!.id)
        .map((r) => `<@&${r.id}>`);

      embed.addFields(
        {
          name: 'Server Joined',
          value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown',
          inline: true,
        },
        {
          name: 'Highest Role',
          value: member.roles.highest ? `<@&${member.roles.highest.id}>` : '*None*',
          inline: true,
        },
        {
          name: `Roles (${roles.length})`,
          value: roles.length > 0 ? roles.slice(0, 15).join(', ') : '*No roles assigned*',
          inline: false,
        }
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};

export const AvatarCommand: ZenithCommand = {
  name: 'avatar',
  description: 'Display high-resolution profile avatar of a user',
  category: 'User',
  userPermissions: [],
  botPermissions: [],
  cooldown: 3,
  guildOnly: false,
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Display user avatar')
    .addUserOption((opt) => opt.setName('target').setDescription('Target user')) as SlashCommandBuilder,

  async execute({ interaction }) {
    const target = interaction.options.getUser('target') || interaction.user;
    const avatarUrl = target.displayAvatarURL({ size: 1024, extension: 'png' });

    const embed = createBaseEmbed()
      .setTitle(`🖼️ ${target.tag}'s Avatar`)
      .setImage(avatarUrl)
      .setDescription(`[Direct Link](${avatarUrl})`);

    await interaction.reply({ embeds: [embed] });
  },
};
