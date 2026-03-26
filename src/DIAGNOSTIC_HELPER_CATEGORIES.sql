-- =====================================================
-- DIAGNOSTIC: Check Helper Categories and Task Mapping
-- =====================================================
-- This will show us how tasks use helper categories
-- so we can replicate the same for wishes

-- =====================================================
-- SECTION 1: Check Helper Categories Table
-- =====================================================

-- 1. Show all helper categories
SELECT 
  '1️⃣ ALL HELPER CATEGORIES' as info,
  id,
  name,
  slug,
  icon,
  description,
  display_order
FROM helper_categories
ORDER BY display_order;

-- 2. Check helper_category_role_mapping table
SELECT 
  '2️⃣ HELPER CATEGORY TO ROLE MAPPING' as info,
  hcrm.id,
  hc.name as helper_category_name,
  r.name as role_name,
  hcrm.display_order
FROM helper_category_role_mapping hcrm
LEFT JOIN helper_categories hc ON hc.id = hcrm.helper_category_id
LEFT JOIN roles r ON r.id = hcrm.role_id
ORDER BY hc.name, hcrm.display_order;

-- =====================================================
-- SECTION 2: Check Current Tasks Structure
-- =====================================================

-- 3. Check tasks table structure
SELECT 
  '3️⃣ TASKS TABLE COLUMNS' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- 4. Show sample tasks with helper categories
SELECT 
  '4️⃣ SAMPLE TASKS WITH HELPER CATEGORIES' as info,
  t.id,
  t.title,
  t.helper_category_id,
  hc.name as helper_category_name,
  t.role_id,
  r.name as role_name,
  t.category_id,
  t.subcategory_ids
FROM tasks t
LEFT JOIN helper_categories hc ON hc.id = t.helper_category_id
LEFT JOIN roles r ON r.id = t.role_id
ORDER BY t.created_at DESC
LIMIT 10;

-- 5. Count tasks by helper category
SELECT 
  '5️⃣ TASKS BY HELPER CATEGORY' as info,
  hc.name as helper_category_name,
  COUNT(t.id) as task_count
FROM tasks t
LEFT JOIN helper_categories hc ON hc.id = t.helper_category_id
GROUP BY hc.id, hc.name
ORDER BY task_count DESC;

-- =====================================================
-- SECTION 3: Check Current Wishes Structure
-- =====================================================

-- 6. Check wishes table structure
SELECT 
  '6️⃣ WISHES TABLE COLUMNS' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'wishes'
ORDER BY ordinal_position;

-- 7. Show sample wishes with current categories
SELECT 
  '7️⃣ SAMPLE WISHES (CURRENT STRUCTURE)' as info,
  w.id,
  w.title,
  w.category_id,
  c.name as category_name,
  w.subcategory_ids,
  w.helper_category_id,
  w.role_id
FROM wishes w
LEFT JOIN categories c ON c.id = w.category_id
ORDER BY w.created_at DESC
LIMIT 10;

-- 8. Count wishes by category
SELECT 
  '8️⃣ WISHES BY CATEGORY' as info,
  c.name as category_name,
  c.slug as category_slug,
  COUNT(w.id) as wish_count
FROM wishes w
LEFT JOIN categories c ON c.id = w.category_id
GROUP BY c.id, c.name, c.slug
ORDER BY wish_count DESC;

-- =====================================================
-- SECTION 4: Check What Needs to Be Added
-- =====================================================

-- 9. Check if wishes has helper_category_id column
DO $$
DECLARE
  has_helper_category BOOLEAN;
  has_role_id BOOLEAN;
BEGIN
  -- Check for helper_category_id
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishes' AND column_name = 'helper_category_id'
  ) INTO has_helper_category;
  
  -- Check for role_id
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishes' AND column_name = 'role_id'
  ) INTO has_role_id;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '9️⃣ WISHES TABLE STATUS';
  RAISE NOTICE '========================================';
  
  IF has_helper_category THEN
    RAISE NOTICE '✅ wishes.helper_category_id exists';
  ELSE
    RAISE NOTICE '❌ wishes.helper_category_id MISSING - needs to be added';
  END IF;
  
  IF has_role_id THEN
    RAISE NOTICE '✅ wishes.role_id exists';
  ELSE
    RAISE NOTICE '❌ wishes.role_id MISSING - needs to be added';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- SECTION 5: Summary
-- =====================================================

DO $$
DECLARE
  helper_cat_count INT;
  role_count INT;
  mapping_count INT;
  task_count INT;
  wish_count INT;
BEGIN
  SELECT COUNT(*) INTO helper_cat_count FROM helper_categories;
  SELECT COUNT(*) INTO role_count FROM roles;
  SELECT COUNT(*) INTO mapping_count FROM helper_category_role_mapping;
  SELECT COUNT(*) INTO task_count FROM tasks;
  SELECT COUNT(*) INTO wish_count FROM wishes;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔟 SYSTEM SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Helper Categories: %', helper_cat_count;
  RAISE NOTICE 'Professional Roles: %', role_count;
  RAISE NOTICE 'Helper→Role Mappings: %', mapping_count;
  RAISE NOTICE 'Total Tasks: %', task_count;
  RAISE NOTICE 'Total Wishes: %', wish_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ℹ️ Next: Map wishes to use same helper categories as tasks';
  RAISE NOTICE '========================================';
END $$;
