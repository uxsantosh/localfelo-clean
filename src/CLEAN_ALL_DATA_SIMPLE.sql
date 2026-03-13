-- =====================================================
-- CLEAN ALL USER DATA - KEEP LOCATIONS ONLY
-- =====================================================
-- ⚠️  WARNING: This deletes ALL users and content
-- ⚠️  KEEPS: cities, areas, sub_areas, distance_matrices
-- =====================================================

DO $$
DECLARE
  v_listings_deleted INTEGER := 0;
  v_tasks_deleted INTEGER := 0;
  v_wishes_deleted INTEGER := 0;
  v_users_deleted INTEGER := 0;
  v_profiles_deleted INTEGER := 0;
  v_chats_deleted INTEGER := 0;
  v_messages_deleted INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '🗑️  CLEANING ALL USER DATA...';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Delete all listings
  DELETE FROM listings;
  GET DIAGNOSTICS v_listings_deleted = ROW_COUNT;
  RAISE NOTICE '✅ Deleted % listings', v_listings_deleted;
  
  -- Delete all tasks
  DELETE FROM tasks;
  GET DIAGNOSTICS v_tasks_deleted = ROW_COUNT;
  RAISE NOTICE '✅ Deleted % tasks', v_tasks_deleted;
  
  -- Delete all wishes
  DELETE FROM wishes;
  GET DIAGNOSTICS v_wishes_deleted = ROW_COUNT;
  RAISE NOTICE '✅ Deleted % wishes', v_wishes_deleted;
  
  -- Delete all messages (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    DELETE FROM messages;
    GET DIAGNOSTICS v_messages_deleted = ROW_COUNT;
    RAISE NOTICE '✅ Deleted % messages', v_messages_deleted;
  END IF;
  
  -- Delete all chats (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats') THEN
    DELETE FROM chats;
    GET DIAGNOSTICS v_chats_deleted = ROW_COUNT;
    RAISE NOTICE '✅ Deleted % chats', v_chats_deleted;
  END IF;
  
  -- Delete all profiles
  DELETE FROM profiles;
  GET DIAGNOSTICS v_profiles_deleted = ROW_COUNT;
  RAISE NOTICE '✅ Deleted % profiles', v_profiles_deleted;
  
  -- Delete all users from auth.users
  DELETE FROM auth.users;
  GET DIAGNOSTICS v_users_deleted = ROW_COUNT;
  RAISE NOTICE '✅ Deleted % users from auth.users', v_users_deleted;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ CLEANUP COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   • Listings deleted: %', v_listings_deleted;
  RAISE NOTICE '   • Tasks deleted: %', v_tasks_deleted;
  RAISE NOTICE '   • Wishes deleted: %', v_wishes_deleted;
  RAISE NOTICE '   • Messages deleted: %', v_messages_deleted;
  RAISE NOTICE '   • Chats deleted: %', v_chats_deleted;
  RAISE NOTICE '   • Profiles deleted: %', v_profiles_deleted;
  RAISE NOTICE '   • Users deleted: %', v_users_deleted;
  RAISE NOTICE '';
  RAISE NOTICE '🌍 Location data PRESERVED (cities, areas, sub_areas)';
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
  (SELECT COUNT(*) FROM profiles) as profiles_remaining,
  (SELECT COUNT(*) FROM cities) as cities_kept,
  (SELECT COUNT(*) FROM areas) as areas_kept,
  (SELECT COUNT(*) FROM sub_areas) as sub_areas_kept;
