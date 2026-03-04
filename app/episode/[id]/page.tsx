'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

type EpisodePayload = {
  ok: boolean;
  episode?: {
    id: string;
    title: string | null;
    summary: string | null;
    script?: { title?: string; beats?: string[]; previouslyOn?: string };
    shotlist?: { shots?: Array<{ id?: string; framing?: string; motion?: string }> };
    share_url?: string | null;
  };
  previous?: { title?: string | null; summary?: string | null } | null;
};

export default function EpisodeViewPage() {
  const params = useParams<{ id: string }>();
  const episodeId = params?.id;
  const [data, setData] = useState<EpisodePayload | null>(null);
  const [msg, setMsg] = useState('');
  const completionTracked = useRef(false);

  useEffect(() => {
    if (!episodeId) return;
    fetch(`/api/mevo/episodes/${episodeId}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (!json?.ok) {
          setMsg('Episode not available yet.');
          return;
        }
        setData(json);
        fetch('/api/mevo/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'episode_view_started', episodeId })
        }).catch(() => null);
      })
      .catch(() => setMsg('Failed to load episode.'));
  }, [episodeId]);

  useEffect(() => {
    if (!episodeId || completionTracked.current) return;
    const timer = setTimeout(() => {
      completionTracked.current = true;
      fetch('/api/mevo/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'episode_view_completed', episodeId, meta: { completionType: 'timer_8s' } })
      }).catch(() => null);
    }, 8_000);

    return () => clearTimeout(timer);
  }, [episodeId]);

  const shareUrl = useMemo(() => {
    if (!data?.episode?.share_url) return typeof window !== 'undefined' ? window.location.href : '';
    return data.episode.share_url;
  }, [data?.episode?.share_url]);

  const title = data?.episode?.title || data?.episode?.script?.title || 'Untitled episode';
  const recap = data?.episode?.script?.previouslyOn || data?.previous?.summary || 'New chapter, same world. Stakes are rising.';
  const beats = data?.episode?.script?.beats || [];
  const shots = data?.episode?.shotlist?.shots || [];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-white/70">Episode ID: {episodeId}</p>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Previously on</p>
          <p className="mt-2 text-white/90">{recap}</p>
        </section>

        <div className="mt-6 grid gap-3">
          {(shots.length ? shots : [{ id: 's1', framing: 'cinematic still', motion: 'static' }]).map((shot, idx) => (
            <div key={shot.id || idx} className="rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-4">
              <p className="text-sm text-white/60">Still {idx + 1}</p>
              <p className="mt-1 font-medium">{shot.framing || 'Cinematic frame'}</p>
              <p className="text-sm text-white/70">Camera: {shot.motion || 'static'}</p>
              {beats[idx] && <p className="mt-2 text-sm text-white/80">{beats[idx]}</p>}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Watch our new Mevo episode: ${shareUrl}`)}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              fetch('/api/mevo/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: 'share_clicked', episodeId, meta: { channel: 'whatsapp' } })
              }).catch(() => null);
            }}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            Share to WhatsApp
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              fetch('/api/mevo/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: 'share_clicked', episodeId, meta: { channel: 'copy_link' } })
              }).catch(() => null);
            }}
            className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold"
          >
            Copy link
          </button>
        </div>

        <p className="mt-4 text-sm text-white/70">{data?.episode?.summary || msg}</p>
      </div>
    </main>
  );
}
