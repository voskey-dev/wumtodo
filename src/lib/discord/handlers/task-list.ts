import type { DiscordInteractionResponse } from '../types';
import { InteractionResponseType } from '../types';
import type { 
  APIApplicationCommandGuildInteraction, 
  APIApplicationCommandInteractionDataSubcommandOption,
  APIChatInputApplicationCommandInteractionData 
} from 'discord-api-types/v10';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { Database } from '@/types/database';

export async function handleTaskList(
  interaction: APIApplicationCommandGuildInteraction,
  env: any
): Promise<DiscordInteractionResponse> {

  const data = interaction.data as APIChatInputApplicationCommandInteractionData;
  const subcommand = data.options?.[0] as APIApplicationCommandInteractionDataSubcommandOption | undefined;
  const options = subcommand?.options || [];
  
  const statusFilter = options.find((o) => o.name === 'status')?.value as string | undefined;
  const assigneeFilter = options.find((o) => o.name === 'assignee')?.value as string | undefined;

  const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: env.DB }),
  });

  try {
    const guildId = interaction.guild_id;

    // チーム情報を取得
    const team = await db
      .selectFrom('teams')
      .select(['id'])
      .where('discord_server_id', '=', guildId)
      .executeTakeFirst();

    if (!team) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { content: 'このサーバーではまだタスクが作成されていません。' },
      };
    }

    // タスク一覧を取得
    let query = db
      .selectFrom('tasks')
      .leftJoin('user as assignee', 'assignee.id', 'tasks.assignee_id')
      .leftJoin('user as creator', 'creator.id', 'tasks.creator_id')
      .select([
        'tasks.id',
        'tasks.title',
        'tasks.description',
        'tasks.status',
        'tasks.priority',
        'tasks.due_date',
        'assignee.discord_id as assignee_discord_id',
        'assignee.username as assignee_username',
        'creator.username as creator_username',
      ])
      .where('tasks.team_id', '=', team.id);

    if (statusFilter) {
      query = query.where('tasks.status', '=', statusFilter);
    }

    if (assigneeFilter) {
      const assigneeUser = await db
        .selectFrom('user')
        .select(['id'])
        .where('discord_id', '=', assigneeFilter)
        .executeTakeFirst();
      
      if (assigneeUser) {
        query = query.where('tasks.assignee_id', '=', assigneeUser.id);
      }
    }

    const tasks = await query.execute();

    if (tasks.length === 0) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { content: '該当するタスクが見つかりませんでした。' },
      };
    }

    // タスクリストをフォーマット
    const taskList = tasks.map(task => {
      const status = task.status === 'todo' ? '📋' : task.status === 'in_progress' ? '🔄' : '✅';
      const priority = task.priority === 'high' ? '🔴' : task.priority === 'low' ? '🔵' : '🟡';
      const assignee = task.assignee_discord_id ? `<@${task.assignee_discord_id}>` : '未割当';
      const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('ja-JP') : 'なし';
      
      return `${status} **${task.title}** (ID: ${task.id})
   ${priority} 優先度 | 担当: ${assignee} | 期限: ${dueDate}`;
    }).join('\n\n');

    const response = `📋 **タスク一覧**\n\n${taskList}\n\n🔗 **すべてのタスクを確認**: ${env.PUBLIC_SITE_URL || 'https://wumtodo.pages.dev'}/tasks`;

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: { 
        content: response,
        flags: 64 // Ephemeral (only visible to command user)
      },
    };
  } catch (error) {
    throw error;
  }
}