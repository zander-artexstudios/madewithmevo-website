import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const episodeId = params.id;
  const supabase = getSupabaseAdmin();

  const { data: episode, error } = await supabase
    .from('episodes')
    .select('id,world_id,status,title,summary,script,shotlist,share_url,created_at,published_at')
    .eq('id', episodeId)
    .single();

  if (error || !episode) return NextResponse.json({ ok: false, error: 'episode_not_found' }, { status: 404 });

  const { data: previous } = await supabase
    .from('episodes')
    .select('id,title,summary,published_at')
    .eq('world_id', episode.world_id)
    .eq('status', 'published')
    .lt('created_at', episode.created_at)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    episode,
    previous: previous || null
  });
}
