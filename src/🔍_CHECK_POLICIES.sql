-- Check all policies on storage.objects for user-uploads bucket
SELECT 
  policyname,
  cmd as operation,
  roles::text,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (
    qual::text LIKE '%user-uploads%' 
    OR with_check::text LIKE '%user-uploads%'
    OR policyname LIKE '%avatar%'
    OR policyname LIKE '%user-uploads%'
  )
ORDER BY cmd, policyname;
