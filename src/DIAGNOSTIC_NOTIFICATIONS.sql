-- =====================================================
-- NOTIFICATIONS TABLE DIAGNOSTIC
-- Run this FIRST to see your table structure
-- =====================================================

-- Check column types
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Check existing policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY cmd, policyname;

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'notifications';

/*
COPY THE OUTPUT FROM ABOVE AND SEND IT TO ME!

I need to see:
1. What type is user_id column? (uuid or text?)
2. What policies currently exist?
3. Is RLS enabled?

This will help me create the perfect fix for your specific setup.
*/
