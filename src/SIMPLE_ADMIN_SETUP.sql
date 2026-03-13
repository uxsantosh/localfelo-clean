-- =====================================================
-- ONE QUERY ADMIN SETUP - Just copy and run this!
-- =====================================================

-- Delete all users and create admin in one go
DELETE FROM profiles;
DELETE FROM auth.users;

INSERT INTO profiles (
  id,
  email,
  name,
  password_hash,
  password_hint,
  client_token,
  is_admin,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'uxsantosh@gmail.com',
  'Admin',
  encode(digest('Sun@6000', 'sha256'), 'hex'),  -- Auto-generates SHA-256 hash
  'Sun',
  gen_random_uuid()::text,
  true,
  NOW(),
  NOW()
);

-- =====================================================
-- DONE! Now login with:
-- Email: uxsantosh@gmail.com
-- Password: Sun@6000
-- =====================================================
