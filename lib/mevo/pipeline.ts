import { buildEpisodeMemoryContext, continuityPromptBlock } from '@/lib/mevo/memory';
import { generateNarrative, generateShotlist } from '@/lib/mevo/providers';
import { enforceMotionBudget, enforceStyleDescriptors, resolveStylePreset } from '@/lib/mevo/style';

export async function buildGeneratedEpisodePayload(input: {
  worldId: string;
  stylePreset?: string | null;
  tone?: string | null;
  canon: unknown[];
  recentEpisodes: unknown[];
  openThreads: unknown[];
}) {
  const memoryContext = buildEpisodeMemoryContext({
    canon: input.canon,
    recentEpisodes: input.recentEpisodes,
    openThreads: input.openThreads
  });

  const style = resolveStylePreset(input.stylePreset || undefined);
  const continuity = continuityPromptBlock(memoryContext);

  const [narrative, shots] = await Promise.all([
    generateNarrative({ worldId: input.worldId, memoryContext: continuity, stylePreset: style, tone: input.tone }),
    generateShotlist({ worldId: input.worldId, memoryContext: continuity, stylePreset: style, tone: input.tone })
  ]);

  const motion = enforceMotionBudget(shots.shots, style.motionBudget.maxMotionShots);
  const styledShots = enforceStyleDescriptors(motion.shots, style);

  const script = {
    version: 3,
    title: narrative.title,
    beats: narrative.beats,
    continuity,
    styleAnchor: style,
    styleDescriptors: style.descriptorTokens,
    provider: narrative.provider
  };

  const shotlist = {
    version: 3,
    shots: styledShots,
    motionPolicy: {
      movingShots: motion.movingShots,
      maxMotionShots: motion.maxMotionShots
    },
    provider: shots.provider
  };

  return { script, shotlist };
}
