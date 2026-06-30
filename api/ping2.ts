// Diagnostic: does @vercel/postgres import, and does ./_db import?
export default async function handler(_req: any, res: any) {
  const out: any = { ok: true };
  try {
    const pg = await import('@vercel/postgres');
    out.pg = typeof pg.createPool;
  } catch (e: any) {
    out.pgError = String(e?.message || e);
  }
  try {
    const m = await import('./_db');
    out.db = typeof (m as any).hasDb;
  } catch (e: any) {
    out.dbError = String(e?.message || e);
  }
  res.status(200).json(out);
}
