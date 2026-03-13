-- =====================================================
-- AVATAR & RATING SYSTEM - DATABASE MIGRATION
-- LocalFelo Platform - Run these queries in Supabase SQL Editor
-- =====================================================

-- 1. ADD AVATAR AND GENDER COLUMNS TO PROFILES TABLE
-- =====================================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other'));

-- Add index for faster avatar queries
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url) WHERE avatar_url IS NOT NULL;

COMMENT ON COLUMN profiles.avatar_url IS 'URL to user profile photo stored in Supabase Storage';
COMMENT ON COLUMN profiles.gender IS 'User gender: male, female, or other - optional field';

-- =====================================================
-- 2. ADD RATING COLUMNS TO PROFILES TABLE
-- =====================================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS helper_rating_avg NUMERIC(3,2) DEFAULT 0 CHECK (helper_rating_avg >= 0 AND helper_rating_avg <= 5),
ADD COLUMN IF NOT EXISTS helper_rating_count INTEGER DEFAULT 0 CHECK (helper_rating_count >= 0),
ADD COLUMN IF NOT EXISTS task_owner_rating_avg NUMERIC(3,2) DEFAULT 0 CHECK (task_owner_rating_avg >= 0 AND task_owner_rating_avg <= 5),
ADD COLUMN IF NOT EXISTS task_owner_rating_count INTEGER DEFAULT 0 CHECK (task_owner_rating_count >= 0);

-- Add index for rating queries
CREATE INDEX IF NOT EXISTS idx_profiles_helper_rating ON profiles(helper_rating_avg) WHERE helper_rating_count > 0;
CREATE INDEX IF NOT EXISTS idx_profiles_owner_rating ON profiles(task_owner_rating_avg) WHERE task_owner_rating_count > 0;

COMMENT ON COLUMN profiles.helper_rating_avg IS 'Average rating when user acts as a helper (0-5 stars)';
COMMENT ON COLUMN profiles.helper_rating_count IS 'Total number of ratings received as helper';
COMMENT ON COLUMN profiles.task_owner_rating_avg IS 'Average rating when user acts as task owner (0-5 stars)';
COMMENT ON COLUMN profiles.task_owner_rating_count IS 'Total number of ratings received as task owner';

-- =====================================================
-- 3. CREATE RATINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rater_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating_type TEXT NOT NULL CHECK (rating_type IN ('helper', 'task_owner')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only rate another user once per task per type
  UNIQUE(task_id, rated_user_id, rater_user_id, rating_type)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ratings_rated_user ON ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rater_user ON ratings(rater_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_task ON ratings(task_id);
CREATE INDEX IF NOT EXISTS idx_ratings_type ON ratings(rating_type);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at DESC);

COMMENT ON TABLE ratings IS 'Stores all user ratings after task completion';
COMMENT ON COLUMN ratings.rated_user_id IS 'User who is being rated';
COMMENT ON COLUMN ratings.rater_user_id IS 'User who is giving the rating';
COMMENT ON COLUMN ratings.rating_type IS 'Whether rating is for helper or task owner';
COMMENT ON COLUMN ratings.rating IS 'Star rating from 1-5';
COMMENT ON COLUMN ratings.comment IS 'Optional text feedback';

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS) ON RATINGS
-- =====================================================
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Allow users to view all ratings
CREATE POLICY "Anyone can view ratings"
  ON ratings FOR SELECT
  USING (true);

-- Allow users to insert ratings
CREATE POLICY "Users can create ratings"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = rater_user_id);

-- Prevent updates to ratings (ratings are immutable once created)
CREATE POLICY "Ratings cannot be updated"
  ON ratings FOR UPDATE
  USING (false);

-- Allow users to delete their own ratings (in case of mistakes within a short time)
CREATE POLICY "Users can delete own ratings within 24 hours"
  ON ratings FOR DELETE
  USING (
    auth.uid() = rater_user_id 
    AND created_at > NOW() - INTERVAL '24 hours'
  );

-- =====================================================
-- 5. CREATE FUNCTION TO UPDATE AVERAGE RATINGS
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_average_ratings(user_id UUID)
RETURNS VOID AS $$
DECLARE
  helper_avg NUMERIC(3,2);
  helper_count INTEGER;
  owner_avg NUMERIC(3,2);
  owner_count INTEGER;
