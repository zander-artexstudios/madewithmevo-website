import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const worldId = params.id;
  const limit = Math.min(20, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || 10)));

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('episodes')
    .select('id,status,title,summary,share_url,created_at,published_at')
    .eq('world_id', worldId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, episodes: data || [] });
}
