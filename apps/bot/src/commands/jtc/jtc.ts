import {
  SlashCommandBuilder,
  PermissionsBitField,
  ChannelType,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { prisma } from '@misan/database';
import { createSuccessEmbed, createErrorEmbed } from '@misan/utils';

export const JtcCommand: ZenithCommand = {
  name: 'jtc',
  description: 'Manage dynamic Join-To-Create temporary voice channels',
  category: 'Voice',
  userPermissions: [PermissionsBitField.Flags.ManageChannels],
  botPermissions: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.MoveMembers],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('jtc')
    .setDescription('Manage dynamic voice channels')
    .addSubcommand((sub) =>
      sub
        .setName('setup')
        .setDescription('Create a Join-To-Create generator hub channel')
        .addChannelOption((opt) =>
          opt
            .setName('category')
            .setDescription('Category where new temporary voice channels should spawn')
            .addChannelTypes(ChannelType.GuildCategory)
        )
    )
    .addSubcommand((sub) =>
      sub.setName('disable').setDescription('Disable Join-To-Create in this server')
    )
    .addSubcommand((sub) =>
      sub
        .setName('naming')
        .setDescription('Customize the default channel naming template')
        .addStringOption((opt) =>
          opt
            .setName('template')
            .setDescription('Naming template (Use {user} for member name)')
            .setRequired(true)
        )
    ) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    if (!guild) return;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'setup') {
      const category = interaction.options.getChannel('category') as any;

      const hubChannel = await guild.channels.create({
        name: '➕ Join to Create',
        type: ChannelType.GuildVoice,
        parent: category ? category.id : undefined,
      });

      await prisma.voiceConfig.upsert({
        where: { guildId: guild.id },
        create: {
          guildId: guild.id,
          hubChannelId: hubChannel.id,
          categoryId: category ? category.id : null,
        },
        update: {
          hubChannelId: hubChannel.id,
          categoryId: category ? category.id : null,
        },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Join-To-Create Hub Configured',
            `Created generator channel ${hubChannel}.\nMembers joining this channel will automatically receive their own private temporary voice room.`
          ),
        ],
      });
      return;
    }

    if (subcommand === 'disable') {
      await prisma.voiceConfig.deleteMany({
        where: { guildId: guild.id },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed('Join-To-Create Disabled', 'Temporary voice generation has been turned off.'),
        ],
      });
      return;
    }

    if (subcommand === 'naming') {
      const template = interaction.options.getString('template', true);
      await prisma.voiceConfig.upsert({
        where: { guildId: guild.id },
        create: {
          guildId: guild.id,
          namingTemplate: template,
        },
        update: { namingTemplate: template },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed('Naming Template Updated', `New voice channels will be named: \`${template}\``),
        ],
      });
      return;
    }
  },
};
