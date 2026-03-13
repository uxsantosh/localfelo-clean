-- ================================================================
-- COMPREHENSIVE AUDIT: All Functions That Insert Notifications
-- ================================================================
-- Shows which functions create notifications and what columns they use
-- ================================================================

SELECT 
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS full_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND pg_get_functiondef(p.oid) ILIKE '%INSERT INTO notifications%'
ORDER BY p.proname;
