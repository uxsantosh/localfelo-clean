-- =====================================================
-- Add user_id column to wishes table for consistency
-- =====================================================
-- This allows getUserWishes to use user_id consistently

-- Add user_id column (references profiles.id)
ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Migrate existing data: Find user_id from profiles using client_token match
-- This handles cases where wishes were created before user_id was tracked
UPDATE wishes w
SET user_id = p.id
FROM profiles p
WHERE w.user_id IS NULL 
  AND w.client_token IS NOT NULL 
  AND w.client_token = p.client_token;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_wishes_user_id ON wishes(user_id);

-- Verify the changes
SELECT 
  'wishes' as table_name,
  COUNT(*) as total_wishes,
  COUNT(user_id) as with_user_id,
  COUNT(client_token) as with_client_token
FROM wishes;
