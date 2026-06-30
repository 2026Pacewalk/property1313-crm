import { createPool, type VercelPool } from '@vercel/postgres';

// Vercel Postgres injects POSTGRES_URL; the Neon marketplace integration uses DATABASE_URL.
const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  '';

let pool: VercelPool | null = null;
export function db(): VercelPool {
  if (!pool) pool = createPool({ connectionString });
  return pool;
}

export const hasDb = () => !!connectionString;

// Tables the API is allowed to touch (whitelist guards against arbitrary table access)
export const TABLES = new Set([
  'leads', 'projects', 'followups', 'visits', 'loan_inquiries',
  'notifications', 'users', 'audit_logs', 'master_values',
]);

// Valid SQL identifier (column name) — blocks injection via object keys
export const COL_RE = /^[a-z_][a-z0-9_]*$/;

export function resolveTable(resource: string): string | null {
  const table = String(resource || '').replace(/-/g, '_');
  return TABLES.has(table) ? table : null;
}
