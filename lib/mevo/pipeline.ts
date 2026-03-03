import { buildEpisodeMemoryContext, continuityPromptBlock } from '@/lib/mevo/memory';

export function buildGeneratedEpisodePayload(input: {
  canon: unknown[];
  recentEpisodes: unknown[];
  openThreads: unknown[];
}) {
  const memoryContext = buildEpisodeMemoryContext({
    canon: input.canon,
    recentEpisodes: input.recentEpisodes,
    openThreads: input.openThreads
  });

  const continuity = continuityPromptBlock(memoryContext);

  const script = {
    version: 1,
    title: 'Weekly Episode Draft',
    beats: [
      'Cold open with relationship callback',
      'Unexpected turn tied to open thread',
      'Emotional payoff + teaser for next week'
    ],
    continuity
  };

  const shotlist = {
    version: 1,
    shots: [
      { id: 's1', framing: 'wide', motion: 'slow push-in' },
      { id: 's2', framing: 'medium', motion: 'orbit slight' },
      { id: 's3', framing: 'close', motion: 'static emotional beat' }
    ]
  };

  return { script, shotlist };
}
