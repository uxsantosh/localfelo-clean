-- =====================================================
-- FIX: Wishes Urgency Check Constraint
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Drop the existing constraint if it exists
ALTER TABLE wishes 
DROP CONSTRAINT IF EXISTS wishes_urgency_check;

-- Add the urgency column if it doesn't exist
ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS urgency TEXT;

-- Add the correct check constraint
ALTER TABLE wishes 
ADD CONSTRAINT wishes_urgency_check 
CHECK (urgency IN ('asap', 'today', 'flexible'));

-- Set default to 'flexible' for existing NULL rows
UPDATE wishes 
SET urgency = 'flexible' 
WHERE urgency IS NULL;

-- Add comment
COMMENT ON COLUMN wishes.urgency IS 'Urgency level: asap, today, or flexible';

-- Verify the constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'wishes_urgency_check';
