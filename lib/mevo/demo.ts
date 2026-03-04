import type { SupabaseClient } from '@supabase/supabase-js';

export const DEMO_WORLD_NAME = 'Mevo Demo World';

function buildDemoEpisodes(worldId: string) {
  const now = Date.now();
  return [
    {
      world_id: worldId,
      status: 'published',
      title: 'Episode 1: First Light at Shoreline House',
      summary: 'A calm weekend turns into a pact: no one leaves the group behind this season.',
      script: {
        title: 'First Light at Shoreline House',
        previouslyOn: 'The group reunited after months apart and quietly agreed to rebuild trust.',
        beats: [
          'Golden-hour arrival and first tension-filled hugs.',
          'A toast reveals a hidden conflict from last summer.',
          'They make a pact to face every secret together.'
        ]
      },
      shotlist: {
        shots: [
          { id: 's1', framing: 'wide establishing', motion: 'slow push-in' },
          { id: 's2', framing: 'mid reaction', motion: 'gentle parallax' },
          { id: 's3', framing: 'close emotional beat', motion: 'static' }
        ]
      }
    },
    {
      world_id: worldId,
      status: 'published',
      title: 'Episode 2: The Message Nobody Sent',
      summary: 'A leaked screenshot forces confessions and redraws alliances before midnight.',
      script: {
        title: 'The Message Nobody Sent',
        previouslyOn: 'The pact was made, but an old betrayal remained unresolved.',
        beats: [
          'A mysterious screenshot appears in the group chat.',
          'Two friends accuse each other, then discover a third hand.',
          'A rain-soaked confrontation ends with a fragile truce.'
        ]
      },
      shotlist: {
        shots: [
          { id: 's1', framing: 'phone insert', motion: 'static' },
          { id: 's2', framing: 'wide storm walk', motion: 'slow push-in' },
          { id: 's3', framing: 'close confession', motion: 'gentle parallax' }
        ]
      }
    },
    {
      world_id: worldId,
      status: 'published',
      title: 'Episode 3: Sunrise Clause',
      summary: 'At dawn they choose loyalty over ego—and tease a bigger rival for next week.',
      script: {
        title: 'Sunrise Clause',
        previouslyOn: 'Trust cracked again when the screenshot scandal surfaced.',
        beats: [
          'The crew regroups on the pier before sunrise.',
          'One final truth resets the pecking order.',
          'A distant rival arrives, setting up the next arc.'
        ]
      },
      shotlist: {
        shots: [
          { id: 's1', framing: 'dawn horizon', motion: 'subtle dolly' },
          { id: 's2', framing: 'group silhouette', motion: 'static' },
          { id: 's3', framing: 'teaser reveal', motion: 'slow push-in' }
        ]
      }
    }
  ].map((episode, idx) => ({
    ...episode,
    published_at: new Date(now - (3 - idx) * 60 * 60 * 1000).toISOString(),
    share_url: `${process.env.MEVO_SHARE_BASE_URL || 'https://madewithmevo.com'}/episode/demo-${idx + 1}`
  }));
}

export async function ensureDemoContent(
  supabase: SupabaseClient,
  userId: string,
  options?: { forceCreateWorld?: boolean }
) {
  const { data: existingWorlds, error: worldsError } = await supabase
    .from('worlds')
    .select('id,name')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (worldsError) throw worldsError;

  let demoWorld = (existingWorlds || []).find((w) => w.name === DEMO_WORLD_NAME);
  if (!demoWorld && ((existingWorlds || []).length === 0 || options?.forceCreateWorld)) {
    const { data, error } = await supabase
      .from('worlds')
      .insert({
        user_id: userId,
        name: DEMO_WORLD_NAME,
        tone: 'cinematic-warm',
        style_preset: 'MEVO_WORLD_V1'
      })
      .select('id,name')
      .single();

    if (error) throw error;
    demoWorld = data;
  }

  if (!demoWorld) return;

  const demoEpisodes = buildDemoEpisodes(demoWorld.id);
  const expectedTitles = demoEpisodes.map((e) => e.title);

  const { data: existingEpisodes, error: existingEpisodesError } = await supabase
    .from('episodes')
    .select('id,title,status,published_at')
    .eq('world_id', demoWorld.id)
    .in('title', expectedTitles);

  if (existingEpisodesError) throw existingEpisodesError;

  const existingByTitle = new Map((existingEpisodes || []).map((ep) => [ep.title, ep]));

  const missingEpisodes = demoEpisodes.filter((ep) => !existingByTitle.has(ep.title));
  if (missingEpisodes.length > 0) {
    const { error: seedError } = await supabase.from('episodes').insert(missingEpisodes);
    if (seedError) throw seedError;
  }

  const needsPublishRepair = (existingEpisodes || []).filter(
    (ep) => ep.status !== 'published' || !ep.published_at
  );

  for (const ep of needsPublishRepair) {
    const target = demoEpisodes.find((d) => d.title === ep.title);
    const { error: repairError } = await supabase
      .from('episodes')
      .update({
        status: 'published',
        published_at: target?.published_at || new Date().toISOString(),
        share_url: target?.share_url || `${process.env.MEVO_SHARE_BASE_URL || 'https://madewithmevo.com'}/episode/${ep.id}`
      })
      .eq('id', ep.id);

    if (repairError) throw repairError;
  }
}
