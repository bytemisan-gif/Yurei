import {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { BOT_CONFIG } from '@misan/config';
import { createSuccessEmbed, createErrorEmbed } from '@misan/utils';

export const EmbedCommand: ZenithCommand = {
  name: 'embed',
  description: 'Design and dispatch rich Discord embed messages',
  category: 'Embeds',
  userPermissions: [PermissionsBitField.Flags.ManageMessages],
  botPermissions: [PermissionsBitField.Flags.SendMessages],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Design and dispatch rich embeds')
    .addSubcommand((sub) =>
      sub
        .setName('send')
        .setDescription('Create and send a formatted embed')
        .addStringOption((opt) => opt.setName('title').setDescription('Embed title').setRequired(true))
        .addStringOption((opt) => opt.setName('description').setDescription('Embed description').setRequired(true))
        .addStringOption((opt) => opt.setName('color').setDescription('Hex color code (e.g. #5865F2)'))
        .addChannelOption((opt) => opt.setName('channel').setDescription('Channel to send to'))
    ) as SlashCommandBuilder,

  async execute({ interaction, guild, channel }) {
    if (!guild) return;
    const title = interaction.options.getString('title', true);
    const description = interaction.options.getString('description', true);
    const colorHex = interaction.options.getString('color') || '#5865F2';
    const targetChannel = (interaction.options.getChannel('channel') as any) || channel;

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(colorHex as any)
      .setFooter({ text: `${guild.name} • Dispatched via Yurei` })
      .setTimestamp();

    if ('send' in targetChannel && typeof targetChannel.send === 'function') {
      await targetChannel.send({ embeds: [embed] });
      await interaction.reply({
        embeds: [createSuccessEmbed('Embed Dispatched', `Embed has been posted in ${targetChannel}.`)],
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        embeds: [createErrorEmbed('Failed', 'Target channel does not support sending messages.')],
        ephemeral: true,
      });
    }
  },
};
