import { MisanCommand, YureiCommand } from '@misan/types';

// Security & Antiraid
import { AntinukeCommand } from './security/antinuke';
import { AntiraidCommand } from './antiraid/antiraid';
import { VerificationCommand } from './antiraid/verification';

// Moderation
import { BanCommand, KickCommand, TimeoutCommand } from './moderation/modActions';
import { PurgeCommand, LockCommand, UnlockCommand } from './moderation/purge';
import { WarnCommand, WarningsCommand, CaseCommand } from './moderation/cases';

// Automod
import { AutomodCommand } from './automod/automod';

// Logging
import { LoggingCommand } from './logging/logging';

// Tickets
import { TicketCommand } from './tickets/ticket';

// Giveaways
import { GiveawayCommand } from './giveaways/giveaway';

// Welcomer
import { WelcomeCommand } from './welcome/welcome';

// Roles
import { AutoroleCommand } from './roles/autorole';
import { RoleCommand } from './roles/role';

// JTC Voice
import { JtcCommand } from './jtc/jtc';

// Automation
import { AutoresponderCommand } from './automation/autoresponder';
import { CustomcommandCommand } from './automation/customcommand';

// Embeds
import { EmbedCommand } from './embeds/embed';

// Server & User
import { ServerinfoCommand } from './server/serverinfo';
import { ServerbackupCommand } from './server/serverbackup';
import { UserinfoCommand, AvatarCommand } from './user/userinfo';

// Utility
import { HelpCommand } from './utility/help';
import { PingCommand, StatsCommand, AfkCommand, ReminderCommand } from './utility/utility';

// Music
import { PlayCommand, StopCommand, FilterCommand } from './music/music';

// Fun
import { EightBallCommand, CoinflipCommand, ShipCommand } from './fun/fun';

// Premium
import { PremiumCommand } from './premium/premium';
import { VanityCommand } from './premium/vanity';

export const ALL_COMMANDS: YureiCommand[] = [
  // Security & Antinuke
  AntinukeCommand,
  AntiraidCommand,
  VerificationCommand,

  // Moderation
  BanCommand,
  KickCommand,
  TimeoutCommand,
  PurgeCommand,
  LockCommand,
  UnlockCommand,
  WarnCommand,
  WarningsCommand,
  CaseCommand,

  // Automod
  AutomodCommand,

  // Logging
  LoggingCommand,

  // Tickets
  TicketCommand,

  // Giveaways
  GiveawayCommand,

  // Welcomer
  WelcomeCommand,

  // Roles
  AutoroleCommand,
  RoleCommand,

  // JTC Voice
  JtcCommand,

  // Automation
  AutoresponderCommand,
  CustomcommandCommand,

  // Embeds
  EmbedCommand,

  // Server & User
  ServerinfoCommand,
  ServerbackupCommand,
  UserinfoCommand,
  AvatarCommand,

  // Utility
  HelpCommand,
  PingCommand,
  StatsCommand,
  AfkCommand,
  ReminderCommand,

  // Music
  PlayCommand,
  StopCommand,
  FilterCommand,

  // Fun
  EightBallCommand,
  CoinflipCommand,
  ShipCommand,

  // Premium & Administration
  PremiumCommand,
  VanityCommand,
];
