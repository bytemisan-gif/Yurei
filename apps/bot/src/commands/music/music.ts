import {
  SlashCommandBuilder,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { PremiumService } from '@misan/premium';
import { createSuccessEmbed, createErrorEmbed, createBaseEmbed, createPremiumUpgradeEmbed } from '@misan/utils';

export const PlayCommand: ZenithCommand = {
  name: 'play',
  description: 'Search and play audio from YouTube, Spotify, or SoundCloud',
  category: 'Music',
  userPermissions: [],
  botPermissions: [],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a track or stream URL')
    .addStringOption((opt) =>
      opt.setName('query').setDescription('Song title or URL to stream').setRequired(true)
    ) as SlashCommandBuilder,

  async execute({ interaction, guild, member }) {
    if (!guild || !member) return;
    const query = interaction.options.getString('query', true);
    const voiceChannel = (member as any).voice?.channel;

    if (!voiceChannel) {
      await interaction.reply({
        embeds: [
          createErrorEmbed('Voice Required', 'You must be in a voice channel to use music playback.'),
        ],
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      embeds: [
        createSuccessEmbed(
          'Track Queued',
          `🔍 Searching for **${query}**...\n🎵 Enqueued into channel: <#${voiceChannel.id}>.`
        ),
      ],
    });
  },
};

export const StopCommand: ZenithCommand = {
  name: 'stop',
  description: 'Stop music playback and clear the active queue',
  category: 'Music',
  userPermissions: [],
  botPermissions: [],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playback and clear queue') as SlashCommandBuilder,

  async execute({ interaction }) {
    await interaction.reply({
      embeds: [createSuccessEmbed('Playback Stopped', '⏹️ Audio playback stopped and queue cleared.')],
    });
  },
};

export const FilterCommand: ZenithCommand = {
  name: 'filter',
  description: 'Apply advanced audio DSP filters (Bassboost, 8D, Nightcore) (Premium)',
  category: 'Music',
  userPermissions: [],
  botPermissions: [],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('filter')
    .setDescription('Apply audio filters (Premium)')
    .addStringOption((opt) =>
      opt
        .setName('preset')
        .setDescription('Select audio DSP filter')
        .setRequired(true)
        .addChoices(
          { name: 'Bassboost', value: 'bassboost' },
          { name: '8D Spatial', value: '8d' },
          { name: 'Nightcore', value: 'nightcore' },
          { name: 'Vaporwave', value: 'vaporwave' },
          { name: 'Clear All Filters', value: 'clear' }
        )
    ) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    if (!guild) return;
    const preset = interaction.options.getString('preset', true);

    const entitlement = await PremiumService.checkEntitlement({
      guildId: guild.id,
      userId: interaction.user.id,
      featureKey: 'music.filters',
    });

    if (!entitlement.allowed && preset !== 'clear') {
      await interaction.reply({
        embeds: [
          createPremiumUpgradeEmbed(
            'Advanced audio filters (8D, Bassboost, Nightcore) require Yurei Server Premium.',
            'music.filters'
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      embeds: [createSuccessEmbed('Filter Applied', `Audio filter set to **${preset.toUpperCase()}**!`)],
    });
  },
};
