import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
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

  return NextResponse.json({
    ok: true,
    windowDays: days,
    totals: {
      debitCredits: totalDebits,
      creditCredits: totalCredits,
      netCredits: totalDebits - totalCredits
    },
    rows
  });
}
