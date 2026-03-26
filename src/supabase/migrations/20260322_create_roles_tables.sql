-- =====================================================
-- ROLES SYSTEM FOR PROFESSIONALS MODULE
-- =====================================================
-- This adds a role-based UI layer on top of existing categories
-- without modifying the existing category/subcategory system

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_subcategories mapping table
CREATE TABLE IF NOT EXISTS role_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  subcategory_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, category_id, subcategory_id)
);

-- Add role_id to professionals table (optional - for quick lookups)
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);

-- Add subcategory_ids array for multi-subcategory support
ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS subcategory_ids TEXT[];

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_role_subcategories_role_id ON role_subcategories(role_id);
CREATE INDEX IF NOT EXISTS idx_role_subcategories_subcategory ON role_subcategories(category_id, subcategory_id);
CREATE INDEX IF NOT EXISTS idx_professionals_role_id ON professionals(role_id);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_subcategories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles (public read, admin write)
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

-- RLS Policies for role_subcategories (public read, admin write)
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

-- Insert default roles
INSERT INTO roles (name, display_order, is_active) VALUES
  ('Electrician', 1, true),
  ('Plumber', 2, true),
  ('Driver', 3, true),
  ('Delivery Partner', 4, true),
  ('Cleaner', 5, true),
  ('Cook / Chef', 6, true),
  ('Teacher / Tutor', 7, true),
  ('Photographer', 8, true),
  ('CA / Accountant', 9, true),
  ('Lawyer', 10, true),
  ('Doctor / Healthcare', 11, true),
  ('Nurse / Caretaker', 12, true),
  ('Technician (IT)', 13, true),
  ('Beautician', 14, true),
  ('Mechanic', 15, true),
  ('Event Planner', 16, true),
  ('Pet Caretaker', 17, true),
  ('Consultant', 18, true),
  ('Freelancer', 19, true),
  ('Moving & Packing Helper', 20, true),
  ('Laundry Service', 21, true),
  ('Home Service Professional', 22, true),
  ('Document Helper', 23, true),
  ('Partner / Companion', 24, true),
  ('Other', 99, true)
ON CONFLICT (name) DO NOTHING;

-- Map roles to subcategories
-- Electrician
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'repair', 'fan-repair' FROM roles r WHERE r.name = 'Electrician'
UNION ALL
SELECT r.id, 'repair', 'switch-repair' FROM roles r WHERE r.name = 'Electrician'
UNION ALL
SELECT r.id, 'repair', 'electrical-wiring' FROM roles r WHERE r.name = 'Electrician'
ON CONFLICT DO NOTHING;

-- Plumber
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'repair', 'plumbing-repair' FROM roles r WHERE r.name = 'Plumber'
UNION ALL
SELECT r.id, 'repair', 'tap-repair' FROM roles r WHERE r.name = 'Plumber'
UNION ALL
SELECT r.id, 'repair', 'drain-blockage' FROM roles r WHERE r.name = 'Plumber'
ON CONFLICT DO NOTHING;

-- Driver
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'ride-transport', 'bike-ride' FROM roles r WHERE r.name = 'Driver'
UNION ALL
SELECT r.id, 'ride-transport', 'car-ride' FROM roles r WHERE r.name = 'Driver'
UNION ALL
SELECT r.id, 'ride-transport', 'office-drop' FROM roles r WHERE r.name = 'Driver'
UNION ALL
SELECT r.id, 'ride-transport', 'office-pickup' FROM roles r WHERE r.name = 'Driver'
UNION ALL
SELECT r.id, 'ride-transport', 'airport-drop' FROM roles r WHERE r.name = 'Driver'
UNION ALL
SELECT r.id, 'ride-transport', 'airport-pickup' FROM roles r WHERE r.name = 'Driver'
UNION ALL
SELECT r.id, 'ride-transport', 'station-drop' FROM roles r WHERE r.name = 'Driver'
UNION ALL
SELECT r.id, 'ride-transport', 'station-pickup' FROM roles r WHERE r.name = 'Driver'
ON CONFLICT DO NOTHING;

