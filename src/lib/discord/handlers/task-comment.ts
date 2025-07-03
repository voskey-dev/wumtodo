import type { DiscordInteractionResponse } from '../types';
import { InteractionResponseType } from '../types';
import type { APIApplicationCommandGuildInteraction, APIApplicationCommandInteractionDataSubcommandOption, APIChatInputApplicationCommandInteractionData } from 'discord-api-types/v10';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { nanoid } from 'nanoid';
import type { Database } from '@/types/database';
import { DiscordAPI } from '../api';
import { getMentionedUsers, formatMentionNotification } from '../mention';
import { resolveTaskId, getTaskIdFromOptions } from '../utils/task-resolver';

export async function handleTaskComment(
  interaction: APIApplicationCommandGuildInteraction,
  env: { DB: D1Database; DISCORD_BOT_TOKEN: string; [key: string]: any }
): Promise<DiscordInteractionResponse> {

  const data = interaction.data as APIChatInputApplicationCommandInteractionData;
  const subcommand = data.options?.[0] as APIApplicationCommandInteractionDataSubcommandOption | undefined;
  const options = subcommand?.options || [];
  
  const providedTaskId = getTaskIdFromOptions(options);
  const content = options.find((o) => o.name === 'content')?.value as string;

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
    // ユーザー情報を確認/作成
    const userId = interaction.member.user.id;
    const username = interaction.member.user.username;

    // ユーザー情報を取得
    const user = await db
      .selectFrom('user')
      .select(['id'])
      .where('discord_id', '=', userId)
      .executeTakeFirst();

    if (!user) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { content: 'ユーザー情報が見つかりません。' },
      };
    }

    // タスク情報を取得
    const task = await db
      .selectFrom('tasks')
      .leftJoin('user as assignee', 'tasks.assignee_id', 'assignee.id')
      .leftJoin('user as creator', 'tasks.creator_id', 'creator.id')
      .select([
        'tasks.id',
        'tasks.title',
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

    // コメントを作成
    const commentId = nanoid();
    await db
      .insertInto('task_comments')
      .values({
        id: commentId,
        task_id: taskId,
        user_id: user.id,
        content: content,
        created_at: new Date().toISOString(),
      } as any)
      .execute();

    // メンションの処理
    const mentionedUsers = await getMentionedUsers(content, db);

    // Discord APIクライアントを初期化
    const discordAPI = new DiscordAPI(env.DISCORD_BOT_TOKEN);

    // コメント通知メッセージを作成
    const notificationMessage = [
      `💬 **新しいコメントが追加されました**`,
      ``,
      `📌 **タスク**: ${task.title}`,
      `👤 **コメント者**: <@${userId}>`,
      ``,
      `**内容**:`,
      content,
      ``,
      `🔗 タスクID: ${taskId}`
    ].join('\n');

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

    // メンションされたユーザーに個別に通知
    if (mentionedUsers.length > 0) {
      const mentionNotification = formatMentionNotification(
        mentionedUsers,
        task.title,
        taskId,
        `コメント: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`
      );
      
      // 各ユーザーにDMで通知
      for (const mentionedUser of mentionedUsers.filter(m => m.type === 'user')) {
        try {
          await discordAPI.sendDirectMessage(mentionedUser.discordId, mentionNotification);
        } catch (error) {
          // Failed to send DM to mentioned user
        }
      }
    }

    // タスク関係者（作成者・担当者）にも通知
    const stakeholders = new Set<string>();
    if (task.creator_discord_id && task.creator_discord_id !== userId) {
      stakeholders.add(task.creator_discord_id);
    }
    if (task.assignee_discord_id && task.assignee_discord_id !== userId) {
      stakeholders.add(task.assignee_discord_id);
    }

    for (const stakeholderId of stakeholders) {
      try {
        const dmMessage = [
          `💬 **タスクに新しいコメントが追加されました**`,
          ``,
          `📌 **タスク**: ${task.title}`,
          `👤 **コメント者**: <@${userId}>`,
          ``,
          `**内容**:`,
          content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          ``,
          `🔗 タスクID: ${taskId}`
        ].join('\n');
        
        await discordAPI.sendDirectMessage(stakeholderId, dmMessage);
      } catch (error) {
        // Failed to send DM to stakeholder
      }
    }

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: { 
        content: `💬 コメントを追加しました。`
      },
    };
  } catch (error) {
    throw error;
  }
}