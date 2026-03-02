type Entry = { count: number; resetAt: number };

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

const store = new Map<string, Entry>();

export function hitRateLimit(key: string) {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false, remaining: MAX_REQUESTS - 1 };
  }

  if (existing.count >= MAX_REQUESTS) {
    return { limited: true, remaining: 0 };
  }

  existing.count += 1;
  store.set(key, existing);
  return { limited: false, remaining: MAX_REQUESTS - existing.count };
}
