import type { APIRoute } from 'astro';
import { verifyDiscordRequest } from '@/lib/discord/verify';
import { InteractionType, InteractionResponseType } from '@/lib/discord/types';
import type { DiscordInteraction } from '@/lib/discord/types';
import { isApplicationCommandGuildInteraction } from '@/lib/discord/utils';
import { handleTaskCreate } from '@/lib/discord/handlers/task-create';
import { handleTaskList } from '@/lib/discord/handlers/task-list';
import { handleTaskStatus } from '@/lib/discord/handlers/task-status';
import { handleTaskAssign } from '@/lib/discord/handlers/task-assign';
import { handleTaskDue } from '@/lib/discord/handlers/task-due';
import { handleTaskClose } from '@/lib/discord/handlers/task-close';
import { handleTaskComment } from '@/lib/discord/handlers/task-comment';
import { handleWumtodoSetup } from '@/lib/discord/handlers/wumtodo-setup';

export const POST: APIRoute = async ({ request, locals }) => {
  const signature = request.headers.get('X-Signature-Ed25519') || '';
  const timestamp = request.headers.get('X-Signature-Timestamp') || '';
  const body = await request.text();

  // 環境変数が設定されているか確認
  if (!locals.runtime?.env?.DISCORD_PUBLIC_KEY) {
    return new Response('Server configuration error', { status: 500 });
  }

  // 署名を検証
  try {
    const isValid = await verifyDiscordRequest(
      locals.runtime.env.DISCORD_PUBLIC_KEY,
      signature,
      timestamp,
      body
    );

    if (!isValid) {
      return new Response('Invalid request signature', { status: 401 });
    }
  } catch (error) {
    return new Response('Signature verification error', { status: 401 });
  }

  const interaction = JSON.parse(body) as DiscordInteraction;

  // Pingリクエストへの応答
  if (interaction.type === InteractionType.Ping) {
    return new Response(
      JSON.stringify({ type: InteractionResponseType.Pong }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  // コマンド処理
  if (isApplicationCommandGuildInteraction(interaction)) {
    const commandName = interaction.data.name;
    
    if (commandName === 'wumtodo') {
      const subcommand = 'options' in interaction.data ? interaction.data.options?.[0]?.name : undefined;
      try {
        let response;
        
        switch (subcommand) {
          case 'setup':
            response = await handleWumtodoSetup(interaction, locals.runtime.env);
            break;
          default:
            response = {
              type: InteractionResponseType.ChannelMessageWithSource,
              data: { content: '不明なサブコマンドです。' },
            };
        }

        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Command handling error:', error);
        return new Response(
          JSON.stringify({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: { content: 'エラーが発生しました。もう一度お試しください。' },
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    if (commandName === 'task') {
      const subcommand = 'options' in interaction.data ? interaction.data.options?.[0]?.name : undefined;
      try {
        let response;
        
        switch (subcommand) {
          case 'create':
            response = await handleTaskCreate(interaction, locals.runtime.env);
            break;
          case 'list':
            response = await handleTaskList(interaction, locals.runtime.env);
            break;
          case 'status':
            response = await handleTaskStatus(interaction, locals.runtime.env);
            break;
          case 'assign':
            response = await handleTaskAssign(interaction, locals.runtime.env);
            break;
          case 'due':
            response = await handleTaskDue(interaction, locals.runtime.env);
            break;
          case 'close':
            response = await handleTaskClose(interaction, locals.runtime.env);
            break;
          case 'comment':
            response = await handleTaskComment(interaction, locals.runtime.env);
            break;
          default:
            response = {
              type: InteractionResponseType.ChannelMessageWithSource,
              data: { content: '不明なサブコマンドです。' },
            };
        }

        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Command handling error:', error);
        return new Response(
          JSON.stringify({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: { content: 'エラーが発生しました。もう一度お試しください。' },
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }
  
  // ギルド外でのコマンド実行を処理
  if (interaction.type === InteractionType.ApplicationCommand && !isApplicationCommandGuildInteraction(interaction)) {
    const commandName = interaction.data.name;
    if (commandName === 'wumtodo' || commandName === 'task') {
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: { content: 'このコマンドはサーバー内でのみ使用できます。' },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response('Unknown interaction type', { status: 400 });
};