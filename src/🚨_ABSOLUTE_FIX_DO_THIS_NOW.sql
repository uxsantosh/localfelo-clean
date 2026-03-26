-- =====================================================
-- 🚨 ABSOLUTE FIX - DO THIS NOW (FIXED FOR RLS POLICIES)
-- =====================================================
-- This MUST be run in Supabase SQL Editor
-- It will fix EVERYTHING in one go
-- =====================================================

-- STEP 1: Check current state
-- =====================================================
DO $$
DECLARE
  user_id_type TEXT;
  buyer_id_type TEXT;
  notifications_exists BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🔍 CHECKING CURRENT DATABASE STATE';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Check if notifications table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'notifications'
  ) INTO notifications_exists;
  
  IF NOT notifications_exists THEN
    RAISE NOTICE '❌ notifications table DOES NOT EXIST';
    RAISE NOTICE '   This script will create it';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✅ notifications table exists';
    
    -- Check user_id type in notifications
    SELECT data_type INTO user_id_type
    FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'user_id';
    
    RAISE NOTICE '   user_id type: %', user_id_type;
    RAISE NOTICE '';
  END IF;
  
  -- Check buyer_id type in conversations
  SELECT data_type INTO buyer_id_type
  FROM information_schema.columns
  WHERE table_name = 'conversations' AND column_name = 'buyer_id';
  
  RAISE NOTICE 'Conversations table:';
  RAISE NOTICE '   buyer_id type: %', buyer_id_type;
  RAISE NOTICE '';
  
  IF buyer_id_type = 'text' THEN
    RAISE NOTICE '⚠️  WARNING: buyer_id is TEXT (should be UUID)';
    RAISE NOTICE '   This is OK - notifications will still work';
    RAISE NOTICE '';
  END IF;
END $$;

-- STEP 2: Drop ALL RLS policies on notifications table
-- =====================================================
DO $$
DECLARE
  policy_record RECORD;
  policy_count INTEGER := 0;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🔓 DROPPING RLS POLICIES (TEMPORARILY)';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Drop all policies on notifications table
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'notifications'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON notifications', policy_record.policyname);
    RAISE NOTICE '✓  Dropped policy: %', policy_record.policyname;
    policy_count := policy_count + 1;
  END LOOP;
  
  IF policy_count = 0 THEN
    RAISE NOTICE '✓  No policies to drop';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '✅ Dropped % RLS policies', policy_count;
  END IF;
  
  RAISE NOTICE '';
END $$;

-- STEP 3: Drop existing foreign key if it exists
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🔧 REMOVING OLD FOREIGN KEY CONSTRAINT';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Drop the foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'notifications_user_id_fkey'
    AND table_name = 'notifications'
  ) THEN
    ALTER TABLE notifications DROP CONSTRAINT notifications_user_id_fkey;
    RAISE NOTICE '✅ Removed old foreign key constraint';
  ELSE
    RAISE NOTICE '✓  No existing foreign key to remove';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- STEP 4: Convert user_id from TEXT to UUID
-- =====================================================
DO $$
DECLARE
  user_id_type TEXT;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🔄 CONVERTING user_id FROM TEXT TO UUID';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Check current type
  SELECT data_type INTO user_id_type
  FROM information_schema.columns
  WHERE table_name = 'notifications' AND column_name = 'user_id';
  
  IF user_id_type = 'text' THEN
    RAISE NOTICE 'Converting user_id from TEXT to UUID...';
    
    -- Delete any notifications with invalid UUIDs
    DELETE FROM notifications WHERE user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    -- Convert the column
    ALTER TABLE notifications ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
    
    RAISE NOTICE '✅ user_id converted to UUID';
  ELSE
    RAISE NOTICE '✓  user_id is already UUID type';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- STEP 5: Delete orphaned notifications
-- =====================================================
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🧹 CLEANING UP ORPHANED NOTIFICATIONS';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Count orphaned notifications
  SELECT COUNT(*) INTO orphan_count
  FROM notifications n
  WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = n.user_id);
  
  IF orphan_count > 0 THEN
    RAISE NOTICE 'Found % orphaned notifications (users don''t exist)', orphan_count;
    
    -- Delete them
    DELETE FROM notifications n
    WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = n.user_id);
    
    RAISE NOTICE '✅ Deleted % orphaned notifications', orphan_count;
  ELSE
    RAISE NOTICE '✓  No orphaned notifications found';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- STEP 6: Add foreign key constraint
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🔗 ADDING FOREIGN KEY CONSTRAINT';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Add foreign key constraint
  ALTER TABLE notifications
    ADD CONSTRAINT notifications_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;
  
  RAISE NOTICE '✅ Foreign key constraint added';
  RAISE NOTICE '   notifications.user_id → profiles.id';
  RAISE NOTICE '   ON DELETE CASCADE (notifications deleted when user deleted)';
  RAISE NOTICE '';
END $$;

