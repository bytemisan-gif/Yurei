import {
  SlashCommandBuilder,
  PermissionsBitField,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { prisma } from '@misan/database';
import { createSuccessEmbed, createErrorEmbed, createBaseEmbed } from '@misan/utils';

export const AntiraidCommand: ZenithCommand = {
  name: 'antiraid',
  description: 'Configure intelligent anti-raid flood protection and account-age verification',
  category: 'Security',
  userPermissions: [PermissionsBitField.Flags.Administrator],
  botPermissions: [
    PermissionsBitField.Flags.KickMembers,
    PermissionsBitField.Flags.BanMembers,
    PermissionsBitField.Flags.ManageChannels,
  ],
  cooldown: 5,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('antiraid')
    .setDescription('Configure intelligent anti-raid flood protection')
    .addSubcommand((sub) =>
      sub.setName('enable').setDescription('Enable anti-raid protection')
    )
    .addSubcommand((sub) =>
      sub.setName('disable').setDescription('Disable anti-raid protection')
    )
    .addSubcommand((sub) =>
      sub.setName('status').setDescription('View current anti-raid parameters')
    )
    .addSubcommand((sub) =>
      sub
        .setName('threshold')
        .setDescription('Set max joins permitted within the detection time window')
        .addIntegerOption((opt) =>
          opt
            .setName('joins')
            .setDescription('Number of joins (e.g. 10)')
            .setRequired(true)
            .setMinValue(2)
            .setMaxValue(50)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('accountage')
        .setDescription('Set minimum required account age in days')
        .addIntegerOption((opt) =>
          opt
            .setName('days')
            .setDescription('Minimum age in days (e.g. 7)')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(90)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('punishment')
        .setDescription('Set punishment for raid actors')
        .addStringOption((opt) =>
          opt
            .setName('action')
            .setDescription('Select punishment')
            .setRequired(true)
            .addChoices({ name: 'Kick', value: 'KICK' }, { name: 'Ban', value: 'BAN' })
        )
    ) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    if (!guild) return;
    const subcommand = interaction.options.getSubcommand();

    let config = await prisma.antiraidConfig.findUnique({
      where: { guildId: guild.id },
    });

    if (!config) {
      config = await prisma.antiraidConfig.create({
        data: { guildId: guild.id, enabled: false },
      });
    }

    if (subcommand === 'enable') {
      await prisma.antiraidConfig.update({
        where: { guildId: guild.id },
        data: { enabled: true },
      });
      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Anti-Raid Activated',
            'Yurei Anti-Raid flood detection is now **ACTIVE**.\nMass joins and young suspicious accounts will be automatically filtered.'
          ),
        ],
      });
      return;
    }

    if (subcommand === 'disable') {
      await prisma.antiraidConfig.update({
        where: { guildId: guild.id },
        data: { enabled: false },
      });
      await interaction.reply({
        embeds: [
          createErrorEmbed(
            'Anti-Raid Disabled',
            'Yurei Anti-Raid protection is now **DISABLED**.'
          ),
        ],
      });
      return;
    }

    if (subcommand === 'status') {
      const embed = createBaseEmbed()
        .setTitle('🛡️ Anti-Raid Configuration')
        .addFields(
          { name: 'Status', value: config.enabled ? '🟢 **ENABLED**' : '🔴 **DISABLED**', inline: true },
          { name: 'Join Threshold', value: `${config.joinThreshold} joins / ${config.joinWindowSec}s`, inline: true },
          { name: 'Min Account Age', value: `${config.minAccountAgeDays} days`, inline: true },
          { name: 'Enforcement Action', value: `\`${config.punishment}\``, inline: true }
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (subcommand === 'threshold') {
      const joins = interaction.options.getInteger('joins', true);
      await prisma.antiraidConfig.update({
        where: { guildId: guild.id },
        data: { joinThreshold: joins },
      });
      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Threshold Updated',
            `Join threshold set to **${joins} joins** per ${config.joinWindowSec} seconds.`
          ),
        ],
      });
      return;
    }

    if (subcommand === 'accountage') {
      const days = interaction.options.getInteger('days', true);
      await prisma.antiraidConfig.update({
        where: { guildId: guild.id },
        data: { minAccountAgeDays: days },
      });
      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Account Age Filter Updated',
            `Accounts younger than **${days} days** will now be restricted upon joining.`
          ),
        ],
      });
      return;
    }

    if (subcommand === 'punishment') {
      const action = interaction.options.getString('action', true);
      await prisma.antiraidConfig.update({
        where: { guildId: guild.id },
        data: { punishment: action },
      });
      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Punishment Updated',
            `Raid punishment action updated to: **${action}**.`
          ),
        ],
      });
      return;
    }
  },
};
