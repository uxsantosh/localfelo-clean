-- Check what columns actually exist in helper_preferences table
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'helper_preferences'
ORDER BY ordinal_position;