-- Delivery Partner
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'delivery', 'parcel-delivery' FROM roles r WHERE r.name = 'Delivery Partner'
UNION ALL
SELECT r.id, 'delivery', 'document-delivery' FROM roles r WHERE r.name = 'Delivery Partner'
UNION ALL
SELECT r.id, 'delivery', 'medicine-delivery' FROM roles r WHERE r.name = 'Delivery Partner'
UNION ALL
SELECT r.id, 'delivery', 'same-day' FROM roles r WHERE r.name = 'Delivery Partner'
UNION ALL
SELECT r.id, 'delivery', 'express-delivery' FROM roles r WHERE r.name = 'Delivery Partner'
ON CONFLICT DO NOTHING;

-- Cleaner
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'cleaning', 'house-cleaning' FROM roles r WHERE r.name = 'Cleaner'
UNION ALL
SELECT r.id, 'cleaning', 'room-cleaning' FROM roles r WHERE r.name = 'Cleaner'
UNION ALL
SELECT r.id, 'cleaning', 'kitchen-cleaning' FROM roles r WHERE r.name = 'Cleaner'
UNION ALL
SELECT r.id, 'cleaning', 'bathroom-cleaning' FROM roles r WHERE r.name = 'Cleaner'
UNION ALL
SELECT r.id, 'cleaning', 'deep-cleaning' FROM roles r WHERE r.name = 'Cleaner'
UNION ALL
SELECT r.id, 'cleaning', 'office-cleaning' FROM roles r WHERE r.name = 'Cleaner'
ON CONFLICT DO NOTHING;

-- Cook / Chef
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'cooking', 'daily-cooking' FROM roles r WHERE r.name = 'Cook / Chef'
UNION ALL
SELECT r.id, 'cooking', 'party-chef' FROM roles r WHERE r.name = 'Cook / Chef'
UNION ALL
SELECT r.id, 'cooking', 'meal-prep' FROM roles r WHERE r.name = 'Cook / Chef'
UNION ALL
SELECT r.id, 'cooking', 'vegetarian' FROM roles r WHERE r.name = 'Cook / Chef'
UNION ALL
SELECT r.id, 'cooking', 'nonveg' FROM roles r WHERE r.name = 'Cook / Chef'
ON CONFLICT DO NOTHING;

-- Teacher / Tutor
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'teaching-learning', 'math' FROM roles r WHERE r.name = 'Teacher / Tutor'
UNION ALL
SELECT r.id, 'teaching-learning', 'science' FROM roles r WHERE r.name = 'Teacher / Tutor'
UNION ALL
SELECT r.id, 'teaching-learning', 'physics' FROM roles r WHERE r.name = 'Teacher / Tutor'
UNION ALL
SELECT r.id, 'teaching-learning', 'coding' FROM roles r WHERE r.name = 'Teacher / Tutor'
UNION ALL
SELECT r.id, 'teaching-learning', 'spoken-english' FROM roles r WHERE r.name = 'Teacher / Tutor'
ON CONFLICT DO NOTHING;

-- Photographer
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'photography-videography', 'event-photo' FROM roles r WHERE r.name = 'Photographer'
UNION ALL
SELECT r.id, 'photography-videography', 'wedding-photo' FROM roles r WHERE r.name = 'Photographer'
UNION ALL
SELECT r.id, 'photography-videography', 'portrait' FROM roles r WHERE r.name = 'Photographer'
UNION ALL
SELECT r.id, 'photography-videography', 'event-video' FROM roles r WHERE r.name = 'Photographer'
UNION ALL
SELECT r.id, 'photography-videography', 'wedding-video' FROM roles r WHERE r.name = 'Photographer'
ON CONFLICT DO NOTHING;

