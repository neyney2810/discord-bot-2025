import { Events, Interaction, Collection } from 'discord.js';
import { Command } from '../types/Command';
import { QuizService } from '../services/QuizService';
import { DatabaseService } from '../services/DatabaseService';
import { logger } from '../utils/logger';

const databaseService = new DatabaseService();

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction, commands: Collection<string, Command>) {
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName);

    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    // Check permissions
    if (command.adminOnly && interaction.guild) {
      const member = interaction.guild.members.cache.get(interaction.user.id);
      if (!member?.permissions.has('Administrator')) {
        await interaction.reply({ 
          content: '❌ You need administrator permissions to use this command!', 
          ephemeral: true 
        });
        return;
      }
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Error executing command ${interaction.commandName}:`, error);
      const errorMessage = '❌ There was an error while executing this command!';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  } else if (interaction.isButton() && interaction.customId.startsWith('quiz_')) {
    const quizService = new QuizService(interaction.client, databaseService);
    await quizService.handleQuizResponse(interaction);
  }
}