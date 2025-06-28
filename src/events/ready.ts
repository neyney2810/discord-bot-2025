import { Client, Events } from 'discord.js';
import { logger } from '../utils/logger';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: Client) {
  logger.info(`Ready! Logged in as ${client.user?.tag}`);
  logger.info(`Bot is active in ${client.guilds.cache.size} guilds`);
  
  // Set bot status
  client.user?.setActivity('daily quizzes!', { type: 3 }); // Type 3 = Watching
}