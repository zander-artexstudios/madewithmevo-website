'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { mevoFetch } from '@/lib/mevo/client-auth';

type World = { id: string; name: string };

export default function MevoSettingsPage() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [selected, setSelected] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    mevoFetch('/api/mevo/worlds', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (!json?.ok) {
          setMsg('Sign in required before editing preferences.');
          return;
        }
        setWorlds(json.worlds || []);
        const first = json.worlds?.[0]?.id || '';
        setSelected(first);
        if (first) setPhotoUrl(window.localStorage.getItem(`mevo_world_photo_${first}`) || '');
      })
      .catch(() => setMsg('Could not load preferences.'));
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/mevo" className="text-sm text-white/70 hover:text-white">← Back to episodes</Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Preferences</h1>
        <p className="mt-1 text-white/70">Update your group photo and world settings.</p>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <label className="text-sm text-white/70">World</label>
          <select
            value={selected}
            onChange={(e) => {
              const id = e.target.value;
              setSelected(id);
              setPhotoUrl(window.localStorage.getItem(`mevo_world_photo_${id}`) || '');
            }}
            className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-black/50 px-3"
          >
            {worlds.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          <label className="mt-4 block text-sm text-white/70">Group photo URL</label>
          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-black/50 px-3"
            placeholder="https://..."
          />

          <button
            onClick={() => {
              if (!selected) return;
              window.localStorage.setItem(`mevo_world_photo_${selected}`, photoUrl.trim());
              setMsg('Saved. Your next episodes will use the updated photo reference.');
            }}
            className="mt-4 h-11 rounded-lg bg-white px-4 text-sm font-semibold text-black"
          >
            Save preferences
          </button>
          <p className="mt-2 text-sm text-white/70">{msg}</p>
        </div>
      </div>
    </main>
  );
}