-- STEP 7: Recreate RLS policies
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🔐 RECREATING RLS POLICIES';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Enable RLS
  ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  RAISE NOTICE '✓  RLS enabled';
  
  -- Policy 1: Users can view their own notifications
  DROP POLICY IF EXISTS notifications_select ON notifications;
  CREATE POLICY notifications_select ON notifications
    FOR SELECT
    USING (user_id = auth.uid());
  RAISE NOTICE '✓  Created policy: notifications_select';
  
  -- Policy 2: Users can insert notifications (for system/admin)
  DROP POLICY IF EXISTS notifications_insert ON notifications;
  CREATE POLICY notifications_insert ON notifications
    FOR INSERT
    WITH CHECK (true); -- Allow any authenticated user to insert
  RAISE NOTICE '✓  Created policy: notifications_insert';
  
  -- Policy 3: Users can update their own notifications (mark as read)
  DROP POLICY IF EXISTS notifications_update ON notifications;
  CREATE POLICY notifications_update ON notifications
    FOR UPDATE
    USING (user_id = auth.uid());
  RAISE NOTICE '✓  Created policy: notifications_update';
  
  -- Policy 4: Users can delete their own notifications
  DROP POLICY IF EXISTS notifications_delete ON notifications;
  CREATE POLICY notifications_delete ON notifications
    FOR DELETE
    USING (user_id = auth.uid());
  RAISE NOTICE '✓  Created policy: notifications_delete';
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ RLS policies recreated (4 policies)';
  RAISE NOTICE '';
END $$;

-- STEP 8: Verify all users in conversations exist
-- =====================================================
DO $$
DECLARE
  buyer_id_type TEXT;
  orphan_buyers INTEGER := 0;
  orphan_sellers INTEGER := 0;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🔍 CHECKING CONVERSATIONS FOR ORPHANED USERS';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Get column type
  SELECT data_type INTO buyer_id_type
  FROM information_schema.columns
  WHERE table_name = 'conversations' AND column_name = 'buyer_id';
  
  RAISE NOTICE 'Conversations buyer_id type: %', buyer_id_type;
  RAISE NOTICE '';
  
  IF buyer_id_type = 'uuid' THEN
    -- UUID comparison
    SELECT COUNT(*) INTO orphan_buyers
    FROM conversations c
    WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = c.buyer_id);
    
    SELECT COUNT(*) INTO orphan_sellers
    FROM conversations c
    WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = c.seller_id);
    
  ELSE
    -- TEXT comparison (need to cast)
    SELECT COUNT(*) INTO orphan_buyers
    FROM conversations c
    WHERE c.buyer_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id::text = c.buyer_id);
    
    SELECT COUNT(*) INTO orphan_sellers
    FROM conversations c
    WHERE c.seller_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id::text = c.seller_id);
  END IF;
  
  IF orphan_buyers > 0 THEN
    RAISE NOTICE '⚠️  % conversations have invalid buyer_id (user doesn''t exist)', orphan_buyers;
  ELSE
    RAISE NOTICE '✓  All buyer_ids are valid';
  END IF;
  
  IF orphan_sellers > 0 THEN
    RAISE NOTICE '⚠️  % conversations have invalid seller_id (user doesn''t exist)', orphan_sellers;
  ELSE
    RAISE NOTICE '✓  All seller_ids are valid';
  END IF;
  
  RAISE NOTICE '';
  
  IF orphan_buyers > 0 OR orphan_sellers > 0 THEN
    RAISE NOTICE '💡 TIP: These orphaned conversations will cause notification errors';
    RAISE NOTICE '   The NEW CODE validates users, so it will skip these gracefully';
    RAISE NOTICE '   But you can clean them up with /EMERGENCY_FIX_USER_MISMATCH.sql';
    RAISE NOTICE '';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- STEP 9: Summary and next steps
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '✅ DATABASE FIX COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ notifications.user_id is now UUID';
  RAISE NOTICE '✅ Foreign key constraint is in place';
  RAISE NOTICE '✅ Orphaned notifications are deleted';
  RAISE NOTICE '✅ RLS policies recreated';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 NEXT STEPS (IMPORTANT):';
  RAISE NOTICE '';
  RAISE NOTICE '1. HARD REFRESH YOUR BROWSER';
  RAISE NOTICE '   Windows/Linux: Ctrl + Shift + R';
  RAISE NOTICE '   Mac: Cmd + Shift + R';
  RAISE NOTICE '';
  RAISE NOTICE '2. CLEAR BROWSER DATA';
  RAISE NOTICE '   F12 → Application tab → Clear site data';
  RAISE NOTICE '';
  RAISE NOTICE '3. TEST THE APP';
  RAISE NOTICE '   - Send a chat message';
  RAISE NOTICE '   - Open console (F12)';
  RAISE NOTICE '   - Look for: ✅ Chat notification sent to <uuid>';
  RAISE NOTICE '';
  RAISE NOTICE '4. IF YOU STILL GET ERRORS:';
  RAISE NOTICE '   The error is now because of orphaned conversations';
  RAISE NOTICE '   (conversations reference users that don''t exist)';
  RAISE NOTICE '   ';
  RAISE NOTICE '   The NEW CODE will handle this gracefully:';
  RAISE NOTICE '   - It checks if user exists BEFORE sending notification';
  RAISE NOTICE '   - If user doesn''t exist, it logs a warning and continues';
  RAISE NOTICE '   - Your app won''t crash!';
  RAISE NOTICE '';
  RAISE NOTICE '   To clean up orphaned conversations:';
  RAISE NOTICE '   - Run /EMERGENCY_FIX_USER_MISMATCH.sql';
  RAISE NOTICE '   - Set cleanup_mode := TRUE';
  RAISE NOTICE '   - Re-run the script';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Database is ready!';
  RAISE NOTICE '   Now refresh your browser to load the new code!';
  RAISE NOTICE '';
END $$;
