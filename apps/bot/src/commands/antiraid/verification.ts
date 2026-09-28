import {
  SlashCommandBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { prisma } from '@misan/database';
import { createSuccessEmbed, createErrorEmbed } from '@misan/utils';

export const VerificationCommand: ZenithCommand = {
  name: 'verification',
  description: 'Setup or manage member gate verification',
  category: 'Security',
  userPermissions: [PermissionsBitField.Flags.Administrator],
  botPermissions: [PermissionsBitField.Flags.ManageRoles],
  cooldown: 5,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('verification')
    .setDescription('Setup or manage member verification gate')
    .addSubcommand((sub) =>
      sub
        .setName('setup')
        .setDescription('Configure verification role and deploy verification button')
        .addRoleOption((opt) =>
          opt.setName('role').setDescription('Role to grant upon verification').setRequired(true)
        )
        .addChannelOption((opt) =>
          opt
            .setName('channel')
            .setDescription('Channel to deploy the verification prompt')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName('disable').setDescription('Disable verification gate')
    ) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    if (!guild) return;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'setup') {
      const role = interaction.options.getRole('role', true);
      const channel = interaction.options.getChannel('channel', true) as any;

      if (!channel.isTextBased()) {
        await interaction.reply({
          embeds: [createErrorEmbed('Invalid Channel', 'Please select a text-based channel.')],
          ephemeral: true,
        });
        return;
      }

      await prisma.verificationConfig.upsert({
        where: { guildId: guild.id },
        create: {
          guildId: guild.id,
          enabled: true,
          channelId: channel.id,
          roleId: role.id,
        },
        update: {
          enabled: true,
          channelId: channel.id,
          roleId: role.id,
        },
      });

      // Deploy verification embed with button in the target channel
      const verifyBtn = new ButtonBuilder()
        .setCustomId('zenith_btn_verify')
        .setLabel('Verify Membership')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🛡️');

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(verifyBtn);

      await channel.send({
        embeds: [
          createSuccessEmbed(
            'Server Verification Required',
            `Welcome to **${guild.name}**!\nClick the button below to verify your account and unlock access to the rest of the server.`
          ),
        ],
        components: [row],
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Verification Configured',
            `Verification panel posted in ${channel}. Members clicking the button will receive <@&${role.id}>.`
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    if (subcommand === 'disable') {
      await prisma.verificationConfig.updateMany({
        where: { guildId: guild.id },
        data: { enabled: false },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed('Verification Disabled', 'Verification gate has been turned off.'),
        ],
      });
      return;
    }
  },
};
