-- =====================================================
-- FIX: Remove Foreign Key Constraint from Notifications
-- =====================================================
-- 
-- PROBLEM: The notifications table has a foreign key constraint
-- that requires user_id to exist in the profiles table.
-- This causes errors when creating notifications for users
-- who haven't created a profile yet.
--
-- SOLUTION: Remove the foreign key constraint.
-- Notifications should be able to exist independently of profiles.
--
-- RUN THIS IN: Supabase SQL Editor
-- =====================================================

-- Remove foreign key constraint (try all possible names)
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS fk_notifications_user;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_fkey;

-- Verify it's removed (should return 0 rows)
SELECT 
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'notifications'::regclass
  AND contype = 'f'; -- 'f' = foreign key

-- Done! Now notifications can be created for any user_id
