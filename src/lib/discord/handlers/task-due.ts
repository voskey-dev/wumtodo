import type { DiscordInteractionResponse } from '../types';
import { InteractionResponseType } from '../types';
import type { APIApplicationCommandGuildInteraction, APIApplicationCommandInteractionDataSubcommandOption, APIChatInputApplicationCommandInteractionData } from 'discord-api-types/v10';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { Database } from '@/types/database';
import { DiscordAPI } from '../api';
import { resolveTaskId, getTaskIdFromOptions } from '../utils/task-resolver';

export async function handleTaskDue(
  interaction: APIApplicationCommandGuildInteraction,
  env: { DB: D1Database; DISCORD_BOT_TOKEN: string; [key: string]: any }
): Promise<DiscordInteractionResponse> {

  const data = interaction.data as APIChatInputApplicationCommandInteractionData;
  const subcommand = data.options?.[0] as APIApplicationCommandInteractionDataSubcommandOption | undefined;
  const options = subcommand?.options || [];
  
  const providedTaskId = getTaskIdFromOptions(options);
  const dateStr = options.find((o) => o.name === 'date')?.value as string;

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
    // 日付の検証
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { content: '日付は YYYY-MM-DD 形式で入力してください。' },
      };
    }

    const dueDate = new Date(dateStr + 'T00:00:00Z');
    if (isNaN(dueDate.getTime())) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { content: '無効な日付です。' },
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
        'tasks.due_date as old_due_date',
        'tasks.discord_thread_id',
        'tasks.discord_channel_id',
        'assignee.discord_id as assignee_discord_id',
        'creator.discord_id as creator_discord_id'
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
        due_date: dueDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .where('id', '=', taskId)
      .executeTakeFirst();

    // 期限までの残り日数を計算
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    let dueText = '';
    if (daysUntilDue === 0) {
      dueText = '🔴 **今日が期限です！**';
    } else if (daysUntilDue === 1) {
      dueText = '🟠 **明日が期限です**';
    } else if (daysUntilDue > 1) {
      dueText = `🟢 あと${daysUntilDue}日`;
    } else {
      dueText = `🔴 **${Math.abs(daysUntilDue)}日経過しています！**`;
    }

    // 通知メッセージを作成
    const notificationMessage = [
      `📅 **タスクの期限が設定されました**`,
      ``,
      `📌 **タスク**: ${task.title}`,
      `👤 **設定者**: <@${interaction.member.user.id}>`,
      `🔄 **変更**: ${task.old_due_date ? new Date(task.old_due_date).toISOString().split('T')[0] : '未設定'} → **${dateStr}**`,
      task.assignee_discord_id ? `👥 **担当者**: <@${task.assignee_discord_id}>` : '',
      ``,
      dueText,
      ``,
      `🔗 タスクID: ${taskId}`
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

    // 担当者にDMで通知
    if (task.assignee_discord_id) {
      try {
        const dmMessage = [
          `⏰ **タスクの期限が設定されました**`,
          ``,
          `📌 **タスク**: ${task.title}`,
          `📅 **期限**: ${dateStr}`,
          ``,
          dueText,
          ``,
          `🔗 タスクID: ${taskId}`
        ].join('\n');
        
        await discordAPI.sendDirectMessage(task.assignee_discord_id, dmMessage);
      } catch (error) {
        // Failed to send DM notification
      }
    }

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: { 
        content: `📅 タスク「**${task.title}**」の期限を **${dateStr}** に設定しました。 ${dueText}`
      },
    };
  } catch (error) {
    throw error;
  }
}