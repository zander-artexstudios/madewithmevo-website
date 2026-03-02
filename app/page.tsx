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
    <main className="relative min-h-screen overflow-hidden bg-black">
      <Image
        src="/hero.png"
        alt="MEVO background"
        fill
        priority
        quality={100}
        className="object-cover object-bottom"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-transparent" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 text-center">
        <Image
          src="/logo.png"
          alt="MEVO"
          width={280}
          height={104}
          priority
          className="mb-8 h-auto w-[190px] sm:w-[250px]"
        />

        <h1 className="mb-14 text-[2.15rem] font-extralight leading-[1.04] tracking-[0.012em] text-white sm:text-[4rem]">
          Your friends, your content
        </h1>

        <form onSubmit={onSubmit} className="w-full max-w-[520px]">
          <div className="flex flex-col gap-3 rounded-[999px] border border-white/20 bg-white/10 p-3 shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-12 flex-1 rounded-full border border-white/10 bg-[#1c1c1e]/92 px-5 text-base text-white outline-none placeholder:text-white/75"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-full bg-white px-7 text-sm font-semibold text-black transition duration-200 hover:-translate-y-[2px] disabled:translate-y-0 disabled:opacity-70"
            >
              Join our waitlist
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
