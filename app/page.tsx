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
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-black/75 backdrop-blur-[1px]" />

      <section className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center">
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="MEVO"
            width={230}
            height={90}
            className="mx-auto h-auto w-[180px] sm:w-[230px]"
          />
        </div>

        <h1 className="mb-8 text-3xl font-medium tracking-tight text-white sm:text-5xl">
          Your friends, your content
        </h1>

        <form onSubmit={onSubmit} className="w-full max-w-xl">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-12 flex-1 rounded-full border border-white/20 bg-black/45 px-5 text-base outline-none ring-white/30 placeholder:text-white/65 focus:ring"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="h-12 rounded-full bg-white px-7 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-70"
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
