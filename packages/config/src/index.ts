import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export * from './plans';

export const BOT_CONFIG = {
  name: process.env.BOT_NAME || 'Yurei',
  developer: 'Misan',
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.DISCORD_CLIENT_ID || '1550514533208952894',
  clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  publicKey: process.env.DISCORD_PUBLIC_KEY || '5c14ae59341a96d6307a0529590c71b502529a52cc4b612d597f9a49a4b3a6f2',
  prefix: process.env.DEFAULT_PREFIX || '!',
  ownerIds: Array.from(
    new Set([
      '1354252509010722817',
      ...(process.env.OWNER_IDS || '').split(','),
      process.env.BOT_OWNER_ID || '',
    ])
  )
    .map((id) => id.trim())
    .filter(Boolean),
  supportServerId: process.env.SUPPORT_SERVER_ID || '',
  supportInviteUrl: process.env.SUPPORT_INVITE_URL || 'https://discord.gg/M4P4Qrt6G5',
  dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:4000',

  colors: {
    primary: parseInt((process.env.EMBED_COLOR || '#6366F1').replace('#', ''), 16),
    success: parseInt((process.env.EMBED_SUCCESS_COLOR || '#10B981').replace('#', ''), 16),
    error: parseInt((process.env.EMBED_ERROR_COLOR || '#EF4444').replace('#', ''), 16),
    warning: parseInt((process.env.EMBED_WARNING_COLOR || '#F59E0B').replace('#', ''), 16),
  },

  footerText: process.env.FOOTER_TEXT || 'Yurei • Developed by Misan • All-in-One Discord Platform',
  logLevel: process.env.LOG_LEVEL || 'info',
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
};
