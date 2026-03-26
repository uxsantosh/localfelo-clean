-- =====================================================
-- DIAGNOSE ADMIN USER
-- =====================================================
-- This will show us the current state of admin user
-- =====================================================

-- Check auth.users
SELECT 
  '🔍 AUTH.USERS' as section,
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'uxsantosh@gmail.com';

-- Check all profiles (to see what exists)
SELECT 
  '👥 ALL PROFILES' as section,
  id,
  auth_user_id,
  email,
  display_name,
  owner_token
FROM profiles
LIMIT 10;

-- Check if there's a profile with matching email
SELECT 
  '🔍 PROFILE BY EMAIL' as section,
  id,
  auth_user_id,
  email,
  display_name,
  owner_token
FROM profiles
WHERE email = 'uxsantosh@gmail.com';

-- Count everything
SELECT 
  '📊 COUNTS' as section,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM listings) as total_listings,
  (SELECT COUNT(*) FROM tasks) as total_tasks,
  (SELECT COUNT(*) FROM wishes) as total_wishes;
