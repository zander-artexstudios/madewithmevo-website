import { NextRequest } from 'next/server';

// Temporary auth bridge for MVP scaffolding.
// Replace with real session auth (Clerk/Auth.js/Supabase Auth) in next step.
export function requireUserId(req: NextRequest): { userId?: string; error?: string } {
  const fromHeader = req.headers.get('x-mevo-user-id');
  const fromQuery = req.nextUrl.searchParams.get('userId');
  const userId = (fromHeader || fromQuery || '').trim();

  if (!userId) {
    return { error: 'missing_user_id (use x-mevo-user-id header for now)' };
  }

  return { userId };
}
