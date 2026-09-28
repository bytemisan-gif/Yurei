import {
  SlashCommandBuilder,
  PermissionsBitField,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { prisma } from '@misan/database';
import { createSuccessEmbed, createErrorEmbed, createBaseEmbed } from '@misan/utils';

export const WarnCommand: ZenithCommand = {
  name: 'warn',
  description: 'Issue a formal moderation warning to a member',
  category: 'Moderation',
  userPermissions: [PermissionsBitField.Flags.ModerateMembers],
  botPermissions: [],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issue a formal warning to a member')
    .addUserOption((opt) => opt.setName('target').setDescription('Member to warn').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for warning').setRequired(true)) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    if (!guild) return;
    const targetUser = interaction.options.getUser('target', true);
    const reason = interaction.options.getString('reason', true);

    await prisma.warning.create({
      data: {
        guildId: guild.id,
        userId: targetUser.id,
        moderatorId: interaction.user.id,
        reason,
      },
    });

    const caseCount = (await prisma.moderationCase.count({ where: { guildId: guild.id } })) + 1;
    await prisma.moderationCase.create({
      data: {
        guildId: guild.id,
        caseNumber: caseCount,
        action: 'WARN',
        targetId: targetUser.id,
        moderatorId: interaction.user.id,
        reason,
      },
    });

    const totalWarnings = await prisma.warning.count({
      where: { guildId: guild.id, userId: targetUser.id },
    });

    await interaction.reply({
      embeds: [
        createSuccessEmbed(
          'Warning Issued',
          `⚠️ **${targetUser.tag}** has been warned.\n**Reason:** ${reason}\n**Total Warnings:** ${totalWarnings}\n**Case:** #${caseCount}`
        ),
      ],
    });
  },
};

export const WarningsCommand: ZenithCommand = {
  name: 'warnings',
  description: 'View active warnings for a member',
  category: 'Moderation',
  userPermissions: [PermissionsBitField.Flags.ModerateMembers],
  botPermissions: [],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View active warnings for a member')
    .addUserOption((opt) => opt.setName('target').setDescription('Member').setRequired(true)) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    if (!guild) return;
    const targetUser = interaction.options.getUser('target', true);

    const warnings = await prisma.warning.findMany({
      where: { guildId: guild.id, userId: targetUser.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const embed = createBaseEmbed()
      .setTitle(`⚠️ Warnings for ${targetUser.tag}`)
      .setDescription(
        warnings.length === 0
          ? 'This user has a clean record (0 warnings).'
          : warnings
              .map(
                (w, i) =>
                  `**${i + 1}.** Reason: *${w.reason}*\n   Moderator: <@${w.moderatorId}> (<t:${Math.floor(
                    w.createdAt.getTime() / 1000
                  )}:R>)`
              )
              .join('\n\n')
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export const CaseCommand: ZenithCommand = {
  name: 'case',
  description: 'Lookup detailed information about a moderation case',
  category: 'Moderation',
  userPermissions: [PermissionsBitField.Flags.ModerateMembers],
  botPermissions: [],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('case')
    .setDescription('Lookup detailed moderation case info')
    .addIntegerOption((opt) =>
      opt.setName('number').setDescription('Case number').setRequired(true)
    ) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    if (!guild) return;
    const caseNumber = interaction.options.getInteger('number', true);

    const modCase = await prisma.moderationCase.findUnique({
      where: {
        guildId_caseNumber: { guildId: guild.id, caseNumber },
      },
    });

    if (!modCase) {
      await interaction.reply({
        embeds: [createErrorEmbed('Case Not Found', `Case #${caseNumber} does not exist in this server.`)],
        ephemeral: true,
      });
      return;
    }

    const embed = createBaseEmbed()
      .setTitle(`📋 Case #${modCase.caseNumber} • ${modCase.action}`)
      .addFields(
        { name: 'Target User', value: `<@${modCase.targetId}> (\`${modCase.targetId}\`)`, inline: true },
        { name: 'Moderator', value: `<@${modCase.moderatorId}> (\`${modCase.moderatorId}\`)`, inline: true },
        { name: 'Reason', value: modCase.reason, inline: false },
        { name: 'Timestamp', value: `<t:${Math.floor(modCase.createdAt.getTime() / 1000)}:F>`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
