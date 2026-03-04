'use client';

import { useEffect, useState } from 'react';

type CostResponse = {
  ok: boolean;
  totals?: { debitCredits: number; creditCredits: number; netCredits: number };
  rows?: Array<{ user_id: string; world_id: string | null; direction: string; amount: number; reason: string; created_at: string }>;
};

export default function MevoAdminPage() {
  const [data, setData] = useState<CostResponse | null>(null);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState('');
  const [schedulerKey, setSchedulerKey] = useState('');

  async function load() {
    const res = await fetch('/api/mevo/admin/costs?days=30', { cache: 'no-store' });
    const json = await res.json();
    setData(json);
  }

  async function runDue() {
    setRunning(true);
    setMsg('');
    try {
      const res = await fetch('/api/mevo/episodes/run-due', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-mevo-scheduler-key': schedulerKey },
        body: JSON.stringify({ limit: 10 })
      });
      const json = await res.json();
      setMsg(json?.ok ? `Processed ${json.processed} queued episodes` : json?.error || 'Run failed');
      await load();
    } catch {
      setMsg('Run failed');
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    load().catch(() => setMsg('Failed to load costs'));
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3">
          <h1 className="text-2xl font-medium">Mevo Admin</h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={schedulerKey}
              onChange={(e) => setSchedulerKey(e.target.value)}
              placeholder="Scheduler key"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm"
            />
            <button
              onClick={runDue}
              disabled={running}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
            >
              {running ? 'Running…' : 'Run queued episodes'}
            </button>
          </div>
        </div>

        <p className="mb-6 text-sm text-white/70">{msg}</p>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card label="Debits (30d)" value={String(data?.totals?.debitCredits ?? 0)} />
          <Card label="Credits (30d)" value={String(data?.totals?.creditCredits ?? 0)} />
          <Card label="Net (30d)" value={String(data?.totals?.netCredits ?? 0)} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-3 py-2 text-left">When</th>
                <th className="px-3 py-2 text-left">User</th>
                <th className="px-3 py-2 text-left">World</th>
                <th className="px-3 py-2 text-left">Dir</th>
                <th className="px-3 py-2 text-left">Amount</th>
                <th className="px-3 py-2 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {(data?.rows || []).slice(0, 200).map((r, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="px-3 py-2">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{r.user_id}</td>
                  <td className="px-3 py-2">{r.world_id || '-'}</td>
                  <td className="px-3 py-2">{r.direction}</td>
                  <td className="px-3 py-2">{r.amount}</td>
                  <td className="px-3 py-2">{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-white/70">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
