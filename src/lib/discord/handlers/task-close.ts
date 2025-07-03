import type { DiscordInteractionResponse } from '../types';
import { InteractionResponseType } from '../types';
import type { APIApplicationCommandGuildInteraction, APIApplicationCommandInteractionDataSubcommandOption, APIChatInputApplicationCommandInteractionData } from 'discord-api-types/v10';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { Database } from '@/types/database';
import { DiscordAPI } from '../api';
import { resolveTaskId, getTaskIdFromOptions } from '../utils/task-resolver';

export async function handleTaskClose(
  interaction: APIApplicationCommandGuildInteraction,
  env: { DB: D1Database; DISCORD_BOT_TOKEN: string; [key: string]: any }
): Promise<DiscordInteractionResponse> {

  const data = interaction.data as APIChatInputApplicationCommandInteractionData;
  const subcommand = data.options?.[0] as APIApplicationCommandInteractionDataSubcommandOption | undefined;
  const options = subcommand?.options || [];
  
  const providedTaskId = getTaskIdFromOptions(options);

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
    // タスク情報を取得
    const task = await db
      .selectFrom('tasks')
      .leftJoin('user as assignee', 'assignee.id', 'tasks.assignee_id')
      .leftJoin('user as creator', 'creator.id', 'tasks.creator_id')
      .select([
        'tasks.title',
        'tasks.status',
        'tasks.discord_thread_id',
        'tasks.discord_channel_id',
        'tasks.created_at',
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

    if (task.status === 'completed') {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { content: 'このタスクは既に完了しています。' },
      };
    }

    // タスクを完了にする
    await db
      .updateTable('tasks')
      .set({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .where('id', '=', taskId)
      .execute();

    const assigneeText = task.assignee_discord_id ? ` (<@${task.assignee_discord_id}> が担当)` : '';

    // 作成日からの経過時間を計算
    const createdAt = new Date(task.created_at);
    const now = new Date();
    const durationMs = now.getTime() - createdAt.getTime();
    const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    const durationHours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    let durationText = '';
    if (durationDays > 0) {
      durationText = `${durationDays}日${durationHours}時間`;
    } else if (durationHours > 0) {
      durationText = `${durationHours}時間`;
    } else {
      const durationMinutes = Math.floor(durationMs / (1000 * 60));
      durationText = `${durationMinutes}分`;
    }

    // 通知メッセージを作成
    const notificationMessage = [
      `✅ **タスクが完了しました！** 🎉`,
      ``,
      `📌 **タスク**: ${task.title}`,
      `👤 **完了者**: <@${interaction.member.user.id}>`,
      task.assignee_discord_id ? `👥 **担当者**: <@${task.assignee_discord_id}>` : '',
      `⏱️ **所要時間**: ${durationText}`,
      ``,
      `🔗 タスクID: ${taskId}`,
      ``,
      `お疲れ様でした！ 🎆`
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
        content: `✅ タスク「**${task.title}**」を完了しました！${assigneeText}\nお疲れ様でした！ 🎉\n\n🔗 **詳細を確認**: ${env.PUBLIC_SITE_URL || 'https://wumtodo.pages.dev'}/tasks/${taskId}`
      },
    };
  } catch (error) {
    throw error;
  }
}