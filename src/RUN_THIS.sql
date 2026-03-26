UPDATE profiles 
SET email = 'oldcycle_' || substring(id::text, 1, 8) || '@temp.local'
WHERE email IS NULL AND phone_number IS NULL;

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_contact_required;

DO $$ 
BEGIN
  ALTER TABLE profiles 
  ADD CONSTRAINT profiles_contact_required 
  CHECK (email IS NOT NULL OR phone_number IS NOT NULL);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
