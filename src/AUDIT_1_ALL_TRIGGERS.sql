-- ================================================================
-- COMPREHENSIVE AUDIT: All Database Triggers
-- ================================================================
-- Shows ALL triggers across ALL tables
-- ================================================================

SELECT 
  t.event_object_table AS table_name,
  t.trigger_name,
  t.action_timing || ' ' || t.event_manipulation AS when_event,
  t.action_statement AS function_called
FROM information_schema.triggers t
WHERE t.trigger_schema = 'public'
ORDER BY t.event_object_table, t.trigger_name;
