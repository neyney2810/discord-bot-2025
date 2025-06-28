import { Client, Collection, REST, Routes } from 'discord.js';
import { Command } from '../types/Command';
import { logger } from './logger';

// Import all commands
import { leaderboard } from '../commands/leaderboard';
import { registerchannel } from '../commands/registerchannel';
import { unregisterchannel } from '../commands/unregisterchannel';
import { startquiz } from '../commands/startquiz';
import { mystats } from '../commands/mystats';

const commands = [
  leaderboard,
  registerchannel,
  unregisterchannel,
  startquiz,
  mystats
];

export async function loadCommands(client: Client, commandCollection: Collection<string, Command>): Promise<void> {
  const commandData = [];

  for (const command of commands) {
    commandCollection.set(command.data.name, command);
    commandData.push(command.data.toJSON());
  }

  // Register slash commands
  const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

  try {
    logger.info('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
      { body: commandData }
    );

    logger.info('Successfully reloaded application (/) commands.');
  } catch (error) {
    logger.error('Error refreshing application (/) commands:', error);
  }
}