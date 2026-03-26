-- =====================================================
-- CATEGORY VERIFICATION QUERIES
-- =====================================================
-- Run these queries after migration to verify everything worked
-- Copy and paste each section into Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CHECK TOTAL CATEGORIES
-- =====================================================
-- Expected result: 27
SELECT COUNT(*) as total_categories FROM categories;

-- =====================================================
-- 2. VIEW ALL CATEGORIES
-- =====================================================
-- Should see all 27 categories with emojis
SELECT 
  id, 
  name, 
  emoji,
  created_at
FROM categories 
ORDER BY name;

-- =====================================================
-- 3. COUNT BY PRIORITY (if priority column exists)
-- =====================================================
-- Priority categories should be visible
SELECT 
  id,
  name,
  emoji,
  CASE 
    WHEN id IN ('quick-help', 'repair', 'installation', 'driver-rides', 
                'delivery-pickup', 'utilities', 'stay-living', 'rent-property', 
                'cleaning', 'cooking', 'shifting-moving', 'pet-care') 
    THEN 'High Priority' 
    ELSE 'Normal' 
  END as priority_level
FROM categories
ORDER BY priority_level DESC, name;

-- =====================================================
-- 4. CHECK FOR ORPHANED TASKS
-- =====================================================
-- Should return 0 rows (no orphaned tasks)
SELECT DISTINCT 
  category_id,
  COUNT(*) as task_count
FROM tasks 
WHERE category_id NOT IN (SELECT id FROM categories)
  AND category_id IS NOT NULL
GROUP BY category_id
ORDER BY task_count DESC;

-- =====================================================
-- 5. CHECK FOR ORPHANED PROFESSIONALS
-- =====================================================
-- Should return 0 rows (no orphaned professionals)
SELECT DISTINCT 
  category_id,
  COUNT(*) as professional_count
FROM professionals 
WHERE category_id NOT IN (SELECT id FROM categories)
  AND category_id IS NOT NULL
GROUP BY category_id
ORDER BY professional_count DESC;

-- =====================================================
-- 6. TASKS DISTRIBUTION BY CATEGORY
-- =====================================================
-- See which categories have the most tasks
SELECT 
  c.name as category_name,
  c.emoji,
  COUNT(t.id) as task_count
FROM categories c
LEFT JOIN tasks t ON c.id = t.category_id
GROUP BY c.id, c.name, c.emoji
ORDER BY task_count DESC;

-- =====================================================
-- 7. PROFESSIONALS DISTRIBUTION BY CATEGORY
-- =====================================================
-- See which categories have the most professionals
SELECT 
  c.name as category_name,
  c.emoji,
  COUNT(p.id) as professional_count
FROM categories c
LEFT JOIN professionals p ON c.id = p.category_id
GROUP BY c.id, c.name, c.emoji
ORDER BY professional_count DESC;

-- =====================================================
-- 8. CHECK CATEGORY MIGRATION MAP
-- =====================================================
-- View all old → new category mappings
SELECT 
  old_id,
  new_id,
  created_at
FROM category_migration_map
ORDER BY old_id;

-- =====================================================
-- 9. CHECK BACKUP TABLE
-- =====================================================
-- Verify backup was created
SELECT 
  COUNT(*) as backup_category_count,
  MIN(created_at) as oldest_category,
  MAX(created_at) as newest_category
FROM categories_backup_2026;

-- =====================================================
-- 10. VERIFY NEW CATEGORIES EXIST
-- =====================================================
-- Check if all 27 expected categories are present
WITH expected_categories AS (
  SELECT unnest(ARRAY[
    'quick-help',
    'repair',
    'installation',
    'driver-rides',
    'delivery-pickup',
    'utilities',
    'stay-living',
    'rent-property',
    'software-dev',
    'design-creative',
    'teaching',
    'coaching-training',
    'mentorship',
    'legal',
    'ca-finance',
    'business-career',
    'govt-id',
    'photography-video',
    'events',
    'beauty-wellness',
    'cleaning',
    'cooking',
    'shifting-moving',
    'pet-care',
    'care-support',
    'home-services',
    'vehicle-care'
  ]) as expected_id
)
SELECT 
  ec.expected_id,
  CASE 
    WHEN c.id IS NOT NULL THEN '✓ EXISTS' 
    ELSE '✗ MISSING' 
  END as status,
  c.name,
  c.emoji
FROM expected_categories ec
LEFT JOIN categories c ON ec.expected_id = c.id
ORDER BY 
  CASE WHEN c.id IS NOT NULL THEN 0 ELSE 1 END,
  ec.expected_id;

-- =====================================================
-- 11. FIND TASKS WITH OLD CATEGORY IDS
-- =====================================================
-- List tasks that need migration
SELECT 
  t.id as task_id,
  t.title,
  t.category_id as old_category_id,
  cm.new_id as new_category_id,
  c.name as new_category_name
