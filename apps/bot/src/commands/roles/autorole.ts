import {
  SlashCommandBuilder,
  PermissionsBitField,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { prisma } from '@misan/database';
import { createSuccessEmbed, createErrorEmbed, createBaseEmbed } from '@misan/utils';

export const AutoroleCommand: ZenithCommand = {
  name: 'autorole',
  description: 'Automatically assign roles to new members upon joining',
  category: 'Roles',
  userPermissions: [PermissionsBitField.Flags.ManageRoles],
  botPermissions: [PermissionsBitField.Flags.ManageRoles],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Configure automatic join roles')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add a role to be automatically assigned')
        .addRoleOption((opt) => opt.setName('role').setDescription('Role to assign').setRequired(true))
        .addStringOption((opt) =>
          opt
            .setName('target')
            .setDescription('Target recipients')
            .addChoices(
              { name: 'Humans Only', value: 'HUMAN' },
              { name: 'Bots Only', value: 'BOT' },
              { name: 'Everyone', value: 'ALL' }
            )
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove a role from the autorole configuration')
        .addRoleOption((opt) => opt.setName('role').setDescription('Role to remove').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName('list').setDescription('List all currently active autoroles')
    ) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    if (!guild) return;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      const role = interaction.options.getRole('role', true);
      const target = interaction.options.getString('target') || 'HUMAN';

      await prisma.autoRole.upsert({
        where: {
          guildId_roleId: { guildId: guild.id, roleId: role.id },
        },
        create: {
          guildId: guild.id,
          roleId: role.id,
          target,
        },
        update: { target },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'AutoRole Added',
            `New ${target.toLowerCase()}s joining the server will automatically receive <@&${role.id}>.`
          ),
        ],
      });
      return;
    }

    if (subcommand === 'remove') {
      const role = interaction.options.getRole('role', true);
      await prisma.autoRole.deleteMany({
        where: { guildId: guild.id, roleId: role.id },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed('AutoRole Removed', `Removed <@&${role.id}> from autoroles.`),
        ],
      });
      return;
    }

    if (subcommand === 'list') {
      const roles = await prisma.autoRole.findMany({
        where: { guildId: guild.id },
      });

      const embed = createBaseEmbed()
        .setTitle('🎭 Active AutoRoles')
        .setDescription(
          roles.length === 0
            ? 'No autoroles configured.'
            : roles.map((r) => `• <@&${r.roleId}> (\`${r.target}\`)`).join('\n')
        );

      await interaction.reply({ embeds: [embed] });
      return;
    }
  },
};
