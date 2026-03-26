-- =====================================================
-- Profile Enhancements: Reliability, Badges, History
-- =====================================================

-- Add reliability score and badges to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reliability_score INTEGER DEFAULT 100;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_trusted BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_tasks_completed INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_wishes_granted INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badge_notes TEXT;

-- Create user_activity_logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'task_created', 'task_completed', 'wish_created', 'wish_granted', 'listing_created', etc.
  activity_description TEXT NOT NULL,
  metadata JSONB, -- Additional data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_reliability_score ON profiles(reliability_score);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_trusted ON profiles(is_trusted);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);

-- =====================================================
-- DONE! 🎉
-- =====================================================
-- Profiles now have:
-- - reliability_score (0-100, default 100)
-- - is_verified badge
-- - is_trusted badge
-- - total_tasks_completed counter
-- - total_wishes_granted counter
-- - badge_notes for admin notes
-- 
-- Activity logs track all user actions
-- =====================================================
