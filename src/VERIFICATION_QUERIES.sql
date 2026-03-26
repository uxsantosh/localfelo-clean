-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify your migration was successful
-- =====================================================

-- =====================================================
-- SECTION 1: Verify Table Structures
-- =====================================================

-- 1. Check wishes table has all new columns
SELECT 
  '1️⃣ WISHES TABLE - NEW COLUMNS' as section,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'wishes'
  AND column_name IN (
    'role_id', 
    'category_id', 
    'subcategory_id', 
    'subcategory_ids', 
    'helper_category', 
    'intent_type'
  )
ORDER BY column_name;

-- 2. Check tasks table has all new columns
SELECT 
  '2️⃣ TASKS TABLE - NEW COLUMNS' as section,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
  AND column_name IN (
    'role_id', 
    'category_id', 
    'subcategory', 
    'subcategory_ids', 
    'helper_category', 
    'intent_type'
  )
ORDER BY column_name;

-- 3. Check professionals table structure (for comparison)
SELECT 
  '3️⃣ PROFESSIONALS TABLE - EXISTING STRUCTURE' as section,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'professionals'
  AND column_name IN (
    'role_id', 
    'category_id', 
    'subcategory_id', 
    'subcategory_ids'
  )
ORDER BY column_name;

-- 4. Check notifications table has routing fields
SELECT 
  '4️⃣ NOTIFICATIONS TABLE - ROUTING FIELDS' as section,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
  AND column_name IN (
    'related_type', 
    'related_id', 
    'action_label', 
    'metadata',
    'type',
    'notification_type'
  )
ORDER BY column_name;

-- =====================================================
-- SECTION 2: Verify Indexes
-- =====================================================

-- 5. Check wishes indexes
SELECT 
  '5️⃣ WISHES TABLE - INDEXES' as section,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'wishes'
  AND indexname LIKE 'idx_wishes_%'
ORDER BY indexname;

-- 6. Check tasks indexes
SELECT 
  '6️⃣ TASKS TABLE - INDEXES' as section,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'tasks'
  AND indexname LIKE 'idx_tasks_%'
ORDER BY indexname;

-- 7. Check notifications indexes
SELECT 
  '7️⃣ NOTIFICATIONS TABLE - INDEXES' as section,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'notifications'
  AND indexname LIKE 'idx_notifications_%'
ORDER BY indexname;

-- =====================================================
-- SECTION 3: Verify Data Counts
-- =====================================================

-- 8. Count roles
SELECT 
  '8️⃣ ROLES COUNT' as section,
  COUNT(*) as total_roles,
  COUNT(*) FILTER (WHERE is_active = true) as active_roles
FROM roles;

-- 9. Count role-subcategory mappings
SELECT 
  '9️⃣ ROLE-SUBCATEGORY MAPPINGS' as section,
  COUNT(*) as total_mappings
FROM role_subcategories;

-- 10. Show sample roles
SELECT 
  '🔟 SAMPLE ROLES' as section,
  id,
  name,
  display_order,
  is_active
FROM roles
WHERE is_active = true
ORDER BY display_order
LIMIT 10;

-- 11. Show category counts by type
SELECT 
  '1️⃣1️⃣ CATEGORIES BY TYPE' as section,
  type,
  COUNT(*) as count
FROM categories
GROUP BY type
ORDER BY type;

-- 12. Show sample categories for each type
SELECT 
  '1️⃣2️⃣ SAMPLE CATEGORIES' as section,
  id,
  name,
  type,
  sort_order
FROM categories
WHERE type IN ('listing', 'wish', 'task')
ORDER BY type, sort_order
LIMIT 30;

-- =====================================================
-- SECTION 4: Verify Constraints and RLS
-- =====================================================

-- 13. Check table constraints
SELECT 
  '1️⃣3️⃣ TABLE CONSTRAINTS' as section,
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name IN ('wishes', 'tasks', 'notifications', 'professionals')
  AND constraint_type IN ('FOREIGN KEY', 'CHECK')
ORDER BY table_name, constraint_type;

-- 14. Check RLS status
SELECT 
  '1️⃣4️⃣ ROW LEVEL SECURITY STATUS' as section,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('wishes', 'tasks', 'notifications', 'professionals', 'listings')
  AND schemaname = 'public'
ORDER BY tablename;

-- 15. Check RLS policies on notifications
SELECT 
  '1️⃣5️⃣ NOTIFICATIONS RLS POLICIES' as section,
  policyname,
  cmd as operation,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY policyname;

-- =====================================================
-- SECTION 5: Sample Data Checks
-- =====================================================

-- 16. Check sample wishes (show new fields)
SELECT 
  '1️⃣6️⃣ SAMPLE WISHES WITH NEW FIELDS' as section,
  id,
  title,
  category_id,
  role_id,
  subcategory_id,
  subcategory_ids,
  helper_category,
  intent_type,
  status,
  created_at
