-- =====================================================
-- LocalFelo Schema Fixes - APPLY SCRIPT
-- Date: February 11, 2026
-- Purpose: Fix schema mismatches between database and code
-- =====================================================

-- INSTRUCTIONS:
-- 1. Copy this entire file
-- 2. Go to Supabase Dashboard → SQL Editor → New Query
-- 3. Paste and run this script
-- 4. Check the results for any errors
-- 5. If errors occur, run SQL_BACKUP_ROLLBACK.sql

-- =====================================================
-- PRE-FLIGHT CHECKS
-- =====================================================

-- Check if avatar_url already exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'avatar_url'
    ) THEN
        RAISE NOTICE '✅ avatar_url column already exists in profiles table';
    ELSE
        RAISE NOTICE '⚠️ avatar_url column does NOT exist - will be created';
    END IF;
END $$;

-- =====================================================
-- FIX 1: Add avatar_url column to profiles table
-- =====================================================

-- Add the column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.avatar_url IS 'User profile picture/avatar URL (added Feb 2026)';

-- If you have existing data in a different column, migrate it here:
-- Example: UPDATE profiles SET avatar_url = profile_pic WHERE profile_pic IS NOT NULL;

-- =====================================================
-- FIX 2: Verify notifications columns
-- =====================================================

-- Check which notification column is being used
DO $$
DECLARE
    message_count INTEGER;
    body_count INTEGER;
BEGIN
    SELECT 
        COUNT(CASE WHEN message IS NOT NULL AND message != '' THEN 1 END),
        COUNT(CASE WHEN body IS NOT NULL AND body != '' THEN 1 END)
    INTO message_count, body_count
    FROM notifications;
    
    RAISE NOTICE '📊 Notifications analysis:';
    RAISE NOTICE '  - Records with message: %', message_count;
    RAISE NOTICE '  - Records with body: %', body_count;
    
    IF message_count > 0 AND body_count = 0 THEN
        RAISE NOTICE '✅ Using MESSAGE column (body is empty)';
    ELSIF body_count > 0 AND message_count = 0 THEN
        RAISE NOTICE '✅ Using BODY column (message is empty)';
    ELSIF message_count > 0 AND body_count > 0 THEN
        RAISE NOTICE '⚠️ BOTH columns have data - code uses MESSAGE';
    ELSE
        RAISE NOTICE 'ℹ️ No notification data yet';
    END IF;
END $$;

-- Add index on notifications for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_created 
ON notifications(created_at DESC);

-- =====================================================
-- FIX 3: Verify reports columns
-- =====================================================

-- Check reports structure
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' 
        AND column_name = 'reported_by'
    ) THEN
        RAISE NOTICE '✅ reports.reported_by column exists';
    ELSE
        RAISE NOTICE '❌ reports.reported_by column MISSING!';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' 
        AND column_name = 'reporter_phone'
    ) THEN
        RAISE NOTICE '✅ reports.reporter_phone column exists';
    ELSE
        RAISE NOTICE '❌ reports.reporter_phone column MISSING!';
    END IF;
END $$;

-- =====================================================
-- FIX 4: Add helpful indexes for performance
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_client_token 
ON profiles(client_token);

CREATE INDEX IF NOT EXISTS idx_profiles_owner_token 
ON profiles(owner_token);

CREATE INDEX IF NOT EXISTS idx_profiles_phone 
ON profiles(phone);

-- Listings indexes
CREATE INDEX IF NOT EXISTS idx_listings_owner_token 
ON listings(owner_token);

CREATE INDEX IF NOT EXISTS idx_listings_category_city 
ON listings(category_slug, city);

CREATE INDEX IF NOT EXISTS idx_listings_active 
ON listings(is_active, is_hidden);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_status 
ON tasks(user_id, status);

CREATE INDEX IF NOT EXISTS idx_tasks_city_area 
ON tasks(city_id, area_id);

-- Wishes indexes
CREATE INDEX IF NOT EXISTS idx_wishes_user_status 
ON wishes(user_id, status);

CREATE INDEX IF NOT EXISTS idx_wishes_city_area 
ON wishes(city_id, area_id);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_buyer 
ON conversations(buyer_id);

CREATE INDEX IF NOT EXISTS idx_conversations_seller 
ON conversations(seller_id);

CREATE INDEX IF NOT EXISTS idx_conversations_listing 
ON conversations(listing_id);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation 
ON messages(conversation_id, created_at DESC);

-- =====================================================
-- FIX 5: Add helpful database functions
-- =====================================================

-- Function to get user's full profile with stats
CREATE OR REPLACE FUNCTION get_user_profile_with_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'profile', row_to_json(p.*),
        'active_listings', (
            SELECT COUNT(*) FROM listings 
            WHERE owner_token = p.owner_token 
            AND is_active = true 
            AND is_hidden = false
        ),
        'active_tasks', (
            SELECT COUNT(*) FROM tasks 
            WHERE user_id = p_user_id 
            AND status IN ('open', 'negotiating', 'accepted')
        ),
        'active_wishes', (
            SELECT COUNT(*) FROM wishes 
            WHERE user_id = p_user_id 
            AND status IN ('open', 'negotiating', 'accepted')
        )
    ) INTO result
    FROM profiles p
    WHERE p.id = p_user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify profiles table structure
SELECT 'PROFILES TABLE' as verification,
       COUNT(*) as total_profiles,
       COUNT(avatar_url) as profiles_with_avatar,
       COUNT(client_token) as profiles_with_client_token,
       COUNT(owner_token) as profiles_with_owner_token
FROM profiles;

-- Verify notifications structure  
SELECT 'NOTIFICATIONS TABLE' as verification,
       COUNT(*) as total_notifications,
       COUNT(message) as has_message,
       COUNT(body) as has_body,
       COUNT(CASE WHEN is_read = false THEN 1 END) as unread_count
FROM notifications;

-- Verify reports structure
SELECT 'REPORTS TABLE' as verification,
       COUNT(*) as total_reports,
       COUNT(reported_by) as reports_with_user_id,
       COUNT(reporter_phone) as reports_with_phone
FROM reports;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '
    ╔════════════════════════════════════════════════════╗
    ║  ✅ LocalFelo Schema Fixes Applied Successfully    ║
    ╚════════════════════════════════════════════════════╝
    
    Changes made:
    1. ✅ Added avatar_url to profiles table
    2. ✅ Verified notifications columns
    3. ✅ Verified reports columns
    4. ✅ Added performance indexes
    5. ✅ Added helper functions
    
    Next steps:
    - Code files will be updated automatically
    - Test all features after deployment
    - Check SCHEMA_CODE_AUDIT_REPORT.md for details
    
    If you encounter issues:
    - Run SQL_BACKUP_ROLLBACK.sql
    - Or restore from Supabase backup
    ';
END $$;

-- =====================================================
-- END OF FIXES SCRIPT
-- =====================================================
