-- Schema Alignment Migration
-- Reconciles duplicate columns and ensures data consistency

-- 1. Migrate data from max_distance_km to max_distance (prefer larger value)
UPDATE helper_preferences
SET max_distance = GREATEST(COALESCE(max_distance, 10), COALESCE(max_distance_km, 5))
WHERE max_distance_km IS NOT NULL OR max_distance IS NOT NULL;

-- 2. Drop the old max_distance_km column (use max_distance going forward)
ALTER TABLE helper_preferences
DROP COLUMN IF EXISTS max_distance_km;

-- 3. Ensure selected_categories has data from preferred_intents if empty
UPDATE helper_preferences
SET selected_categories = preferred_intents
WHERE (selected_categories IS NULL OR selected_categories = '{}' OR array_length(selected_categories, 1) IS NULL)
  AND preferred_intents IS NOT NULL 
  AND array_length(preferred_intents, 1) > 0;

-- 4. Set default for max_distance if NULL
UPDATE helper_preferences
SET max_distance = 10
WHERE max_distance IS NULL;

-- 5. Set default for min_budget if NULL
UPDATE helper_preferences
SET min_budget = 100
WHERE min_budget IS NULL;

-- 6. Ensure onboarding flags are set correctly for existing users
UPDATE helper_preferences
SET 
  onboarding_completed = CASE 
    WHEN (selected_categories IS NOT NULL AND array_length(selected_categories, 1) > 0) 
         OR (preferred_intents IS NOT NULL AND array_length(preferred_intents, 1) > 0)
    THEN true
    ELSE false
  END,
  show_all_tasks = CASE
    WHEN (selected_categories IS NULL OR selected_categories = '{}' OR array_length(selected_categories, 1) IS NULL)
         AND (preferred_intents IS NULL OR preferred_intents = '{}' OR array_length(preferred_intents, 1) IS NULL)
    THEN true  -- Show all tasks if no categories selected
    ELSE COALESCE(show_all_tasks, false)
  END
WHERE onboarding_completed IS NULL OR onboarding_completed = false;

-- 7. Add comments for clarity
COMMENT ON COLUMN helper_preferences.preferred_intents IS 'DEPRECATED: Use selected_categories instead. Kept for backward compatibility.';
COMMENT ON COLUMN helper_preferences.selected_categories IS 'Array of category slugs helper is interested in (replaces preferred_intents)';
COMMENT ON COLUMN helper_preferences.max_distance IS 'Maximum distance in kilometers for task matching';

-- 8. Create a view that unifies both columns for backward compatibility
CREATE OR REPLACE VIEW helper_preferences_unified AS
SELECT 
  id,
  user_id,
  is_active,
  -- Use selected_categories if available, fall back to preferred_intents
  COALESCE(
    NULLIF(selected_categories, '{}'),
    preferred_intents
  ) as categories,
  max_distance,
  min_budget,
  max_budget,
  preferred_effort_levels,
  show_uncategorized_tasks,
  show_all_tasks,
  min_confidence_threshold,
  onboarding_completed,
  onboarding_reminder_count,
  onboarding_skipped_at,
  notify_urgent_tasks,
  created_at,
  updated_at
FROM helper_preferences;

-- Grant access to the view
GRANT SELECT ON helper_preferences_unified TO authenticated;

-- 9. Update the needs_helper_onboarding function to check both columns
CREATE OR REPLACE FUNCTION needs_helper_onboarding(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_profile RECORD;
  v_prefs RECORD;
  v_has_categories BOOLEAN;
BEGIN
  -- Get profile
  SELECT helper_mode INTO v_profile
  FROM profiles
  WHERE user_id = p_user_id;
  
  -- If helper mode is not enabled, no onboarding needed
  IF v_profile.helper_mode IS NULL OR v_profile.helper_mode = false THEN
    RETURN false;
  END IF;
  
  -- Get preferences
  SELECT 
    onboarding_completed,
    selected_categories,
    preferred_intents
  INTO v_prefs
  FROM helper_preferences
  WHERE user_id = p_user_id;
  
  -- If no preferences record exists, onboarding needed
  IF v_prefs IS NULL THEN
    RETURN true;
  END IF;
  
  -- If onboarding marked complete, no onboarding needed
  IF v_prefs.onboarding_completed = true THEN
    RETURN false;
  END IF;
  
  -- Check if categories exist in either column
  v_has_categories := (
    (v_prefs.selected_categories IS NOT NULL AND array_length(v_prefs.selected_categories, 1) > 0)
    OR (v_prefs.preferred_intents IS NOT NULL AND array_length(v_prefs.preferred_intents, 1) > 0)
  );
  
  -- If no categories, onboarding needed
  RETURN NOT v_has_categories;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Update get_helper_onboarding_progress to check both columns
CREATE OR REPLACE FUNCTION get_helper_onboarding_progress(p_user_id UUID)
RETURNS TABLE (
  has_categories BOOLEAN,
  has_skills BOOLEAN,
  has_availability BOOLEAN,
  progress_percent INTEGER,
  is_complete BOOLEAN
) AS $$
DECLARE
  v_prefs RECORD;
  v_custom_skills_count INTEGER;
  v_has_categories BOOLEAN;
  v_has_skills BOOLEAN;
  v_has_availability BOOLEAN;
  v_progress INTEGER;
BEGIN
  -- Get preferences
  SELECT * INTO v_prefs
  FROM helper_preferences
  WHERE user_id = p_user_id;
  
  -- Check categories (check both columns)
  v_has_categories := v_prefs IS NOT NULL AND (
    (v_prefs.selected_categories IS NOT NULL AND array_length(v_prefs.selected_categories, 1) > 0)
    OR (v_prefs.preferred_intents IS NOT NULL AND array_length(v_prefs.preferred_intents, 1) > 0)
  );
  
  -- Check custom skills (from helper_custom_skills table)
  SELECT COUNT(*) INTO v_custom_skills_count
  FROM helper_custom_skills
  WHERE user_id = p_user_id;
  
  v_has_skills := v_custom_skills_count > 0;
  
  -- Check availability (distance and budget set)
  v_has_availability := v_prefs IS NOT NULL AND 
                        v_prefs.max_distance IS NOT NULL AND 
                        v_prefs.min_budget IS NOT NULL;
  
  -- Calculate progress
  v_progress := 0;
  IF v_has_categories THEN v_progress := v_progress + 33; END IF;
  IF v_has_skills THEN v_progress := v_progress + 33; END IF;
  IF v_has_availability THEN v_progress := v_progress + 34; END IF;
  
  RETURN QUERY SELECT 
    v_has_categories,
    v_has_skills,
    v_has_availability,
    v_progress,
    (v_has_categories AND v_has_availability) as is_complete;  -- Skills optional
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION needs_helper_onboarding(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_helper_onboarding_progress(UUID) TO authenticated;
