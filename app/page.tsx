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
        className="object-cover object-[center_62%] scale-[1.08] blur-[3px]"
      />

      <div className="absolute inset-0 bg-black/42" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/48 via-black/62 to-black/88" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(82,142,255,0.15),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_24%,rgba(0,0,0,0.52)_100%)]" />

      <section className="relative z-10 mx-auto flex w-full max-w-[980px] flex-col items-center px-6 text-center 2xl:max-w-[1180px]">
        <div className="mb-8 rounded-[32px] border border-white/12 bg-black/22 px-8 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <Image
            src="/logo.png"
            alt="MEVO"
            width={270}
            height={100}
            className="h-auto w-[190px] sm:w-[250px]"
            priority
          />
        </div>

        <h1 className="mb-10 text-[2.15rem] font-medium leading-[1.03] tracking-[-0.03em] text-white sm:text-[4rem] 2xl:text-[4.4rem]">
          Your friends, your content
        </h1>

        <form onSubmit={onSubmit} className="w-full max-w-[680px]">
          <div className="mx-auto flex max-w-[660px] flex-col gap-3 rounded-[28px] border border-white/20 bg-black/46 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:flex-row sm:items-center sm:gap-2">
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
              className="h-12 rounded-full bg-white px-7 text-sm font-semibold text-black shadow-[0_12px_34px_rgba(255,255,255,0.35)] transition duration-200 hover:-translate-y-[1px] hover:bg-white/92 active:translate-y-0 disabled:translate-y-0 disabled:opacity-70 sm:shrink-0"
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
