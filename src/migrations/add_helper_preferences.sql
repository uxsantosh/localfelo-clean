-- =====================================================
-- OldCycle: Add Helper Preferences & Wish Categorization
-- =====================================================
-- This migration adds:
-- 1. Helper preferences storage (what kind of help users want to do)
-- 2. Helper category mapping for wishes (AI-detected help requests)
-- 3. Intent type for wishes (help/buy/rent/deal)
-- =====================================================

-- 1. Add helper_preferences to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS helper_preferences JSONB DEFAULT '[]'::jsonb;

-- Index for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_helper_preferences 
ON profiles USING GIN (helper_preferences);

-- 2. Add helper_category to wishes table
ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS helper_category TEXT;

-- 3. Add intent_type to wishes table
ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS intent_type TEXT;

-- Index for faster wish filtering
CREATE INDEX IF NOT EXISTS idx_wishes_helper_category 
ON wishes(helper_category) WHERE helper_category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_wishes_intent_type 
ON wishes(intent_type) WHERE intent_type IS NOT NULL;

-- 4. Ensure tasks table has category_id indexed
CREATE INDEX IF NOT EXISTS idx_tasks_category_id 
ON tasks(category_id);

-- Verify changes
SELECT 'Migration completed successfully!' as message;
