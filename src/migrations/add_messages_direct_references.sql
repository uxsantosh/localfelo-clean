-- Add missing columns to messages table for direct querying without joins
-- This allows simpler queries for chat history and admin views

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS receiver_id TEXT,
ADD COLUMN IF NOT EXISTS listing_id TEXT,
ADD COLUMN IF NOT EXISTS wish_id UUID REFERENCES wishes(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS message TEXT; -- Alias for content field

-- Update existing messages to populate receiver_id from conversations
-- This is a one-time migration to backfill data
UPDATE messages m
SET receiver_id = (
  SELECT CASE 
    WHEN c.buyer_id::text = m.sender_id THEN c.seller_id::text
    WHEN c.seller_id::text = m.sender_id THEN c.buyer_id::text
    ELSE c.seller_id::text
  END
  FROM conversations c
  WHERE c.id = m.conversation_id
)
WHERE receiver_id IS NULL AND conversation_id IS NOT NULL;

-- Update existing messages to populate listing_id from conversations
UPDATE messages m
SET listing_id = c.listing_id
FROM conversations c
WHERE m.conversation_id = c.id 
  AND m.listing_id IS NULL 
  AND c.listing_id IS NOT NULL;

-- Update existing messages to populate wish_id from conversations
UPDATE messages m
SET wish_id = c.wish_id
FROM conversations c
WHERE m.conversation_id = c.id 
  AND m.wish_id IS NULL 
  AND c.wish_id IS NOT NULL;

-- Update existing messages to populate task_id from conversations
UPDATE messages m
SET task_id = c.task_id
FROM conversations c
WHERE m.conversation_id = c.id 
  AND m.task_id IS NULL 
  AND c.task_id IS NOT NULL;

-- Copy content to message column for compatibility
UPDATE messages
SET message = content
WHERE message IS NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id) WHERE listing_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_wish_id ON messages(wish_id) WHERE wish_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_task_id ON messages(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);

-- Add foreign key relationships for sender_id and receiver_id to profiles
-- Note: These are TEXT fields that can reference multiple profile columns (id, client_token, owner_token, auth_user_id)
-- So we don't add strict foreign keys, but rather use indexes for performance

-- Add comments for documentation
COMMENT ON COLUMN messages.receiver_id IS 'The recipient of the message (can be profile.id, client_token, owner_token, or auth_user_id)';
COMMENT ON COLUMN messages.listing_id IS 'Reference to marketplace listing if this message is about a listing';
COMMENT ON COLUMN messages.wish_id IS 'Reference to wish if this message is about a wish';
COMMENT ON COLUMN messages.task_id IS 'Reference to task if this message is about a task';
COMMENT ON COLUMN messages.message IS 'Alias for content field for backward compatibility';