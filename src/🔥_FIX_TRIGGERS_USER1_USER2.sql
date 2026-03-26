-- =====================================================
-- 🔥 FIX DATABASE TRIGGERS - Replace user1_id/user2_id
-- =====================================================
-- The error "column c.user1_id does not exist" comes from
-- old database triggers that still reference user1_id/user2_id
-- instead of buyer_id/seller_id
-- =====================================================

-- STEP 1: Drop old triggers
-- =====================================================

DROP TRIGGER IF EXISTS notify_chat_message ON messages;
DROP TRIGGER IF EXISTS send_delayed_reply_reminder ON messages;
DROP FUNCTION IF EXISTS notify_chat_message_to_interakt();
DROP FUNCTION IF EXISTS check_delayed_reply_reminder();

-- STEP 2: Recreate function with CORRECT column names
-- =====================================================

CREATE OR REPLACE FUNCTION notify_chat_message_to_interakt()
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
  -- FIX: Use buyer_id/seller_id instead of user1_id/user2_id
  SELECT 
    CASE 
      WHEN NEW.sender_id = c.buyer_id THEN c.seller_id
      ELSE c.buyer_id
    END,
    c.listing_title,
    c.listingtype
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
    AND id != NEW.id; -- Exclude current message
  
  -- Calculate time gap from last message
  v_time_gap_hours := EXTRACT(EPOCH FROM (NEW.created_at - v_last_message_time)) / 3600;
  
  -- Only send if:
  -- 1. First message from this sender, OR
  -- 2. More than 1 hour since last message from this sender
  IF v_message_count = 0 OR v_time_gap_hours >= 1 THEN
    -- Insert into notification queue
    INSERT INTO interakt_notification_queue (
      notification_type,
      recipient_id,
      recipient_phone,
      sender_name,
      conversation_id,
      listing_title,
      message_preview
    ) VALUES (
      'chat_message',
      v_recipient_id,
      v_recipient_phone,
      v_sender_name,
      NEW.conversation_id,
      v_listing_title,
      LEFT(NEW.content, 100) -- First 100 chars
    );
    
    RAISE NOTICE 'Queued chat notification for recipient % (phone: %)', v_recipient_name, v_recipient_phone;
  ELSE
    RAISE NOTICE 'Skipped notification - sent message less than 1 hour ago';
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block message insertion
    RAISE WARNING 'Interakt notification failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 3: Recreate trigger
-- =====================================================

CREATE TRIGGER notify_chat_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_chat_message_to_interakt();

-- STEP 4: Verify
-- =====================================================

SELECT 
  '✅ TRIGGER FIXED:' as status,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'notify_chat_message';

SELECT 
  '✅ FUNCTION FIXED:' as status,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'notify_chat_message_to_interakt';

-- =====================================================
-- ✅ DONE! The trigger now uses buyer_id/seller_id
-- The "column c.user1_id does not exist" error is fixed
-- =====================================================
