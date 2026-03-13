-- ================================================================
-- LOCALFELO HELPER MODE - 12 CATEGORIES SYSTEM
-- ================================================================
-- Simple card-based helper system with 12 task categories
-- Based on: /imports/helper-skill-selection-1.md
-- ================================================================

-- ================================================================
-- STEP 1: Create/Update Helper Preferences Table
-- ================================================================

CREATE TABLE IF NOT EXISTS helper_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Selected categories (12 main categories)
  selected_categories TEXT[] NOT NULL DEFAULT '{}', 
  -- Examples: ['carry-move', 'deliver', 'tech-help']
  
  -- Optional sub-skills (specific tasks within categories)
  selected_sub_skills TEXT[] DEFAULT '{}',
  -- Examples: ['Carry luggage', 'Coding help', 'Dog walking']
  
  -- Distance preference (1, 3, 5, or 10 km)
  max_distance INTEGER NOT NULL DEFAULT 5,
  
  -- Helper availability
  is_available BOOLEAN DEFAULT false,
  
  -- Onboarding status
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id),
  CONSTRAINT valid_distance_12 CHECK (max_distance IN (1, 3, 5, 10)),
  CONSTRAINT has_categories CHECK (array_length(selected_categories, 1) > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_helper_prefs_user ON helper_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_helper_prefs_available ON helper_preferences(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_helper_prefs_categories ON helper_preferences USING GIN(selected_categories);
CREATE INDEX IF NOT EXISTS idx_helper_prefs_subskills ON helper_preferences USING GIN(selected_sub_skills);

-- Enable RLS
ALTER TABLE helper_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own preferences" ON helper_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON helper_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON helper_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON helper_preferences;

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
-- STEP 2: Create Task Classifications Table
-- ================================================================

CREATE TABLE IF NOT EXISTS task_classifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  
  -- Detected categories (maps to 12 main categories)
  detected_categories TEXT[] NOT NULL DEFAULT '{}',
  -- Examples: ['carry-move', 'deliver']
  
  -- Confidence score
  confidence_score FLOAT DEFAULT 0.0,
  
  -- Classification method
  classification_method TEXT DEFAULT 'keyword-matching',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_class_task ON task_classifications(task_id);
CREATE INDEX IF NOT EXISTS idx_task_class_categories ON task_classifications USING GIN(detected_categories);

ALTER TABLE task_classifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view task classifications" ON task_classifications;

CREATE POLICY "Anyone can view task classifications"
  ON task_classifications FOR SELECT
  USING (true);


-- ================================================================
-- STEP 3: Auto-Classification Function (12 Categories)
-- ================================================================

CREATE OR REPLACE FUNCTION auto_classify_task_12_categories()
RETURNS TRIGGER AS $$
DECLARE
  detected_cats TEXT[] := '{}';
  task_text TEXT;
BEGIN
  task_text := LOWER(NEW.title || ' ' || COALESCE(NEW.description, ''));
  
  -- 1. Carry or Move Things
  IF task_text ~ '(carry|move|shift|lift|luggage|furniture|box|heavy|load|unload)' THEN
    detected_cats := array_append(detected_cats, 'carry-move');
  END IF;
  
  -- 2. Bring or Deliver Something
  IF task_text ~ '(deliver|pick.*up|bring|collect|drop|fetch|return|courier)' THEN
    detected_cats := array_append(detected_cats, 'deliver');
  END IF;
  
  -- 3. Fix Something
  IF task_text ~ '(fix|repair|broken|not working|leak|switch|tap|door|lock|appliance)' THEN
    detected_cats := array_append(detected_cats, 'fix');
  END IF;
  
  -- 4. Set Up or Install Something
  IF task_text ~ '(install|setup|assemble|mount|curtain|shelf|router|tv|furniture assembly)' THEN
    detected_cats := array_append(detected_cats, 'setup-install');
  END IF;
  
  -- 5. Drive or Transport
  IF task_text ~ '(drive|driver|transport|pickup|drop|vehicle|car|bike|taxi|fuel)' THEN
    detected_cats := array_append(detected_cats, 'drive');
  END IF;
  
  -- 6. Computer or Mobile Help
  IF task_text ~ '(computer|laptop|mobile|phone|software|coding|wifi|internet|printer|tech|debug|app)' THEN
    detected_cats := array_append(detected_cats, 'tech-help');
  END IF;
  
  -- 7. Teach or Guide
  IF task_text ~ '(teach|tutor|learn|study|mentor|guide|interview|resume|career|guidance)' THEN
    detected_cats := array_append(detected_cats, 'teach');
  END IF;
  
  -- 8. Help for Some Time
  IF task_text ~ '(help.*hours|event.*help|organize|accompany|hospital|assistant|general help)' THEN
    detected_cats := array_append(detected_cats, 'help-time');
  END IF;
  
  -- 9. Go Somewhere and Do Something
  IF task_text ~ '(submit|collect.*document|queue|visit.*office|pick.*from|go.*to)' THEN
    detected_cats := array_append(detected_cats, 'go-do');
  END IF;
  
  -- 10. Clean or Arrange Things
  IF task_text ~ '(clean|organize|arrange|tidy|room|kitchen|house.*clean|storage)' THEN
    detected_cats := array_append(detected_cats, 'clean');
  END IF;
  
  -- 11. Pet Help
  IF task_text ~ '(pet|dog|cat|animal|walk.*dog|pet.*sit|pet.*feed|groom)' THEN
    detected_cats := array_append(detected_cats, 'pet');
  END IF;
  
  -- 12. Other Tasks (default)
  IF array_length(detected_cats, 1) IS NULL THEN
    detected_cats := ARRAY['other'];
  END IF;
  
  -- Insert or update classification
  INSERT INTO task_classifications (task_id, detected_categories, classification_method, confidence_score)
  VALUES (NEW.id, detected_cats, 'keyword-matching', 0.75)
  ON CONFLICT (task_id) DO UPDATE
  SET detected_categories = detected_cats,
      updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_classify_12 ON tasks;
CREATE TRIGGER trigger_auto_classify_12
  AFTER INSERT OR UPDATE OF title, description ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_classify_task_12_categories();


-- ================================================================
-- STEP 4: Matching Function (12 Categories)
-- ================================================================

CREATE OR REPLACE FUNCTION find_helpers_for_task_12(
  p_task_id UUID,
  p_task_categories TEXT[],
  p_task_location GEOGRAPHY(POINT, 4326)
) RETURNS TABLE (
  helper_id UUID,
  match_score FLOAT,
  distance_km FLOAT,
  matched_categories TEXT[],
  matched_sub_skills TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hp.user_id,
    -- Simple scoring: 70% category match + 30% distance
    (
      (array_length(ARRAY(SELECT unnest(hp.selected_categories) INTERSECT SELECT unnest(p_task_categories)), 1)::FLOAT 
       / GREATEST(array_length(p_task_categories, 1), 1)::FLOAT) * 70.0
      +
      (1.0 - (ST_Distance(p.location::geography, p_task_location) / 1000.0 / hp.max_distance)) * 30.0
    ) as match_score,
    ST_Distance(p.location::geography, p_task_location) / 1000.0 as distance_km,
    ARRAY(SELECT unnest(hp.selected_categories) INTERSECT SELECT unnest(p_task_categories)) as matched_categories,
    ARRAY(SELECT unnest(hp.selected_sub_skills)) as matched_sub_skills
  FROM helper_preferences hp
  INNER JOIN profiles p ON p.id = hp.user_id
  WHERE 
    hp.is_available = true
    AND hp.selected_categories && p_task_categories -- Has at least one matching category
    AND ST_Distance(p.location::geography, p_task_location) / 1000.0 <= hp.max_distance
  ORDER BY match_score DESC;
END;
$$ LANGUAGE plpgsql;


-- ================================================================
-- STEP 5: Helper Dashboard View
-- ================================================================

CREATE OR REPLACE VIEW helper_available_tasks AS
SELECT 
  t.id as task_id,
  t.title,
  t.description,
  t.budget,
  t.location,
  t.created_at,
  t.user_id as poster_id,
  tc.detected_categories,
  p.full_name as poster_name,
  p.avatar_url as poster_avatar,
  ST_AsText(t.location::geometry) as location_text
FROM tasks t
INNER JOIN task_classifications tc ON tc.task_id = t.id
INNER JOIN profiles p ON p.id = t.user_id
WHERE 
  t.deleted_at IS NULL
  AND t.status = 'open'
ORDER BY t.created_at DESC;


-- ================================================================
-- STEP 6: Sample Data (Categories Reference)
-- ================================================================

-- Create a reference table for the 12 categories (optional, for documentation)
CREATE TABLE IF NOT EXISTS task_categories_reference (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL,
  example_keywords TEXT[] DEFAULT '{}'
);

-- Insert the 12 categories
INSERT INTO task_categories_reference (id, name, description, emoji, example_keywords) VALUES
  ('carry-move', 'Carry or Move Things', 'Help lifting, shifting, or carrying items.', '📦', 
   ARRAY['carry', 'move', 'shift', 'lift', 'luggage', 'furniture', 'heavy']),
  ('deliver', 'Bring or Deliver Something', 'Going somewhere to collect or deliver something.', '🚚',
   ARRAY['deliver', 'pick up', 'bring', 'collect', 'drop', 'fetch']),
  ('fix', 'Fix Something', 'Small repairs or adjustments.', '🔧',
   ARRAY['fix', 'repair', 'broken', 'leak', 'switch', 'tap']),
  ('setup-install', 'Set Up or Install Something', 'Help assembling or setting up items.', '🔨',
   ARRAY['install', 'setup', 'assemble', 'mount', 'router']),
  ('drive', 'Drive or Transport', 'Help with driving or vehicle related tasks.', '🚗',
   ARRAY['drive', 'driver', 'transport', 'pickup', 'vehicle']),
  ('tech-help', 'Computer or Mobile Help', 'Technology support tasks.', '💻',
   ARRAY['computer', 'laptop', 'mobile', 'coding', 'wifi', 'software']),
  ('teach', 'Teach or Guide', 'Helping someone learn or improve something.', '📚',
   ARRAY['teach', 'tutor', 'learn', 'mentor', 'interview', 'guidance']),
  ('help-time', 'Help for Some Time', 'Temporary assistance.', '⏰',
   ARRAY['help hours', 'event helper', 'accompany', 'assistant']),
  ('go-do', 'Go Somewhere and Do Something', 'Tasks that involve visiting a place.', '🚶',
   ARRAY['submit', 'collect documents', 'queue', 'visit office']),
  ('clean', 'Clean or Arrange Things', 'Basic cleaning or organizing help.', '🧹',
   ARRAY['clean', 'organize', 'arrange', 'tidy', 'room']),
  ('pet', 'Pet Help', 'For pet related help.', '🐕',
   ARRAY['pet', 'dog', 'cat', 'walk', 'pet sitting']),
  ('other', 'Other Tasks', 'Catch-all category.', '✨',
   ARRAY['general', 'anything', 'misc'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  example_keywords = EXCLUDED.example_keywords;


-- ================================================================
-- GRANTS & PERMISSIONS
-- ================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON helper_preferences TO authenticated;
GRANT SELECT ON task_classifications TO authenticated;
GRANT SELECT ON helper_available_tasks TO authenticated;
GRANT SELECT ON task_categories_reference TO authenticated;


-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ 12-Category Helper System created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 12 Main Categories:';
  RAISE NOTICE '   1. Carry or Move Things 📦';
  RAISE NOTICE '   2. Bring or Deliver Something 🚚';
  RAISE NOTICE '   3. Fix Something 🔧';
  RAISE NOTICE '   4. Set Up or Install Something 🔨';
  RAISE NOTICE '   5. Drive or Transport 🚗';
  RAISE NOTICE '   6. Computer or Mobile Help 💻';
  RAISE NOTICE '   7. Teach or Guide 📚';
  RAISE NOTICE '   8. Help for Some Time ⏰';
  RAISE NOTICE '   9. Go Somewhere and Do Something 🚶';
  RAISE NOTICE '  10. Clean or Arrange Things 🧹';
  RAISE NOTICE '  11. Pet Help 🐕';
  RAISE NOTICE '  12. Other Tasks ✨';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Features:';
  RAISE NOTICE '   - Card-based category selection';
  RAISE NOTICE '   - Expandable sub-skills';
  RAISE NOTICE '   - Simple distance options (1/3/5/10 km)';
  RAISE NOTICE '   - Auto-classification on task creation';
  RAISE NOTICE '   - Smart helper matching';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Ready to test!';
END $$;
