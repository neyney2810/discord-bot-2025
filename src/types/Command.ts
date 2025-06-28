import { SlashCommandBuilder, CommandInteraction, PermissionResolvable } from 'discord.js';

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
  permissions?: PermissionResolvable[];
  adminOnly?: boolean;
}