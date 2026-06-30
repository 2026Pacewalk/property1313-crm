-- ============================================
-- Property1313 CRM Database Schema  (v2 — TEXT ids)
-- Run this whole file in: Supabase Dashboard → SQL Editor → New query → Run
--
-- WHY v2: the app generates string ids (e.g. 'l1781...', 'u2', 'p1') and uses
-- string user refs like 'u1'. The original UUID columns + UUID foreign keys
-- rejected those, so nothing persisted. This version uses TEXT ids (with an
-- auto-generated fallback) and no blocking FK/UUID constraints.
--
-- SAFE TO RUN: it drops and recreates the CRM tables. They currently hold no
-- successfully-saved data (writes were failing), so nothing real is lost.
-- ============================================

-- Clean slate (old tables had incompatible UUID types)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS loan_inquiries CASCADE;
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS followups CASCADE;
DROP TABLE IF EXISTS master_values CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 1. USERS
-- ============================================
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  alternate_mobile TEXT,
  role TEXT NOT NULL DEFAULT 'sales_person',
  avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  account_status TEXT DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  display_name TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  whatsapp_mobile TEXT,
  manager_id TEXT,
  login_methods JSONB DEFAULT '{"password":true,"whatsappOtp":true}',
  force_password_change BOOLEAN DEFAULT false,
  invited_at TIMESTAMPTZ,
  invited_by TEXT
);

-- ============================================
-- 2. LEADS
-- ============================================
CREATE TABLE leads (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_mobile TEXT,
  email TEXT,
  status TEXT DEFAULT 'new',
  source TEXT DEFAULT 'Website',
  inquiry_source TEXT,
  project_interest TEXT,
  target_city TEXT,
  looking_for TEXT,
  type_details TEXT,
  preferred_location TEXT,
  intended_purpose TEXT,
  customer_budget TEXT,
  budget NUMERIC,
  notes TEXT,
  assigned_to TEXT,
  assign_telecaller TEXT,
  assign_sales_expert TEXT,
  assign_manager TEXT,
  project_team_members TEXT[],
  next_call_date DATE,
  next_call_time TEXT,
  initial_remark TEXT,
  lead_score TEXT DEFAULT 'warm',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PROJECTS
-- ============================================
CREATE TABLE projects (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  property_type TEXT[],
  min_price NUMERIC DEFAULT 0,
  max_price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  cover_image TEXT,
  gallery_images TEXT[],
  total_units INTEGER,
  possession TEXT,
  rera_id TEXT,
  land_area TEXT,
  floors TEXT,
  amenities TEXT[],
  view_count INTEGER DEFAULT 0,
  lead_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  share_link TEXT,
  slug TEXT,
  youtube_url TEXT,
  instagram_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. FOLLOWUPS
-- ============================================
CREATE TABLE followups (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  lead_id TEXT,
  lead_name TEXT,
  user_id TEXT,
  user_name TEXT,
  type TEXT DEFAULT 'Reminder',
  status TEXT DEFAULT 'pending',
  scheduled_date DATE,
  scheduled_time TEXT,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  outcome TEXT,
  reminder_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. VISITS
-- ============================================
CREATE TABLE visits (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  lead_id TEXT,
  lead_name TEXT,
  project_id TEXT,
  project_name TEXT,
  user_id TEXT,
  user_name TEXT,
  visit_date DATE,
  visit_time TEXT,
  status TEXT DEFAULT 'scheduled',
  feedback TEXT,
  rating INTEGER,
  outcome TEXT,
  revisit_required BOOLEAN DEFAULT false,
  revisit_date DATE,
  revisit_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. LOAN INQUIRIES
-- ============================================
CREATE TABLE loan_inquiries (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  applicant_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  loan_amount NUMERIC,
  loan_type TEXT DEFAULT 'Home Loan',
  bank_name TEXT,
  status TEXT DEFAULT 'new',
  documents JSONB DEFAULT '[]',
  notes TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  user_id TEXT,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  deleted BOOLEAN DEFAULT false,
  action_url TEXT,
  related_entity_id TEXT,
  related_entity_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. AUDIT LOGS
-- ============================================
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  user_id TEXT,
  user_name TEXT,
  target_user_id TEXT,
  target_user_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  old_value TEXT,
  new_value TEXT,
  ip_address TEXT,
  performed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. MASTER VALUES
-- ============================================
CREATE TABLE master_values (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  master_type_id TEXT NOT NULL,
  parent_id TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  is_system_default BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY — allow all (app uses the anon key)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on followups" ON followups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on visits" ON visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on loan_inquiries" ON loan_inquiries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on master_values" ON master_values FOR ALL USING (true) WITH CHECK (true);

-- Done. Leads, projects, follow-ups, visits, loan inquiries and notifications
-- will now persist to the cloud and sync across devices/users.
