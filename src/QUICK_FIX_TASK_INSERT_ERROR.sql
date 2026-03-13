-- ================================================================
-- QUICK FIX: Remove ALL Task Triggers to Allow Insert/Update
-- ================================================================
-- Run this in Supabase SQL Editor to fix the completedByCreator error
-- ================================================================

-- Drop ALL triggers on tasks table (temporarily)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'tasks'
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON tasks CASCADE';
        RAISE NOTICE '✅ Dropped trigger: %', r.trigger_name;
    END LOOP;
    
    RAISE NOTICE '🎉 All triggers removed. You can now create/update tasks.';
END $$;

-- Verify no triggers remain
SELECT 
  'REMAINING TRIGGERS:' as status,
  COUNT(*) as count
FROM information_schema.triggers
WHERE event_object_table = 'tasks';

-- If count is 0, you're good to go! ✅
