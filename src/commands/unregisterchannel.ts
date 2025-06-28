import { SlashCommandBuilder, CommandInteraction, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types/Command';
import { DatabaseService } from '../services/DatabaseService';

const databaseService = new DatabaseService();

export const unregisterchannel: Command = {
  data: new SlashCommandBuilder()
    .setName('unregisterchannel')
    .setDescription('Unregister the current quiz channel and stop daily quizzes'),
  
  permissions: [PermissionFlagsBits.ManageChannels],
  adminOnly: true,

  async execute(interaction: CommandInteraction) {
    try {
      await interaction.deferReply();

      if (!interaction.guildId) {
        await interaction.editReply('❌ This command can only be used in a server!');
        return;
      }

      const currentConfig = await databaseService.getGuildConfig(interaction.guildId);
      
      if (!currentConfig || !currentConfig.is_active) {
        await interaction.editReply('❌ No active quiz channel is registered for this server!');
        return;
      }

      await databaseService.upsertGuildConfig({
        guild_id: interaction.guildId,
        is_active: false,
        updated_at: new Date()
      });

      await interaction.editReply('✅ Successfully disabled daily quizzes for this server. You can re-enable them using `/registerchannel`.');

    } catch (error) {
      console.error('Error in unregisterchannel command:', error);
      await interaction.editReply('❌ An error occurred while unregistering the channel.');
    }
  }
};