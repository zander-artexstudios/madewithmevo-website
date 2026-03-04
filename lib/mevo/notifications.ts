type EpisodePublishedEmailInput = {
  to?: string | null;
  episodeId: string;
  title?: string | null;
  summary?: string | null;
  shareUrl: string;
};

export async function sendEpisodePublishedEmailStub(input: EpisodePublishedEmailInput) {
  const fallbackTo = process.env.MEVO_NOTIFICATION_STUB_EMAIL_TO?.trim();
  const to = input.to?.trim() || fallbackTo;

  if (!to) {
    console.warn('[MEVO_EMAIL_STUB] skipped: no recipient configured', {
      episodeId: input.episodeId,
      hint: 'Set MEVO_NOTIFICATION_STUB_EMAIL_TO to enable alpha notifications.'
    });
    return { ok: false, skipped: true, reason: 'no_recipient' as const };
  }

  const subject = `New Mevo episode: ${input.title || 'Your latest drop is live'}`;
  const text = [
    `Hey — your new Mevo episode is live.`,
    '',
    input.summary || 'Tap in and share it with your friends.',
    '',
    `Watch now: ${input.shareUrl}`,
    '',
    '(alpha stub email)'
  ].join('\n');

  console.info('[MEVO_EMAIL_STUB] send', {
    to,
    subject,
    text,
    episodeId: input.episodeId
  });

  return { ok: true, channel: 'email_stub' as const, to, subject };
}
