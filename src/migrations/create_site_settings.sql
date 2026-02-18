-- Create site_settings table for managing banners, promos, and site-wide messages
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  setting_type TEXT NOT NULL, -- 'banner', 'greeting', 'floating_badge', 'ticker'
  enabled BOOLEAN DEFAULT true,
  title TEXT,
  message TEXT NOT NULL,
  emoji TEXT,
  icon TEXT, -- 'sparkles', 'gift', 'megaphone', 'bell', 'party', 'zap'
  style_type TEXT, -- 'promo', 'info', 'success', 'announcement'
  position TEXT, -- For floating badge: 'top-right', 'bottom-right', etc.
  storage_key TEXT, -- Unique key to control dismissal
  priority INTEGER DEFAULT 0, -- Higher priority shows first
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read site settings
CREATE POLICY "Anyone can view site settings"
  ON site_settings
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only admins can insert/update/delete site settings
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
  );

-- Insert default banner
INSERT INTO site_settings (id, setting_type, enabled, title, message, emoji, icon, style_type, storage_key, priority)
VALUES (
  'welcome-banner',
  'banner',
  true,
  'Welcome to OldCycle',
  'Welcome to OldCycle! 🎉 Buy & Sell locally with zero commission!',
  '🚀',
  'sparkles',
  'promo',
  'welcome-banner-v1',
  1
) ON CONFLICT (id) DO NOTHING;

-- Insert default greeting
INSERT INTO site_settings (id, setting_type, enabled, message, emoji, priority)
VALUES (
  'default-greeting',
  'greeting',
  true,
  '', -- Empty means auto time-based greeting
  '👋',
  1
) ON CONFLICT (id) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_site_settings_type ON site_settings(setting_type);
CREATE INDEX IF NOT EXISTS idx_site_settings_enabled ON site_settings(enabled);
CREATE INDEX IF NOT EXISTS idx_site_settings_priority ON site_settings(priority DESC);
