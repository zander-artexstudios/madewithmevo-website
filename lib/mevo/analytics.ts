import { getSupabaseAdmin } from '@/lib/supabase';

export type MevoEventName =
  | 'episode_view_started'
  | 'episode_view_completed'
  | 'share_clicked'
  | 'episode_generated'
  | 'generation_cost_estimate';

export async function logMevoEvent(input: {
  event: MevoEventName;
  userId?: string | null;
  worldId?: string | null;
  episodeId?: string | null;
  value?: number | null;
  meta?: Record<string, unknown>;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const payload = {
      event_name: input.event,
      user_id: input.userId || null,
      world_id: input.worldId || null,
      episode_id: input.episodeId || null,
      value_num: input.value ?? null,
      meta: input.meta || {}
    };

    const { error } = await supabase.from('mevo_analytics').insert(payload);
    if (error) {
      console.log('[mevo-analytics:fallback]', payload, error.message);
    }
  } catch (err) {
    console.log('[mevo-analytics:error]', input, err);
  }
}
