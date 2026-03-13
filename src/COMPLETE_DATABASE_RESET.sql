-- ⚠️⚠️⚠️ COMPLETE DATABASE RESET - DELETES ALL DATA ⚠️⚠️⚠️
-- 
-- WARNING: This will permanently delete ALL user data, listings, wishes, tasks, 
-- messages, conversations, notifications, and related records.
-- 
-- ❌ THIS CANNOT BE UNDONE ❌
-- 
-- Only run this in development or when you want to start completely fresh.
-- 
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
--

-- ============================================================================
-- STEP 1: DELETE ALL CHILD RECORDS (to respect foreign key constraints)
-- ============================================================================

DO $$ 
BEGIN
    -- Delete all messages
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        DELETE FROM messages;
        RAISE NOTICE '✓ Deleted all messages';
    END IF;

    -- Delete all conversations
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
        DELETE FROM conversations;
        RAISE NOTICE '✓ Deleted all conversations';
    END IF;

    -- Delete all notifications
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        DELETE FROM notifications;
        RAISE NOTICE '✓ Deleted all notifications';
    END IF;

    -- Delete all listing views/analytics (if table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'listing_views') THEN
        DELETE FROM listing_views;
        RAISE NOTICE '✓ Deleted all listing_views';
    END IF;

    -- Delete all task applications/responses (if table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_responses') THEN
        DELETE FROM task_responses;
        RAISE NOTICE '✓ Deleted all task_responses';
    END IF;

    -- Delete all wish responses (if table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wish_responses') THEN
        DELETE FROM wish_responses;
        RAISE NOTICE '✓ Deleted all wish_responses';
    END IF;

    -- Delete all saved/favorited listings (if table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'saved_listings') THEN
        DELETE FROM saved_listings;
        RAISE NOTICE '✓ Deleted all saved_listings';
    END IF;

    -- Delete all reports (if table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reports') THEN
        DELETE FROM reports;
        RAISE NOTICE '✓ Deleted all reports';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: DELETE ALL CORE CONTENT (listings, wishes, tasks)
-- ============================================================================

DO $$ 
BEGIN
    -- Delete all listings
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'listings') THEN
        DELETE FROM listings;
        RAISE NOTICE '✓ Deleted all listings';
    END IF;

    -- Delete all wishes
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wishes') THEN
        DELETE FROM wishes;
        RAISE NOTICE '✓ Deleted all wishes';
    END IF;

    -- Delete all tasks
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
        DELETE FROM tasks;
        RAISE NOTICE '✓ Deleted all tasks';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: DELETE ALL USER-RELATED DATA
-- ============================================================================

DO $$ 
BEGIN
    -- Delete all user locations
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_locations') THEN
        DELETE FROM user_locations;
        RAISE NOTICE '✓ Deleted all user_locations';
    END IF;

    -- Delete all push notification subscriptions
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'push_subscriptions') THEN
        DELETE FROM push_subscriptions;
        RAISE NOTICE '✓ Deleted all push_subscriptions';
    END IF;

    -- Delete all user profiles
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        DELETE FROM profiles;
        RAISE NOTICE '✓ Deleted all profiles';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: DELETE AUTH USERS (Supabase Auth)
-- ============================================================================

DO $$ 
BEGIN
    -- Delete all users from auth.users table
    -- This will cascade delete to all related auth tables
    DELETE FROM auth.users;
    RAISE NOTICE '✓ Deleted all auth.users';
END $$;

-- ============================================================================
-- STEP 5: VERIFY CLEANUP
-- ============================================================================

DO $$ 
DECLARE 
    user_count INT;
    listing_count INT;
    wish_count INT;
    task_count INT;
    message_count INT;
    conversation_count INT;
    notification_count INT;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    SELECT COUNT(*) INTO listing_count FROM listings 
    WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'listings');
    
    SELECT COUNT(*) INTO wish_count FROM wishes 
    WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wishes');
    
    SELECT COUNT(*) INTO task_count FROM tasks 
    WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks');
    
    SELECT COUNT(*) INTO message_count FROM messages 
    WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages');
    
    SELECT COUNT(*) INTO conversation_count FROM conversations 
    WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations');
    
    SELECT COUNT(*) INTO notification_count FROM notifications 
    WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications');
    
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ DATABASE CLEANUP COMPLETE';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Remaining records:';
    RAISE NOTICE '  - Users: %', user_count;
    RAISE NOTICE '  - Listings: %', listing_count;
    RAISE NOTICE '  - Wishes: %', wish_count;
    RAISE NOTICE '  - Tasks: %', task_count;
    RAISE NOTICE '  - Messages: %', message_count;
    RAISE NOTICE '  - Conversations: %', conversation_count;
    RAISE NOTICE '  - Notifications: %', notification_count;
    RAISE NOTICE '============================================';
    
    IF user_count = 0 AND listing_count = 0 AND wish_count = 0 AND task_count = 0 THEN
        RAISE NOTICE '✅ ALL DATA SUCCESSFULLY DELETED!';
        RAISE NOTICE '🎉 Database is completely clean and ready for fresh data';
    ELSE
        RAISE NOTICE '⚠️  Some records may still exist. Check foreign key constraints.';
    END IF;
END $$;

-- ============================================================================
-- DONE! Your database is now completely clean.
-- ============================================================================
-- 
-- Next steps:
-- 1. Create a new test user via the phone authentication flow
-- 2. Test creating listings, wishes, and tasks
-- 3. Test all features with fresh data
-- 
-- Note: Categories, locations (cities/areas), and other reference data 
-- are NOT deleted by this script. Only user-generated content is removed.
-- ============================================================================
