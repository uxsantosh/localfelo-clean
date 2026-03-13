-- Helper Preferences Table for Smart Matching
-- This table stores helper preferences for intelligent task matching and notifications

CREATE TABLE IF NOT EXISTS helper_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skills TEXT[] NOT NULL DEFAULT '{}', -- Array of task categories
  max_distance_km INTEGER NOT NULL DEFAULT 10, -- Maximum distance willing to travel
  min_budget INTEGER, -- Minimum budget (null = no minimum)
  max_budget INTEGER, -- Maximum budget (null = no maximum)
  notify_new_tasks BOOLEAN NOT NULL DEFAULT true, -- Enable notifications
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add category column to tasks table for smart categorization
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other';

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_helper_preferences_user_id ON helper_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_helper_preferences_notify ON helper_preferences(notify_new_tasks) WHERE notify_new_tasks = true;
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);

-- RLS Policies
ALTER TABLE helper_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view and edit their own preferences
CREATE POLICY "Users can view own preferences"
  ON helper_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON helper_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON helper_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_helper_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER helper_preferences_updated_at
  BEFORE UPDATE ON helper_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_helper_preferences_updated_at();

-- Comments
COMMENT ON TABLE helper_preferences IS 'Stores helper preferences for smart task matching and notifications';
COMMENT ON COLUMN helper_preferences.skills IS 'Array of task categories the helper is interested in helping with';
COMMENT ON COLUMN helper_preferences.max_distance_km IS 'Maximum distance in kilometers the helper is willing to travel';
COMMENT ON COLUMN helper_preferences.min_budget IS 'Minimum task budget the helper is interested in (null = no minimum)';
COMMENT ON COLUMN helper_preferences.max_budget IS 'Maximum task budget the helper is interested in (null = no maximum)';
COMMENT ON COLUMN helper_preferences.notify_new_tasks IS 'Whether to send notifications for new matching tasks';
