import {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { logger } from '@misan/logger';

export class MisanClient extends Client {
  public commands: Collection<string, MisanCommand> = new Collection();
  public cooldowns: Collection<string, Collection<string, number>> = new Collection();
  public bootTimestamp: number = Date.now();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction,
      ],
      allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: false,
      },
      ws: {
        properties: {
          browser: 'Discord iOS',
          device: 'Discord iOS',
          os: 'iOS',
        },
      } as any,
    });

    this.on('error', (err) => {
      logger.error('Discord Client encountered an unexpected error', { error: err });
    });

    this.on('warn', (warning) => {
      logger.warn(`Discord Client Warning: ${warning}`);
    });
  }
}
