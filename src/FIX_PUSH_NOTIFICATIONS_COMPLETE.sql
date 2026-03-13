-- =====================================================
-- COMPLETE PUSH NOTIFICATIONS FIX
-- =====================================================
-- This fixes BOTH problems:
-- 1. Device tokens table setup (allows saving tokens)
-- 2. Database trigger (calls Edge Function on new messages)
-- =====================================================

-- =====================================================
-- PART 1: DEVICE TOKENS TABLE SETUP
-- =====================================================

-- Ensure device_tokens table has UNIQUE constraint
-- This is CRITICAL for upsert to work
DO $$ 
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'device_tokens_device_token_key'
  ) THEN
    ALTER TABLE device_tokens DROP CONSTRAINT device_tokens_device_token_key;
  END IF;
  
  -- Add UNIQUE constraint on device_token
  ALTER TABLE device_tokens 
    ADD CONSTRAINT device_tokens_device_token_key 
    UNIQUE (device_token);
    
  RAISE NOTICE 'UNIQUE constraint added on device_token column';
EXCEPTION
  WHEN duplicate_table THEN
    RAISE NOTICE 'UNIQUE constraint already exists';
END $$;

-- =====================================================
-- PART 2: RLS POLICIES FOR DEVICE_TOKENS
-- =====================================================

-- Enable RLS
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Users can read own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Users can update own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Users can delete own device tokens" ON device_tokens;

-- Create comprehensive RLS policies
CREATE POLICY "Users can insert own device tokens"
  ON device_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own device tokens"
  ON device_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own device tokens"
  ON device_tokens
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own device tokens"
  ON device_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PART 3: DATABASE TRIGGER FOR PUSH NOTIFICATIONS
-- =====================================================

-- Create function that calls the Edge Function
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_function_url TEXT;
  v_service_role_key TEXT;
  v_recipient_id UUID;
  v_sender_id UUID;
  v_conversation_id UUID;
BEGIN
  -- Get conversation details
  v_conversation_id := NEW.conversation_id;
  v_sender_id := NEW.sender_id;
  
  -- Find recipient (the OTHER user in the conversation)
  SELECT 
    CASE 
      WHEN user1_id = v_sender_id THEN user2_id
      ELSE user1_id
    END INTO v_recipient_id
  FROM conversations
  WHERE id = v_conversation_id;
  
  -- If recipient not found, skip
  IF v_recipient_id IS NULL THEN
    RAISE NOTICE 'No recipient found for conversation %', v_conversation_id;
    RETURN NEW;
  END IF;
  
  -- Get Supabase Edge Function URL and service role key
  -- IMPORTANT: Replace these with your actual values
  v_function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-push-notification';
  v_service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Call Edge Function asynchronously using pg_net
  -- If pg_net is not available, this will fail silently
  BEGIN
    PERFORM
      net.http_post(
        url := v_function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_role_key
        ),
        body := jsonb_build_object(
          'recipientId', v_recipient_id,
          'senderId', v_sender_id,
          'conversationId', v_conversation_id,
          'messageId', NEW.id,
          'messageContent', NEW.content
        )
      );
    RAISE NOTICE 'Push notification triggered for user % (message: %)', v_recipient_id, NEW.id;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the insert
      RAISE NOTICE 'Failed to send push notification: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS notify_new_message_trigger ON messages;

-- Create trigger that fires AFTER new message insert
CREATE TRIGGER notify_new_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- =====================================================
-- PART 4: SET CONFIGURATION (REQUIRED!)
-- =====================================================
-- You MUST run these with your actual Supabase URL and service role key
-- Replace the values below!

-- ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';
-- ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';

-- =====================================================
-- PART 5: VERIFICATION
-- =====================================================

-- Check if trigger was created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'messages'
  AND trigger_name = 'notify_new_message_trigger';

-- Check if UNIQUE constraint exists
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'device_tokens'::regclass
  AND conname = 'device_tokens_device_token_key';

-- Check RLS policies
SELECT 
  policyname,
  cmd AS operation
FROM pg_policies
WHERE tablename = 'device_tokens'
ORDER BY cmd;

-- =====================================================
-- PART 6: TEST INSERT (while logged in)
-- =====================================================

-- Test if you can insert a device token
INSERT INTO device_tokens (
  user_id,
  device_token,
  platform,
  is_enabled,
  last_used_at
) VALUES (
  auth.uid(),
  'test_token_' || gen_random_uuid()::text,
  'web',
  true,
  now()
) RETURNING *;

-- =====================================================
-- SUCCESS CHECKLIST
-- =====================================================
-- ✅ Verification query shows notify_new_message_trigger exists
-- ✅ UNIQUE constraint on device_token exists
-- ✅ 4 RLS policies exist (INSERT, SELECT, UPDATE, DELETE)
-- ✅ Test insert succeeds and returns a row
-- ✅ Configuration variables set with your Supabase URL and key
-- =====================================================
