'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const worldId = params?.id;
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [msg, setMsg] = useState('');
  const [running, setRunning] = useState(false);

  async function load() {
    if (!worldId) return;
    const res = await fetch(`/api/mevo/worlds/${worldId}/episodes?limit=20`, { cache: 'no-store' });
    const json = await res.json();
    setEpisodes(json?.episodes || []);
  }

  async function queueEpisode() {
    if (!worldId) return;
    setRunning(true);
    setMsg('');
    try {
      const q = await fetch('/api/mevo/episodes/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo', worldId, plan: 'free' })
      });
      const qj = await q.json();
      if (!qj?.ok) {
        setMsg(qj?.error || 'Queue failed');
        return;
      }

      await fetch('/api/mevo/episodes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-mevo-user-id': 'demo' },
        body: JSON.stringify({ worldId, episodeId: qj.episode.id })
      });

      await fetch('/api/mevo/episodes/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId: qj.episode.id })
      });

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
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">World</h1>
        <p className="mt-1 text-sm text-white/70">{worldId}</p>

        <button
          onClick={queueEpisode}
          disabled={running}
          className="mt-6 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          {running ? 'Running…' : 'Generate weekly episode'}
        </button>
        <p className="mt-2 text-sm text-white/80">{msg}</p>

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
