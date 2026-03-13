-- =====================================================
-- MAKE EXISTING USER ADMIN
-- =====================================================
-- Updates an existing user to admin status
-- Email: uxdesigner@gmail.com
-- =====================================================

DO $$
DECLARE
  v_profile_id UUID;
  v_email TEXT := 'uxdesigner@gmail.com';
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '👤 MAKING USER ADMIN...';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Find existing profile by email
  SELECT id INTO v_profile_id
  FROM profiles 
  WHERE email = v_email;
  
  IF v_profile_id IS NULL THEN
    RAISE NOTICE '❌ User not found with email: %', v_email;
    RAISE NOTICE '';
    RAISE NOTICE '💡 Please sign up first through the app, then run this script.';
    RAISE NOTICE '';
  ELSE
    -- Update user to admin
    UPDATE profiles 
    SET 
      name = 'Santosh',
      phone_number = '9063205739',
      is_admin = true,
      updated_at = NOW()
    WHERE id = v_profile_id;
    
    RAISE NOTICE '✅ User updated to admin!';
    RAISE NOTICE '';
    RAISE NOTICE '👤 Admin Details:';
    RAISE NOTICE '   Email: %', v_email;
    RAISE NOTICE '   Name: Santosh';
    RAISE NOTICE '   Phone: 9063205739';
    RAISE NOTICE '   Profile ID: %', v_profile_id;
    RAISE NOTICE '';
  END IF;
  
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  
END $$;

-- Verify admin user
SELECT 
  '👤 Admin User Status' as section,
  p.email,
  p.name,
  p.phone_number,
  p.is_admin,
  p.owner_token,
  p.client_token,
  p.created_at
FROM profiles p
WHERE p.email = 'uxdesigner@gmail.com';
