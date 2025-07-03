import type { DiscordInteractionResponse } from '../types';
import { InteractionResponseType } from '../types';
import type { APIApplicationCommandGuildInteraction } from 'discord-api-types/v10';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { nanoid } from 'nanoid';
import type { Database } from '@/types/database';

export async function handleWumtodoSetup(
  interaction: APIApplicationCommandGuildInteraction,
  env: { DB: D1Database; DISCORD_BOT_TOKEN: string;[key: string]: any }
): Promise<DiscordInteractionResponse> {

  const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: env.DB }),
  });

  try {
    const guildId = interaction.guild_id;

    // Discord APIからサーバー情報を取得
    let guildName = 'Discord Server'; // デフォルト値
    try {
      const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
        headers: {
          'Authorization': `Bot ${env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (guildResponse.ok) {
        const guildData = await guildResponse.json() as { name: string };
        guildName = guildData.name;
      } else {
        // Failed to fetch guild info, but continue with default name
      }
    } catch (error) {
      // Error fetching guild info, but continue with default name
    }

    // 実行者の権限を確認（管理者権限が必要）
    const memberPermissions = interaction.member.permissions;
    const isAdmin = memberPermissions && (BigInt(memberPermissions) & BigInt(0x8)) !== BigInt(0); // ADMINISTRATOR permission

    if (!isAdmin) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: '❌ このコマンドはサーバー管理者のみ実行できます。',
          flags: 64 // Ephemeral
        },
      };
    }

    // チームが既に存在するか確認
    const existingTeam = await db
      .selectFrom('teams')
      .select(['id', 'name'])
      .where('discord_server_id', '=', guildId)
      .executeTakeFirst();

    if (existingTeam) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: `✅ このサーバーは既にwumtodoに登録されています！\n\nチーム名: **${existingTeam.name}**\n\n以下のコマンドが使用可能です：\n• \`/task create\` - 新しいタスクを作成\n• \`/task list\` - タスク一覧を表示\n• \`/task status\` - タスクのステータスを変更\n• \`/task assign\` - タスクの担当者を変更\n• \`/task due\` - タスクの期限を設定\n• \`/task close\` - タスクを完了\n• \`/task comment\` - タスクにコメントを追加\n\nWebインターフェース: https://wumtodo.example.com`,
          flags: 64 // Ephemeral
        },
      };
    }

    // 新しいチームを作成
    const teamId = nanoid();
    await db
      .insertInto('teams')
      .values({
        id: teamId,
        name: guildName,
        discord_server_id: guildId,
        created_at: new Date().toISOString(),
      } as any)
      .execute();

    // 実行者を管理者として登録
    const userId = interaction.member.user.id;
    const username = interaction.member.user.username;
    const avatar = interaction.member.user.avatar;


    if (userId && username) {
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

      if (user) {
        // チームメンバーとして管理者権限で追加
        await db
          .insertInto('team_members')
          .values({
            team_id: teamId,
            user_id: user.id,
            role: 'admin',
          } as any)
          .onConflict((oc) => oc.columns(['team_id', 'user_id']).doNothing())
          .execute();
      }
    }

    const setupMessage = [
      `🎉 **wumtodoのセットアップが完了しました！**`,
      ``,
      `チーム名: **${guildName}**`,
      `管理者: <@${userId}>`,
      ``,
      `**📝 使用可能なコマンド:**`,
      `• \`/task create\` - 新しいタスクを作成`,
      `• \`/task list\` - タスク一覧を表示`,
      `• \`/task status\` - タスクのステータスを変更`,
      `• \`/task assign\` - タスクの担当者を変更`,
      `• \`/task due\` - タスクの期限を設定`,
      `• \`/task close\` - タスクを完了`,
      `• \`/task comment\` - タスクにコメントを追加`,
      ``,
      `**🌐 Webインターフェース:**`,
      `${env.PUBLIC_SITE_URL || 'https://wumtodo.example.com'}`,
      ``,
      `**👥 メンバーの追加:**`,
      `1. メンバーにDiscordでwumtodoにログインしてもらう`,
      `2. その後、タスクコマンドを使用すると自動的にチームに追加されます`,
      ``,
      `**📌 ヒント:**`,
      `• タスクを作成すると自動的にスレッドが作成されます`,
      `• メンションされたユーザーにはDMで通知が送信されます`,
      `• 期限が近いタスクは自動的にリマインダーが送信されます`
    ].join('\n');

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: setupMessage
      },
    };
  } catch (error) {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: '❌ セットアップ中にエラーが発生しました。もう一度お試しください。',
        flags: 64 // Ephemeral
      },
    };
  }
}