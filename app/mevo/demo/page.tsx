'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mevoFetch } from '@/lib/mevo/client-auth';

export default function MevoDemoLaunchPage() {
  const router = useRouter();
  const [msg, setMsg] = useState('Loading Mevo Founder Demo…');

  useEffect(() => {
    mevoFetch('/api/mevo/demo/launch', { method: 'POST' })
      .then((r) => r.json())
      .then((json) => {
        if (!json?.ok || !json?.route) {
          if (json?.error === 'unauthorized') {
            router.replace('/mevo/sign-in');
            return;
          }
          setMsg('Demo launch failed. Please try again from /mevo after sign in.');
          return;
        }

        router.replace(json.route);
      })
      .catch(() => setMsg('Demo launch failed. Please retry.'));
  }, [router]);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Founder Demo Mode</h1>
        <p className="mt-2 text-sm text-white/70">One click to load demo world + open Episode 1 for investor walkthroughs.</p>
        <p className="mt-6 text-sm text-white/90">{msg}</p>
      </div>
    </main>
  );
}
