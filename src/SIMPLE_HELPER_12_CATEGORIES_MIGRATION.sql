-- ================================================================
-- LOCALFELO HELPER MODE - 12 CATEGORIES MIGRATION
-- ================================================================
-- SAFE migration that updates existing helper_preferences table
-- ================================================================

-- ================================================================
-- STEP 0: Enable PostGIS Extension
-- ================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- ================================================================
-- STEP 1: Update Existing helper_preferences Table
-- ================================================================

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add selected_sub_skills column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'helper_preferences' AND column_name = 'selected_sub_skills'
  ) THEN
    ALTER TABLE helper_preferences ADD COLUMN selected_sub_skills TEXT[] DEFAULT '{}';
  END IF;

  -- Add is_available column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'helper_preferences' AND column_name = 'is_available'
  ) THEN
    ALTER TABLE helper_preferences ADD COLUMN is_available BOOLEAN DEFAULT false;
  END IF;

  -- Add onboarding_completed column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'helper_preferences' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE helper_preferences ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
  END IF;

  -- Add updated_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'helper_preferences' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE helper_preferences ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Drop old constraints if they exist
DO $$ 
BEGIN
  ALTER TABLE helper_preferences DROP CONSTRAINT IF EXISTS valid_distance;
  ALTER TABLE helper_preferences DROP CONSTRAINT IF EXISTS valid_budget;
  ALTER TABLE helper_preferences DROP CONSTRAINT IF EXISTS has_skills;
  ALTER TABLE helper_preferences DROP CONSTRAINT IF EXISTS valid_distance_12;
  ALTER TABLE helper_preferences DROP CONSTRAINT IF EXISTS has_categories;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Add new constraints for 12-category system
DO $$
BEGIN
  ALTER TABLE helper_preferences ADD CONSTRAINT valid_distance_12 CHECK (max_distance IN (1, 3, 5, 10));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE helper_preferences ADD CONSTRAINT has_categories CHECK (array_length(selected_categories, 1) > 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes (drop first if exist)
DROP INDEX IF EXISTS idx_helper_prefs_user;
DROP INDEX IF EXISTS idx_helper_prefs_available;
DROP INDEX IF EXISTS idx_helper_prefs_categories;
DROP INDEX IF EXISTS idx_helper_prefs_subskills;
DROP INDEX IF EXISTS idx_helper_preferences_user_id;
DROP INDEX IF EXISTS idx_helper_preferences_available;
DROP INDEX IF EXISTS idx_helper_preferences_skills;

CREATE INDEX idx_helper_prefs_user ON helper_preferences(user_id);
CREATE INDEX idx_helper_prefs_available ON helper_preferences(is_available) WHERE is_available = true;
CREATE INDEX idx_helper_prefs_categories ON helper_preferences USING GIN(selected_categories);
CREATE INDEX idx_helper_prefs_subskills ON helper_preferences USING GIN(selected_sub_skills);

-- Enable RLS
ALTER TABLE helper_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own preferences" ON helper_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON helper_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON helper_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON helper_preferences;

-- Create RLS Policies
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
  detected_categories TEXT[] NOT NULL DEFAULT '{}',
  confidence_score FLOAT DEFAULT 0.0,
  classification_method TEXT DEFAULT 'keyword-matching',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id)
);

-- Indexes
DROP INDEX IF EXISTS idx_task_class_task;
DROP INDEX IF EXISTS idx_task_class_categories;

CREATE INDEX idx_task_class_task ON task_classifications(task_id);
CREATE INDEX idx_task_class_categories ON task_classifications USING GIN(detected_categories);

-- Enable RLS
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
DROP TRIGGER IF EXISTS trigger_auto_classify_task ON tasks;

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
  p_task_lat FLOAT,
  p_task_lng FLOAT
) RETURNS TABLE (
  helper_id UUID,
  match_score FLOAT,
  distance_km FLOAT,
  matched_categories TEXT[],
  matched_sub_skills TEXT[]
) AS $$
DECLARE
  task_location GEOGRAPHY(POINT, 4326);
BEGIN
  -- Create geography point from lat/lng
  task_location := ST_SetSRID(ST_MakePoint(p_task_lng, p_task_lat), 4326)::geography;
  
  RETURN QUERY
  SELECT 
    hp.user_id,
    -- Simple scoring: 70% category match + 30% distance
    (
      (array_length(ARRAY(SELECT unnest(hp.selected_categories) INTERSECT SELECT unnest(p_task_categories)), 1)::FLOAT 
       / GREATEST(array_length(p_task_categories, 1), 1)::FLOAT) * 70.0
      +
      (1.0 - LEAST(ST_Distance(p.location::geography, task_location) / 1000.0 / hp.max_distance, 1.0)) * 30.0
    ) as match_score,
    ST_Distance(p.location::geography, task_location) / 1000.0 as distance_km,
    ARRAY(SELECT unnest(hp.selected_categories) INTERSECT SELECT unnest(p_task_categories)) as matched_categories,
    COALESCE(hp.selected_sub_skills, ARRAY[]::TEXT[]) as matched_sub_skills
  FROM helper_preferences hp
  INNER JOIN profiles p ON p.id = hp.user_id
  WHERE 
    hp.is_available = true
    AND hp.selected_categories && p_task_categories -- Has at least one matching category
    AND ST_Distance(p.location::geography, task_location) / 1000.0 <= hp.max_distance
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
  t.price,
  t.latitude,
  t.longitude,
  t.created_at,
  t.user_id as poster_id,
  tc.detected_categories,
  p.name as poster_name,
  p.phone as poster_phone
FROM tasks t
LEFT JOIN task_classifications tc ON tc.task_id = t.id
INNER JOIN profiles p ON p.id = t.user_id
WHERE 
  t.is_hidden = false
  AND (t.status IS NULL OR t.status = 'open')
ORDER BY t.created_at DESC;


-- ================================================================
-- STEP 6: Categories Reference Table
-- ================================================================

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
  RAISE NOTICE '';
  RAISE NOTICE '✅ ✅ ✅ MIGRATION COMPLETE! ✅ ✅ ✅';
  RAISE NOTICE '';
  RAISE NOTICE '📋 12-Category Helper System Ready:';
  RAISE NOTICE '   1. 📦 Carry or Move Things';
  RAISE NOTICE '   2. 🚚 Bring or Deliver Something';
  RAISE NOTICE '   3. 🔧 Fix Something';
  RAISE NOTICE '   4. 🔨 Set Up or Install Something';
  RAISE NOTICE '   5. 🚗 Drive or Transport';
  RAISE NOTICE '   6. 💻 Computer or Mobile Help';
  RAISE NOTICE '   7. 📚 Teach or Guide';
  RAISE NOTICE '   8. ⏰ Help for Some Time';
  RAISE NOTICE '   9. 🚶 Go Somewhere and Do Something';
  RAISE NOTICE '  10. 🧹 Clean or Arrange Things';
  RAISE NOTICE '  11. 🐕 Pet Help';
  RAISE NOTICE '  12. ✨ Other Tasks';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tables updated:';
  RAISE NOTICE '   - helper_preferences (migrated to 12 categories)';
  RAISE NOTICE '   - task_classifications (created/updated)';
  RAISE NOTICE '   - task_categories_reference (created)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Functions created:';
  RAISE NOTICE '   - auto_classify_task_12_categories()';
  RAISE NOTICE '   - find_helpers_for_task_12()';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Trigger active:';
  RAISE NOTICE '   - trigger_auto_classify_12 (auto-classifies tasks)';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 NOW: Hard refresh browser (Ctrl+Shift+R) and test!';
  RAISE NOTICE '';
END $$;