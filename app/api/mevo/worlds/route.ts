import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('worlds')
    .select('id,name,tone,style_preset,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, worlds: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userId = String(body?.userId || '');
  const name = String(body?.name || '').trim();
  const tone = String(body?.tone || 'cinematic-warm');
  const stylePreset = String(body?.stylePreset || 'MEVO_WORLD_V1');

  if (!userId || !name) {
    return NextResponse.json({ ok: false, error: 'userId and name required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('worlds')
    .insert({ user_id: userId, name, tone, style_preset: stylePreset })
    .select('id,name,tone,style_preset,created_at')
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, world: data });
}
