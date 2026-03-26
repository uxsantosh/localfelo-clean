-- =====================================================
-- DIAGNOSTIC: Check Existing Notification Types
-- =====================================================
-- Run this FIRST to see what notification types exist in your database
-- This will help us update the constraint to match your actual data

-- 1. Show all unique notification types currently in database
SELECT 
  '1️⃣ EXISTING NOTIFICATION TYPES' as check_name,
  type,
  COUNT(*) as count,
  MIN(created_at) as first_seen,
  MAX(created_at) as last_seen
FROM notifications
GROUP BY type
ORDER BY count DESC;

-- 2. Show notifications with NULL type
SELECT 
  '2️⃣ NOTIFICATIONS WITH NULL TYPE' as check_name,
  COUNT(*) as count_with_null_type
FROM notifications
WHERE type IS NULL;

-- 3. Show sample notifications to understand structure
SELECT 
  '3️⃣ SAMPLE NOTIFICATIONS' as check_name,
  id,
  type,
  title,
  message,
  created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 5;

-- 4. Show notification table structure
SELECT 
  '4️⃣ NOTIFICATION COLUMNS' as check_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- 5. Check existing constraints
SELECT 
  '5️⃣ EXISTING CONSTRAINTS' as check_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'notifications';
