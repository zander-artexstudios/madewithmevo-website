import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireUserId } from '@/lib/mevo/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUserId(req);
  if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status || 401 });

  const worldId = params.id;
  const limit = Math.min(20, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || 10)));

  const supabase = getSupabaseAdmin();

  const { data: world, error: worldErr } = await supabase
    .from('worlds')
    .select('id')
    .eq('id', worldId)
    .eq('user_id', auth.userId)
    .single();

  if (worldErr || !world) return NextResponse.json({ ok: false, error: 'world_not_found' }, { status: 404 });

  const { data, error } = await supabase
    .from('episodes')
    .select('id,status,title,summary,share_url,created_at,published_at')
    .eq('world_id', worldId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, episodes: data || [] });
}
