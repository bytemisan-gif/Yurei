import {
  SlashCommandBuilder,
  PermissionsBitField,
  Role,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { PermissionManager } from '@misan/permissions';
import { createSuccessEmbed, createErrorEmbed } from '@misan/utils';

export const RoleCommand: MisanCommand = {
  name: 'role',
  description: 'Manage guild roles and member assignments',
  category: 'Roles',
  userPermissions: [PermissionsBitField.Flags.ManageRoles],
  botPermissions: [PermissionsBitField.Flags.ManageRoles],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Manage guild roles')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Assign a role to a member')
        .addUserOption((opt) => opt.setName('user').setDescription('Target member').setRequired(true))
        .addRoleOption((opt) => opt.setName('role').setDescription('Role to assign').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove a role from a member')
        .addUserOption((opt) => opt.setName('user').setDescription('Target member').setRequired(true))
        .addRoleOption((opt) => opt.setName('role').setDescription('Role to remove').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('create')
        .setDescription('Create a new server role')
        .addStringOption((opt) => opt.setName('name').setDescription('Role name').setRequired(true))
        .addStringOption((opt) => opt.setName('color').setDescription('Hex color (e.g. #FF0000)'))
    )
    .addSubcommand((sub) =>
      sub
        .setName('delete')
        .setDescription('Delete a server role')
        .addRoleOption((opt) => opt.setName('role').setDescription('Role to delete').setRequired(true))
    ) as SlashCommandBuilder,

  async execute({ interaction, guild, member }) {
    if (!guild || !member) return;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      const targetUser = interaction.options.getUser('user', true);
      const targetRole = interaction.options.getRole('role', true) as Role;

      const roleCheck = PermissionManager.checkRoleHierarchy(member, targetRole);
      if (roleCheck) {
        await interaction.reply({ embeds: [createErrorEmbed('Permission Denied', roleCheck)], ephemeral: true });
        return;
      }

      const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
      if (!targetMember) {
        await interaction.reply({ embeds: [createErrorEmbed('User Not Found', 'Target member is not in this server.')], ephemeral: true });
        return;
      }

      await targetMember.roles.add(targetRole, `Assigned by ${interaction.user.tag}`);
      await interaction.reply({
        embeds: [createSuccessEmbed('Role Assigned', `Successfully assigned <@&${targetRole.id}> to **${targetMember.user.tag}**.`)],
      });
      return;
    }

    if (subcommand === 'remove') {
      const targetUser = interaction.options.getUser('user', true);
      const targetRole = interaction.options.getRole('role', true) as Role;

      const roleCheck = PermissionManager.checkRoleHierarchy(member, targetRole);
      if (roleCheck) {
        await interaction.reply({ embeds: [createErrorEmbed('Permission Denied', roleCheck)], ephemeral: true });
        return;
      }

      const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
      if (!targetMember) {
        await interaction.reply({ embeds: [createErrorEmbed('User Not Found', 'Target member is not in this server.')], ephemeral: true });
        return;
      }

      await targetMember.roles.remove(targetRole, `Removed by ${interaction.user.tag}`);
      await interaction.reply({
        embeds: [createSuccessEmbed('Role Removed', `Successfully removed <@&${targetRole.id}> from **${targetMember.user.tag}**.`)],
      });
      return;
    }

    if (subcommand === 'create') {
      const name = interaction.options.getString('name', true);
      const colorHex = interaction.options.getString('color') || '#99AAB5';

      const newRole = await guild.roles.create({
        name,
        color: colorHex as any,
        reason: `Created by ${interaction.user.tag}`,
      });

      await interaction.reply({
        embeds: [createSuccessEmbed('Role Created', `Created role <@&${newRole.id}> with color \`${colorHex}\`.`)],
      });
      return;
    }

    if (subcommand === 'delete') {
      const targetRole = interaction.options.getRole('role', true) as Role;

      const roleCheck = PermissionManager.checkRoleHierarchy(member, targetRole);
      if (roleCheck) {
        await interaction.reply({ embeds: [createErrorEmbed('Permission Denied', roleCheck)], ephemeral: true });
        return;
      }

      const roleName = targetRole.name;
      await targetRole.delete(`Deleted by ${interaction.user.tag}`);
      await interaction.reply({
        embeds: [createSuccessEmbed('Role Deleted', `Deleted role **@${roleName}**.`)],
      });
      return;
    }
  },
};
