import type { APIRoute } from 'astro';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { Database } from '@/types/database';

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  // 認証チェック
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id: teamId, userId } = params;
  
  interface UpdateMemberRoleBody {
    role: 'admin' | 'member';
  }
  
  const { role } = await request.json() as UpdateMemberRoleBody;

  if (!teamId || !userId || !role) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!['admin', 'member'].includes(role)) {
    return new Response(JSON.stringify({ error: 'Invalid role' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: locals.runtime.env.DB }),
  });

  try {
    // 現在のユーザーが管理者権限を持っているか確認
    const currentUserMember = await db
      .selectFrom('team_members')
      .select(['role'])
      .where('team_id', '=', teamId)
      .where('user_id', '=', locals.user.id)
      .executeTakeFirst();

    if (!currentUserMember || currentUserMember.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Permission denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 自分自身の管理者権限を削除しようとしていないか確認
    if (locals.user.id === userId && role !== 'admin') {
      // 他に管理者がいるか確認
      const adminCount = await db
        .selectFrom('team_members')
        .select(db.fn.count<number>('user_id').as('count'))
        .where('team_id', '=', teamId)
        .where('role', '=', 'admin')
        .executeTakeFirst();

      if (adminCount?.count === 1) {
        return new Response(JSON.stringify({ error: 'Cannot remove the last admin' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // ロールを更新
    await db
      .updateTable('team_members')
      .set({ role })
      .where('team_id', '=', teamId)
      .where('user_id', '=', userId)
      .execute();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  // 認証チェック
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id: teamId, userId } = params;

  if (!teamId || !userId) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: locals.runtime.env.DB }),
  });

  try {
    // 現在のユーザーが管理者権限を持っているか確認
    const currentUserMember = await db
      .selectFrom('team_members')
      .select(['role'])
      .where('team_id', '=', teamId)
      .where('user_id', '=', locals.user.id)
      .executeTakeFirst();

    if (!currentUserMember || currentUserMember.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Permission denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 自分自身を削除しようとしていないか確認
    if (locals.user.id === userId) {
      return new Response(JSON.stringify({ error: 'Cannot remove yourself' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // メンバーを削除
    await db
      .deleteFrom('team_members')
      .where('team_id', '=', teamId)
      .where('user_id', '=', userId)
      .execute();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};