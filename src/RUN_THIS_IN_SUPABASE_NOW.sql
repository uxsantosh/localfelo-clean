-- =====================================================
-- 🚀 COPY AND PASTE THIS ENTIRE FILE INTO SUPABASE SQL EDITOR
-- This creates the job system upgrade in one go
-- =====================================================

-- ========================================
-- 1. CREATE: job_suggestions table
-- ========================================

CREATE TABLE IF NOT EXISTS public.job_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  intent TEXT NOT NULL CHECK (intent IN (
    'bring_buy', 'pickup_drop', 'fix_install', 'clean_work',
    'move_carry', 'personal_help', 'vehicle_help', 'teaching_skill',
    'event_help', 'other'
  )),
  effort_level TEXT NOT NULL CHECK (effort_level IN ('easy', 'medium', 'hard')),
  keywords TEXT[] DEFAULT '{}',
  typical_budget_min INTEGER DEFAULT 100,
  typical_budget_max INTEGER DEFAULT 500,
  popularity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_suggestions_keywords ON public.job_suggestions USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_job_suggestions_popularity ON public.job_suggestions(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_job_suggestions_intent ON public.job_suggestions(intent);

ALTER TABLE public.job_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active job suggestions" ON public.job_suggestions;
CREATE POLICY "Anyone can view active job suggestions"
  ON public.job_suggestions FOR SELECT USING (is_active = true);

-- ========================================
-- 2. ALTER: tasks table - Add job metadata
-- ========================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='intent') THEN
    ALTER TABLE public.tasks ADD COLUMN intent TEXT CHECK (intent IN (
      'bring_buy', 'pickup_drop', 'fix_install', 'clean_work',
      'move_carry', 'personal_help', 'vehicle_help', 'teaching_skill',
      'event_help', 'other'
    ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='effort_level') THEN
    ALTER TABLE public.tasks ADD COLUMN effort_level TEXT CHECK (effort_level IN ('easy', 'medium', 'hard'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='internal_category') THEN
    ALTER TABLE public.tasks ADD COLUMN internal_category TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='suggestion_id') THEN
    ALTER TABLE public.tasks ADD COLUMN suggestion_id UUID REFERENCES public.job_suggestions(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tasks_intent ON public.tasks(intent) WHERE intent IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_effort_level ON public.tasks(effort_level) WHERE effort_level IS NOT NULL;

-- ========================================
-- 3. CREATE: job_popularity_tracking table
-- ========================================

CREATE TABLE IF NOT EXISTS public.job_popularity_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  last_posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_job_popularity_title_unique ON public.job_popularity_tracking(LOWER(job_title));
CREATE INDEX IF NOT EXISTS idx_job_popularity_count ON public.job_popularity_tracking(count DESC);

ALTER TABLE public.job_popularity_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view job popularity" ON public.job_popularity_tracking;
CREATE POLICY "Anyone can view job popularity"
  ON public.job_popularity_tracking FOR SELECT USING (true);

-- ========================================
-- 4. CREATE: helper_preferences table
-- ========================================

CREATE TABLE IF NOT EXISTS public.helper_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT false,
  preferred_intents TEXT[] DEFAULT '{}',
  max_distance_km INTEGER DEFAULT 5,
  min_budget INTEGER DEFAULT NULL,
  max_budget INTEGER DEFAULT NULL,
  preferred_effort_levels TEXT[] DEFAULT ARRAY['easy', 'medium', 'hard'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_helper_preferences_active ON public.helper_preferences(user_id) WHERE is_active = true;

ALTER TABLE public.helper_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own helper preferences" ON public.helper_preferences;
CREATE POLICY "Users can view own helper preferences"
  ON public.helper_preferences FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own helper preferences" ON public.helper_preferences;
CREATE POLICY "Users can insert own helper preferences"
  ON public.helper_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own helper preferences" ON public.helper_preferences;
CREATE POLICY "Users can update own helper preferences"
  ON public.helper_preferences FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- 5. CREATE FUNCTION: increment_job_suggestion_popularity
-- ========================================

CREATE OR REPLACE FUNCTION public.increment_job_suggestion_popularity(suggestion_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.job_suggestions
  SET popularity = popularity + 1, updated_at = CURRENT_TIMESTAMP
  WHERE id = suggestion_id;
END;
$$;

-- ========================================
-- 6. CREATE FUNCTION: track_job_popularity (trigger)
-- ========================================

CREATE OR REPLACE FUNCTION public.track_job_popularity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.job_popularity_tracking (job_title, count, last_posted_at)
    VALUES (NEW.title, 1, CURRENT_TIMESTAMP)
    ON CONFLICT (LOWER(job_title))
    DO UPDATE SET count = job_popularity_tracking.count + 1, last_posted_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS track_job_popularity_trigger ON public.tasks;
CREATE TRIGGER track_job_popularity_trigger
  AFTER INSERT ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.track_job_popularity();

-- ========================================
-- 7. SEED DATA: 40+ job suggestions
-- ========================================

INSERT INTO public.job_suggestions (title, intent, effort_level, keywords, typical_budget_min, typical_budget_max, popularity) VALUES
-- Bring/Buy (most common in India)
('Bring Groceries', 'bring_buy', 'easy', ARRAY['bring', 'groceries', 'vegetables', 'shopping', 'sabzi'], 50, 200, 100),
('Bring Gas Cylinder', 'bring_buy', 'medium', ARRAY['bring', 'gas', 'cylinder', 'lpg'], 100, 300, 90),
('Bring Medicine', 'bring_buy', 'easy', ARRAY['bring', 'medicine', 'pharmacy', 'medical'], 50, 150, 80),
('Buy & Bring Items', 'bring_buy', 'easy', ARRAY['buy', 'bring', 'items', 'shopping'], 50, 200, 70),

-- Pickup/Drop
('Pickup Parcel', 'pickup_drop', 'easy', ARRAY['pickup', 'parcel', 'package', 'courier'], 50, 200, 95),
('Drop Parcel', 'pickup_drop', 'easy', ARRAY['drop', 'parcel', 'package', 'delivery'], 50, 200, 85),
('Airport Pickup', 'pickup_drop', 'medium', ARRAY['airport', 'pickup', 'drop'], 200, 1000, 60),
('Station Pickup', 'pickup_drop', 'medium', ARRAY['station', 'railway', 'pickup', 'drop'], 100, 500, 55),

-- Fix/Install (high demand)
('Fix Fan', 'fix_install', 'medium', ARRAY['fix', 'fan', 'repair', 'ceiling'], 100, 500, 85),
('Fix Tap', 'fix_install', 'medium', ARRAY['fix', 'tap', 'faucet', 'leak', 'plumbing'], 150, 800, 80),
('Fix Light', 'fix_install', 'easy', ARRAY['fix', 'light', 'bulb', 'tube', 'electrical'], 100, 500, 75),
('Fix Water Pipe', 'fix_install', 'hard', ARRAY['fix', 'pipe', 'water', 'leak', 'plumbing'], 200, 1500, 70),
('Install AC', 'fix_install', 'hard', ARRAY['install', 'ac', 'air conditioner'], 300, 1500, 65),
('Fix AC', 'fix_install', 'hard', ARRAY['fix', 'ac', 'air conditioner', 'repair', 'service'], 300, 2000, 75),
('Fix WiFi', 'fix_install', 'medium', ARRAY['fix', 'wifi', 'internet', 'router', 'network'], 150, 800, 60),
('Install TV', 'fix_install', 'medium', ARRAY['install', 'tv', 'television', 'mount'], 200, 1000, 50),

-- Clean/Work
('Clean House', 'clean_work', 'medium', ARRAY['clean', 'house', 'home', 'room'], 300, 1500, 90),
('Clean Kitchen', 'clean_work', 'medium', ARRAY['clean', 'kitchen'], 200, 800, 70),
('Clean Bathroom', 'clean_work', 'medium', ARRAY['clean', 'bathroom', 'toilet'], 200, 800, 65),
('Clean Balcony', 'clean_work', 'easy', ARRAY['clean', 'balcony', 'terrace'], 100, 500, 60),
('Wash Car', 'clean_work', 'easy', ARRAY['wash', 'car', 'vehicle'], 100, 400, 80),
('Wash Bike', 'clean_work', 'easy', ARRAY['wash', 'bike', 'motorcycle', 'scooter'], 50, 200, 75),

-- Move/Carry
('Move Furniture', 'move_carry', 'hard', ARRAY['move', 'furniture', 'shift', 'carry'], 300, 2000, 85),
('Shift Luggage', 'move_carry', 'medium', ARRAY['shift', 'luggage', 'bags', 'carry'], 100, 500, 70),
('Move Bed', 'move_carry', 'hard', ARRAY['move', 'bed', 'shift'], 200, 1000, 60),
('Shift House', 'move_carry', 'hard', ARRAY['shift', 'house', 'home', 'moving', 'relocation'], 1000, 10000, 55),

-- Personal Help
('Stand in Queue', 'personal_help', 'easy', ARRAY['stand', 'queue', 'line', 'wait'], 100, 500, 65),
('Submit Documents', 'personal_help', 'easy', ARRAY['submit', 'documents', 'papers', 'office'], 100, 400, 60),
('Photocopy Help', 'personal_help', 'easy', ARRAY['photocopy', 'xerox', 'copy'], 50, 200, 55),
('Need Driver', 'personal_help', 'medium', ARRAY['driver', 'drive', 'car'], 200, 1000, 70),

-- Vehicle Help
('Need Tempo', 'vehicle_help', 'medium', ARRAY['tempo', 'truck', 'vehicle'], 500, 3000, 75),
('Need Auto', 'vehicle_help', 'easy', ARRAY['auto', 'rickshaw'], 50, 500, 65),
('Bike Rental', 'vehicle_help', 'easy', ARRAY['bike', 'rental', 'rent'], 200, 800, 60),

-- Teaching/Skill
('Teach Excel', 'teaching_skill', 'easy', ARRAY['teach', 'excel', 'spreadsheet'], 200, 1000, 50),
('Computer Help', 'teaching_skill', 'easy', ARRAY['computer', 'help', 'laptop', 'software'], 150, 800, 55),
('Home Tuition', 'teaching_skill', 'easy', ARRAY['tuition', 'teach', 'study', 'homework'], 300, 1500, 60),

-- Event Help
('Photography', 'event_help', 'medium', ARRAY['photography', 'photo', 'camera'], 500, 5000, 50),
('Event Help', 'event_help', 'medium', ARRAY['event', 'party', 'function'], 300, 3000, 45),
('Decoration', 'event_help', 'medium', ARRAY['decoration', 'decor', 'birthday'], 500, 5000, 40)
ON CONFLICT DO NOTHING;

-- ========================================
-- 8. GRANT PERMISSIONS
-- ========================================

GRANT SELECT, INSERT, UPDATE ON public.job_suggestions TO authenticated, anon;
GRANT SELECT ON public.job_popularity_tracking TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.helper_preferences TO authenticated;

-- ========================================
-- ✅ VERIFICATION - Run these to check
-- ========================================

-- Count suggestions
SELECT COUNT(*) as total_suggestions FROM public.job_suggestions;

-- Show top 10 popular suggestions
SELECT title, intent, effort_level, popularity 
FROM public.job_suggestions 
ORDER BY popularity DESC 
LIMIT 10;

-- Check new task columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name IN ('intent', 'effort_level', 'internal_category', 'suggestion_id');

-- ========================================
-- 🎉 DONE! Your job system is upgraded!
-- ========================================
