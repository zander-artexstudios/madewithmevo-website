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
        className="object-cover object-center scale-[1.01]"
      />

      <div className="absolute inset-0 bg-black/18" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/45 to-black/82" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.36)_100%)]" />

      <section className="relative z-10 mx-auto flex w-full max-w-[960px] flex-col items-center px-6 text-center 2xl:max-w-[1120px]">
        <div className="mb-7 rounded-[30px] border border-white/12 bg-black/16 px-8 py-3 shadow-[0_16px_56px_rgba(0,0,0,0.42)] backdrop-blur-lg sm:mb-8">
          <Image
            src="/logo.png"
            alt="MEVO"
            width={230}
            height={90}
            className="mx-auto h-auto w-[180px] sm:w-[230px]"
          />
        </div>

        <h1 className="mb-9 text-[2rem] font-medium leading-[1.02] tracking-[-0.032em] text-white sm:text-[3.6rem] 2xl:text-[4.05rem]">
          Your friends, your content
        </h1>

        <form onSubmit={onSubmit} className="w-full max-w-[640px]">
          <div className="mx-auto flex max-w-[620px] flex-col gap-3 rounded-[24px] border border-white/15 bg-black/28 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:flex-row sm:items-center sm:gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-12 flex-1 rounded-full border border-white/20 bg-white/10 px-5 text-base text-white outline-none ring-white/30 placeholder:text-white/58 focus:ring focus:ring-offset-0"
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
