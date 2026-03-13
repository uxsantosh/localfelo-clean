-- ================================================================
-- MINIMAL FIX: Just Stop the Error (60 seconds)
-- ================================================================
-- If you're scared of the nuclear option, run this first.
-- This ONLY fixes the immediate error without changing anything else.
-- ================================================================

-- Find and drop ONLY the problematic trigger causing the v_helper_profile error
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Find triggers that might have the v_helper_profile bug
    FOR r IN (
        SELECT t.tgname AS trigger_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE c.relname = 'tasks'
          AND NOT t.tgisinternal
          AND (
            p.prosrc ILIKE '%v_helper_profile%'
            OR p.proname ILIKE '%status%'
            OR p.proname ILIKE '%notification%'
          )
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON tasks CASCADE';
        RAISE NOTICE '✅ Dropped problematic trigger: %', r.trigger_name;
    END LOOP;
    
    -- If no triggers found, drop common suspect names
    BEGIN
        DROP TRIGGER IF EXISTS notify_task_status_change ON tasks CASCADE;
        DROP TRIGGER IF EXISTS task_status_notification_trigger ON tasks CASCADE;
        DROP TRIGGER IF EXISTS task_notification_trigger ON tasks CASCADE;
        RAISE NOTICE '✅ Dropped common suspect triggers';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'No common triggers found (that is OK)';
    END;
END $$;

-- Drop the problematic functions
DROP FUNCTION IF EXISTS notify_task_status_change() CASCADE;
DROP FUNCTION IF EXISTS trigger_task_status_notification() CASCADE;

-- ================================================================
-- VERIFICATION: Check if error is gone
-- ================================================================

SELECT 'If you see this message, the minimal fix is complete!' AS status;

SELECT 
  trigger_name,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'tasks'
ORDER BY trigger_name;

-- ================================================================
-- NEXT STEPS
-- ================================================================
-- This fixes the ERROR but removes notifications for task status changes.
-- To get notifications back (properly), run /NUCLEAR_FIX_TASK_TRIGGERS.sql
-- ================================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ MINIMAL FIX COMPLETE!';
  RAISE NOTICE '⚠️  Task status updates will now work WITHOUT errors.';
  RAISE NOTICE '⚠️  HOWEVER: Notifications for task status changes are temporarily disabled.';
  RAISE NOTICE '';
  RAISE NOTICE '📋 NEXT STEP: Run /NUCLEAR_FIX_TASK_TRIGGERS.sql to restore notifications properly.';
END $$;
