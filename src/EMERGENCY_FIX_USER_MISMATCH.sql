-- =====================================================
-- EMERGENCY FIX - User ID Mismatch (FIXED VERSION)
-- =====================================================
-- This script will:
-- 1. Find the problematic user
-- 2. Check if they need a profile created
-- 3. Optionally create the missing profile
-- 4. Clean up orphaned records
-- =====================================================

-- Configuration
-- =====================================================
DO $$
DECLARE
  missing_user_id TEXT := '8917e616-8237-49ce-8e51-e10d9629449e';  -- The user from your error
  missing_user_uuid UUID;
  exists_in_auth BOOLEAN := FALSE;
  exists_in_profiles BOOLEAN := FALSE;
  auth_email TEXT;
  should_create_profile BOOLEAN := FALSE;  -- Set to TRUE to auto-create profile
  buyer_id_type TEXT;
  seller_id_type TEXT;
BEGIN
  RAISE NOTICE '═════════════════════════════════════════════';
  RAISE NOTICE '🔍 EMERGENCY DIAGNOSTIC FOR USER';
  RAISE NOTICE '═════════════════════════════════════════════';
  RAISE NOTICE 'User ID: %', missing_user_id;
  RAISE NOTICE '';

  -- Convert to UUID if possible
  BEGIN
    missing_user_uuid := missing_user_id::UUID;
    RAISE NOTICE '✅ User ID is valid UUID format';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ User ID is NOT valid UUID format';
    missing_user_uuid := NULL;
  END;
  
  RAISE NOTICE '';

  -- Check what type buyer_id and seller_id are in conversations
  SELECT data_type INTO buyer_id_type
  FROM information_schema.columns
  WHERE table_name = 'conversations' AND column_name = 'buyer_id';
  
  SELECT data_type INTO seller_id_type
  FROM information_schema.columns
  WHERE table_name = 'conversations' AND column_name = 'seller_id';
  
  RAISE NOTICE '📊 CONVERSATIONS TABLE SCHEMA:';
  RAISE NOTICE '   buyer_id type: %', COALESCE(buyer_id_type, 'NOT FOUND');
  RAISE NOTICE '   seller_id type: %', COALESCE(seller_id_type, 'NOT FOUND');
  RAISE NOTICE '';

  -- Check auth.users (UUID comparison)
  IF missing_user_uuid IS NOT NULL THEN
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = missing_user_uuid) INTO exists_in_auth;
  END IF;
  
  -- Check profiles (UUID comparison)
  IF missing_user_uuid IS NOT NULL THEN
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = missing_user_uuid) INTO exists_in_profiles;
  END IF;
  
  RAISE NOTICE '📊 USER EXISTS CHECK:';
  RAISE NOTICE '   Exists in auth.users: %', exists_in_auth;
  RAISE NOTICE '   Exists in profiles: %', exists_in_profiles;
  RAISE NOTICE '';
  
  -- CASE 1: User in auth.users but NOT in profiles
  IF exists_in_auth AND NOT exists_in_profiles THEN
    RAISE NOTICE '🚨 PROBLEM IDENTIFIED:';
    RAISE NOTICE '   User exists in auth.users but has NO PROFILE';
    RAISE NOTICE '';
    
    -- Get email
    SELECT email INTO auth_email FROM auth.users WHERE id = missing_user_uuid;
    RAISE NOTICE '   Email: %', auth_email;
    RAISE NOTICE '';
    
    RAISE NOTICE '💡 SOLUTION OPTIONS:';
    RAISE NOTICE '';
    RAISE NOTICE 'Option 1: Create Missing Profile (RECOMMENDED)';
    RAISE NOTICE '   Change line 19: should_create_profile := TRUE';
    RAISE NOTICE '   Then re-run this script';
    RAISE NOTICE '';
    RAISE NOTICE 'Option 2: Fix Code';
    RAISE NOTICE '   Update app to use profiles.id instead of auth.users.id';
    RAISE NOTICE '';
    
    -- Auto-create profile if enabled
    IF should_create_profile THEN
      RAISE NOTICE '🔧 CREATING PROFILE...';
      
      -- Insert profile
      INSERT INTO profiles (id, email, name, owner_token, client_token, is_admin, created_at)
      VALUES (
        missing_user_uuid,
        auth_email,
        COALESCE(SPLIT_PART(auth_email, '@', 1), 'User'),  -- Use email prefix as name
        gen_random_uuid()::text,  -- Generate new owner token
        gen_random_uuid()::text,  -- Generate new client token
        FALSE,
        NOW()
      )
      ON CONFLICT (id) DO NOTHING;
      
      RAISE NOTICE '✅ Profile created for user %', missing_user_uuid;
      RAISE NOTICE '   Email: %', auth_email;
      RAISE NOTICE '   Name: %', COALESCE(SPLIT_PART(auth_email, '@', 1), 'User');
      RAISE NOTICE '';
      RAISE NOTICE '🎉 Problem solved! User now has a profile.';
      RAISE NOTICE '   Notifications should work now.';
    END IF;
    
  -- CASE 2: User NOT in auth.users and NOT in profiles
  ELSIF NOT exists_in_auth AND NOT exists_in_profiles THEN
    RAISE NOTICE '🚨 PROBLEM IDENTIFIED:';
    RAISE NOTICE '   User does NOT EXIST anywhere!';
    RAISE NOTICE '   This user ID is completely orphaned.';
    RAISE NOTICE '';
    RAISE NOTICE '💡 SOLUTION:';
    RAISE NOTICE '   Clean up orphaned references to this user';
    RAISE NOTICE '   (see cleanup section below)';
    RAISE NOTICE '';
    
  -- CASE 3: User in profiles but NOT in auth.users (weird but possible)
  ELSIF NOT exists_in_auth AND exists_in_profiles THEN
    RAISE NOTICE '⚠️  UNUSUAL SITUATION:';
    RAISE NOTICE '   User exists in profiles but NOT in auth.users';
    RAISE NOTICE '   This shouldn''t happen normally.';
    RAISE NOTICE '';
    
  -- CASE 4: User exists in BOTH (should work)
  ELSE
    RAISE NOTICE '✅ User exists in BOTH auth.users AND profiles';
    RAISE NOTICE '   This should work. Error might be from:';
    RAISE NOTICE '   - Browser cache (old code running)';
    RAISE NOTICE '   - Different user ID causing the issue';
    RAISE NOTICE '';
  END IF;
  
