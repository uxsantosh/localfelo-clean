-- =====================================================
-- DIAGNOSTIC: CHECK LISTINGS TABLE SCHEMA AND DATA
-- =====================================================

-- Step 1: Check listings table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'listings'
ORDER BY ordinal_position;

-- Step 2: Check if there are any constraints on listings
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'listings'::regclass;

-- Step 3: Check recent listings (last 5)
SELECT 
    id,
    title,
    category_slug,
    is_active,
    owner_token,
    city,
    area_slug,
    created_at
FROM listings
ORDER BY created_at DESC
LIMIT 5;

-- Step 4: Count active vs inactive listings
SELECT 
    is_active,
    COUNT(*) as count
FROM listings
GROUP BY is_active;

-- Step 5: Check if category_id column exists
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'listings' 
    AND column_name = 'category_id'
) AS has_category_id_column;
