-- =====================================================
-- LOCALFELO ADMIN SETUP
-- =====================================================
-- This script will:
-- 1. Delete all existing users (keeps all other data)
-- 2. Create admin user: uxsantosh@gmail.com
-- 3. Set admin privileges
-- =====================================================

-- STEP 1: Delete all users from profiles table
-- This keeps listings, wishes, tasks, etc.
DELETE FROM profiles;

-- STEP 2: Delete all users from Supabase Auth
-- (Run this in Supabase SQL Editor with caution)
DELETE FROM auth.users;

-- =====================================================
-- STEP 3: Create Admin User
-- =====================================================
-- You need to create the user through Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add User"
-- 3. Email: uxsantosh@gmail.com
-- 4. Password: Sun@6000
-- 5. Auto Confirm User: YES (important!)
-- 6. Click "Create User"
-- 7. Copy the User ID (UUID) from the created user

-- STEP 4: After creating user, run this to set admin flag
-- Replace 'USER_ID_HERE' with the actual UUID from step 3
UPDATE profiles 
SET is_admin = true 
WHERE email = 'uxsantosh@gmail.com';

-- =====================================================
-- ALTERNATIVE: If profile doesn't exist yet, create it
-- =====================================================
-- Replace 'USER_ID_HERE' with the actual UUID from step 3
INSERT INTO profiles (id, email, name, is_admin, created_at, updated_at)
VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID
  'uxsantosh@gmail.com',
  'Admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET is_admin = true;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify admin user is set up correctly
SELECT id, email, name, is_admin, created_at 
FROM profiles 
WHERE email = 'uxsantosh@gmail.com';
