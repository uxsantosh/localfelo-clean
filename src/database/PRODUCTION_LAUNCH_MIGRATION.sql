-- =====================================================
-- PRODUCTION LAUNCH MIGRATION
-- Final database changes for production readiness
-- =====================================================

-- ✅ STEP 5: WhatsApp Opt-Out System
-- Add whatsapp_enabled field to profiles table

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN profiles.whatsapp_enabled IS 'User consent for WhatsApp notifications. Set to false if user replies STOP/UNSUBSCRIBE.';

-- Create index for faster lookups when sending notifications
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_enabled 
ON profiles(whatsapp_enabled) 
WHERE whatsapp_enabled = false;

-- =====================================================
-- OPTIONAL: WhatsApp Message Log Table
-- Track WhatsApp messages sent and delivery status
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  template_name VARCHAR(100),
  message_content TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, failed
  provider VARCHAR(50), -- interakt, twilio, gupshup
  provider_message_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_id 
ON whatsapp_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status 
ON whatsapp_messages(status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at 
ON whatsapp_messages(created_at DESC);

-- Add comment
COMMENT ON TABLE whatsapp_messages IS 'Log of all WhatsApp messages sent through the system';

-- =====================================================
-- OPTIONAL: WhatsApp Opt-Out Log Table
-- Track when users opt out and why
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_optouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  phone_number VARCHAR(20),
  optout_message TEXT, -- The exact message user sent (STOP, UNSUBSCRIBE, etc.)
  optout_source VARCHAR(50) DEFAULT 'whatsapp', -- whatsapp, settings_page, admin
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_whatsapp_optouts_user_id 
ON whatsapp_optouts(user_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_optouts_created_at 
ON whatsapp_optouts(created_at DESC);

-- Add comment
COMMENT ON TABLE whatsapp_optouts IS 'Log of WhatsApp notification opt-outs for compliance';

-- =====================================================
-- RLS POLICIES
-- Ensure users can only access their own data
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_optouts ENABLE ROW LEVEL SECURITY;

-- Users can view their own WhatsApp messages
CREATE POLICY "Users can view own whatsapp messages" 
ON whatsapp_messages FOR SELECT 
USING (user_id = auth.uid());

-- Users can view their own opt-out history
CREATE POLICY "Users can view own optout history" 
ON whatsapp_optouts FOR SELECT 
USING (user_id = auth.uid());

-- Admins can view all (using custom x-client-token auth)
-- Note: Adjust this policy based on your auth system

-- =====================================================
-- MIGRATION NOTES
-- =====================================================

-- 1. Run this migration BEFORE deploying new code
-- 2. Verify all indexes are created
-- 3. Check RLS policies are active
-- 4. Test with sample data

-- =====================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =====================================================

-- To rollback this migration:
-- DROP TABLE IF EXISTS whatsapp_optouts CASCADE;
-- DROP TABLE IF EXISTS whatsapp_messages CASCADE;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS whatsapp_enabled;
