-- ============================================
-- COMPLETE DATABASE FIX - Run ALL of this in Supabase SQL Editor
-- This adds all missing tables and columns that the frontend expects
-- ============================================

-- ============================================
-- 1. FIX LEADS TABLE - Add missing columns
-- ============================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS inquiry_source TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS project_interest TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS type_details TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_location TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS intended_purpose TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS customer_budget TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assign_telecaller UUID REFERENCES users(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assign_sales_expert UUID REFERENCES users(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assign_manager UUID REFERENCES users(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS project_team_members UUID[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_call_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_call_time TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS initial_remark TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- 2. FIX USERS TABLE - Add missing columns
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS alternate_mobile TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_mobile TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_methods JSONB DEFAULT '{"password":true,"whatsappOtp":true}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES users(id);

-- ============================================
-- 3. FIX PROJECTS TABLE - Add missing columns
-- ============================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS property_type TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS min_price NUMERIC DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS max_price NUMERIC DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery_images TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS total_units INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS possession TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS rera_id TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS land_area TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS floors TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS amenities TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS lead_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS conversion_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS share_link TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- ============================================
-- 4. FIX FOLLOWUPS TABLE - Add missing columns
-- ============================================
ALTER TABLE followups ADD COLUMN IF NOT EXISTS lead_name TEXT;
ALTER TABLE followups ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
ALTER TABLE followups ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE followups ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Call';
ALTER TABLE followups ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE followups ADD COLUMN IF NOT EXISTS outcome TEXT;
ALTER TABLE followups ADD COLUMN IF NOT EXISTS reminder_minutes INTEGER DEFAULT 60;

-- ============================================
-- 5. FIX VISITS TABLE - Add missing columns
-- ============================================
ALTER TABLE visits ADD COLUMN IF NOT EXISTS lead_name TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS project_name TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_time TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS outcome TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS revisit_required BOOLEAN DEFAULT false;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS revisit_date DATE;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS revisit_reason TEXT;

-- ============================================
-- 6. CREATE LOAN_INQUIRIES TABLE (if missing)
-- ============================================
CREATE TABLE IF NOT EXISTS loan_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  loan_amount NUMERIC,
  loan_type TEXT DEFAULT 'Home Loan',
  bank_name TEXT,
  status TEXT DEFAULT 'new',
  documents JSONB DEFAULT '[]',
  notes TEXT,
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. CREATE NOTIFICATIONS TABLE (if missing)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  type TEXT NOT NULL,
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
-- 8. CREATE AUDIT_LOGS TABLE (if missing)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
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
-- 9. CREATE MASTER_VALUES TABLE (if missing)
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
-- RLS on all tables
-- ============================================
ALTER TABLE loan_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow all on loan_inquiries" ON loan_inquiries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on master_values" ON master_values FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- SEED DEFAULT USERS (if not present)
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
  ('p1', 'Sunset Residences', 'Premium luxury apartments.', 'Zirakpur, Punjab', ARRAY['2 BHK','3 BHK','4 BHK'], 4500000, 15000000, 'active', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80'], 240, 'Dec 2026', 'PBRERAPRJ521000', '5 Acres', 'G+15', ARRAY['Swimming Pool','Gym','Club House','24/7 Security'], 'sunset-residences', 'https://p1313.xyz/project/sunset-residences'),
  ('p2', 'Green Valley', 'Eco-friendly residential complex.', 'Mohali, Punjab', ARRAY['1 BHK','2 BHK','3 BHK'], 3500000, 9000000, 'active', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80'], 180, 'Mar 2027', 'PBRERAPRJ123456', '3.5 Acres', 'G+12', ARRAY['Swimming Pool','Gym','Jogging Track','24/7 Security','Garden'], 'green-valley', 'https://p1313.xyz/project/green-valley')
ON CONFLICT (slug) DO NOTHING;
