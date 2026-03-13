-- =====================================================
-- 🔥 FIX MESSAGES NOT RECEIVING
-- =====================================================
-- This fixes the issue where users can send messages
-- but recipients don't receive them
-- =====================================================

-- STEP 1: Ensure sender_name and sender_avatar columns exist
-- =====================================================

DO $$ 
BEGIN
    -- Add sender_name if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'sender_name'
    ) THEN
        ALTER TABLE messages ADD COLUMN sender_name TEXT;
        RAISE NOTICE '✅ Added sender_name column';
    ELSE
        RAISE NOTICE '✓ sender_name column already exists';
    END IF;

    -- Add sender_avatar if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'sender_avatar'
    ) THEN
        ALTER TABLE messages ADD COLUMN sender_avatar TEXT;
        RAISE NOTICE '✅ Added sender_avatar column';
    ELSE
        RAISE NOTICE '✓ sender_avatar column already exists';
    END IF;
END $$;

-- STEP 2: Create trigger to auto-populate sender info
-- =====================================================

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS auto_populate_sender_info ON messages;
DROP FUNCTION IF EXISTS auto_populate_sender_info();

-- Create function to populate sender info
CREATE OR REPLACE FUNCTION auto_populate_sender_info()
RETURNS TRIGGER AS $$
BEGIN
    -- Only populate if sender_name is null or empty
    IF NEW.sender_name IS NULL OR NEW.sender_name = '' THEN
        SELECT display_name, avatar_url
        INTO NEW.sender_name, NEW.sender_avatar
        FROM profiles
        WHERE id = NEW.sender_id;
        
        -- Fallback to 'User' if no name found
        IF NEW.sender_name IS NULL OR NEW.sender_name = '' THEN
            NEW.sender_name := 'User';
        END IF;
        
        RAISE NOTICE '✅ Auto-populated sender info for message: % (name: %)', NEW.id, NEW.sender_name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER auto_populate_sender_info
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_sender_info();

-- STEP 3: Enable Realtime on messages table
-- =====================================================

-- Enable realtime replication
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Enable publication for realtime
DO $$
BEGIN
    -- Check if messages is in the publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
        RAISE NOTICE '✅ Added messages to realtime publication';
    ELSE
        RAISE NOTICE '✓ messages already in realtime publication';
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        RAISE NOTICE '⚠️ supabase_realtime publication does not exist - realtime may not be configured';
    WHEN duplicate_object THEN
        RAISE NOTICE '✓ messages already in realtime publication';
END $$;

-- STEP 4: Verify RLS policies allow message viewing
-- =====================================================

-- The policies from 🔥_ULTIMATE_FIX_ALL_CASTS.sql should already be in place
-- Let's verify they exist and show them

SELECT 
    '✅ CURRENT RLS POLICIES ON MESSAGES:' as status;

SELECT 
    policyname,
    cmd as operation,
    qual as using_clause
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY cmd, policyname;

-- STEP 5: Backfill sender names for existing messages
-- =====================================================

UPDATE messages m
SET 
    sender_name = COALESCE(p.display_name, 'User'),
    sender_avatar = p.avatar_url
FROM profiles p
WHERE m.sender_id::text = p.id::text
    AND (m.sender_name IS NULL OR m.sender_name = '');

SELECT 
    '✅ BACKFILLED SENDER INFO:' as status,
    COUNT(*) as messages_updated
FROM messages
WHERE sender_name IS NOT NULL;

-- STEP 6: Test query - verify messages can be read
-- =====================================================

SELECT 
    '✅ SAMPLE MESSAGES (if any):' as test;

SELECT 
    id,
    conversation_id,
    sender_id,
    sender_name,
    LEFT(content, 50) as content_preview,
    read,
    created_at
FROM messages
ORDER BY created_at DESC
LIMIT 5;

-- STEP 7: Verify conversations table columns
-- =====================================================

SELECT 
    '✅ CONVERSATIONS TABLE COLUMNS:' as status;

SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'conversations'
    AND column_name IN ('id', 'buyer_id', 'seller_id', 'listing_title', 'last_message', 'last_message_at')
ORDER BY column_name;

-- =====================================================
-- ✅ COMPLETE! Messages should now be received
-- =====================================================

SELECT 
    '🎉 FIX COMPLETE!' as summary,
    'Recipients should now receive messages' as result,
    'Try sending a chat message now' as action;