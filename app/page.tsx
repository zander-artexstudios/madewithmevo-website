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
        backgroundPosition: 'center 16%',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 45%)'
        }}
      />

      <section className="relative z-10 mx-auto min-h-[100svh] w-full max-w-6xl px-4 text-center sm:px-6">
        <div className="flex flex-col items-center" style={{ paddingTop: '10vh' }}>
          <Image
            src="/logo.png"
            alt="MEVO"
            width={520}
            height={176}
            priority
            className="h-auto w-[clamp(160px,48vw,300px)] sm:w-[clamp(190px,56vw,520px)]"
            style={{ filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.08))' }}
          />

          <h1
            className="mt-[2.5vh] max-w-[290px] text-white sm:max-w-[840px]"
            style={{
              fontWeight: 300,
              letterSpacing: '-0.02em',
              fontSize: 'clamp(24px, 7.2vw, 56px)',
              lineHeight: 1.05
            }}
          >
            Your friends, your content
          </h1>

          <form onSubmit={onSubmit} className="mt-[2.5vh] w-full max-w-[320px] sm:mt-3 sm:max-w-[360px]">
            <div className="flex flex-col gap-1 rounded-[20px] border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.07)] p-1.5 backdrop-blur-[8px] shadow-[0_4px_8px_rgba(0,0,0,0.06)] sm:flex-row sm:items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="h-[34px] flex-1 rounded-[18px] bg-[#111] px-3 text-[13px] text-white outline-none placeholder:text-white/60 sm:h-[38px] sm:px-3.5 sm:text-[14px]"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-[34px] self-end rounded-[18px] bg-white px-3.5 text-[12px] font-medium text-black transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_5px_10px_rgba(0,0,0,0.12)] disabled:translate-y-0 disabled:opacity-70 sm:h-[38px] sm:self-auto sm:rounded-[20px] sm:px-4 sm:text-[13px]"
              >
                Join →
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
