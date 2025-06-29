import { GuildConfig, Quiz, QuizResponse, UserScore } from '../types/Quiz';

export interface IDatabaseService {
  initialize(): Promise<void>;
  getGuildConfig(guildId: string): Promise<GuildConfig | null>;
  upsertGuildConfig(config: Partial<GuildConfig>): Promise<GuildConfig>;
  getActiveGuilds(): Promise<GuildConfig[]>;
  getRandomQuiz(): Promise<Quiz | null>;
  createQuiz(quiz: Omit<Quiz, 'id' | 'created_at'>): Promise<Quiz>;
  recordQuizResponse(response: Omit<QuizResponse, 'id' | 'created_at'>): Promise<QuizResponse>;
  getQuizResponses(quizId: string, guildId: string): Promise<QuizResponse[]>;
  getUserScore(userId: string, guildId: string): Promise<UserScore | null>;
  updateUserScore(userId: string, guildId: string, isCorrect: boolean): Promise<UserScore>;
  getLeaderboard(guildId: string, limit?: number): Promise<UserScore[]>;
}