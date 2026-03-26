-- =====================================================
-- DATABASE AUDIT - Run These Queries in Supabase
-- =====================================================
-- Copy and run EACH query separately in Supabase SQL Editor
-- Share the results so we can create a safe migration
-- =====================================================

-- =====================================================
-- QUERY 1: List ALL tables in your database
-- =====================================================
-- This shows every table that exists

SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected output: List of all tables
-- Copy the entire result and share

-- =====================================================
-- QUERY 2: Check profiles table columns
-- =====================================================
-- This shows what columns exist in profiles table

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Look for these columns:
-- ✅ password_hash - if exists, migration already done
-- ❌ password_hash missing - need migration

-- =====================================================
-- QUERY 3: Check ALL foreign keys
-- =====================================================
-- This shows which tables reference which columns

SELECT
  tc.table_name AS from_table,
  kcu.column_name AS from_column,
  ccu.table_name AS to_table,
  ccu.column_name AS to_column,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- Look for:
-- ❌ Foreign keys to non-existent columns
-- ❌ Foreign keys to profiles(client_token) - if client_token doesn't exist

-- =====================================================
-- QUERY 4: Check listings table columns
-- =====================================================
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'listings'
ORDER BY ordinal_position;

-- Look for:
-- ❌ owner_token missing
-- ❌ is_active missing
-- ❌ status missing

-- =====================================================
-- QUERY 5: Check if sub_areas table exists
-- =====================================================
SELECT EXISTS (
  SELECT 1
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name = 'sub_areas'
) AS sub_areas_exists;

-- Result:
-- true = sub_areas table exists ✅
-- false = need to create it ❌

-- =====================================================
-- QUERY 6: Check wishes table columns
-- =====================================================
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'wishes'
ORDER BY ordinal_position;

-- If table doesn't exist, you'll get an error - that's OK

-- =====================================================
-- QUERY 7: Check tasks table columns
-- =====================================================
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- If table doesn't exist, you'll get an error - that's OK

-- =====================================================
-- QUERY 8: Check conversations table columns
-- =====================================================
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- Look for:
-- ✅ listing_type column
-- ✅ unread_count_buyer, unread_count_seller

-- =====================================================
-- QUERY 9: Check notifications table columns
-- =====================================================
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- If table doesn't exist, you'll get an error - that's OK

-- =====================================================
-- QUERY 10: Check for duplicate phone numbers
-- =====================================================
SELECT 
  phone,
  COUNT(*) as count,
  string_agg(id::text, ', ') as profile_ids
FROM profiles
GROUP BY phone
HAVING COUNT(*) > 1;

-- If this returns rows, you have duplicate profiles
-- We need to clean them before adding UNIQUE constraint

-- =====================================================
-- QUERY 11: Check current profiles structure
-- =====================================================
-- See what a real profile looks like

SELECT *
FROM profiles
LIMIT 3;

-- Check:
-- ✅ Do password_hash values exist?
-- ✅ Do client_token values exist?
-- ✅ What columns have NULL values?

-- =====================================================
-- QUERY 12: Check for broken foreign keys
-- =====================================================
-- Find orphaned records (rows that reference non-existent parents)

-- Check listings with missing seller
SELECT COUNT(*) as orphaned_listings
FROM listings l
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = l.seller_id
);

-- Check wishes with missing owner_token (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wishes') THEN
    EXECUTE 'SELECT COUNT(*) as orphaned_wishes FROM wishes w WHERE owner_token IS NOT NULL AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.client_token = w.owner_token)';
  END IF;
END $$;

-- =====================================================
-- QUERY 13: Summary of database state
-- =====================================================
SELECT 
  'profiles' as table_name,
  COUNT(*) as row_count,
  COUNT(CASE WHEN password_hash IS NOT NULL THEN 1 END) as has_password_count,
  COUNT(CASE WHEN client_token IS NOT NULL THEN 1 END) as has_client_token_count,
  COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as has_email_count
FROM profiles
UNION ALL
SELECT 'listings', COUNT(*), NULL, NULL, NULL FROM listings
UNION ALL
SELECT 'conversations', COUNT(*), NULL, NULL, NULL FROM conversations WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations')
UNION ALL
SELECT 'notifications', COUNT(*), NULL, NULL, NULL FROM notifications WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications')
UNION ALL
SELECT 'wishes', COUNT(*), NULL, NULL, NULL FROM wishes WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wishes')
UNION ALL
SELECT 'tasks', COUNT(*), NULL, NULL, NULL FROM tasks WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks');

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
-- 1. Open Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Copy EACH query above (one at a time)
-- 4. Run it
-- 5. Copy the results
-- 6. Share all results with me
--
-- Then I'll create a SAFE migration that:
-- ✅ Only adds missing columns
-- ✅ Doesn't break existing data
-- ✅ Fixes foreign key issues
-- ✅ Migrates data properly
-- ✅ Tests before committing
-- =====================================================
