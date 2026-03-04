'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type InvitePayload = {
  ok: boolean;
  world?: { id: string; name: string; tone: string };
  episodes?: Array<{ id: string; title: string | null; summary: string | null; published_at: string | null }>;
  mode?: 'view';
  error?: string;
};

export default function InviteViewPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const [data, setData] = useState<InvitePayload | null>(null);
  const [msg, setMsg] = useState('Loading invite…');

  useEffect(() => {
    if (!token) return;
    fetch(`/api/mevo/invite/${token}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        if (!json?.ok) setMsg('This invite is invalid or expired.');
      })
      .catch(() => setMsg('Could not open invite.'));
  }, [token]);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">{data?.world?.name || 'Mevo Invite'}</h1>
        <p className="mt-2 text-sm text-white/70">
          {data?.ok ? 'View-only access to this world feed.' : msg}
        </p>

        <div className="mt-6 grid gap-3">
          {(data?.episodes || []).map((e) => (
            <Link key={e.id} href={`/episode/${e.id}`} className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10">
              <p className="text-base font-medium">{e.title || 'Untitled episode'}</p>
              <p className="mt-1 text-sm text-white/70">{e.summary || 'New chapter in this world.'}</p>
            </Link>
          ))}
          {data?.ok && !(data?.episodes || []).length && (
            <p className="text-sm text-white/60">No published episodes yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
