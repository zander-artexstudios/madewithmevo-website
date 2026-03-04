import { createClient, type Session } from '@supabase/supabase-js';
import { getPublicSupabaseEnv } from '@/lib/mevo/env';

let browserClient: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (typeof window === 'undefined') return null;
  if (browserClient) return browserClient;

  const { url, anonKey } = getPublicSupabaseEnv();

  browserClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  return browserClient;
}

export function getMevoSupabaseClient() {
  const client = getClient();
  if (!client) throw new Error('Supabase client is only available in the browser');
  return client;
}

export async function getMevoSession(): Promise<Session | null> {
  const client = getClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session ?? null;
}

export async function mevoFetch(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(init?.headers || {});
  const url = typeof input === 'string' ? input : input.toString();

  if (url.startsWith('/api/mevo/')) {
    const session = await getMevoSession();
    const token = session?.access_token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.get('Content-Type') && init?.body) headers.set('Content-Type', 'application/json');

  return fetch(input, {
    ...init,
    headers
  });
}
