import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildGeneratedEpisodePayload } from '@/lib/mevo/pipeline';
import { requireSchedulerKey } from '@/lib/mevo/auth';

const MAX_RETRIES = Number(process.env.MEVO_MAX_RETRIES || 2);
const BASE_BACKOFF_MS = Number(process.env.MEVO_RETRY_BACKOFF_MS || 60_000);

function nextBackoffIso(retryCount: number) {
  const delay = Math.min(30 * 60_000, BASE_BACKOFF_MS * Math.pow(2, Math.max(0, retryCount - 1)));
  return new Date(Date.now() + delay).toISOString();
}

export async function POST(req: NextRequest) {
  const scheduler = requireSchedulerKey(req);
  if (scheduler.error) return NextResponse.json({ ok: false, error: scheduler.error }, { status: scheduler.status || 401 });

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
    const manifest = ((ep.asset_manifest as any) || {}) as { retryCount?: number; nextAttemptAt?: string; lastError?: string };
    const retryCount = Number(manifest.retryCount || 0);
    const nextAttemptAt = manifest.nextAttemptAt ? new Date(manifest.nextAttemptAt).getTime() : 0;

    if (nextAttemptAt && nextAttemptAt > Date.now()) {
      results.push({ episodeId: ep.id, status: 'deferred', retryCount });
      continue;
    }

    if (retryCount >= MAX_RETRIES) {
      await supabase
        .from('episodes')
        .update({
          status: 'failed',
          asset_manifest: {
            ...manifest,
            retryCount,
            lastError: 'max_retries_exceeded'
          }
        })
        .eq('id', ep.id)
        .eq('status', 'queued');

      results.push({ episodeId: ep.id, status: 'failed', error: 'max_retries_exceeded', retryCount });
      continue;
    }

    const { data: claimed } = await supabase
      .from('episodes')
      .update({
        status: 'processing',
        asset_manifest: {
          ...manifest,
          processingStartedAt: new Date().toISOString()
        }
      })
      .eq('id', ep.id)
      .eq('status', 'queued')
      .select('id,world_id')
      .single();

    if (!claimed) {
      results.push({ episodeId: ep.id, status: 'skipped' });
      continue;
    }

    const { data: world } = await supabase
      .from('worlds')
      .select('id,tone,style_preset')
      .eq('id', ep.world_id)
      .single();

    const [canonRes, recentRes, threadRes] = await Promise.all([
      supabase.from('world_memory').select('content').eq('world_id', ep.world_id).eq('kind', 'canon').order('created_at', { ascending: false }).limit(30),
      supabase.from('world_memory').select('content').eq('world_id', ep.world_id).eq('kind', 'episode').order('created_at', { ascending: false }).limit(3),
      supabase.from('world_memory').select('content').eq('world_id', ep.world_id).eq('kind', 'thread').order('created_at', { ascending: false }).limit(12)
    ]);

    if (canonRes.error || recentRes.error || threadRes.error) {
      const bumped = retryCount + 1;
      await supabase
        .from('episodes')
        .update({
          status: bumped >= MAX_RETRIES ? 'failed' : 'queued',
          asset_manifest: {
            ...manifest,
            retryCount: bumped,
            nextAttemptAt: nextBackoffIso(bumped),
            lastError: 'memory_fetch_failed'
          }
        })
        .eq('id', ep.id);

      results.push({ episodeId: ep.id, status: 'failed', error: 'memory_fetch_failed', retryCount: bumped });
      continue;
    }

    try {
      const { script, shotlist } = await buildGeneratedEpisodePayload({
        worldId: ep.world_id,
        tone: world?.tone,
        stylePreset: world?.style_preset,
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
            ...manifest,
            retryCount,
            nextAttemptAt: null,
            lastError: null
          }
        })
        .eq('id', ep.id)
        .eq('world_id', ep.world_id);

      if (updateErr) {
        const bumped = retryCount + 1;
        await supabase
          .from('episodes')
          .update({
            status: bumped >= MAX_RETRIES ? 'failed' : 'queued',
            asset_manifest: {
              ...manifest,
              retryCount: bumped,
              nextAttemptAt: nextBackoffIso(bumped),
              lastError: updateErr.message
            }
          })
          .eq('id', ep.id);

        results.push({ episodeId: ep.id, status: 'failed', error: updateErr.message, retryCount: bumped });
      } else {
        results.push({ episodeId: ep.id, status: 'generated', retryCount });
      }
    } catch (err: any) {
      const bumped = retryCount + 1;
      await supabase
        .from('episodes')
        .update({
          status: bumped >= MAX_RETRIES ? 'failed' : 'queued',
          asset_manifest: {
            ...manifest,
            retryCount: bumped,
            nextAttemptAt: nextBackoffIso(bumped),
            lastError: err?.message || 'generation_failed'
          }
        })
        .eq('id', ep.id);

      results.push({ episodeId: ep.id, status: 'failed', error: err?.message || 'generation_failed', retryCount: bumped });
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results, maxRetries: MAX_RETRIES });
}
