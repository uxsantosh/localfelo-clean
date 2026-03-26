-- ⚠️ CLEAN USER & LISTING DATA (KEEP ADMIN) ⚠️
-- 
-- This script deletes all regular user data and listings but KEEPS admin users.
-- Useful for testing when you want to preserve your admin account.
-- 
-- ❌ THIS CANNOT BE UNDONE ❌
-- 
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
--

-- Get admin user IDs (users with is_admin = true)
CREATE TEMP TABLE IF NOT EXISTS temp_admin_users AS
SELECT id, phone, name FROM profiles WHERE is_admin = true;

-- Show which admin users will be preserved
DO $$ 
DECLARE 
    admin_record RECORD;
    admin_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM temp_admin_users LIMIT 1) INTO admin_exists;
    
    IF admin_exists THEN
        RAISE NOTICE '============================================';
        RAISE NOTICE '📋 Admin users that will be PRESERVED:';
        RAISE NOTICE '============================================';
        
        FOR admin_record IN SELECT * FROM temp_admin_users LOOP
            RAISE NOTICE '👑 Admin: % (Phone: %)', admin_record.name, admin_record.phone;
        END LOOP;
        
        RAISE NOTICE '============================================';
    ELSE
        RAISE NOTICE '============================================';
        RAISE NOTICE '⚠️  NO ADMIN USERS FOUND!';
        RAISE NOTICE '⚠️  This will delete ALL users (no admins to preserve)';
        RAISE NOTICE '============================================';
    END IF;
END $$;

-- ============================================================================
-- STEP 1: DELETE ALL MESSAGES (except admin conversations)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
        DELETE FROM messages 
        WHERE conversation_id IN (
            SELECT id FROM conversations 
            WHERE buyer_id NOT IN (SELECT id FROM temp_admin_users)
            AND seller_id NOT IN (SELECT id FROM temp_admin_users)
        );
        RAISE NOTICE '✓ Deleted non-admin messages';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: DELETE ALL CONVERSATIONS (except admin conversations)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
        DELETE FROM conversations 
        WHERE buyer_id NOT IN (SELECT id FROM temp_admin_users)
        AND seller_id NOT IN (SELECT id FROM temp_admin_users);
        RAISE NOTICE '✓ Deleted non-admin conversations';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: DELETE ALL NOTIFICATIONS (except admin notifications)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        DELETE FROM notifications 
        WHERE user_id NOT IN (SELECT id FROM temp_admin_users);
        RAISE NOTICE '✓ Deleted non-admin notifications';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: DELETE ALL LISTING VIEWS
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'listing_views') THEN
        DELETE FROM listing_views;
        RAISE NOTICE '✓ Deleted all listing_views';
    END IF;
END $$;

-- ============================================================================
-- STEP 5: DELETE ALL TASK & WISH RESPONSES (except admin ones)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_responses') THEN
        DELETE FROM task_responses 
        WHERE user_id NOT IN (SELECT id FROM temp_admin_users);
        RAISE NOTICE '✓ Deleted non-admin task_responses';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wish_responses') THEN
        DELETE FROM wish_responses 
        WHERE user_id NOT IN (SELECT id FROM temp_admin_users);
        RAISE NOTICE '✓ Deleted non-admin wish_responses';
    END IF;
END $$;

-- ============================================================================
-- STEP 6: DELETE ALL SAVED LISTINGS (except admin ones)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'saved_listings') THEN
        DELETE FROM saved_listings 
        WHERE user_id NOT IN (SELECT id FROM temp_admin_users);
        RAISE NOTICE '✓ Deleted non-admin saved_listings';
    END IF;
END $$;

-- ============================================================================
-- STEP 7: DELETE ALL REPORTS (except admin ones)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reports') THEN
        DELETE FROM reports 
        WHERE reported_by NOT IN (SELECT id FROM temp_admin_users);
        RAISE NOTICE '✓ Deleted non-admin reports';
    END IF;
END $$;

