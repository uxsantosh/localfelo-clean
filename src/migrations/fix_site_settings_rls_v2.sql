-- Fix RLS policy for site_settings table
-- Run this in Supabase SQL Editor

-- First, let's check if you're an admin (this should return your row with is_admin = true)
SELECT id, email, is_admin FROM profiles WHERE id = auth.uid();

-- Drop the existing policy
DROP POLICY IF EXISTS "Only admins can manage site settings" ON site_settings;

-- Recreate the policy with both USING and WITH CHECK clauses
CREATE POLICY "Only admins can manage site settings"
  ON site_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'site_settings';
