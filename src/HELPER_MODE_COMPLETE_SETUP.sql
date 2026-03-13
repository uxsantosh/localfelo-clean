-- ================================================================
-- LOCALFELO HELPER MODE - COMPLETE DATABASE SETUP
-- ================================================================
-- This creates all tables needed for the 70-skill helper system
-- with AI-powered matching and self-learning capabilities
-- ================================================================

-- ================================================================
-- STEP 1: Create Helper Preferences Table
-- ================================================================
-- Stores each helper's skill selections, distance, and budget preferences

CREATE TABLE IF NOT EXISTS helper_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Selected skills (array of skill slugs)
  selected_categories TEXT[] NOT NULL DEFAULT '{}', -- New: skill slugs like 'carry-luggage'
  preferred_intents TEXT[] DEFAULT '{}', -- Backward compatibility
  
  -- Distance & budget filters
  max_distance INTEGER NOT NULL DEFAULT 15, -- in kilometers
  min_budget INTEGER NOT NULL DEFAULT 100, -- minimum task budget
  
  -- Helper availability
  show_all_tasks BOOLEAN DEFAULT false, -- Show all tasks or only matched ones
  is_available BOOLEAN DEFAULT false, -- Is helper currently available?
  
  -- Onboarding status
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id),
  CONSTRAINT valid_distance CHECK (max_distance >= 1 AND max_distance <= 50),
  CONSTRAINT valid_budget CHECK (min_budget >= 0),
  CONSTRAINT has_skills CHECK (array_length(selected_categories, 1) > 0)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_helper_preferences_user_id ON helper_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_helper_preferences_available ON helper_preferences(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_helper_preferences_skills ON helper_preferences USING GIN(selected_categories);

-- Enable RLS (Row Level Security)
ALTER TABLE helper_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own preferences"
  ON helper_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON helper_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON helper_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON helper_preferences FOR DELETE
  USING (auth.uid() = user_id);


-- ================================================================
-- STEP 2: Add Helper Mode to Profiles Table
-- ================================================================
-- Tracks if user has enabled helper mode

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'helper_mode'
  ) THEN
    ALTER TABLE profiles ADD COLUMN helper_mode BOOLEAN DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_helper_mode ON profiles(helper_mode) WHERE helper_mode = true;


-- ================================================================
-- STEP 3: Create Task Classification Table
-- ================================================================
-- Stores AI-detected intents/categories for each task

