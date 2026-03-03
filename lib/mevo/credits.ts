export type Plan = {
  id: string;
  monthlyCredits: number;
  hardCap: number;
};

const PLANS: Record<string, Plan> = {
  free: { id: 'free', monthlyCredits: 120, hardCap: 120 },
  plus: { id: 'plus', monthlyCredits: 500, hardCap: 500 },
  pro: { id: 'pro', monthlyCredits: 1200, hardCap: 1200 }
};

export const EPISODE_BASE_COST = Number(process.env.MEVO_EPISODE_BASE_COST || 100);

export function getPlan(planId?: string) {
  return PLANS[(planId || 'free').toLowerCase()] || PLANS.free;
}

export function canSpend(currentSpent: number, amount: number, hardCap: number) {
  return currentSpent + amount <= hardCap;
}

export function usageBand(spent: number, cap: number): 'ok' | 'warn70' | 'warn85' | 'warn95' | 'blocked' {
  const ratio = cap <= 0 ? 1 : spent / cap;
  if (ratio >= 1) return 'blocked';
  if (ratio >= 0.95) return 'warn95';
  if (ratio >= 0.85) return 'warn85';
  if (ratio >= 0.7) return 'warn70';
  return 'ok';
}
