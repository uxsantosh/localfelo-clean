-- Admin Contact and Chat History Feature Migration
-- ================================================

-- CONTACT INFORMATION
-- ------------------
-- Contact Email: contact@localfelo.com
-- WhatsApp: +91-9063205739
-- 
-- The contact information is displayed via the ContactModal component
-- Users can access it from:
-- - Hamburger menu (mobile)
-- - Footer (Contact Us button)

-- CHAT HISTORY FOR LEGAL/SECURITY
-- --------------------------------
-- Admin can view all chat conversations and messages for legal and security purposes
-- Access via: Admin Panel > Chat History tab
--
-- Features:
-- - View all conversations (Listings, Wishes, Tasks)
-- - Search by user email, name, or item title
-- - Filter by type (Listings, Wishes, Tasks)
-- - View complete message history between users
-- - Timestamps and user information for each message
--
-- Data retention: All messages are stored indefinitely in the 'messages' table
-- All conversations are stored in the 'conversations' table

-- Ensure the conversations table exists with proper relations
-- This should already exist from previous migrations, but verify:

-- Check if conversations table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
        RAISE NOTICE 'WARNING: conversations table does not exist. Please run chat setup migration first.';
    END IF;
END $$;

-- Check if messages table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        RAISE NOTICE 'WARNING: messages table does not exist. Please run chat setup migration first.';
    END IF;
END $$;

-- Ensure admin can access chat history (already handled by RLS policies, but verify)
-- Admin should have SELECT access to conversations and messages tables

-- Add index for faster chat history queries
CREATE INDEX IF NOT EXISTS idx_conversations_last_message 
ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_listing 
ON conversations(listing_id) WHERE listing_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_wish 
ON conversations(wish_id) WHERE wish_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_task 
ON conversations(task_id) WHERE task_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_conversation 
ON messages(conversation_id, created_at);

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Admin contact and chat history features configured successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📧 Contact: contact@localfelo.com';
    RAISE NOTICE '📱 WhatsApp: +91-9063205739';
    RAISE NOTICE '';
    RAISE NOTICE '💬 Chat history is now viewable in Admin Panel > Chat History';
    RAISE NOTICE '   - All user conversations are stored for legal/security purposes';
    RAISE NOTICE '   - Admin can search, filter, and view complete message threads';
END $$;
