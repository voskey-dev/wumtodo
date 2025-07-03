import type { APIRoute } from 'astro';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { nanoid } from 'nanoid';
import type { Database } from '@/types/database';

export const POST: APIRoute = async ({ request, params, locals }) => {
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

  interface AddCommentBody {
    content: string;
  }

  const body = await request.json() as AddCommentBody;
  const { content } = body;

  if (!content || !content.trim()) {
    return new Response(JSON.stringify({ error: 'Content is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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

    // コメントを追加
    const commentId = nanoid();
    await db
      .insertInto('task_comments')
      .values({
        id: commentId,
        task_id: taskId,
        user_id: locals.user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
      })
      .execute();

    return new Response(JSON.stringify({ success: true, id: commentId }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};