import type { Kysely } from 'kysely';
import type { Database } from '@/types/database';

export interface MentionInfo {
  discordId: string;
  username: string;
  type: 'user' | 'role' | 'everyone' | 'here';
}

export function parseMentions(text: string): string[] {
  const mentionRegex = /<@!?(\d+)>|<@&(\d+)>|@(everyone|here)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    if (match[1]) {
      mentions.push(match[1]); // ユーザーメンション
    } else if (match[2]) {
      mentions.push(match[2]); // ロールメンション
    } else if (match[3]) {
      mentions.push(match[3]); // @everyone または @here
    }
  }

  return [...new Set(mentions)];
}

export async function getMentionedUsers(
  text: string,
  db: Kysely<Database>
): Promise<MentionInfo[]> {
  const mentions = parseMentions(text);
  const mentionInfos: MentionInfo[] = [];

  for (const mention of mentions) {
    if (mention === 'everyone' || mention === 'here') {
      mentionInfos.push({
        discordId: mention,
        username: mention,
        type: mention === 'everyone' ? 'everyone' : 'here',
      });
    } else if (/^\d+$/.test(mention)) {
      // 数値のIDの場合はユーザーを検索
      const user = await db
        .selectFrom('user')
        .select(['discord_id', 'username'])
        .where('discord_id', '=', mention)
        .executeTakeFirst();

      if (user) {
        mentionInfos.push({
          discordId: user.discord_id || '',
          username: user.username || '',
          type: 'user',
        });
      }
    }
  }

  return mentionInfos;
}

export function formatMentionNotification(
  mentions: MentionInfo[],
  taskTitle: string,
  taskId: string,
  mentionContext: string,
  siteUrl?: string
): string {
  const userMentions = mentions.filter(m => m.type === 'user');
  
  if (userMentions.length === 0) {
    return '';
  }

  const mentionList = userMentions
    .map(m => `<@${m.discordId}>`)
    .join(', ');

  return [
    `🔔 **メンションされました**`,
    ``,
    `${mentionList}`,
    ``,
    `📌 **タスク**: ${taskTitle}`,
    `💬 **コンテキスト**: ${mentionContext}`,
    ``,
    `🔗 **詳細を確認**: ${siteUrl || 'https://wumtodo.pages.dev'}/tasks/${taskId}`
  ].join('\n');
}