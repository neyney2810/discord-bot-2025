import { Client } from 'discord.js';
import cron from 'node-cron';
import moment from 'moment-timezone';
import { DatabaseService } from '../services/DatabaseService';
import { QuizService } from './QuizService';
import { logger } from '../utils/logger';

export class QuizScheduler {
  private client: Client;
  private databaseService: DatabaseService;
  private quizService: QuizService;

  constructor(client: Client, databaseService: DatabaseService) {
    this.client = client;
    this.databaseService = databaseService;
    this.quizService = new QuizService(client, databaseService);
  }

  public start(): void {
    // Run every minute to check for scheduled quizzes
    cron.schedule('* * * * *', async () => {
      await this.checkScheduledQuizzes();
    });

    logger.info('Quiz scheduler started - checking every minute');
  }

  private async checkScheduledQuizzes(): Promise<void> {
    try {
      const activeGuilds = await this.databaseService.getActiveGuilds();
      
      for (const guildConfig of activeGuilds) {
        const now = moment().tz(guildConfig.timezone);
        const hour = now.hour();
        const minute = now.minute();

        if (hour === guildConfig.quiz_time_hour && minute === guildConfig.quiz_time_minute) {
          await this.sendScheduledQuiz(guildConfig.guild_id, guildConfig.quiz_channel_id!);
        }
      }
    } catch (error) {
      logger.error('Error checking scheduled quizzes:', error);
    }
  }

  private async sendScheduledQuiz(guildId: string, channelId: string): Promise<void> {
    try {
      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) {
        logger.warn(`Guild ${guildId} not found`);
        return;
      }

      const channel = guild.channels.cache.get(channelId);
      if (!channel || !channel.isTextBased()) {
        logger.warn(`Quiz channel ${channelId} not found or not text-based`);
        return;
      }

      await this.quizService.sendDailyQuiz(channel);
      logger.info(`Daily quiz sent to guild ${guildId}, channel ${channelId}`);
    } catch (error) {
      logger.error(`Error sending scheduled quiz to guild ${guildId}:`, error);
    }
  }
}