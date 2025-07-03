import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { Database } from '@/types/database';
import type { APIApplicationCommandGuildInteraction } from 'discord-api-types/v10';

/**
 * Discord インタラクションのチャンネルIDからタスクIDを解決する
 * @param interaction Discord インタラクション
 * @param db データベース接続
 * @param providedTaskId 明示的に提供されたタスクID（オプション）
 * @returns タスクIDまたはnull
 */
export async function resolveTaskId(
  interaction: APIApplicationCommandGuildInteraction,
  db: Kysely<Database>,
  providedTaskId?: string
): Promise<string | null> {
  // 明示的にタスクIDが提供されている場合はそれを使用
  if (providedTaskId) {
    return providedTaskId;
  }

  // インタラクションがスレッド内で実行された場合、そのスレッドIDからタスクを検索
  const channelId = interaction.channel_id;
  
  if (!channelId) {
    return null;
  }

  try {
    // スレッドIDからタスクを検索
    const task = await db
      .selectFrom('tasks')
      .select(['id'])
      .where('discord_thread_id', '=', channelId)
      .executeTakeFirst();

    return task?.id || null;
  } catch (error) {
    // Error resolving task ID from thread
    return null;
  }
}

/**
 * タスクIDパラメータを取得するヘルパー関数
 * @param options コマンドオプション配列
 * @returns タスクIDまたはundefined
 */
export function getTaskIdFromOptions(options: any[]): string | undefined {
  return options.find((o) => o.name === 'task_id')?.value as string | undefined;
}