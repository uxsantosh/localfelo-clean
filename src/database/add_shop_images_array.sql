-- =====================================================
-- ADD SHOP IMAGES ARRAY SUPPORT
-- =====================================================
-- Migration to support multiple shop images (separate from logo)
-- Run this after add_shop_timings.sql

-- Add shop_images column (array of URLs)
ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS shop_images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add index for shops with images
CREATE INDEX IF NOT EXISTS idx_shops_with_images 
ON shops ((array_length(shop_images, 1))) 
WHERE shop_images IS NOT NULL AND array_length(shop_images, 1) > 0;

-- Migrate existing shop_image_url to shop_images array (if exists)
UPDATE shops 
SET shop_images = ARRAY[shop_image_url]
WHERE shop_image_url IS NOT NULL 
  AND shop_image_url != ''
  AND (shop_images IS NULL OR array_length(shop_images, 1) IS NULL);

-- Optional: Drop old shop_image_url column after migration (uncomment if needed)
-- ALTER TABLE shops DROP COLUMN IF EXISTS shop_image_url;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- SELECT shop_name, logo_url, shop_images, array_length(shop_images, 1) as image_count
-- FROM shops 
-- WHERE shop_images IS NOT NULL;
