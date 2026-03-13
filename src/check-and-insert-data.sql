-- ============================================
-- STEP 1: CHECK YOUR DATABASE STRUCTURE
-- ============================================
-- Run this FIRST to see what columns exist

-- Check listings table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'listings'
ORDER BY ordinal_position;

-- Check wishes table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'wishes'
ORDER BY ordinal_position;

-- Check tasks table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- View a sample listing to understand the data
SELECT * FROM listings LIMIT 1;

-- View a sample wish to understand the data
SELECT * FROM wishes LIMIT 1;

-- ============================================
-- After running above, share the results
-- Then I'll create the correct INSERT statements
-- ============================================
