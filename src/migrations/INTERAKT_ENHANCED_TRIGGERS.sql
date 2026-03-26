-- =====================================================
-- Add table to track unread message reminder status
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_reminder_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  last_reminder_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unread_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, conversation_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_whatsapp_reminder_log_user_conversation 
  ON whatsapp_reminder_log(user_id, conversation_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_reminder_log_last_sent 
  ON whatsapp_reminder_log(last_reminder_sent_at);

-- Enable RLS
ALTER TABLE whatsapp_reminder_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own reminder logs"
  ON whatsapp_reminder_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert reminder logs"
  ON whatsapp_reminder_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update reminder logs"
  ON whatsapp_reminder_log
  FOR UPDATE
  TO service_role
  USING (true);

-- =====================================================
-- Function to check and send unread reminders
-- This will be called by a scheduled Edge Function
-- =====================================================

CREATE OR REPLACE FUNCTION check_and_send_unread_reminders()
RETURNS TABLE(
  reminder_count INTEGER,
  users_notified TEXT[]
) AS $$
DECLARE
  v_reminder_count INTEGER := 0;
  v_users_notified TEXT[] := ARRAY[]::TEXT[];
  v_conversation RECORD;
  v_recipient_phone TEXT;
  v_recipient_name TEXT;
  v_last_sender_name TEXT;
  v_last_message_preview TEXT;
  v_last_reminder TIMESTAMPTZ;
BEGIN
  -- Find all conversations with unread messages older than 6 hours
  FOR v_conversation IN
    SELECT 
      c.id AS conversation_id,
      c.user1_id,
      c.user2_id,
      c.listing_title,
      c.unread_count_user1,
      c.unread_count_user2,
      m.sender_id,
      m.receiver_id,
      m.content,
      m.created_at AS last_message_at
    FROM conversations c
    INNER JOIN LATERAL (
      SELECT sender_id, receiver_id, content, created_at
      FROM messages
      WHERE conversation_id = c.id
      ORDER BY created_at DESC
      LIMIT 1
    ) m ON TRUE
    WHERE 
      (c.unread_count_user1 > 0 OR c.unread_count_user2 > 0)
      AND m.created_at < NOW() - INTERVAL '6 hours'
  LOOP
    -- Determine who has unread messages
    DECLARE
      v_recipient_id UUID;
      v_unread_count INTEGER;
    BEGIN
      IF v_conversation.receiver_id = v_conversation.user1_id AND v_conversation.unread_count_user1 > 0 THEN
        v_recipient_id := v_conversation.user1_id;
        v_unread_count := v_conversation.unread_count_user1;
      ELSIF v_conversation.receiver_id = v_conversation.user2_id AND v_conversation.unread_count_user2 > 0 THEN
        v_recipient_id := v_conversation.user2_id;
        v_unread_count := v_conversation.unread_count_user2;
      ELSE
        CONTINUE;
      END IF;
      
      -- Check if we sent a reminder in the last 24 hours
      SELECT last_reminder_sent_at INTO v_last_reminder
      FROM whatsapp_reminder_log
      WHERE user_id = v_recipient_id
        AND conversation_id = v_conversation.conversation_id;
      
      -- Skip if reminder sent within last 24 hours
      IF v_last_reminder IS NOT NULL AND v_last_reminder > NOW() - INTERVAL '24 hours' THEN
        CONTINUE;
      END IF;
      
      -- Get recipient details
      SELECT phone, name INTO v_recipient_phone, v_recipient_name
      FROM profiles
      WHERE id = v_recipient_id;
      
      -- Get sender name
      SELECT name INTO v_last_sender_name
      FROM profiles
      WHERE id = v_conversation.sender_id;
      
      -- Only send if phone exists
      IF v_recipient_phone IS NOT NULL AND v_recipient_phone != '' THEN
        -- Send unread reminder notification
        PERFORM send_whatsapp_via_interakt(
          v_recipient_phone,
          'unread_reminder',
          jsonb_build_object(
            'customer_name', COALESCE(v_recipient_name, 'User'),
            'unread_count', v_unread_count::TEXT,
            'sender_name', COALESCE(v_last_sender_name, 'Someone'),
            'message_preview', LEFT(v_conversation.content, 100)
          ),
          v_recipient_id
        );
        
        -- Update or insert reminder log
        INSERT INTO whatsapp_reminder_log (user_id, conversation_id, unread_count)
        VALUES (v_recipient_id, v_conversation.conversation_id, v_unread_count)
        ON CONFLICT (user_id, conversation_id) 
        DO UPDATE SET 
          last_reminder_sent_at = NOW(),
          unread_count = EXCLUDED.unread_count;
        
        v_reminder_count := v_reminder_count + 1;
        v_users_notified := array_append(v_users_notified, v_recipient_id::TEXT);
      END IF;
    END;
  END LOOP;
  
  RETURN QUERY SELECT v_reminder_count, v_users_notified;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT SELECT, INSERT, UPDATE ON whatsapp_reminder_log TO service_role;
GRANT EXECUTE ON FUNCTION check_and_send_unread_reminders() TO service_role;

-- =====================================================
-- Verification queries
-- =====================================================

-- To manually trigger unread reminder check:
-- SELECT * FROM check_and_send_unread_reminders();

-- To view reminder logs:
-- SELECT * FROM whatsapp_reminder_log ORDER BY created_at DESC LIMIT 10;

-- To view all WhatsApp notifications:
-- SELECT * FROM whatsapp_notifications ORDER BY created_at DESC LIMIT 20;