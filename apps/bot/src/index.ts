import { MisanClient } from './client/MisanClient';
import { ALL_COMMANDS } from './commands';
import { registerEventHandlers } from './handlers/eventHandler';
import { connectDatabase } from '@misan/database';
import { BOT_CONFIG } from '@misan/config';
import { logger } from '@misan/logger';

async function bootstrap() {
  logger.info(`Starting ${BOT_CONFIG.name} Bot Platform (Developed by ${BOT_CONFIG.developer})...`, {
    module: 'Bootstrap',
  });

  // 1. Connect to PostgreSQL via Prisma
  const dbConnected = await connectDatabase();
  if (!dbConnected) {
    logger.warn('Proceeding with in-memory fallback until database credentials are provided.');
  }

  // 2. Initialize Discord Client
  const client = new MisanClient();

  // 3. Register All Commands
  for (const cmd of ALL_COMMANDS) {
    client.commands.set(cmd.name, cmd);
  }
  logger.info(`Loaded ${client.commands.size} command modules into memory.`, { module: 'Commands' });

  // 4. Register Gateway Event Handlers
  registerEventHandlers(client);

  // 5. Connect to Discord Gateway
  if (!BOT_CONFIG.token) {
    logger.error('No DISCORD_TOKEN provided in environment! Please configure .env', {
      module: 'Bootstrap',
    });
    return;
  }

  await client.login(BOT_CONFIG.token);
}

bootstrap().catch((err) => {
  logger.fatal('Fatal exception during bootstrap process', { error: err });
  process.exit(1);
});
