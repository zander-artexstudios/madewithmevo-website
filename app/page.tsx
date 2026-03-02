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
        className="object-cover object-[center_68%] scale-[1.03] saturate-[1.08] contrast-[1.08]"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_54%,rgba(0,0,0,0.26)_100%)]" />

      <section className="relative z-10 mx-auto flex w-full max-w-[980px] flex-col items-center px-6 pt-[9vh] text-center 2xl:max-w-[1180px]">
        <div className="mb-12 px-8 py-3">
          <Image
            src="/logo.png"
            alt="MEVO"
            width={270}
            height={100}
            className="h-auto w-[190px] [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.28))] sm:w-[250px]"
            priority
          />
        </div>

        <h1 className="mb-14 text-[2.2rem] font-light leading-[1.05] tracking-[0.01em] text-white sm:text-[4.05rem] 2xl:text-[4.4rem]">
          Your friends, your content
        </h1>

        <form onSubmit={onSubmit} className="w-full max-w-[700px]">
          <div className="mx-auto flex max-w-[680px] flex-col gap-3 rounded-[999px] border border-white/20 bg-white/8 p-3 shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-12 flex-1 rounded-full border border-white/15 bg-[#161616]/90 px-5 text-base text-white outline-none ring-white/25 placeholder:text-white/55 focus:ring focus:ring-offset-0"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="h-12 rounded-full bg-white px-7 text-sm font-semibold text-black shadow-[0_8px_22px_rgba(0,0,0,0.18)] transition duration-200 hover:-translate-y-[1px] hover:bg-white/95 active:translate-y-0 disabled:translate-y-0 disabled:opacity-70 sm:shrink-0"
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
