import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { EPISODE_BASE_COST, canSpend, getPlan } from '@/lib/mevo/credits';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userId = String(body?.userId || '');
  const worldId = String(body?.worldId || '');
  const planId = String(body?.plan || 'free');

  if (!userId || !worldId) {
    return NextResponse.json({ ok: false, error: 'userId and worldId required' }, { status: 400 });
  }

  const plan = getPlan(planId);
  const supabase = getSupabaseAdmin();

  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const { data: ledgerRows, error: ledgerError } = await supabase
    .from('credit_ledgers')
    .select('direction,amount')
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());

  if (ledgerError) return NextResponse.json({ ok: false, error: ledgerError.message }, { status: 500 });

  const spent = (ledgerRows ?? []).reduce((acc, row) => acc + (row.direction === 'debit' ? row.amount : -row.amount), 0);

  if (!canSpend(spent, EPISODE_BASE_COST, plan.hardCap)) {
    return NextResponse.json({ ok: false, error: 'credit_cap_exceeded', spent, hardCap: plan.hardCap }, { status: 402 });
  }

  const { data: episode, error: episodeError } = await supabase
    .from('episodes')
    .insert({ world_id: worldId, status: 'queued' })
    .select('id,status,created_at')
    .single();

  if (episodeError) return NextResponse.json({ ok: false, error: episodeError.message }, { status: 500 });

  const { error: ledgerWriteError } = await supabase.from('credit_ledgers').insert({
    user_id: userId,
    world_id: worldId,
    episode_id: episode.id,
    direction: 'debit',
    amount: EPISODE_BASE_COST,
    reason: 'episode_queue'
  });

  if (ledgerWriteError) {
    return NextResponse.json({ ok: false, error: ledgerWriteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, episode, debited: EPISODE_BASE_COST });
}