FROM tasks t
LEFT JOIN category_migration_map cm ON t.category_id = cm.old_id
LEFT JOIN categories c ON cm.new_id = c.id
WHERE t.category_id NOT IN (SELECT id FROM categories)
  AND t.category_id IS NOT NULL
LIMIT 20;

-- =====================================================
-- 12. FIND PROFESSIONALS WITH OLD CATEGORY IDS
-- =====================================================
-- List professionals that need migration
SELECT 
  p.id as professional_id,
  p.name,
  p.category_id as old_category_id,
  cm.new_id as new_category_id,
  c.name as new_category_name
FROM professionals p
LEFT JOIN category_migration_map cm ON p.category_id = cm.old_id
LEFT JOIN categories c ON cm.new_id = c.id
WHERE p.category_id NOT IN (SELECT id FROM categories)
  AND p.category_id IS NOT NULL
LIMIT 20;

-- =====================================================
-- 13. CHECK MOST POPULAR NEW CATEGORIES
-- =====================================================
-- See what people are using most
SELECT 
  c.emoji,
  c.name as category_name,
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT p.id) as total_professionals,
  (COUNT(DISTINCT t.id) + COUNT(DISTINCT p.id)) as total_activity
FROM categories c
LEFT JOIN tasks t ON c.id = t.category_id
LEFT JOIN professionals p ON c.id = p.category_id
GROUP BY c.id, c.name, c.emoji
ORDER BY total_activity DESC
LIMIT 10;

-- =====================================================
-- 14. VERIFY NO DUPLICATE CATEGORIES
-- =====================================================
-- Should return 0 rows (no duplicates)
SELECT 
  id, 
  COUNT(*) as count
FROM categories
GROUP BY id
HAVING COUNT(*) > 1;

-- =====================================================
-- 15. CHECK RECENTLY CREATED TASKS
-- =====================================================
-- Verify new tasks are using new category IDs
SELECT 
  t.id,
  t.title,
  t.category_id,
  c.name as category_name,
  c.emoji,
  t.created_at
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.created_at > NOW() - INTERVAL '7 days'
ORDER BY t.created_at DESC
LIMIT 10;

-- =====================================================
-- 16. CHECK RECENTLY REGISTERED PROFESSIONALS
-- =====================================================
-- Verify new professionals are using new category IDs
SELECT 
  p.id,
  p.name,
  p.category_id,
  c.name as category_name,
  c.emoji,
  p.created_at
FROM professionals p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.created_at > NOW() - INTERVAL '7 days'
ORDER BY p.created_at DESC
LIMIT 10;

-- =====================================================
-- 17. HEALTH CHECK - ALL IN ONE
-- =====================================================
-- Quick overview of system health
SELECT 
  '1. Total Categories' as check_name,
  COUNT(*)::text as result,
  CASE WHEN COUNT(*) = 27 THEN '✓ PASS' ELSE '✗ FAIL' END as status
FROM categories
UNION ALL
SELECT 
  '2. Orphaned Tasks' as check_name,
  COUNT(DISTINCT category_id)::text as result,
  CASE WHEN COUNT(DISTINCT category_id) = 0 THEN '✓ PASS' ELSE '✗ FAIL - Run Migration' END as status
FROM tasks
WHERE category_id NOT IN (SELECT id FROM categories)
  AND category_id IS NOT NULL
UNION ALL
SELECT 
  '3. Orphaned Professionals' as check_name,
  COUNT(DISTINCT category_id)::text as result,
  CASE WHEN COUNT(DISTINCT category_id) = 0 THEN '✓ PASS' ELSE '✗ FAIL - Run Migration' END as status
FROM professionals
WHERE category_id NOT IN (SELECT id FROM categories)
  AND category_id IS NOT NULL
UNION ALL
SELECT 
  '4. Backup Created' as check_name,
  COUNT(*)::text as result,
  CASE WHEN COUNT(*) > 0 THEN '✓ PASS' ELSE '✗ FAIL' END as status
FROM categories_backup_2026
UNION ALL
SELECT 
  '5. Migration Map' as check_name,
  COUNT(*)::text as result,
  CASE WHEN COUNT(*) > 0 THEN '✓ PASS' ELSE '✗ WARNING - No mappings' END as status
FROM category_migration_map;

-- =====================================================
-- NOTES
-- =====================================================
-- If any health checks fail:
-- 
-- 1. Total Categories != 27
--    → Re-run /UPDATE_CATEGORIES_2026.sql
--
-- 2. Orphaned Tasks/Professionals > 0
--    → Run migration queries from /UPDATE_CATEGORIES_2026.sql Step 3
--
-- 3. Backup not created
--    → Not critical, but run migration again to create backup
--
-- 4. No migration mappings
--    → Not critical if you had no old data
--
-- All checks should show '✓ PASS' for a successful migration!
-- =====================================================
