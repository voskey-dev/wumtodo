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
import { DiscordAPI } from '@/lib/discord/api';

async function sendFollowUpMessage(
  interaction: any,
  messageData: any,
  env: any
): Promise<void> {
  const api = new DiscordAPI(env.DISCORD_BOT_TOKEN);
  await api.sendFollowUpMessage(
    env.DISCORD_APPLICATION_ID,
    interaction.token,
    messageData
  );
}

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
      
      // 即座にDeferredレスポンスを返す
      const deferredResponse = {
        type: 5, // InteractionResponseType.DeferredChannelMessageWithSource
      };
      
      // Deferredレスポンスを送信後、非同期で処理を実行
      setTimeout(async () => {
        try {
          let messageData;
          
          switch (subcommand) {
            case 'setup':
              const result = await handleWumtodoSetup(interaction, locals.runtime.env);
              messageData = result.data;
              break;
            default:
              messageData = { content: '不明なサブコマンドです。' };
          }
          
          // フォローアップメッセージを送信
          await sendFollowUpMessage(interaction, messageData, locals.runtime.env);
        } catch (error) {
          console.error('Command handling error:', error);
          await sendFollowUpMessage(
            interaction,
            { content: 'エラーが発生しました。もう一度お試しください。' },
            locals.runtime.env
          );
        }
      }, 0);
      
      return new Response(JSON.stringify(deferredResponse), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (commandName === 'task') {
      const subcommand = 'options' in interaction.data ? interaction.data.options?.[0]?.name : undefined;
      
      // 即座にDeferredレスポンスを返す
      const deferredResponse = {
        type: 5, // InteractionResponseType.DeferredChannelMessageWithSource
      };
      
      // Deferredレスポンスを送信後、非同期で処理を実行
      setTimeout(async () => {
        try {
          let messageData;
          
          switch (subcommand) {
            case 'create':
              const createResult = await handleTaskCreate(interaction, locals.runtime.env);
              messageData = createResult.data;
              break;
            case 'list':
              const listResult = await handleTaskList(interaction, locals.runtime.env);
              messageData = listResult.data;
              break;
            case 'status':
              const statusResult = await handleTaskStatus(interaction, locals.runtime.env);
              messageData = statusResult.data;
              break;
            case 'assign':
              const assignResult = await handleTaskAssign(interaction, locals.runtime.env);
              messageData = assignResult.data;
              break;
            case 'due':
              const dueResult = await handleTaskDue(interaction, locals.runtime.env);
              messageData = dueResult.data;
              break;
            case 'close':
              const closeResult = await handleTaskClose(interaction, locals.runtime.env);
              messageData = closeResult.data;
              break;
            case 'comment':
              const commentResult = await handleTaskComment(interaction, locals.runtime.env);
              messageData = commentResult.data;
              break;
            default:
              messageData = { content: '不明なサブコマンドです。' };
          }
          
          // フォローアップメッセージを送信
          await sendFollowUpMessage(interaction, messageData, locals.runtime.env);
        } catch (error) {
          console.error('Command handling error:', error);
          await sendFollowUpMessage(
            interaction,
            { content: 'エラーが発生しました。もう一度お試しください。' },
            locals.runtime.env
          );
        }
      }, 0);
      
      return new Response(JSON.stringify(deferredResponse), {
        headers: { 'Content-Type': 'application/json' },
      });
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