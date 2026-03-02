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
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center px-6 pb-16 pt-10 text-center sm:pt-14">
        <div className="text-[2.35rem] font-semibold tracking-[0.08em] text-white sm:text-[3rem]">
          MEVO
        </div>

        <h1 className="mt-10 text-[2.1rem] font-light leading-[1.05] tracking-[0.01em] text-white sm:mt-14 sm:text-[4rem]">
          Your friends, your content
        </h1>

        <form onSubmit={onSubmit} className="mt-14 w-full max-w-[660px] sm:mt-16">
          <div className="flex flex-col gap-3 rounded-[999px] border border-white/20 bg-white/10 p-3 backdrop-blur-md sm:flex-row sm:items-center sm:gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-12 flex-1 rounded-full border border-white/10 bg-[#1a1a1a]/92 px-5 text-base text-white outline-none placeholder:text-white/55"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-full bg-white px-7 text-sm font-semibold text-black transition duration-200 hover:-translate-y-[1px] disabled:opacity-70"
            >
              Join our waitlist
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
