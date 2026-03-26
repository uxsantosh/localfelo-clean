-- =====================================================
-- 🚀 COMPLETE 46-CATEGORY SYSTEM SETUP
-- =====================================================
-- This is the ONE-FILE-TO-RUN-THEM-ALL for the category system
-- Run this ONCE in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Add detected_category to tasks table
-- =====================================================
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS detected_category TEXT;

-- Create index for fast filtering
CREATE INDEX IF NOT EXISTS idx_tasks_detected_category 
ON tasks(detected_category);

COMMENT ON COLUMN tasks.detected_category IS 'AI-detected service category ID (e.g. "delivery", "tech-help") - matches service_categories.id';

-- =====================================================
-- STEP 2: Ensure helper_preferences has required columns
-- =====================================================
-- These should already exist from previous migrations,
-- but we add them here for safety

-- selected_categories (array of category IDs)
ALTER TABLE helper_preferences 
ADD COLUMN IF NOT EXISTS selected_categories TEXT[] DEFAULT '{}';

-- selected_sub_skills (array of sub-skill names)
ALTER TABLE helper_preferences 
ADD COLUMN IF NOT EXISTS selected_sub_skills TEXT[] DEFAULT '{}';

-- is_available (helper mode on/off)
ALTER TABLE helper_preferences 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false;

-- max_distance (in kilometers)
ALTER TABLE helper_preferences 
ADD COLUMN IF NOT EXISTS max_distance INTEGER DEFAULT 10;

-- Create GIN indexes for array columns (faster filtering)
CREATE INDEX IF NOT EXISTS idx_helper_prefs_categories 
ON helper_preferences USING GIN(selected_categories);

CREATE INDEX IF NOT EXISTS idx_helper_prefs_subskills 
ON helper_preferences USING GIN(selected_sub_skills);

CREATE INDEX IF NOT EXISTS idx_helper_prefs_available 
ON helper_preferences(is_available) WHERE is_available = true;

COMMENT ON COLUMN helper_preferences.selected_categories IS 'Array of service category IDs (e.g. ["delivery", "tech-help", "cleaning"])';
COMMENT ON COLUMN helper_preferences.selected_sub_skills IS 'Array of specific sub-skills (e.g. ["Pickup & delivery", "Coding help"])';
COMMENT ON COLUMN helper_preferences.is_available IS 'Whether helper is currently available to receive task notifications';
COMMENT ON COLUMN helper_preferences.max_distance IS 'Maximum distance in kilometers helper is willing to travel';

