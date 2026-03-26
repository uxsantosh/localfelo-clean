-- ================================================================
-- FIX RLS POLICIES FOR HELPER_PREFERENCES
-- ================================================================
-- LocalFelo uses soft auth (no Supabase auth), so RLS must be disabled
-- OR policies must allow public access based on user_id matching
-- ================================================================

-- OPTION 1: Disable RLS (Simplest for soft auth)
ALTER TABLE helper_preferences DISABLE ROW LEVEL SECURITY;

-- OPTION 2: If you want RLS enabled, use permissive policies
-- (Comment out the above and uncomment below if you want RLS)

/*
ALTER TABLE helper_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view helper preferences" ON helper_preferences;
DROP POLICY IF EXISTS "Public can insert helper preferences" ON helper_preferences;
DROP POLICY IF EXISTS "Public can update helper preferences" ON helper_preferences;
DROP POLICY IF EXISTS "Public can delete helper preferences" ON helper_preferences;

-- Allow anyone to manage their own preferences (soft auth via user_id)
CREATE POLICY "Public can view helper preferences"
  ON helper_preferences FOR SELECT
  USING (true);

CREATE POLICY "Public can insert helper preferences"
  ON helper_preferences FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update helper preferences"
  ON helper_preferences FOR UPDATE
  USING (true);

CREATE POLICY "Public can delete helper preferences"
  ON helper_preferences FOR DELETE
  USING (true);
*/

-- ================================================================
-- VERIFICATION
-- ================================================================

SELECT 'RLS Status for helper_preferences:' as info;
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'helper_preferences';

SELECT 'Policies on helper_preferences:' as info;
SELECT 
  policyname,
  cmd as command,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'helper_preferences';
