-- ================================================================
-- CORRECTED: All Task Functions Using Actual Notifications Schema
-- ================================================================
-- Uses: title, body, notification_type, data (JSONB), is_read
-- NO sender_id - stores sender info in data JSONB instead
-- ================================================================

-- ============================================================
-- FIX: auto_complete_task_on_dual_confirmation
-- ============================================================

CREATE OR REPLACE FUNCTION auto_complete_task_on_dual_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- When both creator and helper mark as completed, auto-complete the task
  IF NEW.creator_completed = TRUE AND NEW.helper_completed = TRUE THEN
    IF NEW.status != 'completed' THEN
      NEW.status := 'completed';
      NEW.completed_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FIX: update_tasks_updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FIX: update_updated_at_column
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FIX: trigger_task_acceptance_notification
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_task_acceptance_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_helper_name TEXT;
  v_creator_id UUID;
BEGIN
  -- Only trigger when status changes to 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    
    -- Get helper's name
    SELECT name INTO v_helper_name
    FROM profiles
    WHERE id = NEW.accepted_by;
    
    -- Get creator ID
    v_creator_id := NEW.user_id;
    
    -- Create notification for task creator
    IF v_creator_id IS NOT NULL AND v_helper_name IS NOT NULL THEN
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
        v_helper_name || ' accepted your task: ' || NEW.title,
        v_helper_name || ' accepted your task: ' || NEW.title,
        'task_accepted',
        'task_accepted',
        jsonb_build_object(
          'task_id', NEW.id,
          'task_title', NEW.title,
          'helper_id', NEW.accepted_by,
          'helper_name', v_helper_name
        ),
        NEW.id::text,
        'task',
        FALSE,
        'pending',
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FIX: notify_task_cancelled
-- ============================================================

CREATE OR REPLACE FUNCTION notify_task_cancelled()
RETURNS TRIGGER AS $$
DECLARE
  v_creator_name TEXT;
  v_recipient_id UUID;
BEGIN
  -- Only trigger when status changes to 'cancelled'
  IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    
    -- Get creator's name
    SELECT name INTO v_creator_name
    FROM profiles
    WHERE id = NEW.user_id;
    
    -- Notify the helper if task was accepted
    IF NEW.accepted_by IS NOT NULL THEN
      v_recipient_id := NEW.accepted_by;
      
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
        v_recipient_id,
        'Task Cancelled',
        v_creator_name || ' cancelled the task: ' || NEW.title,
        v_creator_name || ' cancelled the task: ' || NEW.title,
        'task_cancelled',
        'task_cancelled',
        jsonb_build_object(
          'task_id', NEW.id,
          'task_title', NEW.title,
          'creator_id', NEW.user_id,
          'creator_name', v_creator_name
        ),
        NEW.id::text,
        'task',
        FALSE,
        'pending',
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FIX: notify_task_completed
-- ============================================================

CREATE OR REPLACE FUNCTION notify_task_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_task_owner_id UUID;
  v_helper_id UUID;
  v_task_title TEXT;
  v_helper_name TEXT;
  v_owner_name TEXT;
BEGIN
  -- Only trigger when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    v_task_owner_id := NEW.user_id;
    v_helper_id := NEW.accepted_by;
    v_task_title := NEW.title;

    -- Get names
    SELECT name INTO v_helper_name FROM profiles WHERE id = v_helper_id;
    SELECT name INTO v_owner_name FROM profiles WHERE id = v_task_owner_id;

    -- Notify task owner
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
      v_task_owner_id,
      'Task Completed!',
      v_helper_name || ' has marked your task as completed: ' || v_task_title,
      v_helper_name || ' has marked your task as completed: ' || v_task_title,
      'task_completed',
      'task_completed',
      jsonb_build_object(
        'task_id', NEW.id,
        'task_title', v_task_title,
        'helper_id', v_helper_id,
        'helper_name', v_helper_name
      ),
      NEW.id::text,
      'task',
      FALSE,
      'pending',
      NOW()
    );

    -- Also notify helper
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
      v_helper_id,
      'Task Completed!',
      'You have successfully completed: ' || v_task_title,
      'You have successfully completed: ' || v_task_title,
      'task_completed',
      'task_completed',
      jsonb_build_object(
        'task_id', NEW.id,
        'task_title', v_task_title,
        'owner_id', v_task_owner_id,
        'owner_name', v_owner_name
      ),
      NEW.id::text,
      'task',
      FALSE,
      'pending',
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT '✅ SUCCESS: All task functions fixed with correct notification schema!' AS status;

-- Show all active triggers
SELECT 
  '✅ ACTIVE TRIGGERS:' AS info,
  trigger_name,
  action_timing || ' ' || event_manipulation AS when_what
FROM information_schema.triggers
WHERE event_object_table = 'tasks'
ORDER BY trigger_name;
