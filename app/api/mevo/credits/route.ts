import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getPlan, usageBand } from '@/lib/mevo/credits';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const planId = req.nextUrl.searchParams.get('plan') || 'free';
  if (!userId) return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 });

  const plan = getPlan(planId);
  const supabase = getSupabaseAdmin();

  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('credit_ledgers')
    .select('direction,amount')
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const spent = (data ?? []).reduce((acc, row) => acc + (row.direction === 'debit' ? row.amount : -row.amount), 0);
  const remaining = Math.max(0, plan.hardCap - spent);

  return NextResponse.json({
    ok: true,
    plan: plan.id,
    hardCap: plan.hardCap,
    spent,
    remaining,
    band: usageBand(spent, plan.hardCap)
  });
}
