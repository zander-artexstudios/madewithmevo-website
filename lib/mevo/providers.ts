type EpisodeInput = {
  worldId: string;
  memoryContext: unknown;
};

export async function generateNarrative(input: EpisodeInput) {
  const mode = (process.env.MEVO_PROVIDER_MODE || 'mock').toLowerCase();

  if (mode === 'mock') {
    return {
      title: 'Weekly Episode Draft',
      beats: [
        'Cold open with relationship callback',
        'Unexpected turn tied to open thread',
        'Emotional payoff + teaser for next week'
      ],
      provider: 'mock'
    };
  }

  // Placeholder for real provider integrations.
  // e.g. OpenAI Responses / Anthropic / custom endpoint.
  return {
    title: 'Weekly Episode Draft',
    beats: [
      'Cold open with relationship callback',
      'Unexpected turn tied to open thread',
      'Emotional payoff + teaser for next week'
    ],
    provider: mode
  };
}

export async function generateShotlist(input: EpisodeInput) {
  const mode = (process.env.MEVO_PROVIDER_MODE || 'mock').toLowerCase();

  if (mode === 'mock') {
    return {
      shots: [
        { id: 's1', framing: 'wide', motion: 'slow push-in' },
        { id: 's2', framing: 'medium', motion: 'orbit slight' },
        { id: 's3', framing: 'close', motion: 'static emotional beat' }
      ],
      provider: 'mock'
    };
  }

  return {
    shots: [
      { id: 's1', framing: 'wide', motion: 'slow push-in' },
      { id: 's2', framing: 'medium', motion: 'orbit slight' },
      { id: 's3', framing: 'close', motion: 'static emotional beat' }
    ],
    provider: mode
  };
}
