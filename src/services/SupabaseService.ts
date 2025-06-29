import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IDatabaseService } from './IDatabaseService';
import { GuildConfig, Quiz, QuizResponse, UserScore } from '../types/Quiz';
import { logger } from '../utils/logger';

export class SupabaseService implements IDatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_ANON_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
    async getGuildConfig(guildId: string): Promise<GuildConfig | null> {
        try {
            const { data, error } = await this.supabase
                .from('guild_configs')
                .select('*')
                .eq('guild_id', guildId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // No matching record found
                }
                throw error;
            }

            return data as GuildConfig;
        } catch (error) {
            logger.error(`Failed to fetch guild config for guildId: ${guildId}`, error);
            throw error;
        }
    }

    async upsertGuildConfig(config: Partial<GuildConfig>): Promise<GuildConfig> {
        try {
            const { data, error } = await this.supabase
                .from('guild_configs')
                .upsert(config, { onConflict: 'guild_id' })
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data as GuildConfig;
        } catch (error) {
            logger.error(`Failed to upsert guild config: ${JSON.stringify(config)}`, error);
            throw error;
        }
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
      const { error } = await this.supabase.from('guild_configs').select('*').limit(1);
      if (error && error.code !== 'PGRST116') throw error;
      logger.info('Supabase connection established');
    } catch (error) {
      logger.error('Failed to connect to Supabase:', error);
      throw error;
    }
  }

  // Implement other methods from IDatabaseService...
}