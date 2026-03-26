-- =====================================================
-- 🔍 COMPLETE CHAT DIAGNOSIS (Single Output)
-- =====================================================

DO $$
DECLARE
    rls_status BOOLEAN;
    policy_count INTEGER;
    message_count INTEGER;
    realtime_enabled BOOLEAN;
    sender_id_type TEXT;
    rec RECORD;
BEGIN
    -- Check RLS status
    SELECT rowsecurity INTO rls_status
    FROM pg_tables
    WHERE tablename = 'messages' AND schemaname = 'public';
    
    RAISE NOTICE '================================';
    RAISE NOTICE '🔍 CHAT DIAGNOSIS RESULTS';
    RAISE NOTICE '================================';
    RAISE NOTICE '';
    RAISE NOTICE '1️⃣ RLS STATUS ON MESSAGES TABLE:';
    RAISE NOTICE '   RLS Enabled: %', COALESCE(rls_status::text, 'NULL');
    RAISE NOTICE '';
    
    -- Check policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'messages';
    
    RAISE NOTICE '2️⃣ RLS POLICIES ON MESSAGES:';
    RAISE NOTICE '   Total Policies: %', policy_count;
    
    IF policy_count > 0 THEN
        FOR rec IN 
            SELECT policyname, cmd
            FROM pg_policies
            WHERE tablename = 'messages'
            ORDER BY policyname
        LOOP
            RAISE NOTICE '   - % (operation: %)', rec.policyname, rec.cmd;
        END LOOP;
    ELSE
        RAISE NOTICE '   (No policies found)';
    END IF;
    RAISE NOTICE '';
    
    -- Check sender_id data type
    SELECT data_type INTO sender_id_type
    FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'sender_id';
    
    RAISE NOTICE '3️⃣ MESSAGES TABLE STRUCTURE:';
    RAISE NOTICE '   sender_id type: %', sender_id_type;
    RAISE NOTICE '';
    
    -- Check message count
    SELECT COUNT(*) INTO message_count FROM messages;
    
    RAISE NOTICE '4️⃣ MESSAGES IN DATABASE:';
    RAISE NOTICE '   Total Messages: %', message_count;
    
    IF message_count > 0 THEN
        FOR rec IN 
            SELECT 
                LEFT(sender_id::text, 20) as sender_preview,
                sender_name,
                read,
                created_at
            FROM messages
            ORDER BY created_at DESC
            LIMIT 3
        LOOP
            RAISE NOTICE '   - From: % (sender_id: %...) | Read: % | Time: %', 
                rec.sender_name, rec.sender_preview, rec.read, rec.created_at;
        END LOOP;
    END IF;
    RAISE NOTICE '';
    
    -- Check realtime
    SELECT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'messages'
    ) INTO realtime_enabled;
    
    RAISE NOTICE '5️⃣ REALTIME STATUS:';
    RAISE NOTICE '   Messages in realtime publication: %', realtime_enabled;
    RAISE NOTICE '';
    
    -- Check triggers
    RAISE NOTICE '6️⃣ TRIGGERS ON MESSAGES TABLE:';
    FOR rec IN 
        SELECT trigger_name, event_manipulation
        FROM information_schema.triggers
        WHERE event_object_table = 'messages'
        ORDER BY trigger_name
    LOOP
        RAISE NOTICE '   - % (event: %)', rec.trigger_name, rec.event_manipulation;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '================================';
    RAISE NOTICE '✅ DIAGNOSIS COMPLETE';
    RAISE NOTICE '================================';
    
END $$;