import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { Quiz, QuizResponse, UserScore, GuildConfig } from '../types/Quiz';

export class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_ANON_KEY!;
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  public async initialize(): Promise<void> {
    try {
      // Test connection
      const { error } = await this.supabase.from('guild_configs').select('*').limit(1);
      if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist"
        throw error;
      }
      logger.info('Database connection established');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  // Guild Configuration Methods
  public async getGuildConfig(guildId: string): Promise<GuildConfig | null> {
    const { data, error } = await this.supabase
      .from('guild_configs')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      logger.error('Error fetching guild config:', error);
      throw error;
    }

    return data;
  }

  public async upsertGuildConfig(config: Partial<GuildConfig>): Promise<GuildConfig> {
    const { data, error } = await this.supabase
      .from('guild_configs')
      .upsert(config)
      .select()
      .single();

    if (error) {
      logger.error('Error upserting guild config:', error);
      throw error;
    }

    return data;
  }

  public async getActiveGuilds(): Promise<GuildConfig[]> {
    const { data, error } = await this.supabase
      .from('guild_configs')
      .select('*')
      .eq('is_active', true)
      .not('quiz_channel_id', 'is', null);

    if (error) {
      logger.error('Error fetching active guilds:', error);
      throw error;
    }

    return data || [];
  }

  // Quiz Methods
  public async getRandomQuiz(): Promise<Quiz | null> {
    const { data, error } = await this.supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      logger.error('Error fetching random quiz:', error);
      throw error;
    }

    return data?.[0] || null;
  }

  public async createQuiz(quiz: Omit<Quiz, 'id' | 'created_at'>): Promise<Quiz> {
    const { data, error } = await this.supabase
      .from('quizzes')
      .insert(quiz)
      .select()
      .single();

    if (error) {
      logger.error('Error creating quiz:', error);
      throw error;
    }

    return data;
  }

  // Quiz Response Methods
  public async recordQuizResponse(response: Omit<QuizResponse, 'id' | 'created_at'>): Promise<QuizResponse> {
    const { data, error } = await this.supabase
      .from('quiz_responses')
      .insert(response)
      .select()
      .single();

    if (error) {
      logger.error('Error recording quiz response:', error);
      throw error;
    }

    return data;
  }

  public async getQuizResponses(quizId: string, guildId: string): Promise<QuizResponse[]> {
    const { data, error } = await this.supabase
      .from('quiz_responses')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('guild_id', guildId);

    if (error) {
      logger.error('Error fetching quiz responses:', error);
      throw error;
    }

    return data || [];
  }

  // User Score Methods
  public async getUserScore(userId: string, guildId: string): Promise<UserScore | null> {
    const { data, error } = await this.supabase
      .from('user_scores')
      .select('*')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      logger.error('Error fetching user score:', error);
      throw error;
    }

    return data;
  }

  public async updateUserScore(userId: string, guildId: string, isCorrect: boolean): Promise<UserScore> {
    const currentScore = await this.getUserScore(userId, guildId);
    
    const updatedScore = {
      user_id: userId,
      guild_id: guildId,
      total_score: (currentScore?.total_score || 0) + (isCorrect ? 1 : 0),
      correct_answers: (currentScore?.correct_answers || 0) + (isCorrect ? 1 : 0),
      total_answers: (currentScore?.total_answers || 0) + 1,
      streak: isCorrect ? (currentScore?.streak || 0) + 1 : 0,
      best_streak: Math.max(
        currentScore?.best_streak || 0,
        isCorrect ? (currentScore?.streak || 0) + 1 : 0
      ),
      updated_at: new Date()
    };

    const { data, error } = await this.supabase
      .from('user_scores')
      .upsert(updatedScore)
      .select()
      .single();

    if (error) {
      logger.error('Error updating user score:', error);
      throw error;
    }

    return data;
  }

  public async getLeaderboard(guildId: string, limit: number = 10): Promise<UserScore[]> {
    const { data, error } = await this.supabase
      .from('user_scores')
      .select('*')
      .eq('guild_id', guildId)
      .order('total_score', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching leaderboard:', error);
      throw error;
    }

    return data || [];
  }
}