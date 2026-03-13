-- =====================================================
-- CLEAN ALL USER DATA - KEEP ONLY ADMIN
-- =====================================================
-- ⚠️  WARNING: This deletes ALL user content and users
-- ⚠️  ONLY keeps admin user: uxsantosh@gmail.com
-- =====================================================

DO $$
DECLARE
  v_admin_profile_id UUID;
  v_admin_owner_token UUID;
  v_admin_profile_id_text TEXT;
  v_listings_deleted INTEGER := 0;
  v_tasks_deleted INTEGER := 0;
  v_wishes_deleted INTEGER := 0;
  v_users_deleted INTEGER := 0;
  v_profiles_deleted INTEGER := 0;
  v_chats_deleted INTEGER := 0;
  v_messages_deleted INTEGER := 0;
BEGIN
  -- Get admin profile ID and owner_token by email
  SELECT id, owner_token::uuid INTO v_admin_profile_id, v_admin_owner_token
  FROM profiles 
  WHERE email = 'uxsantosh@gmail.com';
  
  -- Convert UUID to TEXT for comparison with text columns
  v_admin_profile_id_text := v_admin_profile_id::text;
  
  IF v_admin_profile_id IS NULL THEN
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Admin profile not found! Creating cleanup without admin check...';
    RAISE NOTICE '';
    
    -- If no admin exists, just delete everything
    DELETE FROM listings;
    GET DIAGNOSTICS v_listings_deleted = ROW_COUNT;
    
    DELETE FROM tasks;
    GET DIAGNOSTICS v_tasks_deleted = ROW_COUNT;
    
    DELETE FROM wishes;
    GET DIAGNOSTICS v_wishes_deleted = ROW_COUNT;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
      DELETE FROM messages;
      GET DIAGNOSTICS v_messages_deleted = ROW_COUNT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats') THEN
      DELETE FROM chats;
      GET DIAGNOSTICS v_chats_deleted = ROW_COUNT;
    END IF;
    
    DELETE FROM profiles;
    GET DIAGNOSTICS v_profiles_deleted = ROW_COUNT;
    
    DELETE FROM auth.users;
    GET DIAGNOSTICS v_users_deleted = ROW_COUNT;
    
  ELSE
    -- Admin found, keep only admin's data
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Found admin user:';
    RAISE NOTICE '   Email: uxsantosh@gmail.com';
    RAISE NOTICE '   Profile ID: %', v_admin_profile_id;
    RAISE NOTICE '   Owner Token: %', v_admin_owner_token;
    RAISE NOTICE '';
    RAISE NOTICE '🗑️  Starting cleanup...';
    RAISE NOTICE '';
    
    -- Delete listings not owned by admin
    IF v_admin_owner_token IS NOT NULL THEN
      DELETE FROM listings 
      WHERE owner_token IS NULL 
         OR owner_token::uuid != v_admin_owner_token;
    ELSE
      DELETE FROM listings;
    END IF;
    GET DIAGNOSTICS v_listings_deleted = ROW_COUNT;
    RAISE NOTICE '✅ Deleted % listings', v_listings_deleted;
    
    -- Delete tasks not owned by admin
    DELETE FROM tasks 
    WHERE (owner_token IS NULL OR owner_token::uuid != v_admin_owner_token)
      AND (user_id IS NULL OR user_id != v_admin_profile_id);
    GET DIAGNOSTICS v_tasks_deleted = ROW_COUNT;
    RAISE NOTICE '✅ Deleted % tasks', v_tasks_deleted;
    
    -- Delete wishes not owned by admin
    DELETE FROM wishes 
    WHERE (owner_token IS NULL OR owner_token::uuid != v_admin_owner_token)
      AND (user_id IS NULL OR user_id != v_admin_profile_id);
    GET DIAGNOSTICS v_wishes_deleted = ROW_COUNT;
    RAISE NOTICE '✅ Deleted % wishes', v_wishes_deleted;
    
    -- Delete all chat messages (if table exists) - using TEXT comparison
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
      DELETE FROM messages 
      WHERE (sender_id IS NOT NULL AND sender_id != v_admin_profile_id_text)
         OR (recipient_id IS NOT NULL AND recipient_id != v_admin_profile_id_text);
      GET DIAGNOSTICS v_messages_deleted = ROW_COUNT;
      RAISE NOTICE '✅ Deleted % messages', v_messages_deleted;
    END IF;
    
    -- Delete all chats (if table exists) - using TEXT comparison
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats') THEN
      DELETE FROM chats 
      WHERE (user1_id IS NOT NULL AND user1_id != v_admin_profile_id_text)
        AND (user2_id IS NOT NULL AND user2_id != v_admin_profile_id_text);
      GET DIAGNOSTICS v_chats_deleted = ROW_COUNT;
      RAISE NOTICE '✅ Deleted % chats', v_chats_deleted;
    END IF;
    
    -- Delete all profiles except admin's
    DELETE FROM profiles WHERE id != v_admin_profile_id;
    GET DIAGNOSTICS v_profiles_deleted = ROW_COUNT;
    RAISE NOTICE '✅ Deleted % profiles', v_profiles_deleted;
    
    -- Delete all users except admin from auth.users (using auth_user_id link)
    DELETE FROM auth.users 
    WHERE id NOT IN (SELECT auth_user_id FROM profiles WHERE id = v_admin_profile_id AND auth_user_id IS NOT NULL);
    GET DIAGNOSTICS v_users_deleted = ROW_COUNT;
    RAISE NOTICE '✅ Deleted % users from auth.users', v_users_deleted;
    
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ CLEANUP COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   • Listings deleted: %', v_listings_deleted;
  RAISE NOTICE '   • Tasks deleted: %', v_tasks_deleted;
  RAISE NOTICE '   • Wishes deleted: %', v_wishes_deleted;
  RAISE NOTICE '   • Users deleted: %', v_users_deleted;
  RAISE NOTICE '   • Profiles deleted: %', v_profiles_deleted;
  IF v_messages_deleted > 0 THEN
    RAISE NOTICE '   • Messages deleted: %', v_messages_deleted;
  END IF;
  IF v_chats_deleted > 0 THEN
    RAISE NOTICE '   • Chats deleted: %', v_chats_deleted;
  END IF;
  RAISE NOTICE '';
  
  IF v_admin_profile_id IS NOT NULL THEN
    RAISE NOTICE '👤 Admin user kept:';
    RAISE NOTICE '   Email: uxsantosh@gmail.com';
    RAISE NOTICE '   Profile ID: %', v_admin_profile_id;
    RAISE NOTICE '   Owner Token: %', v_admin_owner_token;
    RAISE NOTICE '';
  END IF;
  
  RAISE NOTICE '🚀 Database is now clean and ready for fresh launch!';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Next step: Run /COMPLETE_3_LEVEL_SETUP_FINAL.sql';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  
END $$;

-- Verify cleanup
SELECT 
  '📊 Verification' as section,
  (SELECT COUNT(*) FROM listings) as listings_remaining,
  (SELECT COUNT(*) FROM tasks) as tasks_remaining,
  (SELECT COUNT(*) FROM wishes) as wishes_remaining,
  (SELECT COUNT(*) FROM auth.users) as users_remaining,
  (SELECT COUNT(*) FROM profiles) as profiles_remaining;

-- Show remaining users
SELECT 
  '👥 Remaining Users' as section,
  email,
  is_admin,
  created_at
FROM profiles
ORDER BY created_at;
