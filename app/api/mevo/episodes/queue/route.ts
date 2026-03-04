import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { EPISODE_BASE_COST, canSpend, getPlan } from '@/lib/mevo/credits';
import { requireUserId } from '@/lib/mevo/auth';

export async function POST(req: NextRequest) {
  const auth = await requireUserId(req);
  if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status || 401 });

  const body = await req.json();
  const worldId = String(body?.worldId || '');
  const planId = String(body?.plan || 'free');

  if (!worldId) {
    return NextResponse.json({ ok: false, error: 'worldId required' }, { status: 400 });
  }

  const plan = getPlan(planId);
  const supabase = getSupabaseAdmin();

  const { data: world, error: worldErr } = await supabase
    .from('worlds')
    .select('id')
    .eq('id', worldId)
    .eq('user_id', auth.userId)
    .single();

  if (worldErr || !world) {
    return NextResponse.json({ ok: false, error: 'world_not_found' }, { status: 404 });
  }

  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const { data: ledgerRows, error: ledgerError } = await supabase
    .from('credit_ledgers')
    .select('direction,amount')
    .eq('user_id', auth.userId)
    .gte('created_at', startOfMonth.toISOString());

  if (ledgerError) return NextResponse.json({ ok: false, error: ledgerError.message }, { status: 500 });

  const spent = (ledgerRows ?? []).reduce((acc, row) => acc + (row.direction === 'debit' ? row.amount : -row.amount), 0);

  if (!canSpend(spent, EPISODE_BASE_COST, plan.hardCap)) {
    return NextResponse.json({ ok: false, error: 'credit_cap_exceeded', spent, hardCap: plan.hardCap }, { status: 402 });
  }

  const { data: episode, error: episodeError } = await supabase
    .from('episodes')
    .insert({
      world_id: worldId,
      status: 'queued',
      asset_manifest: { retryCount: 0, nextAttemptAt: new Date().toISOString() }
    })
    .select('id,status,created_at')
    .single();

  if (episodeError) return NextResponse.json({ ok: false, error: episodeError.message }, { status: 500 });

  const { error: ledgerWriteError } = await supabase.from('credit_ledgers').insert({
    user_id: auth.userId,
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