-- CA / Accountant
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'accounting-tax', 'income-tax' FROM roles r WHERE r.name = 'CA / Accountant'
UNION ALL
SELECT r.id, 'accounting-tax', 'gst' FROM roles r WHERE r.name = 'CA / Accountant'
UNION ALL
SELECT r.id, 'accounting-tax', 'bookkeeping' FROM roles r WHERE r.name = 'CA / Accountant'
UNION ALL
SELECT r.id, 'accounting-tax', 'tax-consult' FROM roles r WHERE r.name = 'CA / Accountant'
ON CONFLICT DO NOTHING;

-- Lawyer
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'professional-help', 'legal' FROM roles r WHERE r.name = 'Lawyer'
ON CONFLICT DO NOTHING;

-- Doctor / Healthcare
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'medical-help', 'nurse' FROM roles r WHERE r.name = 'Doctor / Healthcare'
UNION ALL
SELECT r.id, 'medical-help', 'patient-care' FROM roles r WHERE r.name = 'Doctor / Healthcare'
UNION ALL
SELECT r.id, 'medical-help', 'physiotherapy' FROM roles r WHERE r.name = 'Doctor / Healthcare'
ON CONFLICT DO NOTHING;

-- Nurse / Caretaker
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'medical-help', 'nurse' FROM roles r WHERE r.name = 'Nurse / Caretaker'
UNION ALL
SELECT r.id, 'medical-help', 'patient-care' FROM roles r WHERE r.name = 'Nurse / Caretaker'
UNION ALL
SELECT r.id, 'medical-help', 'home-nurse' FROM roles r WHERE r.name = 'Nurse / Caretaker'
UNION ALL
SELECT r.id, 'medical-help', 'post-surgery' FROM roles r WHERE r.name = 'Nurse / Caretaker'
ON CONFLICT DO NOTHING;

-- Technician (IT)
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'tech-help', 'laptop' FROM roles r WHERE r.name = 'Technician (IT)'
UNION ALL
SELECT r.id, 'tech-help', 'computer' FROM roles r WHERE r.name = 'Technician (IT)'
UNION ALL
SELECT r.id, 'tech-help', 'wifi' FROM roles r WHERE r.name = 'Technician (IT)'
UNION ALL
SELECT r.id, 'tech-help', 'software' FROM roles r WHERE r.name = 'Technician (IT)'
UNION ALL
SELECT r.id, 'repair', 'laptop-repair' FROM roles r WHERE r.name = 'Technician (IT)'
UNION ALL
SELECT r.id, 'repair', 'mobile-repair' FROM roles r WHERE r.name = 'Technician (IT)'
ON CONFLICT DO NOTHING;

-- Beautician
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'beauty-wellness', 'haircut' FROM roles r WHERE r.name = 'Beautician'
UNION ALL
SELECT r.id, 'beauty-wellness', 'styling' FROM roles r WHERE r.name = 'Beautician'
UNION ALL
SELECT r.id, 'beauty-wellness', 'bridal' FROM roles r WHERE r.name = 'Beautician'
UNION ALL
SELECT r.id, 'beauty-wellness', 'party-makeup' FROM roles r WHERE r.name = 'Beautician'
UNION ALL
SELECT r.id, 'beauty-wellness', 'facial' FROM roles r WHERE r.name = 'Beautician'
ON CONFLICT DO NOTHING;

-- Mechanic
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'vehicle-help', 'bike-repair' FROM roles r WHERE r.name = 'Mechanic'
UNION ALL
SELECT r.id, 'vehicle-help', 'car-repair' FROM roles r WHERE r.name = 'Mechanic'
UNION ALL
SELECT r.id, 'vehicle-help', 'flat-tyre' FROM roles r WHERE r.name = 'Mechanic'
ON CONFLICT DO NOTHING;

-- Event Planner
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'event-help', 'party' FROM roles r WHERE r.name = 'Event Planner'
UNION ALL
SELECT r.id, 'event-help', 'wedding' FROM roles r WHERE r.name = 'Event Planner'
UNION ALL
SELECT r.id, 'event-help', 'decoration' FROM roles r WHERE r.name = 'Event Planner'
UNION ALL
SELECT r.id, 'event-help', 'coordination' FROM roles r WHERE r.name = 'Event Planner'
ON CONFLICT DO NOTHING;