-- =====================================================
-- STEP 3: Create service_categories table (46 categories)
-- =====================================================
CREATE TABLE IF NOT EXISTS service_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert all 46 service categories
INSERT INTO service_categories (id, name, description, emoji, priority) VALUES
  -- Bangalore Launch Priorities (Top 15) - priority = 1
  ('delivery', 'Delivery', 'Pick up, deliver, bring something from A to B', '🚚', 1),
  ('food-delivery', 'Bring Food', 'Bring food from home to office, tiffin delivery', '🍱', 1),
  ('luggage-help', 'Luggage Help', 'Carry luggage, bags, heavy items', '🧳', 1),
  ('drop-pickup', 'Drop Me / Pick Me', 'Drop to office, pick from station, short rides', '🚗', 1),
  ('tech-help', 'Tech Help', 'Computer, laptop, mobile, software help', '💻', 1),
  ('partner-needed', 'Partner Needed', 'Gym buddy, sports partner, work companion', '🤝', 1),
  ('mentorship', 'Mentorship', 'Career guidance, startup advice, mentoring', '🎯', 1),
  ('errands', 'Errands', 'Queue standing, bank, post office, documents', '🏃', 1),
  ('cleaning', 'Cleaning', 'House cleaning, room cleaning, deep cleaning', '🧹', 1),
  ('cooking', 'Cooking', 'Home cooking, chef for party, meal prep', '🍳', 1),
  ('laundry', 'Laundry', 'Washing, ironing, dry cleaning', '🧺', 1),
  ('grocery-shopping', 'Grocery Shopping', 'Buy groceries, market shopping', '🛒', 1),
  ('pet-care', 'Pet Care', 'Dog walking, pet sitting, feeding', '🐕', 1),
  ('fitness-partner', 'Fitness Partner', 'Gym buddy, running partner, yoga mate', '🏋️', 1),
  ('moving-packing', 'Moving & Packing', 'House shifting, office moving, packing', '📦', 1),
  
  -- Home Services
  ('plumbing', 'Plumbing', 'Tap repairs, pipe leaks, drainage', '🚰', 0),
  ('electrical', 'Electrical', 'Wiring, switches, fan repair', '⚡', 0),
  ('carpentry', 'Carpentry', 'Furniture repair, woodwork, doors', '🪚', 0),
  ('painting', 'Painting', 'Wall painting, room painting', '🎨', 0),
  ('ac-repair', 'AC & Appliance Repair', 'AC service, fridge, washing machine', '❄️', 0),
  ('installation', 'Installation', 'Furniture assembly, TV mount', '🔨', 0),
  
  -- Personal Care
  ('salon-home', 'Salon at Home', 'Haircut, styling, grooming', '💇', 0),
  ('beauty-makeup', 'Beauty & Makeup', 'Makeup, facial, bridal', '💄', 0),
  ('spa-massage', 'Spa & Massage', 'Massage, spa, wellness', '💆', 0),
  
  -- Health & Care
  ('nursing-care', 'Nursing & Healthcare', 'Nurse, patient care, medical help', '⚕️', 0),
  ('elderly-care', 'Elderly Care', 'Senior care, companionship', '👴', 0),
  ('babysitting', 'Babysitting', 'Childcare, nanny services', '👶', 0),
  
  -- Education
  ('tutoring', 'Tutoring', 'Subject tutoring, exam prep', '📚', 0),
  ('language-learning', 'Language Learning', 'English, IELTS, foreign languages', '🗣️', 0),
  ('skill-training', 'Skill Training', 'Excel, professional skills', '🎓', 0),
  ('music-dance', 'Music & Dance', 'Music lessons, dance classes', '🎵', 0),
  
  -- Technology
  ('web-development', 'Web Development', 'Website, app development', '🌐', 0),
  ('graphic-design', 'Graphic Design', 'Logo, design, video editing', '🖌️', 0),
  ('digital-marketing', 'Digital Marketing', 'Social media, SEO, ads', '📱', 0),
  
  -- Professional
  ('legal-advice', 'Legal Advice', 'Legal consultation, documentation', '⚖️', 0),
  ('accounting', 'Accounting & Tax', 'CA, GST, income tax', '📊', 0),
  ('career-counseling', 'Career Counseling', 'Resume, interview prep', '💼', 0),
  
  -- Events
  ('photography', 'Photography', 'Event, wedding photography', '📷', 0),
  ('videography', 'Videography', 'Video shoot, editing', '🎥', 0),
  ('event-planning', 'Event Planning', 'Party, wedding planning', '🎉', 0),
  
  -- Home & Lifestyle
  ('gardening', 'Gardening', 'Gardening, plant care', '🪴', 0),
  ('pest-control', 'Pest Control', 'Pest control, fumigation', '🦟', 0),
  ('interior-design', 'Interior Design', 'Interior design, home decor', '🏠', 0),
  
  -- Specialized
  ('astrology', 'Astrology & Vastu', 'Astrology, vastu consultation', '🔮', 0),
  ('religious-services', 'Religious Services', 'Pandit, puja services', '🙏', 0),
  ('locksmith', 'Locksmith', 'Lock repair, emergency unlock', '🔑', 0),
  
  -- Catch-all
  ('other', 'Other', 'Other tasks', '✨', 0)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  priority = EXCLUDED.priority;

-- =====================================================
-- STEP 4: Create Analytics Materialized View
-- =====================================================
DROP MATERIALIZED VIEW IF EXISTS mv_service_category_stats CASCADE;

