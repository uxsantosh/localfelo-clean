-- =====================================================
-- 🔍 CHECK RLS POLICIES ON MESSAGES TABLE
-- =====================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY policyname;
