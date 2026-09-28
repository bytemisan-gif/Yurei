import {
  SlashCommandBuilder,
  PermissionsBitField,
} from 'discord.js';
import { MisanCommand, PlanType, PremiumScope } from '@misan/types';
import { PermissionManager } from '@misan/permissions';
import { PremiumService } from '@misan/premium';
import { prisma } from '@misan/database';
import { createSuccessEmbed, createErrorEmbed, createBaseEmbed } from '@misan/utils';

export const PremiumCommand: MisanCommand = {
  name: 'premium',
  description: 'View premium tier status or administer subscriptions and activation codes',
  category: 'Premium',
  userPermissions: [],
  botPermissions: [],
  cooldown: 3,
  guildOnly: false,
  data: new SlashCommandBuilder()
    .setName('premium')
    .setDescription('Manage or check premium subscriptions')
    .addSubcommand((sub) =>
      sub.setName('info').setDescription('Check premium status of the current server and user')
    )
    .addSubcommand((sub) =>
      sub.setName('activate').setDescription('Instantly activate Lifetime Server Premium in this server (Owner Only)')
    )
    .addSubcommandGroup((grp) =>
      grp
        .setName('code')
        .setDescription('Redeem or manage premium activation codes')
        .addSubcommand((sub) =>
          sub
            .setName('redeem')
            .setDescription('Redeem a premium activation code')
            .addStringOption((opt) =>
              opt.setName('code').setDescription('Activation code (YUREI-XXXX-XXXX)').setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName('create')
            .setDescription('Generate a new premium code (Owner Only)')
            .addStringOption((opt) =>
              opt
                .setName('plan')
                .setDescription('Plan tier')
                .setRequired(true)
                .addChoices(
                  { name: 'Server Premium', value: 'SERVER_PREMIUM' },
                  { name: 'User Premium', value: 'USER_PREMIUM' }
                )
            )
            .addIntegerOption((opt) =>
              opt
                .setName('duration')
                .setDescription('Duration in days (0 = Lifetime)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(3650)
            )
            .addIntegerOption((opt) =>
              opt.setName('uses').setDescription('Max redemption uses (default: 1)').setMinValue(1)
            )
        )
    )
    .addSubcommandGroup((grp) =>
      grp
        .setName('admin')
        .setDescription('Owner administrative subscription actions')
        .addSubcommand((sub) =>
          sub
            .setName('grant')
            .setDescription('Directly grant premium to a guild or user (Owner Only)')
            .addStringOption((opt) =>
              opt
                .setName('type')
                .setDescription('Target scope')
                .setRequired(true)
                .addChoices({ name: 'Server', value: 'GUILD' }, { name: 'User', value: 'USER' })
            )
            .addStringOption((opt) =>
              opt.setName('target_id').setDescription('Guild or User ID').setRequired(true)
            )
            .addStringOption((opt) =>
              opt
                .setName('plan')
                .setDescription('Plan')
                .setRequired(true)
                .addChoices(
                  { name: 'Server Premium', value: 'SERVER_PREMIUM' },
                  { name: 'User Premium', value: 'USER_PREMIUM' },
                  { name: 'Global Developer Override', value: 'GLOBAL_PREMIUM' }
                )
            )
            .addIntegerOption((opt) =>
              opt
                .setName('days')
                .setDescription('Duration in days (0 = Lifetime)')
                .setRequired(true)
                .setMinValue(0)
            )
            .addStringOption((opt) => opt.setName('reason').setDescription('Reason for grant'))
        )
        .addSubcommand((sub) =>
          sub
            .setName('revoke')
            .setDescription('Revoke premium from a guild or user (Owner Only)')
            .addStringOption((opt) =>
              opt
                .setName('type')
                .setDescription('Target scope')
                .setRequired(true)
                .addChoices({ name: 'Server', value: 'GUILD' }, { name: 'User', value: 'USER' })
            )
            .addStringOption((opt) =>
              opt.setName('target_id').setDescription('Guild or User ID').setRequired(true)
            )
            .addStringOption((opt) => opt.setName('reason').setDescription('Reason for revocation'))
        )
    ) as SlashCommandBuilder,

  async execute({ interaction, guild }) {
    const group = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();

    // 0. Instant Activate Subcommand (Owner 1354252509010722817 Override)
    if (subcommand === 'activate') {
      if (!PermissionManager.isSystemOwner(interaction.user.id)) {
        await interaction.reply({
          embeds: [
            createErrorEmbed(
              'Unauthorized',
              'Only the Bot Owner (1354252509010722817) can instantly activate premium in any server.'
            ),
          ],
          ephemeral: true,
        });
        return;
      }

      if (!guild) {
        await interaction.reply({
          embeds: [createErrorEmbed('Server Required', 'This command must be used inside a Discord server.')],
          ephemeral: true,
        });
        return;
      }

      await PremiumService.grantPremium(interaction.user.id, {
        targetId: guild.id,
        targetType: 'GUILD',
        plan: 'SERVER_PREMIUM',
        durationDays: 0, // Lifetime
        reason: 'Instant Owner Override Activation (/premium activate)',
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            '🌟 Yurei Server Premium Activated!',
            `**${guild.name}** has been granted **Lifetime Server Premium** by Bot Owner <@${interaction.user.id}>!\n\nAll 600+ commands, anti-nuke auto-recovery, encrypted snapshot backups, and 24/7 music features are now permanently unlocked.`
          ),
        ],
      });
      return;
    }

    // 1. Info Subcommand
    if (subcommand === 'info') {
      const userPlan = await PremiumService.getUserPlan(interaction.user.id);
      const guildPlan = guild ? await PremiumService.getGuildPlan(guild.id) : 'FREE';

      const embed = createBaseEmbed()
        .setTitle('⭐ Yurei Premium Status')
        .setDescription('Real-time entitlement and subscription tier overview')
        .addFields(
          {
            name: 'Your User Plan',
            value: userPlan === 'FREE' ? '🆓 Free Tier' : `🌟 **${userPlan}**`,
            inline: true,
          },
          {
            name: 'Current Server Plan',
            value: guild
              ? guildPlan === 'FREE'
                ? '🆓 Free Tier'
                : `🛡️ **${guildPlan}**`
              : 'N/A (DMs)',
            inline: true,
          },
          {
            name: 'Unlocks Available',
            value:
              '• Advanced Anti-Nuke Sliding-Window Thresholds\n• Anti-Raid Join Gates & Deep Account Verification\n• Server Snapshots & Full Role/Channel Backups\n• High-Definition Music Audio Filters (8D, Bassboost)\n• Unlimited Ticket Panels & Modals\n• Unlimited Custom Commands & Autoresponders',
            inline: false,
          }
        );

      await interaction.reply({ embeds: [embed] });
      return;
    }

    // 2. Code Redeem
    if (group === 'code' && subcommand === 'redeem') {
      const code = interaction.options.getString('code', true);
      const res = await PremiumService.redeemCode(
        interaction.user.id,
        code,
        guild?.id || undefined
      );

      if (!res.success) {
        await interaction.reply({
          embeds: [createErrorEmbed('Redemption Failed', res.message)],
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({
        embeds: [createSuccessEmbed('Premium Activated', res.message)],
      });
      return;
    }

    // 3. Code Create (Owner Only)
    if (group === 'code' && subcommand === 'create') {
      if (!PermissionManager.isSystemOwner(interaction.user.id)) {
        await interaction.reply({
          embeds: [createErrorEmbed('Unauthorized', 'Only system owners may generate premium codes.')],
          ephemeral: true,
        });
        return;
      }

      const plan = interaction.options.getString('plan', true) as PlanType;
      const durationDays = interaction.options.getInteger('duration', true);
      const maxUses = interaction.options.getInteger('uses') || 1;
      const scope: PremiumScope = plan === 'SERVER_PREMIUM' ? 'SERVER' : 'USER';

      const codeObj = await PremiumService.createCode(interaction.user.id, {
        plan,
        scope,
        durationDays,
        maxUses,
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Premium Code Generated',
            `**Code:** \`${codeObj.code}\`\n**Plan:** \`${plan}\`\n**Duration:** \`${
              durationDays === 0 ? 'Lifetime' : `${durationDays} Days`
            }\`\n**Max Uses:** \`${maxUses}\``
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    // 4. Admin Direct Grant (Owner Only)
    if (group === 'admin' && subcommand === 'grant') {
      if (!PermissionManager.isSystemOwner(interaction.user.id)) {
        await interaction.reply({
          embeds: [createErrorEmbed('Unauthorized', 'System administrator permission required.')],
          ephemeral: true,
        });
        return;
      }

      const type = interaction.options.getString('type', true) as 'USER' | 'GUILD';
      const targetId = interaction.options.getString('target_id', true).trim();
      const plan = interaction.options.getString('plan', true) as PlanType;
      const days = interaction.options.getInteger('days', true);
      const reason = interaction.options.getString('reason') || 'Administrative manual grant';

      await PremiumService.grantPremium(interaction.user.id, {
        targetId,
        targetType: type,
        plan,
        durationDays: days,
        reason,
      });

      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            'Premium Granted',
            `Successfully granted **${plan}** to ${type} \`${targetId}\` for **${
              days === 0 ? 'Lifetime' : `${days} days`
            }**.\n**Reason:** ${reason}`
          ),
        ],
      });
      return;
    }

    // 5. Admin Direct Revoke (Owner Only)
    if (group === 'admin' && subcommand === 'revoke') {
      if (!PermissionManager.isSystemOwner(interaction.user.id)) {
        await interaction.reply({
          embeds: [createErrorEmbed('Unauthorized', 'System administrator permission required.')],
          ephemeral: true,
        });
        return;
      }

      const type = interaction.options.getString('type', true) as 'USER' | 'GUILD';
      const targetId = interaction.options.getString('target_id', true).trim();
      const reason = interaction.options.getString('reason') || 'Administrative revocation';

      const revoked = await PremiumService.revokePremium(interaction.user.id, {
        targetId,
        targetType: type,
        reason,
      });

      if (!revoked) {
        await interaction.reply({
          embeds: [createErrorEmbed('No Active Subscription', `No active subscription found for ${type} \`${targetId}\`.`)],
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({
        embeds: [createSuccessEmbed('Premium Revoked', `Revoked all active subscriptions for ${type} \`${targetId}\`.`)],
      });
      return;
    }
  },
};
