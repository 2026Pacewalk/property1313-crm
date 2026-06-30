import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, hasDb, resolveTable, COL_RE } from './_db';

/**
 * Generic CRUD for the CRM tables.
 *   GET    /api/leads            -> list rows (newest first)
 *   POST   /api/leads            -> insert (body = snake_case column map)
 *   PATCH  /api/leads?id=l123    -> update by id
 *   DELETE /api/leads?id=l123    -> delete by id
 * Table names are whitelisted; column names are regex-validated; values are
 * always parameterised — so user input can't be used for SQL injection.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!hasDb()) return res.status(503).json({ error: 'Database not configured' });

  const table = resolveTable(Array.isArray(req.query.resource) ? req.query.resource[0] : req.query.resource);
  if (!table) return res.status(404).json({ error: 'Unknown resource' });

  try {
    const sql = await db();
    if (req.method === 'GET') {
      const { rows } = await sql.query(`SELECT * FROM ${table} ORDER BY created_at DESC NULLS LAST`);
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const body = (req.body && typeof req.body === 'object') ? req.body : {};
      const keys = Object.keys(body).filter((k) => COL_RE.test(k) && body[k] !== undefined);
      if (keys.length === 0) return res.status(400).json({ error: 'Empty body' });
      const cols = keys.join(', ');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const values = keys.map((k) => normalize(body[k]));
      const { rows } = await sql.query(`INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`, values);
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'PATCH') {
      const id = String((req.query.id as string) || req.body?.id || '');
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const body = (req.body && typeof req.body === 'object') ? req.body : {};
      const keys = Object.keys(body).filter((k) => k !== 'id' && COL_RE.test(k) && body[k] !== undefined);
      if (keys.length === 0) return res.status(400).json({ error: 'Nothing to update' });
      const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const values = keys.map((k) => normalize(body[k]));
      values.push(id);
      const { rows } = await sql.query(`UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`, values);
      return res.status(200).json(rows[0] || null);
    }

    if (req.method === 'DELETE') {
      const id = String((req.query.id as string) || '');
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await sql.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Database error' });
  }
}

// Arrays/objects -> JSON-compatible values node-postgres can bind (TEXT[] handled natively for string[])
function normalize(v: any) {
  if (Array.isArray(v)) return v; // text[] / arrays bind directly
  if (v && typeof v === 'object') return JSON.stringify(v); // JSONB columns
  return v;
}
