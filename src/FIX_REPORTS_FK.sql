-- ========================================
-- FIX REPORTS FOREIGN KEY RELATIONSHIP
-- ========================================
-- This adds the missing foreign key constraint
-- so admin reports management works correctly
-- ========================================

-- Step 1: Check if reports table exists
SELECT 
  'Reports Table' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'reports'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Step 2: Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reports_reported_by_fkey'
    AND table_name = 'reports'
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE public.reports
    ADD CONSTRAINT reports_reported_by_fkey
    FOREIGN KEY (reported_by)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Foreign key constraint added: reports_reported_by_fkey';
  ELSE
    RAISE NOTICE '✅ Foreign key constraint already exists';
  END IF;
END $$;

-- Step 3: Add foreign key for listing_id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reports_listing_id_fkey'
    AND table_name = 'reports'
  ) THEN
    ALTER TABLE public.reports
    ADD CONSTRAINT reports_listing_id_fkey
    FOREIGN KEY (listing_id)
    REFERENCES public.listings(id)
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Foreign key constraint added: reports_listing_id_fkey';
  ELSE
    RAISE NOTICE '✅ Foreign key constraint already exists';
  END IF;
END $$;

-- Step 4: Verify foreign keys are in place
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  '✅ ACTIVE' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'reports'
  AND tc.table_schema = 'public'
ORDER BY tc.constraint_name;

-- ========================================
-- DONE! 🎉
-- ========================================
-- The reports foreign keys are now properly set up
-- Admin reports management should work correctly
-- ========================================
