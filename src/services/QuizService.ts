import { 
  Client, 
  TextBasedChannel, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ComponentType,
  ButtonInteraction
} from 'discord.js';
import { DatabaseService } from './DatabaseService';
import { Quiz } from '../types/Quiz';
import { logger } from '../utils/logger';

export class QuizService {
  private client: Client;
  private databaseService: DatabaseService;
  private activeQuizzes: Map<string, { quiz: Quiz, responses: Set<string> }> = new Map();

  constructor(client: Client, databaseService: DatabaseService) {
    this.client = client;
    this.databaseService = databaseService;
  }

  public async sendDailyQuiz(channel: TextBasedChannel): Promise<void> {
    try {
      const quiz = await this.databaseService.getRandomQuiz();
      if (!quiz) {
        await channel.send('❌ No quizzes available at the moment!');
        return;
      }

      const embed = this.createQuizEmbed(quiz);
      const actionRow = this.createQuizButtons(quiz);

      const message = await channel.send({
        embeds: [embed],
        components: [actionRow]
      });

      // Store active quiz
      const quizKey = `${channel.guildId}-${message.id}`;
      this.activeQuizzes.set(quizKey, {
        quiz,
        responses: new Set()
      });

      // Set timeout for quiz
      const timeoutMinutes = parseInt(process.env.QUIZ_TIMEOUT_MINUTES || '5');
      setTimeout(async () => {
        await this.endQuiz(message.id, channel);
      }, timeoutMinutes * 60 * 1000);

    } catch (error) {
      logger.error('Error sending daily quiz:', error);
      await channel.send('❌ An error occurred while sending the quiz. Please try again later.');
    }
  }

  public async handleQuizResponse(interaction: ButtonInteraction): Promise<void> {
    try {
      const quizKey = `${interaction.guildId}-${interaction.message.id}`;
      const activeQuiz = this.activeQuizzes.get(quizKey);

      if (!activeQuiz) {
        await interaction.reply({ content: '❌ This quiz is no longer active.', ephemeral: true });
        return;
      }

      // Check if user already responded
      if (activeQuiz.responses.has(interaction.user.id)) {
        await interaction.reply({ content: '❌ You have already answered this quiz!', ephemeral: true });
        return;
      }

      const userAnswer = interaction.customId.replace('quiz_', '');
      const isCorrect = userAnswer === activeQuiz.quiz.correct_answer;

      // Record response
      await this.databaseService.recordQuizResponse({
        quiz_id: activeQuiz.quiz.id,
        user_id: interaction.user.id,
        guild_id: interaction.guildId!,
        answer: userAnswer,
        is_correct: isCorrect,
        response_time: 0 // TODO: Calculate actual response time
      });

      // Update user score
      await this.databaseService.updateUserScore(
        interaction.user.id,
        interaction.guildId!,
        isCorrect
      );

      // Add to responses
      activeQuiz.responses.add(interaction.user.id);

      const responseEmbed = new EmbedBuilder()
        .setColor(isCorrect ? '#00ff00' : '#ff0000')
        .setDescription(isCorrect ? '✅ Correct!' : '❌ Incorrect!')
        .setFooter({ text: 'The quiz will end automatically or when everyone has answered.' });

      await interaction.reply({ embeds: [responseEmbed], ephemeral: true });

    } catch (error) {
      logger.error('Error handling quiz response:', error);
      await interaction.reply({ content: '❌ An error occurred while processing your answer.', ephemeral: true });
    }
  }

  private createQuizEmbed(quiz: Quiz): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle('📚 Daily Quiz')
      .setDescription(quiz.question)
      .setColor('#0099ff')
      .addFields({ name: 'Category', value: quiz.category, inline: true })
      .addFields({ name: 'Difficulty', value: quiz.difficulty, inline: true })
      .setFooter({ text: `Quiz ID: ${quiz.id} • Click a button to answer!` })
      .setTimestamp();

    if (quiz.type === 'multiple_choice' && quiz.options) {
      embed.addFields({
        name: 'Options',
        value: quiz.options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`).join('\n')
      });
    }

    return embed;
  }

  private createQuizButtons(quiz: Quiz): ActionRowBuilder<ButtonBuilder> {
    const actionRow = new ActionRowBuilder<ButtonBuilder>();

    if (quiz.type === 'yes_no') {
      actionRow.addComponents(
        new ButtonBuilder()
          .setCustomId('quiz_yes')
          .setLabel('Yes')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('quiz_no')
          .setLabel('No')
          .setStyle(ButtonStyle.Danger)
      );
    } else if (quiz.type === 'multiple_choice' && quiz.options) {
      quiz.options.forEach((option, index) => {
        const letter = String.fromCharCode(65 + index);
        actionRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`quiz_${letter.toLowerCase()}`)
            .setLabel(letter)
            .setStyle(ButtonStyle.Primary)
        );
      });
    }

    return actionRow;
  }

  private async endQuiz(messageId: string, channel: TextBasedChannel): Promise<void> {
    try {
      const quizKey = `${channel.guildId}-${messageId}`;
      const activeQuiz = this.activeQuizzes.get(quizKey);

      if (!activeQuiz) return;

      const quiz = activeQuiz.quiz;
      const responses = await this.databaseService.getQuizResponses(quiz.id, channel.guildId!);

      const resultsEmbed = new EmbedBuilder()
        .setTitle('📊 Quiz Results')
        .setDescription(`**Question:** ${quiz.question}`)
        .addFields(
          { name: '✅ Correct Answer', value: quiz.correct_answer, inline: true },
          { name: '👥 Total Responses', value: responses.length.toString(), inline: true },
          { name: '🎯 Correct Responses', value: responses.filter(r => r.is_correct).length.toString(), inline: true }
        )
        .setColor('#ffd700')
        .setTimestamp();

      if (quiz.explanation) {
        resultsEmbed.addFields({ name: '💡 Explanation', value: quiz.explanation });
      }

      await channel.send({ embeds: [resultsEmbed] });

      // Clean up
      this.activeQuizzes.delete(quizKey);

    } catch (error) {
      logger.error('Error ending quiz:', error);
    }
  }
}