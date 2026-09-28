import {
  SlashCommandBuilder,
  PermissionsBitField,
  ChannelType,
  TextChannel,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { prisma } from '@misan/database';
import { createSuccessEmbed, createErrorEmbed, createBaseEmbed } from '@misan/utils';

export const AntinukeCommand: MisanCommand = {
  name: 'antinuke',
  description: 'Manage real-time anti-nuke defense engine, thresholds, lockdown, and whitelists',
  category: 'Security',
  userPermissions: [PermissionsBitField.Flags.Administrator],
  botPermissions: [
    PermissionsBitField.Flags.Administrator,
    PermissionsBitField.Flags.ManageRoles,
    PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.BanMembers,
    PermissionsBitField.Flags.KickMembers,
  ],
  cooldown: 5,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('antinuke')
    .setDescription('Autonomous anti-nuke defense engine')
    .addSubcommand((sub) =>
      sub.setName('enable').setDescription('Activate anti-nuke protection')
    )
    .addSubcommand((sub) =>
      sub.setName('disable').setDescription('Deactivate anti-nuke protection')
    )
    .addSubcommand((sub) =>
      sub.setName('status').setDescription('Inspect current antinuke status and active thresholds')
    )
    .addSubcommand((sub) =>
      sub
        .setName('punishment')
        .setDescription('Set enforcement action when an actor triggers antinuke')
        .addStringOption((opt) =>
          opt
            .setName('action')
            .setDescription('Punishment type')
            .setRequired(true)
            .addChoices(
              { name: 'Strip Dangerous Roles (Recommended)', value: 'STRIP_ROLES' },
              { name: 'Ban Actor', value: 'BAN' },
              { name: 'Kick Actor', value: 'KICK' }
            )
        )
    )
    .addSubcommand((sub) =>
      sub.setName('lockdown').setDescription('Initiate server-wide emergency channel lockdown')
    )
    .addSubcommand((sub) =>
      sub.setName('unlock').setDescription('Lift server-wide emergency channel lockdown')
    )
    .addSubcommand((sub) =>
      sub
        .setName('whitelist')
        .setDescription('Add a user or role to the antinuke trusted whitelist')
        .addUserOption((opt) =>
          opt.setName('user').setDescription('User to whitelist')
        )
        .addRoleOption((opt) =>
          opt.setName('role').setDescription('Role to whitelist')
        )
    )
    .addSubcommand((sub) =>
      sub.setName('whitelists').setDescription('Display all whitelisted actors')
    )
    .addSubcommand((sub) =>
      sub.setName('incidents').setDescription('View recent security audit incidents')
    ) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    if (!guild) return;

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'enable': {
        await prisma.antinukeConfig.upsert({
          where: { guildId: guild.id },
          create: { guildId: guild.id, enabled: true },
          update: { enabled: true },
        });

        await interaction.reply({
          embeds: [
            createSuccessEmbed(
              '🛡️ Anti-Nuke Engine Activated',
              'Yurei Anti-Nuke defense engine is now **ONLINE**.\nAudit logs are monitored in real time with sub-second containment against rogue administrators.'
            ),
          ],
        });
        break;
      }

      case 'disable': {
        await prisma.antinukeConfig.upsert({
          where: { guildId: guild.id },
          create: { guildId: guild.id, enabled: false },
          update: { enabled: false },
        });

        await interaction.reply({
          embeds: [
            createErrorEmbed(
              '⚠️ Anti-Nuke Engine Deactivated',
              'Yurei Anti-Nuke defense is now **OFFLINE**.\nYour server is vulnerable to rogue administrators.'
            ),
          ],
        });
        break;
      }

      case 'status': {
        const settings = await prisma.antinukeConfig.findUnique({
          where: { guildId: guild.id },
        });

        const isEnabled = settings?.enabled ?? false;
        const punishment = settings?.punishment ?? 'STRIP_ROLES';

        const embed = createBaseEmbed()
          .setTitle('🛡️ Yurei Anti-Nuke Configuration')
          .setDescription('Real-time audit log stream analysis and rogue actor suppression.')
          .addFields(
            {
              name: 'Engine Status',
              value: isEnabled ? '🟢 **ACTIVE**' : '🔴 **DISABLED**',
              inline: true,
            },
            {
              name: 'Default Punishment',
              value: `\`${punishment}\``,
              inline: true,
            },
            {
              name: 'Protected Vectors',
              value:
                '• Channel Deletion / Creation\n• Role Deletion / Creation\n• Mass Member Bans\n• Mass Member Kicks\n• Webhook Creation\n• Bot Additions',
              inline: false,
            }
          );

        await interaction.reply({ embeds: [embed] });
        break;
      }

      case 'punishment': {
        const action = interaction.options.getString('action', true);

        await prisma.antinukeConfig.upsert({
          where: { guildId: guild.id },
          create: { guildId: guild.id, punishment: action },
          update: { punishment: action },
        });

        await interaction.reply({
          embeds: [
            createSuccessEmbed(
              'Punishment Updated',
              `Triggered actors will now receive: **${action}**.`
            ),
          ],
        });
        break;
      }

      case 'lockdown': {
        await interaction.deferReply();

        let lockedCount = 0;
        const textChannels = guild.channels.cache.filter(
          (c) => c.type === ChannelType.GuildText
        ) as Map<string, TextChannel>;

        for (const [, channel] of textChannels) {
          try {
            await channel.permissionOverwrites.edit(guild.roles.everyone, {
              SendMessages: false,
              AddReactions: false,
            });
            lockedCount++;
          } catch {}
        }

        await interaction.editReply({
          embeds: [
            createSuccessEmbed(
              '🚨 Emergency Server Lockdown Activated',
              `Locked **${lockedCount}** channels. Regular members cannot send messages.`
            ),
          ],
        });
        break;
      }

      case 'unlock': {
        await interaction.deferReply();

        let unlockedCount = 0;
        const textChannels = guild.channels.cache.filter(
          (c) => c.type === ChannelType.GuildText
        ) as Map<string, TextChannel>;

        for (const [, channel] of textChannels) {
          try {
            await channel.permissionOverwrites.edit(guild.roles.everyone, {
              SendMessages: null,
            });
            unlockedCount++;
          } catch {}
        }

        await interaction.editReply({
          embeds: [
            createSuccessEmbed(
              '🔓 Server Lockdown Lifted',
              `Unlocked **${unlockedCount}** channels. Normal chat operations restored.`
            ),
          ],
        });
        break;
      }

      case 'whitelist': {
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');

        if (!user && !role) {
          await interaction.reply({
            embeds: [
              createErrorEmbed('Target Required', 'Please specify a user or role to whitelist.'),
            ],
            ephemeral: true,
          });
          return;
        }

        if (user) {
          await prisma.whitelistEntry.upsert({
            where: {
              guildId_targetId_whitelistType: {
                guildId: guild.id,
                targetId: user.id,
                whitelistType: 'ANTINUKE',
              },
            },
            create: {
              guildId: guild.id,
              targetId: user.id,
              targetType: user.bot ? 'BOT' : 'USER',
              whitelistType: 'ANTINUKE',
            },
            update: {},
          });
        }

        if (role) {
          await prisma.whitelistEntry.upsert({
            where: {
              guildId_targetId_whitelistType: {
                guildId: guild.id,
                targetId: role.id,
                whitelistType: 'ANTINUKE',
              },
            },
            create: {
              guildId: guild.id,
              targetId: role.id,
              targetType: 'ROLE',
              whitelistType: 'ANTINUKE',
            },
            update: {},
          });
        }

        await interaction.reply({
          embeds: [
            createSuccessEmbed(
              'Whitelist Updated',
              `Added **${user?.tag || role?.name}** to the Anti-Nuke bypass list.`
            ),
          ],
        });
        break;
      }

      case 'whitelists': {
        const entries = await prisma.whitelistEntry.findMany({
          where: { guildId: guild.id, whitelistType: { in: ['ANTINUKE', 'ALL'] } },
        });

        if (entries.length === 0) {
          await interaction.reply({
            embeds: [
              createBaseEmbed()
                .setTitle('🛡️ Anti-Nuke Whitelist')
                .setDescription('No users or roles currently whitelisted. Server owner is exempt by default.'),
            ],
          });
          return;
        }

        const lines = entries.map(
          (e, idx) => `${idx + 1}. **${e.targetType}**: <@${e.targetType === 'ROLE' ? '&' : ''}${e.targetId}>`
        );

        await interaction.reply({
          embeds: [
            createBaseEmbed()
              .setTitle('🛡️ Anti-Nuke Whitelist')
              .setDescription(lines.join('\n')),
          ],
        });
        break;
      }

      case 'incidents': {
        const logs = await prisma.moderationCase.findMany({
          where: { guildId: guild.id, action: { in: ['BAN', 'KICK'] }, reason: { contains: 'Antinuke' } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });

        if (logs.length === 0) {
          await interaction.reply({
            embeds: [
              createSuccessEmbed(
                '🛡️ Security Incident Log',
                'No unauthorized breach attempts or antinuke triggers recorded.'
              ),
            ],
          });
          return;
        }

        const embed = createBaseEmbed()
          .setTitle('🛡️ Recent Anti-Nuke Incidents')
          .setDescription(
            logs
              .map((l) => `• Case #${l.caseNumber} - Action: **${l.action}**\n  Reason: ${l.reason}`)
              .join('\n')
          );

        await interaction.reply({ embeds: [embed] });
        break;
      }
    }
  },
};
