// Diagnostic: reports WHICH database is connected (host + provider only, no secrets).
export default async function handler(_req: any, res: any) {
  const candidates = ['POSTGRES_URL', 'DATABASE_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING'];
  const presentEnvVars = candidates.filter((k) => !!process.env[k]);
  const raw =
    process.env.POSTGRES_URL || process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING || '';

  let host = '';
  try { host = new URL(raw).host; } catch { /* ignore */ }

  let provider = 'unknown';
  if (/supabase/i.test(host)) provider = 'Supabase';
  else if (/neon\.tech|vercel-storage|prisma/i.test(host)) provider = 'Vercel Postgres / Neon';
  else if (host) provider = 'other Postgres';

  // env var NAMES only (no values) — helps identify which integration set them
  const pgEnvKeys = Object.keys(process.env).filter((k) => /postgres|database|neon|supabase|^pg/i.test(k)).sort();

  res.status(200).json({ provider, host, presentEnvVars, pgEnvKeys });
}
