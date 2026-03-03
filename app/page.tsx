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
        backgroundPosition: 'center 40%',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.0) 50%), radial-gradient(circle at 50% 60%, rgba(0,0,0,0.0) 60%, rgba(0,0,0,0.12) 100%)'
        }}
      />
      <div className="absolute inset-0 mix-blend-multiply" style={{ background: 'linear-gradient(to bottom, rgba(24,48,92,0.08), rgba(0,0,0,0))' }} />
      <div className="absolute inset-0 mix-blend-soft-light" style={{ background: 'linear-gradient(to top, rgba(145,184,255,0.08), rgba(0,0,0,0) 58%)' }} />

      <section className="relative z-10 mx-auto min-h-[100svh] w-full max-w-6xl px-5 text-center sm:px-8">
        <div className="flex flex-col items-center" style={{ paddingTop: '6vh' }}>
          <Image
            src="/logo.png"
            alt="MEVO"
            width={560}
            height={190}
            priority
            className="h-auto w-[clamp(180px,58vw,360px)] sm:w-[clamp(220px,48vw,560px)]"
            style={{ filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.12))' }}
          />

          <h1
            className="mt-5 max-w-[760px] text-white"
            style={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontSize: 'clamp(34px, 8.4vw, 72px)',
              lineHeight: 1.02
            }}
          >
            Your friends. Your show.
          </h1>

          <p
            className="mt-3 max-w-[560px] text-white/85"
            style={{
              fontWeight: 400,
              letterSpacing: '-0.005em',
              fontSize: 'clamp(15px, 3.8vw, 24px)',
              lineHeight: 1.3
            }}
          >
            Private AI-generated episodes for your group.
          </p>

          <form onSubmit={onSubmit} className="mt-5 w-full max-w-[360px] sm:max-w-[460px]">
            <div className="flex flex-col gap-2 rounded-[28px] border border-[rgba(255,255,255,0.20)] bg-[rgba(255,255,255,0.07)] p-2 backdrop-blur-[10px] [box-shadow:inset_0_1px_0_rgba(255,255,255,0.16)] sm:flex-row sm:items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="h-[42px] flex-1 rounded-[20px] border border-transparent bg-[rgba(17,17,17,0.86)] px-4 text-[14px] text-white outline-none placeholder:text-[#c9c9ce] sm:h-[48px] sm:text-[15px]"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-[42px] rounded-[20px] bg-[#f4f4f6] px-5 text-[14px] font-medium text-black transition duration-200 hover:bg-[#e9e9ed] disabled:opacity-70 sm:h-[48px]"
              >
                Join
              </button>
            </div>
            <p className="mt-2 min-h-5 text-xs text-white/80" aria-live="polite">
              {status === 'ok' ? 'You’re on the list.' : status === 'error' ? 'Try again.' : ''}
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
