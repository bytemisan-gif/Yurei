import {
  SlashCommandBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { prisma } from '@misan/database';
import { createSuccessEmbed, createErrorEmbed } from '@misan/utils';

export const TicketCommand: ZenithCommand = {
  name: 'ticket',
  description: 'Manage support tickets and deploy interactive ticket panels',
  category: 'Tickets',
  userPermissions: [PermissionsBitField.Flags.ManageChannels],
  botPermissions: [PermissionsBitField.Flags.ManageChannels],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Manage support tickets')
    .addSubcommand((sub) =>
      sub
        .setName('panel')
        .setDescription('Deploy an interactive support ticket panel in a channel')
        .addChannelOption((opt) =>
          opt.setName('channel').setDescription('Channel to deploy the panel').setRequired(true)
        )
        .addStringOption((opt) => opt.setName('title').setDescription('Panel embed title'))
        .addStringOption((opt) => opt.setName('description').setDescription('Panel embed description'))
    )
    .addSubcommand((sub) =>
      sub.setName('close').setDescription('Close the current ticket channel')
    )
    .addSubcommand((sub) =>
      sub.setName('delete').setDescription('Permanently delete the current ticket channel')
    )
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add a user to this ticket')
        .addUserOption((opt) => opt.setName('user').setDescription('User to add').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove a user from this ticket')
        .addUserOption((opt) => opt.setName('user').setDescription('User to remove').setRequired(true))
    ) as SlashCommandBuilder,

  async execute({ interaction, guild, channel }) {
    if (!guild || !channel) return;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'panel') {
      const targetChannel = interaction.options.getChannel('channel', true) as any;
      if (!targetChannel.isTextBased()) {
        await interaction.reply({
          embeds: [createErrorEmbed('Invalid Channel', 'Please select a text channel.')],
          ephemeral: true,
        });
        return;
      }

      const title = interaction.options.getString('title') || 'Support Ticket Center';
      const description =
        interaction.options.getString('description') ||
        'Need assistance? Click the button below to open a private support ticket with our staff.';

      const openBtn = new ButtonBuilder()
        .setCustomId(`ticket_create_${Date.now()}`)
        .setLabel('Create Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📩');

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(openBtn);

      await targetChannel.send({
        embeds: [createSuccessEmbed(title, description)],
        components: [row],
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Ticket Panel Deployed',
            `Ticket panel has been posted in ${targetChannel}.`
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    if (subcommand === 'close') {
      const ticket = await prisma.ticket.findUnique({
        where: { channelId: channel.id },
      });

      if (!ticket) {
        await interaction.reply({
          embeds: [createErrorEmbed('Not a Ticket', 'This channel is not an active support ticket.')],
          ephemeral: true,
        });
        return;
      }

      await prisma.ticket.update({
        where: { channelId: channel.id },
        data: { status: 'CLOSED', closedAt: new Date() },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Ticket Closed',
            'This ticket has been marked as closed. Use `/ticket delete` to remove this channel.'
          ),
        ],
      });
      return;
    }

    if (subcommand === 'delete') {
      const ticket = await prisma.ticket.findUnique({
        where: { channelId: channel.id },
      });

      if (!ticket) {
        await interaction.reply({
          embeds: [createErrorEmbed('Not a Ticket', 'This channel is not a ticket.')],
          ephemeral: true,
        });
        return;
      }

      await interaction.reply('Deleting ticket channel in 5 seconds...');
      setTimeout(async () => {
        await prisma.ticket.delete({ where: { channelId: channel.id } }).catch(() => null);
        if ('delete' in channel && typeof channel.delete === 'function') {
          await channel.delete().catch(() => null);
        }
      }, 5000);
      return;
    }

    if (subcommand === 'add') {
      const user = interaction.options.getUser('user', true);
      if ('permissionOverwrites' in channel) {
        await (channel as any).permissionOverwrites.edit(user.id, {
          ViewChannel: true,
          SendMessages: true,
          AttachFiles: true,
        });
      }

      await interaction.reply({
        embeds: [createSuccessEmbed('Member Added', `Added ${user} to this support ticket.`)],
      });
      return;
    }

    if (subcommand === 'remove') {
      const user = interaction.options.getUser('user', true);
      if ('permissionOverwrites' in channel) {
        await (channel as any).permissionOverwrites.delete(user.id);
      }

      await interaction.reply({
        embeds: [createSuccessEmbed('Member Removed', `Removed ${user} from this support ticket.`)],
      });
      return;
    }
  },
};
