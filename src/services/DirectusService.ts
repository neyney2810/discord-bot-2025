import { IDatabaseService } from './IDatabaseService';
import { GuildConfig, Quiz, QuizResponse, UserScore } from '../types/Quiz';
import { logger } from '../utils/logger';
import { createDirectus, DirectusClient, rest } from '@directus/sdk';

export class DirectusService implements IDatabaseService {
  private directus: DirectusClient<any>;

  constructor() {
    const directusUrl = process.env.DIRECTUS_URL!;
    this.directus = createDirectus(directusUrl).with(rest());
  }
    getGuildConfig(guildId: string): Promise<GuildConfig | null> {
        throw new Error('Method not implemented.');
    }
    upsertGuildConfig(config: Partial<GuildConfig>): Promise<GuildConfig> {
        throw new Error('Method not implemented.');
    }
    getActiveGuilds(): Promise<GuildConfig[]> {
        throw new Error('Method not implemented.');
    }
    getRandomQuiz(): Promise<Quiz | null> {
        throw new Error('Method not implemented.');
    }
    createQuiz(quiz: Omit<Quiz, 'id' | 'created_at'>): Promise<Quiz> {
        throw new Error('Method not implemented.');
    }
    recordQuizResponse(response: Omit<QuizResponse, 'id' | 'created_at'>): Promise<QuizResponse> {
        throw new Error('Method not implemented.');
    }
    getQuizResponses(quizId: string, guildId: string): Promise<QuizResponse[]> {
        throw new Error('Method not implemented.');
    }
    getUserScore(userId: string, guildId: string): Promise<UserScore | null> {
        throw new Error('Method not implemented.');
    }
    updateUserScore(userId: string, guildId: string, isCorrect: boolean): Promise<UserScore> {
        throw new Error('Method not implemented.');
    }
    getLeaderboard(guildId: string, limit?: number): Promise<UserScore[]> {
        throw new Error('Method not implemented.');
    }

  public async initialize(): Promise<void> {
    try {
    //   await this.directus.auth.static(process.env.DIRECTUS_STATIC_TOKEN!);
      logger.info('Directus connection established');
    } catch (error) {
      logger.error('Failed to connect to Directus:', error);
      throw error;
    }
  }
}