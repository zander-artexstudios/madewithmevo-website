import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const isAuthed = cookies().get('mevo_admin')?.value === '1';
  if (!isAuthed) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const days = Number(req.nextUrl.searchParams.get('days') || 30);
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('credit_ledgers')
    .select('user_id,world_id,direction,amount,reason,created_at')
    .gte('created_at', from)
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const rows = data || [];
  const totalDebits = rows.filter((r) => r.direction === 'debit').reduce((a, r) => a + r.amount, 0);
  const totalCredits = rows.filter((r) => r.direction === 'credit').reduce((a, r) => a + r.amount, 0);

  const { data: analyticsRows } = await supabase
    .from('mevo_analytics')
    .select('event_name,created_at')
    .gte('created_at', from)
    .limit(5000);

  const analytics = (analyticsRows || []).reduce<Record<string, number>>((acc, row: any) => {
    acc[row.event_name] = (acc[row.event_name] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    ok: true,
    windowDays: days,
    totals: {
      debitCredits: totalDebits,
      creditCredits: totalCredits,
      netCredits: totalDebits - totalCredits
    },
    analytics,
    rows
  });
}
