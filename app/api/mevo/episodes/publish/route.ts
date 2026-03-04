import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireUserId } from '@/lib/mevo/auth';

export async function POST(req: NextRequest) {
  const auth = await requireUserId(req);
  if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status || 401 });

  const body = await req.json();
  const episodeId = String(body?.episodeId || '');

  if (!episodeId) return NextResponse.json({ ok: false, error: 'episodeId required' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: ep, error: epErr } = await supabase
    .from('episodes')
    .select('id,world_id,status,worlds!inner(user_id)')
    .eq('id', episodeId)
    .single();

  if (epErr || !ep) return NextResponse.json({ ok: false, error: 'episode_not_found' }, { status: 404 });
  if ((ep as any).worlds?.user_id !== auth.userId) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  if ((ep as any).status !== 'generated') {
    return NextResponse.json({ ok: false, error: 'episode_not_ready', status: (ep as any).status }, { status: 409 });
  }

  const shareUrl = `${process.env.MEVO_SHARE_BASE_URL || 'https://madewithmevo.com'}/episode/${(ep as any).id}`;
  const { error: updateErr } = await supabase
    .from('episodes')
    .update({ status: 'published', published_at: new Date().toISOString(), share_url: shareUrl })
    .eq('id', (ep as any).id);

  if (updateErr) return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, episodeId: (ep as any).id, shareUrl });
}
