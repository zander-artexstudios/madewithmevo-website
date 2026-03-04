const REQUIRED_PUBLIC_ENV = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;

function getMissingPublicEnv() {
  return REQUIRED_PUBLIC_ENV.filter((key) => !process.env[key]?.trim());
}

export function assertPublicSupabaseEnvAtStartup() {
  const missing = getMissingPublicEnv();
  if (!missing.length) return;

  const message = `[MEVO_BOOT_FAIL] Missing required public env var(s): ${missing.join(', ')}. Set them in Vercel → Project Settings → Environment Variables, then redeploy.`;
  const isProduction = process.env.NODE_ENV === 'production';
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

  if (isProduction && !isBuildPhase) {
    throw new Error(message);
  }

  console.warn(message);
}

export function getPublicSupabaseEnv() {
  const missing = getMissingPublicEnv();
  if (missing.length) {
    throw new Error(
      `[MEVO_ENV_ERROR] Missing ${missing.join(', ')}. Add both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel env settings.`
    );
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  };
}