BEGIN
  -- Calculate helper rating average
  SELECT 
    COALESCE(AVG(rating), 0)::NUMERIC(3,2),
    COUNT(*)::INTEGER
  INTO helper_avg, helper_count
  FROM ratings
  WHERE rated_user_id = user_id AND rating_type = 'helper';
  
  -- Calculate task owner rating average
  SELECT 
    COALESCE(AVG(rating), 0)::NUMERIC(3,2),
    COUNT(*)::INTEGER
  INTO owner_avg, owner_count
  FROM ratings
  WHERE rated_user_id = user_id AND rating_type = 'task_owner';
  
  -- Update user profile
  UPDATE profiles
  SET 
    helper_rating_avg = helper_avg,
    helper_rating_count = helper_count,
    task_owner_rating_avg = owner_avg,
    task_owner_rating_count = owner_count
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. CREATE TRIGGER TO AUTO-UPDATE RATINGS
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_update_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update ratings for the rated user
  PERFORM update_user_average_ratings(NEW.rated_user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ratings_insert_trigger
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_ratings();

CREATE TRIGGER ratings_delete_trigger
  AFTER DELETE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_ratings();

-- =====================================================
-- 7. CREATE STORAGE BUCKET FOR AVATARS
-- =====================================================
-- Note: This needs to be run through Supabase Dashboard or using storage API
-- Go to Storage > Create Bucket > Name: "user-uploads" > Public: true

-- RLS policies for storage (run after creating bucket)
-- These are example policies - adjust based on your security needs

/*
-- Allow anyone to view avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-uploads' 
    AND (storage.foldername(name))[1] = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-uploads' 
    AND (storage.foldername(name))[1] = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-uploads' 
    AND (storage.foldername(name))[1] = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );
*/

-- =====================================================
-- 8. HELPFUL QUERIES FOR TESTING
-- =====================================================

-- View all ratings for a specific user
/*
SELECT 
  r.*,
  rater.name as rater_name,
  t.title as task_title
FROM ratings r
JOIN profiles rater ON r.rater_user_id = rater.id
JOIN tasks t ON r.task_id = t.id
WHERE r.rated_user_id = 'USER_ID_HERE'
ORDER BY r.created_at DESC;
*/

-- View user profile with ratings
/*
SELECT 
  id,
  name,
  avatar_url,
  gender,
  helper_rating_avg,
  helper_rating_count,
  task_owner_rating_avg,
  task_owner_rating_count
FROM profiles
WHERE id = 'USER_ID_HERE';
*/

-- Get top rated helpers
/*
SELECT 
  id,
  name,
  avatar_url,
  helper_rating_avg,
  helper_rating_count
FROM profiles
WHERE helper_rating_count > 0
ORDER BY helper_rating_avg DESC, helper_rating_count DESC
LIMIT 10;
*/

-- Get top rated task creators
/*
SELECT 
  id,
  name,
  avatar_url,
  task_owner_rating_avg,
  task_owner_rating_count
FROM profiles
WHERE task_owner_rating_count > 0
ORDER BY task_owner_rating_avg DESC, task_owner_rating_count DESC
LIMIT 10;
*/

-- =====================================================
-- 9. ADMIN VIEWS FOR RATING MANAGEMENT
-- =====================================================

-- Create admin view for all ratings
CREATE OR REPLACE VIEW admin_ratings_view AS
SELECT 
  r.id,
  r.task_id,
  t.title as task_title,
  r.rated_user_id,
  rated.name as rated_user_name,
  r.rater_user_id,
  rater.name as rater_user_name,
  r.rating_type,
  r.rating,
  r.comment,
  r.created_at
FROM ratings r
JOIN profiles rated ON r.rated_user_id = rated.id
JOIN profiles rater ON r.rater_user_id = rater.id
JOIN tasks t ON r.task_id = t.id
ORDER BY r.created_at DESC;

-- Grant access to authenticated users (adjust based on your admin role setup)
GRANT SELECT ON admin_ratings_view TO authenticated;

-- =====================================================
-- 10. DATA VALIDATION
-- =====================================================

-- Ensure all existing profiles have default rating values
UPDATE profiles
SET 
  helper_rating_avg = COALESCE(helper_rating_avg, 0),
  helper_rating_count = COALESCE(helper_rating_count, 0),
  task_owner_rating_avg = COALESCE(task_owner_rating_avg, 0),
  task_owner_rating_count = COALESCE(task_owner_rating_count, 0)
WHERE 
  helper_rating_avg IS NULL 
  OR helper_rating_count IS NULL 
  OR task_owner_rating_avg IS NULL 
  OR task_owner_rating_count IS NULL;

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================

-- Summary of changes:
-- ✅ Added avatar_url and gender columns to profiles
-- ✅ Added rating columns to profiles (helper and task owner averages)
-- ✅ Created ratings table with proper constraints
-- ✅ Set up RLS policies for ratings
-- ✅ Created automatic rating calculation function and triggers
-- ✅ Created admin views for rating management
-- ✅ Validated existing data

-- Next steps:
-- 1. Create storage bucket "user-uploads" in Supabase Dashboard
-- 2. Configure storage RLS policies (examples provided above)
-- 3. Test avatar upload functionality
-- 4. Test rating submission and calculation
-- 5. Verify rating display in profile screens