END $$;

-- Find orphaned references (with proper type handling)
-- =====================================================
DO $$
DECLARE
  missing_user_id TEXT := '8917e616-8237-49ce-8e51-e10d9629449e';
  missing_user_uuid UUID;
  cleanup_mode BOOLEAN := FALSE;  -- Set to TRUE to actually delete orphaned records
  orphan_count INTEGER := 0;
  total_orphans INTEGER := 0;
  buyer_id_type TEXT;
  conversations_exist BOOLEAN;
BEGIN
  RAISE NOTICE '═════════════════════════════════════════════';
  RAISE NOTICE '🔍 SCANNING FOR ORPHANED REFERENCES';
  RAISE NOTICE '═════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Check if conversations table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'conversations'
  ) INTO conversations_exist;
  
  IF NOT conversations_exist THEN
    RAISE NOTICE '⚠️  conversations table does not exist - skipping';
    RAISE NOTICE '';
    RETURN;
  END IF;
  
  -- Get buyer_id type
  SELECT data_type INTO buyer_id_type
  FROM information_schema.columns
  WHERE table_name = 'conversations' AND column_name = 'buyer_id';
  
  -- Convert user ID if it's UUID type
  IF buyer_id_type = 'uuid' THEN
    BEGIN
      missing_user_uuid := missing_user_id::UUID;
      
      -- Check conversations (buyer_id) - UUID comparison
      SELECT COUNT(*) INTO orphan_count
      FROM conversations
      WHERE buyer_id = missing_user_uuid;
      
      IF orphan_count > 0 THEN
        total_orphans := total_orphans + orphan_count;
        RAISE NOTICE '⚠️  % conversations with orphaned buyer_id (UUID)', orphan_count;
        
        IF cleanup_mode THEN
          DELETE FROM conversations WHERE buyer_id = missing_user_uuid;
          RAISE NOTICE '   ✅ Deleted';
        ELSE
          RAISE NOTICE '   → Set cleanup_mode := TRUE to delete';
        END IF;
      END IF;
      
      -- Check conversations (seller_id) - UUID comparison
      SELECT COUNT(*) INTO orphan_count
      FROM conversations
      WHERE seller_id = missing_user_uuid;
      
      IF orphan_count > 0 THEN
        total_orphans := total_orphans + orphan_count;
        RAISE NOTICE '⚠️  % conversations with orphaned seller_id (UUID)', orphan_count;
        
        IF cleanup_mode THEN
          DELETE FROM conversations WHERE seller_id = missing_user_uuid;
          RAISE NOTICE '   ✅ Deleted';
        ELSE
          RAISE NOTICE '   → Set cleanup_mode := TRUE to delete';
        END IF;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ Error: Invalid UUID format for comparison';
    END;
  ELSE
    -- TEXT comparison
    RAISE NOTICE '⚠️  WARNING: buyer_id/seller_id are TEXT (should be UUID!)';
    RAISE NOTICE '   You need to run /FIX_NOTIFICATIONS_SAFE.sql first!';
    RAISE NOTICE '';
    
    -- Check conversations (buyer_id) - TEXT comparison
    SELECT COUNT(*) INTO orphan_count
    FROM conversations
    WHERE buyer_id = missing_user_id;
    
    IF orphan_count > 0 THEN
      total_orphans := total_orphans + orphan_count;
      RAISE NOTICE '⚠️  % conversations with buyer_id = % (TEXT)', orphan_count, missing_user_id;
      
      IF cleanup_mode THEN
        DELETE FROM conversations WHERE buyer_id = missing_user_id;
        RAISE NOTICE '   ✅ Deleted';
      ELSE
        RAISE NOTICE '   → Set cleanup_mode := TRUE to delete';
      END IF;
    END IF;
    
    -- Check conversations (seller_id) - TEXT comparison
    SELECT COUNT(*) INTO orphan_count
    FROM conversations
    WHERE seller_id = missing_user_id;
    
    IF orphan_count > 0 THEN
      total_orphans := total_orphans + orphan_count;
      RAISE NOTICE '⚠️  % conversations with seller_id = % (TEXT)', orphan_count, missing_user_id;
      
      IF cleanup_mode THEN
        DELETE FROM conversations WHERE seller_id = missing_user_id;
        RAISE NOTICE '   ✅ Deleted';
      ELSE
        RAISE NOTICE '   → Set cleanup_mode := TRUE to delete';
      END IF;
    END IF;
  END IF;
  
  RAISE NOTICE '';
  
  IF total_orphans = 0 THEN
    RAISE NOTICE '✅ No orphaned references found for this user';
  ELSE
    RAISE NOTICE '📊 Total orphaned references: %', total_orphans;
    IF NOT cleanup_mode THEN
      RAISE NOTICE '   Set cleanup_mode := TRUE (line 169) to delete them';
    END IF;
  END IF;
  
  RAISE NOTICE '';
