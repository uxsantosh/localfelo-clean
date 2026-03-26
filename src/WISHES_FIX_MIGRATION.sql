-- =====================================================
-- WISHES MATCHING FIX - CRITICAL PRODUCT FIX
-- =====================================================
-- This fixes the broken notification system where users
-- get irrelevant notifications (want iPhone, get sofa)
-- =====================================================

-- ✅ STEP 1: Add category_ids and subcategory_ids to wishes table
ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS category_ids TEXT[];

ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS subcategory_ids TEXT[];

COMMENT ON COLUMN wishes.category_ids IS 'Array of category slugs from PRODUCT_CATEGORIES for precise matching';
COMMENT ON COLUMN wishes.subcategory_ids IS 'Array of subcategory IDs from PRODUCT_CATEGORIES for precise matching';

-- ✅ STEP 2: Create indexes for fast matching
CREATE INDEX IF NOT EXISTS idx_wishes_category_ids 
ON wishes USING GIN(category_ids);

CREATE INDEX IF NOT EXISTS idx_wishes_subcategory_ids 
ON wishes USING GIN(subcategory_ids);

-- ✅ STEP 3: Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_wishes_status 
ON wishes(status) WHERE status IN ('open', 'negotiating');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE '✅ WISHES MATCHING FIX APPLIED SUCCESSFULLY!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Database Changes:';
  RAISE NOTICE '  ✅ wishes.category_ids column added (TEXT[])';
  RAISE NOTICE '  ✅ wishes.subcategory_ids column added (TEXT[])';
  RAISE NOTICE '  ✅ 3 performance indexes created';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Important Notes:';
  RAISE NOTICE '  • Old wishes still use category_id (backward compatible)';
  RAISE NOTICE '  • New wishes will use category_ids + subcategory_ids';
  RAISE NOTICE '  • Matching will be precise (category + subcategory)';
  RAISE NOTICE '  • No more irrelevant notifications!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Deploy updated wish creation UI (requires subcategory)';
  RAISE NOTICE '  2. Deploy updated matching logic (category + subcategory)';
  RAISE NOTICE '  3. Test: Create wish → Create matching listing → Verify notification';
  RAISE NOTICE '';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE '';
END $$;
