-- =====================================================
-- INSERT SUB-AREAS - STEP BY STEP (NO ERRORS!)
-- =====================================================

-- ✅ STEP 1: Find your area ID
-- Run this query first to see ALL your areas:

SELECT 
  a.id, 
  a.name as area_name, 
  c.name as city_name 
FROM areas a 
JOIN cities c ON a.city_id = c.id 
ORDER BY c.name, a.name;

-- 📋 EXAMPLE OUTPUT:
-- id                                    | area_name      | city_name
-- --------------------------------------|----------------|----------
-- 3d4f5e6a-7b8c-9d0e-1f2a-3b4c5d6e7f8g | Andheri        | Mumbai
-- 1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p | BTM Layout     | Bangalore
-- 2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q | Koramangala    | Bangalore

-- =====================================================
-- ✅ STEP 2: Copy the ID for the area you want
-- =====================================================
-- For example, if BTM Layout's ID is: 1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p
-- Copy that ENTIRE ID (select it and Ctrl+C)

-- =====================================================
-- ✅ STEP 3: Replace 'PASTE_YOUR_AREA_ID_HERE' below
-- =====================================================
-- Paste the ID you copied in STEP 2

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
  ('sub-btm-1', 'PASTE_YOUR_AREA_ID_HERE', '1st Stage', '1st-stage', 12.9165, 77.6101, 'Near Udupi Garden'),
  ('sub-btm-2', 'PASTE_YOUR_AREA_ID_HERE', '2nd Stage', '2nd-stage', 12.9121, 77.6089, 'Forum Mall Area'),
  ('sub-btm-3', 'PASTE_YOUR_AREA_ID_HERE', '29th Main', '29th-main', 12.9156, 77.6112, 'Silk Board Junction'),
  ('sub-btm-4', 'PASTE_YOUR_AREA_ID_HERE', '30th Main', '30th-main', 12.9134, 77.6098, 'BTM Water Tank'),
  ('sub-btm-5', 'PASTE_YOUR_AREA_ID_HERE', '6th Main', '6th-main', 12.9189, 77.6078, 'Madiwala Market')
ON CONFLICT (area_id, slug) DO NOTHING;

-- =====================================================
-- ✅ EXAMPLE WITH REAL ID:
-- =====================================================
-- If your BTM Layout ID is: 1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p
-- Your query should look like this:

/*
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
  ('sub-btm-1', '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', '1st Stage', '1st-stage', 12.9165, 77.6101, 'Near Udupi Garden'),
  ('sub-btm-2', '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', '2nd Stage', '2nd-stage', 12.9121, 77.6089, 'Forum Mall Area'),
  ('sub-btm-3', '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', '29th Main', '29th-main', 12.9156, 77.6112, 'Silk Board Junction'),
  ('sub-btm-4', '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', '30th Main', '30th-main', 12.9134, 77.6098, 'BTM Water Tank'),
  ('sub-btm-5', '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', '6th Main', '6th-main', 12.9189, 77.6078, 'Madiwala Market')
ON CONFLICT (area_id, slug) DO NOTHING;
*/

-- =====================================================
-- ✅ STEP 4: Verify insertion
-- =====================================================
-- After running the INSERT, verify it worked:

SELECT 
  sa.name as sub_area,
  a.name as area,
  c.name as city
FROM sub_areas sa
JOIN areas a ON sa.area_id = a.id
JOIN cities c ON a.city_id = c.id
ORDER BY c.name, a.name, sa.name;

-- =====================================================
-- 🎯 EXPECTED OUTPUT:
-- =====================================================
-- sub_area   | area        | city
-- -----------|-------------|----------
-- 1st Stage  | BTM Layout  | Bangalore
-- 2nd Stage  | BTM Layout  | Bangalore
-- 29th Main  | BTM Layout  | Bangalore
-- 30th Main  | BTM Layout  | Bangalore
-- 6th Main   | BTM Layout  | Bangalore

-- =====================================================
-- ✅ ALL DONE! Now refresh browser and test! 🎉
-- =====================================================
