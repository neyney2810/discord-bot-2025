import { initializeApp, firestore } from 'firebase-admin';
import { Firestore } from 'firebase-admin/firestore';
import { IDatabaseService } from './IDatabaseService';
import { GuildConfig, Quiz, QuizResponse, UserScore } from '../types/Quiz';
import { logger } from '../utils/logger';
import { credential } from 'firebase-admin';

export class FirebaseService implements IDatabaseService {
  private firestore: Firestore;

  constructor() {
    const firebaseConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    initializeApp({ credential: cert(firebaseConfig) });
    this.firestore = firestore();
  }
    async getGuildConfig(guildId: string): Promise<GuildConfig | null> {
        try {
            const doc = await this.firestore.collection('guild_configs').doc(guildId).get();
            if (!doc.exists) {
                return null;
            }
            return doc.data() as GuildConfig;
        } catch (error) {
            logger.error(`Failed to fetch guild config for guildId: ${guildId}`, error);
            throw error;
        }
    }

    async upsertGuildConfig(config: Partial<GuildConfig>): Promise<GuildConfig> {
        try {
            if (!config.guild_id) {
                throw new Error('guildId is required to upsert a guild config');
            }
            const guildId = config.guild_id;
            if (!guildId) {
                throw new Error('guild_id is required to upsert a guild config');
            }
            const docRef = this.firestore.collection('guild_configs').doc(guildId);
            await docRef.set(config, { merge: true });
            const updatedDoc = await docRef.get();
            return updatedDoc.data() as GuildConfig;
        } catch (error) {
            logger.error(`Failed to upsert guild config for guildId: ${config.guild_id}`, error);
            throw error;
        }
    }
    getActiveGuilds(): Promise<GuildConfig[]> {
        throw new Error('Method not implemented.');
    }
    getRandomQuiz(): Promise<Quiz | null> {
        throw new Error('Method not implemented.');
    }
    createQuiz(quiz: Omit<Quiz, 'id' | 'created_at'>): Promise<Quiz> {
        throw new Error('Method not implemented.');
    }
    recordQuizResponse(response: Omit<QuizResponse, 'id' | 'created_at'>): Promise<QuizResponse> {
        throw new Error('Method not implemented.');
    }
    getQuizResponses(quizId: string, guildId: string): Promise<QuizResponse[]> {
        throw new Error('Method not implemented.');
    }
    getUserScore(userId: string, guildId: string): Promise<UserScore | null> {
        throw new Error('Method not implemented.');
    }
    updateUserScore(userId: string, guildId: string, isCorrect: boolean): Promise<UserScore> {
        throw new Error('Method not implemented.');
    }
    getLeaderboard(guildId: string, limit?: number): Promise<UserScore[]> {
        throw new Error('Method not implemented.');
    }

  public async initialize(): Promise<void> {
    try {
      await this.firestore.collection('guild_configs').limit(1).get();
      logger.info('Firebase connection established');
    } catch (error) {
      logger.error('Failed to connect to Firebase:', error);
      throw error;
    }
  }
}
function cert(firebaseConfig: { projectId: string | undefined; clientEmail: string | undefined; privateKey: string | undefined; }): import("firebase-admin/app").Credential | undefined {
    if (!firebaseConfig.projectId || !firebaseConfig.clientEmail || !firebaseConfig.privateKey) {
        throw new Error('Invalid Firebase configuration. Ensure projectId, clientEmail, and privateKey are provided.');
    }
    return credential.cert({
        projectId: firebaseConfig.projectId,
        clientEmail: firebaseConfig.clientEmail,
        privateKey: firebaseConfig.privateKey,
    });
}
