-- =====================================================
-- 🔍 CHECK YOUR ACTUAL DATABASE SCHEMA
-- =====================================================
-- This will show us what ACTUALLY exists in your database
-- =====================================================

-- What columns does messages table have?
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'messages'
ORDER BY ordinal_position;
