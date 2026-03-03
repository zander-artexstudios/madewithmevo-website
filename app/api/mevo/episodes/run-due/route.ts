import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildGeneratedEpisodePayload } from '@/lib/mevo/pipeline';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const limit = Math.min(20, Math.max(1, Number(body?.limit || 5)));

  const supabase = getSupabaseAdmin();
  const { data: queued, error: queueErr } = await supabase
    .from('episodes')
    .select('id,world_id,created_at')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (queueErr) return NextResponse.json({ ok: false, error: queueErr.message }, { status: 500 });

  const results: Array<{ episodeId: string; status: string; error?: string }> = [];

  for (const ep of queued || []) {
    const [canonRes, recentRes, threadRes] = await Promise.all([
      supabase.from('world_memory').select('content').eq('world_id', ep.world_id).eq('kind', 'canon').order('created_at', { ascending: false }).limit(30),
      supabase.from('world_memory').select('content').eq('world_id', ep.world_id).eq('kind', 'episode').order('created_at', { ascending: false }).limit(3),
      supabase.from('world_memory').select('content').eq('world_id', ep.world_id).eq('kind', 'thread').order('created_at', { ascending: false }).limit(12)
    ]);

    if (canonRes.error || recentRes.error || threadRes.error) {
      results.push({ episodeId: ep.id, status: 'failed', error: 'memory_fetch_failed' });
      continue;
    }

    const { script, shotlist } = buildGeneratedEpisodePayload({
      canon: (canonRes.data || []).map((r) => r.content),
      recentEpisodes: (recentRes.data || []).map((r) => r.content),
      openThreads: (threadRes.data || []).map((r) => r.content)
    });

    const { error: updateErr } = await supabase
      .from('episodes')
      .update({ status: 'generated', script, shotlist })
      .eq('id', ep.id)
      .eq('world_id', ep.world_id);

    if (updateErr) {
      results.push({ episodeId: ep.id, status: 'failed', error: updateErr.message });
    } else {
      results.push({ episodeId: ep.id, status: 'generated' });
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}
