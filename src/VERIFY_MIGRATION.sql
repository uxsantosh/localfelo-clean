-- =====================================================
-- VERIFICATION SCRIPT
-- Run this to verify the Professionals module migration
-- =====================================================

-- =====================================================
-- 1. CHECK TABLES EXIST
-- =====================================================
SELECT 
  '✅ Tables Check' as check_type,
  COUNT(*) as tables_found,
  CASE 
    WHEN COUNT(*) = 4 THEN '✅ All tables created'
    ELSE '❌ Missing tables!'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('professionals', 'professional_services', 'professional_images', 'professional_categories_images');

-- List the tables
SELECT 
  table_name as "Table Name",
  '✅' as "Status"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'professional%'
ORDER BY table_name;

-- =====================================================
-- 2. CHECK HELPER FUNCTION EXISTS
-- =====================================================
SELECT 
  '✅ Function Check' as check_type,
  COUNT(*) as functions_found,
  CASE 
    WHEN COUNT(*) >= 1 THEN '✅ Helper function created'
    ELSE '❌ Run PROFESSIONALS_RLS_FIX.sql!'
  END as status
FROM pg_proc 
WHERE proname = 'get_user_id_from_token';

-- =====================================================
-- 3. CHECK RLS POLICIES
-- =====================================================
SELECT 
  '✅ RLS Policies Check' as check_type,
  COUNT(*) as policies_found,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✅ RLS policies configured'
    ELSE '❌ Missing RLS policies!'
  END as status
FROM pg_policies 
WHERE tablename LIKE 'professional%';

-- List all professional policies
SELECT 
  tablename as "Table",
  policyname as "Policy Name",
  cmd as "Operation",
  '✅' as "Status"
FROM pg_policies 
WHERE tablename LIKE 'professional%'
ORDER BY tablename, cmd;

-- =====================================================
-- 4. CHECK STORAGE BUCKET
-- =====================================================
SELECT 
  '✅ Storage Bucket Check' as check_type,
  COUNT(*) as buckets_found,
  CASE 
    WHEN COUNT(*) >= 1 THEN '✅ Storage bucket exists'
    ELSE '⚠️  Create "professional-images" bucket manually'
  END as status
FROM storage.buckets 
WHERE id = 'professional-images';

-- =====================================================
-- 5. CHECK INDEXES
-- =====================================================
SELECT 
  '✅ Indexes Check' as check_type,
  COUNT(*) as indexes_found,
  CASE 
    WHEN COUNT(*) >= 8 THEN '✅ Indexes created'
    ELSE '⚠️  Some indexes missing'
  END as status
FROM pg_indexes 
WHERE tablename LIKE 'professional%';

-- =====================================================
-- 6. TEST AUTHENTICATION FUNCTION
-- =====================================================
-- This will test if the authentication function works
-- It should return your user_id if you're logged in
SELECT 
  '✅ Auth Function Test' as check_type,
  get_user_id_from_token() as your_user_id,
  CASE 
    WHEN get_user_id_from_token() IS NOT NULL THEN '✅ Authentication working'
    ELSE '⚠️  Make sure you''re logged in with x-client-token'
  END as status;

-- =====================================================
-- 7. SUMMARY
-- =====================================================
SELECT 
  '═════════════════════════════════' as "═══════════════════════════════════════════",
  'MIGRATION VERIFICATION COMPLETE' as "SUMMARY",
  '═════════════════════════════════' as "════════════════════════════════════════════";

-- Final check - everything should be ready
SELECT 
  CASE 
    WHEN 
      (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'professional%') = 4
      AND (SELECT COUNT(*) FROM pg_proc WHERE proname = 'get_user_id_from_token') >= 1
      AND (SELECT COUNT(*) FROM pg_policies WHERE tablename LIKE 'professional%') >= 10
    THEN '✅✅✅ ALL CHECKS PASSED - PROFESSIONALS MODULE READY! ✅✅✅'
    ELSE '❌ SOME CHECKS FAILED - Review the output above'
  END as final_status;

-- =====================================================
-- NEXT STEPS IF ALL CHECKS PASS:
-- =====================================================
-- 1. Refresh your LocalFelo app
-- 2. Navigate to Professionals section
-- 3. Try registering as a professional
-- 4. It should work without errors!
-- =====================================================
