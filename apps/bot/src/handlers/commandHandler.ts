import { ChatInputCommandInteraction } from 'discord.js';
import { MisanClient } from '../client/MisanClient';
import { PermissionManager } from '@misan/permissions';
import { PremiumService } from '@misan/premium';
import { RateLimiter } from '@misan/security';
import {
  createErrorEmbed,
  createPremiumUpgradeEmbed,
  createPremiumActionRow,
} from '@misan/utils';
import { logger } from '@misan/logger';
import { prisma } from '@misan/database';

export async function handleCommandInteraction(
  client: MisanClient,
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    await interaction.reply({
      embeds: [createErrorEmbed('Command Not Found', 'This command is no longer registered.')],
      ephemeral: true,
    });
    return;
  }

  // 1. Guild Only Check
  if (command.guildOnly && !interaction.guild) {
    await interaction.reply({
      embeds: [createErrorEmbed('Guild Only', 'This command can only be used inside a Discord server.')],
      ephemeral: true,
    });
    return;
  }

  // 2. Owner Only Check
  if (command.ownerOnly && !PermissionManager.isSystemOwner(interaction.user.id)) {
    await interaction.reply({
      embeds: [
        createErrorEmbed(
          'Unauthorized',
          'This command is strictly restricted to system bot administrators.'
        ),
      ],
      ephemeral: true,
    });
    return;
  }

  // 3. User Permissions Check (System Owner 1354252509010722817 bypasses all restrictions)
  if (interaction.guild && !PermissionManager.isSystemOwner(interaction.user.id)) {
    const member = interaction.guild.members.cache.get(interaction.user.id) || (await interaction.guild.members.fetch(interaction.user.id).catch(() => null));
    if (member && command.userPermissions && command.userPermissions.length > 0) {
      const hasPerms = PermissionManager.hasDiscordPermissions(member, command.userPermissions);
      if (!hasPerms) {
        await interaction.reply({
          embeds: [
            createErrorEmbed(
              'Insufficient Permissions',
              'You do not have the required permissions to execute this command.'
            ),
          ],
          ephemeral: true,
        });
        return;
      }
    }

    // Custom Database Permission Overrides
    if (member && interaction.guild) {
      const override = await PermissionManager.checkCommandCustomOverrides(
        interaction.guild.id,
        command.name,
        member,
        interaction.channelId
      );
      if (override.overrideFound && !override.allowed) {
        await interaction.reply({
          embeds: [
            createErrorEmbed(
              'Command Disabled',
              'This command has been disabled for your role, account, or channel by server administration.'
            ),
          ],
          ephemeral: true,
        });
        return;
      }
    }
  }

  // 4. Bot Permissions Check
  if (interaction.guild && command.botPermissions && command.botPermissions.length > 0) {
    const botCheck = PermissionManager.botHasPermissions(
      interaction.guild,
      command.botPermissions
    );
    if (!botCheck.hasPermissions) {
      await interaction.reply({
        embeds: [
          createErrorEmbed(
            'Missing Bot Permissions',
            `I require the following permission(s) to execute this command: **${botCheck.missing.join(
              ', '
            )}**`
          ),
        ],
        ephemeral: true,
      });
      return;
    }
  }

  // 5. Cooldown Check
  const cooldownSec = command.cooldown ?? 3;
  if (!PermissionManager.isSystemOwner(interaction.user.id)) {
    const rateCheck = RateLimiter.checkRateLimit(
      interaction.user.id,
      command.name,
      cooldownSec
    );
    if (rateCheck.limited) {
      await interaction.reply({
        embeds: [
          createErrorEmbed(
            'Cooldown Active',
            `Please wait **${rateCheck.remainingSeconds}s** before using this command again.`
          ),
        ],
        ephemeral: true,
      });
      return;
    }
  }

  // 6. Central Premium Entitlement Check
  if (command.premiumOnly && !PermissionManager.isSystemOwner(interaction.user.id)) {
    const entitlement = await PremiumService.checkEntitlement({
      guildId: interaction.guildId || undefined,
      userId: interaction.user.id,
      featureKey: `command.${command.name}`,
    });

    if (!entitlement.allowed) {
      await interaction.reply({
        embeds: [createPremiumUpgradeEmbed(entitlement.reason, `command.${command.name}`)],
        components: [createPremiumActionRow()],
        ephemeral: true,
      });
      return;
    }
  }

  // 7. Command Execution & Performance Auditing
  const startTime = Date.now();
  let executionSuccess = true;

  try {
    const member = interaction.guild?.members.cache.get(interaction.user.id) || null;
    await command.execute({
      interaction,
      client,
      guild: interaction.guild,
      member,
      user: interaction.user,
      channel: interaction.channel,
    });
  } catch (error: any) {
    executionSuccess = false;
    logger.error(`Error executing command ${command.name}`, {
      command: command.name,
      guildId: interaction.guildId || undefined,
      userId: interaction.user.id,
      error,
    });

    const errorEmbed = createErrorEmbed(
      'Execution Error',
      'An unexpected error occurred while processing this command. The issue has been automatically logged.'
    );

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => null);
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => null);
    }
  } finally {
    const executionMs = Date.now() - startTime;
    prisma.commandUsage
      .create({
        data: {
          command: command.name,
          guildId: interaction.guildId || null,
          userId: interaction.user.id,
          success: executionSuccess,
          executionMs,
        },
      })
      .catch(() => null);
  }
}
