import { FeatureEntitlementDefinition } from '@misan/types';

export interface PlanLimits {
  autoresponders: number;
  customCommands: number;
  ticketPanels: number;
  concurrentGiveaways: number;
  jtcHubs: number;
  logChannels: number;
  backupSlots: number;
  analyticsHistoryDays: number;
  starboards: number;
  reminders: number;
  scheduledMessages: number;
  musicQueueLimit: number;
  customEmbedTemplates: number;
  welcomeProfiles: number;
  reactionRoleMenus: number;
}

export const PLAN_LIMITS: Record<'FREE' | 'PREMIUM', PlanLimits> = {
  FREE: {
    autoresponders: 5,
    customCommands: 3,
    ticketPanels: 2,
    concurrentGiveaways: 1,
    jtcHubs: 1,
    logChannels: 2,
    backupSlots: 1,
    analyticsHistoryDays: 7,
    starboards: 1,
    reminders: 3,
    scheduledMessages: 1,
    musicQueueLimit: 50,
    customEmbedTemplates: 2,
    welcomeProfiles: 1,
    reactionRoleMenus: 2,
  },
  PREMIUM: {
    autoresponders: 100,
    customCommands: 50,
    ticketPanels: 25,
    concurrentGiveaways: 20,
    jtcHubs: 10,
    logChannels: 20,
    backupSlots: 15,
    analyticsHistoryDays: 90,
    starboards: 10,
    reminders: 50,
    scheduledMessages: 25,
    musicQueueLimit: 1000,
    customEmbedTemplates: 50,
    welcomeProfiles: 10,
    reactionRoleMenus: 25,
  },
};

export const FEATURE_REGISTRY: Record<string, FeatureEntitlementDefinition> = {
  'antinuke.advanced': {
    featureKey: 'antinuke.advanced',
    name: 'Advanced Anti-Nuke Suite',
    description: 'Custom sliding-window thresholds, instant snapshot recovery, and actor containment.',
    scope: 'SERVER',
    freeLimit: 0,
    premiumLimit: 1,
    requiredPlan: 'SERVER_PREMIUM',
  },
  'antiraid.advanced': {
    featureKey: 'antiraid.advanced',
    name: 'Advanced Anti-Raid Filter',
    description: 'Deep account age verification, captcha join gate, and autonomous lockdown.',
    scope: 'SERVER',
    freeLimit: 0,
    premiumLimit: 1,
    requiredPlan: 'SERVER_PREMIUM',
  },
  'tickets.advanced': {
    featureKey: 'tickets.advanced',
    name: 'Advanced Ticket Features',
    description: 'Custom modal forms, HTML transcripts, and auto-closing.',
    scope: 'SERVER',
    freeLimit: 0,
    premiumLimit: 1,
    requiredPlan: 'SERVER_PREMIUM',
  },
  'giveaways.advanced': {
    featureKey: 'giveaways.advanced',
    name: 'Advanced Giveaway Rules',
    description: 'Role requirements, account-age gates, and weighted entries.',
    scope: 'SERVER',
    freeLimit: 0,
    premiumLimit: 1,
    requiredPlan: 'SERVER_PREMIUM',
  },
  'server.backup': {
    featureKey: 'server.backup',
    name: 'Server Backup & Restore',
    description: 'Complete role, channel, and permission snapshot creation and safe restoration.',
    scope: 'SERVER',
    freeLimit: 0,
    premiumLimit: 1,
    requiredPlan: 'SERVER_PREMIUM',
  },
  'music.247': {
    featureKey: 'music.247',
    name: 'Music 24/7 Mode',
    description: 'Keep Yurei inside your voice channel indefinitely without disconnecting.',
    scope: 'SERVER',
    freeLimit: 0,
    premiumLimit: 1,
    requiredPlan: 'SERVER_PREMIUM',
  },
  'music.filters': {
    featureKey: 'music.filters',
    name: 'Advanced Audio Filters',
    description: 'Access to 8D, Bassboost, Nightcore, Vaporwave, and audio distortion engines.',
    scope: 'SERVER',
    freeLimit: 0,
    premiumLimit: 1,
    requiredPlan: 'SERVER_PREMIUM',
  },
};
