import { DEFAULT_STYLE_PRESET, type StylePreset } from '@/lib/mevo/style';

type EpisodeInput = {
  worldId: string;
  memoryContext: unknown;
  stylePreset: StylePreset;
  tone?: string | null;
};

type ProviderAdapter = {
  id: string;
  generateNarrative: (input: EpisodeInput) => Promise<{ title: string; beats: string[]; provider: string }>;
  generateShotlist: (input: EpisodeInput) => Promise<{ shots: Array<{ id: string; framing: string; motion: string }>; provider: string }>;
};

const mockAdapter: ProviderAdapter = {
  id: 'mock',
  async generateNarrative(input) {
    return {
      title: 'Weekly Episode Draft',
      beats: [
        `Cold open in ${input.tone || 'cinematic-warm'} tone with relationship callback`,
        `Unexpected turn tied to open thread and ${input.stylePreset.visualAnchor}`,
        'Emotional payoff + teaser for next week'
      ],
      provider: 'mock'
    };
  },
  async generateShotlist(input) {
    return {
      shots: [
        { id: 's1', framing: `wide, ${input.stylePreset.descriptorTokens.lighting}`, motion: input.stylePreset.motionBudget.preferredMotion[0] || 'slow push-in' },
        { id: 's2', framing: `medium, ${input.stylePreset.descriptorTokens.camera}`, motion: input.stylePreset.motionBudget.preferredMotion[1] || 'gentle parallax' },
        { id: 's3', framing: 'close, emotional beat', motion: 'static emotional beat' }
      ],
      provider: 'mock'
    };
  }
};

const adapters: Record<string, ProviderAdapter> = {
  mock: mockAdapter,
  openai: mockAdapter,
  anthropic: mockAdapter
};

function resolveAdapter() {
  const mode = (process.env.MEVO_PROVIDER_MODE || 'mock').toLowerCase();
  return adapters[mode] || mockAdapter;
}

export async function generateNarrative(input: Omit<EpisodeInput, 'stylePreset'> & { stylePreset?: StylePreset }) {
  const adapter = resolveAdapter();
  return adapter.generateNarrative({ ...input, stylePreset: input.stylePreset || DEFAULT_STYLE_PRESET });
}

export async function generateShotlist(input: Omit<EpisodeInput, 'stylePreset'> & { stylePreset?: StylePreset }) {
  const adapter = resolveAdapter();
  return adapter.generateShotlist({ ...input, stylePreset: input.stylePreset || DEFAULT_STYLE_PRESET });
}