END $$;

-- Comprehensive orphan scan (all users, with type safety)
-- =====================================================
DO $$
DECLARE
  orphan_count INTEGER := 0;
  buyer_id_type TEXT;
  conversations_exist BOOLEAN;
BEGIN
  RAISE NOTICE '═════════════════════════════════════════════';
  RAISE NOTICE '🔍 COMPREHENSIVE ORPHAN SCAN (ALL USERS)';
  RAISE NOTICE '═════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Check if conversations table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'conversations'
  ) INTO conversations_exist;
  
  IF NOT conversations_exist THEN
    RAISE NOTICE '⚠️  conversations table does not exist';
    RAISE NOTICE '';
    RETURN;
  END IF;
  
  -- Get column types
  SELECT data_type INTO buyer_id_type
  FROM information_schema.columns
  WHERE table_name = 'conversations' AND column_name = 'buyer_id';
  
  IF buyer_id_type = 'uuid' THEN
    -- UUID-based queries
    
    -- Conversations with invalid buyer_id
    SELECT COUNT(*) INTO orphan_count
    FROM conversations c
    WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = c.buyer_id);
    
    IF orphan_count > 0 THEN
      RAISE NOTICE '⚠️  % conversations with invalid buyer_id', orphan_count;
    END IF;
    
    -- Conversations with invalid seller_id
    SELECT COUNT(*) INTO orphan_count
    FROM conversations c
    WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = c.seller_id);
    
    IF orphan_count > 0 THEN
      RAISE NOTICE '⚠️  % conversations with invalid seller_id', orphan_count;
    END IF;
    
  ELSE
    RAISE NOTICE '⚠️  buyer_id/seller_id are % type (should be UUID)', buyer_id_type;
    RAISE NOTICE '   Cannot perform comprehensive scan until types are fixed';
    RAISE NOTICE '   Run /FIX_NOTIFICATIONS_SAFE.sql to fix schema';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- Recommended Action Plan
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '═════════════════════════════════════════════';
  RAISE NOTICE '🎯 RECOMMENDED ACTION PLAN';
  RAISE NOTICE '═════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Step 1: Review the diagnostic output above';
  RAISE NOTICE '';
  RAISE NOTICE 'Step 2: If buyer_id/seller_id are TEXT (not UUID):';
  RAISE NOTICE '   → Run /FIX_NOTIFICATIONS_SAFE.sql FIRST';
  RAISE NOTICE '   → This fixes the root database schema issue';
  RAISE NOTICE '   → Then come back and re-run this script';
  RAISE NOTICE '';
  RAISE NOTICE 'Step 3: If user exists in auth.users but not profiles:';
  RAISE NOTICE '   → Set: should_create_profile := TRUE (line 19)';
  RAISE NOTICE '   → Re-run this script';
  RAISE NOTICE '   → Profile will be auto-created';
  RAISE NOTICE '';
  RAISE NOTICE 'Step 4: If user has orphaned records:';
  RAISE NOTICE '   → Set: cleanup_mode := TRUE (line 169)';
  RAISE NOTICE '   → Re-run this script';
  RAISE NOTICE '   → Orphaned records will be deleted';
  RAISE NOTICE '';
  RAISE NOTICE 'Step 5: Hard refresh browser (Ctrl+Shift+R)';
  RAISE NOTICE '   → Clear browser cache';
  RAISE NOTICE '   → Load new validation code';
  RAISE NOTICE '';
  RAISE NOTICE 'Step 6: Test the app';
  RAISE NOTICE '   → Send a chat message';
  RAISE NOTICE '   → Check console for notification logs';
  RAISE NOTICE '   → Should see: ✅ Chat notification sent';
  RAISE NOTICE '';
  RAISE NOTICE '═════════════════════════════════════════════';
END $$;
