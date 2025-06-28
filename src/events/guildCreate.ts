import { Events, Guild } from 'discord.js';
import { logger } from '../utils/logger';

export const name = Events.GuildCreate;

export async function execute(guild: Guild) {
  logger.info(`Joined new guild: ${guild.name} (${guild.id})`);
  
  // Send welcome message to system channel if it exists
  if (guild.systemChannel) {
    try {
      await guild.systemChannel.send({
        content: `🎉 Thanks for adding Quiz Bot to **${guild.name}**!\n\n` +
                `To get started:\n` +
                `1. Use \`/registerchannel\` to set up daily quizzes\n` +
                `2. Use \`/startquiz\` to try a quiz right now\n` +
                `3. Use \`/leaderboard\` to see the top players\n\n` +
                `Need help? Contact the bot administrator!`
      });
    } catch (error) {
      logger.error('Failed to send welcome message:', error);
    }
  }
}