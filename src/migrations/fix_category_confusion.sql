-- =====================================================
-- FIX CATEGORY CONFUSION + DEAL FLOW
-- =====================================================

-- Add status column to wishes if not exists
ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open' 
CHECK (status IN ('open', 'negotiating', 'accepted', 'in_progress', 'completed'));

-- Add status column to tasks if not exists (should already exist)
ALTER TABLE tasks 
ALTER COLUMN status SET DEFAULT 'open';

-- Update any NULL statuses to 'open'
UPDATE wishes SET status = 'open' WHERE status IS NULL;
UPDATE tasks SET status = 'open' WHERE status IS NULL;

-- Add latitude and longitude to wishes for Google Maps (after acceptance)
ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Create index on status columns for faster filtering
CREATE INDEX IF NOT EXISTS idx_wishes_status ON wishes(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Ensure category types are enforced via check constraints
-- This is a documentation constraint - enforced in application layer
COMMENT ON TABLE categories IS 'Marketplace categories only - NOT for wishes/tasks';
COMMENT ON COLUMN wishes.helper_category IS 'Helper category ID for help-type wishes';
COMMENT ON COLUMN wishes.intent_type IS 'Intent type: buy/rent/find-used/find-service/find-help/find-deal/other';
