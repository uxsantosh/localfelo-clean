-- =====================================================
-- DIAGNOSTIC: Check Your Current Areas
-- Run this first to see what areas you have
-- =====================================================

-- 1. Check all cities
SELECT id, name FROM cities ORDER BY name;

-- 2. Check all areas with their city
SELECT 
  a.id as area_id,
  a.name as area_name,
  a.slug as area_slug,
  c.name as city_name,
  a.latitude,
  a.longitude
FROM areas a
LEFT JOIN cities c ON a.city_id = c.id
ORDER BY c.name, a.name;

-- 3. Count areas per city
SELECT 
  c.name as city,
  COUNT(a.id) as area_count
FROM cities c
LEFT JOIN areas a ON a.city_id = c.id
GROUP BY c.name
ORDER BY c.name;

-- 4. Check if sub_areas table exists and has data
SELECT COUNT(*) as existing_sub_areas FROM sub_areas;

-- 5. Show sample of existing areas (Bangalore)
SELECT id, name, slug FROM areas WHERE city_id IN (
  SELECT id FROM cities WHERE name = 'Bangalore'
)
ORDER BY name;
