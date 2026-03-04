import { createHmac, timingSafeEqual } from 'crypto';

const DEFAULT_SECRET = 'mevo-invite-dev-secret-change-me';

type InvitePayload = {
  worldId: string;
  ownerId: string;
  mode: 'view';
  exp: number;
};

function base64url(input: string) {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function decodeBase64url(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function getSecret() {
  return process.env.MEVO_INVITE_SECRET?.trim() || DEFAULT_SECRET;
}

function sign(unsignedToken: string) {
  return createHmac('sha256', getSecret()).update(unsignedToken).digest('base64url');
}

export function createInviteToken(worldId: string, ownerId: string, expiresInDays = 14) {
  const payload: InvitePayload = {
    worldId,
    ownerId,
    mode: 'view',
    exp: Date.now() + expiresInDays * 24 * 60 * 60 * 1000
  };

  const body = base64url(JSON.stringify(payload));
  const signature = sign(body);
  return `${body}.${signature}`;
}

export function parseInviteToken(token: string): InvitePayload | null {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expectedSig = sign(body);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSig);
  if (provided.length !== expected.length) return null;

  const isValid = timingSafeEqual(provided, expected);
  if (!isValid) return null;

  const payload = JSON.parse(decodeBase64url(body)) as InvitePayload;
  if (!payload?.worldId || !payload?.ownerId || payload?.mode !== 'view') return null;
  if (!payload?.exp || Date.now() > payload.exp) return null;

  return payload;
}
