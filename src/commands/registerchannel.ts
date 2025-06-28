import { SlashCommandBuilder, CommandInteraction, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types/Command';
import { DatabaseService } from '../services/DatabaseService';

const databaseService = new DatabaseService();

export const registerchannel: Command = {
  data: new SlashCommandBuilder()
    .setName('registerchannel')
    .setDescription('Register a channel for daily quizzes')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel where daily quizzes will be sent')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('timezone')
        .setDescription('Timezone for quiz scheduling (e.g., America/New_York)')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('hour')
        .setDescription('Hour to send daily quiz (0-23, default: 9)')
        .setMinValue(0)
        .setMaxValue(23)
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('minute')
        .setDescription('Minute to send daily quiz (0-59, default: 0)')
        .setMinValue(0)
        .setMaxValue(59)
        .setRequired(false)
    ),
  
  permissions: [PermissionFlagsBits.ManageChannels],
  adminOnly: true,

  async execute(interaction: CommandInteraction) {
    try {
      await interaction.deferReply();

      if (!interaction.guildId) {
        await interaction.editReply('❌ This command can only be used in a server!');
        return;
      }

      const channel = interaction.options.get('channel', true);
      const timezone = interaction.options.get('timezone')?.value as string || 'UTC';
      const hour = interaction.options.get('hour')?.value as number || 9;
      const minute = interaction.options.get('minute')?.value as number || 0;

      if (!channel.channel?.isTextBased()) {
        await interaction.editReply('❌ Please select a text channel!');
        return;
      }

      // Validate timezone
      try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
      } catch {
        await interaction.editReply('❌ Invalid timezone! Please use a valid timezone (e.g., America/New_York, Europe/London)');
        return;
      }

      const guildConfig = {
        guild_id: interaction.guildId,
        quiz_channel_id: channel.channel.id,
        timezone,
        quiz_time_hour: hour,
        quiz_time_minute: minute,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      await databaseService.upsertGuildConfig(guildConfig);

      await interaction.editReply({
        content: `✅ Successfully registered <#${channel.channel.id}> for daily quizzes!\n\n` +
                `**Schedule:** ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${timezone}\n` +
                `**Status:** Active\n\n` +
                `Daily quizzes will be automatically sent to this channel. Use \`/unregisterchannel\` to disable.`
      });

    } catch (error) {
      console.error('Error in registerchannel command:', error);
      await interaction.editReply('❌ An error occurred while registering the channel.');
    }
  }
};