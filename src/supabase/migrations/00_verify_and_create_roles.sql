-- =====================================================
-- QUICK VERIFICATION AND ROLES TABLE CREATION
-- =====================================================
-- Run this script first to create the roles system
-- =====================================================

-- Step 1: Check if tables already exist
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'roles') THEN
    RAISE NOTICE '✅ roles table already exists';
  ELSE
    RAISE NOTICE '⚠️  roles table does not exist - will create';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'role_subcategories') THEN
    RAISE NOTICE '✅ role_subcategories table already exists';
  ELSE
    RAISE NOTICE '⚠️  role_subcategories table does not exist - will create';
  END IF;
END $$;

-- Step 2: Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create role_subcategories mapping table
CREATE TABLE IF NOT EXISTS role_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  subcategory_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, category_id, subcategory_id)
);

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_roles_active ON roles(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_display_order ON roles(display_order);
CREATE INDEX IF NOT EXISTS idx_role_subcategories_role ON role_subcategories(role_id);
CREATE INDEX IF NOT EXISTS idx_role_subcategories_category ON role_subcategories(category_id, subcategory_id);

-- Step 5: Add columns to professionals table if they don't exist
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE SET NULL;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS subcategory_ids TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_professionals_role ON professionals(role_id);
CREATE INDEX IF NOT EXISTS idx_professionals_subcategory_ids ON professionals USING GIN(subcategory_ids);

-- Step 6: Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_subcategories ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop existing policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view active roles" ON roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON roles;
DROP POLICY IF EXISTS "Anyone can view role subcategories" ON role_subcategories;
DROP POLICY IF EXISTS "Admins can manage role subcategories" ON role_subcategories;

-- Step 8: Create RLS policies for roles
CREATE POLICY "Anyone can view active roles"
  ON roles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage roles"
  ON roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.client_token = current_setting('request.headers', true)::json->>'x-client-token'
      AND profiles.is_admin = true
    )
  );

-- Step 9: Create RLS policies for role_subcategories
CREATE POLICY "Anyone can view role subcategories"
  ON role_subcategories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage role subcategories"
  ON role_subcategories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.client_token = current_setting('request.headers', true)::json->>'x-client-token'
      AND profiles.is_admin = true
    )
  );

-- Step 10: Insert 25 default roles
INSERT INTO roles (name, description, display_order, is_active) VALUES
  ('Electrician', 'Electrical repairs and installations', 1, true),
  ('Plumber', 'Plumbing repairs and maintenance', 2, true),
  ('Driver', 'Transportation and ride services', 3, true),
  ('Delivery Partner', 'Package and document delivery', 4, true),
  ('Cleaner', 'House and office cleaning services', 5, true),
  ('Cook / Chef', 'Cooking and meal preparation', 6, true),
  ('Teacher / Tutor', 'Teaching and tutoring services', 7, true),
  ('Photographer', 'Photography and videography', 8, true),
  ('CA / Accountant', 'Accounting and tax services', 9, true),
  ('Lawyer', 'Legal consultation and services', 10, true),
  ('Doctor / Healthcare', 'Medical and healthcare services', 11, true),
  ('Nurse / Caretaker', 'Patient care and nursing', 12, true),
  ('Technician (IT)', 'IT and computer services', 13, true),
  ('Beautician', 'Beauty and grooming services', 14, true),
  ('Mechanic', 'Vehicle repair and maintenance', 15, true),
  ('Event Planner', 'Event planning and coordination', 16, true),
  ('Pet Caretaker', 'Pet care and grooming', 17, true),
  ('Consultant', 'Business and professional consulting', 18, true),
  ('Freelancer', 'Freelance professional services', 19, true),
  ('Moving & Packing Helper', 'Moving and packing services', 20, true),
  ('Laundry Service', 'Laundry and dry cleaning', 21, true),
  ('Home Service Professional', 'Home maintenance services', 22, true),
  ('Document Helper', 'Document assistance services', 23, true),
  ('Partner / Companion', 'Companion and partner services', 24, true),
  ('Other', 'Other professional services', 99, true)
ON CONFLICT (name) DO NOTHING;

-- Step 11: Insert role-subcategory mappings
-- Electrician
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'repair', 'fan-repair' FROM roles r WHERE r.name = 'Electrician'
ON CONFLICT DO NOTHING;

INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'repair', 'switch-repair' FROM roles r WHERE r.name = 'Electrician'
ON CONFLICT DO NOTHING;

INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'repair', 'electrical-wiring' FROM roles r WHERE r.name = 'Electrician'
ON CONFLICT DO NOTHING;

-- Plumber
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'repair', 'plumbing-repair' FROM roles r WHERE r.name = 'Plumber'
ON CONFLICT DO NOTHING;

INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'repair', 'tap-repair' FROM roles r WHERE r.name = 'Plumber'
ON CONFLICT DO NOTHING;

INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'repair', 'drain-blockage' FROM roles r WHERE r.name = 'Plumber'
ON CONFLICT DO NOTHING;

-- Driver
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'ride-transport', s FROM roles r, unnest(ARRAY['bike-ride', 'car-ride', 'office-drop', 'office-pickup', 'airport-drop', 'airport-pickup', 'station-drop', 'station-pickup']) s
WHERE r.name = 'Driver'
ON CONFLICT DO NOTHING;

-- Delivery Partner
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'delivery', s FROM roles r, unnest(ARRAY['parcel-delivery', 'document-delivery', 'medicine-delivery', 'same-day', 'express-delivery']) s
WHERE r.name = 'Delivery Partner'
ON CONFLICT DO NOTHING;

