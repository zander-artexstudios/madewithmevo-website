import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

type AuthResult = {
  userId?: string;
  error?: string;
  status?: number;
};

function readBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

export async function requireUserId(req: NextRequest): Promise<AuthResult> {
  const devUserId = process.env.MEVO_DEV_USER_ID?.trim();
  if (devUserId && process.env.NODE_ENV !== 'production') {
    return { userId: devUserId };
  }

  const token = readBearerToken(req);
  if (!token) {
    return { error: 'unauthorized', status: 401 };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.id) {
      return { error: 'unauthorized', status: 401 };
    }

    return { userId: data.user.id };
  } catch {
    return { error: 'auth_unavailable', status: 503 };
  }
}

export function requireSchedulerKey(req: NextRequest): AuthResult {
  const configured = process.env.MEVO_SCHEDULER_KEY?.trim();
  if (!configured) {
    return { error: 'scheduler_key_not_configured', status: 503 };
  }

  const provided = req.headers.get('x-mevo-scheduler-key')?.trim();
  if (!provided || provided !== configured) {
    return { error: 'unauthorized', status: 401 };
  }

  return { userId: 'scheduler' };
}
