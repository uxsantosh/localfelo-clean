-- =====================================================
-- CHECK IF DATABASE TRIGGER EXISTS
-- =====================================================
-- This trigger should call the Edge Function when a new message is created
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'messages'
ORDER BY trigger_name;

-- =====================================================

-- 2. Check if the trigger function exists
SELECT 
  proname AS function_name,
  prosrc AS function_source
FROM pg_proc
WHERE proname LIKE '%push%notification%'
   OR proname LIKE '%send%notification%';

-- =====================================================
-- EXPECTED RESULT:
-- =====================================================
-- You should see a trigger like:
--   - trigger_name: notify_new_message_trigger (or similar)
--   - event_manipulation: INSERT
--   - event_object_table: messages
--   - action_statement: EXECUTE FUNCTION notify_new_message()
--
-- If you see NO RESULTS, the trigger doesn't exist!
-- That's why the Edge Function never gets called.
-- =====================================================
