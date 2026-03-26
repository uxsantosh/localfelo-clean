-- =====================================================
-- CHAT FEATURE DEBUG SCRIPT
-- =====================================================
-- Run this to see what's happening with your chat data
-- This helps debug issues with conversations not appearing

-- =====================================================
-- 1. CHECK IF HELPER FUNCTION EXISTS
-- =====================================================
SELECT 
  'Helper Function:' as check_type,
  proname as function_name,
  '✅ EXISTS' as status
FROM pg_proc
WHERE proname = 'is_user_id_match'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- =====================================================
-- 2. SHOW ALL CONVERSATIONS (RAW DATA)
-- =====================================================
SELECT 
  '═══════════════════════════════════════' as separator,
  'ALL CONVERSATIONS IN DATABASE' as section;

SELECT 
  id,
  listing_title,
  buyer_id,
  buyer_name,
  seller_id,
  seller_name,
  last_message,
  created_at
FROM public.conversations
ORDER BY created_at DESC
LIMIT 20;

-- =====================================================
-- 3. SHOW ALL MESSAGES (RAW DATA)
-- =====================================================
SELECT 
  '═══════════════════════════════════════' as separator,
  'ALL MESSAGES IN DATABASE' as section;

SELECT 
  m.id,
  c.listing_title as conversation,
  m.sender_name,
  m.content,
  m.read,
  m.created_at
FROM public.messages m
JOIN public.conversations c ON c.id = m.conversation_id
ORDER BY m.created_at DESC
LIMIT 50;

-- =====================================================
-- 4. SHOW CONVERSATION COUNTS PER USER
-- =====================================================
SELECT 
  '═══════════════════════════════════════' as separator,
  'CONVERSATIONS PER USER' as section;

SELECT 
  user_id,
  user_name,
  role,
  COUNT(*) as conversation_count
FROM (
  SELECT buyer_id as user_id, buyer_name as user_name, 'buyer' as role
  FROM public.conversations
  UNION ALL
  SELECT seller_id as user_id, seller_name as user_name, 'seller' as role
  FROM public.conversations
) AS user_conversations
GROUP BY user_id, user_name, role
ORDER BY conversation_count DESC;

-- =====================================================
-- 5. SHOW MESSAGE COUNTS PER CONVERSATION
-- =====================================================
SELECT 
  '═══════════════════════════════════════' as separator,
  'MESSAGES PER CONVERSATION' as section;

SELECT 
  c.id as conversation_id,
  c.listing_title,
  c.buyer_name,
  c.seller_name,
  COUNT(m.id) as message_count,
  COUNT(CASE WHEN m.read = false THEN 1 END) as unread_count
FROM public.conversations c
LEFT JOIN public.messages m ON m.conversation_id = c.id
GROUP BY c.id, c.listing_title, c.buyer_name, c.seller_name
ORDER BY message_count DESC;

-- =====================================================
-- 6. CHECK CURRENT USER'S AUTH ID
-- =====================================================
SELECT 
  '═══════════════════════════════════════' as separator,
  'YOUR CURRENT AUTH STATUS' as section;

SELECT 
  'Current auth.uid():' as info,
  COALESCE(auth.uid()::TEXT, 'NOT AUTHENTICATED') as value;

-- =====================================================
-- 7. CHECK IF CURRENT USER HAS A PROFILE
-- =====================================================
SELECT 
  '═══════════════════════════════════════' as separator,
  'YOUR PROFILE INFO' as section;

SELECT 
  id::TEXT as profile_id,
  auth_user_id::TEXT as auth_user_id,
  client_token as client_token,
  owner_token as owner_token,
  name,
  email
FROM profiles
WHERE auth_user_id = auth.uid()
LIMIT 1;

-- =====================================================
-- 8. TEST HELPER FUNCTION WITH CURRENT USER
-- =====================================================
SELECT 
  '═══════════════════════════════════════' as separator,
  'TEST HELPER FUNCTION' as section;

-- This will test if the helper function works with your current user's IDs
SELECT 
  test_id,
  CASE 
    WHEN is_user_id_match(test_id) THEN '✅ MATCH'
    ELSE '❌ NO MATCH'
  END as result
FROM (
  SELECT 
    auth.uid()::TEXT as test_id
  WHERE auth.uid() IS NOT NULL
  UNION ALL
  SELECT 
    id::TEXT
  FROM profiles
  WHERE auth_user_id = auth.uid()
  UNION ALL
  SELECT 
    client_token
  FROM profiles
  WHERE auth_user_id = auth.uid()
  UNION ALL
  SELECT 
    owner_token
  FROM profiles
  WHERE auth_user_id = auth.uid()
) AS test_data;

-- =====================================================
-- 9. FIND ORPHANED DATA
-- =====================================================
SELECT 
  '═══════════════════════════════════════' as separator,
  'ORPHANED DATA CHECK' as section;

-- Messages without conversations (should be 0)
SELECT 
  'Orphaned Messages:' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ NONE'
    ELSE '⚠️ FOUND ORPHANS'
  END as status
FROM public.messages m
WHERE NOT EXISTS (
  SELECT 1 FROM public.conversations c WHERE c.id = m.conversation_id
);

-- =====================================================
-- 10. CHECK REALTIME SUBSCRIPTION STATUS
-- =====================================================
SELECT 
  '═══════════════════════════════════════' as separator,
  'REALTIME STATUS' as section;

SELECT 
  tablename,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = t.tablename
    ) THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as realtime_status
FROM (
  VALUES ('conversations'), ('messages')
) AS t(tablename);

-- =====================================================
-- DONE
-- =====================================================
SELECT 
  '═══════════════════════════════════════' as separator,
  'DEBUG COMPLETE' as status,
  'Review the results above' as instruction;
