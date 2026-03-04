import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireUserId } from '@/lib/mevo/auth';
import { DEMO_WORLD_NAME, ensureDemoContent } from '@/lib/mevo/demo';

export async function POST(req: NextRequest) {
  const auth = await requireUserId(req);
  if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status || 401 });

  try {
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

    const { data: publishedEpisodes, error: episodeErr } = await supabase
      .from('episodes')
      .select('id,title,status,published_at,created_at')
      .eq('world_id', world.id)
      .eq('status', 'published')
      .order('published_at', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(20);

    if (episodeErr || !publishedEpisodes?.length) {
      return NextResponse.json(
        { ok: false, error: 'demo_episode_not_found', message: 'No published episodes in demo world. Please run seed repair.' },
        { status: 404 }
      );
    }

    const firstEpisode =
      publishedEpisodes.find((ep) => /^episode\s*1\b/i.test(ep.title || '')) || publishedEpisodes[0];

    return NextResponse.json({
      ok: true,
      worldId: world.id,
      episodeId: firstEpisode.id,
      route: `/episode/${firstEpisode.id}`
    });
  } catch (error) {
    console.error('[MEVO_DEMO_LAUNCH_FAIL]', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'demo_launch_failed',
        message: 'Founder Demo Mode hit a setup issue. Please retry in 10 seconds or contact support with code DEMO_LAUNCH_FAIL.'
      },
      { status: 500 }
    );
  }
}
