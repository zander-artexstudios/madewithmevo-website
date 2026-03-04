import { NextRequest, NextResponse } from 'next/server';
import { logMevoEvent, type MevoEventName } from '@/lib/mevo/analytics';
import { requireUserId } from '@/lib/mevo/auth';

const ALLOWED: MevoEventName[] = [
  'episode_view_started',
  'episode_view_completed',
  'share_clicked',
  'episode_generated',
  'generation_cost_estimate'
];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const event = String(body?.event || '') as MevoEventName;
  if (!ALLOWED.includes(event)) return NextResponse.json({ ok: false, error: 'invalid_event' }, { status: 400 });

  const auth = await requireUserId(req);
  await logMevoEvent({
    event,
    userId: auth.userId || null,
    worldId: body?.worldId ? String(body.worldId) : null,
    episodeId: body?.episodeId ? String(body.episodeId) : null,
    value: typeof body?.value === 'number' ? body.value : null,
    meta: body?.meta && typeof body.meta === 'object' ? body.meta : {}
  });

  return NextResponse.json({ ok: true });
}
