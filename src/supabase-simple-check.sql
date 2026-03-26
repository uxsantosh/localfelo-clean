-- =====================================================
-- SIMPLE CHECK - Different approach
-- =====================================================

-- Check if tables exist and their settings
SELECT 
  c.relname as table_name,
  c.relreplident as replica_code,
  CASE c.relreplident
    WHEN 'd' THEN 'default (BAD)'
    WHEN 'f' THEN 'full (GOOD)'
    WHEN 'n' THEN 'nothing'
    WHEN 'i' THEN 'index'
  END as replica_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('messages', 'conversations')
  AND c.relkind = 'r'
ORDER BY c.relname;
