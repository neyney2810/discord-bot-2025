import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/Command';
import { DatabaseService } from '../services/DatabaseService';

const databaseService = new DatabaseService();

export const leaderboard: Command = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the quiz leaderboard for this server')
    // .addIntegerOption(option =>
    //   option.setName('limit')
    //     .setDescription('Number of top users to show (default: 10)')
    //     .setMinValue(1)
    //     .setMaxValue(100)
    //     .setRequired(false)
    // )
    ,
  
  async execute(interaction: CommandInteraction) {
    try {
      await interaction.deferReply();

      if (!interaction.guildId) {
        await interaction.editReply('❌ This command can only be used in a server!');
        return;
      }

      const limit = (interaction as ChatInputCommandInteraction).options.getInteger('limit') || 10;
      const leaderboard = await databaseService.getLeaderboard(interaction.guildId, limit);

      if (leaderboard.length === 0) {
        await interaction.editReply('📊 No quiz data found for this server yet. Start answering quizzes to appear on the leaderboard!');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('🏆 Quiz Leaderboard')
        .setColor('#ffd700')
        .setTimestamp()
        .setFooter({ text: `Showing top ${leaderboard.length} users` });

      let description = '';
      for (let i = 0; i < leaderboard.length; i++) {
        const score = leaderboard[i];
        const user = interaction.client.users.cache.get(score.user_id);
        const username = user ? user.displayName : 'Unknown User';
        
        const rank = i + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏅';
        const accuracy = score.total_answers > 0 ? ((score.correct_answers / score.total_answers) * 100).toFixed(1) : '0.0';
        
        description += `${medal} **${rank}.** ${username}\n`;
        description += `   Score: ${score.total_score} | Accuracy: ${accuracy}% | Streak: ${score.streak} (Best: ${score.best_streak})\n\n`;
      }

      embed.setDescription(description);

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in leaderboard command:', error);
      await interaction.editReply('❌ An error occurred while fetching the leaderboard.');
    }
  }
};