import type { APIRoute } from 'astro';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { Database } from '@/types/database';

export const GET: APIRoute = async (request) => {
  // 認証チェック
  if (!request.locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const priority = url.searchParams.get('priority');
  const assignee = url.searchParams.get('assignee');
  const search = url.searchParams.get('search');
  const sort = url.searchParams.get('sort') || 'created_at';
  const order = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: request.locals.runtime.env.DB }),
  });

  try {
    // ユーザーが所属するチームを取得
    const userTeams = await db
      .selectFrom('team_members')
      .innerJoin('teams', 'teams.id', 'team_members.team_id')
      .select(['teams.id'])
      .where('team_members.user_id', '=', request.locals.user.id)
      .execute();

    if (userTeams.length === 0) {
      return new Response(JSON.stringify({ tasks: [], total: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const teamIds = userTeams.map(t => t.id);

    // タスクを取得
    let query = db
      .selectFrom('tasks')
      .leftJoin('user as assignee', 'assignee.id', 'tasks.assignee_id')
      .leftJoin('user as creator', 'creator.id', 'tasks.creator_id')
      .innerJoin('teams', 'teams.id', 'tasks.team_id')
      .select([
        'tasks.id',
        'tasks.title',
        'tasks.description',
        'tasks.status',
        'tasks.priority',
        'tasks.due_date',
        'tasks.created_at',
        'tasks.updated_at',
        'tasks.team_id',
        'teams.name as team_name',
        'assignee.id as assignee_id',
        'assignee.username as assignee_username',
        'assignee.avatar_url as assignee_avatar_url',
        'creator.id as creator_id',
        'creator.username as creator_username',
        'creator.avatar_url as creator_avatar_url',
      ])
      .where('tasks.team_id', 'in', teamIds);

    // フィルター適用
    if (status && status !== 'all') {
      query = query.where('tasks.status', '=', status);
    }

    if (priority && priority !== 'all') {
      query = query.where('tasks.priority', '=', priority);
    }

    if (assignee === 'me') {
      query = query.where('tasks.assignee_id', '=', request.locals.user.id);
    } else if (assignee === 'unassigned') {
      query = query.where('tasks.assignee_id', 'is', null);
    } else if (assignee && assignee !== 'all') {
      // 特定のユーザーIDでフィルタリング
      query = query.where('tasks.assignee_id', '=', assignee);
    }

    // 検索条件を適用
    if (search) {
      query = query.where('tasks.title', 'like', `%${search}%`);
    }

    // ソート適用
    if (sort === 'due_date') {
      query = query.orderBy('tasks.due_date', order);
    } else if (sort === 'priority') {
      // 優先度でソート (high > medium > low)
      if (order === 'desc') {
        query = query.orderBy('tasks.priority', 'asc'); // high, low, medium という順になるため別途処理
      } else {
        query = query.orderBy('tasks.priority', 'desc');
      }
    } else if (sort === 'status') {
      // ステータスでソート
      query = query.orderBy('tasks.status', order);
    } else {
      query = query.orderBy('tasks.created_at', order);
    }

    // 総数を取得
    const countQuery = db
      .selectFrom('tasks')
      .select(db.fn.count<number>('tasks.id').as('count'))
      .where('tasks.team_id', 'in', teamIds);
    
    // 同じフィルターを適用
    if (status && status !== 'all') {
      countQuery.where('tasks.status', '=', status);
    }
    if (priority && priority !== 'all') {
      countQuery.where('tasks.priority', '=', priority);
    }
    if (assignee === 'me') {
      countQuery.where('tasks.assignee_id', '=', request.locals.user.id);
    } else if (assignee === 'unassigned') {
      countQuery.where('tasks.assignee_id', 'is', null);
    }
    if (search) {
      countQuery.where('tasks.title', 'like', `%${search}%`);
    }
    
    const countResult = await countQuery.executeTakeFirst();
    const total = countResult?.count || 0;

    // ページネーションを適用してタスクを取得
    const tasks = await query
      .limit(limit)
      .offset(offset)
      .execute();

    // レスポンス用にデータを整形
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
      created_at: task.created_at,
      updated_at: task.updated_at,
      team: {
        id: task.team_id,
        name: task.team_name!,
      },
      assignee: task.assignee_id ? {
        id: task.assignee_id,
        username: task.assignee_username!,
        avatar_url: task.assignee_avatar_url,
      } : null,
      creator: task.creator_id ? {
        id: task.creator_id,
        username: task.creator_username!,
        avatar_url: task.creator_avatar_url,
      } : null,
    }));

    return new Response(JSON.stringify({ tasks: formattedTasks, total }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};