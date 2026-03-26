-- =====================================================
-- DIAGNOSE MISSING USER - Find the Problem
-- =====================================================
-- This will help identify why user ID doesn't exist
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Check if the specific user exists
-- =====================================================
DO $$
DECLARE
  missing_user_id UUID := '8917e616-8237-49ce-8e51-e10d9629449e';
  profile_count INTEGER;
BEGIN
  RAISE NOTICE '🔍 CHECKING FOR USER: %', missing_user_id;
  RAISE NOTICE '';
  
  -- Check if user exists in profiles
  SELECT COUNT(*) INTO profile_count
  FROM profiles
  WHERE id = missing_user_id;
  
  IF profile_count > 0 THEN
    RAISE NOTICE '✅ User EXISTS in profiles table';
    
    -- Show user details
    RAISE NOTICE '';
    RAISE NOTICE '📋 User Details:';
    FOR r IN (SELECT id, name, email, created_at FROM profiles WHERE id = missing_user_id)
    LOOP
      RAISE NOTICE '   ID: %', r.id;
      RAISE NOTICE '   Name: %', r.name;
      RAISE NOTICE '   Email: %', r.email;
      RAISE NOTICE '   Created: %', r.created_at;
    END LOOP;
  ELSE
    RAISE NOTICE '❌ User DOES NOT EXIST in profiles table';
    RAISE NOTICE '   This is the problem!';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- Step 2: Find where this user ID is referenced
-- =====================================================
DO $$
DECLARE
  missing_user_id UUID := '8917e616-8237-49ce-8e51-e10d9629449e';
  conv_buyer_count INTEGER := 0;
  conv_seller_count INTEGER := 0;
  task_creator_count INTEGER := 0;
  task_helper_count INTEGER := 0;
  msg_sender_count INTEGER := 0;
  listing_owner_count INTEGER := 0;
  wish_user_count INTEGER := 0;
BEGIN
  RAISE NOTICE '🔍 SEARCHING FOR USER REFERENCES IN ALL TABLES...';
  RAISE NOTICE '';
  
  -- Check conversations (buyer_id)
  SELECT COUNT(*) INTO conv_buyer_count
  FROM conversations
  WHERE buyer_id = missing_user_id;
  
  IF conv_buyer_count > 0 THEN
    RAISE NOTICE '⚠️  Found % conversations where user is BUYER', conv_buyer_count;
    FOR r IN (
      SELECT id, listing_title, created_at 
      FROM conversations 
      WHERE buyer_id = missing_user_id 
      LIMIT 5
    )
    LOOP
      RAISE NOTICE '   - Conversation %: "%"', r.id, r.listing_title;
    END LOOP;
  END IF;
  
  -- Check conversations (seller_id)
  SELECT COUNT(*) INTO conv_seller_count
  FROM conversations
  WHERE seller_id = missing_user_id;
  
  IF conv_seller_count > 0 THEN
    RAISE NOTICE '⚠️  Found % conversations where user is SELLER', conv_seller_count;
    FOR r IN (
      SELECT id, listing_title, created_at 
      FROM conversations 
      WHERE seller_id = missing_user_id 
      LIMIT 5
    )
    LOOP
      RAISE NOTICE '   - Conversation %: "%"', r.id, r.listing_title;
    END LOOP;
  END IF;
  
  -- Check tasks (created_by)
  BEGIN
    SELECT COUNT(*) INTO task_creator_count
    FROM tasks
    WHERE created_by = missing_user_id;
    
    IF task_creator_count > 0 THEN
      RAISE NOTICE '⚠️  Found % tasks created by this user', task_creator_count;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Table might not exist
    NULL;
  END;
  
  -- Check tasks (helper_id)
  BEGIN
    SELECT COUNT(*) INTO task_helper_count
    FROM tasks
    WHERE helper_id = missing_user_id;
    
    IF task_helper_count > 0 THEN
      RAISE NOTICE '⚠️  Found % tasks where user is HELPER', task_helper_count;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Table might not exist
    NULL;
  END;
  
  -- Check messages (sender_id)
  BEGIN
    SELECT COUNT(*) INTO msg_sender_count
    FROM messages
    WHERE sender_id = missing_user_id;
    
    IF msg_sender_count > 0 THEN
      RAISE NOTICE '⚠️  Found % messages sent by this user', msg_sender_count;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Table might not exist
    NULL;
  END;
  
  -- Check listings (user_id)
  BEGIN
    SELECT COUNT(*) INTO listing_owner_count
    FROM listings
    WHERE user_id = missing_user_id;
    
    IF listing_owner_count > 0 THEN
      RAISE NOTICE '⚠️  Found % listings created by this user', listing_owner_count;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Table might not exist
    NULL;
  END;
  
  -- Check wishes (user_id)
  BEGIN
    SELECT COUNT(*) INTO wish_user_count
    FROM wishes
    WHERE user_id = missing_user_id;
    
    IF wish_user_count > 0 THEN
      RAISE NOTICE '⚠️  Found % wishes created by this user', wish_user_count;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Table might not exist
    NULL;
  END;
  
  RAISE NOTICE '';
  
  IF conv_buyer_count = 0 AND conv_seller_count = 0 AND 
     task_creator_count = 0 AND task_helper_count = 0 AND 
     msg_sender_count = 0 AND listing_owner_count = 0 AND 
     wish_user_count = 0 THEN
    RAISE NOTICE '✅ No references found in any tables';
    RAISE NOTICE '   This user ID might be from auth.users (not profiles)';
  END IF;
