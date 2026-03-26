-- OldCycle Database Migration: Add OTP Authentication Support
-- Run this SQL in your Supabase SQL Editor to add phone OTP support

-- =====================================================
-- 1. ADD AUTH_USER_ID COLUMN TO PROFILES TABLE
-- =====================================================
-- This links the profiles table to Supabase Auth users

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles(auth_user_id);

-- =====================================================
-- 2. ENABLE PHONE AUTHENTICATION IN SUPABASE
-- =====================================================
-- Go to Supabase Dashboard > Authentication > Providers
-- Enable "Phone" authentication
-- Configure your SMS provider (Twilio recommended for India)
-- Add your Twilio credentials:
--   - Account SID
--   - Auth Token
--   - Phone Number (with +91 country code)

-- =====================================================
-- 3. UPDATE ROW LEVEL SECURITY (OPTIONAL)
-- =====================================================
-- If you have RLS enabled, update policies to allow authenticated users

-- Allow authenticated users to read their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = auth_user_id);

-- Allow authenticated users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = auth_user_id);

-- Allow anyone to insert new profiles (for registration)
CREATE POLICY IF NOT EXISTS "Anyone can create profile" 
ON profiles FOR INSERT 
WITH CHECK (true);

-- =====================================================
-- 4. NOTES
-- =====================================================
-- After running this migration:
-- 1. Enable Phone authentication in Supabase Dashboard
-- 2. Configure SMS provider (Twilio recommended)
-- 3. Test OTP flow with a real phone number
-- 4. For India, use phone format: +91XXXXXXXXXX (10 digits after +91)
