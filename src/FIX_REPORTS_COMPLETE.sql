-- ========================================
-- COMPLETE REPORTS TABLE FIX
-- ========================================
-- Fixes the column name mismatch and adds foreign keys
-- ========================================

-- ========================================
-- STEP 1: CHECK CURRENT STATE
-- ========================================

-- Check if reports table exists
SELECT 
  'Reports Table Check' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'reports'
    ) THEN '✅ Table exists'
    ELSE '❌ Table missing'
  END as status;

-- Check current columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'reports'
ORDER BY ordinal_position;

-- ========================================
-- STEP 2: RENAME COLUMN IF NEEDED
-- ========================================

-- Check if we need to rename reporter_id to reported_by
DO $$
BEGIN
  -- If reporter_id exists, rename it to reported_by
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'reports'
      AND column_name = 'reporter_id'
  ) THEN
    -- Drop foreign key if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'reports_reporter_id_fkey'
        AND table_name = 'reports'
    ) THEN
      ALTER TABLE public.reports DROP CONSTRAINT reports_reporter_id_fkey;
      RAISE NOTICE '✅ Dropped old foreign key: reports_reporter_id_fkey';
    END IF;
    
    -- Rename the column
    ALTER TABLE public.reports RENAME COLUMN reporter_id TO reported_by;
    RAISE NOTICE '✅ Renamed column: reporter_id → reported_by';
  ELSE
    RAISE NOTICE 'ℹ️ Column already named reported_by or does not exist';
  END IF;
END $$;

-- ========================================
-- STEP 3: ENSURE reported_by COLUMN EXISTS
-- ========================================

-- Add reported_by column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'reports'
      AND column_name = 'reported_by'
  ) THEN
    ALTER TABLE public.reports ADD COLUMN reported_by UUID;
    RAISE NOTICE '✅ Added column: reported_by';
  ELSE
    RAISE NOTICE 'ℹ️ Column reported_by already exists';
  END IF;
END $$;

-- ========================================
-- STEP 4: ADD FOREIGN KEY CONSTRAINTS
-- ========================================

-- Add foreign key for reported_by → profiles(id)
DO $$
BEGIN
  -- Drop if exists (to recreate cleanly)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reports_reported_by_fkey'
      AND table_name = 'reports'
  ) THEN
    ALTER TABLE public.reports DROP CONSTRAINT reports_reported_by_fkey;
  END IF;
  
  -- Add the constraint
  ALTER TABLE public.reports
  ADD CONSTRAINT reports_reported_by_fkey
  FOREIGN KEY (reported_by)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;
  
  RAISE NOTICE '✅ Foreign key added: reports_reported_by_fkey';
END $$;

-- Add foreign key for listing_id → listings(id)
DO $$
BEGIN
  -- Drop if exists (to recreate cleanly)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reports_listing_id_fkey'
      AND table_name = 'reports'
  ) THEN
    ALTER TABLE public.reports DROP CONSTRAINT reports_listing_id_fkey;
  END IF;
  
  -- Add the constraint
  ALTER TABLE public.reports
  ADD CONSTRAINT reports_listing_id_fkey
  FOREIGN KEY (listing_id)
  REFERENCES public.listings(id)
  ON DELETE CASCADE;
  
  RAISE NOTICE '✅ Foreign key added: reports_listing_id_fkey';
END $$;

-- ========================================
-- STEP 5: ADD MISSING COLUMNS
-- ========================================

-- Add status column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'reports'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.reports 
    ADD COLUMN status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'));
    
    RAISE NOTICE '✅ Added column: status';
  ELSE
    RAISE NOTICE 'ℹ️ Column status already exists';
  END IF;
END $$;

-- ========================================
-- STEP 6: CREATE INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_reports_listing_id ON public.reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_by ON public.reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- ========================================
-- STEP 7: FIX RLS POLICIES
-- ========================================

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can create reports" ON public.reports;
DROP POLICY IF EXISTS "Anyone can read own reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON public.reports;

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create new policies
-- Policy 1: Anyone can create reports
CREATE POLICY "Anyone can create reports"
ON public.reports
FOR INSERT
WITH CHECK (true);

-- Policy 2: Users can read their own reports
CREATE POLICY "Users can read own reports"
ON public.reports
FOR SELECT
USING (reported_by = auth.uid());

-- Policy 3: Admins can view all reports
CREATE POLICY "Admins can view all reports"
ON public.reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
  )
);

-- Policy 4: Admins can update reports
CREATE POLICY "Admins can update reports"
ON public.reports
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
  )
);

-- Policy 5: Admins can delete reports
CREATE POLICY "Admins can delete reports"
ON public.reports
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
  )
);

-- ========================================
-- STEP 8: GRANT PERMISSIONS
-- ========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ========================================
-- STEP 9: VERIFICATION
-- ========================================

-- Verify structure
SELECT 
  'Table Structure' as check_type,
  '✅ COMPLETE' as status
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'reports';

-- Verify foreign keys
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS references_table,
  ccu.column_name AS references_column,
  '✅ ACTIVE' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'reports'
  AND tc.table_schema = 'public';

-- Verify RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  '✅ ACTIVE' as status
FROM pg_policies
WHERE tablename = 'reports'
  AND schemaname = 'public';

-- Verify indexes
SELECT
  indexname,
  indexdef,
  '✅ ACTIVE' as status
FROM pg_indexes
WHERE tablename = 'reports'
  AND schemaname = 'public';

-- ========================================
-- DONE! 🎉
-- ========================================
-- Reports table is now properly configured:
-- ✅ Column renamed: reporter_id → reported_by
-- ✅ Foreign keys added
-- ✅ RLS policies configured
-- ✅ Indexes optimized
-- ✅ Admin reports management will work!
-- ========================================
