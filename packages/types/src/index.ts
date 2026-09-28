import {
  ChatInputCommandInteraction,
  PermissionResolvable,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  AutocompleteInteraction,
  Client,
  Guild,
  GuildMember,
  TextBasedChannel,
  User,
} from 'discord.js';

export type PlanType = 'FREE' | 'USER_PREMIUM' | 'SERVER_PREMIUM' | 'GLOBAL_PREMIUM';
export type PremiumScope = 'USER' | 'SERVER' | 'GLOBAL';

export type CommandCategory =
  | 'Security'
  | 'Moderation'
  | 'AutoMod'
  | 'Logging'
  | 'Tickets'
  | 'Giveaways'
  | 'Welcomer'
  | 'Roles'
  | 'Voice'
  | 'AutoResponder'
  | 'Embeds'
  | 'Server'
  | 'User'
  | 'Utility'
  | 'Music'
  | 'Fun'
  | 'Premium'
  | 'Owner';

export interface CommandContext {
  interaction: ChatInputCommandInteraction;
  client: Client;
  guild: Guild | null;
  member: GuildMember | null;
  user: User;
  channel: TextBasedChannel | null;
}

export interface MisanCommand {
  name: string;
  description: string;
  category: CommandCategory;
  usage?: string;
  examples?: string[];
  userPermissions?: PermissionResolvable[];
  botPermissions?: PermissionResolvable[];
  cooldown?: number; // In seconds
  premiumOnly?: boolean;
  requiredPlan?: PlanType;
  ownerOnly?: boolean;
  guildOnly?: boolean;
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (context: CommandContext) => Promise<unknown>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export type YureiCommand = MisanCommand;
export type ZenithCommand = MisanCommand;


export interface EntitlementCheckResult {
  allowed: boolean;
  currentPlan: PlanType;
  requiredPlan?: PlanType;
  currentUsage?: number;
  limit?: number;
  reason?: string;
}

export interface FeatureEntitlementDefinition {
  featureKey: string;
  name: string;
  description: string;
  scope: PremiumScope;
  freeLimit: number;
  premiumLimit: number;
  requiredPlan: PlanType;
}

export type ModerationAction =
  | 'BAN'
  | 'SOFTBAN'
  | 'UNBAN'
  | 'KICK'
  | 'TIMEOUT'
  | 'UNTIMEOUT'
  | 'WARN'
  | 'UNWARN'
  | 'MUTE'
  | 'UNMUTE'
  | 'PURGE'
  | 'LOCK'
  | 'UNLOCK'
  | 'NICKNAME';

export interface AntinukeRuleThreshold {
  actionType: string;
  threshold: number;
  timeWindowSeconds: number;
  punishment: 'BAN' | 'KICK' | 'STRIP_ROLES' | 'TIMEOUT';
}

export interface TicketPanelConfig {
  id: string;
  guildId: string;
  channelId: string;
  title: string;
  description: string;
  categoryName?: string;
  categoryId?: string;
  supportRoleId?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
