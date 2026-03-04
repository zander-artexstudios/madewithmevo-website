import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireUserId } from '@/lib/mevo/auth';
import { createInviteToken } from '@/lib/mevo/invite';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUserId(req);
  if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status || 401 });

  const worldId = params.id;
  const supabase = getSupabaseAdmin();

  const { data: world, error } = await supabase
    .from('worlds')
    .select('id,name,user_id')
    .eq('id', worldId)
    .eq('user_id', auth.userId)
    .maybeSingle();

  if (error || !world) return NextResponse.json({ ok: false, error: 'world_not_found' }, { status: 404 });

  const token = createInviteToken(world.id, auth.userId!);
  const inviteUrl = `${req.nextUrl.origin}/mevo/invite/${token}`;

  return NextResponse.json({ ok: true, inviteUrl, mode: 'view' });
}
