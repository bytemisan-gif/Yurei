import {
  SlashCommandBuilder,
  PermissionsBitField,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { prisma } from '@misan/database';
import { PremiumService } from '@misan/premium';
import { createSuccessEmbed, createErrorEmbed, createBaseEmbed, createPremiumUpgradeEmbed } from '@misan/utils';

export const AutoresponderCommand: ZenithCommand = {
  name: 'autoresponder',
  description: 'Manage automated message response triggers',
  category: 'AutoResponder',
  userPermissions: [PermissionsBitField.Flags.ManageGuild],
  botPermissions: [PermissionsBitField.Flags.SendMessages],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('autoresponder')
    .setDescription('Manage automated triggers')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Create a new trigger and response')
        .addStringOption((opt) => opt.setName('trigger').setDescription('Trigger keyword/phrase').setRequired(true))
        .addStringOption((opt) => opt.setName('response').setDescription('Bot reply').setRequired(true))
        .addStringOption((opt) =>
          opt
            .setName('match')
            .setDescription('Matching rule')
            .addChoices(
              { name: 'Exact Match', value: 'EXACT' },
              { name: 'Contains Anywhere', value: 'CONTAINS' }
            )
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('delete')
        .setDescription('Delete an existing autoresponder')
        .addStringOption((opt) => opt.setName('trigger').setDescription('Trigger to remove').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName('list').setDescription('List all configured autoresponders')
    ) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    if (!guild) return;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      const trigger = interaction.options.getString('trigger', true).trim();
      const response = interaction.options.getString('response', true);
      const matchType = interaction.options.getString('match') || 'EXACT';

      const currentCount = await prisma.autoResponder.count({ where: { guildId: guild.id } });
      const limits = await PremiumService.getLimits(guild.id);

      if (currentCount >= limits.autoresponders) {
        await interaction.reply({
          embeds: [
            createPremiumUpgradeEmbed(
              `You have reached the limit of **${limits.autoresponders}** autoresponders on your current plan.`,
              'autoresponders.limit'
            ),
          ],
          ephemeral: true,
        });
        return;
      }

      await prisma.autoResponder.create({
        data: {
          guildId: guild.id,
          trigger,
          response,
          matchType,
        },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'AutoResponder Created',
            `Trigger: \`${trigger}\`\nResponse: >>> ${response}`
          ),
        ],
      });
      return;
    }

    if (subcommand === 'delete') {
      const trigger = interaction.options.getString('trigger', true);
      const deleted = await prisma.autoResponder.deleteMany({
        where: { guildId: guild.id, trigger },
      });

      if (deleted.count === 0) {
        await interaction.reply({
          embeds: [createErrorEmbed('Not Found', 'No autoresponder found matching that trigger.')],
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({
        embeds: [createSuccessEmbed('Deleted', `Removed autoresponder for \`${trigger}\`.`)],
      });
      return;
    }

    if (subcommand === 'list') {
      const items = await prisma.autoResponder.findMany({
        where: { guildId: guild.id },
      });

      const embed = createBaseEmbed()
        .setTitle('🤖 Server AutoResponders')
        .setDescription(
          items.length === 0
            ? 'No autoresponders configured yet.'
            : items.map((r, i) => `**${i + 1}.** \`${r.trigger}\` [${r.matchType}] ➔ ${r.response}`).join('\n')
        );

      await interaction.reply({ embeds: [embed] });
      return;
    }
  },
};