CREATE TABLE IF NOT EXISTS task_classifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  
  -- AI-detected categories (array of skill slugs)
  detected_categories TEXT[] NOT NULL DEFAULT '{}',
  confidence_score FLOAT DEFAULT 0.0, -- 0.0 to 1.0
  
  -- Classification method
  classification_method TEXT DEFAULT 'keyword-matching', -- 'keyword-matching', 'ai-ml', 'manual'
  
  -- Learning data
  helper_interactions INTEGER DEFAULT 0, -- How many helpers viewed this
  helper_accepts INTEGER DEFAULT 0, -- How many helpers accepted
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(task_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_classifications_task_id ON task_classifications(task_id);
CREATE INDEX IF NOT EXISTS idx_task_classifications_categories ON task_classifications USING GIN(detected_categories);

-- Enable RLS
ALTER TABLE task_classifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (anyone can read, system writes)
CREATE POLICY "Anyone can view task classifications"
  ON task_classifications FOR SELECT
  USING (true);


-- ================================================================
-- STEP 4: Create Helper-Task Interactions Table
-- ================================================================
-- Tracks which helpers viewed/contacted each task (for ML learning)

CREATE TABLE IF NOT EXISTS helper_task_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  helper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  
  -- Interaction type
  interaction_type TEXT NOT NULL, -- 'view', 'contact', 'accept', 'reject'
  
  -- Context
  distance_km FLOAT, -- Distance when interaction happened
  matched_skills TEXT[], -- Skills that matched
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CHECK (interaction_type IN ('view', 'contact', 'accept', 'reject'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_helper_interactions_helper ON helper_task_interactions(helper_id);
CREATE INDEX IF NOT EXISTS idx_helper_interactions_task ON helper_task_interactions(task_id);
CREATE INDEX IF NOT EXISTS idx_helper_interactions_type ON helper_task_interactions(interaction_type);

-- Enable RLS
ALTER TABLE helper_task_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own interactions"
  ON helper_task_interactions FOR SELECT
  USING (auth.uid() = helper_id);

CREATE POLICY "Users can insert their own interactions"
  ON helper_task_interactions FOR INSERT
  WITH CHECK (auth.uid() = helper_id);


-- ================================================================
-- STEP 5: Create Skills Master Table (Optional - for future)
-- ================================================================
-- Master list of all 70 skills - useful for analytics and reporting

CREATE TABLE IF NOT EXISTS skills_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- Main category like 'technical', 'physical', etc.
  emoji TEXT NOT NULL,
  popularity_score INTEGER DEFAULT 0, -- How many helpers have this skill
  task_count INTEGER DEFAULT 0, -- How many tasks need this skill
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_slug ON skills_master(slug);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills_master(category);


-- ================================================================
-- STEP 6: Create Helper Notifications Table
-- ================================================================
-- Stores which helpers should be notified about which tasks

CREATE TABLE IF NOT EXISTS helper_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  helper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  
  -- Match details
  match_score FLOAT DEFAULT 0, -- 0-100 score based on distance + skills
  matched_skills TEXT[], -- Which skills matched
  distance_km FLOAT, -- Distance to task
  
  -- Notification status
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(helper_id, task_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_helper_notifications_helper ON helper_notifications(helper_id);
CREATE INDEX IF NOT EXISTS idx_helper_notifications_task ON helper_notifications(task_id);
CREATE INDEX IF NOT EXISTS idx_helper_notifications_unviewed ON helper_notifications(helper_id) WHERE viewed_at IS NULL;

-- Enable RLS
ALTER TABLE helper_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON helper_notifications FOR SELECT
  USING (auth.uid() = helper_id);

CREATE POLICY "Users can update their own notifications"
  ON helper_notifications FOR UPDATE
  USING (auth.uid() = helper_id);


-- ================================================================
-- STEP 7: Create Functions for Helper Matching
-- ================================================================

-- Function to calculate match score between helper and task
CREATE OR REPLACE FUNCTION calculate_helper_task_match(
  p_helper_skills TEXT[],
  p_task_skills TEXT[],
  p_distance_km FLOAT,
  p_helper_max_distance INTEGER
) RETURNS FLOAT AS $$
DECLARE
  skill_match_score FLOAT := 0;
  distance_score FLOAT := 0;
  total_score FLOAT := 0;
BEGIN
  -- Calculate skill match (0-60 points)
  IF p_task_skills && p_helper_skills THEN
    skill_match_score := 60.0 * (
      array_length(ARRAY(SELECT unnest(p_task_skills) INTERSECT SELECT unnest(p_helper_skills)), 1)::FLOAT 
      / array_length(p_task_skills, 1)::FLOAT
    );
  END IF;
  
  -- Calculate distance score (0-40 points)
  IF p_distance_km <= p_helper_max_distance THEN
    distance_score := 40.0 * (1.0 - (p_distance_km / p_helper_max_distance));
  END IF;
  
  total_score := skill_match_score + distance_score;
  
  RETURN total_score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- Function to find matching helpers for a task
CREATE OR REPLACE FUNCTION find_matching_helpers(
  p_task_id UUID,
  p_task_skills TEXT[],
  p_task_location GEOGRAPHY(POINT, 4326),
  p_task_budget INTEGER
) RETURNS TABLE (
  helper_id UUID,
  match_score FLOAT,
  distance_km FLOAT,
  matched_skills TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hp.user_id,
    calculate_helper_task_match(
      hp.selected_categories,
      p_task_skills,
      ST_Distance(p.location::geography, p_task_location) / 1000.0,
      hp.max_distance
    ) as match_score,
    ST_Distance(p.location::geography, p_task_location) / 1000.0 as distance_km,
    ARRAY(SELECT unnest(hp.selected_categories) INTERSECT SELECT unnest(p_task_skills)) as matched_skills
  FROM helper_preferences hp
  INNER JOIN profiles p ON p.id = hp.user_id
  WHERE 
    hp.is_available = true
    AND hp.selected_categories && p_task_skills -- Has at least one matching skill
    AND ST_Distance(p.location::geography, p_task_location) / 1000.0 <= hp.max_distance
    AND p_task_budget >= hp.min_budget
  ORDER BY match_score DESC;
END;
$$ LANGUAGE plpgsql;


-- ================================================================
-- STEP 8: Create Trigger to Auto-Classify Tasks
-- ================================================================

-- Function to auto-classify task on creation
CREATE OR REPLACE FUNCTION auto_classify_task()
RETURNS TRIGGER AS $$
DECLARE
  detected_skills TEXT[] := '{}';
  task_text TEXT;
BEGIN
  task_text := LOWER(NEW.title || ' ' || COALESCE(NEW.description, ''));
  
  -- Simple keyword matching (you can replace with AI/ML later)
  -- Carry/Move
  IF task_text ~ '(carry|move|shift|lift|luggage|furniture|box|heavy)' THEN
    detected_skills := array_append(detected_skills, 'carry-move');
  END IF;
  
  -- Delivery
  IF task_text ~ '(deliver|pick.*up|bring|collect|drop|fetch)' THEN
    detected_skills := array_append(detected_skills, 'delivery');
  END IF;
  
  -- Repair
  IF task_text ~ '(fix|repair|broken|not working|leak|switch)' THEN
    detected_skills := array_append(detected_skills, 'repair');
  END IF;
  
  -- Tech help
  IF task_text ~ '(computer|laptop|mobile|phone|software|coding|wifi|internet)' THEN
    detected_skills := array_append(detected_skills, 'tech-help');
  END IF;
  
  -- Driving
  IF task_text ~ '(drive|driver|transport|pickup|drop|vehicle|car|bike)' THEN
    detected_skills := array_append(detected_skills, 'driving');
  END IF;
  
  -- Teaching
  IF task_text ~ '(teach|tutor|learn|help.*study|mentor|guide|interview)' THEN
    detected_skills := array_append(detected_skills, 'teaching');
  END IF;
  
  -- Cleaning
  IF task_text ~ '(clean|organize|arrange|tidy)' THEN
    detected_skills := array_append(detected_skills, 'cleaning');
  END IF;
  
  -- Pet care
  IF task_text ~ '(pet|dog|cat|animal|walk.*dog)' THEN
    detected_skills := array_append(detected_skills, 'pet-care');
  END IF;
  
  -- Default to 'general-help' if nothing detected
  IF array_length(detected_skills, 1) IS NULL THEN
    detected_skills := ARRAY['general-help'];
  END IF;
  
  -- Insert classification
  INSERT INTO task_classifications (task_id, detected_categories, classification_method, confidence_score)
  VALUES (NEW.id, detected_skills, 'keyword-matching', 0.7)
  ON CONFLICT (task_id) DO UPDATE
  SET detected_categories = detected_skills,
      updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_classify_task ON tasks;
CREATE TRIGGER trigger_auto_classify_task
  AFTER INSERT OR UPDATE OF title, description ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_classify_task();


-- ================================================================
-- STEP 9: Create Function to Notify Helpers
-- ================================================================

-- Function to notify matching helpers when task is created
CREATE OR REPLACE FUNCTION notify_matching_helpers()
RETURNS TRIGGER AS $$
DECLARE
  task_skills TEXT[];
  helper_record RECORD;
BEGIN
  -- Get task skills from classification
  SELECT detected_categories INTO task_skills
  FROM task_classifications
  WHERE task_id = NEW.id;
  
  -- If no classification yet, skip
  IF task_skills IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Find matching helpers and create notifications
  FOR helper_record IN 
    SELECT * FROM find_matching_helpers(
      NEW.id,
      task_skills,
      NEW.location::geography,
      COALESCE(NEW.budget, 0)
    )
  LOOP
    INSERT INTO helper_notifications (
      helper_id,
      task_id,
      match_score,
      matched_skills,
      distance_km
    ) VALUES (
      helper_record.helper_id,
      NEW.id,
      helper_record.match_score,
      helper_record.matched_skills,
      helper_record.distance_km
    )
    ON CONFLICT (helper_id, task_id) DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_helpers ON tasks;
CREATE TRIGGER trigger_notify_helpers
  AFTER INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_matching_helpers();


-- ================================================================
-- STEP 10: Create Views for Easy Querying
-- ================================================================

-- View: Helper Dashboard (tasks matched to helper)
CREATE OR REPLACE VIEW helper_matched_tasks AS
SELECT 
  t.id as task_id,
  t.title,
  t.description,
  t.budget,
  t.location,
  t.created_at,
  t.user_id as poster_id,
  hn.helper_id,
  hn.match_score,
  hn.distance_km,
  hn.matched_skills,
  tc.detected_categories as task_categories,
  p.full_name as poster_name,
  p.avatar_url as poster_avatar
FROM helper_notifications hn
INNER JOIN tasks t ON t.id = hn.task_id
INNER JOIN task_classifications tc ON tc.task_id = t.id
INNER JOIN profiles p ON p.id = t.user_id
WHERE t.deleted_at IS NULL
ORDER BY hn.match_score DESC, t.created_at DESC;


-- ================================================================
-- GRANTS & PERMISSIONS
-- ================================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON helper_preferences TO authenticated;
GRANT SELECT ON task_classifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON helper_task_interactions TO authenticated;
GRANT SELECT, UPDATE ON helper_notifications TO authenticated;
GRANT SELECT ON helper_matched_tasks TO authenticated;


-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Helper Mode tables created successfully!';
  RAISE NOTICE '📊 Tables created:';
  RAISE NOTICE '   - helper_preferences (user skill selections)';
  RAISE NOTICE '   - task_classifications (AI task categorization)';
  RAISE NOTICE '   - helper_task_interactions (learning data)';
  RAISE NOTICE '   - helper_notifications (match notifications)';
  RAISE NOTICE '   - skills_master (70 skills reference)';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Functions created:';
  RAISE NOTICE '   - calculate_helper_task_match()';
  RAISE NOTICE '   - find_matching_helpers()';
  RAISE NOTICE '   - auto_classify_task()';
  RAISE NOTICE '   - notify_matching_helpers()';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ Triggers active:';
  RAISE NOTICE '   - Auto-classify tasks on creation';
  RAISE NOTICE '   - Auto-notify matching helpers';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Helper Mode is ready to use!';
END $$;
