import { buildEpisodeMemoryContext, continuityPromptBlock } from '@/lib/mevo/memory';
import { generateNarrative, generateShotlist } from '@/lib/mevo/providers';

export async function buildGeneratedEpisodePayload(input: {
  worldId: string;
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

  const [narrative, shots] = await Promise.all([
    generateNarrative({ worldId: input.worldId, memoryContext: continuity }),
    generateShotlist({ worldId: input.worldId, memoryContext: continuity })
  ]);

  const script = {
    version: 2,
    title: narrative.title,
    beats: narrative.beats,
    continuity,
    provider: narrative.provider
  };

  const shotlist = {
    version: 2,
    shots: shots.shots,
    provider: shots.provider
  };

  return { script, shotlist };
}
