import { Client, Collection } from 'discord.js';
import { Command } from '../types/Command';
import { DatabaseService } from '../services/DatabaseService';
import { logger } from './logger';

// Import all events
import * as ready from '../events/ready';
import * as interactionCreate from '../events/interactionCreate';
import * as guildCreate from '../events/guildCreate';

export async function loadEvents(client: Client, databaseService: DatabaseService): Promise<void> {
  const commands: Collection<string, Command> = new Collection();

  // Ready event
  if (ready.once) {
    client.once(ready.name, (...args) => ready.execute(...args));
  } else {
    client.on(ready.name, (...args) => ready.execute(...args));
  }

  // Interaction create event
  client.on(interactionCreate.name, (interaction) => 
    interactionCreate.execute(interaction, commands)
  );

  // Guild create event
  client.on(guildCreate.name, (...args) => guildCreate.execute(...args));

  logger.info('Event handlers loaded successfully');
}