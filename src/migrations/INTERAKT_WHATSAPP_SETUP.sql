=====================================

-- Function to get user's phone number
CREATE OR REPLACE FUNCTION get_user_phone(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_phone TEXT;
BEGIN
  SELECT phone INTO user_phone
  FROM profiles
  WHERE id = user_uuid;
  
  RETURN user_phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send WhatsApp notification (calls edge function via HTTP)
CREATE OR REPLACE FUNCTION send_whatsapp_via_interakt(
  p_phone_number TEXT,
  p_template_name TEXT,
  p_variables JSONB,
  p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_response JSONB;
BEGIN
  -- Log the notification attempt
  INSERT INTO whatsapp_notifications (user_id, phone_number, template_name, variables, status)
  VALUES (p_user_id, p_phone_number, p_template_name, p_variables, 'pending');
  
  -- The actual sending is done by the edge function via client-side or trigger
  -- This function just logs the attempt
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  -- Log error
  INSERT INTO whatsapp_notifications (user_id, phone_number, template_name, variables, status, error_message)
  VALUES (p_user_id, p_phone_number, p_template_name, p_variables, 'failed', SQLERRM);
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TASK NOTIFICATION TRIGGERS
-- =====================================================

-- Function to notify when task is accepted
CREATE OR REPLACE FUNCTION notify_task_accepted()
RETURNS TRIGGER AS $$
DECLARE
  v_task_creator_phone TEXT;
  v_task_creator_name TEXT;
  v_helper_name TEXT;
  v_task_title TEXT;
  v_task_price NUMERIC;
BEGIN
  -- Only trigger when status changes to 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Get task creator's phone and name
    SELECT phone, name INTO v_task_creator_phone, v_task_creator_name
    FROM profiles
    WHERE id = NEW.user_id;
    
    -- Get helper's name
    SELECT name INTO v_helper_name
    FROM profiles
    WHERE id = NEW."acceptedBy";
    
    v_task_title := NEW.title;
    v_task_price := NEW."acceptedPrice";
    
    -- Only send if phone number exists
    IF v_task_creator_phone IS NOT NULL AND v_task_creator_phone != '' THEN
      PERFORM send_whatsapp_via_interakt(
        v_task_creator_phone,
        'task_accepted',
        jsonb_build_object(
          'customer_name', COALESCE(v_task_creator_name, 'User'),
          'helper_name', COALESCE(v_helper_name, 'Helper'),
          'task_title', v_task_title,
          'task_price', '₹' || COALESCE(v_task_price::TEXT, '0')
        ),
        NEW.user_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for task accepted
DROP TRIGGER IF EXISTS trigger_task_accepted ON tasks;
CREATE TRIGGER trigger_task_accepted
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_accepted();

-- Function to notify when task is cancelled
CREATE OR REPLACE FUNCTION notify_task_cancelled()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_phone TEXT;
  v_recipient_name TEXT;
  v_cancelled_by_name TEXT;
  v_notify_user_id UUID;
BEGIN
  -- Only trigger when status changes to 'cancelled'
  IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    -- Determine who to notify (the other party)
    IF NEW."cancelledBy" = NEW.user_id THEN
      -- Creator cancelled, notify helper
      v_notify_user_id := NEW."acceptedBy";
    ELSE
      -- Helper cancelled, notify creator
      v_notify_user_id := NEW.user_id;
    END IF;
    
    -- Get recipient's phone and name
    SELECT phone, name INTO v_recipient_phone, v_recipient_name
    FROM profiles
    WHERE id = v_notify_user_id;
    
    -- Get canceller's name
    SELECT name INTO v_cancelled_by_name
    FROM profiles
    WHERE id = NEW."cancelledBy";
    
    -- Send notification if phone exists
    IF v_recipient_phone IS NOT NULL AND v_recipient_phone != '' THEN
      PERFORM send_whatsapp_via_interakt(
        v_recipient_phone,
        'task_cancelled',
        jsonb_build_object(
          'customer_name', COALESCE(v_recipient_name, 'User'),
          'task_title', NEW.title,
          'cancelled_by', COALESCE(v_cancelled_by_name, 'User')
        ),
        v_notify_user_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for task cancelled
DROP TRIGGER IF EXISTS trigger_task_cancelled ON tasks;
CREATE TRIGGER trigger_task_cancelled
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_cancelled();

-- Function to notify when task is completed
CREATE OR REPLACE FUNCTION notify_task_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_task_creator_phone TEXT;
  v_task_creator_name TEXT;
  v_helper_name TEXT;
BEGIN
  -- Only trigger when both parties mark as completed
  IF NEW."completedByCreator" = TRUE AND NEW."completedByHelper" = TRUE 
     AND NEW.status = 'completed'
     AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Get task creator's details
    SELECT phone, name INTO v_task_creator_phone, v_task_creator_name
    FROM profiles
    WHERE id = NEW.user_id;
    
    -- Get helper's name
    SELECT name INTO v_helper_name
    FROM profiles
    WHERE id = NEW."acceptedBy";
    
    -- Send notification
    IF v_task_creator_phone IS NOT NULL AND v_task_creator_phone != '' THEN
      PERFORM send_whatsapp_via_interakt(
        v_task_creator_phone,
        'task_completed',
        jsonb_build_object(
          'customer_name', COALESCE(v_task_creator_name, 'User'),
          'helper_name', COALESCE(v_helper_name, 'Helper'),
          'task_title', NEW.title,
          'task_price', '₹' || COALESCE(NEW."acceptedPrice"::TEXT, '0')
        ),
        NEW.user_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for task completed
DROP TRIGGER IF EXISTS trigger_task_completed ON tasks;
CREATE TRIGGER trigger_task_completed
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_completed();

-- =====================================================
-- CHAT NOTIFICATION TRIGGERS
-- =====================================================

-- Function to notify on first chat message
CREATE OR REPLACE FUNCTION notify_first_chat_message()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
  v_recipient_phone TEXT;
  v_recipient_name TEXT;
  v_sender_name TEXT;
  v_listing_title TEXT;
  v_listing_type TEXT;
  v_message_count INTEGER;
  v_last_message_time TIMESTAMPTZ;
  v_time_gap_hours INTEGER;
BEGIN
  -- Determine recipient (the user who is NOT the sender)
  SELECT 
    CASE 
      WHEN NEW.sender_id = c.user1_id THEN c.user2_id
      ELSE c.user1_id
    END,
    c.listing_title,
    c.listing_type
  INTO v_recipient_id, v_listing_title, v_listing_type
  FROM conversations c
  WHERE c.id = NEW.conversation_id;
  
  -- Get recipient's phone and name
  SELECT phone, name INTO v_recipient_phone, v_recipient_name
  FROM profiles
  WHERE id = v_recipient_id;
  
  -- Get sender's name
  SELECT name INTO v_sender_name
  FROM profiles
  WHERE id = NEW.sender_id;
  
  -- Check if this is the first message in conversation
  SELECT COUNT(*), MAX(created_at)
  INTO v_message_count, v_last_message_time
  FROM messages
  WHERE conversation_id = NEW.conversation_id
    AND sender_id = NEW.sender_id
    AND id != NEW.id;
  
  -- Send notification if phone exists
  IF v_recipient_phone IS NOT NULL AND v_recipient_phone != '' THEN
    IF v_message_count = 0 THEN
      -- First message ever
      PERFORM send_whatsapp_via_interakt(
        v_recipient_phone,
        'first_message',
        jsonb_build_object(
          'customer_name', COALESCE(v_recipient_name, 'User'),
          'sender_name', COALESCE(v_sender_name, 'Someone'),
          'listing_title', COALESCE(v_listing_title, 'a listing'),
          'message_preview', LEFT(NEW.content, 100),
          'listing_type', COALESCE(v_listing_type, 'item')
        ),
        v_recipient_id
      );
    ELSIF v_last_message_time IS NOT NULL THEN
      -- Check if message is after long gap (24+ hours)
      v_time_gap_hours := EXTRACT(EPOCH FROM (NOW() - v_last_message_time)) / 3600;
      
      IF v_time_gap_hours >= 24 THEN
        PERFORM send_whatsapp_via_interakt(
          v_recipient_phone,
          'message_after_gap',
          jsonb_build_object(
            'customer_name', COALESCE(v_recipient_name, 'User'),
            'sender_name', COALESCE(v_sender_name, 'Someone'),
            'listing_title', COALESCE(v_listing_title, 'a listing'),
            'message_preview', LEFT(NEW.content, 100)
          ),
          v_recipient_id
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for chat messages
DROP TRIGGER IF EXISTS trigger_first_chat_message ON messages;
CREATE TRIGGER trigger_first_chat_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_first_chat_message();

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant necessary permissions
GRANT SELECT, INSERT ON whatsapp_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_phone(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION send_whatsapp_via_interakt(TEXT, TEXT, JSONB, UUID) TO authenticated;

-- Grant to service role for triggers
GRANT ALL ON whatsapp_notifications TO service_role;

-- =====================================================
-- NOTES
-- =====================================================

-- To manually send a WhatsApp notification from SQL:
-- SELECT send_whatsapp_via_interakt(
--   '919876543210',
--   'task_accepted',
--   '{"customer_name": "John", "helper_name": "Jane", "task_title": "Clean house", "task_price": "₹500"}',
--   'user-uuid-here'
-- );

COMMIT;
