-- =====================================================
-- LocalFelo Schema Fixes - ROLLBACK SCRIPT
-- Date: February 11, 2026
-- Purpose: UNDO all changes if problems occur
-- =====================================================

-- INSTRUCTIONS:
-- If you need to revert the changes, run this file in Supabase SQL Editor
-- This will restore your database to the state before fixes

-- =====================================================
-- ROLLBACK 1: Remove avatar_url column from profiles
-- =====================================================
-- (Only run this if you added the column and want to remove it)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS avatar_url;

-- NOTE: If the column already existed, don't run the above!
-- Check first with: SELECT avatar_url FROM profiles LIMIT 1;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check current profiles columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check notifications columns (message vs body)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
AND column_name IN ('message', 'body');

-- Check current data in notifications to see which field is used
SELECT 
  COUNT(*) as total_notifications,
  COUNT(message) as has_message_value,
  COUNT(body) as has_body_value,
  COUNT(CASE WHEN message IS NOT NULL AND body IS NOT NULL THEN 1 END) as both_populated,
  COUNT(CASE WHEN message IS NULL AND body IS NULL THEN 1 END) as both_null
FROM notifications;

-- =====================================================
-- BACKUP YOUR DATA (RECOMMENDED)
-- =====================================================

-- If you want to be extra safe, export these tables before making changes:
-- 1. profiles (especially if you have existing avatar data)
-- 2. notifications (to understand message vs body usage)
-- 3. reports (to verify reporter field usage)

-- Export command (run in psql or use Supabase dashboard export):
-- COPY profiles TO '/tmp/profiles_backup.csv' CSV HEADER;
-- COPY notifications TO '/tmp/notifications_backup.csv' CSV HEADER;
-- COPY reports TO '/tmp/reports_backup.csv' CSV HEADER;

-- =====================================================
-- EMERGENCY RESTORE
-- =====================================================

-- If something goes very wrong and you need to restore from backup:
-- 1. Go to Supabase Dashboard → Database → Backups
-- 2. Select the backup from before today
-- 3. Click "Restore"
-- 4. Or contact me and we'll manually fix it

-- =====================================================
-- END OF ROLLBACK SCRIPT
-- =====================================================
