'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getMevoSupabaseClient } from '@/lib/mevo/client-auth';

export default function MevoSignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    setMsg('');
    try {
      const supabase = getMevoSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/mevo` }
      });
      if (error) {
        setMsg(error.message);
      } else {
        setMsg('Check your inbox for a sign-in link.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    setMsg('');
    try {
      const supabase = getMevoSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/mevo` }
      });
      if (error) setMsg(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Sign in to Mevo</h1>
        <p className="mt-2 text-sm text-white/70">Use email link or Google. You’ll return straight to your dashboard.</p>

        <div className="mt-5 grid gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="h-11 rounded-lg border border-white/15 bg-black/50 px-3 outline-none"
          />
          <button
            onClick={signInWithEmail}
            disabled={loading || !email.trim()}
            className="h-11 rounded-lg bg-white text-sm font-semibold text-black disabled:opacity-50"
          >
            Continue with email
          </button>
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="h-11 rounded-lg border border-white/25 text-sm font-semibold disabled:opacity-50"
          >
            Continue with Google
          </button>
          <button
            onClick={() => router.push('/mevo')}
            className="text-sm text-white/70 underline"
          >
            I already signed in
          </button>
          <p className="text-sm text-white/70">{msg}</p>
          <Link href="/" className="text-xs text-white/60">← Back to site</Link>
        </div>
      </div>
    </main>
  );
}
