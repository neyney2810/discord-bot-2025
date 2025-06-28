# Discord Quiz Bot

A comprehensive Discord bot built with discord.js v14 and TypeScript that provides daily automated quizzes with leaderboards and multi-server support.

## Features

### 🎯 Core Functionality
- **Daily Automated Quizzes**: Automatically sends quizzes at scheduled times (default: 9 AM)
- **Interactive Quiz Interface**: Uses Discord buttons for user-friendly quiz participation
- **Multi-Server Support**: Each Discord server has its own configuration and leaderboards
- **Real-time Scoring**: Automatic score tracking and leaderboard updates
- **Multiple Quiz Types**: Support for both multiple choice and yes/no questions

### 📊 Statistics & Leaderboards  
- **Server Leaderboards**: View top performers with `/leaderboard`
- **Personal Statistics**: Check individual stats with `/mystats`
- **Streak Tracking**: Keep track of correct answer streaks
- **Accuracy Metrics**: Detailed performance analytics

### 🛠️ Administration
- **Channel Registration**: Admins can set quiz channels with `/registerchannel`
- **Timezone Support**: Configure quiz times for different timezones
- **Manual Quiz Triggers**: Start quizzes immediately with `/startquiz`
- **Easy Channel Management**: Enable/disable quiz channels as needed

## Technology Stack

- **Discord.js v14** - Latest Discord API interactions
- **TypeScript** - Type-safe development
- **PostgreSQL with Supabase** - Robust database with real-time capabilities
- **Node-cron** - Reliable task scheduling
- **Winston** - Comprehensive logging system

## Prerequisites

Before setting up the bot, you'll need:

1. **Discord Bot Token**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application and bot
   - Copy the bot token

2. **Supabase Account**
   - Sign up at [Supabase](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key

## Installation & Setup

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your `.env` file:
   ```env
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CLIENT_ID=your_discord_client_id
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   NODE_ENV=development
   QUIZ_TIME_HOUR=9
   QUIZ_TIME_MINUTE=0
   QUIZ_TIMEOUT_MINUTES=5
   ```

3. **Database Setup**
   - The migration file will automatically create all necessary tables
   - Sample quiz questions are included for testing

4. **Build and Run**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## Bot Commands

### User Commands
- `/leaderboard [limit]` - View server leaderboard (default: top 10)
- `/mystats` - View your personal quiz statistics
- `/startquiz` - Start a quiz immediately (requires Manage Messages permission)

### Admin Commands (Requires Administrator permission)
- `/registerchannel <channel> [timezone] [hour] [minute]` - Register a channel for daily quizzes
- `/unregisterchannel` - Disable daily quizzes for the server

## Database Schema

The bot uses four main tables:

### `quizzes`
- Stores quiz questions, answers, and metadata
- Supports multiple choice and yes/no formats
- Includes difficulty levels and categories

### `guild_configs`
- Server-specific configurations
- Quiz channel settings and schedules
- Timezone and timing preferences

### `quiz_responses`
- Individual user responses to quizzes
- Tracks correctness and response times
- Links users, guilds, and specific quizzes

### `user_scores`
- Aggregated user statistics per server
- Tracks total scores, accuracy, and streaks
- Optimized for leaderboard queries

## Architecture

The bot follows a modular architecture:

```
src/
├── commands/          # Slash command implementations
├── events/           # Discord event handlers
├── services/         # Business logic (Quiz, Database, Scheduler)
├── types/           # TypeScript type definitions
└── utils/           # Helper functions and utilities
```

### Key Services

- **DatabaseService**: Handles all database operations with proper error handling
- **QuizService**: Manages quiz creation, distribution, and response handling
- **QuizScheduler**: Handles automated daily quiz scheduling using cron jobs

## Deployment

### Development
```bash
npm run dev
```

### Production
1. Set `NODE_ENV=production` in your environment
2. Build the project: `npm run build`
3. Start the bot: `npm start`

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

## Security Features

- **Row Level Security (RLS)** enabled on all database tables
- **Permission checks** for administrative commands
- **Input validation** for all user inputs
- **Rate limiting** compliance with Discord API limits
- **Secure token management** through environment variables

## Adding Custom Quizzes

Insert new quizzes directly into the database:

```sql
INSERT INTO quizzes (question, type, options, correct_answer, explanation, difficulty, category) 
VALUES (
  'Your question here?',
  'multiple_choice',  -- or 'yes_no'
  ARRAY['Option A', 'Option B', 'Option C', 'Option D'],  -- NULL for yes/no
  'a',  -- or 'yes'/'no' for yes/no questions
  'Explanation of the correct answer',
  'medium',  -- 'easy', 'medium', or 'hard'
  'Science'  -- Any category name
);
```

## Monitoring & Logging

The bot includes comprehensive logging with Winston:
- **Error logs**: `logs/error.log`
- **Combined logs**: `logs/combined.log`
- **Console output**: Available in development mode

## Support & Contributing

For issues or feature requests, please check the documentation or contact the development team.

## License

This project is licensed under the MIT License - see the LICENSE file for details.