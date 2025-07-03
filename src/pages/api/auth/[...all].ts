import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';

export const ALL: APIRoute = async ({ request, locals }) => {
  const auth = createAuth(locals.runtime.env.DB, locals.runtime.env);
  return auth.handler(request);
};