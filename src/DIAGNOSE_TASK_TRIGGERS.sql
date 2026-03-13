-- ================================================================
-- DIAGNOSTIC: Find ALL Task-Related Triggers and Functions
-- ================================================================
-- Run this first to see what's causing the v_helper_profile error
-- ================================================================

-- 1. Show ALL triggers on the tasks table
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'tasks'
ORDER BY trigger_name;

-- 2. Show ALL functions that might be related to tasks
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (
    routine_name ILIKE '%task%'
    OR routine_name ILIKE '%helper%'
    OR routine_name ILIKE '%notify%'
  )
ORDER BY routine_name;

-- 3. Check for the specific problematic function
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc
WHERE proname ILIKE '%task%'
  AND prosrc ILIKE '%v_helper_profile%';

-- 4. Show detailed trigger information
SELECT 
  t.tgname AS trigger_name,
  c.relname AS table_name,
  p.proname AS function_name,
  pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'tasks'
  AND NOT t.tgisinternal
ORDER BY t.tgname;
