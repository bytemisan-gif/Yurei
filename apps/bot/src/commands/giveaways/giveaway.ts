import {
  SlashCommandBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { prisma } from '@misan/database';
import { createSuccessEmbed, createErrorEmbed, createBaseEmbed, parseDuration } from '@misan/utils';

export const GiveawayCommand: ZenithCommand = {
  name: 'giveaway',
  description: 'Manage persistent giveaways with role requirements and auto-reroll',
  category: 'Giveaways',
  userPermissions: [PermissionsBitField.Flags.ManageGuild],
  botPermissions: [PermissionsBitField.Flags.SendMessages],
  cooldown: 5,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Manage server giveaways')
    .addSubcommand((sub) =>
      sub
        .setName('start')
        .setDescription('Start a new giveaway')
        .addStringOption((opt) =>
          opt.setName('prize').setDescription('Prize to give away').setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName('duration').setDescription('Duration (e.g. 1h, 1d, 3d)').setRequired(true)
        )
        .addIntegerOption((opt) =>
          opt.setName('winners').setDescription('Number of winners').setMinValue(1).setMaxValue(20)
        )
        .addChannelOption((opt) => opt.setName('channel').setDescription('Channel for giveaway'))
    )
    .addSubcommand((sub) =>
      sub
        .setName('end')
        .setDescription('End an active giveaway early')
        .addStringOption((opt) =>
          opt.setName('message_id').setDescription('Giveaway message ID').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('reroll')
        .setDescription('Pick a new random winner for a completed giveaway')
        .addStringOption((opt) =>
          opt.setName('message_id').setDescription('Giveaway message ID').setRequired(true)
        )
    ) as SlashCommandBuilder,

  async execute({ interaction, guild, channel }) {
    if (!guild) return;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'start') {
      const prize = interaction.options.getString('prize', true);
      const durationStr = interaction.options.getString('duration', true);
      const winners = interaction.options.getInteger('winners') || 1;
      const targetChannel = (interaction.options.getChannel('channel') as any) || channel;

      const durationMs = parseDuration(durationStr);
      if (!durationMs) {
        await interaction.reply({
          embeds: [createErrorEmbed('Invalid Duration', 'Please provide a format like `1h`, `12h`, or `3d`.')],
          ephemeral: true,
        });
        return;
      }

      const endsAt = new Date(Date.now() + durationMs);

      const embed = createBaseEmbed()
        .setTitle(`🎉 GIVEAWAY: ${prize}`)
        .setDescription(
          `Click the **Enter Giveaway** button below to participate!\n\n**Winners:** \`${winners}\`\n**Ends:** <t:${Math.floor(
            endsAt.getTime() / 1000
          )}:R> (<t:${Math.floor(endsAt.getTime() / 1000)}:F>)\n**Hosted by:** ${interaction.user}`
        );

      const enterBtn = new ButtonBuilder()
        .setCustomId('yurei_giveaway_enter')
        .setLabel('Enter Giveaway (0)')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🎉');

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(enterBtn);

      const msg = await targetChannel.send({ embeds: [embed], components: [row] });

      await prisma.giveaway.create({
        data: {
          guildId: guild.id,
          channelId: targetChannel.id,
          messageId: msg.id,
          prize,
          winnerCount: winners,
          hostId: interaction.user.id,
          endsAt,
          ended: false,
        },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Giveaway Started',
            `Giveaway for **${prize}** has been dispatched to ${targetChannel}!`
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    if (subcommand === 'end' || subcommand === 'reroll') {
      const messageId = interaction.options.getString('message_id', true);
      const giveaway = await prisma.giveaway.findUnique({
        where: { messageId },
        include: { entries: true },
      });

      if (!giveaway) {
        await interaction.reply({
          embeds: [createErrorEmbed('Not Found', 'Could not locate a giveaway with that message ID.')],
          ephemeral: true,
        });
        return;
      }

      if (giveaway.entries.length === 0) {
        await interaction.reply({
          embeds: [createErrorEmbed('No Entrants', 'No valid users entered this giveaway.')],
          ephemeral: true,
        });
        return;
      }

      // Pick winner
      const shuffled = [...giveaway.entries].sort(() => 0.5 - Math.random());
      const chosenWinners = shuffled.slice(0, giveaway.winnerCount).map((e) => `<@${e.userId}>`);

      await prisma.giveaway.update({
        where: { messageId },
        data: { ended: true, winnerIds: chosenWinners },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            '🎉 Giveaway Concluded',
            `**Prize:** ${giveaway.prize}\n**Winner(s):** ${chosenWinners.join(', ')}`
          ),
        ],
      });
      return;
    }
  },
};
