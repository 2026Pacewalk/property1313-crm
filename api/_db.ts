// Lazy DB accessor — @vercel/postgres is imported dynamically so any load error
// surfaces inside the route handler's try/catch (as JSON) instead of crashing cold start.

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  '';

let pool: any = null;

export async function db(): Promise<any> {
  if (!pool) {
    const { createPool } = await import('@vercel/postgres');
    pool = createPool({ connectionString });
  }
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

export function resolveTable(resource: string | undefined): string | null {
  const table = String(resource || '').replace(/-/g, '_');
  return TABLES.has(table) ? table : null;
}
