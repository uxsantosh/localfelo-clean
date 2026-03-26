-- =====================================================
-- OldCycle Enhanced Tasks Features Migration
-- Adds: Time Windows, Acceptance, Negotiation, Ratings
-- =====================================================

-- =====================================================
-- 1. UPDATE TASKS TABLE
-- =====================================================

-- Add new columns to existing tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS time_window TEXT CHECK (time_window IN ('asap', 'today', 'tomorrow'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'in_progress', 'completed', 'closed'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS accepted_by UUID REFERENCES profiles(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_tasks_time_window ON tasks(time_window);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_accepted_by ON tasks(accepted_by);

-- =====================================================
-- 2. TASK NEGOTIATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS task_negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  helper_id UUID NOT NULL REFERENCES profiles(id),
  helper_name TEXT NOT NULL,
  offered_price NUMERIC NOT NULL,
  message TEXT,
  round INTEGER NOT NULL CHECK (round IN (1, 2)), -- Max 2 rounds
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  
  -- Prevent more than 2 rounds per helper
  CONSTRAINT unique_helper_task_round UNIQUE(task_id, helper_id, round)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_negotiations_task_id ON task_negotiations(task_id);
CREATE INDEX IF NOT EXISTS idx_task_negotiations_helper_id ON task_negotiations(helper_id);
CREATE INDEX IF NOT EXISTS idx_task_negotiations_status ON task_negotiations(status);

-- Enable RLS
ALTER TABLE task_negotiations ENABLE ROW LEVEL SECURITY;

-- Anyone can view negotiations for tasks they're involved in
CREATE POLICY "Users can view relevant negotiations"
  ON task_negotiations FOR SELECT
  USING (
    helper_id = auth.uid() OR
    EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND user_id = auth.uid())
  );

-- Helpers can create negotiations
CREATE POLICY "Anyone can create negotiations"
  ON task_negotiations FOR INSERT
  WITH CHECK (true);

-- Task owners can update negotiations (accept/reject)
CREATE POLICY "Task owners can update negotiations"
  ON task_negotiations FOR UPDATE
  USING (EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND user_id = auth.uid()));

-- =====================================================
-- 3. TASK RATINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS task_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES profiles(id),
  rated_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate ratings
  CONSTRAINT unique_task_rater UNIQUE(task_id, rater_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_ratings_task_id ON task_ratings(task_id);
CREATE INDEX IF NOT EXISTS idx_task_ratings_rated_id ON task_ratings(rated_id);

-- Enable RLS
ALTER TABLE task_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can view ratings
CREATE POLICY "Anyone can view ratings"
  ON task_ratings FOR SELECT
  USING (true);

-- Anyone can create ratings
CREATE POLICY "Anyone can create ratings"
  ON task_ratings FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 4. ADD RATING STATS TO PROFILES
-- =====================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS task_rating_avg NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS task_rating_count INTEGER DEFAULT 0;

-- =====================================================
-- 5. CREATE FUNCTION TO UPDATE RATING STATS
-- =====================================================

CREATE OR REPLACE FUNCTION update_task_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the rated user's stats
  UPDATE profiles
  SET 
    task_rating_avg = (
      SELECT COALESCE(AVG(rating), 0)
      FROM task_ratings
      WHERE rated_id = NEW.rated_id
    ),
    task_rating_count = (
      SELECT COUNT(*)
      FROM task_ratings
      WHERE rated_id = NEW.rated_id
    )
  WHERE id = NEW.rated_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_task_rating_stats ON task_ratings;
CREATE TRIGGER trigger_update_task_rating_stats
  AFTER INSERT ON task_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_task_rating_stats();

-- =====================================================
-- 6. TASK CHAT CONNECTIONS TABLE
-- =====================================================
-- Link tasks to chat conversations after acceptance

CREATE TABLE IF NOT EXISTS task_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One conversation per task
  CONSTRAINT unique_task_conversation UNIQUE(task_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_conversations_task_id ON task_conversations(task_id);
CREATE INDEX IF NOT EXISTS idx_task_conversations_conversation_id ON task_conversations(conversation_id);

-- Enable RLS
ALTER TABLE task_conversations ENABLE ROW LEVEL SECURITY;

-- Anyone can view task conversations
CREATE POLICY "Anyone can view task conversations"
  ON task_conversations FOR SELECT
  USING (true);

-- Anyone can create task conversations
CREATE POLICY "Anyone can create task conversations"
  ON task_conversations FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- DONE! 🎉
-- =====================================================
-- Your enhanced tasks system is ready with:
-- ✅ Time window selection
-- ✅ Task acceptance tracking
-- ✅ Price negotiation (max 2 rounds)
-- ✅ Rating system
-- ✅ Chat integration
-- ✅ Status management
-- =====================================================
