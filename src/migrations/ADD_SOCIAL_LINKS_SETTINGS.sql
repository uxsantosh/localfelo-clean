-- Migration: Add Social Media Links to Site Settings
-- Description: Adds columns for social media links (Instagram, Facebook, LinkedIn) to site_settings table
-- Date: 2026-02-15

-- Add social media URL columns to site_settings table if they don't exist
DO $$ 
BEGIN
    -- Add instagram_url column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_settings' 
        AND column_name = 'instagram_url'
    ) THEN
        ALTER TABLE site_settings ADD COLUMN instagram_url TEXT;
        RAISE NOTICE 'Added instagram_url column to site_settings';
    END IF;

    -- Add facebook_url column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_settings' 
        AND column_name = 'facebook_url'
    ) THEN
        ALTER TABLE site_settings ADD COLUMN facebook_url TEXT;
        RAISE NOTICE 'Added facebook_url column to site_settings';
    END IF;

    -- Add linkedin_url column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_settings' 
        AND column_name = 'linkedin_url'
    ) THEN
        ALTER TABLE site_settings ADD COLUMN linkedin_url TEXT;
        RAISE NOTICE 'Added linkedin_url column to site_settings';
    END IF;
END $$;

-- Insert default social_links setting row if it doesn't exist
INSERT INTO site_settings (
    id,
    setting_type,
    enabled,
    instagram_url,
    facebook_url,
    linkedin_url,
    priority,
    created_at,
    updated_at
)
VALUES (
    'social_links',
    'social_links',
    true,
    '',  -- Empty by default, admin will fill these
    '',
    '',
    1,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify the setup
SELECT 
    id,
    setting_type,
    instagram_url,
    facebook_url,
    linkedin_url
FROM site_settings
WHERE id = 'social_links';

-- Success message
RAISE NOTICE '✅ Social media links columns added successfully!';
RAISE NOTICE '📝 Admin can now configure social links in Admin Panel > Site Settings';
