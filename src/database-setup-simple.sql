-- ========================================
-- OldCycle Admin Panel - Simple Setup
-- ========================================
-- Copy each command below ONE AT A TIME into Supabase SQL Editor

-- STEP 1: Add is_active column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- STEP 2: Add is_hidden column to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- STEP 3: Add admin_notes column to listings (optional)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- STEP 4: Done! Refresh your OldCycle app
