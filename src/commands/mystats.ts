import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../types/Command';
import { DatabaseService } from '../services/DatabaseService';

const databaseService = new DatabaseService();

export const mystats: Command = {
  data: new SlashCommandBuilder()
    .setName('mystats')
    .setDescription('View your quiz statistics for this server'),

  async execute(interaction: CommandInteraction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      if (!interaction.guildId) {
        await interaction.editReply('❌ This command can only be used in a server!');
        return;
      }

      const userScore = await databaseService.getUserScore(interaction.user.id, interaction.guildId);

      if (!userScore) {
        await interaction.editReply('📊 You haven\'t answered any quizzes yet! Start participating to see your stats.');
        return;
      }

      const accuracy = userScore.total_answers > 0 ? 
        ((userScore.correct_answers / userScore.total_answers) * 100).toFixed(1) : '0.0';

      const embed = new EmbedBuilder()
        .setTitle(`📊 ${interaction.user.displayName}'s Quiz Stats`)
        .setColor('#0099ff')
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: '🎯 Total Score', value: userScore.total_score.toString(), inline: true },
          { name: '✅ Correct Answers', value: userScore.correct_answers.toString(), inline: true },
          { name: '📝 Total Answers', value: userScore.total_answers.toString(), inline: true },
          { name: '🎯 Accuracy', value: `${accuracy}%`, inline: true },
          { name: '🔥 Current Streak', value: userScore.streak.toString(), inline: true },
          { name: '🏆 Best Streak', value: userScore.best_streak.toString(), inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Keep participating to improve your stats!' });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in mystats command:', error);
      await interaction.editReply('❌ An error occurred while fetching your statistics.');
    }
  }
};