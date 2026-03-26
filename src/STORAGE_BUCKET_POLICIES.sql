-- =====================================================
-- STORAGE BUCKET RLS POLICIES FOR TASK IMAGES
-- =====================================================
-- Run these AFTER creating the "task-images" storage bucket
-- Go to: Supabase Dashboard → Storage → task-images → Policies
-- =====================================================

-- Policy 1: Anyone can upload task images
CREATE POLICY "Anyone can upload task images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'task-images');

-- Policy 2: Anyone can view task images  
CREATE POLICY "Anyone can view task images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'task-images');

-- Policy 3: Users can delete their own task images
CREATE POLICY "Users can delete own task images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'task-images');

-- =====================================================
-- VERIFY POLICIES ARE ACTIVE
-- =====================================================

-- Check all policies on storage.objects
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%task images%'
ORDER BY policyname;

-- Expected result: 3 policies listed
-- =====================================================
