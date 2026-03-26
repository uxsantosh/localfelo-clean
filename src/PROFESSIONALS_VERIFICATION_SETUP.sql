-- =====================================================
-- PROFESSIONAL VERIFICATION SYSTEM - LocalFelo
-- =====================================================
-- This adds professional verification with document upload,
-- admin review, and verification badges
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. ADD VERIFICATION COLUMNS TO PROFESSIONALS TABLE
-- =====================================================

-- Add verification status columns
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected', 'reupload_requested')),
ADD COLUMN IF NOT EXISTS verification_message TEXT,
ADD COLUMN IF NOT EXISTS verification_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_professionals_verification_status ON professionals(verification_status);
CREATE INDEX IF NOT EXISTS idx_professionals_is_blocked ON professionals(is_blocked);

-- =====================================================
-- 2. CREATE VERIFICATION DOCUMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS professional_verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Document files
  aadhar_card_url TEXT,
  photo_url TEXT,
  
  -- Metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reupload_requested')),
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_verification_docs_professional ON professional_verification_documents(professional_id);
CREATE INDEX IF NOT EXISTS idx_verification_docs_user ON professional_verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_docs_status ON professional_verification_documents(status);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_verification_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_verification_documents_updated_at ON professional_verification_documents;
CREATE TRIGGER trigger_update_verification_documents_updated_at
  BEFORE UPDATE ON professional_verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_documents_updated_at();

-- =====================================================
-- 3. RLS POLICIES FOR VERIFICATION DOCUMENTS
-- =====================================================

ALTER TABLE professional_verification_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "verification_docs_select_policy" ON professional_verification_documents;
DROP POLICY IF EXISTS "verification_docs_insert_policy" ON professional_verification_documents;
DROP POLICY IF EXISTS "verification_docs_update_policy" ON professional_verification_documents;
DROP POLICY IF EXISTS "verification_docs_delete_policy" ON professional_verification_documents;

-- Anyone can view (we'll control this in the app)
CREATE POLICY "verification_docs_select_policy" 
  ON professional_verification_documents FOR SELECT 
  USING (true);

-- Anyone can insert (we validate in app with x-client-token)
CREATE POLICY "verification_docs_insert_policy" 
  ON professional_verification_documents FOR INSERT 
  WITH CHECK (true);

-- Anyone can update (we validate in app with x-client-token)
CREATE POLICY "verification_docs_update_policy" 
  ON professional_verification_documents FOR UPDATE 
  USING (true);

-- Anyone can delete (we validate in app with x-client-token)
CREATE POLICY "verification_docs_delete_policy" 
  ON professional_verification_documents FOR DELETE 
  USING (true);

-- =====================================================
-- 4. FIX RLS FOR PUBLIC ACCESS TO PROFESSIONALS
-- =====================================================

-- Drop old policies that might be blocking
DROP POLICY IF EXISTS "Anyone can view active professionals" ON professionals;
DROP POLICY IF EXISTS "allow_select_active_professionals" ON professionals;
DROP POLICY IF EXISTS "public_can_view_active_professionals" ON professionals;
DROP POLICY IF EXISTS "professionals_select_policy" ON professionals;

-- Create new public SELECT policy
-- This allows ANYONE (logged in or not) to view active, non-blocked professionals
CREATE POLICY "public_view_active_professionals"
  ON professionals FOR SELECT
  USING (is_active = true AND (is_blocked = false OR is_blocked IS NULL));

-- =====================================================
-- 5. STORAGE BUCKET FOR VERIFICATION DOCUMENTS
-- =====================================================

-- Note: You need to create the storage bucket manually in Supabase Dashboard
-- Bucket name: professional-verification-docs
-- Settings:
-- - Public: No
-- - File size limit: 5MB
-- - Allowed MIME types: image/jpeg, image/png, image/jpg, application/pdf

-- After creating the bucket, run these policies:

-- SELECT policy for verification documents bucket
-- DROP POLICY IF EXISTS "verification_docs_bucket_select" ON storage.objects;
-- CREATE POLICY "verification_docs_bucket_select"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'professional-verification-docs');

-- INSERT policy for verification documents bucket
-- DROP POLICY IF EXISTS "verification_docs_bucket_insert" ON storage.objects;
-- CREATE POLICY "verification_docs_bucket_insert"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'professional-verification-docs');

-- UPDATE policy for verification documents bucket
-- DROP POLICY IF EXISTS "verification_docs_bucket_update" ON storage.objects;
-- CREATE POLICY "verification_docs_bucket_update"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'professional-verification-docs');

-- DELETE policy for verification documents bucket
-- DROP POLICY IF EXISTS "verification_docs_bucket_delete" ON storage.objects;
-- CREATE POLICY "verification_docs_bucket_delete"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'professional-verification-docs');

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Function to get pending verification count (for admin)
CREATE OR REPLACE FUNCTION get_pending_verification_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM professional_verification_documents 
    WHERE status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. VERIFICATION COMPLETE!
-- =====================================================

-- ✅ Verification system is now ready!
-- Next steps:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create bucket: "professional-verification-docs"
-- 3. Set it to Private
-- 4. Add the storage policies commented above (uncomment and run)
-- 5. Your app can now handle verification requests!

SELECT 'Verification system setup complete!' AS status;
