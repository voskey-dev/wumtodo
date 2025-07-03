import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { Database } from '@/types/database';
import { DiscordAPI } from '@/lib/discord/api';

export interface Env {
  DB: D1Database;
  DISCORD_BOT_TOKEN: string;
}

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    await handleReminder(env);
  },
};

async function handleReminder(env: Env) {
  const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: env.DB }),
  });

  const discordAPI = new DiscordAPI(env.DISCORD_BOT_TOKEN);
  
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // 期限が迫っているタスクを取得
    // 1. 今日が期限のタスク
    // 2. 明日が期限のタスク
    // 3. 期限切れのタスク（未完了）
    const tasks = await db
      .selectFrom('tasks')
      .leftJoin('user as assignee', 'tasks.assignee_id', 'assignee.id')
      .leftJoin('user as creator', 'tasks.creator_id', 'creator.id')
      .leftJoin('teams', 'tasks.team_id', 'teams.id')
      .select([
        'tasks.id',
        'tasks.title',
        'tasks.due_date',
        'tasks.status',
        'tasks.discord_thread_id',
        'tasks.discord_channel_id',
        'assignee.discord_id as assignee_discord_id',
        'assignee.username as assignee_username',
        'creator.discord_id as creator_discord_id',
        'creator.username as creator_username',
        'teams.discord_server_id'
      ])
      .where('tasks.status', '!=', 'completed')
      .where('tasks.due_date', 'is not', null)
      .execute();

    for (const task of tasks) {
      if (!task.due_date) continue;
      
      const dueDate = new Date(task.due_date);
      const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let shouldNotify = false;
      let urgencyLevel = '';
      let urgencyEmoji = '';
      
      if (daysUntilDue < 0) {
        // 期限切れ
        shouldNotify = true;
        urgencyLevel = '期限切れ';
        urgencyEmoji = '🚨';
      } else if (daysUntilDue === 0) {
        // 今日が期限
        shouldNotify = true;
        urgencyLevel = '今日が期限';
        urgencyEmoji = '⚠️';
      } else if (daysUntilDue === 1) {
        // 明日が期限
        shouldNotify = true;
        urgencyLevel = '明日が期限';
        urgencyEmoji = '📅';
      }
      
      if (shouldNotify) {
        const reminderMessage = [
          `${urgencyEmoji} **タスクリマインダー: ${urgencyLevel}**`,
          ``,
          `📌 **タスク**: ${task.title}`,
          `📅 **期限**: ${dueDate.toISOString().split('T')[0]}`,
          `📊 **ステータス**: ${task.status === 'todo' ? '未着手' : '進行中'}`,
          task.assignee_discord_id ? `👤 **担当者**: <@${task.assignee_discord_id}>` : '',
          ``,
          `🔗 タスクID: ${task.id}`
        ].filter(Boolean).join('\n');
        
        // スレッドまたはチャンネルに通知
        if (task.discord_thread_id) {
          try {
            await discordAPI.sendMessage(task.discord_thread_id, reminderMessage);
          } catch (error) {
            console.error(`Failed to send reminder to thread ${task.discord_thread_id}:`, error);
          }
        } else if (task.discord_channel_id) {
          try {
            await discordAPI.sendMessage(task.discord_channel_id, reminderMessage);
          } catch (error) {
            console.error(`Failed to send reminder to channel ${task.discord_channel_id}:`, error);
          }
        }
        
        // 担当者にDMで通知
        if (task.assignee_discord_id) {
          try {
            const dmMessage = [
              `${urgencyEmoji} **リマインダー: ${urgencyLevel}です！**`,
              ``,
              `📌 **タスク**: ${task.title}`,
              `📅 **期限**: ${dueDate.toISOString().split('T')[0]}`,
              ``,
              daysUntilDue < 0 
                ? `⏰ このタスクは${Math.abs(daysUntilDue)}日遅れています。`
                : daysUntilDue === 0
                ? `⏰ このタスクは今日中に完了する必要があります。`
                : `⏰ このタスクは明日までに完了する必要があります。`,
              ``,
              `🔗 タスクID: ${task.id}`
            ].join('\n');
            
            await discordAPI.sendDirectMessage(task.assignee_discord_id, dmMessage);
          } catch (error) {
            console.error(`Failed to send DM reminder to ${task.assignee_discord_id}:`, error);
          }
        }
        
        // タスク作成者にもDMで通知（担当者と異なる場合）
        if (task.creator_discord_id && task.creator_discord_id !== task.assignee_discord_id) {
          try {
            const creatorDmMessage = [
              `${urgencyEmoji} **作成したタスクのリマインダー**`,
              ``,
              `📌 **タスク**: ${task.title}`,
              `📅 **期限**: ${dueDate.toISOString().split('T')[0]} (${urgencyLevel})`,
              task.assignee_discord_id ? `👤 **担当者**: <@${task.assignee_discord_id}>` : '👤 **担当者**: 未割当',
              ``,
              `🔗 タスクID: ${task.id}`
            ].join('\n');
            
            await discordAPI.sendDirectMessage(task.creator_discord_id, creatorDmMessage);
          } catch (error) {
            console.error(`Failed to send DM reminder to creator ${task.creator_discord_id}:`, error);
          }
        }
      }
    }
    
    // Reminder job completed
  } catch (error) {
    console.error('Reminder job error:', error);
    throw error;
  }
}