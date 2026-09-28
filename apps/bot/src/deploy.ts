import { REST, Routes } from 'discord.js';
import { ALL_COMMANDS } from './commands';
import { BOT_CONFIG } from '@misan/config';
import { logger } from '@misan/logger';

async function deploySlashCommands() {
  if (!BOT_CONFIG.token || !BOT_CONFIG.clientId) {
    logger.error('Cannot deploy slash commands: DISCORD_TOKEN or DISCORD_CLIENT_ID missing in .env');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(BOT_CONFIG.token);
  const commandData = ALL_COMMANDS.map((cmd) => cmd.data.toJSON());

  logger.info(`Deploying ${commandData.length} global application (/) commands to Discord REST API...`);

  try {
    await rest.put(Routes.applicationCommands(BOT_CONFIG.clientId), {
      body: commandData,
    });
    logger.info(`Successfully registered ${commandData.length} global slash commands!`);
  } catch (error) {
    logger.error('Failed to deploy application commands', { error });
  }
}

deploySlashCommands();
