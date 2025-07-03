import { betterAuth } from 'better-auth';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { D1Database } from '@cloudflare/workers-types';

export function createAuth(db: D1Database, env: any) {
  const kyselyDb = new Kysely({
    dialect: new D1Dialect({ database: db }),
  });

  return betterAuth({
    database: {
      db: kyselyDb as any,
      type: 'sqlite',
    },
    
    socialProviders: {
      discord: {
        clientId: env.DISCORD_CLIENT_ID,
        clientSecret: env.DISCORD_CLIENT_SECRET,
        redirectURI: `${env.PUBLIC_SITE_URL}/api/auth/callback/discord`,
      },
    },
    
    session: {
      cookieName: 'wumtodo-session',
      expiresIn: 60 * 60 * 24 * 7, // 7 days
    },
    
    emailAndPassword: {
      enabled: false,
    },
    
    baseURL: env.PUBLIC_SITE_URL,
    secret: env.BETTER_AUTH_SECRET,
    
    // データベースフックを使用してアカウント作成時にDiscord IDを保存
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            // 新規ユーザー作成時の処理
            
            // 初期値として username と avatar_url を設定
            if (user.name) {
              try {
                await kyselyDb
                  .updateTable('user' as any)
                  .set({
                    username: user.name,
                    avatar_url: user.image || null,
                    updatedAt: new Date().toISOString(),
                  } as any)
                  .where('id' as any, '=', user.id)
                  .execute();
              } catch (error) {
                // Failed to update user info
              }
            }
          },
        },
      },
      account: {
        create: {
          after: async (account) => {
            // Discord アカウントが作成された場合
            if (account.providerId === 'discord' && account.accountId) {
              // ユーザーテーブルにDiscord IDを保存
              try {
                // Discord IDと共に、ユーザー情報も更新
                const userResult = await kyselyDb
                  .selectFrom('user' as any)
                  .selectAll()
                  .where('id' as any, '=', account.userId)
                  .executeTakeFirst() as any;
                
                if (userResult) {
                  await kyselyDb
                    .updateTable('user' as any)
                    .set({
                      discord_id: account.accountId,
                      username: userResult.name || null,
                      avatar_url: userResult.image || null,
                      updatedAt: new Date().toISOString(),
                    } as any)
                    .where('id' as any, '=', account.userId)
                    .execute();
                }
              } catch (error) {
                // Failed to update Discord ID
              }
            }
          },
        },
      },
    },
  });
}