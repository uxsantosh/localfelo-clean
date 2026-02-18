-- =====================================================
-- OTP VERIFICATION SYSTEM - LocalFelo
-- Creates table and utilities for phone OTP authentication
-- Uses 2Factor API for sending and verifying OTPs
-- =====================================================

-- Create otp_verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  session_id VARCHAR(100) NOT NULL UNIQUE,
  otp_hash TEXT, -- Store hashed OTP for extra security (optional)
  two_factor_session_id TEXT, -- Session ID from 2Factor API
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_otp_session_id ON otp_verifications(session_id);
CREATE INDEX IF NOT EXISTS idx_otp_two_factor_session ON otp_verifications(two_factor_session_id);
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_verifications(expires_at);

-- Auto-cleanup expired OTPs (helps keep table small)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM otp_verifications 
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$;

-- Enable RLS (Row Level Security)
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- No public policies - only edge functions (service role) can access this table
-- This is intentional - OTP verification should only happen server-side

-- Add helpful comment
COMMENT ON TABLE otp_verifications IS 'OTP sessions for phone authentication via 2Factor API. Automatically cleaned after 1 hour of expiry.';
COMMENT ON COLUMN otp_verifications.session_id IS 'Internal session ID returned to frontend';
COMMENT ON COLUMN otp_verifications.two_factor_session_id IS 'Session ID from 2Factor API response';
COMMENT ON COLUMN otp_verifications.attempts IS 'Number of failed verification attempts (max 3)';
COMMENT ON COLUMN otp_verifications.expires_at IS 'OTP expires 10 minutes after creation';

-- =====================================================
-- VERIFICATION QUERY
-- Run this to verify the table was created correctly:
-- =====================================================
-- SELECT 
--   table_name,
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'otp_verifications'
-- ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ OTP VERIFICATION SYSTEM CREATED SUCCESSFULLY';
  RAISE NOTICE '📋 Table: otp_verifications';
  RAISE NOTICE '🔒 RLS Enabled (service role only)';
  RAISE NOTICE '📌 Indexes: phone, session_id, two_factor_session_id, expires_at';
  RAISE NOTICE '🧹 Auto-cleanup function: cleanup_expired_otps()';
  RAISE NOTICE '';
  RAISE NOTICE '🔜 NEXT STEPS:';
  RAISE NOTICE '1. Deploy send-otp edge function';
  RAISE NOTICE '2. Deploy verify-otp edge function';
  RAISE NOTICE '3. Set TWOFACTOR_API_KEY secret';
  RAISE NOTICE '4. Update frontend auth-phone.ts service';
END $$;
