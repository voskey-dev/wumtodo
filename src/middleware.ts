import { defineMiddleware } from 'astro:middleware';
import { createAuth } from '@/lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  // 保護されたルートのリスト
  const protectedRoutes = ['/dashboard', '/tasks', '/teams', '/profile', '/api/tasks'];
  
  
  // 保護されたルートかチェック
  const isProtectedRoute = protectedRoutes.some(route => 
    context.url.pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    try {
      const auth = createAuth(
        context.locals.runtime.env.DB,
        context.locals.runtime.env
      );
      
      const session = await auth.api.getSession({
        headers: context.request.headers,
      });
      
      if (!session?.user) {
        return context.redirect('/');
      }
      
      // セッション情報をlocalsに保存
      context.locals.user = session.user;
    } catch (error) {
      console.error('Auth middleware error:', error);
      return context.redirect('/');
    }
  }
  
  return next();
});