-- Pet Caretaker
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'pet-care', 'walking' FROM roles r WHERE r.name = 'Pet Caretaker'
UNION ALL
SELECT r.id, 'pet-care', 'sitting' FROM roles r WHERE r.name = 'Pet Caretaker'
UNION ALL
SELECT r.id, 'pet-care', 'feeding' FROM roles r WHERE r.name = 'Pet Caretaker'
UNION ALL
SELECT r.id, 'pet-care', 'grooming' FROM roles r WHERE r.name = 'Pet Caretaker'
ON CONFLICT DO NOTHING;

-- Consultant
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'professional-help', 'startup' FROM roles r WHERE r.name = 'Consultant'
UNION ALL
SELECT r.id, 'professional-help', 'business' FROM roles r WHERE r.name = 'Consultant'
UNION ALL
SELECT r.id, 'professional-help', 'career' FROM roles r WHERE r.name = 'Consultant'
UNION ALL
SELECT r.id, 'professional-help', 'marketing' FROM roles r WHERE r.name = 'Consultant'
ON CONFLICT DO NOTHING;

-- Freelancer
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'mentorship', 'software-dev' FROM roles r WHERE r.name = 'Freelancer'
UNION ALL
SELECT r.id, 'mentorship', 'ui-ux' FROM roles r WHERE r.name = 'Freelancer'
UNION ALL
SELECT r.id, 'mentorship', 'digital-marketing' FROM roles r WHERE r.name = 'Freelancer'
UNION ALL
SELECT r.id, 'professional-help', 'freelance' FROM roles r WHERE r.name = 'Freelancer'
ON CONFLICT DO NOTHING;

-- Moving & Packing Helper
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'moving-packing', 'house-shifting' FROM roles r WHERE r.name = 'Moving & Packing Helper'
UNION ALL
SELECT r.id, 'moving-packing', 'furniture-moving' FROM roles r WHERE r.name = 'Moving & Packing Helper'
UNION ALL
SELECT r.id, 'moving-packing', 'packing' FROM roles r WHERE r.name = 'Moving & Packing Helper'
UNION ALL
SELECT r.id, 'moving-packing', 'loading' FROM roles r WHERE r.name = 'Moving & Packing Helper'
ON CONFLICT DO NOTHING;

-- Laundry Service
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'laundry', 'washing' FROM roles r WHERE r.name = 'Laundry Service'
UNION ALL
SELECT r.id, 'laundry', 'ironing' FROM roles r WHERE r.name = 'Laundry Service'
UNION ALL
SELECT r.id, 'laundry', 'dry-cleaning' FROM roles r WHERE r.name = 'Laundry Service'
ON CONFLICT DO NOTHING;

-- Home Service Professional
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'home-services', 'painting' FROM roles r WHERE r.name = 'Home Service Professional'
UNION ALL
SELECT r.id, 'home-services', 'electrical' FROM roles r WHERE r.name = 'Home Service Professional'
UNION ALL
SELECT r.id, 'home-services', 'furniture-assembly' FROM roles r WHERE r.name = 'Home Service Professional'
ON CONFLICT DO NOTHING;

-- Document Helper
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'document-help', 'aadhaar' FROM roles r WHERE r.name = 'Document Helper'
UNION ALL
SELECT r.id, 'document-help', 'pan' FROM roles r WHERE r.name = 'Document Helper'
UNION ALL
SELECT r.id, 'document-help', 'passport' FROM roles r WHERE r.name = 'Document Helper'
ON CONFLICT DO NOTHING;

-- Partner / Companion
INSERT INTO role_subcategories (role_id, category_id, subcategory_id)
SELECT r.id, 'partner-needed', 'gym' FROM roles r WHERE r.name = 'Partner / Companion'
UNION ALL
SELECT r.id, 'partner-needed', 'running' FROM roles r WHERE r.name = 'Partner / Companion'
UNION ALL
SELECT r.id, 'partner-needed', 'study' FROM roles r WHERE r.name = 'Partner / Companion'
ON CONFLICT DO NOTHING;