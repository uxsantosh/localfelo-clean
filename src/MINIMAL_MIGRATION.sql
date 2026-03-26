-- =====================================================
-- LOCALFELO MINIMAL MIGRATION - NO VERIFICATION QUERIES
-- =====================================================
-- This is the absolute minimal version that just adds
-- the required columns and indexes without any fluff
-- =====================================================

-- ✅ Add subcategory_id to listings
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS subcategory_id TEXT;

-- ✅ Add subcategory_ids to professionals  
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS subcategory_ids TEXT[];

-- ✅ Add category_ids and subcategory_ids to wishes (CRITICAL FIX)
ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS category_ids TEXT[];

ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS subcategory_ids TEXT[];

-- ✅ Listings indexes
CREATE INDEX IF NOT EXISTS idx_listings_category_slug ON listings(category_slug);
CREATE INDEX IF NOT EXISTS idx_listings_subcategory ON listings(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);

-- ✅ Wishes indexes
CREATE INDEX IF NOT EXISTS idx_wishes_category ON wishes(category_id);
CREATE INDEX IF NOT EXISTS idx_wishes_category_ids ON wishes USING GIN(category_ids);
CREATE INDEX IF NOT EXISTS idx_wishes_subcategory_ids ON wishes USING GIN(subcategory_ids);
CREATE INDEX IF NOT EXISTS idx_wishes_location ON wishes(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_wishes_status ON wishes(status) WHERE status IN ('open', 'negotiating');

-- ✅ Shop categories indexes
CREATE INDEX IF NOT EXISTS idx_shop_categories_category ON shop_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_shop_categories_subcategory ON shop_categories(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_shop_categories_shop ON shop_categories(shop_id);

-- ✅ Shops indexes
CREATE INDEX IF NOT EXISTS idx_shops_location ON shops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_shops_user ON shops(user_id);

-- ✅ Professionals indexes
CREATE INDEX IF NOT EXISTS idx_professionals_subcategories ON professionals USING GIN(subcategory_ids);
CREATE INDEX IF NOT EXISTS idx_professionals_location ON professionals(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_professionals_category ON professionals(category_id);
CREATE INDEX IF NOT EXISTS idx_professionals_user ON professionals(user_id);

-- ✅ Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_detected_category ON tasks(detected_category);
CREATE INDEX IF NOT EXISTS idx_tasks_subcategory_ids ON tasks USING GIN(subcategory_ids);
CREATE INDEX IF NOT EXISTS idx_tasks_location ON tasks(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);

-- Done! No verification queries, no statistics, just the changes.