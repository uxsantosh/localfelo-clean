-- =====================================================
-- ADD PRODUCT CATEGORY TO SHOP_PRODUCTS
-- =====================================================
-- Allows shop owners to organize products into user-created categories
-- like "Dals", "Rice", "Vegetables", etc.

-- Add category column to shop_products table
ALTER TABLE shop_products
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add index for faster category-based queries
CREATE INDEX IF NOT EXISTS idx_shop_products_category 
ON shop_products(shop_id, category) 
WHERE category IS NOT NULL;

-- Comment
COMMENT ON COLUMN shop_products.category IS 'User-created category for organizing products within a shop (e.g., "Dals", "Rice", "Vegetables")';
