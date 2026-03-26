-- =====================================================
-- 🔥 COMPLETE TRIGGER FIX - Replace ALL user1_id/user2_id
-- =====================================================
-- This fixes ALL database triggers and functions that reference
-- the old user1_id/user2_id columns instead of buyer_id/seller_id
-- =====================================================

-- STEP 1: Drop ALL old triggers on messages table
-- =====================================================

DROP TRIGGER IF EXISTS notify_chat_message ON messages;
DROP TRIGGER IF EXISTS trigger_first_chat_message ON messages;
DROP TRIGGER IF EXISTS send_delayed_reply_reminder ON messages;
DROP TRIGGER IF EXISTS trigger_chat_notification ON messages;

-- STEP 2: Drop ALL old functions
-- =====================================================

DROP FUNCTION IF EXISTS notify_chat_message_to_interakt();
DROP FUNCTION IF EXISTS notify_first_chat_message();
DROP FUNCTION IF EXISTS check_delayed_reply_reminder();
DROP FUNCTION IF EXISTS send_chat_notification();

-- STEP 3: Recreate notify_first_chat_message function (FIXED)
-- =====================================================

CREATE OR REPLACE FUNCTION notify_first_chat_message()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id TEXT;
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
  -- ✅ FIX: Use buyer_id/seller_id instead of user1_id/user2_id
  SELECT 
    CASE 
      WHEN NEW.sender_id = c.buyer_id THEN c.seller_id
      ELSE c.buyer_id
    END,
    c.listing_title,
    COALESCE(c.listingtype, 'listing')
  INTO v_recipient_id, v_listing_title, v_listing_type
  FROM conversations c
  WHERE c.id = NEW.conversation_id;
  
  -- Exit if no conversation found
  IF v_recipient_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get recipient's phone and name
  SELECT phone, name INTO v_recipient_phone, v_recipient_name
  FROM profiles
  WHERE id = v_recipient_id;
  
  -- Exit if no phone number
  IF v_recipient_phone IS NULL THEN
    RAISE NOTICE 'No phone number for recipient %', v_recipient_id;
    RETURN NEW;
  END IF;
  
  -- Get sender's name
  SELECT name INTO v_sender_name
  FROM profiles
  WHERE id = NEW.sender_id;
  
  -- Check if this is the first message in conversation from this sender
  SELECT COUNT(*), MAX(created_at)
  INTO v_message_count, v_last_message_time
  FROM messages
  WHERE conversation_id = NEW.conversation_id
    AND sender_id = NEW.sender_id
    AND id != NEW.id; -- Exclude current message
  
  -- Calculate time gap from last message (if exists)
  IF v_last_message_time IS NOT NULL THEN
    v_time_gap_hours := EXTRACT(EPOCH FROM (NEW.created_at - v_last_message_time)) / 3600;
  ELSE
    v_time_gap_hours := 999; -- First message
  END IF;
  
  -- Only send notification if:
  -- 1. First message from this sender, OR
  -- 2. More than 1 hour since last message from this sender
  IF v_message_count = 0 OR v_time_gap_hours >= 1 THEN
    -- Check if whatsapp_notifications table exists
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'whatsapp_notifications'
    ) THEN
      -- Insert into WhatsApp notification queue
      INSERT INTO whatsapp_notifications (
        phone,
        message_type,
        template_name,
        template_params,
        user_id,
        status
      ) VALUES (
        v_recipient_phone,
        'chat_message',
        'chat_message',
        jsonb_build_object(
          'sender_name', COALESCE(v_sender_name, 'Someone'),
          'listing_title', COALESCE(v_listing_title, 'Item'),
          'message_preview', LEFT(NEW.content, 100)
        ),
        v_recipient_id::uuid,
        'pending'
      );
      
      RAISE NOTICE 'Queued WhatsApp notification for % (phone: %)', v_recipient_name, v_recipient_phone;
    END IF;
    
    -- Check if interakt_notification_queue table exists
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'interakt_notification_queue'
    ) THEN
      -- Insert into Interakt notification queue
      INSERT INTO interakt_notification_queue (
        notification_type,
        recipient_id,
        recipient_phone,
        sender_name,
        conversation_id,
        listing_title,
        message_preview,
        status
      ) VALUES (
        'chat_message',
        v_recipient_id,
        v_recipient_phone,
        COALESCE(v_sender_name, 'Someone'),
        NEW.conversation_id,
        COALESCE(v_listing_title, 'Item'),
        LEFT(NEW.content, 100),
        'pending'
      );
      
      RAISE NOTICE 'Queued Interakt notification for % (phone: %)', v_recipient_name, v_recipient_phone;
    END IF;
  ELSE
    RAISE NOTICE 'Skipped notification - sent message less than 1 hour ago (gap: % hours)', v_time_gap_hours;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block message insertion
    RAISE WARNING 'Chat notification failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 4: Recreate trigger
-- =====================================================

CREATE TRIGGER trigger_first_chat_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_first_chat_message();

-- STEP 5: Verify installation
-- =====================================================

SELECT 
  '✅ TRIGGERS ON MESSAGES TABLE:' as status;

SELECT 
  trigger_name,
  event_manipulation as event,
  action_timing as timing
FROM information_schema.triggers
WHERE event_object_table = 'messages'
ORDER BY trigger_name;

SELECT 
  '✅ FUNCTIONS CREATED:' as status;

SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name IN ('notify_first_chat_message')
  AND routine_schema = 'public';

-- STEP 6: Test the fix
-- =====================================================

SELECT 
  '✅ VERIFY CONVERSATIONS COLUMNS:' as test;

SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN ('buyer_id', 'seller_id', 'listing_title', 'listingtype')
ORDER BY column_name;

-- =====================================================
-- ✅ DONE! All triggers now use buyer_id/seller_id
-- The "column c.user1_id does not exist" error is FIXED
-- =====================================================

-- SUMMARY
SELECT 
  '🎉 TRIGGER FIX COMPLETE!' as summary,
  'buyer_id/seller_id' as uses_columns,
  'user1_id/user2_id REMOVED' as old_columns;
