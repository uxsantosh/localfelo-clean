-- =====================================================
-- ALTERNATIVE FIX: Create Bucket Only (No RLS Changes)
-- =====================================================
-- This avoids the "must be owner of table objects" error
-- by only creating the bucket, not modifying RLS policies

-- =====================================================
-- STEP 1: CREATE BUCKET ONLY
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[];

-- =====================================================
-- VERIFY BUCKET CREATION
-- =====================================================

SELECT 
  '✅ BUCKET CHECK' as status,
  id,
  name,
  public,
  file_size_limit / 1048576 || ' MB' as max_size
FROM storage.buckets
WHERE id = 'user-uploads';

-- =====================================================
-- NEXT STEPS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '   BUCKET CREATED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Bucket "user-uploads" created';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  RLS policies NOT created (permission denied)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Go to Dashboard → Storage → user-uploads';
  RAISE NOTICE '2. Click "Policies" tab';
  RAISE NOTICE '3. Add these policies using the UI:';
  RAISE NOTICE '   - Public read access';
  RAISE NOTICE '   - Authenticated upload';
  RAISE NOTICE '   - Authenticated update';
  RAISE NOTICE '';
  RAISE NOTICE 'OR follow the guide in:';
  RAISE NOTICE '🎯_DASHBOARD_FIX_NO_SQL.md';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