CREATE MATERIALIZED VIEW mv_service_category_stats AS
SELECT 
  sc.id as category_id,
  sc.name as category_name,
  sc.emoji as category_emoji,
  sc.description,
  sc.priority,
  COUNT(t.id) as total_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN t.status IN ('accepted', 'in_progress') THEN 1 END) as active_tasks,
  AVG(t.price) as avg_budget,
  MIN(t.price) as min_budget,
  MAX(t.price) as max_budget,
  COUNT(CASE WHEN t.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as tasks_last_7d,
  COUNT(CASE WHEN t.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as tasks_last_30d,
  -- Helper matching stats
  (SELECT COUNT(DISTINCT user_id) FROM helper_preferences 
   WHERE sc.id = ANY(selected_categories) AND is_available = true) as helpers_available
FROM service_categories sc
LEFT JOIN tasks t ON t.detected_category = sc.id
GROUP BY sc.id, sc.name, sc.emoji, sc.description, sc.priority;

CREATE UNIQUE INDEX idx_mv_service_category_stats_id ON mv_service_category_stats(category_id);

-- =====================================================
-- STEP 5: Create Helper Function to Get Matching Tasks
-- =====================================================
CREATE OR REPLACE FUNCTION get_tasks_for_helper(
  p_user_id UUID,
  p_max_results INTEGER DEFAULT 50
)
RETURNS TABLE (
  task_id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  detected_category TEXT,
  distance_km DECIMAL,
  match_score INTEGER,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_helper_categories TEXT[];
  v_helper_location GEOGRAPHY;
  v_max_distance INTEGER;
BEGIN
  -- Get helper preferences
  SELECT selected_categories, ST_MakePoint(longitude, latitude)::geography, max_distance
  INTO v_helper_categories, v_helper_location, v_max_distance
  FROM helper_preferences hp
  LEFT JOIN profiles p ON p.id = hp.user_id
  WHERE hp.user_id = p_user_id AND hp.is_available = true;

  -- Return matching tasks
  RETURN QUERY
  SELECT 
    t.id as task_id,
    t.title,
    t.description,
    t.price,
    t.detected_category,
    COALESCE(ST_Distance(v_helper_location, ST_MakePoint(t.longitude, t.latitude)::geography) / 1000.0, 999999.0) as distance_km,
    CASE 
      WHEN t.detected_category = ANY(v_helper_categories) THEN 100
      ELSE 0
    END as match_score,
    t.created_at
  FROM tasks t
  WHERE 
    t.status IN ('open', 'negotiating')
    AND t.is_hidden = false
    AND t.detected_category = ANY(v_helper_categories)
    AND (v_helper_location IS NULL OR ST_Distance(v_helper_location, ST_MakePoint(t.longitude, t.latitude)::geography) / 1000.0 <= v_max_distance)
  ORDER BY match_score DESC, distance_km ASC
  LIMIT p_max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check tasks table
SELECT 
  COUNT(*) as total_tasks,
  COUNT(detected_category) as tasks_with_category,
  COUNT(DISTINCT detected_category) as unique_categories
FROM tasks;

-- Check helper_preferences table
SELECT 
  COUNT(*) as total_helpers,
  COUNT(CASE WHEN is_available = true THEN 1 END) as available_helpers,
  COUNT(CASE WHEN array_length(selected_categories, 1) > 0 THEN 1 END) as helpers_with_categories
FROM helper_preferences;

-- Check service_categories table
SELECT COUNT(*) as total_service_categories FROM service_categories;

-- Show sample data
SELECT 
  sc.id,
  sc.emoji,
  sc.name,
  COUNT(t.id) as task_count,
  (SELECT COUNT(DISTINCT user_id) FROM helper_preferences 
   WHERE sc.id = ANY(selected_categories)) as helper_count
FROM service_categories sc
LEFT JOIN tasks t ON t.detected_category = sc.id
GROUP BY sc.id, sc.emoji, sc.name, sc.priority
ORDER BY sc.priority DESC, task_count DESC
LIMIT 20;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ ========================================';
  RAISE NOTICE '✅ CATEGORY SYSTEM SETUP COMPLETE!';
  RAISE NOTICE '✅ ========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Tasks table:';
  RAISE NOTICE '   - detected_category column ✅';
  RAISE NOTICE '   - Index on detected_category ✅';
  RAISE NOTICE '';
  RAISE NOTICE '👷 Helper preferences table:';
  RAISE NOTICE '   - selected_categories column ✅';
  RAISE NOTICE '   - selected_sub_skills column ✅';
  RAISE NOTICE '   - is_available column ✅';
  RAISE NOTICE '   - max_distance column ✅';
  RAISE NOTICE '   - GIN indexes for fast array queries ✅';
  RAISE NOTICE '';
  RAISE NOTICE '🏷️ Service categories table:';
  RAISE NOTICE '   - 46 categories inserted ✅';
  RAISE NOTICE '   - 15 Bangalore priority categories marked ✅';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Analytics:';
  RAISE NOTICE '   - mv_service_category_stats view ✅';
  RAISE NOTICE '   - get_tasks_for_helper() function ✅';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '   1. Create a task (detected_category will auto-populate)';
  RAISE NOTICE '   2. Helper selects categories (selected_categories array)';
  RAISE NOTICE '   3. Perfect matching happens! ✨';
  RAISE NOTICE '';
  RAISE NOTICE '📈 Check Admin → Data Analytics to see category stats!';
  RAISE NOTICE '';
END $$;
