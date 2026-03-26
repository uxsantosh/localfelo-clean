-- =====================================================
-- FIX RLS POLICIES ON PROFILES TABLE
-- This allows updates without authentication
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can create profile" ON profiles;
DROP POLICY IF EXISTS "Users can update profile with token" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Recreate with proper permissions
CREATE POLICY "profiles_select_all" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "profiles_insert_all" 
ON profiles FOR INSERT 
WITH CHECK (true);

CREATE POLICY "profiles_update_all" 
ON profiles FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "profiles_delete_all" 
ON profiles FOR DELETE 
USING (true);

-- Verify RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Check current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';
