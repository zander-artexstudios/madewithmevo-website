'use client';

import { useParams } from 'next/navigation';

export default function EpisodeViewPage() {
  const params = useParams<{ id: string }>();
  const episodeId = params?.id;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/episode/${episodeId}` : '';

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Episode</h1>
        <p className="mt-2 text-sm text-white/70">{episodeId}</p>

        <div className="mt-6 aspect-[9/16] w-full rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-white/80">Video player placeholder (wire to episode.video_url next).</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Watch our new Mevo episode: ${shareUrl}`)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            Share to WhatsApp
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold"
          >
            Copy link
          </button>
        </div>
      </div>
    </main>
  );
}
