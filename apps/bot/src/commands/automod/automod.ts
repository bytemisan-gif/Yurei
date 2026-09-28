import {
  SlashCommandBuilder,
  PermissionsBitField,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { prisma } from '@misan/database';
import { createSuccessEmbed, createErrorEmbed, createBaseEmbed } from '@misan/utils';

export const AutomodCommand: ZenithCommand = {
  name: 'automod',
  description: 'Manage and configure automated message filtration rules',
  category: 'AutoMod',
  userPermissions: [PermissionsBitField.Flags.Administrator],
  botPermissions: [PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ModerateMembers],
  cooldown: 5,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Configure automated moderation rules')
    .addSubcommand((sub) =>
      sub.setName('status').setDescription('View current automod status and active filters')
    )
    .addSubcommand((sub) =>
      sub
        .setName('invites')
        .setDescription('Toggle Discord invite link detection')
        .addBooleanOption((opt) =>
          opt.setName('enabled').setDescription('Enable or disable').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('links')
        .setDescription('Toggle external URL link detection')
        .addBooleanOption((opt) =>
          opt.setName('enabled').setDescription('Enable or disable').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('spam')
        .setDescription('Toggle fast message spam detection')
        .addBooleanOption((opt) =>
          opt.setName('enabled').setDescription('Enable or disable').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('mentions')
        .setDescription('Configure max allowed mentions before action')
        .addIntegerOption((opt) =>
          opt
            .setName('limit')
            .setDescription('Max mentions allowed (e.g. 5)')
            .setRequired(true)
            .setMinValue(2)
            .setMaxValue(20)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('caps')
        .setDescription('Configure max percentage of capital letters allowed')
        .addIntegerOption((opt) =>
          opt
            .setName('percentage')
            .setDescription('Max caps percent (e.g. 70)')
            .setRequired(true)
            .setMinValue(50)
            .setMaxValue(100)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('badwords')
        .setDescription('Add a prohibited keyword to the filter list')
        .addStringOption((opt) =>
          opt.setName('word').setDescription('Word or phrase to block').setRequired(true)
        )
    ) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    if (!guild) return;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'status') {
      const rules = await prisma.automodRule.findMany({
        where: { guildId: guild.id },
      });

      const embed = createBaseEmbed()
        .setTitle('🤖 Yurei AutoMod Suite')
        .setDescription(`Current AutoMod filters active in **${guild.name}**`)
        .addFields(
          {
            name: 'Discord Invites',
            value: rules.some((r) => r.ruleType === 'INVITES' && r.enabled) ? '🟢 Enabled' : '🔴 Disabled',
            inline: true,
          },
          {
            name: 'External Links',
            value: rules.some((r) => r.ruleType === 'LINKS' && r.enabled) ? '🟢 Enabled' : '🔴 Disabled',
            inline: true,
          },
          {
            name: 'Spam Detection',
            value: rules.some((r) => r.ruleType === 'SPAM' && r.enabled) ? '🟢 Enabled' : '🔴 Disabled',
            inline: true,
          },
          {
            name: 'Mention Spam Gate',
            value: `${rules.find((r) => r.ruleType === 'MENTIONS')?.maxMentions ?? 5} mentions`,
            inline: true,
          },
          {
            name: 'Caps Filter',
            value: `${rules.find((r) => r.ruleType === 'CAPS')?.maxCapsPercent ?? 70}%`,
            inline: true,
          },
          {
            name: 'Blacklisted Keywords',
            value: `${rules.find((r) => r.ruleType === 'WORDS')?.customPatterns.length ?? 0} words`,
            inline: true,
          }
        );

      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (subcommand === 'invites' || subcommand === 'links' || subcommand === 'spam') {
      const enabled = interaction.options.getBoolean('enabled', true);
      const ruleType = subcommand.toUpperCase();

      await prisma.automodRule.upsert({
        where: { id: `${guild.id}-${ruleType}` },
        create: {
          id: `${guild.id}-${ruleType}`,
          guildId: guild.id,
          ruleType,
          enabled,
        },
        update: { enabled },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'AutoMod Rule Updated',
            `Filter **${ruleType}** is now **${enabled ? 'ENABLED' : 'DISABLED'}**.`
          ),
        ],
      });
      return;
    }

    if (subcommand === 'mentions') {
      const limit = interaction.options.getInteger('limit', true);
      await prisma.automodRule.upsert({
        where: { id: `${guild.id}-MENTIONS` },
        create: {
          id: `${guild.id}-MENTIONS`,
          guildId: guild.id,
          ruleType: 'MENTIONS',
          enabled: true,
          maxMentions: limit,
        },
        update: { maxMentions: limit, enabled: true },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Mention Limit Configured',
            `Messages containing more than **${limit} mentions** will be automatically removed.`
          ),
        ],
      });
      return;
    }

    if (subcommand === 'caps') {
      const percentage = interaction.options.getInteger('percentage', true);
      await prisma.automodRule.upsert({
        where: { id: `${guild.id}-CAPS` },
        create: {
          id: `${guild.id}-CAPS`,
          guildId: guild.id,
          ruleType: 'CAPS',
          enabled: true,
          maxCapsPercent: percentage,
        },
        update: { maxCapsPercent: percentage, enabled: true },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Caps Lock Filter Configured',
            `Messages exceeding **${percentage}% capital letters** will be automatically removed.`
          ),
        ],
      });
      return;
    }

    if (subcommand === 'badwords') {
      const word = interaction.options.getString('word', true).toLowerCase();
      const existing = await prisma.automodRule.findFirst({
        where: { guildId: guild.id, ruleType: 'WORDS' },
      });

      const patterns = existing ? Array.from(new Set([...existing.customPatterns, word])) : [word];

      await prisma.automodRule.upsert({
        where: { id: `${guild.id}-WORDS` },
        create: {
          id: `${guild.id}-WORDS`,
          guildId: guild.id,
          ruleType: 'WORDS',
          enabled: true,
          customPatterns: patterns,
        },
        update: { customPatterns: patterns, enabled: true },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Keyword Filter Added',
            `Added \`${word}\` to the server blacklisted keywords list.`
          ),
        ],
      });
      return;
    }
  },
};
