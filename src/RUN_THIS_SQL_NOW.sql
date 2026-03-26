-- =====================================================
-- RUN THIS SQL IN SUPABASE SQL EDITOR - ALL 3 FIXES
-- =====================================================
-- This file combines all SQL needed for the 3 issues
-- Run this entire file at once in Supabase SQL Editor

-- =====================================================
-- FIX #1: PUBLIC ACCESS TO PROFESSIONALS
-- =====================================================

-- Drop all conflicting policies
DROP POLICY IF EXISTS "Anyone can view active professionals" ON professionals;
DROP POLICY IF EXISTS "allow_select_active_professionals" ON professionals;
DROP POLICY IF EXISTS "public_can_view_active_professionals" ON professionals;
DROP POLICY IF EXISTS "professionals_select_policy" ON professionals;
DROP POLICY IF EXISTS "admins_can_view_all_professionals" ON professionals;
DROP POLICY IF EXISTS "Admins can view all professionals" ON professionals;

-- Create single public access policy (non-logged-in users can see professionals)
CREATE POLICY "public_view_professionals"
  ON professionals FOR SELECT
  USING (is_active = true AND (is_blocked IS NULL OR is_blocked = false));

-- =====================================================
-- FIX #3: VERIFICATION SYSTEM - DATABASE SETUP
-- =====================================================

-- Add verification columns to professionals table
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected', 'reupload_requested')),
ADD COLUMN IF NOT EXISTS verification_message TEXT,
ADD COLUMN IF NOT EXISTS verification_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_professionals_verification_status ON professionals(verification_status);
CREATE INDEX IF NOT EXISTS idx_professionals_is_blocked ON professionals(is_blocked);

-- Create verification documents table
CREATE TABLE IF NOT EXISTS professional_verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  aadhar_card_url TEXT,
  photo_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reupload_requested')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for verification documents
CREATE INDEX IF NOT EXISTS idx_verification_docs_professional ON professional_verification_documents(professional_id);
CREATE INDEX IF NOT EXISTS idx_verification_docs_user ON professional_verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_docs_status ON professional_verification_documents(status);

-- Create update trigger
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

-- Enable RLS
ALTER TABLE professional_verification_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for verification documents (permissive because we use x-client-token)
DROP POLICY IF EXISTS "verification_docs_select_policy" ON professional_verification_documents;
DROP POLICY IF EXISTS "verification_docs_insert_policy" ON professional_verification_documents;
DROP POLICY IF EXISTS "verification_docs_update_policy" ON professional_verification_documents;
DROP POLICY IF EXISTS "verification_docs_delete_policy" ON professional_verification_documents;

CREATE POLICY "verification_docs_select_policy" ON professional_verification_documents FOR SELECT USING (true);
CREATE POLICY "verification_docs_insert_policy" ON professional_verification_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "verification_docs_update_policy" ON professional_verification_documents FOR UPDATE USING (true);
CREATE POLICY "verification_docs_delete_policy" ON professional_verification_documents FOR DELETE USING (true);

-- Helper function for pending count
CREATE OR REPLACE FUNCTION get_pending_verification_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INTEGER FROM professional_verification_documents WHERE status = 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICATION COMPLETE!
-- =====================================================

SELECT 'All SQL executed successfully! ✅' AS status;
SELECT 'Next step: Create storage bucket "professional-verification-docs" in Supabase Dashboard' AS next_action;

-- =====================================================
-- STORAGE BUCKET POLICIES (Run AFTER creating bucket)
-- =====================================================
-- Go to Supabase Dashboard > Storage > Create bucket: "professional-verification-docs"
-- Then uncomment and run these policies:

-- DROP POLICY IF EXISTS "verification_docs_select" ON storage.objects;
-- DROP POLICY IF EXISTS "verification_docs_insert" ON storage.objects;
-- DROP POLICY IF EXISTS "verification_docs_update" ON storage.objects;
-- DROP POLICY IF EXISTS "verification_docs_delete" ON storage.objects;

-- CREATE POLICY "verification_docs_select"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'professional-verification-docs');

-- CREATE POLICY "verification_docs_insert"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'professional-verification-docs');

-- CREATE POLICY "verification_docs_update"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'professional-verification-docs');

-- CREATE POLICY "verification_docs_delete"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'professional-verification-docs');
