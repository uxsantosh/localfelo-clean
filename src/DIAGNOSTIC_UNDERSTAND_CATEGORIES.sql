-- =====================================================
-- DIAGNOSTIC: Understand Actual Category Structure
-- =====================================================
-- This will help us understand how wishes/tasks categories work
-- and how to map them to professional roles

-- =====================================================
-- SECTION 1: Check Table Structures
-- =====================================================

-- 1. Check wishes table structure
SELECT 
  '1️⃣ WISHES TABLE STRUCTURE' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'wishes'
ORDER BY ordinal_position;

-- 2. Check tasks table structure  
SELECT 
  '2️⃣ TASKS TABLE STRUCTURE' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- =====================================================
-- SECTION 2: Check Categories Table
-- =====================================================

-- 3. Show all categories in categories table
SELECT 
  '3️⃣ ALL CATEGORIES' as info,
  id,
  name,
  slug,
  icon,
  description,
  type,
  parent_id,
  display_order
FROM categories
ORDER BY display_order, name;

-- 4. Show category hierarchy (parent-child relationships)
SELECT 
  '4️⃣ CATEGORY HIERARCHY' as info,
  p.name as parent_category,
  c.name as child_category,
  c.slug as child_slug,
  c.type as category_type
FROM categories c
LEFT JOIN categories p ON p.id = c.parent_id
ORDER BY p.name, c.name;

-- =====================================================
-- SECTION 3: Check Existing Wishes Data
-- =====================================================

-- 5. Show sample wishes with their categories
SELECT 
  '5️⃣ SAMPLE WISHES WITH CATEGORIES' as info,
  w.id,
  w.title,
  w.category_id,
  c.name as category_name,
  c.slug as category_slug,
  w.subcategory_ids,
  w.role_id
FROM wishes w
LEFT JOIN categories c ON c.id = w.category_id
ORDER BY w.created_at DESC
LIMIT 10;

-- 6. Count wishes by category
SELECT 
  '6️⃣ WISHES COUNT BY CATEGORY' as info,
  c.name as category_name,
  c.slug as category_slug,
  c.type as category_type,
  COUNT(w.id) as wish_count
FROM wishes w
LEFT JOIN categories c ON c.id = w.category_id
GROUP BY c.id, c.name, c.slug, c.type
ORDER BY wish_count DESC;

-- =====================================================
-- SECTION 4: Check Existing Tasks Data
-- =====================================================

-- 7. Show sample tasks with their categories
SELECT 
  '7️⃣ SAMPLE TASKS WITH CATEGORIES' as info,
  t.id,
  t.title,
  t.category_id,
  c.name as category_name,
  c.slug as category_slug,
  t.subcategory_ids,
  t.role_id
FROM tasks t
LEFT JOIN categories c ON c.id = t.category_id
ORDER BY t.created_at DESC
LIMIT 10;

-- 8. Count tasks by category
SELECT 
  '8️⃣ TASKS COUNT BY CATEGORY' as info,
  c.name as category_name,
  c.slug as category_slug,
  c.type as category_type,
  COUNT(t.id) as task_count
FROM tasks t
LEFT JOIN categories c ON c.id = t.category_id
GROUP BY c.id, c.name, c.slug, c.type
ORDER BY task_count DESC;

-- =====================================================
-- SECTION 5: Check Professionals and Roles
-- =====================================================

-- 9. Show roles table
SELECT 
  '9️⃣ ALL PROFESSIONAL ROLES' as info,
  id,
  name,
  slug,
  main_category_id,
  subcategory_ids,
  display_order
FROM roles
ORDER BY display_order
LIMIT 20;

-- 10. Show professional main categories
SELECT 
  '🔟 PROFESSIONAL MAIN CATEGORIES' as info,
  id,
  name,
  slug,
  icon,
  type
FROM categories
WHERE id IN (SELECT DISTINCT main_category_id FROM roles)
ORDER BY name;

-- =====================================================
-- SECTION 6: Identify Category Overlaps
-- =====================================================

-- 11. Check if wish categories overlap with professional categories
SELECT 
  '1️⃣1️⃣ CATEGORY OVERLAP ANALYSIS' as info,
  c.name as category_name,
  c.slug as category_slug,
  c.type as category_type,
  COUNT(DISTINCT w.id) as used_in_wishes,
  COUNT(DISTINCT t.id) as used_in_tasks,
  COUNT(DISTINCT r.id) as used_in_roles
FROM categories c
LEFT JOIN wishes w ON w.category_id = c.id
LEFT JOIN tasks t ON t.category_id = c.id
LEFT JOIN roles r ON r.main_category_id = c.id
GROUP BY c.id, c.name, c.slug, c.type
ORDER BY category_name;

-- =====================================================
-- SECTION 7: Summary and Recommendations
-- =====================================================

DO $$
DECLARE
  wish_categories INT;
  task_categories INT;
  professional_categories INT;
  overlapping_categories INT;
BEGIN
  -- Count unique categories used in each module
  SELECT COUNT(DISTINCT category_id) INTO wish_categories FROM wishes;
  SELECT COUNT(DISTINCT category_id) INTO task_categories FROM tasks;
  SELECT COUNT(DISTINCT main_category_id) INTO professional_categories FROM roles;
  
  -- Count categories used in multiple modules
  SELECT COUNT(*) INTO overlapping_categories
  FROM (
    SELECT category_id 
    FROM wishes 
    WHERE category_id IN (SELECT main_category_id FROM roles)
    UNION
    SELECT category_id 
    FROM tasks 
    WHERE category_id IN (SELECT main_category_id FROM roles)
  ) overlap;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 CATEGORY ANALYSIS SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Wish categories: %', wish_categories;
  RAISE NOTICE 'Task categories: %', task_categories;
  RAISE NOTICE 'Professional categories: %', professional_categories;
  RAISE NOTICE 'Overlapping categories: %', overlapping_categories;
  RAISE NOTICE '========================================';
  
  IF overlapping_categories = 0 THEN
    RAISE NOTICE '⚠️ WARNING: No category overlap found!';
    RAISE NOTICE 'ℹ️ Wishes/Tasks use DIFFERENT categories than Professionals';
    RAISE NOTICE 'ℹ️ We need a MAPPING TABLE to connect them';
  ELSE
    RAISE NOTICE '✅ Some categories are shared across modules';
    RAISE NOTICE 'ℹ️ We can map based on shared categories';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;
