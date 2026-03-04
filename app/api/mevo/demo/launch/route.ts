import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireUserId } from '@/lib/mevo/auth';
import { DEMO_WORLD_NAME, ensureDemoContent } from '@/lib/mevo/demo';

export async function POST(req: NextRequest) {
  const auth = await requireUserId(req);
  if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status || 401 });

  const supabase = getSupabaseAdmin();
  await ensureDemoContent(supabase, auth.userId!, { forceCreateWorld: true });

  const { data: world, error: worldErr } = await supabase
    .from('worlds')
    .select('id,name')
    .eq('user_id', auth.userId)
    .eq('name', DEMO_WORLD_NAME)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (worldErr || !world) {
    return NextResponse.json({ ok: false, error: 'demo_world_not_found' }, { status: 404 });
  }

  const { data: firstEpisode, error: episodeErr } = await supabase
    .from('episodes')
    .select('id,title,status')
    .eq('world_id', world.id)
    .order('published_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (episodeErr || !firstEpisode) {
    return NextResponse.json({ ok: false, error: 'demo_episode_not_found' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    worldId: world.id,
    episodeId: firstEpisode.id,
    route: `/episode/${firstEpisode.id}`
  });
}
