-- =====================================================
-- OldCycle Password-Based Authentication Migration
-- Add password hash and hint columns to profiles table
-- =====================================================

-- Add password_hash column (stores SHA-256 hash of password)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add password_hint column (stores last 2 characters for password recovery)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_hint TEXT;

-- Create index for faster password lookups
CREATE INDEX IF NOT EXISTS idx_profiles_password_hash ON profiles(password_hash) WHERE password_hash IS NOT NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Password authentication columns added successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Users can now register with email/phone + password';
  RAISE NOTICE '2. Password hints show last 2 characters for recovery';
  RAISE NOTICE '3. No OTP verification needed!';
END $$;
