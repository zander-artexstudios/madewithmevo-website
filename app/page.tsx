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
        backgroundPosition: 'center 44%',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <section
        className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center px-6 text-center"
        style={{ paddingTop: '7vh' }}
      >
        <Image
          src="/logo.png"
          alt="MEVO"
          width={500}
          height={170}
          priority
          className="h-auto w-[clamp(280px,39vw,500px)] saturate-[0.88]"
        />

        <h1
          className="mt-6 max-w-[900px] text-white/95"
          style={{
            fontWeight: 300,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(40px, 3.7vw, 58px)',
            lineHeight: 1.1
          }}
        >
          Your friends, your content
        </h1>

        <form onSubmit={onSubmit} className="mt-14 w-full max-w-[520px]">
          <div className="flex flex-col gap-3 rounded-[999px] border border-white/18 bg-white/10 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:flex-row sm:items-center sm:gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-12 flex-1 rounded-full bg-[#1c1c1e] px-5 text-base text-white outline-none placeholder:text-white/75"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-full bg-white px-8 text-sm font-semibold text-black transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.22)] disabled:translate-y-0 disabled:opacity-70"
            >
              Join our waitlist
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
