-- =====================================================
-- CREATE SUB-AREAS TABLE (3rd Level Location)
-- =====================================================
-- This enables 3-level location hierarchy:
-- City → Area → Sub-Area (e.g., Bangalore → BTM Layout → 29th Main)
-- =====================================================

-- Create sub_areas table
CREATE TABLE IF NOT EXISTS sub_areas (
  id TEXT PRIMARY KEY,
  area_id TEXT NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  landmark TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(area_id, slug)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sub_areas_area_id ON sub_areas(area_id);
CREATE INDEX IF NOT EXISTS idx_sub_areas_slug ON sub_areas(slug);

-- Enable RLS (Row Level Security)
ALTER TABLE sub_areas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow public read access)
DROP POLICY IF EXISTS "sub_areas_public_read" ON sub_areas;
CREATE POLICY "sub_areas_public_read" ON sub_areas
  FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
DROP POLICY IF EXISTS "sub_areas_admin_write" ON sub_areas;
CREATE POLICY "sub_areas_admin_write" ON sub_areas
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- =====================================================
-- INSERT SAMPLE SUB-AREAS (BTM Layout, Bangalore)
-- =====================================================
-- You need to replace 'AREA_ID_HERE' with the actual area_id from your areas table
-- Run this query first to get the area_id:
-- SELECT id, name FROM areas WHERE name = 'BTM Layout';
-- =====================================================

-- Example: BTM Layout Sub-Areas (update AREA_ID_HERE with real ID)
/*
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
  ('sub-btm-1', 'AREA_ID_HERE', '1st Stage', '1st-stage', 12.9165, 77.6101, 'Near Udupi Garden'),
  ('sub-btm-2', 'AREA_ID_HERE', '2nd Stage', '2nd-stage', 12.9121, 77.6089, 'Forum Mall Area'),
  ('sub-btm-3', 'AREA_ID_HERE', '29th Main', '29th-main', 12.9156, 77.6112, 'Silk Board Junction'),
  ('sub-btm-4', 'AREA_ID_HERE', '30th Main', '30th-main', 12.9134, 77.6098, 'BTM Water Tank'),
  ('sub-btm-5', 'AREA_ID_HERE', '6th Main', '6th-main', 12.9189, 77.6078, 'Madiwala Market')
ON CONFLICT (area_id, slug) DO NOTHING;
*/

-- =====================================================
-- VERIFY SETUP
-- =====================================================
-- Run these queries to verify everything is set up correctly:

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'sub_areas'
);

-- 2. Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sub_areas'
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'sub_areas';

-- 4. Count sub-areas (should be > 0 after inserting sample data)
SELECT COUNT(*) as total_sub_areas FROM sub_areas;

-- 5. View all sub-areas with their parent areas
SELECT 
  sa.id,
  sa.name as sub_area_name,
  a.name as area_name,
  c.name as city_name,
  sa.latitude,
  sa.longitude,
  sa.landmark
FROM sub_areas sa
JOIN areas a ON sa.area_id = a.id
JOIN cities c ON a.city_id = c.id
ORDER BY c.name, a.name, sa.name;
