-- =====================================================
-- SIMPLE DIAGNOSTIC: Check What Actually Exists
-- =====================================================

-- 1. Check wishes table structure
SELECT 
  '1️⃣ WISHES TABLE COLUMNS' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'wishes'
ORDER BY ordinal_position;

-- 2. Check tasks table structure
SELECT 
  '2️⃣ TASKS TABLE COLUMNS' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- 3. Check roles table structure
SELECT 
  '3️⃣ ROLES TABLE COLUMNS' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'roles'
ORDER BY ordinal_position;

-- 4. Check if roles table exists and has data
DO $$
DECLARE
  role_count INT;
  wish_count INT;
  task_count INT;
BEGIN
  -- Check if roles table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
    SELECT COUNT(*) INTO role_count FROM roles;
    RAISE NOTICE '✅ Roles table exists with % records', role_count;
  ELSE
    RAISE NOTICE '❌ Roles table does NOT exist';
    role_count := 0;
  END IF;
  
  -- Check wishes
  SELECT COUNT(*) INTO wish_count FROM wishes;
  RAISE NOTICE '📊 Total wishes: %', wish_count;
  
  -- Check tasks
  SELECT COUNT(*) INTO task_count FROM tasks;
  RAISE NOTICE '📊 Total tasks: %', task_count;
  
  RAISE NOTICE '========================================';
END $$;

-- 5. Show sample wishes (only existing columns)
SELECT 
  '5️⃣ SAMPLE WISHES (first 5)' as info,
  id,
  title,
  category_id,
  subcategory_ids,
  role_id,
  created_at
FROM wishes
ORDER BY created_at DESC
LIMIT 5;

-- 6. Show sample tasks (only existing columns)
SELECT 
  '6️⃣ SAMPLE TASKS (first 5)' as info,
  id,
  title,
  category_id,
  subcategory_ids,
  role_id,
  created_at
FROM tasks
ORDER BY created_at DESC
LIMIT 5;

-- 7. Show roles (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
    RAISE NOTICE '7️⃣ Showing sample roles...';
    PERFORM 1; -- Placeholder
  ELSE
    RAISE NOTICE '7️⃣ ❌ Roles table does not exist - needs to be created';
  END IF;
END $$;

-- Try to show roles (this will error if table doesn't exist, but that's okay)
SELECT 
  '7️⃣ SAMPLE ROLES (first 10)' as info,
  id,
  name,
  main_category_id,
  subcategory_ids,
  display_order
FROM roles
ORDER BY display_order
LIMIT 10;
