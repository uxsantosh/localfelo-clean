-- Add onboarding tracking columns to helper_preferences table
-- This allows us to track onboarding completion and remind users

ALTER TABLE helper_preferences 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

ALTER TABLE helper_preferences 
ADD COLUMN IF NOT EXISTS onboarding_reminder_count INTEGER DEFAULT 0;

ALTER TABLE helper_preferences 
ADD COLUMN IF NOT EXISTS onboarding_skipped_at TIMESTAMP;

ALTER TABLE helper_preferences 
ADD COLUMN IF NOT EXISTS notify_urgent_tasks BOOLEAN DEFAULT true;

-- Add comments for documentation
COMMENT ON COLUMN helper_preferences.onboarding_completed IS 'Whether helper has completed the mandatory onboarding flow';
COMMENT ON COLUMN helper_preferences.onboarding_reminder_count IS 'Number of times helper has been reminded to complete onboarding';
COMMENT ON COLUMN helper_preferences.onboarding_skipped_at IS 'When helper last skipped/dismissed onboarding';
COMMENT ON COLUMN helper_preferences.notify_urgent_tasks IS 'Whether to send push notifications for urgent tasks';

-- Create index for quick onboarding status checks
CREATE INDEX IF NOT EXISTS idx_helper_preferences_onboarding 
ON helper_preferences(user_id, onboarding_completed) 
WHERE onboarding_completed = false;

-- Update existing helpers with empty skills to have smart defaults
UPDATE helper_preferences 
SET 
  show_all_tasks = true,  -- Show all tasks initially so they don't see empty screen
  onboarding_completed = false,  -- Mark as incomplete
  onboarding_reminder_count = 0,
  notify_urgent_tasks = true
WHERE 
  (skills IS NULL OR skills = '[]' OR array_length(skills, 1) = 0)
  AND onboarding_completed IS NULL;

-- Set onboarding_completed to false for NULL values
UPDATE helper_preferences 
SET onboarding_completed = COALESCE(onboarding_completed, false)
WHERE onboarding_completed IS NULL;

-- Function to check if helper needs onboarding
CREATE OR REPLACE FUNCTION needs_helper_onboarding(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_profile RECORD;
  v_prefs RECORD;
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
    skills
  INTO v_prefs
  FROM helper_preferences
  WHERE user_id = p_user_id;
  
  -- If no preferences record exists, onboarding needed
  IF v_prefs IS NULL THEN
    RETURN true;
  END IF;
  
  -- If onboarding not completed, onboarding needed
  IF v_prefs.onboarding_completed = false THEN
    RETURN true;
  END IF;
  
  -- If no skills selected, onboarding needed
  IF v_prefs.skills IS NULL OR 
     v_prefs.skills = '[]' OR 
     array_length(v_prefs.skills, 1) = 0 THEN
    RETURN true;
  END IF;
  
  -- Otherwise, onboarding not needed
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get onboarding progress
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
  
  -- Check categories
  v_has_categories := v_prefs IS NOT NULL AND 
                      v_prefs.skills IS NOT NULL AND 
                      array_length(v_prefs.skills, 1) > 0;
  
  -- Check custom skills
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
