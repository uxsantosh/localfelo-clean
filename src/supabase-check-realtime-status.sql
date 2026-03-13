-- =====================================================
-- CHECK REALTIME PUBLICATION AND GRANT PERMISSIONS
-- =====================================================

-- 1. Check if tables are in realtime publication
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 2. Check current permissions on messages table
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'messages'
ORDER BY grantee, privilege_type;

-- 3. Grant all necessary permissions explicitly
GRANT ALL ON messages TO anon, authenticated, postgres;
GRANT ALL ON conversations TO anon, authenticated, postgres;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 4. Ensure tables are in the realtime publication
-- First, check if they need to be added
DO $$
BEGIN
  -- Add messages to publication if not already there
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    RAISE NOTICE '✅ Added messages table to supabase_realtime publication';
  ELSE
    RAISE NOTICE '✅ messages table already in supabase_realtime publication';
  END IF;

  -- Add conversations to publication if not already there
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
    RAISE NOTICE '✅ Added conversations table to supabase_realtime publication';
  ELSE
    RAISE NOTICE '✅ conversations table already in supabase_realtime publication';
  END IF;
END $$;

-- 5. Verify replica identity is FULL
SELECT 
  c.relname as table_name,
  CASE c.relreplident
    WHEN 'd' THEN 'default ❌ (should be FULL)'
    WHEN 'f' THEN 'full ✅'
    WHEN 'n' THEN 'nothing ❌'
    WHEN 'i' THEN 'index'
  END as replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('messages', 'conversations')
  AND c.relkind = 'r';

SELECT '✅ Configuration check complete!' as status;
