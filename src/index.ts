import { config } from 'dotenv';
config(); // Load environment variables

import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { logger } from './utils/logger';
import { QuizScheduler } from './services/QuizScheduler';
import { loadCommands } from './utils/commandLoader';
import { loadEvents } from './utils/eventLoader';
import { Command } from './types/Command';
import { DatabaseService } from './services/DatabaseService';

class QuizBot {
  public client: Client;
  public commands: Collection<string, Command>;
  public databaseService: DatabaseService;
  public quizScheduler: QuizScheduler;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
      ]
    });

    this.commands = new Collection();
    this.databaseService = new DatabaseService();
    this.quizScheduler = new QuizScheduler(this.client, this.databaseService);
  }

  public async start(): Promise<void> {
    try {
      await this.databaseService.initialize();
      logger.info('Database initialized successfully');

      await loadCommands(this.client, this.commands);
      await loadEvents(this.client, this.databaseService);

      await this.client.login(process.env.DISCORD_TOKEN);
      logger.info('Bot logged in successfully');

      this.quizScheduler.start();
      logger.info('Quiz scheduler started');
    } catch (error) {
      logger.error('Failed to start bot:', error);
      process.exit(1);
    }
  }
}

const bot = new QuizBot();
bot.start();

process.on('SIGINT', () => {
  logger.info('Shutting down bot...');
  bot.client.destroy();
  process.exit(0);
});