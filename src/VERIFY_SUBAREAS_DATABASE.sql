-- =====================================================
-- VERIFY SUB-AREAS DATABASE SETUP
-- =====================================================
-- Run these queries one by one to diagnose the issue
-- =====================================================

-- 1. CHECK IF SUB_AREAS TABLE EXISTS
-- Expected: Should return 't' (true) if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public'
  AND table_name = 'sub_areas'
) as table_exists;

-- 2. CHECK TABLE STRUCTURE
-- Expected: Should show all columns (id, area_id, name, slug, latitude, longitude, landmark, created_at)
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sub_areas'
ORDER BY ordinal_position;

-- 3. COUNT TOTAL SUB-AREAS
-- Expected: Should be > 0 if you added data
SELECT COUNT(*) as total_sub_areas FROM sub_areas;

-- 4. VIEW ALL SUB-AREAS WITH THEIR PARENT AREAS AND CITIES
-- Expected: Should show all sub-areas with city and area names
SELECT 
  c.name as city_name,
  a.name as area_name,
  sa.id as sub_area_id,
  sa.name as sub_area_name,
  sa.latitude,
  sa.longitude,
  sa.landmark,
  sa.slug
FROM sub_areas sa
JOIN areas a ON sa.area_id = a.id
JOIN cities c ON a.city_id = c.id
ORDER BY c.name, a.name, sa.name;

-- 5. CHECK IF AREAS TABLE HAS SLUG COLUMN
-- Expected: Should show 'slug' column exists
SELECT 
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'areas'
  AND column_name = 'slug';

-- 6. COUNT SUB-AREAS PER AREA
-- Expected: Shows which areas have sub-areas
SELECT 
  c.name as city_name,
  a.id as area_id,
  a.name as area_name,
  COUNT(sa.id) as sub_areas_count
FROM areas a
LEFT JOIN sub_areas sa ON a.id = sa.area_id
JOIN cities c ON a.city_id = c.id
GROUP BY c.name, a.id, a.name
ORDER BY sub_areas_count DESC, c.name, a.name;

-- 7. SAMPLE: VIEW SPECIFIC CITY'S AREAS AND SUB-AREAS
-- Expected: Shows nested structure for Bangalore
SELECT 
  a.id as area_id,
  a.name as area_name,
  a.slug as area_slug,
  json_agg(
    json_build_object(
      'id', sa.id,
      'name', sa.name,
      'slug', sa.slug,
      'latitude', sa.latitude,
      'longitude', sa.longitude,
      'landmark', sa.landmark
    ) ORDER BY sa.name
  ) FILTER (WHERE sa.id IS NOT NULL) as sub_areas
FROM areas a
LEFT JOIN sub_areas sa ON a.id = sa.area_id
WHERE a.city_id IN (SELECT id FROM cities WHERE name = 'Bangalore')
GROUP BY a.id, a.name, a.slug
ORDER BY a.name;

-- 8. CHECK RLS POLICIES ON SUB_AREAS TABLE
-- Expected: Should show 'sub_areas_public_read' policy
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'sub_areas';

-- 9. TEST QUERY - SIMULATE WHAT FRONTEND FETCHES
-- Expected: Should return cities with nested areas and sub_areas
-- (Note: Supabase PostgREST format)
SELECT 
  c.id,
  c.name,
  json_agg(
    json_build_object(
      'id', a.id,
      'name', a.name,
      'slug', a.slug,
      'city_id', a.city_id,
      'latitude', a.latitude,
      'longitude', a.longitude,
      'sub_areas', (
        SELECT json_agg(
          json_build_object(
            'id', sa.id,
            'name', sa.name,
            'area_id', sa.area_id,
            'slug', sa.slug,
            'latitude', sa.latitude,
            'longitude', sa.longitude,
            'landmark', sa.landmark
          ) ORDER BY sa.name
        )
        FROM sub_areas sa
        WHERE sa.area_id = a.id
      )
    ) ORDER BY a.name
  ) FILTER (WHERE a.id IS NOT NULL) as areas
FROM cities c
LEFT JOIN areas a ON a.city_id = c.id
WHERE c.name = 'Bangalore'
GROUP BY c.id, c.name;

-- =====================================================
-- TROUBLESHOOTING BASED ON RESULTS
-- =====================================================

-- If Query 1 returns 'f' (false):
-- → Run /SETUP_SUB_AREAS_TABLE.sql to create the table

-- If Query 3 returns 0:
-- → No sub-areas in database. Insert sample data (see below)

-- If Query 5 returns no rows:
-- → Areas table missing 'slug' column. Add it:
ALTER TABLE areas ADD COLUMN IF NOT EXISTS slug TEXT;
UPDATE areas SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;

-- =====================================================
-- QUICK FIX: INSERT SAMPLE SUB-AREAS
-- =====================================================

-- STEP 1: Get your area ID
-- Run this first:
SELECT a.id, a.name, c.name as city_name 
FROM areas a 
JOIN cities c ON a.city_id = c.id 
WHERE c.name = 'Bangalore'
ORDER BY a.name;

-- STEP 2: Copy an area ID from above (e.g., 'area-btm-layout')
-- Then run this INSERT (replace 'YOUR_AREA_ID_HERE'):

/*
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
  ('sub-btm-1', 'YOUR_AREA_ID_HERE', '1st Stage', '1st-stage', 12.9165, 77.6101, 'Near Udupi Garden'),
  ('sub-btm-2', 'YOUR_AREA_ID_HERE', '2nd Stage', '2nd-stage', 12.9121, 77.6089, 'Forum Mall Area'),
  ('sub-btm-3', 'YOUR_AREA_ID_HERE', '29th Main', '29th-main', 12.9156, 77.6112, 'Silk Board Junction'),
  ('sub-btm-4', 'YOUR_AREA_ID_HERE', '30th Main', '30th-main', 12.9134, 77.6098, 'BTM Water Tank'),
  ('sub-btm-5', 'YOUR_AREA_ID_HERE', '6th Main', '6th-main', 12.9189, 77.6078, 'Madiwala Market')
ON CONFLICT (area_id, slug) DO NOTHING;
*/

-- =====================================================
-- AFTER RUNNING FIXES
-- =====================================================

-- 1. Refresh your browser (Ctrl+R or Cmd+R)
-- 2. Open Console (F12)
-- 3. Look for these logs:
--    🌆 [Locations] Fetching cities with areas and sub-areas...
--    📍 [Locations] Area "BTM Layout" has 5 sub-areas: [...]
--    🗺️ [LocationSetupModal] Sub Areas: [...]
-- 4. Click location icon and select City → Area
-- 5. 3rd dropdown should appear!
