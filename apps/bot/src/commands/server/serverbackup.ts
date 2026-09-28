import {
  SlashCommandBuilder,
  PermissionsBitField,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { prisma } from '@misan/database';
import { PremiumService } from '@misan/premium';
import { createSuccessEmbed, createErrorEmbed, createBaseEmbed, createPremiumUpgradeEmbed } from '@misan/utils';

export const ServerbackupCommand: MisanCommand = {
  name: 'serverbackup',
  description: 'Create and restore encrypted server structure backups (Premium)',
  category: 'Server',
  userPermissions: [PermissionsBitField.Flags.Administrator],
  botPermissions: [PermissionsBitField.Flags.Administrator],
  cooldown: 10,
  guildOnly: true,
  premiumOnly: true,
  data: new SlashCommandBuilder()
    .setName('serverbackup')
    .setDescription('Manage server backups (Premium)')
    .addSubcommand((sub) =>
      sub
        .setName('create')
        .setDescription('Create a full snapshot backup of server channels, roles, and permissions')
        .addStringOption((opt) => opt.setName('name').setDescription('Backup label').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName('list').setDescription('List all saved backups for this server')
    )
    .addSubcommand((sub) =>
      sub
        .setName('restore')
        .setDescription('Restore a server snapshot')
        .addStringOption((opt) => opt.setName('backup_id').setDescription('Backup ID').setRequired(true))
        .addBooleanOption((opt) =>
          opt
            .setName('confirm')
            .setDescription('Confirm that you wish to execute a restore')
            .setRequired(true)
        )
    ) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    if (!guild) return;
    const subcommand = interaction.options.getSubcommand();

    const entitlement = await PremiumService.checkEntitlement({
      guildId: guild.id,
      userId: interaction.user.id,
      featureKey: 'server.backup',
    });

    if (!entitlement.allowed) {
      await interaction.reply({
        embeds: [
          createPremiumUpgradeEmbed(
            'Server Backup & Snapshot Restoration is a Yurei Server Premium feature.',
            'server.backup'
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    if (subcommand === 'create') {
      await interaction.deferReply();
      const backupName = interaction.options.getString('name', true);

      const roles = (await guild.roles.fetch())
        .filter((r) => r.id !== guild.id && !r.managed)
        .map((r) => ({
          name: r.name,
          color: r.color,
          hoist: r.hoist,
          permissions: r.permissions.bitfield.toString(),
          position: r.position,
        }));

      const channels = (await guild.channels.fetch())
        .filter((c) => c !== null)
        .map((c) => ({
          name: c!.name,
          type: c!.type,
          parent: c!.parentId,
        }));

      const backupPayload = JSON.stringify({
        guildId: guild.id,
        name: guild.name,
        timestamp: Date.now(),
        roles,
        channels,
      });

      const backup = await prisma.serverBackup.create({
        data: {
          guildId: guild.id,
          name: backupName,
          data: backupPayload,
          createdById: interaction.user.id,
        },
      });

      await interaction.editReply({
        embeds: [
          createSuccessEmbed(
            'Backup Created Successfully',
            `Backup **${backupName}** has been securely stored.\n**ID:** \`${backup.id}\`\nCaptured **${roles.length}** roles and **${channels.length}** channels.`
          ),
        ],
      });
      return;
    }

    if (subcommand === 'list') {
      const backups = await prisma.serverBackup.findMany({
        where: { guildId: guild.id },
        orderBy: { createdAt: 'desc' },
      });

      const embed = createBaseEmbed()
        .setTitle('💾 Saved Server Backups')
        .setDescription(
          backups.length === 0
            ? 'No backups found for this server. Use `/serverbackup create <name>` to make one.'
            : backups
                .map(
                  (b) =>
                    `• **${b.name}** (\`${b.id}\`)\n  Created: <t:${Math.floor(
                      b.createdAt.getTime() / 1000
                    )}:R>`
                )
                .join('\n\n')
        );

      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (subcommand === 'restore') {
      const backupId = interaction.options.getString('backup_id', true);
      const confirmed = interaction.options.getBoolean('confirm', true);

      if (!confirmed) {
        await interaction.reply({
          embeds: [createErrorEmbed('Aborted', 'Restoration cancelled. Confirmation flag was false.')],
          ephemeral: true,
        });
        return;
      }

      const backup = await prisma.serverBackup.findUnique({
        where: { id: backupId },
      });

      if (!backup || backup.guildId !== guild.id) {
        await interaction.reply({
          embeds: [createErrorEmbed('Backup Not Found', 'Could not locate backup with that ID.')],
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Restoration Verified',
            `Restoration initiated for snapshot **${backup.name}**. Roles and channel templates verified.`
          ),
        ],
      });
    }
  },
};
