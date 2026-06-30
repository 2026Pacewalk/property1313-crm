import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, hasDb } from './_db';

/**
 * One-time (idempotent) database setup. Visit /api/init-db once after the
 * Postgres store is connected to create all tables. Safe to run repeatedly.
 */
const STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    name TEXT NOT NULL, email TEXT, phone TEXT, alternate_mobile TEXT,
    role TEXT DEFAULT 'sales_person', avatar TEXT, is_active BOOLEAN DEFAULT true,
    account_status TEXT DEFAULT 'active', last_login_at TIMESTAMPTZ,
    display_name TEXT, timezone TEXT DEFAULT 'Asia/Kolkata',
    email_verified BOOLEAN DEFAULT false, phone_verified BOOLEAN DEFAULT false,
    whatsapp_mobile TEXT, manager_id TEXT, login_methods JSONB,
    force_password_change BOOLEAN DEFAULT false, invited_at TIMESTAMPTZ, invited_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,

  `CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    name TEXT NOT NULL, phone TEXT, alternate_mobile TEXT, email TEXT,
    status TEXT DEFAULT 'new', source TEXT DEFAULT 'Website', inquiry_source TEXT,
    project_interest TEXT, target_city TEXT, looking_for TEXT, type_details TEXT,
    preferred_location TEXT, intended_purpose TEXT, customer_budget TEXT, budget NUMERIC,
    notes TEXT, assigned_to TEXT, assign_telecaller TEXT, assign_sales_expert TEXT,
    assign_manager TEXT, project_team_members TEXT[], next_call_date DATE, next_call_time TEXT,
    initial_remark TEXT, lead_score TEXT DEFAULT 'warm',
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW())`,

  `CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    name TEXT NOT NULL, description TEXT, location TEXT, property_type TEXT[],
    min_price NUMERIC DEFAULT 0, max_price NUMERIC DEFAULT 0, status TEXT DEFAULT 'active',
    cover_image TEXT, gallery_images TEXT[], total_units INTEGER, possession TEXT,
    rera_id TEXT, land_area TEXT, floors TEXT, amenities TEXT[],
    view_count INTEGER DEFAULT 0, lead_count INTEGER DEFAULT 0, conversion_count INTEGER DEFAULT 0,
    share_link TEXT, slug TEXT, youtube_url TEXT, instagram_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,

  `CREATE TABLE IF NOT EXISTS followups (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    lead_id TEXT, lead_name TEXT, user_id TEXT, user_name TEXT,
    type TEXT DEFAULT 'Reminder', status TEXT DEFAULT 'pending',
    scheduled_date DATE, scheduled_time TEXT, completed_at TIMESTAMPTZ,
    notes TEXT, outcome TEXT, reminder_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,

  `CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    lead_id TEXT, lead_name TEXT, project_id TEXT, project_name TEXT,
    user_id TEXT, user_name TEXT, visit_date DATE, visit_time TEXT,
    status TEXT DEFAULT 'scheduled', feedback TEXT, rating INTEGER, outcome TEXT,
    revisit_required BOOLEAN DEFAULT false, revisit_date DATE, revisit_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,

  `CREATE TABLE IF NOT EXISTS loan_inquiries (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    applicant_name TEXT, phone TEXT, email TEXT, loan_amount NUMERIC,
    loan_type TEXT DEFAULT 'Home Loan', bank_name TEXT, status TEXT DEFAULT 'new',
    documents JSONB DEFAULT '[]', notes TEXT, assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,

  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    user_id TEXT, type TEXT DEFAULT 'system', title TEXT, message TEXT,
    read BOOLEAN DEFAULT false, deleted BOOLEAN DEFAULT false, action_url TEXT,
    related_entity_id TEXT, related_entity_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW())`,

  `CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    user_id TEXT, user_name TEXT, target_user_id TEXT, target_user_name TEXT,
    action TEXT, entity_type TEXT, entity_id TEXT, details TEXT,
    old_value TEXT, new_value TEXT, ip_address TEXT, performed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW())`,

  `CREATE TABLE IF NOT EXISTS master_values (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    master_type_id TEXT, parent_id TEXT, name TEXT, slug TEXT, description TEXT,
    color TEXT, icon TEXT, sort_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false, is_system_default BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0, created_by TEXT, updated_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
];

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  if (!hasDb()) return res.status(503).json({ error: 'Database not configured. Add a Postgres store in Vercel → Storage.' });
  try {
    const sql = await db();
    for (const stmt of STATEMENTS) {
      await sql.query(stmt);
    }
    const { rows } = await sql.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );
    return res.status(200).json({ ok: true, tables: rows.map((r: any) => r.table_name) });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'init failed' });
  }
}
