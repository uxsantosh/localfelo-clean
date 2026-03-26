-- =====================================================
-- 🔍 CHECK PROFILES TABLE SCHEMA
-- =====================================================

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name IN ('id', 'client_token', 'owner_token', 'display_name')
ORDER BY ordinal_position;
