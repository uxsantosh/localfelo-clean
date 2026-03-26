-- =====================================================
-- CHECK LOCATION SYSTEM STATUS
-- =====================================================
-- Run this to see current state of your location system
-- =====================================================

-- 1. Check if tables exist
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cities') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as cities_table,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'areas') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as areas_table,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sub_areas') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as sub_areas_table,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'area_distances') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as distances_table;

-- 2. Check record counts
SELECT 
  'Record Counts' as section,
  (SELECT COUNT(*) FROM cities) as cities,
  (SELECT COUNT(*) FROM areas) as areas,
  (SELECT COALESCE(COUNT(*), 0) FROM sub_areas) as sub_areas,
  (SELECT COALESCE(COUNT(*), 0) FROM area_distances) as distances;

-- 3. Check if areas have coordinates
SELECT 
  'Areas with Coordinates' as section,
  COUNT(*) as total_areas,
  COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as with_coordinates,
  COUNT(CASE WHEN latitude IS NULL THEN 1 END) as without_coordinates
FROM areas;

-- 4. Check sub-areas per city
SELECT 
  c.name as city,
  COUNT(DISTINCT a.id) as areas_count,
  COUNT(sa.id) as sub_areas_count,
  ROUND(COUNT(sa.id)::NUMERIC / NULLIF(COUNT(DISTINCT a.id), 0), 1) as avg_sub_areas_per_area
FROM cities c
LEFT JOIN areas a ON c.id = a.city_id
LEFT JOIN sub_areas sa ON a.id = sa.area_id
GROUP BY c.name
ORDER BY sub_areas_count DESC;

-- 5. Sample sub-areas for Jayanagar (to verify detail level)
SELECT 
  'Jayanagar Sub-Areas Sample' as section,
  sa.area_id,
  sa.name,
  sa.landmark
FROM sub_areas sa
WHERE sa.area_id LIKE '%jayanagar-3rd-block%'
ORDER BY sa.name
LIMIT 10;

-- 6. Check if content tables have sub_area_id column
SELECT 
  table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = t.table_name AND column_name = 'sub_area_id'
  ) THEN '✅ HAS COLUMN' ELSE '❌ MISSING COLUMN' END as sub_area_id_status
FROM (
  VALUES ('listings'), ('tasks'), ('wishes'), ('profiles')
) AS t(table_name);

-- 7. Summary
DO $$
DECLARE
  v_cities INTEGER;
  v_areas INTEGER;
  v_sub_areas INTEGER;
  v_areas_with_coords INTEGER;
  v_status TEXT;
BEGIN
  SELECT COUNT(*) INTO v_cities FROM cities;
  SELECT COUNT(*) INTO v_areas FROM areas;
  SELECT COALESCE(COUNT(*), 0) INTO v_sub_areas FROM sub_areas;
  SELECT COUNT(*) INTO v_areas_with_coords FROM areas WHERE latitude IS NOT NULL;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE 'LOCATION SYSTEM STATUS';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Current State:';
  RAISE NOTICE '   Cities: %', v_cities;
  RAISE NOTICE '   Areas: %', v_areas;
  RAISE NOTICE '   Sub-Areas: %', v_sub_areas;
  RAISE NOTICE '   Areas with coordinates: %/%', v_areas_with_coords, v_areas;
  RAISE NOTICE '';
  
  -- Determine status
  IF v_sub_areas = 0 THEN
    v_status := '❌ NOT SETUP';
    RAISE NOTICE 'Status: %', v_status;
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Action Required:';
    RAISE NOTICE '   Run: /COMPLETE_3_LEVEL_SETUP_FINAL.sql';
  ELSIF v_sub_areas < v_areas * 5 THEN
    v_status := '⚠️  PARTIALLY SETUP';
    RAISE NOTICE 'Status: %', v_status;
    RAISE NOTICE '';
    RAISE NOTICE '💡 Recommendation:';
    RAISE NOTICE '   Sub-areas seem low. Consider running:';
    RAISE NOTICE '   1. /COMPLETE_3_LEVEL_SETUP_FINAL.sql (if not done)';
    RAISE NOTICE '   2. /ADD_DETAILED_SUBAREAS_HIGH_PRIORITY.sql (recommended)';
  ELSE
    v_status := '✅ FULLY SETUP';
    RAISE NOTICE 'Status: %', v_status;
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Your location system is ready!';
    RAISE NOTICE '   Average: % sub-areas per area', ROUND(v_sub_areas::NUMERIC / v_areas, 1);
    RAISE NOTICE '';
    RAISE NOTICE '💡 Optional Enhancement:';
    RAISE NOTICE '   Run: /ADD_DETAILED_SUBAREAS_HIGH_PRIORITY.sql';
    RAISE NOTICE '   (Adds street-level detail for popular areas)';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
