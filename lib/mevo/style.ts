export type StylePreset = {
  id: string;
  visualAnchor: string;
  palette: string;
  camera: string;
  characterRules: string[];
  descriptorTokens: {
    lighting: string;
    camera: string;
  };
  motionBudget: {
    maxMotionShots: number;
    preferredMotion: string[];
  };
};

function resolveMotionCap() {
  const raw = Number(process.env.MEVO_MAX_MOTION_SHOTS || 2);
  if (!Number.isFinite(raw)) return 2;
  return Math.max(0, Math.min(6, Math.floor(raw)));
}

export const DEFAULT_STYLE_PRESET: StylePreset = {
  id: 'MEVO_WORLD_V1',
  visualAnchor: 'Coastal hyper-real, sky-led composition, premium depth and restrained bloom',
  palette: 'Deep blue shadows, warm skin mids, silver highlights',
  camera: 'Social vertical framing, clean horizon, emotional close-ups',
  characterRules: ['Keep cast identity stable across episodes', 'No drastic face/style drift', 'Wardrobe continuity unless explicitly changed'],
  descriptorTokens: {
    lighting: 'golden-hour soft contrast, skin-safe highlights, cinematic bloom restraint',
    camera: '35mm-equivalent vertical composition, horizon disciplined, emotionally anchored close-ups'
  },
  motionBudget: {
    maxMotionShots: resolveMotionCap(),
    preferredMotion: ['slow push-in', 'gentle parallax', 'subtle dolly']
  }
};

export function resolveStylePreset(stylePreset?: string): StylePreset {
  if (!stylePreset || stylePreset === DEFAULT_STYLE_PRESET.id) return DEFAULT_STYLE_PRESET;
  // Unknown presets gracefully fallback to locked default for MVP consistency.
  return { ...DEFAULT_STYLE_PRESET, id: stylePreset };
}

export function enforceMotionBudget(
  shots: Array<{ id: string; framing: string; motion: string }>,
  maxMotionShots: number
) {
  let moving = 0;
  const normalized = shots.map((s) => {
    const motionText = (s.motion || '').toLowerCase();
    const wantsMotion = motionText !== 'static' && motionText !== 'none' && motionText.trim() !== '';

    if (!wantsMotion) return { ...s, motion: 'static' };

    if (moving < maxMotionShots) {
      moving += 1;
      return s;
    }

    return { ...s, motion: 'static (budget-capped)' };
  });

  return {
    shots: normalized,
    movingShots: moving,
    maxMotionShots,
    capped: moving >= maxMotionShots
  };
}

export function enforceStyleDescriptors(
  shots: Array<{ id: string; framing: string; motion: string }>,
  style: StylePreset
) {
  return shots.map((shot) => ({
    ...shot,
    framing: `${shot.framing} | lighting: ${style.descriptorTokens.lighting} | camera: ${style.descriptorTokens.camera}`
  }));
}
