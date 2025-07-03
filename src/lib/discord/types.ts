import type {
  APIApplicationCommandInteraction,
  APIInteractionResponse,
  APIPingInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord-api-types/v10';

// 値として使用するために再エクスポート
export { ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType, InteractionType } from 'discord-api-types/v10';

export type DiscordInteraction = APIPingInteraction | APIApplicationCommandInteraction;

export type DiscordCommand = RESTPostAPIApplicationCommandsJSONBody & {
  type?: import('discord-api-types/v10').ApplicationCommandType;
};

export type DiscordInteractionResponse = APIInteractionResponse;