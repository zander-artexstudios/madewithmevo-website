'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { mevoFetch } from '@/lib/mevo/client-auth';

type Episode = {
  id: string;
  status: string;
  title: string | null;
  summary: string | null;
  share_url: string | null;
  created_at: string;
};

export default function WorldPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const worldId = params?.id;
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [msg, setMsg] = useState('');
  const [running, setRunning] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');

  async function load() {
    if (!worldId) return;
    const res = await mevoFetch(`/api/mevo/worlds/${worldId}/episodes?limit=20`, { cache: 'no-store' });
    const json = await res.json();
    if (!json?.ok) {
      if (json?.error === 'unauthorized') {
        router.replace('/mevo/sign-in');
        return;
      }
      setMsg(json?.error || 'Could not load episodes');
      return;
    }
    setEpisodes(json?.episodes || []);
  }

  async function createInvite() {
    if (!worldId) return;
    setMsg('');
    const res = await mevoFetch(`/api/mevo/worlds/${worldId}/invite`, { method: 'POST' });
    const json = await res.json();
    if (!json?.ok || !json?.inviteUrl) {
      setMsg(json?.error || 'Could not create invite link');
      return;
    }

    setInviteUrl(json.inviteUrl);
    navigator.clipboard.writeText(json.inviteUrl).catch(() => null);
    setMsg('Invite link copied. Friends get view-only world access.');
  }

  async function queueEpisode() {
    if (!worldId) return;
    setRunning(true);
    setMsg('');
    try {
      const q = await mevoFetch('/api/mevo/episodes/queue', {
        method: 'POST',
        body: JSON.stringify({ worldId, plan: 'free' })
      });
      const qj = await q.json();
      if (!qj?.ok) {
        setMsg(qj?.error || 'Queue failed');
        return;
      }

      const generateRes = await mevoFetch('/api/mevo/episodes/generate', {
        method: 'POST',
        body: JSON.stringify({ worldId, episodeId: qj.episode.id })
      });
      const generateJson = await generateRes.json();
      if (!generateJson?.ok) {
        setMsg(generateJson?.error || 'Generation failed. Please retry.');
        return;
      }

      const publishRes = await mevoFetch('/api/mevo/episodes/publish', {
        method: 'POST',
        body: JSON.stringify({ episodeId: qj.episode.id })
      });
      const publishJson = await publishRes.json();
      if (!publishJson?.ok) {
        setMsg(publishJson?.error || 'Publish failed. Episode is saved but not live yet.');
        return;
      }

      setMsg('New episode generated and published.');
      await load();
    } catch {
      setMsg('Episode run failed');
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    load().catch(() => setMsg('Failed to load episodes'));
  }, [worldId]);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/mevo" className="text-sm text-white/70 hover:text-white">← Back</Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Episodes</h1>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={queueEpisode}
            disabled={running}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {running ? 'Running…' : 'Generate weekly episode'}
          </button>
          <button
            onClick={createInvite}
            className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white"
          >
            Create invite link
          </button>
        </div>
        <p className="mt-2 text-sm text-white/80">{msg}</p>
        {!!inviteUrl && <p className="mt-1 text-xs text-white/60 break-all">{inviteUrl}</p>}

        <div className="mt-8 grid gap-3">
          {episodes.map((e) => (
            <Link key={e.id} href={`/episode/${e.id}`} className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10">
              <p className="text-base font-medium">{e.title || 'Untitled episode'}</p>
              <p className="mt-1 text-sm text-white/70">Status: {e.status}</p>
              <p className="mt-1 text-sm text-white/60">{new Date(e.created_at).toLocaleString()}</p>
            </Link>
          ))}
          {!episodes.length && <p className="text-sm text-white/60">No episodes yet.</p>}
        </div>
      </div>
    </main>
  );
}
