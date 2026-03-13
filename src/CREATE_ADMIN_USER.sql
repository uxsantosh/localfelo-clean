-- =====================================================
-- CREATE ADMIN USER
-- =====================================================
-- Creates admin user: uxdesigner@gmail.com
-- Name: Santosh
-- Phone: 9063205739
-- =====================================================

DO $$
DECLARE
  v_user_id UUID;
  v_profile_id UUID;
  v_owner_token UUID;
  v_client_token UUID;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '👤 CREATING ADMIN USER...';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Check if user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'uxdesigner@gmail.com';
  
  IF v_user_id IS NOT NULL THEN
    RAISE NOTICE '⚠️  User already exists in auth.users';
    RAISE NOTICE '   User ID: %', v_user_id;
    
    -- Get or create profile
    SELECT id, owner_token::uuid INTO v_profile_id, v_owner_token 
    FROM profiles 
    WHERE email = 'uxdesigner@gmail.com';
    
    IF v_profile_id IS NULL THEN
      -- Create profile for existing auth user
      v_owner_token := gen_random_uuid();
      v_client_token := gen_random_uuid();
      
      INSERT INTO profiles (
        auth_user_id,
        email,
        name,
        phone_number,
        owner_token,
        client_token,
        is_admin,
        created_at,
        updated_at
      ) VALUES (
        v_user_id,
        'uxdesigner@gmail.com',
        'Santosh',
        '9063205739',
        v_owner_token::text,
        v_client_token::text,
        true,
        NOW(),
        NOW()
      ) RETURNING id INTO v_profile_id;
      
      RAISE NOTICE '✅ Created profile for existing user';
    ELSE
      -- Update existing profile
      UPDATE profiles 
      SET 
        name = 'Santosh',
        phone_number = '9063205739',
        is_admin = true,
        updated_at = NOW()
      WHERE id = v_profile_id;
      
      RAISE NOTICE '✅ Updated existing profile';
    END IF;
    
  ELSE
    -- Create new auth user
    v_user_id := gen_random_uuid();
    v_owner_token := gen_random_uuid();
    v_client_token := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      v_user_id,
      'uxdesigner@gmail.com',
      crypt('OldCycle@2024', gen_salt('bf')), -- Default password
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false,
      'authenticated'
    );
    
    RAISE NOTICE '✅ Created auth user';
    RAISE NOTICE '   Email: uxdesigner@gmail.com';
    RAISE NOTICE '   Password: OldCycle@2024 (change after first login)';
    
    -- Create profile
    INSERT INTO profiles (
      auth_user_id,
      email,
      name,
      phone_number,
      owner_token,
      client_token,
      is_admin,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      'uxdesigner@gmail.com',
      'Santosh',
      '9063205739',
      v_owner_token::text,
      v_client_token::text,
      true,
      NOW(),
      NOW()
    ) RETURNING id INTO v_profile_id;
    
    RAISE NOTICE '✅ Created profile';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ ADMIN USER READY!';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '👤 Admin Details:';
  RAISE NOTICE '   Email: uxdesigner@gmail.com';
  RAISE NOTICE '   Name: Santosh';
  RAISE NOTICE '   Phone: 9063205739';
  RAISE NOTICE '   Profile ID: %', v_profile_id;
  RAISE NOTICE '   Owner Token: %', v_owner_token;
  RAISE NOTICE '   Client Token: %', v_client_token;
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  
END $$;

-- Verify admin user
SELECT 
  '👤 Admin User Verification' as section,
  p.email,
  p.name,
  p.phone_number,
  p.is_admin,
  p.owner_token,
  p.client_token,
  p.created_at
FROM profiles p
WHERE p.email = 'uxdesigner@gmail.com';
