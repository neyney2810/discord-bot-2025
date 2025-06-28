/*
  # Create Quiz Bot Database Schema

  1. New Tables
    - `quizzes`
      - `id` (uuid, primary key)
      - `question` (text)
      - `type` (text: 'multiple_choice' or 'yes_no')
      - `options` (text array, for multiple choice)
      - `correct_answer` (text)
      - `explanation` (text, optional)
      - `difficulty` (text: 'easy', 'medium', 'hard')
      - `category` (text)
      - `created_at` (timestamp)

    - `guild_configs`
      - `guild_id` (text, primary key)
      - `quiz_channel_id` (text, optional)
      - `timezone` (text, default 'UTC')
      - `quiz_time_hour` (integer, default 9)
      - `quiz_time_minute` (integer, default 0)
      - `is_active` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `quiz_responses`
      - `id` (uuid, primary key)
      - `quiz_id` (uuid, foreign key)
      - `user_id` (text)
      - `guild_id` (text)
      - `answer` (text)
      - `is_correct` (boolean)
      - `response_time` (integer, in seconds)
      - `created_at` (timestamp)

    - `user_scores`
      - `user_id` (text)
      - `guild_id` (text)
      - `total_score` (integer, default 0)
      - `correct_answers` (integer, default 0)
      - `total_answers` (integer, default 0)
      - `streak` (integer, default 0)
      - `best_streak` (integer, default 0)
      - `updated_at` (timestamp)
      - Primary key: (user_id, guild_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access where appropriate
*/

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  type text NOT NULL CHECK (type IN ('multiple_choice', 'yes_no')),
  options text[],
  correct_answer text NOT NULL,
  explanation text,
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Create guild_configs table
CREATE TABLE IF NOT EXISTS guild_configs (
  guild_id text PRIMARY KEY,
  quiz_channel_id text,
  timezone text NOT NULL DEFAULT 'UTC',
  quiz_time_hour integer NOT NULL DEFAULT 9 CHECK (quiz_time_hour >= 0 AND quiz_time_hour <= 23),
  quiz_time_minute integer NOT NULL DEFAULT 0 CHECK (quiz_time_minute >= 0 AND quiz_time_minute <= 59),
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quiz_responses table
CREATE TABLE IF NOT EXISTS quiz_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  guild_id text NOT NULL,
  answer text NOT NULL,
  is_correct boolean NOT NULL,
  response_time integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_scores table
CREATE TABLE IF NOT EXISTS user_scores (
  user_id text NOT NULL,
  guild_id text NOT NULL,
  total_score integer NOT NULL DEFAULT 0,
  correct_answers integer NOT NULL DEFAULT 0,
  total_answers integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, guild_id)
);

-- Enable Row Level Security
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_responses_quiz_guild ON quiz_responses(quiz_id, guild_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_user_guild ON quiz_responses(user_id, guild_id);
CREATE INDEX IF NOT EXISTS idx_user_scores_guild ON user_scores(guild_id);
CREATE INDEX IF NOT EXISTS idx_user_scores_score ON user_scores(guild_id, total_score DESC);
CREATE INDEX IF NOT EXISTS idx_guild_configs_active ON guild_configs(is_active) WHERE is_active = true;

-- Insert sample quizzes
INSERT INTO quizzes (question, type, options, correct_answer, explanation, difficulty, category) VALUES
('What is the capital of France?', 'multiple_choice', ARRAY['London', 'Berlin', 'Paris', 'Madrid'], 'c', 'Paris is the capital and most populous city of France.', 'easy', 'Geography'),
('Is the Earth flat?', 'yes_no', NULL, 'no', 'The Earth is an oblate spheroid, not flat. This has been scientifically proven through various methods.', 'easy', 'Science'),
('What is 2 + 2?', 'multiple_choice', ARRAY['3', '4', '5', '6'], 'b', 'Basic addition: 2 + 2 = 4', 'easy', 'Mathematics'),
('Did humans land on the moon?', 'yes_no', NULL, 'yes', 'Yes, NASA''s Apollo missions successfully landed humans on the moon multiple times between 1969-1972.', 'medium', 'History'),
('What is the largest planet in our solar system?', 'multiple_choice', ARRAY['Earth', 'Mars', 'Jupiter', 'Saturn'], 'c', 'Jupiter is the largest planet in our solar system, with a mass greater than all other planets combined.', 'medium', 'Science');