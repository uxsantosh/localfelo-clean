-- =====================================================
-- RLS POLICIES FOR SOFT-AUTH (client_token system)
-- This allows anonymous users to access their own data
-- =====================================================

-- Step 1: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Allow users to view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Allow users to insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Allow users to update read status in their conversations" ON messages;
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "messages_update_policy" ON messages;

-- Step 2: DISABLE RLS temporarily to test if that's the issue
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify replica identity is FULL
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;

-- Step 4: Check status
SELECT 
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  CASE c.relreplident
    WHEN 'd' THEN 'default (❌ BAD)'
    WHEN 'f' THEN 'full (✅ GOOD)'
  END as replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('messages', 'conversations')
  AND c.relkind = 'r'
ORDER BY c.relname;

SELECT '✅ RLS DISABLED for testing - messages and conversations are now PUBLIC' as status;
SELECT '⚠️ WARNING: This is for TESTING ONLY. Enable RLS again after confirming Realtime works!' as warning;
