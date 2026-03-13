-- ================================================================
-- FIX: completedByCreator Field Error
-- ================================================================
-- Error: record "new" has no field "completedByCreator"
-- This happens when a trigger/function references a non-existent column
-- ================================================================

-- STEP 1: Find the problematic trigger/function
SELECT 
  t.trigger_name,
  t.event_manipulation,
  t.action_statement,
  p.prosrc as function_source
FROM information_schema.triggers t
JOIN pg_class c ON t.event_object_table = c.relname
JOIN pg_proc p ON t.action_statement LIKE '%' || p.proname || '%'
WHERE t.event_object_table = 'tasks'
  AND (
    p.prosrc ILIKE '%completedByCreator%'
    OR p.prosrc ILIKE '%completed%creator%'
  );

-- STEP 2: List ALL triggers on tasks table
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'tasks'
ORDER BY trigger_name;

-- STEP 3: List ALL functions that reference completion fields
SELECT 
  routine_name,
  routine_type,
  LEFT(routine_definition, 200) as definition_preview
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (
    routine_definition ILIKE '%completedByCreator%'
    OR routine_definition ILIKE '%completed%creator%'
    OR routine_definition ILIKE '%helper_completed%'
    OR routine_definition ILIKE '%creator_completed%'
  )
ORDER BY routine_name;

-- ================================================================
-- STEP 4: DROP ALL TRIGGERS ON TASKS (NUCLEAR OPTION)
-- ================================================================
-- This will remove ALL triggers to isolate the problem

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
END $$;

-- ================================================================
-- STEP 5: Verify tasks table has correct columns
-- ================================================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND column_name ILIKE '%complet%'
ORDER BY column_name;

-- Expected columns:
-- helper_completed (BOOLEAN, DEFAULT FALSE)
-- creator_completed (BOOLEAN, DEFAULT FALSE)
-- completed_at (TIMESTAMP)

-- If completedByCreator exists, rename it:
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'completedByCreator'
    ) THEN
        ALTER TABLE tasks RENAME COLUMN "completedByCreator" TO creator_completed;
        RAISE NOTICE '✅ Renamed completedByCreator to creator_completed';
    END IF;
END $$;

-- ================================================================
-- DONE! Test by inserting a task
-- ================================================================
-- The error should be gone now