FROM wishes
ORDER BY created_at DESC
LIMIT 3;

-- 17. Check sample tasks (show new fields)
SELECT 
  '1️⃣7️⃣ SAMPLE TASKS WITH NEW FIELDS' as section,
  id,
  title,
  category_id,
  role_id,
  subcategory,
  subcategory_ids,
  helper_category,
  intent_type,
  status,
  created_at
FROM tasks
ORDER BY created_at DESC
LIMIT 3;

-- 18. Check sample professionals (show role fields)
SELECT 
  '1️⃣8️⃣ SAMPLE PROFESSIONALS WITH ROLES' as section,
  p.id,
  p.name,
  p.title,
  r.name as role_name,
  p.category_id,
  p.subcategory_id,
  p.subcategory_ids,
  p.city,
  p.is_active
FROM professionals p
LEFT JOIN roles r ON r.id = p.role_id
ORDER BY p.created_at DESC
LIMIT 3;

-- 19. Check sample notifications (show routing)
SELECT 
  '1️⃣9️⃣ SAMPLE NOTIFICATIONS WITH ROUTING' as section,
  id,
  user_id,
  title,
  type,
  related_type,
  related_id,
  action_label,
  is_read,
  created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 5;

-- 20. Check notification distribution by related_type
SELECT 
  '2️⃣0️⃣ NOTIFICATIONS BY MODULE' as section,
  COALESCE(related_type, 'system') as module,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_read = false) as unread
FROM notifications
GROUP BY related_type
ORDER BY total DESC;

-- =====================================================
-- SECTION 6: Helper Functions Test
-- =====================================================

-- 21. Test notification helper view (OPTIONAL - only if view was created successfully)
DO $$
DECLARE
  view_exists BOOLEAN;
  sample_count INT;
BEGIN
  -- Check if view exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_name = 'notification_details'
  ) INTO view_exists;
  
  IF view_exists THEN
    RAISE NOTICE '✅ notification_details view exists';
    SELECT COUNT(*) INTO sample_count FROM notification_details;
    RAISE NOTICE 'ℹ️ notification_details has % rows', sample_count;
  ELSE
    RAISE NOTICE '⚠️ notification_details view does not exist - this is OK, view creation may have failed';
    RAISE NOTICE 'ℹ️ The view is optional and not critical for the migration';
  END IF;
END $$;

-- Note: Skipping sample view data query since view may not exist
-- If you want to test the view, run this separately:
-- SELECT id, title, related_type, related_id, item_details
-- FROM notification_details ORDER BY created_at DESC LIMIT 3;

-- 22. Test unread notifications by module function
-- Replace 'user-uuid-here' with actual user UUID
-- SELECT * FROM get_unread_notifications_by_module('9e2d9446-a999-4052-9203-d6affc9c29c5');

-- =====================================================
-- SECTION 7: Migration Summary
-- =====================================================

-- 23. Final summary
SELECT 
  '2️⃣3️⃣ MIGRATION SUMMARY' as section,
  'wishes' as table_name,
  COUNT(*) as total_records,
  COUNT(role_id) as with_role,
  COUNT(subcategory_ids) as with_subcategories,
  COUNT(helper_category) as with_helper_category
FROM wishes
UNION ALL
SELECT 
  '2️⃣3️⃣ MIGRATION SUMMARY' as section,
  'tasks' as table_name,
  COUNT(*) as total_records,
  COUNT(role_id) as with_role,
  COUNT(subcategory_ids) as with_subcategories,
  COUNT(helper_category) as with_helper_category
FROM tasks
UNION ALL
SELECT 
  '2️⃣3️⃣ MIGRATION SUMMARY' as section,
  'professionals' as table_name,
  COUNT(*) as total_records,
  COUNT(role_id) as with_role,
  COUNT(subcategory_ids) as with_subcategories,
  NULL as with_helper_category
FROM professionals
UNION ALL
SELECT 
  '2️⃣3️⃣ MIGRATION SUMMARY' as section,
  'notifications' as table_name,
  COUNT(*) as total_records,
  COUNT(related_type) as with_related_type,
  COUNT(related_id) as with_related_id,
  COUNT(*) FILTER (WHERE is_read = false) as unread
FROM notifications;

-- =====================================================
-- SUCCESS INDICATORS
-- =====================================================
-- After running this file, you should see:
-- ✅ Wishes table has: role_id, subcategory_id, subcategory_ids, helper_category, intent_type
-- ✅ Tasks table has: role_id, subcategory_ids, helper_category, intent_type
-- ✅ Notifications table has: related_type, related_id, action_label, metadata
-- ✅ All tables have proper indexes
-- ✅ Notifications table has RLS enabled with 3 policies
-- ✅ Helper view notification_details exists
-- ✅ Helper function get_unread_notifications_by_module exists
-- =====================================================