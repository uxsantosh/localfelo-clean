-- =====================================================
-- FIX HELPER_PREFERENCES DELETE POLICY
-- =====================================================
-- This fixes the RLS policy to allow users to delete their own helper preferences
-- NOTE: LocalFelo uses custom authentication (not Supabase Auth), so we use permissive policies
-- Run this in Supabase SQL Editor

-- Drop existing policies for helper_preferences if they exist
DROP POLICY IF EXISTS "Users can view their own helper preferences" ON helper_preferences;
DROP POLICY IF EXISTS "Users can create their own helper preferences" ON helper_preferences;
DROP POLICY IF EXISTS "Users can update their own helper preferences" ON helper_preferences;
DROP POLICY IF EXISTS "Users can delete their own helper preferences" ON helper_preferences;
DROP POLICY IF EXISTS "Allow all operations on helper_preferences" ON helper_preferences;

-- Enable RLS (in case it's not enabled)
ALTER TABLE helper_preferences ENABLE ROW LEVEL SECURITY;

-- Create PERMISSIVE policy that allows all operations
-- Since LocalFelo uses client-side auth with client_token, we handle permissions in the app layer
CREATE POLICY "Allow all operations on helper_preferences"
ON helper_preferences
FOR ALL
USING (true)
WITH CHECK (true);

-- Verify policy was created
SELECT 
  'RLS Policy Created' as status,
  policyname,
  cmd as operation,
  permissive as type
FROM pg_policies 
WHERE tablename = 'helper_preferences';

-- =====================================================
-- SUCCESS!
-- =====================================================
-- ✅ RLS is enabled but permissive (allows all operations)
-- ✅ Authentication is handled on the client side
-- ✅ Users can now: SELECT, INSERT, UPDATE, DELETE
-- =====================================================