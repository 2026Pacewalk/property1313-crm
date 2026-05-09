-- ============================================
-- Property1313 CRM Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable RLS
ALTER TABLE IF EXISTS leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loan_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS master_values ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  alternate_mobile TEXT,
  role TEXT NOT NULL DEFAULT 'sales_person' CHECK (role IN ('super_admin','admin','manager','sales_person','telecaller','project_team')),
  avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active','disabled','invite_pending','locked','archived')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  display_name TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  whatsapp_mobile TEXT,
  manager_id UUID REFERENCES users(id),
  login_methods JSONB DEFAULT '{"password":true,"whatsappOtp":true}',
  force_password_change BOOLEAN DEFAULT false,
  invited_at TIMESTAMPTZ,
  invited_by UUID REFERENCES users(id)
);

-- ============================================
-- 2. LEADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_mobile TEXT,
  email TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','warm','hot','cold','converted','lost')),
  source TEXT DEFAULT 'Website',
  inquiry_source TEXT,
  project_interest TEXT,
  target_city TEXT,
  looking_for TEXT,
  type_details TEXT,
  preferred_location TEXT,
  intended_purpose TEXT CHECK (intended_purpose IN ('self_use','investment')),
  customer_budget TEXT,
  budget NUMERIC,
  notes TEXT,
  assigned_to UUID REFERENCES users(id),
  assign_telecaller UUID REFERENCES users(id),
  assign_sales_expert UUID REFERENCES users(id),
  assign_manager UUID REFERENCES users(id),
  project_team_members UUID[],
  next_call_date DATE,
  next_call_time TEXT,
  initial_remark TEXT,
  lead_score TEXT DEFAULT 'warm' CHECK (lead_score IN ('hot','warm','cold')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  property_type TEXT[],
  min_price NUMERIC DEFAULT 0,
  max_price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','upcoming','inactive','sold_out','on_hold','archived')),
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
  slug TEXT UNIQUE NOT NULL,
  youtube_url TEXT,
  instagram_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. FOLLOWUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  lead_name TEXT,
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  type TEXT DEFAULT 'Call' CHECK (type IN ('Call','WhatsApp','Site Visit','Meeting','Reminder','Payment','Document','General')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','overdue','rescheduled','cancelled')),
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
-- 5. VISITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  lead_name TEXT,
  project_id UUID REFERENCES projects(id),
  project_name TEXT,
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  visit_date DATE,
  visit_time TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','no_show','cancelled','rescheduled','revisit_required')),
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  outcome TEXT,
  revisit_required BOOLEAN DEFAULT false,
  revisit_date DATE,
  revisit_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. LOAN INQUIRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS loan_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  loan_amount NUMERIC,
  loan_type TEXT DEFAULT 'Home Loan',
  bank_name TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','in_progress','documents_pending','approved','rejected','closed')),
  documents JSONB DEFAULT '[]',
  notes TEXT,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('lead_assigned','followup_reminder','visit_reminder','loan_alert','automation','security','mention','system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  deleted BOOLEAN DEFAULT false,
  action_url TEXT,
  related_entity_id UUID,
  related_entity_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  target_user_id UUID,
  target_user_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  old_value TEXT,
  new_value TEXT,
  ip_address TEXT,
  performed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. MASTER VALUES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS master_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_type_id TEXT NOT NULL,
  parent_id UUID,
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
-- RLS POLICIES - Allow all authenticated operations
-- ============================================

-- Users: Allow all
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Leads: Allow all
CREATE POLICY "Allow all on leads" ON leads FOR ALL USING (true) WITH CHECK (true);

-- Projects: Allow all
CREATE POLICY "Allow all on projects" ON projects FOR ALL USING (true) WITH CHECK (true);

-- Followups: Allow all
CREATE POLICY "Allow all on followups" ON followups FOR ALL USING (true) WITH CHECK (true);

-- Visits: Allow all
CREATE POLICY "Allow all on visits" ON visits FOR ALL USING (true) WITH CHECK (true);

-- Loan Inquiries: Allow all
CREATE POLICY "Allow all on loan_inquiries" ON loan_inquiries FOR ALL USING (true) WITH CHECK (true);

-- Notifications: Allow all
CREATE POLICY "Allow all on notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- Audit Logs: Allow all
CREATE POLICY "Allow all on audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- Master Values: Allow all
CREATE POLICY "Allow all on master_values" ON master_values FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- SEED DATA - Insert default users
-- ============================================
INSERT INTO users (id, name, email, phone, role, is_active, account_status, display_name, timezone, email_verified, phone_verified, whatsapp_mobile) VALUES
  ('u1', 'Shekhar', 'hellopacewalk@gmail.com', '+91 98765 43210', 'super_admin', true, 'active', 'S', 'Asia/Kolkata', true, true, '+91 98765 43210'),
  ('u2', 'Harjot Singh', 'property1313official@gmail.com', '+91 98765 43211', 'super_admin', true, 'active', 'HS', 'Asia/Kolkata', true, true, '+91 98765 43211'),
  ('u3', 'Adamya Khosla', 'adamaya.kk@gmail.com', '+91 98765 43212', 'manager', true, 'active', 'AK', 'Asia/Kolkata', true, true, '+91 98765 43212'),
  ('u4', 'Suhail Pratap Malik', 'suhail8.spm@gmail.com', '+91 98765 43213', 'manager', true, 'active', 'SPM', 'Asia/Kolkata', true, true, '+91 98765 43213'),
  ('u5', 'Diksha Sharma', 'property1313.telecaller@gmail.com', '+91 98765 43214', 'telecaller', true, 'active', 'DS', 'Asia/Kolkata', true, true, '+91 98765 43214'),
  ('u6', 'Rakesh Kumar', 'raakesh131313@gmail.com', '+91 98765 43215', 'sales_person', true, 'active', 'RK', 'Asia/Kolkata', true, true, '+91 98765 43215')
ON CONFLICT (email) DO NOTHING;

-- Seed default projects
INSERT INTO projects (id, name, description, location, property_type, min_price, max_price, status, cover_image, gallery_images, total_units, possession, rera_id, land_area, floors, amenities, slug, share_link) VALUES
  ('p1', 'Sunset Residences', 'Premium luxury apartments with world-class amenities.', 'Zirakpur, Punjab', ARRAY['2 BHK','3 BHK','4 BHK'], 4500000, 15000000, 'active', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80'], 240, 'Dec 2026', 'PBRERAPRJ521000', '5 Acres', 'G+15', ARRAY['Swimming Pool','Gym','Club House','24/7 Security','Power Backup','Parking'], 'sunset-residences', 'https://p1313.xyz/project/sunset-residences'),
  ('p2', 'Green Valley', 'Eco-friendly residential complex surrounded by greenery.', 'Mohali, Punjab', ARRAY['1 BHK','2 BHK','3 BHK'], 3500000, 9000000, 'active', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&q=80'], 180, 'Mar 2027', 'PBRERAPRJ123456', '3.5 Acres', 'G+12', ARRAY['Swimming Pool','Gym','Jogging Track','24/7 Security','Garden'], 'green-valley', 'https://p1313.xyz/project/green-valley')
ON CONFLICT (slug) DO NOTHING;
