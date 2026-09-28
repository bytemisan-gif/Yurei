import {
  SlashCommandBuilder,
  PermissionsBitField,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { prisma } from '@misan/database';
import { createSuccessEmbed, createErrorEmbed } from '@misan/utils';

export const WelcomeCommand: MisanCommand = {
  name: 'welcome',
  description: 'Configure automated welcome greetings for new members',
  category: 'Welcomer',
  userPermissions: [PermissionsBitField.Flags.ManageGuild],
  botPermissions: [PermissionsBitField.Flags.SendMessages],
  cooldown: 5,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configure automated welcome messages')
    .addSubcommand((sub) =>
      sub
        .setName('channel')
        .setDescription('Set welcome message destination channel')
        .addChannelOption((opt) => opt.setName('channel').setDescription('Channel').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('message')
        .setDescription('Customize the greeting message text')
        .addStringOption((opt) =>
          opt
            .setName('text')
            .setDescription('Message format (Use {user}, {server}, {count})')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName('enable').setDescription('Enable automated welcome greetings')
    )
    .addSubcommand((sub) =>
      sub.setName('disable').setDescription('Disable automated welcome greetings')
    )
    .addSubcommand((sub) =>
      sub.setName('preview').setDescription('Send a test preview of your welcome greeting')
    ) as SlashCommandBuilder,

  async execute({ interaction, guild, channel }) {
    if (!guild) return;
    const subcommand = interaction.options.getSubcommand();

    let config = await prisma.welcomeConfig.findUnique({
      where: { guildId: guild.id },
    });

    if (!config) {
      config = await prisma.welcomeConfig.create({
        data: { guildId: guild.id, enabled: false },
      });
    }

    if (subcommand === 'channel') {
      const targetChannel = interaction.options.getChannel('channel', true);
      await prisma.welcomeConfig.update({
        where: { guildId: guild.id },
        data: { channelId: targetChannel.id, enabled: true },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Welcome Channel Set',
            `Welcome messages will now be dispatched to ${targetChannel}.`
          ),
        ],
      });
      return;
    }

    if (subcommand === 'message') {
      const text = interaction.options.getString('text', true);
      await prisma.welcomeConfig.update({
        where: { guildId: guild.id },
        data: { message: text },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Greeting Text Updated',
            `Welcome template updated:\n>>> ${text}`
          ),
        ],
      });
      return;
    }

    if (subcommand === 'enable') {
      await prisma.welcomeConfig.update({
        where: { guildId: guild.id },
        data: { enabled: true },
      });
      await interaction.reply({
        embeds: [createSuccessEmbed('Welcomer Enabled', 'Welcome system is now active.')],
      });
      return;
    }

    if (subcommand === 'disable') {
      await prisma.welcomeConfig.update({
        where: { guildId: guild.id },
        data: { enabled: false },
      });
      await interaction.reply({
        embeds: [createErrorEmbed('Welcomer Disabled', 'Welcome system is now inactive.')],
      });
      return;
    }

    if (subcommand === 'preview') {
      const formatted = (config.message || 'Welcome {user} to {server}!')
        .replace(/{user}/g, `${interaction.user}`)
        .replace(/{server}/g, guild.name)
        .replace(/{count}/g, guild.memberCount.toString());

      await interaction.reply({
        content: `**Preview:**\n${formatted}`,
        ephemeral: true,
      });
      return;
    }
  },
};
