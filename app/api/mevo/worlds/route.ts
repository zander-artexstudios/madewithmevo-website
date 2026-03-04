import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireUserId } from '@/lib/mevo/auth';
import { ensureDemoContent } from '@/lib/mevo/demo';

export async function GET(req: NextRequest) {
  const auth = await requireUserId(req);
  if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status || 401 });

  const supabase = getSupabaseAdmin();
  await ensureDemoContent(supabase, auth.userId!);

  const { data, error } = await supabase
    .from('worlds')
    .select('id,name,tone,style_preset,created_at')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, worlds: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireUserId(req);
  if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status || 401 });

  const body = await req.json();
  const name = String(body?.name || '').trim();
  const tone = String(body?.tone || 'cinematic-warm');
  const stylePreset = String(body?.stylePreset || 'MEVO_WORLD_V1');

  if (!name) {
    return NextResponse.json({ ok: false, error: 'name required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('worlds')
    .insert({ user_id: auth.userId, name, tone, style_preset: stylePreset })
    .select('id,name,tone,style_preset,created_at')
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, world: data });
}
