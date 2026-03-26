-- =====================================================
-- FINAL CLEANUP - Remove last duplicate policy
-- =====================================================

DROP POLICY IF EXISTS "Users can create conversations as buyer" ON conversations;

-- Verify - Should show exactly 7 policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations')
ORDER BY tablename, cmd;
