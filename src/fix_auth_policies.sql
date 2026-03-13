-- =====================================================
-- FIX SUPABASE RLS POLICIES FOR GOOGLE OAUTH
-- =====================================================
-- This fixes the authentication flow by allowing:
-- 1. Anyone to create a new profile (registration)
-- 2. Anyone to read any profile (public marketplace)
-- 3. Authenticated users to update their own profile
-- =====================================================

-- Drop old conflicting policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can create profile" ON profiles;

-- NEW POLICIES - Compatible with soft-auth system

-- 1. Allow anyone to INSERT a new profile (for registration)
CREATE POLICY "allow_insert_profile" 
ON profiles FOR INSERT 
WITH CHECK (true);

-- 2. Allow anyone to SELECT profiles (needed for listings, public marketplace)
CREATE POLICY "allow_select_profile" 
ON profiles FOR SELECT 
USING (true);

-- 3. Allow users to UPDATE their own profile using auth_user_id
CREATE POLICY "allow_update_own_profile" 
ON profiles FOR UPDATE 
USING (auth_user_id = auth.uid() OR auth_user_id IS NULL);
-- Note: "OR auth_user_id IS NULL" allows updating profiles before auth is linked

-- 4. Allow users to DELETE their own profile (optional, for account deletion)
CREATE POLICY "allow_delete_own_profile" 
ON profiles FOR DELETE 
USING (auth_user_id = auth.uid());

-- =====================================================
-- VERIFY POLICIES
-- =====================================================
-- Run this to see all active policies on profiles table:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
