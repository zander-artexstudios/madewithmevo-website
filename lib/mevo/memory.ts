export type MemoryKind = 'canon' | 'episode' | 'thread' | 'event';

export function buildEpisodeMemoryContext(input: {
  canon: unknown[];
  recentEpisodes: unknown[];
  openThreads: unknown[];
}) {
  return {
    canon: input.canon.slice(0, 30),
    recentEpisodes: input.recentEpisodes.slice(0, 3),
    openThreads: input.openThreads.slice(0, 12)
  };
}

export function continuityPromptBlock(ctx: ReturnType<typeof buildEpisodeMemoryContext>) {
  return {
    continuity_constraints: {
      keep_character_identity: true,
      resolve_or_reference_open_threads: true,
      preserve_world_rules: true
    },
    memory_context: ctx
  };
}
