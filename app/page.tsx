'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setEmail('');
        setStatus('ok');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-black"
      style={{
        backgroundImage: "url('/hero.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center 24%',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.0) 45%)'
        }}
      />
      <div className="absolute inset-0 mix-blend-multiply" style={{ background: 'linear-gradient(to bottom, rgba(32,56,92,0.08), rgba(0,0,0,0))' }} />
      <div className="absolute inset-0 mix-blend-soft-light" style={{ background: 'linear-gradient(to top, rgba(255,188,126,0.05), rgba(0,0,0,0) 50%)' }} />

      <section
        className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col items-center px-4 text-center sm:min-h-screen sm:px-6"
        style={{ paddingTop: '20vh' }}
      >
        <Image
          src="/logo.png"
          alt="MEVO"
          width={560}
          height={190}
          priority
          className="h-auto w-[clamp(236px,68vw,560px)]"
          style={{ filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.08))' }}
        />

        <h1
          className="mt-6 max-w-[340px] text-white sm:max-w-[920px]"
          style={{
            fontWeight: 300,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(40px, 6vw, 56px)',
            lineHeight: 1.05
          }}
        >
          <span className="block">Your friends, your content</span>
        </h1>

        <form onSubmit={onSubmit} className="mt-8 w-full max-w-[504px]">
          <div className="flex flex-col gap-2.5 rounded-[30px] border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] p-2 backdrop-blur-[12px] shadow-[0_8px_18px_rgba(0,0,0,0.10)] sm:flex-row sm:items-center sm:gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-10 flex-1 rounded-[24px] bg-[#111] px-4 text-[15px] text-white outline-none placeholder:text-white/60 sm:h-11"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-10 rounded-[24px] bg-white px-6 text-sm font-medium text-black transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_14px_rgba(0,0,0,0.14)] disabled:translate-y-0 disabled:opacity-70 sm:h-11"
            >
              Join
            </button>
          </div>
          <p className="mt-2 min-h-5 text-xs text-white/80" aria-live="polite">
            {status === 'ok' ? 'You’re on the list.' : status === 'error' ? 'Try again.' : ''}
          </p>
        </form>
      </section>
    </main>
  );
}
