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
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.0) 50%), radial-gradient(circle at 50% 62%, rgba(0,0,0,0.0) 64%, rgba(0,0,0,0.10) 100%)'
        }}
      />
      <div className="absolute inset-0 mix-blend-multiply" style={{ background: 'linear-gradient(to bottom, rgba(24,48,92,0.06), rgba(0,0,0,0))' }} />
      <div className="absolute inset-0 mix-blend-soft-light" style={{ background: 'linear-gradient(to top, rgba(145,184,255,0.06), rgba(0,0,0,0) 58%)' }} />

      <section className="relative z-10 mx-auto min-h-[100svh] w-full max-w-6xl px-5 text-center sm:px-8">
        <div className="flex flex-col items-center" style={{ paddingTop: 'max(2px, env(safe-area-inset-top))' }}>
          <Image
            src="/logo.png"
            alt="MEVO"
            width={560}
            height={190}
            priority
            className="h-auto w-[clamp(170px,46vw,250px)] sm:w-[clamp(290px,54vw,620px)]"
            style={{ filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.12))' }}
          />

          <h1
            className="mt-2 max-w-[260px] text-white sm:max-w-[760px]"
            style={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontSize: 'clamp(17px, 4.9vw, 72px)',
              lineHeight: 1.02
            }}
          >
            Your friends. Your show.
          </h1>

          <p
            className="mt-1 max-w-[220px] text-white/80 sm:max-w-[560px]"
            style={{
              fontWeight: 400,
              letterSpacing: '-0.005em',
              fontSize: 'clamp(11px, 2.9vw, 24px)',
              lineHeight: 1.3
            }}
          >
            Private AI-generated episodes for your group.
          </p>

          <form onSubmit={onSubmit} className="mt-1 w-full max-w-[180px] sm:max-w-[360px]">
            <div className="flex flex-col gap-1 rounded-[22px] border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.06)] p-1.5 backdrop-blur-[8px] [box-shadow:inset_0_1px_0_rgba(255,255,255,0.12)] sm:flex-row sm:items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="h-[32px] flex-1 rounded-[16px] border border-transparent bg-[rgba(16,16,18,0.86)] px-3 text-[12px] text-white outline-none placeholder:text-[#c9c9ce] sm:h-[38px] sm:px-3.5 sm:text-[13px]"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-[32px] rounded-[16px] bg-[#f6f7fb] px-3 text-[12px] font-medium text-black transition duration-200 hover:bg-[#e8eaf2] disabled:opacity-70 sm:h-[38px] sm:px-3.5 sm:text-[13px]"
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
