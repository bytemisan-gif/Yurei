import {
  SlashCommandBuilder,
  PermissionsBitField,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { prisma } from '@misan/database';
import { PremiumService } from '@misan/premium';
import { createSuccessEmbed, createErrorEmbed, createBaseEmbed, createPremiumUpgradeEmbed } from '@misan/utils';

export const CustomcommandCommand: ZenithCommand = {
  name: 'customcommand',
  description: 'Create and manage custom server tags and slash subcommands',
  category: 'AutoResponder',
  userPermissions: [PermissionsBitField.Flags.ManageGuild],
  botPermissions: [PermissionsBitField.Flags.SendMessages],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('customcommand')
    .setDescription('Manage custom server commands')
    .addSubcommand((sub) =>
      sub
        .setName('create')
        .setDescription('Create a custom command')
        .addStringOption((opt) => opt.setName('name').setDescription('Command name').setRequired(true))
        .addStringOption((opt) => opt.setName('response').setDescription('Response message').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('delete')
        .setDescription('Delete a custom command')
        .addStringOption((opt) => opt.setName('name').setDescription('Command name to delete').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName('list').setDescription('List all custom commands in this server')
    ) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    if (!guild) return;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
      const name = interaction.options.getString('name', true).toLowerCase().trim();
      const response = interaction.options.getString('response', true);

      const currentCount = await prisma.customCommand.count({ where: { guildId: guild.id } });
      const limits = await PremiumService.getLimits(guild.id);

      if (currentCount >= limits.customCommands) {
        await interaction.reply({
          embeds: [
            createPremiumUpgradeEmbed(
              `You have reached the limit of **${limits.customCommands}** custom commands on your current plan.`,
              'customcommands.limit'
            ),
          ],
          ephemeral: true,
        });
        return;
      }

      await prisma.customCommand.upsert({
        where: { guildId_name: { guildId: guild.id, name } },
        create: { guildId: guild.id, name, response },
        update: { response },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Custom Command Created',
            `Custom command \`/${name}\` has been created.\n**Response:** >>> ${response}`
          ),
        ],
      });
      return;
    }

    if (subcommand === 'delete') {
      const name = interaction.options.getString('name', true).toLowerCase().trim();
      const deleted = await prisma.customCommand.deleteMany({
        where: { guildId: guild.id, name },
      });

      if (deleted.count === 0) {
        await interaction.reply({
          embeds: [createErrorEmbed('Not Found', 'No custom command found with that name.')],
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({
        embeds: [createSuccessEmbed('Deleted', `Removed custom command \`/${name}\`.`)],
      });
      return;
    }

    if (subcommand === 'list') {
      const commands = await prisma.customCommand.findMany({
        where: { guildId: guild.id },
      });

      const embed = createBaseEmbed()
        .setTitle('⚡ Custom Commands')
        .setDescription(
          commands.length === 0
            ? 'No custom commands created yet.'
            : commands.map((c) => `• \`/${c.name}\` ➔ ${c.response}`).join('\n')
        );

      await interaction.reply({ embeds: [embed] });
      return;
    }
  },
};