END $$;

-- Step 3: Check if this is an auth.users ID
-- =====================================================
DO $$
DECLARE
  missing_user_id UUID := '8917e616-8237-49ce-8e51-e10d9629449e';
  auth_count INTEGER;
BEGIN
  RAISE NOTICE '🔍 CHECKING auth.users TABLE...';
  RAISE NOTICE '';
  
  -- Check if user exists in auth.users
  SELECT COUNT(*) INTO auth_count
  FROM auth.users
  WHERE id = missing_user_id;
  
  IF auth_count > 0 THEN
    RAISE NOTICE '✅ User EXISTS in auth.users';
    RAISE NOTICE '❌ BUT user DOES NOT EXIST in profiles';
    RAISE NOTICE '';
    RAISE NOTICE '🚨 THIS IS THE PROBLEM!';
    RAISE NOTICE '   The app is using auth.users.id instead of profiles.id';
    RAISE NOTICE '';
    
    -- Show auth user details
    FOR r IN (SELECT id, email, created_at FROM auth.users WHERE id = missing_user_id)
    LOOP
      RAISE NOTICE '📋 Auth User Details:';
      RAISE NOTICE '   ID: %', r.id;
      RAISE NOTICE '   Email: %', r.email;
      RAISE NOTICE '   Created: %', r.created_at;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '💡 SOLUTION:';
    RAISE NOTICE '   1. Check if this user has a profile record';
    RAISE NOTICE '   2. The app might be using auth.user.id instead of profile.id';
    RAISE NOTICE '   3. Create a profile for this auth user if missing';
  ELSE
    RAISE NOTICE '❌ User DOES NOT EXIST in auth.users either';
    RAISE NOTICE '   This user ID is completely orphaned/invalid';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- Step 4: Show all profiles for comparison
-- =====================================================
DO $$
DECLARE
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM profiles;
  
  RAISE NOTICE '📊 SUMMARY:';
  RAISE NOTICE '   Total profiles: %', profile_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Recent profiles (for comparison):';
  
  FOR r IN (
    SELECT id, name, email, created_at 
    FROM profiles 
    ORDER BY created_at DESC 
    LIMIT 5
  )
  LOOP
    RAISE NOTICE '   - % | % | %', r.id, r.name, r.email;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- Step 5: Recommended actions
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '═════════════════════════════════════════════';
  RAISE NOTICE '🎯 RECOMMENDED ACTIONS:';
  RAISE NOTICE '═════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '1. Review the output above';
  RAISE NOTICE '2. If user exists in auth.users but not profiles:';
  RAISE NOTICE '   → Code is using wrong user ID (auth vs profile)';
  RAISE NOTICE '   → Need to fix code to use profiles.id';
  RAISE NOTICE '';
  RAISE NOTICE '3. If user has orphaned conversations/tasks:';
  RAISE NOTICE '   → Run cleanup script to remove orphaned records';
  RAISE NOTICE '';
  RAISE NOTICE '4. Check browser console logs for the exact';
  RAISE NOTICE '   code path that triggered the error';
  RAISE NOTICE '';
END $$;
