import type { DiscordInteractionResponse } from '../types';
import { InteractionResponseType } from '../types';
import type { APIApplicationCommandGuildInteraction, APIApplicationCommandInteractionDataSubcommandOption, APIChatInputApplicationCommandInteractionData } from 'discord-api-types/v10';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { nanoid } from 'nanoid';
import type { Database } from '@/types/database';
import { getMentionedUsers, formatMentionNotification } from '../mention';

export async function handleTaskCreate(
  interaction: APIApplicationCommandGuildInteraction,
  env: any
): Promise<DiscordInteractionResponse> {
  // APIApplicationCommandGuildInteraction型のため、ギルドチェックは不要

  // Type guard to ensure we have chat input data
  if (!('options' in interaction.data)) {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: { content: 'このコマンドはチャット入力コマンドではありません。' },
    };
  }

  const chatInputData = interaction.data as APIChatInputApplicationCommandInteractionData;
  const subcommand = chatInputData.options?.[0] as APIApplicationCommandInteractionDataSubcommandOption | undefined;
  const options = subcommand?.options || [];
  
  const title = options.find((o) => o.name === 'title')?.value as string;
  const description = options.find((o) => o.name === 'description')?.value as string | undefined;
  const assigneeId = options.find((o) => o.name === 'assignee')?.value as string | undefined;
  const priority = options.find((o) => o.name === 'priority')?.value as string | undefined;

  const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: env.DB }),
  });

  try {
    // ユーザー情報を確認/作成
    const userId = interaction.member.user.id;
    const username = interaction.member.user.username;
    const avatar = interaction.member.user.avatar;

    // ユーザーが存在しない場合は作成
    await db
      .insertInto('user')
      .values({
        id: nanoid(),
        discord_id: userId,
        username: username,
        avatar_url: avatar ? `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png` : null,
        name: username,
        email: `${userId}@discord.local`,
        emailVerified: false,
        image: avatar ? `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png` : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any)
      .onConflict((oc) => oc.column('discord_id').doNothing())
      .execute();

    // ユーザー情報を取得
    const user = await db
      .selectFrom('user')
      .select(['id'])
      .where('discord_id', '=', userId)
      .executeTakeFirst();

    if (!user) {
      throw new Error('User not found after creation');
    }

    // チーム情報を確認/作成
    const guildId = interaction.guild_id;
    const guildName = 'Discord Server'; // Guild名はWebhookでは取得できない

    // チームが存在しない場合のみ作成
    const existingTeam = await db
      .selectFrom('teams')
      .select(['id'])
      .where('discord_server_id', '=', guildId)
      .executeTakeFirst();
    
    if (!existingTeam) {
      await db
        .insertInto('teams')
        .values({
          id: nanoid(),
          discord_server_id: guildId,
          name: guildName,
          created_at: new Date().toISOString(),
        } as any)
        .execute();
    }

    const team = await db
      .selectFrom('teams')
      .select(['id'])
      .where('discord_server_id', '=', guildId)
      .executeTakeFirst();

    if (!team) {
      throw new Error('Team not found after creation');
    }

    // チームメンバーとして追加
    await db
      .insertInto('team_members')
      .values({
        team_id: team.id,
        user_id: user.id,
        role: 'member',
      } as any)
      .onConflict((oc) => oc.columns(['team_id', 'user_id']).doNothing())
      .execute();

    // 担当者の処理
    let assigneeUserId = null;
    if (assigneeId) {
      const assigneeUser = await db
        .selectFrom('user')
        .select(['id'])
        .where('discord_id', '=', assigneeId)
        .executeTakeFirst();
      
      assigneeUserId = assigneeUser?.id || null;
    }

    // タスクを作成
    const taskId = nanoid();
    await db
      .insertInto('tasks')
      .values({
        id: taskId,
        title,
        description: description || null,
        status: 'todo',
        priority: priority || 'medium',
        team_id: team.id,
        assignee_id: assigneeUserId,
        creator_id: user.id,
        discord_thread_id: null,
        discord_channel_id: interaction.channel.id || null,
        due_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .execute();

    // メンションの処理
    const allText = `${title} ${description || ''}`;
    const mentionedUsers = await getMentionedUsers(allText, db);

    // Discordにスレッドを作成
    if (interaction.channel.id && env.DISCORD_BOT_TOKEN) {
      try {
        const { DiscordAPI } = await import('../api');
        const api = new DiscordAPI(env.DISCORD_BOT_TOKEN);
        
        const threadMessage = `📋 **タスク: ${title}**\n\n${description || '説明なし'}\n\n**優先度**: ${priority === 'high' ? '高' : priority === 'low' ? '低' : '中'}\n**担当者**: ${assigneeId ? `<@${assigneeId}>` : '未割当'}\n**作成者**: <@${userId}>\n\n🔗 **詳細を確認**: <${env.PUBLIC_SITE_URL || 'https://wumtodo.pages.dev'}/tasks/${taskId}>`;
        
        const thread = await api.createThread(
          interaction.channel.id,
          `📋 ${title}`,
          threadMessage
        );
        
        await db
          .updateTable('tasks')
          .set({ discord_thread_id: thread.id })
          .where('id', '=', taskId)
          .execute();

        // メンションされたユーザーに通知
        if (mentionedUsers.length > 0) {
          const mentionNotification = formatMentionNotification(
            mentionedUsers,
            title,
            taskId,
            'タスクの作成時',
            env.PUBLIC_SITE_URL
          );
          
          if (mentionNotification) {
            await api.sendMessage(thread.id, mentionNotification);
          }
        }
      } catch (error) {
        // スレッド作成に失敗してもタスク作成は成功とする
      }
    }

    const response = `✅ タスクを作成しました！
**タイトル**: ${title}
**ID**: ${taskId}
${description ? `**説明**: ${description}` : ''}
${assigneeId ? `**担当者**: <@${assigneeId}>` : ''}
**優先度**: ${priority === 'high' ? '高' : priority === 'low' ? '低' : '中'}

🔗 **詳細を確認**: <${env.PUBLIC_SITE_URL || 'https://wumtodo.pages.dev'}/tasks/${taskId}>`;

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: { content: response },
    };
  } catch (error) {
    throw error;
  }
}