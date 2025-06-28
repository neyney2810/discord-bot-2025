export interface Quiz {
  id: string;
  question: string;
  type: 'multiple_choice' | 'yes_no';
  options?: string[];
  correct_answer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  created_at: Date;
}

export interface QuizResponse {
  id: string;
  quiz_id: string;
  user_id: string;
  guild_id: string;
  answer: string;
  is_correct: boolean;
  response_time: number;
  created_at: Date;
}

export interface UserScore {
  user_id: string;
  guild_id: string;
  total_score: number;
  correct_answers: number;
  total_answers: number;
  streak: number;
  best_streak: number;
  updated_at: Date;
}

export interface GuildConfig {
  guild_id: string;
  quiz_channel_id?: string;
  timezone: string;
  quiz_time_hour: number;
  quiz_time_minute: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}