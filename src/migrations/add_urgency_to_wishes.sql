-- =====================================================
-- Add urgency column to wishes table
-- =====================================================

-- Add urgency column (asap, today, flexible)
ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('asap', 'today', 'flexible'));

-- Set default to 'flexible' for existing rows
UPDATE wishes SET urgency = 'flexible' WHERE urgency IS NULL;

-- Add comment
COMMENT ON COLUMN wishes.urgency IS 'Urgency level: asap, today, or flexible';
