'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type World = { id: string; name: string; tone: string; created_at: string };

export default function MevoHomePage() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/mevo/worlds?userId=demo', { cache: 'no-store' });
    const json = await res.json();
    setWorlds(json?.worlds || []);
  }

  async function createWorld() {
    setMsg('');
    if (!name.trim()) return;
    const res = await fetch('/api/mevo/worlds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'demo', name, tone: 'cinematic-warm' })
    });
    const json = await res.json();
    if (!json?.ok) {
      setMsg('Could not create world');
      return;
    }
    setName('');
    await load();
  }

  useEffect(() => {
    load().catch(() => setMsg('Failed to load worlds'));
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight">Mevo</h1>
        <p className="mt-2 text-white/70">Your worlds. Your weekly episodes.</p>

        <div className="mt-6 flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Create a world (e.g. The Shore Crew)"
            className="h-11 flex-1 rounded-lg border border-white/15 bg-black/50 px-3 outline-none"
          />
          <button
            onClick={createWorld}
            className="h-11 rounded-lg bg-white px-4 text-sm font-semibold text-black"
          >
            Create world
          </button>
        </div>

        <p className="mt-3 text-sm text-red-300">{msg}</p>

        <div className="mt-8 grid gap-3">
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
          {!worlds.length && <p className="text-sm text-white/60">No worlds yet.</p>}
        </div>
      </div>
    </main>
  );
}
