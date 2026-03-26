-- Fix RLS policy for site_settings to allow admins to insert/update
-- The original policy was missing WITH CHECK clause

-- Drop the existing policy
DROP POLICY IF EXISTS "Only admins can manage site settings" ON site_settings;

-- Recreate with proper WITH CHECK clause for INSERT/UPDATE
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
