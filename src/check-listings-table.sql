-- ============================================
-- CHECK ACTUAL LISTINGS TABLE STRUCTURE
-- ============================================

-- Method 1: Check column names
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'listings'
ORDER BY ordinal_position;

-- Method 2: View an existing listing (if any exist)
SELECT * FROM listings LIMIT 1;

-- Method 3: Check all tables in your database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Method 4: Show the CREATE TABLE statement
SELECT 
    'CREATE TABLE ' || table_name || ' (' ||
    string_agg(column_name || ' ' || data_type, ', ') || ');'
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'listings'
GROUP BY table_name;
