import type { APIRoute } from 'astro';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { Database } from '@/types/database';

export const PATCH: APIRoute = async ({ request, params, locals }) => {
  // 認証チェック
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const taskId = params.id;
  if (!taskId) {
    return new Response(JSON.stringify({ error: 'Task ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  interface UpdateTaskBody {
    title?: string;
    description?: string | null;
    status?: 'todo' | 'in_progress' | 'done';
    priority?: 'low' | 'medium' | 'high';
  }

  const body = await request.json() as UpdateTaskBody;
  const { title, description, status, priority } = body;

  const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: locals.runtime.env.DB }),
  });

  try {
    // タスクの存在とユーザーの権限をチェック
    const task = await db
      .selectFrom('tasks')
      .innerJoin('team_members', 'team_members.team_id', 'tasks.team_id')
      .select(['tasks.id'])
      .where('tasks.id', '=', taskId)
      .where('team_members.user_id', '=', locals.user.id)
      .executeTakeFirst();

    if (!task) {
      return new Response(JSON.stringify({ error: 'Task not found or access denied' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // タスクを更新
    const updateData: Partial<{
      title: string;
      description: string | null;
      status: 'todo' | 'in_progress' | 'done';
      priority: 'low' | 'medium' | 'high';
      updated_at: string;
    }> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;

    await db
      .updateTable('tasks')
      .set(updateData)
      .where('id', '=', taskId)
      .execute();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};