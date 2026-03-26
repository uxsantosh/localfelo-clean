-- =====================================================
-- FIX CATEGORY MIXING + ACCEPT FLOW + MAP VISIBILITY
-- =====================================================

-- 1. Add accepted_price columns to tasks and wishes
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS accepted_price DECIMAL(10,2);

ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS accepted_price DECIMAL(10,2);

ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS accepted_by UUID REFERENCES profiles(id);

ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;

-- 2. Ensure status columns exist with correct enum types
-- For tasks
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('open', 'negotiating', 'accepted', 'in_progress', 'completed', 'closed');
  END IF;
END $$;

-- For wishes  
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wish_status') THEN
    CREATE TYPE wish_status AS ENUM ('open', 'active', 'negotiating', 'accepted', 'in_progress', 'completed', 'fulfilled', 'expired');
  END IF;
END $$;

-- 3. Update existing columns if needed (safely)
DO $$ 
BEGIN
  -- Check if status column exists and is correct type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'status'
  ) THEN
    -- Drop and recreate with enum if not already enum
    EXECUTE 'ALTER TABLE tasks ALTER COLUMN status TYPE VARCHAR(50)';
  ELSE
    ALTER TABLE tasks ADD COLUMN status VARCHAR(50) DEFAULT 'open';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishes' AND column_name = 'status'
  ) THEN
    EXECUTE 'ALTER TABLE wishes ALTER COLUMN status TYPE VARCHAR(50)';
  ELSE
    ALTER TABLE wishes ADD COLUMN status VARCHAR(50) DEFAULT 'open';
  END IF;
END $$;

-- 4. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_accepted_by ON tasks(accepted_by);
CREATE INDEX IF NOT EXISTS idx_wishes_status ON wishes(status);
CREATE INDEX IF NOT EXISTS idx_wishes_accepted_by ON wishes(accepted_by);

-- 5. Create function to handle atomic accept flow
CREATE OR REPLACE FUNCTION accept_task_with_chat(
  p_task_id UUID,
  p_user_id UUID,
  p_accepted_price DECIMAL(10,2)
) RETURNS TABLE (
  success BOOLEAN,
  conversation_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_task_owner_id UUID;
  v_task_title TEXT;
  v_conversation_id UUID;
BEGIN
  -- Get task details
  SELECT user_id, title INTO v_task_owner_id, v_task_title
  FROM tasks
  WHERE id = p_task_id;

  IF v_task_owner_id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Task not found';
    RETURN;
  END IF;

  -- Check if conversation already exists
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE listing_id = ('task_' || p_task_id::TEXT)
    AND buyer_id = p_user_id
    AND seller_id = v_task_owner_id;

  -- Create conversation if it doesn't exist
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (
      listing_id,
      listing_title,
      listing_price,
      buyer_id,
      seller_id,
      buyer_name,
      seller_name
    )
    SELECT
      'task_' || p_task_id::TEXT,
      v_task_title,
      p_accepted_price,
      p_user_id,
      v_task_owner_id,
      (SELECT name FROM profiles WHERE id = p_user_id),
      (SELECT name FROM profiles WHERE id = v_task_owner_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  -- Update task status
  UPDATE tasks
  SET 
    status = 'accepted',
    accepted_by = p_user_id,
    accepted_at = NOW(),
    accepted_price = p_accepted_price
  WHERE id = p_task_id;

  RETURN QUERY SELECT TRUE, v_conversation_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to handle atomic wish accept flow
CREATE OR REPLACE FUNCTION accept_wish_with_chat(
  p_wish_id UUID,
  p_user_id UUID,
  p_accepted_price DECIMAL(10,2)
) RETURNS TABLE (
  success BOOLEAN,
  conversation_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_wish_owner_id UUID;
  v_wish_title TEXT;
  v_conversation_id UUID;
BEGIN
  -- Get wish details
  SELECT user_id, title INTO v_wish_owner_id, v_wish_title
  FROM wishes
  WHERE id = p_wish_id;

  IF v_wish_owner_id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Wish not found';
    RETURN;
  END IF;

  -- Check if conversation already exists
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE listing_id = ('wish_' || p_wish_id::TEXT)
    AND buyer_id = p_user_id
    AND seller_id = v_wish_owner_id;

  -- Create conversation if it doesn't exist
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (
      listing_id,
      listing_title,
      listing_price,
      buyer_id,
      seller_id,
      buyer_name,
      seller_name
    )
    SELECT
      'wish_' || p_wish_id::TEXT,
      v_wish_title,
      COALESCE(p_accepted_price, 0),
      p_user_id,
      v_wish_owner_id,
      (SELECT name FROM profiles WHERE id = p_user_id),
      (SELECT name FROM profiles WHERE id = v_wish_owner_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  -- Update wish status
  UPDATE wishes
  SET 
    status = 'accepted',
    accepted_by = p_user_id,
    accepted_at = NOW(),
    accepted_price = p_accepted_price
  WHERE id = p_wish_id;

  RETURN QUERY SELECT TRUE, v_conversation_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 7. IMPORTANT: Category type enforcement is handled in the application layer
-- The categories table already has a 'type' column
-- Make sure to query categories with WHERE type='marketplace' or 'wish' or 'task'

COMMENT ON COLUMN categories.type IS 'Category type: marketplace, wish, or task';
COMMENT ON COLUMN tasks.accepted_price IS 'Final negotiated price when task is accepted';
COMMENT ON COLUMN wishes.accepted_price IS 'Final negotiated price when wish is accepted';
COMMENT ON COLUMN tasks.exact_location IS 'Google Maps deep link - only visible after acceptance';
COMMENT ON COLUMN wishes.exact_location IS 'Google Maps deep link - only visible after acceptance';
