import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';
import { toCsv } from '@/lib/csv';

export async function GET() {
  const isAuthed = cookies().get('mevo_admin')?.value === '1';
  if (!isAuthed) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('waitlist_signups')
    .select('id,email,created_at,referrer,user_agent')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const csv = toCsv(data ?? []);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="mevo-waitlist-signups.csv"'
    }
  });
}
