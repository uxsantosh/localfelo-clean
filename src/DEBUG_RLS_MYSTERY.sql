-- =====================================================
-- DEBUG: Why didn't INSERT policy show up?
-- =====================================================

-- 1. Check ALL policies on device_tokens (no filters)
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'device_tokens';

-- =====================================================

-- 2. Check if RLS is actually ENABLED
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'device_tokens';

-- =====================================================

-- 3. Check table owner and current user
SELECT 
  tableowner,
  current_user AS your_user
FROM pg_tables
WHERE tablename = 'device_tokens';

-- =====================================================

-- 4. Try to manually test INSERT with a real user ID
-- (Replace 'YOUR_USER_ID_HERE' with an actual UUID from auth.users)
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Get a real user ID
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No users found in auth.users table';
  ELSE
    RAISE NOTICE 'Testing insert with user_id: %', test_user_id;
    
    -- Try insert
    INSERT INTO device_tokens (
      user_id,
      device_token,
      platform,
      is_enabled,
      last_used_at
    ) VALUES (
      test_user_id,
      'test_debug_' || gen_random_uuid()::text,
      'web',
      true,
      now()
    );
    
    RAISE NOTICE 'SUCCESS - Insert worked!';
  END IF;
END $$;

-- =====================================================

-- 5. Check if there are any existing tokens
SELECT 
  id,
  user_id,
  device_token,
  platform,
  created_at
FROM device_tokens
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
