import { SlashCommandBuilder, CommandInteraction, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types/Command';
import { QuizService } from '../services/QuizService';
import { DatabaseService } from '../services/DatabaseService';

const databaseService = new DatabaseService();

export const startquiz: Command = {
  data: new SlashCommandBuilder()
    .setName('startquiz')
    .setDescription('Start a quiz immediately in the current channel'),
  
  permissions: [PermissionFlagsBits.ManageMessages],

  async execute(interaction: CommandInteraction) {
    try {
      await interaction.deferReply();

      if (!interaction.channel?.isTextBased()) {
        await interaction.editReply('❌ This command can only be used in a text channel!');
        return;
      }

      const quizService = new QuizService(interaction.client, databaseService);
      await quizService.sendDailyQuiz(interaction.channel);
      
      await interaction.editReply('✅ Quiz started! Check the messages above to participate.');

    } catch (error) {
      console.error('Error in startquiz command:', error);
      await interaction.editReply('❌ An error occurred while starting the quiz.');
    }
  }
};