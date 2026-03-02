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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <Image
        src="/hero.png"
        alt="MEVO hero"
        fill
        priority
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/78" />

      <section className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center">
        <div className="mb-7 rounded-[28px] bg-black/18 px-8 py-3 backdrop-blur-md sm:mb-8">
          <Image
            src="/logo.png"
            alt="MEVO"
            width={230}
            height={90}
            className="mx-auto h-auto w-[180px] sm:w-[230px]"
          />
        </div>

        <h1 className="mb-9 text-[2rem] font-medium tracking-[-0.02em] text-white sm:text-[3.35rem]">
          Your friends, your content
        </h1>

        <form onSubmit={onSubmit} className="w-full max-w-[640px]">
          <div className="mx-auto flex max-w-[560px] flex-col gap-3 rounded-[24px] border border-white/15 bg-black/30 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-12 flex-1 rounded-full border border-white/20 bg-white/8 px-5 text-base text-white outline-none ring-white/30 placeholder:text-white/60 focus:ring"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="h-12 rounded-full bg-white px-7 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-70 sm:shrink-0"
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
