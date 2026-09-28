import {
  SlashCommandBuilder,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { BOT_CONFIG } from '@misan/config';
import { prisma } from '@misan/database';
import { createSuccessEmbed, createBaseEmbed, formatDuration, parseDuration } from '@misan/utils';
import os from 'os';

export const PingCommand: ZenithCommand = {
  name: 'ping',
  description: 'Measure bot WebSocket heartbeat latency and Discord REST round-trip time',
  category: 'Utility',
  userPermissions: [],
  botPermissions: [],
  cooldown: 2,
  guildOnly: false,
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Measure bot latency') as SlashCommandBuilder,

  async execute({ interaction, client }) {
    const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });
    const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const wsPing = client.ws.ping;

    const embed = createBaseEmbed()
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Gateway WebSocket Latency', value: `\`${wsPing}ms\``, inline: true },
        { name: 'REST Round-trip Time', value: `\`${roundtripLatency}ms\``, inline: true }
      );

    await interaction.editReply({ content: '', embeds: [embed] });
  },
};

export const StatsCommand: ZenithCommand = {
  name: 'stats',
  description: 'Display real runtime statistics, memory consumption, and shard metrics',
  category: 'Utility',
  userPermissions: [],
  botPermissions: [],
  cooldown: 5,
  guildOnly: false,
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Display runtime statistics and system metrics') as SlashCommandBuilder,

  async execute({ interaction, client }) {
    const memoryUsedMb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const totalMemoryMb = Math.round(os.totalmem() / 1024 / 1024);
    const freeMemoryMb = Math.round(os.freemem() / 1024 / 1024);
    const uptimeStr = formatDuration(Date.now() - (client as any).bootTimestamp);

    // Compute actual real user and guild count
    const totalGuilds = client.guilds.cache.size;
    const totalUsers = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
    const totalChannels = client.channels.cache.size;
    const shardCount = client.shard?.count || 1;
    const shardId = client.shard?.ids[0] ?? 0;

    const totalCmdsRun = await prisma.commandUsage.count();

    const embed = createBaseEmbed()
      .setTitle(`📊 ${BOT_CONFIG.name} Runtime Telemetry`)
      .addFields(
        { name: 'Servers', value: `\`${totalGuilds.toLocaleString()}\``, inline: true },
        { name: 'Users', value: `\`${totalUsers.toLocaleString()}\``, inline: true },
        { name: 'Channels', value: `\`${totalChannels.toLocaleString()}\``, inline: true },
        { name: 'Uptime', value: `\`${uptimeStr}\``, inline: true },
        { name: 'Shard', value: `\`#${shardId} of ${shardCount}\``, inline: true },
        { name: 'Node.js', value: `\`${process.version}\``, inline: true },
        { name: 'Memory Usage', value: `\`${memoryUsedMb} MB\``, inline: true },
        { name: 'OS Memory Free', value: `\`${freeMemoryMb} / ${totalMemoryMb} MB\``, inline: true },
        { name: 'Total Commands Executed', value: `\`${totalCmdsRun.toLocaleString()}\``, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export const AfkCommand: ZenithCommand = {
  name: 'afk',
  description: 'Set your AFK status so users mentioning you are notified',
  category: 'Utility',
  userPermissions: [],
  botPermissions: [],
  cooldown: 5,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set AFK status')
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for being AFK')) as SlashCommandBuilder,

  async execute({ interaction }) {
    const reason = interaction.options.getString('reason') || 'Away From Keyboard';

    await prisma.aFK.upsert({
      where: { userId: interaction.user.id },
      create: { userId: interaction.user.id, reason },
      update: { reason, createdAt: new Date() },
    });

    await interaction.reply({
      embeds: [
        createSuccessEmbed(
          'AFK Set',
          `Your AFK status has been registered with reason: **${reason}**.\nIt will automatically clear the next time you send a message.`
        ),
      ],
    });
  },
};

export const ReminderCommand: ZenithCommand = {
  name: 'reminder',
  description: 'Set a persistent scheduled notification reminder',
  category: 'Utility',
  userPermissions: [],
  botPermissions: [],
  cooldown: 5,
  guildOnly: false,
  data: new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Set a scheduled reminder')
    .addStringOption((opt) =>
      opt.setName('time').setDescription('Time duration (e.g. 15m, 2h, 1d)').setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName('message').setDescription('Reminder message').setRequired(true)
    ) as SlashCommandBuilder,

  async execute({ interaction, channel }) {
    const timeStr = interaction.options.getString('time', true);
    const message = interaction.options.getString('message', true);

    const ms = parseDuration(timeStr);
    if (!ms) {
      await interaction.reply({
        content: 'Please provide a valid time like `15m`, `1h`, or `2d`.',
        ephemeral: true,
      });
      return;
    }

    const triggerAt = new Date(Date.now() + ms);

    await prisma.reminder.create({
      data: {
        userId: interaction.user.id,
        channelId: channel?.id || null,
        message,
        triggerAt,
      },
    });

    await interaction.reply({
      embeds: [
        createSuccessEmbed(
          'Reminder Scheduled',
          `I will remind you about **"${message}"** in **${timeStr}** (<t:${Math.floor(
            triggerAt.getTime() / 1000
          )}:R>).`
        ),
      ],
    });
  },
};
