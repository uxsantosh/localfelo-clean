-- =====================================================
-- 🧪 TEST BEFORE MIGRATION
-- =====================================================
-- Run this to verify your database structure before fixing
-- =====================================================

-- Test 1: Check if tables exist
-- =====================================================
SELECT 
  '=== TABLE EXISTS CHECK ===' as test,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') as profiles_exists,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') as conversations_exists,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') as messages_exists;

-- Test 2: Check profiles columns
-- =====================================================
SELECT 
  '=== PROFILES COLUMNS ===' as test,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('id', 'client_token', 'phone', 'name')
ORDER BY column_name;

-- Test 3: Check conversations columns
-- =====================================================
SELECT 
  '=== CONVERSATIONS COLUMNS ===' as test,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN ('id', 'buyer_id', 'seller_id')
ORDER BY column_name;

-- Test 4: Check messages columns
-- =====================================================
SELECT 
  '=== MESSAGES COLUMNS ===' as test,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
  AND column_name IN ('id', 'conversation_id', 'sender_id')
ORDER BY column_name;

-- Test 5: Check current RLS status
-- =====================================================
SELECT 
  '=== RLS STATUS ===' as test,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'messages');

-- Test 6: Check current policies
-- =====================================================
SELECT 
  '=== CURRENT POLICIES ===' as test,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, policyname;

-- Test 7: Count data
-- =====================================================
SELECT 
  '=== DATA COUNT ===' as test,
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM conversations) as conversations_count,
  (SELECT COUNT(*) FROM messages) as messages_count;

-- =====================================================
-- ✅ REVIEW THE OUTPUT ABOVE
-- Then run: /🔥_ULTIMATE_FIX_ALL_CASTS.sql
-- =====================================================
