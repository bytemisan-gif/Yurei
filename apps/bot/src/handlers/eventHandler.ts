import {
  Events,
  GuildMember,
  Message,
  GuildChannel,
  Role,
  GuildBan,
  VoiceState,
  ChannelType,
  PermissionsBitField,
  AuditLogEvent,
} from 'discord.js';
import { MisanClient } from '../client/MisanClient';
import { handleCommandInteraction } from './commandHandler';
import { AntinukeEngine, AntiraidEngine } from '@misan/security';
import { prisma } from '@misan/database';
import { logger } from '@misan/logger';
import { createSuccessEmbed, createErrorEmbed } from '@misan/utils';

export function registerEventHandlers(client: MisanClient): void {
  // 1. Client Ready Event
  client.once(Events.ClientReady, async (c) => {
    logger.info(`Yurei online as ${c.user.tag} in ${c.guilds.cache.size} guilds.`, {
      module: 'Gateway',
    });
    c.user.setPresence({
      activities: [{ name: '/help | yureibot.app', type: 3 }], // WATCHING
      status: 'online',
    });
  });

  // 2. Interaction Create Event (Slash Commands, Buttons, Modals)
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleCommandInteraction(client, interaction);
      return;
    }

    // Button Interactions
    if (interaction.isButton()) {
      const customId = interaction.customId;

      // Giveaway Enter Button
      if (customId === 'yurei_giveaway_enter' || customId === 'zenith_giveaway_enter') {
        const giveaway = await prisma.giveaway.findFirst({
          where: { messageId: interaction.message.id, ended: false },
        });

        if (!giveaway) {
          await interaction.reply({
            content: 'This giveaway has already ended.',
            ephemeral: true,
          });
          return;
        }

        const entries: string[] = (giveaway.entries as string[]) || [];
        if (entries.includes(interaction.user.id)) {
          await interaction.reply({
            content: 'You have already entered this giveaway!',
            ephemeral: true,
          });
          return;
        }

        entries.push(interaction.user.id);
        await prisma.giveaway.update({
          where: { id: giveaway.id },
          data: { entries },
        });

        await interaction.reply({
          content: `🎉 You have entered the giveaway for **${giveaway.prize}**! (${entries.length} total entries)`,
          ephemeral: true,
        });
        return;
      }

      // Premium Code Redeem Button
      if (customId === 'misan_btn_redeem_code' || customId === 'yurei_btn_redeem_code') {
        await interaction.reply({
          content: 'To redeem a premium activation code, run `/premium code redeem <code>`!',
          ephemeral: true,
        });
        return;
      }

      // Ticket Creation Button
      if (customId.startsWith('ticket_create_')) {
        const guild = interaction.guild;
        if (!guild) return;

        const ticketCount = await prisma.ticket.count({
          where: { guildId: guild.id, creatorId: interaction.user.id, status: 'OPEN' },
        });

        if (ticketCount >= 3) {
          await interaction.reply({
            embeds: [createErrorEmbed('Limit Reached', 'You already have 3 open tickets.')],
            ephemeral: true,
          });
          return;
        }

        const ticketChannel = await guild.channels.create({
          name: `ticket-${interaction.user.username}`,
          type: ChannelType.GuildText,
          permissionOverwrites: [
            {
              id: guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: interaction.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.AttachFiles,
              ],
            },
            {
              id: client.user!.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ManageChannels,
              ],
            },
          ],
        });

        const totalTickets = (await prisma.ticket.count({ where: { guildId: guild.id } })) + 1;
        await prisma.ticket.create({
          data: {
            guildId: guild.id,
            channelId: ticketChannel.id,
            ticketNumber: totalTickets,
            creatorId: interaction.user.id,
            status: 'OPEN',
          },
        });

        await ticketChannel.send({
          embeds: [
            createSuccessEmbed(
              `Ticket #${totalTickets} Opened`,
              `Welcome ${interaction.user}! Please describe your inquiry. Support staff will assist you shortly.\n\nUse \`/ticket close\` to finish this ticket.`
            ),
          ],
        });

        await interaction.reply({
          content: `Your support ticket has been created at ${ticketChannel}!`,
          ephemeral: true,
        });
        return;
      }

      // Member Verification Button
      if (customId === 'misan_btn_verify') {
        const guild = interaction.guild;
        if (!guild) return;

        const config = await prisma.verificationConfig.findUnique({
          where: { guildId: guild.id },
        });

        if (!config || !config.enabled || !config.roleId) {
          await interaction.reply({
            content: 'Verification is currently not configured for this server.',
            ephemeral: true,
          });
          return;
        }

        const member = await guild.members.fetch(interaction.user.id).catch(() => null);
        if (member) {
          await member.roles.add(config.roleId).catch(() => null);
          await interaction.reply({
            content: '✅ You have been successfully verified and granted access!',
            ephemeral: true,
          });
        }
        return;
      }
    }
  });

  // 3. Member Join (Anti-Raid, AutoRole, Welcomer)
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    // Anti-Raid Filter
    await AntiraidEngine.handleMemberJoin(member);

    // Auto-Role
    try {
      const autoRoles = await prisma.autoRole.findMany({
        where: { guildId: member.guild.id },
      });

      for (const ar of autoRoles) {
        if (
          (ar.target === 'ALL') ||
          (ar.target === 'BOT' && member.user.bot) ||
          (ar.target === 'HUMAN' && !member.user.bot)
        ) {
          await member.roles.add(ar.roleId).catch(() => null);
        }
      }
    } catch {
      // Ignore role add failure
    }

    // Welcomer Message
    try {
      const welcome = await prisma.welcomeConfig.findUnique({
        where: { guildId: member.guild.id },
      });

      if (welcome && welcome.enabled && welcome.channelId) {
        const channel = member.guild.channels.cache.get(welcome.channelId);
        if (channel && channel.isTextBased()) {
          const msg = welcome.message
            .replace(/{user}/g, `<@${member.id}>`)
            .replace(/{server}/g, member.guild.name)
            .replace(/{count}/g, member.guild.memberCount.toString());

          await channel.send({ content: msg });
        }
      }
    } catch {
      // Welcomer fail-safe
    }
  });

  // 4. Message Create (Autoresponder, AFK mentions)
  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot || !message.guild) return;

    // AFK Check for Author
    try {
      const userAfk = await prisma.aFK.findUnique({
        where: { userId: message.author.id },
      });
      if (userAfk) {
        await prisma.aFK.delete({ where: { userId: message.author.id } });
        await message.reply({
          content: `Welcome back, <@${message.author.id}>! Your AFK status has been removed.`,
        });
      }
    } catch {
      // AFK fail-safe
    }

    // AFK Check for Mentions
    if (message.mentions.users.size > 0) {
      for (const [mentionedId] of message.mentions.users) {
        const targetAfk = await prisma.aFK.findUnique({
          where: { userId: mentionedId },
        });
        if (targetAfk) {
          await message.reply({
            content: `💤 That user is currently AFK: **${targetAfk.reason}**`,
          });
          break;
        }
      }
    }

    // Autoresponder
    try {
      const autoResponders = await prisma.autoResponder.findMany({
        where: { guildId: message.guild.id, enabled: true },
      });

      const content = message.content.toLowerCase();
      for (const ar of autoResponders) {
        let matched = false;
        if (ar.matchType === 'EXACT' && content === ar.trigger.toLowerCase()) {
          matched = true;
        } else if (ar.matchType === 'CONTAINS' && content.includes(ar.trigger.toLowerCase())) {
          matched = true;
        }

        if (matched) {
          const reply = ar.response
            .replace(/{user}/g, `<@${message.author.id}>`)
            .replace(/{server}/g, message.guild.name);
          await message.channel.send({ content: reply });
          break;
        }
      }
    } catch {
      // Autoresponder fail-safe
    }

    // Custom Prefix Text Commands (Supports custom prefixes: !, @, #, $, ?, etc.)
    try {
      const settings = await prisma.guildSetting.findUnique({
        where: { guildId: message.guild.id },
      });
      const prefix = settings?.prefix || '!';

      if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        if (commandName) {
          // Check Custom Command first
          const customCmd = await prisma.customCommand.findUnique({
            where: { guildId_name: { guildId: message.guild.id, name: commandName } },
          });

          if (customCmd && customCmd.enabled) {
            const reply = customCmd.response
              .replace(/{user}/g, `<@${message.author.id}>`)
              .replace(/{server}/g, message.guild.name);
            await message.channel.send({ content: reply });
          } else if (commandName === 'help') {
            await message.reply({
              content: `🌟 **Yurei Help**: Use \`/help\` for full slash commands or \`${prefix}<command>\` for text commands!\nCustom Server Prefix: \`${prefix}\``,
            });
          } else if (commandName === 'ping') {
            await message.reply({ content: `🏓 Pong! WebSocket heartbeat: \`${client.ws.ping}ms\`` });
          }
        }
      }
    } catch {
      // Prefix command fail-safe
    }
  });

  // 5. Antinuke: Channel Delete / Create
  client.on(Events.ChannelDelete, async (channel) => {
    if (!('guild' in channel) || !channel.guild) return;
    const audit = await AntinukeEngine.fetchAuditActor(channel.guild, AuditLogEvent.ChannelDelete);
    if (audit?.executorId) {
      await AntinukeEngine.registerAction(channel.guild, audit.executorId, 'CHANNEL_DELETE');
    }
  });

  client.on(Events.ChannelCreate, async (channel) => {
    if (!('guild' in channel) || !channel.guild) return;
    const audit = await AntinukeEngine.fetchAuditActor(channel.guild, AuditLogEvent.ChannelCreate);
    if (audit?.executorId) {
      await AntinukeEngine.registerAction(channel.guild, audit.executorId, 'CHANNEL_CREATE');
    }
  });

  // 6. Antinuke: Role Delete / Create
  client.on(Events.GuildRoleDelete, async (role: Role) => {
    const audit = await AntinukeEngine.fetchAuditActor(role.guild, AuditLogEvent.RoleDelete);
    if (audit?.executorId) {
      await AntinukeEngine.registerAction(role.guild, audit.executorId, 'ROLE_DELETE');
    }
  });

  client.on(Events.GuildRoleCreate, async (role: Role) => {
    const audit = await AntinukeEngine.fetchAuditActor(role.guild, AuditLogEvent.RoleCreate);
    if (audit?.executorId) {
      await AntinukeEngine.registerAction(role.guild, audit.executorId, 'ROLE_CREATE');
    }
  });

  // 7. Antinuke: Member Ban Add
  client.on(Events.GuildBanAdd, async (ban: GuildBan) => {
    const audit = await AntinukeEngine.fetchAuditActor(ban.guild, AuditLogEvent.MemberBanAdd);
    if (audit?.executorId) {
      await AntinukeEngine.registerAction(ban.guild, audit.executorId, 'BAN');
    }
  });

  // 8. Join-To-Create (JTC) Temporary Voice Handler
  client.on(Events.VoiceStateUpdate, async (oldState: VoiceState, newState: VoiceState) => {
    const guild = newState.guild;

    if (newState.channelId && newState.channelId !== oldState.channelId) {
      const voiceConfig = await prisma.voiceConfig.findUnique({
        where: { guildId: guild.id },
      });

      if (voiceConfig && voiceConfig.hubChannelId === newState.channelId) {
        const member = newState.member;
        if (!member) return;

        const channelName = voiceConfig.namingTemplate.replace(/{user}/g, member.displayName);
        const tempVoice = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildVoice,
          parent: voiceConfig.categoryId || undefined,
          userLimit: voiceConfig.defaultLimit || 0,
        });

        await member.voice.setChannel(tempVoice).catch(() => null);

        await prisma.temporaryVoice.create({
          data: {
            guildId: guild.id,
            channelId: tempVoice.id,
            ownerId: member.id,
          },
        });
      }
    }

    if (oldState.channelId && oldState.channelId !== newState.channelId) {
      const tempEntry = await prisma.temporaryVoice.findUnique({
        where: { channelId: oldState.channelId },
      });

      if (tempEntry) {
        const oldChannel = oldState.channel;
        if (oldChannel && oldChannel.members.size === 0) {
          await oldChannel.delete('JTC empty channel auto-cleanup').catch(() => null);
          await prisma.temporaryVoice.delete({ where: { channelId: tempEntry.channelId } });
        }
      }
    }
  });
}
