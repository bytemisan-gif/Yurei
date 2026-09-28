import {
  SlashCommandBuilder,
  PermissionsBitField,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { prisma } from '@misan/database';
import { createSuccessEmbed, createBaseEmbed } from '@misan/utils';

export const LoggingCommand: ZenithCommand = {
  name: 'logging',
  description: 'Configure server audit and event dispatch logging channels',
  category: 'Logging',
  userPermissions: [PermissionsBitField.Flags.Administrator],
  botPermissions: [PermissionsBitField.Flags.ViewAuditLog, PermissionsBitField.Flags.SendMessages],
  cooldown: 5,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('logging')
    .setDescription('Configure server audit and event logging')
    .addSubcommand((sub) =>
      sub.setName('status').setDescription('View current configured logging channels')
    )
    .addSubcommand((sub) =>
      sub
        .setName('general')
        .setDescription('Set general catch-all logs channel')
        .addChannelOption((opt) => opt.setName('channel').setDescription('Log channel').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('mod')
        .setDescription('Set moderation actions log channel')
        .addChannelOption((opt) => opt.setName('channel').setDescription('Log channel').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('messages')
        .setDescription('Set message edits and deletions log channel')
        .addChannelOption((opt) => opt.setName('channel').setDescription('Log channel').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('members')
        .setDescription('Set member join, leave, and role change log channel')
        .addChannelOption((opt) => opt.setName('channel').setDescription('Log channel').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('security')
        .setDescription('Set security and antinuke incidents log channel')
        .addChannelOption((opt) => opt.setName('channel').setDescription('Log channel').setRequired(true))
    ) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    if (!guild) return;
    const subcommand = interaction.options.getSubcommand();

    let config = await prisma.logConfig.findUnique({
      where: { guildId: guild.id },
    });

    if (!config) {
      config = await prisma.logConfig.create({
        data: { guildId: guild.id, enabled: true },
      });
    }

    if (subcommand === 'status') {
      const embed = createBaseEmbed()
        .setTitle('📑 Yurei Logging Dispatch Configuration')
        .setDescription(`Active event dispatch channels for **${guild.name}**`)
        .addFields(
          { name: 'General Logs', value: config.generalChannelId ? `<#${config.generalChannelId}>` : '*None*', inline: true },
          { name: 'Moderation Logs', value: config.modLogChannelId ? `<#${config.modLogChannelId}>` : '*None*', inline: true },
          { name: 'Message Logs', value: config.messageLogChannelId ? `<#${config.messageLogChannelId}>` : '*None*', inline: true },
          { name: 'Member Logs', value: config.memberLogChannelId ? `<#${config.memberLogChannelId}>` : '*None*', inline: true },
          { name: 'Security Logs', value: config.securityChannelId ? `<#${config.securityChannelId}>` : '*None*', inline: true }
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    const channel = interaction.options.getChannel('channel', true);

    const updateData: Record<string, string> = {};
    if (subcommand === 'general') updateData.generalChannelId = channel.id;
    if (subcommand === 'mod') updateData.modLogChannelId = channel.id;
    if (subcommand === 'messages') updateData.messageLogChannelId = channel.id;
    if (subcommand === 'members') updateData.memberLogChannelId = channel.id;
    if (subcommand === 'security') updateData.securityChannelId = channel.id;

    await prisma.logConfig.update({
      where: { guildId: guild.id },
      data: updateData,
    });

    await interaction.reply({
      embeds: [
        createSuccessEmbed(
          'Logging Channel Updated',
          `Events for category **${subcommand.toUpperCase()}** will now be dispatched to ${channel}.`
        ),
      ],
    });
  },
};
