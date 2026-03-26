-- =====================================================
-- CHECK: What columns do tables ACTUALLY have?
-- =====================================================

-- 1. Check roles table structure
SELECT 
  '1️⃣ ROLES TABLE - ACTUAL COLUMNS' as section,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'roles'
ORDER BY ordinal_position;

-- 2. Check wishes table structure
SELECT 
  '2️⃣ WISHES TABLE - ACTUAL COLUMNS' as section,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'wishes'
ORDER BY ordinal_position;

-- 3. Check tasks table structure
SELECT 
  '3️⃣ TASKS TABLE - ACTUAL COLUMNS' as section,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'tasks'
ORDER BY ordinal_position;

-- 4. Check categories table structure
SELECT 
  '4️⃣ CATEGORIES TABLE - ACTUAL COLUMNS' as section,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'categories'
ORDER BY ordinal_position;

-- 5. Count records in each table
DO $$
DECLARE
  role_count INT;
  wish_count INT;
  task_count INT;
  cat_count INT;
BEGIN
  SELECT COUNT(*) INTO role_count FROM roles;
  SELECT COUNT(*) INTO wish_count FROM wishes;
  SELECT COUNT(*) INTO task_count FROM tasks;
  SELECT COUNT(*) INTO cat_count FROM categories;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 TABLE RECORD COUNTS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'roles: % records', role_count;
  RAISE NOTICE 'wishes: % records', wish_count;
  RAISE NOTICE 'tasks: % records', task_count;
  RAISE NOTICE 'categories: % records', cat_count;
  RAISE NOTICE '========================================';
  
  IF role_count = 0 THEN
    RAISE NOTICE '⚠️  roles table is EMPTY - needs to be populated!';
  END IF;
END $$;

-- 6. Show sample wishes data (basic columns only)
SELECT 
  '6️⃣ SAMPLE WISHES' as section,
  *
FROM wishes
ORDER BY created_at DESC
LIMIT 3;

-- 7. Show sample tasks data (basic columns only)
SELECT 
  '7️⃣ SAMPLE TASKS' as section,
  *
FROM tasks
ORDER BY created_at DESC
LIMIT 3;

-- 8. Show sample categories
SELECT 
  '8️⃣ SAMPLE CATEGORIES' as section,
  *
FROM categories
ORDER BY id
LIMIT 10;
