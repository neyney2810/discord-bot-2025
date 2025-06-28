import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from 'dotenv';
import { logger } from './utils/logger';
import { DatabaseService } from './services/DatabaseService';
import { QuizScheduler } from './services/QuizScheduler';
import { loadCommands } from './utils/commandLoader';
import { loadEvents } from './utils/eventLoader';
import { Command } from './types/Command';

// Load environment variables
config();

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
      // Initialize database
      await this.databaseService.initialize();
      logger.info('Database initialized successfully');

      // Load commands and events
      await loadCommands(this.client, this.commands);
      await loadEvents(this.client, this.databaseService);
      
      // Login to Discord
      await this.client.login(process.env.DISCORD_TOKEN);
      logger.info('Bot logged in successfully');

      // Start quiz scheduler
      this.quizScheduler.start();
      logger.info('Quiz scheduler started');

    } catch (error) {
      logger.error('Failed to start bot:', error);
      process.exit(1);
    }
  }
}

// Start the bot
const bot = new QuizBot();
bot.start();

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down bot...');
  bot.client.destroy();
  process.exit(0);
});