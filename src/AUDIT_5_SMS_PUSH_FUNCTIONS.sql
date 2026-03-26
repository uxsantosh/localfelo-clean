-- ================================================================
-- COMPREHENSIVE AUDIT: All SMS and Push Related Functions
-- ================================================================
-- Shows functions related to SMS and push notifications
-- ================================================================

SELECT 
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS full_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND (
    p.proname ILIKE '%sms%' OR
    p.proname ILIKE '%push%' OR
    p.proname ILIKE '%notification%' OR
    p.proname ILIKE '%notify%'
  )
ORDER BY p.proname;
