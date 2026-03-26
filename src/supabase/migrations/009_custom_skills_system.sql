-- Custom Skills System: Allow helpers to add ANY skill
-- The system learns from usage patterns and admin can promote popular skills to official categories

-- 1. Helper Custom Skills Table
CREATE TABLE IF NOT EXISTS helper_custom_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);

CREATE INDEX idx_helper_custom_skills_user ON helper_custom_skills(user_id);
CREATE INDEX idx_helper_custom_skills_name ON helper_custom_skills(skill_name);

-- 2. Training Data Collection: Learn from helper-task interactions
CREATE TABLE IF NOT EXISTS skill_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  task_title TEXT NOT NULL,
  task_category TEXT NOT NULL,
  helper_skills TEXT[] NOT NULL, -- Combined: official categories + custom skills
  action_type TEXT NOT NULL CHECK (action_type IN ('view', 'message', 'accept')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_training_data_task ON skill_training_data(task_id);
CREATE INDEX idx_training_data_category ON skill_training_data(task_category);
CREATE INDEX idx_training_data_action ON skill_training_data(action_type);

-- 3. Admin-managed Official Categories (for promotion system)
CREATE TABLE IF NOT EXISTS official_task_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT UNIQUE NOT NULL,
  keywords TEXT[] NOT NULL, -- Keywords for AI matching
  icon TEXT, -- Emoji or icon identifier
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial categories
INSERT INTO official_task_categories (category_name, keywords, icon, usage_count) VALUES
  ('Home Repair', ARRAY['repair', 'fix', 'plumbing', 'plumber', 'electrical', 'electrician', 'carpenter', 'paint', 'painting', 'leaking', 'tap', 'pipe'], '🔧', 0),
  ('Cleaning', ARRAY['clean', 'cleaning', 'wash', 'washing', 'maid', 'housekeeping', 'sanitize', 'sweep', 'mop'], '🧹', 0),
  ('Delivery', ARRAY['deliver', 'delivery', 'pickup', 'pick up', 'courier', 'transport', 'bring', 'fetch', 'collect', 'luggage', 'food'], '🚚', 0),
  ('Tech Help', ARRAY['computer', 'laptop', 'phone', 'software', 'tech', 'wifi', 'internet', 'website', 'app', 'developer', 'java', 'python', 'code'], '💻', 0),
  ('Tutoring', ARRAY['tutor', 'teach', 'teacher', 'education', 'lesson', 'study', 'mathematics', 'maths', 'science', 'english'], '📚', 0),
  ('Pet Care', ARRAY['pet', 'dog', 'cat', 'walk', 'walking', 'vet', 'grooming', 'animal'], '🐾', 0),
  ('Moving', ARRAY['move', 'moving', 'furniture', 'shift', 'shifting', 'relocate', 'carry', 'heavy'], '📦', 0),
  ('Beauty', ARRAY['beauty', 'salon', 'beautician', 'makeup', 'hair', 'haircut', 'spa', 'facial', 'manicure'], '💄', 0),
  ('Cooking', ARRAY['cook', 'cooking', 'chef', 'food', 'meal', 'prepare', 'kitchen', 'recipe'], '👨‍🍳', 0),
  ('Gardening', ARRAY['garden', 'gardening', 'plant', 'lawn', 'grass', 'tree', 'watering'], '🌱', 0),
  ('Photography', ARRAY['photo', 'photographer', 'photography', 'camera', 'shoot', 'wedding', 'event'], '📸', 0),
  ('Driving', ARRAY['drive', 'driver', 'driving', 'car', 'taxi', 'transport', 'vehicle'], '🚗', 0),
  ('Baby Sitting', ARRAY['baby', 'babysit', 'babysitting', 'child', 'childcare', 'nanny', 'kids'], '👶', 0),
  ('Errands', ARRAY['errand', 'grocery', 'shopping', 'market', 'documents', 'office', 'bank'], '🏃', 0),
  ('Other', ARRAY['help', 'need', 'looking', 'want', 'require'], '🔍', 0)
ON CONFLICT (category_name) DO NOTHING;

-- 4. Skill Promotion Requests (helpers can suggest official category additions)
CREATE TABLE IF NOT EXISTS skill_promotion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL,
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 1, -- How many helpers are using this skill
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_promotion_requests_status ON skill_promotion_requests(status);
CREATE INDEX idx_promotion_requests_usage ON skill_promotion_requests(usage_count DESC);

-- 5. Function: Auto-promote popular custom skills
CREATE OR REPLACE FUNCTION auto_suggest_skill_promotions()
RETURNS TABLE(skill TEXT, helper_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    skill_name as skill,
    COUNT(DISTINCT user_id) as helper_count
  FROM helper_custom_skills
  WHERE skill_name NOT IN (SELECT category_name FROM official_task_categories)
  GROUP BY skill_name
  HAVING COUNT(DISTINCT user_id) >= 5 -- At least 5 helpers using this skill
  ORDER BY COUNT(DISTINCT user_id) DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- 6. Function: Update category usage count (for analytics)
CREATE OR REPLACE FUNCTION increment_category_usage(category TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE official_task_categories
  SET 
    usage_count = usage_count + 1,
    updated_at = NOW()
  WHERE category_name = category;
END;
$$ LANGUAGE plpgsql;

-- 7. RLS Policies
ALTER TABLE helper_custom_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_promotion_requests ENABLE ROW LEVEL SECURITY;

-- Users can manage their own custom skills
CREATE POLICY "Users can insert own custom skills"
  ON helper_custom_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own custom skills"
  ON helper_custom_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom skills"
  ON helper_custom_skills FOR DELETE
  USING (auth.uid() = user_id);

-- Everyone can view official categories
CREATE POLICY "Everyone can view official categories"
  ON official_task_categories FOR SELECT
  USING (is_active = true);

-- Training data: users can insert their own
CREATE POLICY "Users can insert training data"
  ON skill_training_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Skill promotion requests
CREATE POLICY "Users can create promotion requests"
  ON skill_promotion_requests FOR INSERT
  WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Everyone can view pending requests"
  ON skill_promotion_requests FOR SELECT
  USING (true);

COMMENT ON TABLE helper_custom_skills IS 'Allows helpers to add ANY skill beyond predefined categories';
COMMENT ON TABLE skill_training_data IS 'ML training data: tracks which skills successfully match which tasks';
COMMENT ON TABLE official_task_categories IS 'Admin-managed official categories with AI keywords';
COMMENT ON TABLE skill_promotion_requests IS 'Community-driven category suggestions';
