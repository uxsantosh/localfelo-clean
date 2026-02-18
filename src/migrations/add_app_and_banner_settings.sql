-- Add new columns to site_settings for app download link and active task banner
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS app_download_url TEXT,
ADD COLUMN IF NOT EXISTS gradient_color_1 TEXT DEFAULT '#CDFF00',
ADD COLUMN IF NOT EXISTS gradient_color_2 TEXT DEFAULT '#CDFF00',
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS opacity INTEGER DEFAULT 8,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Insert default app download setting
INSERT INTO site_settings (id, setting_type, enabled, message, app_download_url, priority)
VALUES (
  'app_download',
  'app_download',
  false, -- Disabled by default until admin adds the link
  'Download our app from Google Play Store',
  '', -- Empty until admin adds the link
  1
) ON CONFLICT (id) DO NOTHING;

-- Insert default active task banner setting
INSERT INTO site_settings (id, setting_type, enabled, title, message, icon, image_url, priority)
VALUES (
  'active_task_banner',
  'active_task_banner',
  true,
  'Active Tasks',
  'Tap to view details',
  'briefcase',
  '', -- Optional image URL
  1
) ON CONFLICT (id) DO NOTHING;

-- Update home_banner if exists with gradient columns
UPDATE site_settings
SET 
  gradient_color_1 = '#CDFF00',
  gradient_color_2 = '#CDFF00',
  text_color = '#000000',
  opacity = 8
WHERE id = 'home_banner'
AND gradient_color_1 IS NULL;
