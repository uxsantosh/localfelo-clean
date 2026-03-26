-- =====================================================
-- COMPLETE 3-LEVEL LOCATION SETUP - RUN THIS ENTIRE FILE
-- =====================================================
-- Just copy everything below and run in Supabase SQL Editor
-- =====================================================

-- 1. CREATE SUB_AREAS TABLE
CREATE TABLE IF NOT EXISTS sub_areas (
  id TEXT PRIMARY KEY,
  area_id TEXT NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  landmark TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint separately (this is the FIX!)
ALTER TABLE sub_areas DROP CONSTRAINT IF EXISTS sub_areas_area_id_slug_key;
ALTER TABLE sub_areas ADD CONSTRAINT sub_areas_area_id_slug_key UNIQUE (area_id, slug);

-- 2. ADD SLUG TO AREAS TABLE (if missing)
ALTER TABLE areas ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slug from name for existing areas
UPDATE areas 
SET slug = LOWER(
  REPLACE(
    REPLACE(
      REPLACE(name, ' ', '-'),
      ',', ''
    ),
    '.', ''
  )
)
WHERE slug IS NULL OR slug = '';

-- 3. ADD SUB_AREA COLUMNS TO PROFILES TABLE
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sub_area_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sub_area TEXT;

-- Add foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_sub_area_id_fkey;
ALTER TABLE profiles 
ADD CONSTRAINT profiles_sub_area_id_fkey 
FOREIGN KEY (sub_area_id) 
REFERENCES sub_areas(id) 
ON DELETE SET NULL;

-- 4. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_sub_areas_area_id ON sub_areas(area_id);
CREATE INDEX IF NOT EXISTS idx_sub_areas_slug ON sub_areas(slug);
CREATE INDEX IF NOT EXISTS idx_areas_slug ON areas(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_sub_area_id ON profiles(sub_area_id);

-- 5. ENABLE ROW LEVEL SECURITY (RLS) ON SUB_AREAS
ALTER TABLE sub_areas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS sub_areas_public_read ON sub_areas;

-- Create read policy for everyone
CREATE POLICY sub_areas_public_read ON sub_areas
  FOR SELECT
  USING (true);

-- 6. INSERT SAMPLE SUB-AREAS FOR BTM LAYOUT
DO $$
DECLARE
  btm_area_id TEXT;
BEGIN
  -- Find BTM Layout area ID
  SELECT id INTO btm_area_id
  FROM areas
  WHERE name ILIKE '%BTM%' OR name ILIKE '%BTM Layout%'
  LIMIT 1;

  -- Insert sub-areas if BTM Layout exists
  IF btm_area_id IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('sub-btm-1', btm_area_id, '1st Stage', '1st-stage', 12.9165, 77.6101, 'Near Udupi Garden'),
      ('sub-btm-2', btm_area_id, '2nd Stage', '2nd-stage', 12.9121, 77.6089, 'Forum Mall Area'),
      ('sub-btm-3', btm_area_id, '29th Main', '29th-main', 12.9156, 77.6112, 'Silk Board Junction'),
      ('sub-btm-4', btm_area_id, '30th Main', '30th-main', 12.9134, 77.6098, 'BTM Water Tank'),
      ('sub-btm-5', btm_area_id, '6th Main', '6th-main', 12.9189, 77.6078, 'Madiwala Market')
    ON CONFLICT (area_id, slug) DO NOTHING;
    
    RAISE NOTICE 'Successfully inserted sub-areas for BTM Layout (ID: %)', btm_area_id;
  ELSE
    RAISE NOTICE 'BTM Layout not found. You can insert sub-areas manually later.';
  END IF;
END $$;

-- 7. VERIFY SETUP
SELECT 
  'sub_areas table' as item,
  COUNT(*) as count
FROM sub_areas
UNION ALL
SELECT 
  'areas with slug' as item,
  COUNT(*) as count
FROM areas
WHERE slug IS NOT NULL
UNION ALL
SELECT 
  'profiles ready for sub_area' as item,
  COUNT(*) as count
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('sub_area_id', 'sub_area');

-- =====================================================
-- ✅ DONE! You should see output like:
-- =====================================================
-- item                          | count
-- ------------------------------|------
-- sub_areas table               | 5
-- areas with slug               | (your area count)
-- profiles ready for sub_area   | 2
-- =====================================================
