-- =====================================================
-- DIAGNOSTIC: Check What Currently Exists
-- =====================================================

-- =====================================================
-- SECTION 1: Check All Tables
-- =====================================================

-- 1. List all tables in public schema
SELECT 
  '1️⃣ ALL TABLES IN DATABASE' as info,
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- SECTION 2: Check Tasks Table Structure
-- =====================================================

-- 2. Tasks table columns
SELECT 
  '2️⃣ TASKS TABLE STRUCTURE' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- 3. Sample tasks data
SELECT 
  '3️⃣ SAMPLE TASKS DATA' as info,
  id,
  title,
  category_id,
  subcategory_ids,
  role_id,
  created_at
FROM tasks
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- SECTION 3: Check Wishes Table Structure
-- =====================================================

-- 4. Wishes table columns
SELECT 
  '4️⃣ WISHES TABLE STRUCTURE' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'wishes'
ORDER BY ordinal_position;

-- 5. Sample wishes data
SELECT 
  '5️⃣ SAMPLE WISHES DATA' as info,
  id,
  title,
  category_id,
  subcategory_ids,
  role_id,
  created_at
FROM wishes
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- SECTION 4: Check Categories Used
-- =====================================================

-- 6. Categories used in tasks
SELECT 
  '6️⃣ CATEGORIES USED IN TASKS' as info,
  c.id,
  c.name,
  c.slug,
  c.icon,
  c.type,
  COUNT(t.id) as task_count
FROM categories c
LEFT JOIN tasks t ON t.category_id = c.id
WHERE t.id IS NOT NULL
GROUP BY c.id, c.name, c.slug, c.icon, c.type
ORDER BY task_count DESC;

-- 7. Categories used in wishes
SELECT 
  '7️⃣ CATEGORIES USED IN WISHES' as info,
  c.id,
  c.name,
  c.slug,
  c.icon,
  c.type,
  COUNT(w.id) as wish_count
FROM categories c
LEFT JOIN wishes w ON w.category_id = c.id
WHERE w.id IS NOT NULL
GROUP BY c.id, c.name, c.slug, c.icon, c.type
ORDER BY wish_count DESC;

-- =====================================================
-- SECTION 5: Check Roles Table
-- =====================================================

-- 8. Show all roles
SELECT 
  '8️⃣ PROFESSIONAL ROLES' as info,
  id,
  name,
  slug,
  main_category_id,
  display_order
FROM roles
ORDER BY display_order
LIMIT 20;

-- =====================================================
-- SECTION 6: Summary
-- =====================================================

DO $$
DECLARE
  task_count INT;
  wish_count INT;
  role_count INT;
  task_categories INT;
  wish_categories INT;
BEGIN
  SELECT COUNT(*) INTO task_count FROM tasks;
  SELECT COUNT(*) INTO wish_count FROM wishes;
  SELECT COUNT(*) INTO role_count FROM roles;
  SELECT COUNT(DISTINCT category_id) INTO task_categories FROM tasks;
  SELECT COUNT(DISTINCT category_id) INTO wish_categories FROM wishes;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 CURRENT DATABASE STATE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Tasks: %', task_count;
  RAISE NOTICE 'Total Wishes: %', wish_count;
  RAISE NOTICE 'Total Professional Roles: %', role_count;
  RAISE NOTICE 'Task Categories in Use: %', task_categories;
  RAISE NOTICE 'Wish Categories in Use: %', wish_categories;
  RAISE NOTICE '========================================';
  RAISE NOTICE '⚠️ Helper Categories System: NOT CREATED YET';
  RAISE NOTICE 'ℹ️ Need to CREATE helper categories system';
  RAISE NOTICE '========================================';
END $$;
