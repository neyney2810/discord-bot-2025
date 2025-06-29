import { IDatabaseService } from './IDatabaseService';
import { SupabaseService } from './SupabaseService';
import { FirebaseService } from './FirebaseService';
import { DirectusService } from './DirectusService';

export class DatabaseFactory {
  public static createDatabaseService(): IDatabaseService {
    const dbType = process.env.DATABASE_TYPE;

    switch (dbType) {
      case 'supabase':
        return new SupabaseService();
      case 'firebase':
        return new FirebaseService();
      case 'directus':
        return new DirectusService();
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }
}