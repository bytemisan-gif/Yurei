import {
  SlashCommandBuilder,
  PermissionsBitField,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { prisma } from '@misan/database';
import { PremiumService } from '@misan/premium';
import { PermissionManager } from '@misan/permissions';
import { createSuccessEmbed, createErrorEmbed, createBaseEmbed, createPremiumUpgradeEmbed } from '@misan/utils';

export const VanityCommand: MisanCommand = {
  name: 'vanity',
  description: 'Customize Yurei nickname, avatar, banner, bio, and custom prefix in this server (Premium)',
  category: 'Premium',
  userPermissions: [PermissionsBitField.Flags.ManageGuild],
  botPermissions: [
    PermissionsBitField.Flags.ChangeNickname,
    PermissionsBitField.Flags.ManageNicknames,
  ],
  cooldown: 5,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('vanity')
    .setDescription('Customize Yurei appearance and prefix for this server')
    .addSubcommand((sub) =>
      sub
        .setName('nickname')
        .setDescription('Change Yurei display name in this server')
        .addStringOption((opt) =>
          opt.setName('name').setDescription('New nickname (leave empty to reset)').setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('avatar')
        .setDescription('Set custom server avatar URL for Yurei')
        .addStringOption((opt) =>
          opt.setName('url').setDescription('Direct image URL (.png, .jpg, .webp)').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('banner')
        .setDescription('Set custom server banner URL for Yurei')
        .addStringOption((opt) =>
          opt.setName('url').setDescription('Direct banner image URL').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('bio')
        .setDescription('Set custom server about me / bio for Yurei')
        .addStringOption((opt) =>
          opt.setName('text').setDescription('Custom server bio text').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('prefix')
        .setDescription('Set custom command prefix for text commands (!, ?, $, #, @, etc.)')
        .addStringOption((opt) =>
          opt.setName('symbol').setDescription('New prefix (e.g. $, !, ?, ., #)').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName('view').setDescription('View current server vanity and custom prefix configuration')
    ) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    if (!guild) return;

    // Check Premium Entitlement (Owner always bypasses)
    const isOwner = PermissionManager.isSystemOwner(interaction.user.id);
    const plan = await PremiumService.getGuildPlan(guild.id);

    if (!isOwner && plan === 'FREE') {
      await interaction.reply({
        embeds: [
          createPremiumUpgradeEmbed(
            'Custom Bot Vanity (Avatar, Banner, Bio, Nickname) & Custom Prefix is a Yurei Server Premium feature.',
            'server.vanity'
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'nickname') {
      const newNick = interaction.options.getString('name') || null;
      try {
        const me = guild.members.me;
        if (me) {
          await me.setNickname(newNick);
        }

        await prisma.guildSetting.upsert({
          where: { guildId: guild.id },
          create: { guildId: guild.id },
          update: {},
        });

        await interaction.reply({
          embeds: [
            createSuccessEmbed(
              'Server Nickname Updated',
              newNick
                ? `Yurei's display nickname in **${guild.name}** is now **${newNick}**!`
                : `Yurei's nickname has been reset to default.`
            ),
          ],
        });
      } catch (err: any) {
        await interaction.reply({
          embeds: [
            createErrorEmbed(
              'Failed to Update Nickname',
              'Discord prevented changing nickname. Ensure my role is higher than the default role and has Change Nickname permissions.'
            ),
          ],
          ephemeral: true,
        });
      }
      return;
    }

    if (subcommand === 'prefix') {
      const symbol = interaction.options.getString('symbol', true).trim();
      if (symbol.length > 5) {
        await interaction.reply({
          embeds: [createErrorEmbed('Prefix Too Long', 'Prefix symbol cannot exceed 5 characters.')],
          ephemeral: true,
        });
        return;
      }

      await prisma.guildSetting.upsert({
        where: { guildId: guild.id },
        create: { guildId: guild.id, prefix: symbol },
        update: { prefix: symbol },
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Custom Command Prefix Set',
            `Custom prefix for **${guild.name}** has been updated to: \`${symbol}\`\n\nExample: \`${symbol}help\`, \`${symbol}ping\`, \`${symbol}antinuke\``
          ),
        ],
      });
      return;
    }

    if (subcommand === 'avatar' || subcommand === 'banner' || subcommand === 'bio') {
      const value =
        subcommand === 'bio'
          ? interaction.options.getString('text', true)
          : interaction.options.getString('url', true);

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            `Server ${subcommand.toUpperCase()} Configured`,
            `Custom server ${subcommand} set for **${guild.name}**:\n\`\`\`\n${value}\n\`\`\`\nThis customized profile will be displayed across embeds, dashboard, and server identity cards.`
          ),
        ],
      });
      return;
    }

    if (subcommand === 'view') {
      const settings = await prisma.guildSetting.findUnique({
        where: { guildId: guild.id },
      });

      const currentPrefix = settings?.prefix || '!';

      const embed = createBaseEmbed()
        .setTitle(`✨ Server Vanity Profile — ${guild.name}`)
        .setDescription('Custom server-specific Yurei appearance and command settings.')
        .addFields(
          { name: 'Custom Prefix', value: `\`${currentPrefix}\``, inline: true },
          { name: 'Server Nickname', value: guild.members.me?.nickname || '*Default (Yurei)*', inline: true },
          { name: 'Premium Status', value: plan === 'FREE' ? '🆓 Free Tier' : '🌟 **Server Premium (Active)**', inline: true },
          {
            name: 'Supported Custom Symbols',
            value: '`!`, `?`, `$`, `#`, `@`, `.`, `/`, `%`, `&`, `*`, `>`',
            inline: false,
          }
        );

      await interaction.reply({ embeds: [embed] });
      return;
    }
  },
};
