-- ================================================================
-- NUCLEAR FIX: Remove ALL Task Triggers and Rebuild Clean
-- ================================================================
-- This script completely removes all task-related triggers and
-- rebuilds them correctly without the v_helper_profile error
-- ================================================================

-- ============================================================
-- STEP 1: DROP ALL EXISTING TASK TRIGGERS (NUCLEAR OPTION)
-- ============================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all triggers on tasks table
    FOR r IN (
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'tasks'
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON tasks CASCADE';
        RAISE NOTICE 'Dropped trigger: %', r.trigger_name;
    END LOOP;
END $$;

-- ============================================================
-- STEP 2: DROP ALL PROBLEMATIC FUNCTIONS
-- ============================================================

DROP FUNCTION IF EXISTS notify_task_status_change() CASCADE;
DROP FUNCTION IF EXISTS trigger_task_status_notification() CASCADE;
DROP FUNCTION IF EXISTS notify_task_acceptance() CASCADE;
DROP FUNCTION IF EXISTS notify_task_accepted() CASCADE;
DROP FUNCTION IF EXISTS trigger_task_acceptance_notification() CASCADE;
DROP FUNCTION IF EXISTS notify_task_started() CASCADE;
DROP FUNCTION IF EXISTS notify_task_cancelled() CASCADE;
DROP FUNCTION IF EXISTS notify_task_completed() CASCADE;
DROP FUNCTION IF EXISTS send_task_notification() CASCADE;

-- ============================================================
-- STEP 3: CREATE SIMPLE, SAFE NOTIFICATION FUNCTIONS
-- ============================================================

-- Function 1: Task Acceptance Notification
CREATE OR REPLACE FUNCTION notify_task_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  helper_name TEXT := 'A helper';
  creator_id UUID;
BEGIN
  -- Only run when status changes TO 'accepted'
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
    
    -- Safely get helper name (don't fail if profile doesn't exist)
    IF NEW.accepted_by IS NOT NULL THEN
      BEGIN
        SELECT COALESCE(name, display_name, 'A helper') INTO helper_name
        FROM profiles
        WHERE id = NEW.accepted_by;
      EXCEPTION WHEN OTHERS THEN
        helper_name := 'A helper';
      END;
    END IF;
    
    -- Get creator ID
    creator_id := NEW.user_id;
    
    -- Create notification (only if creator exists)
    IF creator_id IS NOT NULL THEN
      BEGIN
        INSERT INTO notifications (
          user_id,
          title,
          body,
          message,
          notification_type,
          type,
          data,
          related_id,
          related_type,
          is_read,
          status,
          created_at
        ) VALUES (
          creator_id,
          'Task Accepted',
          helper_name || ' accepted your task',
          helper_name || ' accepted your task: ' || COALESCE(NEW.title, 'Untitled'),
          'task_accepted',
          'task_accepted',
          jsonb_build_object(
            'task_id', NEW.id,
            'task_title', COALESCE(NEW.title, 'Untitled'),
            'helper_id', NEW.accepted_by
          ),
          NEW.id::text,
          'task',
          FALSE,
          'pending',
          NOW()
        );
      EXCEPTION WHEN OTHERS THEN
        -- Silently fail if notification insert fails
        RAISE NOTICE 'Failed to create task acceptance notification';
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Task Started Notification (in_progress)
CREATE OR REPLACE FUNCTION notify_task_in_progress()
RETURNS TRIGGER AS $$
DECLARE
  helper_name TEXT := 'The helper';
  creator_id UUID;
BEGIN
  -- Only run when status changes TO 'in_progress'
  IF NEW.status = 'in_progress' AND (OLD IS NULL OR OLD.status != 'in_progress') THEN
    
    -- Safely get helper name
    IF NEW.accepted_by IS NOT NULL OR NEW.helper_id IS NOT NULL THEN
      BEGIN
        SELECT COALESCE(name, display_name, 'The helper') INTO helper_name
        FROM profiles
        WHERE id = COALESCE(NEW.accepted_by, NEW.helper_id);
      EXCEPTION WHEN OTHERS THEN
        helper_name := 'The helper';
      END;
    END IF;
    
    -- Get creator ID
    creator_id := NEW.user_id;
    
    -- Create notification
    IF creator_id IS NOT NULL THEN
      BEGIN
        INSERT INTO notifications (
          user_id,
          title,
          body,
          message,
          notification_type,
          type,
          data,
          related_id,
          related_type,
          is_read,
          status,
          created_at
        ) VALUES (
          creator_id,
          'Task Started',
          helper_name || ' started working on your task',
          helper_name || ' started working on: ' || COALESCE(NEW.title, 'Untitled'),
          'task_started',
          'task_started',
          jsonb_build_object(
            'task_id', NEW.id,
            'task_title', COALESCE(NEW.title, 'Untitled'),
            'helper_id', COALESCE(NEW.accepted_by, NEW.helper_id)
          ),
          NEW.id::text,
          'task',
          FALSE,
          'pending',
          NOW()
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create task started notification';
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Task Cancelled Notification
CREATE OR REPLACE FUNCTION notify_task_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  creator_name TEXT := 'The task creator';
  helper_id UUID;
BEGIN
  -- Only run when status changes TO 'cancelled'
  IF NEW.status = 'cancelled' AND (OLD IS NULL OR OLD.status != 'cancelled') THEN
    
    -- Get creator name safely
    BEGIN
      SELECT COALESCE(name, display_name, 'The task creator') INTO creator_name
      FROM profiles
      WHERE id = NEW.user_id;
    EXCEPTION WHEN OTHERS THEN
      creator_name := 'The task creator';
    END;
    
    -- Notify helper if one was assigned
    helper_id := COALESCE(NEW.accepted_by, NEW.helper_id);
    
    IF helper_id IS NOT NULL THEN
      BEGIN
        INSERT INTO notifications (
          user_id,
          title,
          body,
          message,
          notification_type,
          type,
          data,
          related_id,
          related_type,
          is_read,
          status,
          created_at
        ) VALUES (
          helper_id,
          'Task Cancelled',
          'A task was cancelled',
          creator_name || ' cancelled the task: ' || COALESCE(NEW.title, 'Untitled'),
          'task_cancelled',
          'task_cancelled',
          jsonb_build_object(
            'task_id', NEW.id,
            'task_title', COALESCE(NEW.title, 'Untitled'),
            'creator_id', NEW.user_id
          ),
          NEW.id::text,
          'task',
          FALSE,
          'pending',
          NOW()
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create task cancellation notification';
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4: Task Completed Notification
CREATE OR REPLACE FUNCTION notify_task_completion()
RETURNS TRIGGER AS $$
DECLARE
  helper_name TEXT := 'The helper';
  creator_id UUID;
  helper_id UUID;
BEGIN
  -- Only run when status changes TO 'completed'
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    
    creator_id := NEW.user_id;
    helper_id := COALESCE(NEW.accepted_by, NEW.helper_id);
    
    -- Get helper name safely
    IF helper_id IS NOT NULL THEN
      BEGIN
        SELECT COALESCE(name, display_name, 'The helper') INTO helper_name
        FROM profiles
        WHERE id = helper_id;
      EXCEPTION WHEN OTHERS THEN
        helper_name := 'The helper';
      END;
    END IF;
    
    -- Notify task creator
    IF creator_id IS NOT NULL THEN
      BEGIN
        INSERT INTO notifications (
          user_id,
          title,
          body,
          message,
          notification_type,
          type,
          data,
          related_id,
          related_type,
          is_read,
          status,
          created_at
        ) VALUES (
          creator_id,
          'Task Completed',
          'Your task is complete!',
          'Task completed: ' || COALESCE(NEW.title, 'Untitled'),
          'task_completed',
          'task_completed',
          jsonb_build_object(
            'task_id', NEW.id,
            'task_title', COALESCE(NEW.title, 'Untitled'),
            'helper_id', helper_id
          ),
          NEW.id::text,
          'task',
          FALSE,
          'pending',
          NOW()
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create task completion notification';
      END;
    END IF;
    
    -- Notify helper too
    IF helper_id IS NOT NULL THEN
      BEGIN
        INSERT INTO notifications (
          user_id,
          title,
          body,
          message,
          notification_type,
          type,
          data,
          related_id,
          related_type,
          is_read,
          status,
          created_at
        ) VALUES (
          helper_id,
          'Task Completed',
          'Task marked as complete',
          'Task completed: ' || COALESCE(NEW.title, 'Untitled'),
          'task_completed',
          'task_completed',
          jsonb_build_object(
            'task_id', NEW.id,
            'task_title', COALESCE(NEW.title, 'Untitled'),
            'creator_id', creator_id
          ),
          NEW.id::text,
          'task',
          FALSE,
          'pending',
          NOW()
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create helper completion notification';
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 4: CREATE TRIGGERS (One trigger per status)
-- ============================================================

-- Trigger for 'accepted' status
CREATE TRIGGER task_accepted_trigger
AFTER UPDATE OF status ON tasks
FOR EACH ROW
WHEN (NEW.status = 'accepted')
EXECUTE FUNCTION notify_task_acceptance();

-- Trigger for 'in_progress' status
CREATE TRIGGER task_in_progress_trigger
AFTER UPDATE OF status ON tasks
FOR EACH ROW
WHEN (NEW.status = 'in_progress')
EXECUTE FUNCTION notify_task_in_progress();

-- Trigger for 'cancelled' status
CREATE TRIGGER task_cancelled_trigger
AFTER UPDATE OF status ON tasks
FOR EACH ROW
WHEN (NEW.status = 'cancelled')
EXECUTE FUNCTION notify_task_cancellation();

-- Trigger for 'completed' status
CREATE TRIGGER task_completed_trigger
AFTER UPDATE OF status ON tasks
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION notify_task_completion();

-- ============================================================
-- STEP 5: RECREATE ESSENTIAL TRIGGERS (non-notification)
-- ============================================================

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at_trigger
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_tasks_updated_at();

-- Auto-complete on dual confirmation
CREATE OR REPLACE FUNCTION auto_complete_task_on_dual_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- When both creator and helper mark as completed, auto-complete the task
  IF NEW.creator_completed = TRUE AND NEW.helper_completed = TRUE THEN
    IF NEW.status != 'completed' THEN
      NEW.status := 'completed';
      NEW.completed_at := NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_dual_completion_trigger
BEFORE UPDATE OF creator_completed, helper_completed ON tasks
FOR EACH ROW
EXECUTE FUNCTION auto_complete_task_on_dual_confirmation();

-- ============================================================
-- STEP 6: VERIFICATION
-- ============================================================

-- Show all triggers now on tasks table
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'tasks'
ORDER BY trigger_name;

-- Show all functions created
SELECT 
  routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'notify_task_acceptance',
    'notify_task_in_progress',
    'notify_task_cancellation',
    'notify_task_completion',
    'update_tasks_updated_at',
    'auto_complete_task_on_dual_confirmation'
  )
ORDER BY routine_name;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ All task triggers have been rebuilt successfully!';
  RAISE NOTICE '✅ The v_helper_profile error should be fixed now.';
END $$;
