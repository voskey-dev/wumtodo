import type { DiscordInteractionResponse } from '../types';
import { InteractionResponseType } from '../types';
import type { APIApplicationCommandGuildInteraction, APIApplicationCommandInteractionDataSubcommandOption, APIChatInputApplicationCommandInteractionData } from 'discord-api-types/v10';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { Database } from '@/types/database';
import { DiscordAPI } from '../api';
import { resolveTaskId, getTaskIdFromOptions } from '../utils/task-resolver';

export async function handleTaskStatus(
  interaction: APIApplicationCommandGuildInteraction,
  env: { DB: D1Database; DISCORD_BOT_TOKEN: string; [key: string]: any }
): Promise<DiscordInteractionResponse> {

  const data = interaction.data as APIChatInputApplicationCommandInteractionData;
  const subcommand = data.options?.[0] as APIApplicationCommandInteractionDataSubcommandOption | undefined;
  const options = subcommand?.options || [];
  
  const providedTaskId = getTaskIdFromOptions(options);
  const newStatus = options.find((o) => o.name === 'status')?.value as string;

  const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: env.DB }),
  });

  try {
    // タスクIDを解決（提供されていない場合はスレッドIDから検索）
    const taskId = await resolveTaskId(interaction, db, providedTaskId);
    
    if (!taskId) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { 
          content: 'タスクが見つかりませんでした。このコマンドは、タスクに関連付けられたスレッド内で実行するか、task_idを指定してください。' 
        },
      };
    }
    // 既存のタスク情報を取得
    const task = await db
      .selectFrom('tasks')
      .leftJoin('user as assignee', 'tasks.assignee_id', 'assignee.id')
      .leftJoin('user as creator', 'tasks.creator_id', 'creator.id')
      .select([
        'tasks.id',
        'tasks.title',
        'tasks.status as old_status',
        'tasks.discord_thread_id',
        'tasks.discord_channel_id',
        'assignee.discord_id as assignee_discord_id',
        'assignee.username as assignee_username',
        'creator.discord_id as creator_discord_id',
        'creator.username as creator_username'
      ])
      .where('tasks.id', '=', taskId)
      .executeTakeFirst();

    if (!task) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { content: `タスク (ID: ${taskId}) が見つかりませんでした。` },
      };
    }

    // タスクを更新
    const result = await db
      .updateTable('tasks')
      .set({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', taskId)
      .executeTakeFirst();

    if (result.numUpdatedRows === 0n) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { content: `タスク (ID: ${taskId}) が見つかりませんでした。` },
      };
    }

    const statusEmoji = newStatus === 'todo' ? '📋' : newStatus === 'in_progress' ? '🔄' : '✅';
    const statusText = newStatus === 'todo' ? '未着手' : newStatus === 'in_progress' ? '進行中' : '完了';
    const oldStatusText = task.old_status === 'todo' ? '未着手' : task.old_status === 'in_progress' ? '進行中' : '完了';

    // 通知メッセージを作成
    const notificationMessage = [
      `${statusEmoji} **タスクのステータスが更新されました**`,
      ``,
      `📌 **タスク**: ${task.title}`,
      `👤 **更新者**: <@${interaction.member.user.id}>`,
      `🔄 **変更**: ${oldStatusText} → **${statusText}**`,
      task.assignee_discord_id ? `👥 **担当者**: <@${task.assignee_discord_id}>` : '',
      ``,
      `🔗 **詳細を確認**: <${env.PUBLIC_SITE_URL || 'https://wumtodo.pages.dev'}/tasks/${taskId}>`
    ].filter(Boolean).join('\n');

    // Discord APIクライアントを初期化
    const discordAPI = new DiscordAPI(env.DISCORD_BOT_TOKEN);

    // スレッドに通知を送信（存在する場合）
    if (task.discord_thread_id) {
      try {
        await discordAPI.sendMessage(task.discord_thread_id, notificationMessage);
      } catch (error) {
        // Failed to send notification to thread
      }
    }
    // スレッドがない場合は、元のチャンネルに通知
    else if (task.discord_channel_id) {
      try {
        await discordAPI.sendMessage(task.discord_channel_id, notificationMessage);
      } catch (error) {
        // Failed to send notification to channel
      }
    }

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: { 
        content: `${statusEmoji} タスク「**${task.title}**」のステータスを **${statusText}** に変更しました。\n\n🔗 **詳細を確認**: <${env.PUBLIC_SITE_URL || 'https://wumtodo.pages.dev'}/tasks/${taskId}>`
      },
    };
  } catch (error) {
    throw error;
  }
}