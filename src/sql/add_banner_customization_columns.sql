-- Add new columns to site_settings table for banner customization
-- Run this in your Supabase SQL editor

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS gradient_color_1 TEXT DEFAULT '#FF6B35',
ADD COLUMN IF NOT EXISTS gradient_color_2 TEXT DEFAULT '#F7931E',
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#FF6B35',
ADD COLUMN IF NOT EXISTS opacity INTEGER DEFAULT 8;

-- Update existing home_banner record with default values if it exists
UPDATE site_settings
SET 
  gradient_color_1 = COALESCE(gradient_color_1, '#FF6B35'),
  gradient_color_2 = COALESCE(gradient_color_2, '#F7931E'),
  text_color = COALESCE(text_color, '#FF6B35'),
  opacity = COALESCE(opacity, 8)
WHERE id = 'home_banner';
