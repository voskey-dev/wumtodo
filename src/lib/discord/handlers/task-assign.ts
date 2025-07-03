import type { DiscordInteractionResponse } from '../types';
import { InteractionResponseType } from '../types';
import type { APIApplicationCommandGuildInteraction, APIApplicationCommandInteractionDataSubcommandOption, APIChatInputApplicationCommandInteractionData } from 'discord-api-types/v10';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { nanoid } from 'nanoid';
import type { Database } from '@/types/database';
import { DiscordAPI } from '../api';
import { resolveTaskId, getTaskIdFromOptions } from '../utils/task-resolver';

export async function handleTaskAssign(
  interaction: APIApplicationCommandGuildInteraction,
  env: { DB: D1Database; DISCORD_BOT_TOKEN: string; [key: string]: any }
): Promise<DiscordInteractionResponse> {

  const data = interaction.data as APIChatInputApplicationCommandInteractionData;
  const subcommand = data.options?.[0] as APIApplicationCommandInteractionDataSubcommandOption | undefined;
  const options = subcommand?.options || [];
  
  const providedTaskId = getTaskIdFromOptions(options);
  const userId = options.find((o) => o.name === 'user')?.value as string;

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
    // 担当者のユーザー情報を確認/作成
    let assigneeUser = await db
      .selectFrom('user')
      .select(['id'])
      .where('discord_id', '=', userId)
      .executeTakeFirst();

    if (!assigneeUser) {
      // ユーザーが存在しない場合は作成（基本情報のみ）
      await db
        .insertInto('user')
        .values({
          id: nanoid(),
          discord_id: userId,
          username: 'Discord User', // TODO: Discord APIから実際のユーザー名を取得
          avatar_url: null,
          name: 'Discord User',
          email: `${userId}@discord.local`,
          emailVerified: false,
          image: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any)
        .execute();

      assigneeUser = await db
        .selectFrom('user')
        .select(['id'])
        .where('discord_id', '=', userId)
        .executeTakeFirst();
    }

    if (!assigneeUser) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { content: 'ユーザー情報の作成に失敗しました。' },
      };
    }

    // 既存のタスク情報を取得
    const task = await db
      .selectFrom('tasks')
      .leftJoin('user as old_assignee', 'tasks.assignee_id', 'old_assignee.id')
      .leftJoin('user as creator', 'tasks.creator_id', 'creator.id')
      .select([
        'tasks.id',
        'tasks.title',
        'tasks.discord_thread_id',
        'tasks.discord_channel_id',
        'old_assignee.discord_id as old_assignee_discord_id',
        'old_assignee.username as old_assignee_username',
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
    await db
      .updateTable('tasks')
      .set({ 
        assignee_id: assigneeUser.id,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', taskId)
      .executeTakeFirst();

    // 通知メッセージを作成
    const notificationMessage = [
      `👥 **タスクの担当者が変更されました**`,
      ``,
      `📌 **タスク**: ${task.title}`,
      `👤 **変更者**: <@${interaction.member.user.id}>`,
      `🔄 **変更**: ${task.old_assignee_discord_id ? `<@${task.old_assignee_discord_id}>` : '未割当'} → <@${userId}>`,
      ``,
      `🔗 タスクID: ${taskId}`
    ].join('\n');

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

    // 新しい担当者にDMで通知
    try {
      const dmMessage = [
        `🎯 **新しいタスクが割り当てられました**`,
        ``,
        `📌 **タスク**: ${task.title}`,
        `👤 **割り当て者**: <@${interaction.member.user.id}>`,
        ``,
        `このタスクはあなたに割り当てられました。`,
        `🔗 タスクID: ${taskId}`
      ].join('\n');
      
      await discordAPI.sendDirectMessage(userId, dmMessage);
    } catch (error) {
      // Failed to send DM notification
    }

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: { 
        content: `👤 タスク「**${task.title}**」の担当者を <@${userId}> に変更しました。\n\n🔗 **詳細を確認**: ${env.PUBLIC_SITE_URL || 'https://wumtodo.pages.dev'}/tasks/${taskId}`
      },
    };
  } catch (error) {
    throw error;
  }
}