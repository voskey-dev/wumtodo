import type { 
  APIApplicationCommandInteraction, 
  APIChatInputApplicationCommandInteractionData,
  APIApplicationCommandGuildInteraction,
  APIInteraction
} from 'discord-api-types/v10';
import { InteractionType } from 'discord-api-types/v10';

export function isChatInputCommand(
  interaction: APIApplicationCommandInteraction
): interaction is APIApplicationCommandInteraction & { 
  data: APIChatInputApplicationCommandInteractionData 
} {
  // Type 2 は CHAT_INPUT
  return interaction.data.type === 2 || interaction.data.type === undefined;
}

export function isGuildCommand(
  interaction: APIApplicationCommandInteraction
): interaction is APIApplicationCommandGuildInteraction {
  return 'guild_id' in interaction && interaction.guild_id !== undefined;
}

export function isApplicationCommandGuildInteraction(
  interaction: APIInteraction
): interaction is APIApplicationCommandGuildInteraction {
  return (
    interaction.type === InteractionType.ApplicationCommand &&
    'guild_id' in interaction && 
    interaction.guild_id !== undefined &&
    'member' in interaction &&
    interaction.member !== undefined
  );
}