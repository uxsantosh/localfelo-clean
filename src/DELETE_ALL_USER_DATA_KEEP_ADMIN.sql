-- =====================================================
-- DELETE ALL USER DATA (KEEP ADMIN ONLY)
-- =====================================================
-- This will delete all listings, tasks, wishes, conversations, 
-- messages, notifications, and users EXCEPT admin
-- ⚠️ DESTRUCTIVE OPERATION - USE WITH CAUTION!
-- =====================================================

-- Step 1: Get admin's client_token (assuming admin email is 'admin@oldcycle.com')
-- If your admin has a different email, change it below
DO $$
DECLARE
  admin_token TEXT;
BEGIN
  -- Get admin token
  SELECT client_token INTO admin_token 
  FROM profiles 
  WHERE email = 'admin@oldcycle.com' 
  LIMIT 1;
  
  IF admin_token IS NULL THEN
    RAISE NOTICE '⚠️  Admin user not found with email admin@oldcycle.com';
    RAISE NOTICE 'ℹ️  If admin has different email, update the script';
  ELSE
    RAISE NOTICE '✅ Admin found with token: %', admin_token;
    
    -- Delete all messages (CASCADE will handle this but being explicit)
    DELETE FROM messages 
    WHERE conversation_id IN (
      SELECT id FROM conversations 
      WHERE participant1_id != admin_token 
      AND participant2_id != admin_token
    );
    RAISE NOTICE '✅ Deleted messages from non-admin conversations';
    
    -- Delete all conversations (except those involving admin)
    DELETE FROM conversations 
    WHERE participant1_id != admin_token 
    AND participant2_id != admin_token;
    RAISE NOTICE '✅ Deleted non-admin conversations';
    
    -- Delete all notifications (except admin's)
    DELETE FROM notifications 
    WHERE user_id != admin_token;
    RAISE NOTICE '✅ Deleted non-admin notifications';
    
    -- Delete all tasks (except admin's)
    DELETE FROM tasks 
    WHERE owner_token != admin_token;
    RAISE NOTICE '✅ Deleted non-admin tasks';
    
    -- Delete all wishes (except admin's)
    DELETE FROM wishes 
    WHERE owner_token != admin_token;
    RAISE NOTICE '✅ Deleted non-admin wishes';
    
    -- Delete all listings (except admin's)
    DELETE FROM listings 
    WHERE owner_token != admin_token;
    RAISE NOTICE '✅ Deleted non-admin listings';
    
    -- Delete all reports
    DELETE FROM reports;
    RAISE NOTICE '✅ Deleted all reports';
    
    -- Delete all profiles (except admin)
    DELETE FROM profiles 
    WHERE client_token != admin_token;
    RAISE NOTICE '✅ Deleted all non-admin users';
    
    -- Delete all auth users (except admin) - THIS IS CRITICAL
    -- This removes users from Supabase Auth
    DELETE FROM auth.users 
    WHERE email != 'admin@oldcycle.com';
    RAISE NOTICE '✅ Deleted all non-admin auth users';
    
    RAISE NOTICE '🎉 DATABASE CLEANED! Only admin data remains.';
  END IF;
END $$;

-- Verify results
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM listings) as total_listings,
  (SELECT COUNT(*) FROM tasks) as total_tasks,
  (SELECT COUNT(*) FROM wishes) as total_wishes,
  (SELECT COUNT(*) FROM conversations) as total_conversations,
  (SELECT COUNT(*) FROM messages) as total_messages,
  (SELECT COUNT(*) FROM notifications) as total_notifications;
