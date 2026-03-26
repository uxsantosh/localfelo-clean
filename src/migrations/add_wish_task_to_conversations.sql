-- Add wish_id and task_id columns to conversations table to support chats for wishes and tasks

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS wish_id UUID REFERENCES wishes(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE CASCADE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_wish_id 
ON conversations(wish_id) WHERE wish_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_task_id 
ON conversations(task_id) WHERE task_id IS NOT NULL;

-- Update RLS policies to include wish and task conversations
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

-- Recreate policies with wish and task support
CREATE POLICY "Users can view their own conversations"
ON conversations FOR SELECT
TO authenticated
USING (
  buyer_id = auth.uid()::text OR 
  seller_id = auth.uid()::text
);

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (
  buyer_id = auth.uid()::text OR 
  seller_id = auth.uid()::text
);

-- Add comments for documentation
COMMENT ON COLUMN conversations.wish_id IS 'Reference to wish if this conversation is about a wish';
COMMENT ON COLUMN conversations.task_id IS 'Reference to task if this conversation is about a task';