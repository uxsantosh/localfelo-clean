-- =====================================================
-- IMMEDIATE FIX: Allow Public Avatar Uploads
-- =====================================================
-- Your phone OTP doesn't create Supabase Auth sessions,
-- so we need to allow public uploads to user-uploads bucket.

-- Step 1: Drop the broken authenticated-only policy
DROP POLICY IF EXISTS "Authenticated avatar upload" ON storage.objects;

-- Step 2: Create new public upload policy  
CREATE POLICY "Public avatar upload"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'user-uploads');

-- Step 3: Verify it worked
SELECT 
  '✅ FIXED!' as status,
  policyname,
  cmd,
  roles::text,
  with_check::text
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname = 'Public avatar upload';
