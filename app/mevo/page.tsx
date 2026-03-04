'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { mevoFetch, getStoredMevoToken, setStoredMevoToken } from '@/lib/mevo/client-auth';

type World = { id: string; name: string; tone: string; created_at: string };

export default function MevoHomePage() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [msg, setMsg] = useState('');
  const [token, setToken] = useState('');

  const hasWorlds = useMemo(() => worlds.length > 0, [worlds.length]);

  async function load() {
    const res = await mevoFetch('/api/mevo/worlds', { cache: 'no-store' });
    const json = await res.json();
    if (!json?.ok) {
      setWorlds([]);
      setMsg(json?.error === 'unauthorized' ? 'Sign in to load your episodes.' : 'Failed to load worlds');
      return;
    }
    setWorlds(json?.worlds || []);
    setMsg('');
  }

  async function createWorld() {
    setMsg('');
    if (!name.trim()) return;
    const res = await mevoFetch('/api/mevo/worlds', {
      method: 'POST',
      body: JSON.stringify({ name, tone: 'cinematic-warm', stylePreset: 'MEVO_WORLD_V1' })
    });
    const json = await res.json();
    if (!json?.ok) {
      setMsg(json?.error || 'Could not create world');
      return;
    }

    if (photoUrl.trim()) {
      window.localStorage.setItem(`mevo_world_photo_${json.world.id}`, photoUrl.trim());
    }

    setName('');
    await load();
  }

  useEffect(() => {
    const saved = getStoredMevoToken();
    setToken(saved);
    load().catch(() => setMsg('Failed to load worlds'));
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight">Mevo</h1>
        <p className="mt-2 text-white/70">Sign in → set your group once → return straight to episodes.</p>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/50">Auth token</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste Supabase access token"
              className="h-11 flex-1 rounded-lg border border-white/15 bg-black/50 px-3 outline-none"
            />
            <button
              onClick={() => {
                setStoredMevoToken(token.trim());
                load().catch(() => setMsg('Reload failed'));
              }}
              className="h-11 rounded-lg bg-white px-4 text-sm font-semibold text-black"
            >
              Save sign-in
            </button>
          </div>
        </div>

        {!hasWorlds ? (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/60">First-time setup</p>
            <h2 className="mt-1 text-2xl font-semibold">Create your group world</h2>
            <p className="mt-2 text-sm text-white/70">This runs once. Returning users land straight in episodes.</p>
            <div className="mt-4 grid gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Group name (e.g. Shore Crew)"
                className="h-11 rounded-lg border border-white/15 bg-black/50 px-3 outline-none"
              />
              <input
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Optional group photo URL"
                className="h-11 rounded-lg border border-white/15 bg-black/50 px-3 outline-none"
              />
              <button onClick={createWorld} className="h-11 rounded-lg bg-white text-sm font-semibold text-black">
                Continue to episodes
              </button>
            </div>
          </section>
        ) : (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-white/70">Your episodes</p>
            <Link href="/mevo/settings" className="text-sm text-white/80 underline">Preferences</Link>
          </div>
        )}

        <p className="mt-3 text-sm text-red-300">{msg}</p>

        <div className="mt-6 grid gap-3">
          {worlds.map((w) => (
            <Link
              key={w.id}
              href={`/mevo/world/${w.id}`}
              className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
            >
              <p className="text-lg font-medium">{w.name}</p>
              <p className="mt-1 text-sm text-white/70">Tone: {w.tone}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
