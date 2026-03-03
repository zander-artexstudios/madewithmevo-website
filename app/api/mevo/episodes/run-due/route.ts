import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildGeneratedEpisodePayload } from '@/lib/mevo/pipeline';

const MAX_RETRIES = Number(process.env.MEVO_MAX_RETRIES || 2);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const limit = Math.min(20, Math.max(1, Number(body?.limit || 5)));

  const supabase = getSupabaseAdmin();
  const { data: queued, error: queueErr } = await supabase
    .from('episodes')
    .select('id,world_id,created_at,asset_manifest')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (queueErr) return NextResponse.json({ ok: false, error: queueErr.message }, { status: 500 });

  const results: Array<{ episodeId: string; status: string; error?: string; retryCount?: number }> = [];

  for (const ep of queued || []) {
    const retryCount = Number((ep.asset_manifest as any)?.retryCount || 0);
    if (retryCount > MAX_RETRIES) {
      results.push({ episodeId: ep.id, status: 'failed', error: 'max_retries_exceeded', retryCount });
      continue;
    }

    const [canonRes, recentRes, threadRes] = await Promise.all([
      supabase.from('world_memory').select('content').eq('world_id', ep.world_id).eq('kind', 'canon').order('created_at', { ascending: false }).limit(30),
      supabase.from('world_memory').select('content').eq('world_id', ep.world_id).eq('kind', 'episode').order('created_at', { ascending: false }).limit(3),
      supabase.from('world_memory').select('content').eq('world_id', ep.world_id).eq('kind', 'thread').order('created_at', { ascending: false }).limit(12)
    ]);

    if (canonRes.error || recentRes.error || threadRes.error) {
      await supabase
        .from('episodes')
        .update({
          asset_manifest: {
            ...((ep.asset_manifest as any) || {}),
            retryCount: retryCount + 1,
            lastError: 'memory_fetch_failed'
          }
        })
        .eq('id', ep.id);

      results.push({ episodeId: ep.id, status: 'failed', error: 'memory_fetch_failed', retryCount: retryCount + 1 });
      continue;
    }

    try {
      const { script, shotlist } = await buildGeneratedEpisodePayload({
        worldId: ep.world_id,
        canon: (canonRes.data || []).map((r) => r.content),
        recentEpisodes: (recentRes.data || []).map((r) => r.content),
        openThreads: (threadRes.data || []).map((r) => r.content)
      });

      const { error: updateErr } = await supabase
        .from('episodes')
        .update({
          status: 'generated',
          script,
          shotlist,
          asset_manifest: {
            ...((ep.asset_manifest as any) || {}),
            retryCount
          }
        })
        .eq('id', ep.id)
        .eq('world_id', ep.world_id);

      if (updateErr) {
        await supabase
          .from('episodes')
          .update({
            asset_manifest: {
              ...((ep.asset_manifest as any) || {}),
              retryCount: retryCount + 1,
              lastError: updateErr.message
            }
          })
          .eq('id', ep.id);

        results.push({ episodeId: ep.id, status: 'failed', error: updateErr.message, retryCount: retryCount + 1 });
      } else {
        results.push({ episodeId: ep.id, status: 'generated', retryCount });
      }
    } catch (err: any) {
      await supabase
        .from('episodes')
        .update({
          asset_manifest: {
            ...((ep.asset_manifest as any) || {}),
            retryCount: retryCount + 1,
            lastError: err?.message || 'generation_failed'
          }
        })
        .eq('id', ep.id);

      results.push({ episodeId: ep.id, status: 'failed', error: err?.message || 'generation_failed', retryCount: retryCount + 1 });
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results, maxRetries: MAX_RETRIES });
}
