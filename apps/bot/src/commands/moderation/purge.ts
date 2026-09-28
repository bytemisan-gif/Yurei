import {
  SlashCommandBuilder,
  PermissionsBitField,
  TextChannel,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { createSuccessEmbed, createErrorEmbed } from '@misan/utils';

export const PurgeCommand: ZenithCommand = {
  name: 'purge',
  description: 'Bulk delete messages from the current channel',
  category: 'Moderation',
  userPermissions: [PermissionsBitField.Flags.ManageMessages],
  botPermissions: [PermissionsBitField.Flags.ManageMessages],
  cooldown: 5,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages')
    .addIntegerOption((opt) =>
      opt
        .setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addUserOption((opt) => opt.setName('user').setDescription('Filter by user'))
    .addBooleanOption((opt) => opt.setName('bots').setDescription('Delete only bot messages')) as SlashCommandBuilder,

  async execute({ interaction, channel }) {
    if (!channel || !channel.isTextBased() || !('bulkDelete' in channel)) {
      await interaction.reply({
        embeds: [createErrorEmbed('Invalid Channel', 'Messages cannot be purged in this channel type.')],
        ephemeral: true,
      });
      return;
    }

    const amount = interaction.options.getInteger('amount', true);
    const filterUser = interaction.options.getUser('user');
    const filterBots = interaction.options.getBoolean('bots');

    await interaction.deferReply({ ephemeral: true });

    const messages = await channel.messages.fetch({ limit: amount });
    let toDelete = messages;

    if (filterUser) {
      toDelete = toDelete.filter((m) => m.author.id === filterUser.id);
    }

    if (filterBots) {
      toDelete = toDelete.filter((m) => m.author.bot);
    }

    const deleted = await (channel as TextChannel).bulkDelete(toDelete, true);

    await interaction.editReply({
      embeds: [
        createSuccessEmbed(
          'Messages Purged',
          `Successfully deleted **${deleted.size}** message(s)${
            filterUser ? ` from ${filterUser.tag}` : ''
          }.${deleted.size < amount ? '\n*(Note: Messages older than 14 days cannot be bulk deleted due to Discord API limitations.)*' : ''}`
        ),
      ],
    });
  },
};

export const LockCommand: ZenithCommand = {
  name: 'lock',
  description: 'Lock down a channel to prevent regular members from sending messages',
  category: 'Moderation',
  userPermissions: [PermissionsBitField.Flags.ManageChannels],
  botPermissions: [PermissionsBitField.Flags.ManageChannels],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock down this channel')
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for locking')) as SlashCommandBuilder,

  async execute({ interaction, channel, guild }) {
    if (!channel || !('permissionOverwrites' in channel) || !guild) return;

    await (channel as TextChannel).permissionOverwrites.edit(guild.id, {
      SendMessages: false,
      AddReactions: false,
    });

    const reason = interaction.options.getString('reason') || 'No reason specified.';
    await interaction.reply({
      embeds: [
        createSuccessEmbed(
          'Channel Locked',
          `🔒 This channel has been locked.\n**Reason:** ${reason}`
        ),
      ],
    });
  },
};

export const UnlockCommand: ZenithCommand = {
  name: 'unlock',
  description: 'Unlock a previously locked channel',
  category: 'Moderation',
  userPermissions: [PermissionsBitField.Flags.ManageChannels],
  botPermissions: [PermissionsBitField.Flags.ManageChannels],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock this channel') as SlashCommandBuilder,

  async execute({ interaction, channel, guild }) {
    if (!channel || !('permissionOverwrites' in channel) || !guild) return;

    await (channel as TextChannel).permissionOverwrites.edit(guild.id, {
      SendMessages: null,
      AddReactions: null,
    });

    await interaction.reply({
      embeds: [
        createSuccessEmbed(
          'Channel Unlocked',
          '🔓 This channel has been unlocked. Members may now send messages.'
        ),
      ],
    });
  },
};
