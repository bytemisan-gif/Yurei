import {
  SlashCommandBuilder,
  PermissionsBitField,
  GuildMember,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { PermissionManager } from '@misan/permissions';
import { prisma } from '@misan/database';
import { createSuccessEmbed, createErrorEmbed, parseDuration } from '@misan/utils';

export const BanCommand: ZenithCommand = {
  name: 'ban',
  description: 'Ban a member permanently from the server',
  category: 'Moderation',
  userPermissions: [PermissionsBitField.Flags.BanMembers],
  botPermissions: [PermissionsBitField.Flags.BanMembers],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member permanently from the server')
    .addUserOption((opt) => opt.setName('target').setDescription('Member to ban').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for ban'))
    .addIntegerOption((opt) =>
      opt
        .setName('deletedays')
        .setDescription('Days of message history to delete (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
    ) as SlashCommandBuilder,

  async execute({ interaction, guild, member }) {
    if (!guild || !member) return;
    const targetUser = interaction.options.getUser('target', true);
    const reason = interaction.options.getString('reason') || 'No reason provided.';
    const deleteDays = interaction.options.getInteger('deletedays') || 0;

    const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);

    if (targetMember) {
      const hierarchyCheck = PermissionManager.checkHierarchy(member, targetMember);
      if (hierarchyCheck) {
        await interaction.reply({
          embeds: [createErrorEmbed('Action Blocked', hierarchyCheck)],
          ephemeral: true,
        });
        return;
      }
    }

    await guild.members.ban(targetUser.id, {
      reason: `[${interaction.user.tag}] ${reason}`,
      deleteMessageSeconds: deleteDays * 86400,
    });

    const caseCount = (await prisma.moderationCase.count({ where: { guildId: guild.id } })) + 1;
    await prisma.moderationCase.create({
      data: {
        guildId: guild.id,
        caseNumber: caseCount,
        action: 'BAN',
        targetId: targetUser.id,
        moderatorId: interaction.user.id,
        reason,
      },
    });

    await interaction.reply({
      embeds: [
        createSuccessEmbed(
          'Member Banned',
          `**${targetUser.tag}** has been banned from the server.\n**Reason:** ${reason}\n**Case:** #${caseCount}`
        ),
      ],
    });
  },
};

export const KickCommand: ZenithCommand = {
  name: 'kick',
  description: 'Kick a member from the server',
  category: 'Moderation',
  userPermissions: [PermissionsBitField.Flags.KickMembers],
  botPermissions: [PermissionsBitField.Flags.KickMembers],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption((opt) => opt.setName('target').setDescription('Member to kick').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for kick')) as SlashCommandBuilder,

  async execute({ interaction, guild, member }) {
    if (!guild || !member) return;
    const targetUser = interaction.options.getUser('target', true);
    const reason = interaction.options.getString('reason') || 'No reason provided.';

    const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
    if (!targetMember) {
      await interaction.reply({
        embeds: [createErrorEmbed('User Not Found', 'Target user is not currently in this server.')],
        ephemeral: true,
      });
      return;
    }

    const hierarchyCheck = PermissionManager.checkHierarchy(member, targetMember);
    if (hierarchyCheck) {
      await interaction.reply({
        embeds: [createErrorEmbed('Action Blocked', hierarchyCheck)],
        ephemeral: true,
      });
      return;
    }

    await targetMember.kick(`[${interaction.user.tag}] ${reason}`);

    const caseCount = (await prisma.moderationCase.count({ where: { guildId: guild.id } })) + 1;
    await prisma.moderationCase.create({
      data: {
        guildId: guild.id,
        caseNumber: caseCount,
        action: 'KICK',
        targetId: targetUser.id,
        moderatorId: interaction.user.id,
        reason,
      },
    });

    await interaction.reply({
      embeds: [
        createSuccessEmbed(
          'Member Kicked',
          `**${targetUser.tag}** has been kicked.\n**Reason:** ${reason}\n**Case:** #${caseCount}`
        ),
      ],
    });
  },
};

export const TimeoutCommand: ZenithCommand = {
  name: 'timeout',
  description: 'Timeout (mute) a member for a specified duration',
  category: 'Moderation',
  userPermissions: [PermissionsBitField.Flags.ModerateMembers],
  botPermissions: [PermissionsBitField.Flags.ModerateMembers],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member')
    .addUserOption((opt) => opt.setName('target').setDescription('Member to timeout').setRequired(true))
    .addStringOption((opt) =>
      opt.setName('duration').setDescription('Duration (e.g. 10m, 1h, 1d)').setRequired(true)
    )
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for timeout')) as SlashCommandBuilder,

  async execute({ interaction, guild, member }) {
    if (!guild || !member) return;
    const targetUser = interaction.options.getUser('target', true);
    const durationStr = interaction.options.getString('duration', true);
    const reason = interaction.options.getString('reason') || 'No reason provided.';

    const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
    if (!targetMember) {
      await interaction.reply({
        embeds: [createErrorEmbed('User Not Found', 'Target user is not in this server.')],
        ephemeral: true,
      });
      return;
    }

    const durationMs = parseDuration(durationStr);
    if (!durationMs || durationMs > 28 * 24 * 60 * 60 * 1000) {
      await interaction.reply({
        embeds: [
          createErrorEmbed(
            'Invalid Duration',
            'Please provide a valid duration up to 28 days (e.g., `10m`, `2h`, `7d`).'
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    const hierarchyCheck = PermissionManager.checkHierarchy(member, targetMember);
    if (hierarchyCheck) {
      await interaction.reply({
        embeds: [createErrorEmbed('Action Blocked', hierarchyCheck)],
        ephemeral: true,
      });
      return;
    }

    await targetMember.timeout(durationMs, `[${interaction.user.tag}] ${reason}`);

    const caseCount = (await prisma.moderationCase.count({ where: { guildId: guild.id } })) + 1;
    await prisma.moderationCase.create({
      data: {
        guildId: guild.id,
        caseNumber: caseCount,
        action: 'TIMEOUT',
        targetId: targetUser.id,
        moderatorId: interaction.user.id,
        reason,
        durationSeconds: Math.floor(durationMs / 1000),
      },
    });

    await interaction.reply({
      embeds: [
        createSuccessEmbed(
          'Member Timed Out',
          `**${targetUser.tag}** has been timed out for **${durationStr}**.\n**Reason:** ${reason}\n**Case:** #${caseCount}`
        ),
      ],
    });
  },
};
