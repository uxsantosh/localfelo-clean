-- =====================================================
-- LOCALFELO COMPLETE ADMIN SETUP
-- =====================================================
-- Run this entire script in Supabase SQL Editor
-- This will:
-- 1. Create a trigger to auto-create profiles for new users
-- 2. Delete all existing users (keeps all other data)
-- 3. Allow you to create admin user via Dashboard
-- =====================================================

-- =====================================================
-- PART 1: Create Auto-Profile Trigger (if not exists)
-- =====================================================
-- This ensures profiles are automatically created when users sign up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, is_admin, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    false,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PART 2: Delete All Existing Users
-- =====================================================

-- Delete all profiles (keeps listings, wishes, tasks, etc.)
DELETE FROM public.profiles;

-- Delete all users from Supabase Auth
DELETE FROM auth.users;

-- =====================================================
-- PART 3: Instructions for Creating Admin User
-- =====================================================
-- Now follow these steps in Supabase Dashboard:
--
-- 1. Go to Authentication → Users
-- 2. Click "Add User"
-- 3. Fill in:
--    - Email: uxsantosh@gmail.com
--    - Password: Sun@6000
--    - Auto Confirm User: ✅ YES (check this!)
-- 4. Click "Create User"
-- 5. The profile will be auto-created via trigger
-- 6. Continue to Part 4 below

-- =====================================================
-- PART 4: Set Admin Flag
-- =====================================================
-- After creating the user in Dashboard, run this:

UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'uxsantosh@gmail.com';

-- =====================================================
-- PART 5: Verify Setup
-- =====================================================
-- Run this to verify everything is correct:

SELECT 
  p.id,
  p.email,
  p.name,
  p.is_admin,
  p.created_at,
  CASE 
    WHEN a.id IS NOT NULL THEN '✅ Auth exists'
    ELSE '❌ Auth missing'
  END as auth_status
FROM public.profiles p
LEFT JOIN auth.users a ON p.id = a.id
WHERE p.email = 'uxsantosh@gmail.com';

-- Expected result:
-- email: uxsantosh@gmail.com
-- is_admin: true
-- auth_status: ✅ Auth exists

-- =====================================================
-- DONE! 🎉
-- =====================================================
-- You can now login to LocalFelo with:
-- Email: uxsantosh@gmail.com
-- Password: Sun@6000
-- You should see admin options!
-- =====================================================
