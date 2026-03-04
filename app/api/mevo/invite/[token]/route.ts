import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { parseInviteToken } from '@/lib/mevo/invite';

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const invite = parseInviteToken(params.token);
  if (!invite) return NextResponse.json({ ok: false, error: 'invalid_or_expired_invite' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: world, error: worldErr } = await supabase
    .from('worlds')
    .select('id,name,tone,user_id')
    .eq('id', invite.worldId)
    .eq('user_id', invite.ownerId)
    .maybeSingle();

  if (worldErr || !world) return NextResponse.json({ ok: false, error: 'world_not_found' }, { status: 404 });

  const { data: episodes, error: episodesErr } = await supabase
    .from('episodes')
    .select('id,title,summary,status,published_at,created_at')
    .eq('world_id', world.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20);

  if (episodesErr) return NextResponse.json({ ok: false, error: episodesErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, world, episodes: episodes || [], mode: 'view' });
}
