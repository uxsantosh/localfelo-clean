-- =====================================================
-- CHECK: Does the roles table exist?
-- =====================================================

DO $$
DECLARE
  roles_exists BOOLEAN;
  wishes_has_role_id BOOLEAN;
  tasks_has_role_id BOOLEAN;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 CHECKING ROLE SYSTEM STATUS';
  RAISE NOTICE '========================================';
  
  -- Check if roles table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'roles'
  ) INTO roles_exists;
  
  IF roles_exists THEN
    RAISE NOTICE '✅ roles table EXISTS';
  ELSE
    RAISE NOTICE '❌ roles table DOES NOT EXIST - needs to be created!';
  END IF;
  
  -- Check if wishes has role_id column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishes' AND column_name = 'role_id'
  ) INTO wishes_has_role_id;
  
  IF wishes_has_role_id THEN
    RAISE NOTICE '✅ wishes.role_id column EXISTS';
  ELSE
    RAISE NOTICE '❌ wishes.role_id column DOES NOT EXIST';
  END IF;
  
  -- Check if tasks has role_id column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'role_id'
  ) INTO tasks_has_role_id;
  
  IF tasks_has_role_id THEN
    RAISE NOTICE '✅ tasks.role_id column EXISTS';
  ELSE
    RAISE NOTICE '❌ tasks.role_id column DOES NOT EXIST';
  END IF;
  
  RAISE NOTICE '========================================';
  
  -- Provide recommendation
  IF NOT roles_exists THEN
    RAISE NOTICE '⚠️  REQUIRED ACTION:';
    RAISE NOTICE '    You need to create the roles table first!';
    RAISE NOTICE '    The professionals module should have created this.';
    RAISE NOTICE '========================================';
  ELSIF NOT wishes_has_role_id OR NOT tasks_has_role_id THEN
    RAISE NOTICE '⚠️  REQUIRED ACTION:';
    RAISE NOTICE '    Run the schema migration to add role_id columns.';
    RAISE NOTICE '========================================';
  ELSE
    RAISE NOTICE '✅ All structures exist! Ready for data migration.';
    RAISE NOTICE '========================================';
  END IF;
END $$;
