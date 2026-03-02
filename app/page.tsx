'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setEmail('');
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
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.0) 45%)'
        }}
      />
      <div className="absolute inset-0 mix-blend-multiply" style={{ background: 'linear-gradient(to bottom, rgba(33,59,98,0.08), rgba(0,0,0,0))' }} />
      <div className="absolute inset-0 mix-blend-soft-light" style={{ background: 'linear-gradient(to top, rgba(255,193,132,0.05), rgba(0,0,0,0) 50%)' }} />

      <section
        className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col items-center px-4 text-center sm:min-h-screen sm:px-6"
        style={{ paddingTop: '24vh' }}
      >
        <Image
          src="/logo.png"
          alt="MEVO"
          width={560}
          height={190}
          priority
          className="h-auto w-[clamp(214px,63vw,560px)]"
          style={{ filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.08))' }}
        />

        <h1
          className="mt-7 max-w-[920px] text-white"
          style={{
            fontWeight: 300,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(40px, 5vw, 64px)',
            lineHeight: 1.05
          }}
        >
          Your friends, your content
        </h1>

        <form onSubmit={onSubmit} className="mt-8 w-full max-w-[468px]">
          <div className="flex flex-col gap-2.5 rounded-[36px] border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] p-2.5 backdrop-blur-[12px] sm:flex-row sm:items-center sm:gap-2 sm:rounded-[999px]">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-[54px] flex-1 rounded-full bg-[#111] px-5 text-base text-white outline-none placeholder:text-white/60"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-[54px] rounded-full bg-white px-8 text-sm font-semibold text-black transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.14)] disabled:translate-y-0 disabled:opacity-70"
            >
              Join our waitlist
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
