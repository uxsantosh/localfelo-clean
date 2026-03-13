-- =====================================================
-- Push Notifications Infrastructure
-- =====================================================
-- This migration creates the necessary tables and policies
-- for push notification token management.
--
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create push_tokens table
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create unique constraint on token (one token per device)
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_tokens_token_unique 
  ON push_tokens(token);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id 
  ON push_tokens(user_id);

-- Create index for active tokens only
CREATE INDEX IF NOT EXISTS idx_push_tokens_active 
  ON push_tokens(user_id, is_active) 
  WHERE is_active = true;

-- Create index for platform-specific queries
CREATE INDEX IF NOT EXISTS idx_push_tokens_platform 
  ON push_tokens(platform, is_active) 
  WHERE is_active = true;

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own tokens
CREATE POLICY "Users can insert own tokens"
  ON push_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tokens
CREATE POLICY "Users can update own tokens"
  ON push_tokens
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own tokens
CREATE POLICY "Users can delete own tokens"
  ON push_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Users can read their own tokens
CREATE POLICY "Users can read own tokens"
  ON push_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- Function: Update updated_at timestamp automatically
-- =====================================================

CREATE OR REPLACE FUNCTION update_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS push_tokens_updated_at ON push_tokens;
CREATE TRIGGER push_tokens_updated_at
  BEFORE UPDATE ON push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_push_tokens_updated_at();

-- =====================================================
-- Helper Functions (Optional)
-- =====================================================

-- Function to deactivate old tokens when new one is added
CREATE OR REPLACE FUNCTION deactivate_old_tokens()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new token is inserted for a user+platform combination,
  -- deactivate all other tokens for that user+platform
  UPDATE push_tokens
  SET is_active = false
  WHERE user_id = NEW.user_id
    AND platform = NEW.platform
    AND token != NEW.token
    AND is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (optional - only if you want one token per platform per user)
-- Uncomment if needed:
-- DROP TRIGGER IF EXISTS deactivate_old_tokens_trigger ON push_tokens;
-- CREATE TRIGGER deactivate_old_tokens_trigger
--   AFTER INSERT ON push_tokens
--   FOR EACH ROW
--   EXECUTE FUNCTION deactivate_old_tokens();

-- =====================================================
-- Cleanup Function (Optional)
-- =====================================================

-- Function to clean up inactive tokens older than 90 days
CREATE OR REPLACE FUNCTION cleanup_inactive_push_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM push_tokens
  WHERE is_active = false
    AND updated_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- You can run this periodically via cron or manually:
-- SELECT cleanup_inactive_push_tokens();

-- =====================================================
-- Grant Permissions
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON push_tokens TO authenticated;
GRANT USAGE ON SEQUENCE push_tokens_id_seq TO authenticated;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Run these to verify the setup:

-- Check table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'push_tokens'
-- ORDER BY ordinal_position;

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'push_tokens';

-- Check policies
-- SELECT policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'push_tokens';

-- =====================================================
-- Notes
-- =====================================================
-- 
-- 1. This schema allows multiple tokens per user per platform
-- 2. Tokens are marked as active/inactive rather than deleted
-- 3. RLS policies ensure users can only access their own tokens
-- 4. Automatic updated_at timestamp on every update
-- 5. Foreign key to auth.users ensures cascade delete when user is deleted
-- 6. Platform is constrained to 'android', 'ios', or 'web'
-- 7. Token field is unique across all platforms and users
-- 
-- =====================================================
