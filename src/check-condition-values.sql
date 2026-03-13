-- ============================================
-- CHECK CONDITION CONSTRAINT
-- ============================================

-- Method 1: Check constraint definition
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'listings'::regclass 
AND conname LIKE '%condition%';

-- Method 2: Check existing condition values in database
SELECT DISTINCT condition 
FROM listings 
WHERE condition IS NOT NULL;

-- Method 3: Show all constraints on listings table
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'listings'::regclass;
