-- Check avatar_url column details in profiles table
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'avatar_url';

-- Check if there's any data in avatar_url
SELECT 
  id,
  name,
  CASE 
    WHEN avatar_url IS NULL THEN 'NULL'
    WHEN avatar_url LIKE 'data:%' THEN 'BASE64 (' || LENGTH(avatar_url) || ' chars)'
    WHEN avatar_url LIKE 'http%' THEN 'URL: ' || LEFT(avatar_url, 50) || '...'
    ELSE 'OTHER: ' || LEFT(avatar_url, 50)
  END as avatar_url_info,
  LENGTH(avatar_url) as avatar_url_length
FROM profiles
WHERE avatar_url IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;