-- ============================================================================
-- STEP 8: DELETE ALL LISTINGS, WISHES, TASKS (except admin ones)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'listings') THEN
        DELETE FROM listings 
        WHERE user_id NOT IN (SELECT id FROM temp_admin_users);
        RAISE NOTICE '✓ Deleted non-admin listings';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wishes') THEN
        DELETE FROM wishes 
        WHERE user_id NOT IN (SELECT id FROM temp_admin_users);
        RAISE NOTICE '✓ Deleted non-admin wishes';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
        DELETE FROM tasks 
        WHERE user_id NOT IN (SELECT id FROM temp_admin_users);
        RAISE NOTICE '✓ Deleted non-admin tasks';
    END IF;
END $$;

-- ============================================================================
-- STEP 9: DELETE USER LOCATIONS & PUSH SUBSCRIPTIONS (except admin ones)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_locations') THEN
        DELETE FROM user_locations 
        WHERE user_id NOT IN (SELECT id FROM temp_admin_users);
        RAISE NOTICE '✓ Deleted non-admin user_locations';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'push_subscriptions') THEN
        DELETE FROM push_subscriptions 
        WHERE user_id NOT IN (SELECT id FROM temp_admin_users);
        RAISE NOTICE '✓ Deleted non-admin push_subscriptions';
    END IF;
END $$;

-- ============================================================================
-- STEP 10: DELETE USER PROFILES (except admin ones)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        DELETE FROM profiles 
        WHERE id NOT IN (SELECT id FROM temp_admin_users);
        RAISE NOTICE '✓ Deleted non-admin profiles';
    END IF;
END $$;

-- ============================================================================
-- STEP 11: DELETE AUTH USERS (except admin ones)
-- ============================================================================

DO $$ 
BEGIN
    DELETE FROM auth.users 
    WHERE id NOT IN (SELECT id FROM temp_admin_users);
    RAISE NOTICE '✓ Deleted non-admin auth.users';
END $$;

-- ============================================================================
-- STEP 12: VERIFY CLEANUP
-- ============================================================================

DO $$ 
DECLARE 
    user_count INT;
    admin_count INT;
    listing_count INT;
    wish_count INT;
    task_count INT;
    message_count INT;
    conversation_count INT;
    notification_count INT;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users;
    SELECT COUNT(*) INTO admin_count FROM profiles WHERE is_admin = true;
    SELECT COUNT(*) INTO listing_count FROM listings;
    SELECT COUNT(*) INTO wish_count FROM wishes;
    SELECT COUNT(*) INTO task_count FROM tasks;
    SELECT COUNT(*) INTO message_count FROM messages;
    SELECT COUNT(*) INTO conversation_count FROM conversations;
    SELECT COUNT(*) INTO notification_count FROM notifications;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ DATABASE CLEANUP COMPLETE';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Remaining records:';
    RAISE NOTICE '  - Total Users: %', user_count;
    RAISE NOTICE '  - Admin Users: % (PRESERVED)', admin_count;
    RAISE NOTICE '  - Listings: %', listing_count;
    RAISE NOTICE '  - Wishes: %', wish_count;
    RAISE NOTICE '  - Tasks: %', task_count;
    RAISE NOTICE '  - Messages: %', message_count;
    RAISE NOTICE '  - Conversations: %', conversation_count;
    RAISE NOTICE '  - Notifications: %', notification_count;
    RAISE NOTICE '============================================';
    
    IF admin_count > 0 THEN
        RAISE NOTICE '✅ ALL NON-ADMIN DATA DELETED!';
        RAISE NOTICE '👑 Admin accounts preserved and intact';
    ELSE
        RAISE NOTICE '✅ ALL DATA DELETED (no admins existed)';
        RAISE NOTICE '🎉 Database is completely clean';
    END IF;
END $$;

-- Clean up temp table
DROP TABLE IF EXISTS temp_admin_users;

-- ============================================================================
-- DONE! All regular user data deleted, admin accounts preserved (if any existed).
-- ============================================================================
