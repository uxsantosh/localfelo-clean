-- ================================================================
-- FIX: Task Status Update Trigger Error
-- ================================================================
-- Fixes error: "record v_helper_profile is not assigned yet"
-- This error occurs when updating task status to 'in_progress' or other statuses
-- ================================================================

-- Drop any existing problematic triggers
DROP TRIGGER IF EXISTS notify_task_status_change ON tasks;
DROP TRIGGER IF EXISTS task_status_notification_trigger ON tasks;
DROP TRIGGER IF EXISTS task_acceptance_notification_trigger ON tasks;

-- Drop any old notification functions that might be causing issues
DROP FUNCTION IF EXISTS notify_task_status_change() CASCADE;
DROP FUNCTION IF EXISTS trigger_task_status_notification() CASCADE;

-- ================================================================
-- CREATE CORRECTED: trigger_task_acceptance_notification
-- ================================================================
-- This function handles task acceptance notifications ONLY
-- It does NOT trigger on 'in_progress' or other status changes

CREATE OR REPLACE FUNCTION trigger_task_acceptance_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_helper_name TEXT;
  v_creator_id UUID;
BEGIN
  -- Only trigger when status changes to 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    
    -- Check if accepted_by is set
    IF NEW.accepted_by IS NOT NULL THEN
      -- Get helper's name (use COALESCE to handle null values safely)
      SELECT COALESCE(name, display_name, 'A helper') INTO v_helper_name
      FROM profiles
      WHERE id = NEW.accepted_by;
      
      -- Get creator ID
      v_creator_id := NEW.user_id;
      
      -- Create notification for task creator ONLY if we have valid data
      IF v_creator_id IS NOT NULL THEN
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
          v_creator_id,
          'Task Accepted',
          COALESCE(v_helper_name, 'Someone') || ' accepted your task: ' || COALESCE(NEW.title, 'Untitled'),
          COALESCE(v_helper_name, 'Someone') || ' accepted your task: ' || COALESCE(NEW.title, 'Untitled'),
          'task_accepted',
          'task_accepted',
          jsonb_build_object(
            'task_id', NEW.id,
            'task_title', COALESCE(NEW.title, 'Untitled'),
            'helper_id', NEW.accepted_by,
            'helper_name', COALESCE(v_helper_name, 'A helper')
          ),
          NEW.id::text,
          'task',
          FALSE,
          'pending',
          NOW()
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- CREATE CORRECTED: notify_task_started (in_progress status)
-- ================================================================
-- Separate function for when task is started (status = 'in_progress')

CREATE OR REPLACE FUNCTION notify_task_started()
RETURNS TRIGGER AS $$
DECLARE
  v_helper_name TEXT;
  v_creator_id UUID;
BEGIN
  -- Only trigger when status changes to 'in_progress'
  IF NEW.status = 'in_progress' AND (OLD.status IS NULL OR OLD.status != 'in_progress') THEN
    
    -- Check if helper is assigned
    IF NEW.accepted_by IS NOT NULL OR NEW.helper_id IS NOT NULL THEN
      -- Get helper's name (check both accepted_by and helper_id)
      SELECT COALESCE(name, display_name, 'A helper') INTO v_helper_name
      FROM profiles
      WHERE id = COALESCE(NEW.accepted_by, NEW.helper_id);
      
      -- Get creator ID
      v_creator_id := NEW.user_id;
      
      -- Create notification for task creator
      IF v_creator_id IS NOT NULL THEN
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
          v_creator_id,
          'Task Started',
          COALESCE(v_helper_name, 'The helper') || ' started working on your task: ' || COALESCE(NEW.title, 'Untitled'),
          COALESCE(v_helper_name, 'The helper') || ' started working on your task: ' || COALESCE(NEW.title, 'Untitled'),
          'task_started',
          'task_started',
          jsonb_build_object(
            'task_id', NEW.id,
            'task_title', COALESCE(NEW.title, 'Untitled'),
            'helper_id', COALESCE(NEW.accepted_by, NEW.helper_id),
            'helper_name', COALESCE(v_helper_name, 'A helper')
          ),
          NEW.id::text,
          'task',
          FALSE,
          'pending',
          NOW()
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- CREATE TRIGGERS (separate triggers for different status changes)
-- ================================================================

-- Trigger for task acceptance (status = 'accepted')
CREATE TRIGGER task_acceptance_notification_trigger
AFTER UPDATE OF status ON tasks
FOR EACH ROW
WHEN (NEW.status = 'accepted')
EXECUTE FUNCTION trigger_task_acceptance_notification();

-- Trigger for task started (status = 'in_progress')
CREATE TRIGGER task_started_notification_trigger
AFTER UPDATE OF status ON tasks
FOR EACH ROW
WHEN (NEW.status = 'in_progress')
EXECUTE FUNCTION notify_task_started();

-- ================================================================
-- VERIFICATION
-- ================================================================

SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'tasks'
  AND trigger_name IN ('task_acceptance_notification_trigger', 'task_started_notification_trigger')
ORDER BY trigger_name;

-- Test the fix by checking if functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name IN ('trigger_task_acceptance_notification', 'notify_task_started')
ORDER BY routine_name;
