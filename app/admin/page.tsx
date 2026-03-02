'use client';

import { FormEvent, useEffect, useState } from 'react';

type Signup = {
  id: number;
  email: string;
  created_at: string;
  referrer: string | null;
  user_agent: string | null;
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [rows, setRows] = useState<Signup[]>([]);
  const [error, setError] = useState('');

  async function loadData() {
    const res = await fetch('/api/admin/signups', { cache: 'no-store' });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const json = await res.json();
    setRows(json.rows || []);
    setAuthed(true);
  }

  useEffect(() => {
    loadData().catch(() => setError('Try again.'));
  }, []);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (!res.ok) {
      setError('Try again.');
      return;
    }

    setPassword('');
    await loadData();
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex min-h-screen max-w-md items-center px-6">
          <form onSubmit={onLogin} className="w-full space-y-3">
            <h1 className="text-2xl font-medium">Admin</h1>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3 outline-none focus:ring focus:ring-white/20"
            />
            <button className="h-11 w-full rounded-lg bg-white text-sm font-semibold text-black">
              Enter
            </button>
            <p className="text-sm text-red-300">{error}</p>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-medium">Waitlist signups</h1>
          <a
            href="/api/admin/csv"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            Download CSV
          </a>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Created</th>
                <th className="px-3 py-2 text-left">Referrer</th>
                <th className="px-3 py-2 text-left">User Agent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/10">
                  <td className="px-3 py-2">{r.email}</td>
                  <td className="px-3 py-2">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="max-w-[260px] truncate px-3 py-2">{r.referrer ?? '-'}</td>
                  <td className="max-w-[340px] truncate px-3 py-2">{r.user_agent ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
