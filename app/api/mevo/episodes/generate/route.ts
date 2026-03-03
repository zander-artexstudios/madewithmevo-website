import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildEpisodeMemoryContext, continuityPromptBlock } from '@/lib/mevo/memory';
import { requireUserId } from '@/lib/mevo/auth';

export async function POST(req: NextRequest) {
  const auth = requireUserId(req);
  if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });

  const body = await req.json();
  const worldId = String(body?.worldId || '');
  const episodeId = String(body?.episodeId || '');

  if (!worldId || !episodeId) {
    return NextResponse.json({ ok: false, error: 'worldId and episodeId required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Pull continuity context (starter heuristic, to be upgraded to vector retrieval).
  const [canonRes, recentRes, threadRes] = await Promise.all([
    supabase.from('world_memory').select('content').eq('world_id', worldId).eq('kind', 'canon').order('created_at', { ascending: false }).limit(30),
    supabase.from('world_memory').select('content').eq('world_id', worldId).eq('kind', 'episode').order('created_at', { ascending: false }).limit(3),
    supabase.from('world_memory').select('content').eq('world_id', worldId).eq('kind', 'thread').order('created_at', { ascending: false }).limit(12)
  ]);

  if (canonRes.error || recentRes.error || threadRes.error) {
    return NextResponse.json({ ok: false, error: 'memory_fetch_failed' }, { status: 500 });
  }

  const memoryContext = buildEpisodeMemoryContext({
    canon: (canonRes.data || []).map((r) => r.content),
    recentEpisodes: (recentRes.data || []).map((r) => r.content),
    openThreads: (threadRes.data || []).map((r) => r.content)
  });

  const continuity = continuityPromptBlock(memoryContext);

  // Stub pipeline output for next worker step.
  const script = {
    version: 1,
    title: 'Weekly Episode Draft',
    beats: [
      'Cold open with relationship callback',
      'Unexpected turn tied to open thread',
      'Emotional payoff + teaser for next week'
    ],
    continuity
  };

  const shotlist = {
    version: 1,
    shots: [
      { id: 's1', framing: 'wide', motion: 'slow push-in' },
      { id: 's2', framing: 'medium', motion: 'orbit slight' },
      { id: 's3', framing: 'close', motion: 'static emotional beat' }
    ]
  };

  const { error: updateError } = await supabase
    .from('episodes')
    .update({ status: 'generated', script, shotlist })
    .eq('id', episodeId)
    .eq('world_id', worldId);

  if (updateError) {
    return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, episodeId, worldId, status: 'generated' });
}