-- Cleaner
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'cleaning', s FROM roles r, unnest(ARRAY['house-cleaning', 'room-cleaning', 'kitchen-cleaning', 'bathroom-cleaning', 'deep-cleaning', 'office-cleaning']) s
WHERE r.name = 'Cleaner'
ON CONFLICT DO NOTHING;

-- Cook / Chef
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'cooking', s FROM roles r, unnest(ARRAY['daily-cooking', 'party-chef', 'meal-prep', 'vegetarian', 'nonveg']) s
WHERE r.name = 'Cook / Chef'
ON CONFLICT DO NOTHING;

-- Teacher / Tutor
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'teaching-learning', s FROM roles r, unnest(ARRAY['math', 'science', 'physics', 'coding', 'spoken-english']) s
WHERE r.name = 'Teacher / Tutor'
ON CONFLICT DO NOTHING;

-- Photographer
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'photography-videography', s FROM roles r, unnest(ARRAY['event-photo', 'wedding-photo', 'portrait', 'event-video', 'wedding-video']) s
WHERE r.name = 'Photographer'
ON CONFLICT DO NOTHING;

-- CA / Accountant
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'accounting-tax', s FROM roles r, unnest(ARRAY['income-tax', 'gst', 'bookkeeping', 'tax-consult']) s
WHERE r.name = 'CA / Accountant'
ON CONFLICT DO NOTHING;

-- Lawyer
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'professional-help', 'legal' FROM roles r WHERE r.name = 'Lawyer'
ON CONFLICT DO NOTHING;

-- Doctor / Healthcare
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'medical-help', s FROM roles r, unnest(ARRAY['nurse', 'patient-care', 'physiotherapy']) s
WHERE r.name = 'Doctor / Healthcare'
ON CONFLICT DO NOTHING;

-- Nurse / Caretaker
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'medical-help', s FROM roles r, unnest(ARRAY['nurse', 'patient-care', 'home-nurse', 'post-surgery']) s
WHERE r.name = 'Nurse / Caretaker'
ON CONFLICT DO NOTHING;

-- Technician (IT)
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'tech-help', s FROM roles r, unnest(ARRAY['laptop', 'computer', 'wifi', 'software']) s
WHERE r.name = 'Technician (IT)'
ON CONFLICT DO NOTHING;

INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'repair', s FROM roles r, unnest(ARRAY['laptop-repair', 'mobile-repair']) s
WHERE r.name = 'Technician (IT)'
ON CONFLICT DO NOTHING;

-- Beautician
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'beauty-wellness', s FROM roles r, unnest(ARRAY['haircut', 'styling', 'bridal', 'party-makeup', 'facial']) s
WHERE r.name = 'Beautician'
ON CONFLICT DO NOTHING;

-- Mechanic
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'vehicle-help', s FROM roles r, unnest(ARRAY['bike-repair', 'car-repair', 'flat-tyre']) s
WHERE r.name = 'Mechanic'
ON CONFLICT DO NOTHING;

-- Event Planner
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'event-help', s FROM roles r, unnest(ARRAY['party', 'wedding', 'decoration', 'coordination']) s
WHERE r.name = 'Event Planner'
ON CONFLICT DO NOTHING;

-- Pet Caretaker
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'pet-care', s FROM roles r, unnest(ARRAY['walking', 'sitting', 'feeding', 'grooming']) s
WHERE r.name = 'Pet Caretaker'
ON CONFLICT DO NOTHING;

-- Consultant
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'professional-help', s FROM roles r, unnest(ARRAY['startup', 'business', 'career', 'marketing']) s
WHERE r.name = 'Consultant'
ON CONFLICT DO NOTHING;

-- Freelancer
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'mentorship', s FROM roles r, unnest(ARRAY['software-dev', 'ui-ux', 'digital-marketing']) s
WHERE r.name = 'Freelancer'
ON CONFLICT DO NOTHING;

INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'professional-help', 'freelance' FROM roles r WHERE r.name = 'Freelancer'
ON CONFLICT DO NOTHING;

-- Moving & Packing Helper
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'moving-packing', s FROM roles r, unnest(ARRAY['house-shifting', 'furniture-moving', 'packing', 'loading']) s
WHERE r.name = 'Moving & Packing Helper'
ON CONFLICT DO NOTHING;

-- Laundry Service
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'laundry', s FROM roles r, unnest(ARRAY['washing', 'ironing', 'dry-cleaning']) s
WHERE r.name = 'Laundry Service'
ON CONFLICT DO NOTHING;

-- Home Service Professional
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'home-services', s FROM roles r, unnest(ARRAY['painting', 'electrical', 'furniture-assembly']) s
WHERE r.name = 'Home Service Professional'
ON CONFLICT DO NOTHING;

-- Document Helper
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'document-help', s FROM roles r, unnest(ARRAY['aadhaar', 'pan', 'passport']) s
WHERE r.name = 'Document Helper'
ON CONFLICT DO NOTHING;

-- Partner / Companion
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'partner-needed', s FROM roles r, unnest(ARRAY['gym', 'running', 'study']) s
WHERE r.name = 'Partner / Companion'
ON CONFLICT DO NOTHING;

-- Step 12: Final verification
DO $$ 
DECLARE
  roles_count INTEGER;
  mappings_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO roles_count FROM roles;
  SELECT COUNT(*) INTO mappings_count FROM role_subcategories;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ROLES SYSTEM CREATED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total roles: %', roles_count;
  RAISE NOTICE 'Total mappings: %', mappings_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Next step: Refresh your Supabase schema cache';
  RAISE NOTICE 'Then run the migration script for existing professionals';
  RAISE NOTICE '========================================';
END $$;
