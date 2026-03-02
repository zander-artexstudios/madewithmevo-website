import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const isAuthed = cookies().get('mevo_admin')?.value === '1';
  if (!isAuthed) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('waitlist_signups')
    .select('id,email,created_at,referrer,user_agent')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, rows: data ?? [] });
}
