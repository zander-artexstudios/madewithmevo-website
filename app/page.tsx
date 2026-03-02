'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setStatus('ok');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      <Image
        src="/hero.png"
        alt="MEVO hero"
        fill
        priority
        quality={100}
        className="object-cover object-center scale-[1.04] blur-[2px]"
      />

      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/58 to-black/86" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(24,78,180,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.46)_100%)]" />

      <section className="relative z-10 mx-auto flex w-full max-w-[980px] flex-col items-center px-6 text-center 2xl:max-w-[1180px]">
        <h1 className="mb-10 text-[2.1rem] font-medium leading-[1.03] tracking-[-0.03em] text-white sm:text-[3.9rem] 2xl:text-[4.25rem]">
          Your friends, your content
        </h1>

        <form onSubmit={onSubmit} className="w-full max-w-[680px]">
          <div className="mx-auto flex max-w-[640px] flex-col gap-3 rounded-[26px] border border-white/20 bg-black/42 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:flex-row sm:items-center sm:gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-12 flex-1 rounded-full border border-white/25 bg-white/12 px-5 text-base text-white outline-none ring-white/30 placeholder:text-white/70 focus:ring focus:ring-offset-0"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="h-12 rounded-full bg-white px-7 text-sm font-semibold text-black shadow-[0_10px_28px_rgba(255,255,255,0.3)] transition duration-200 hover:-translate-y-[1px] hover:bg-white/92 active:translate-y-0 disabled:translate-y-0 disabled:opacity-70 sm:shrink-0"
            >
              Join our waitlist
            </button>
          </div>
          <p className="mt-4 min-h-6 text-sm text-white/90" aria-live="polite">
            {status === 'ok' ? "You’re on the list." : status === 'error' ? 'Try again.' : '‎'}
          </p>
        </form>
      </section>
    </main>
  );
}
