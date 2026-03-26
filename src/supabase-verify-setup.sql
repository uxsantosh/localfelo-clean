-- ========================================
-- OldCycle: Verify Location Setup
-- ========================================
-- Run this to check if your location tables are set up correctly
-- ========================================

-- 1. Check if tables exist
SELECT 
  'cities' as table_name,
  COUNT(*) as record_count
FROM cities
UNION ALL
SELECT 
  'areas' as table_name,
  COUNT(*) as record_count
FROM areas;

-- 2. Check cities with area counts
SELECT 
  c.name as city_name,
  COUNT(a.id) as area_count
FROM cities c
LEFT JOIN areas a ON c.id = a.city_id
GROUP BY c.id, c.name
ORDER BY area_count DESC;

-- 3. Sample data check - First 10 cities with their first area
SELECT 
  c.name as city,
  c.id as city_id,
  (
    SELECT a.name 
    FROM areas a 
    WHERE a.city_id = c.id 
    LIMIT 1
  ) as sample_area
FROM cities c
ORDER BY c.name
LIMIT 10;

-- 4. Check for orphaned areas (areas without valid city_id)
SELECT 
  a.id,
  a.name,
  a.city_id as invalid_city_id
FROM areas a
LEFT JOIN cities c ON a.city_id = c.id
WHERE c.id IS NULL;

-- 5. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'areas'
ORDER BY ordinal_position;

-- 6. Overall summary
SELECT 
  (SELECT COUNT(*) FROM cities) as total_cities,
  (SELECT COUNT(*) FROM areas) as total_areas,
  (SELECT COUNT(*) FROM areas WHERE city_id IS NULL) as areas_without_city,
  CASE 
    WHEN (SELECT COUNT(*) FROM cities) >= 20 AND (SELECT COUNT(*) FROM areas) >= 300 THEN '✅ Setup Complete'
    WHEN (SELECT COUNT(*) FROM cities) = 0 THEN '❌ Run seed script'
    ELSE '⚠️ Partial setup - rerun seed script'
  END as status;
