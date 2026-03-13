-- =====================================================
-- COMPLETE CATEGORY SYSTEM WITH RENTAL COVERAGE
-- Safe migration with existence checks
-- Uses TEXT IDs to match existing schema
-- =====================================================

-- 1. Ensure categories table has proper structure
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'listing',
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 2. Set existing records to have a type
UPDATE categories SET type = 'listing' WHERE type IS NULL;

-- 3. Create temporary category to migrate existing records
INSERT INTO categories (id, name, slug, emoji, type, sort_order) 
VALUES ('9999', 'Migrating', 'migrating-temp', '🔄', 'listing', 999)
ON CONFLICT (id) DO NOTHING;

-- 4. Update foreign key references ONLY if tables exist
-- Listings table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'listings' AND column_name = 'category_id') THEN
      UPDATE listings SET category_id = '9999' WHERE category_id NOT IN ('9999');
    END IF;
  END IF;
END $$;

-- Wishes table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wishes') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'wishes' AND column_name = 'category_id') THEN
      UPDATE wishes SET category_id = '9999' WHERE category_id IS NOT NULL AND category_id NOT IN ('9999');
    END IF;
  END IF;
END $$;

-- Tasks table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'tasks' AND column_name = 'category_id') THEN
      UPDATE tasks SET category_id = '9999' WHERE category_id IS NOT NULL AND category_id NOT IN ('9999');
    END IF;
  END IF;
END $$;

-- 5. Delete old categories (except temp)
DELETE FROM categories WHERE id != '9999';

-- 6. INSERT MARKETPLACE CATEGORIES (type='listing')
INSERT INTO categories (id, name, slug, emoji, type, sort_order) VALUES
('101', 'Mobile Phones', 'mobile-phones', '📱', 'listing', 1),
('102', 'Laptops & Computers', 'laptops-computers', '💻', 'listing', 2),
('103', 'Electronics & Appliances', 'electronics-appliances', '📺', 'listing', 3),
('104', 'Furniture', 'furniture', '🛋️', 'listing', 4),
('105', 'Home Appliances', 'home-appliances', '🏠', 'listing', 5),
('106', 'Tools & Equipment', 'tools-equipment', '🔧', 'listing', 6),
('107', 'Bikes & Scooters', 'bikes-scooters', '🏍️', 'listing', 7),
('108', 'Cars', 'cars', '🚗', 'listing', 8),
('109', 'Real Estate - Rent', 'real-estate-rent', '🏘️', 'listing', 9),
('110', 'Real Estate - Sale', 'real-estate-sale', '🏡', 'listing', 10),
('111', 'Home & Living', 'home-living', '🛏️', 'listing', 11),
('112', 'Kitchen & Dining', 'kitchen-dining', '🍳', 'listing', 12),
('113', 'Fashion', 'fashion', '👕', 'listing', 13),
('114', 'Books & Sports', 'books-sports', '📚', 'listing', 14),
('115', 'Pets', 'pets', '🐕', 'listing', 15),
('116', 'Services', 'services', '⚙️', 'listing', 16),
('117', 'Other Items', 'listing-other', '📦', 'listing', 17);

-- 7. INSERT WISH CATEGORIES (type='wish')
INSERT INTO categories (id, name, slug, emoji, type, sort_order) VALUES
('201', 'Buy something', 'buy-something', '🛒', 'wish', 1),
('202', 'Rent house', 'rent-house', '🏘️', 'wish', 2),
('203', 'Rent item', 'rent-item', '🔑', 'wish', 3),
('204', 'Find used item', 'find-used-item', '♻️', 'wish', 4),
('205', 'Find service', 'find-service', '🔧', 'wish', 5),
('206', 'Find help', 'find-help', '🤝', 'wish', 6),
('207', 'Find deal', 'find-deal', '💰', 'wish', 7),
('208', 'Other Wish', 'wish-other', '✨', 'wish', 8);

-- 8. INSERT TASK CATEGORIES (type='task')
INSERT INTO categories (id, name, slug, emoji, type, sort_order) VALUES
('301', 'Delivery / Pickup', 'delivery-pickup', '📦', 'task', 1),
('302', 'Moving / Lifting', 'moving-lifting', '🏋️', 'task', 2),
('303', 'Repairs & Maintenance', 'repairs-maintenance', '🔧', 'task', 3),
('304', 'Cleaning', 'cleaning', '🧹', 'task', 4),
('305', 'Tech Help', 'tech-help', '💻', 'task', 5),
('306', 'Cooking', 'cooking', '🍳', 'task', 6),
('307', 'Office Errands', 'office-errands', '📋', 'task', 7),
('308', 'Personal Help', 'personal-help', '🤝', 'task', 8),
('309', 'Other Task', 'task-other', '📌', 'task', 9);

-- 9. Migrate existing records to appropriate "Other" category
-- Listings
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'listings' AND column_name = 'category_id') THEN
      UPDATE listings SET category_id = '117' WHERE category_id = '9999';
    END IF;
  END IF;
END $$;

-- Wishes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wishes') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'wishes' AND column_name = 'category_id') THEN
      UPDATE wishes SET category_id = '208' WHERE category_id = '9999';
    END IF;
  END IF;
END $$;

-- Tasks
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'tasks' AND column_name = 'category_id') THEN
      UPDATE tasks SET category_id = '309' WHERE category_id = '9999';
    END IF;
  END IF;
END $$;

-- 10. Delete the temporary category
DELETE FROM categories WHERE id = '9999';

-- 11. Add status columns if missing
-- Wishes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wishes') THEN
    ALTER TABLE wishes 
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS accepted_price DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS accepted_by UUID,
    ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Tasks
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    ALTER TABLE tasks 
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open',
    ADD COLUMN IF NOT EXISTS accepted_by UUID,
    ADD COLUMN IF NOT EXISTS accepted_price DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 12. Add foreign key constraints if tables exist
DO $$
BEGIN
  -- Wishes accepted_by foreign key
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wishes') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'wishes_accepted_by_fkey'
    ) THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'wishes' AND column_name = 'accepted_by') THEN
        ALTER TABLE wishes 
        ADD CONSTRAINT wishes_accepted_by_fkey 
        FOREIGN KEY (accepted_by) REFERENCES profiles(id);
      END IF;
    END IF;
  END IF;

  -- Tasks accepted_by foreign key
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'tasks_accepted_by_fkey'
    ) THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'tasks' AND column_name = 'accepted_by') THEN
        ALTER TABLE tasks 
        ADD CONSTRAINT tasks_accepted_by_fkey 
        FOREIGN KEY (accepted_by) REFERENCES profiles(id);
      END IF;
    END IF;
  END IF;
END $$;

-- 13. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Wishes indexes (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wishes') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'wishes' AND column_name = 'status') THEN
      CREATE INDEX IF NOT EXISTS idx_wishes_status ON wishes(status);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'wishes' AND column_name = 'accepted_by') THEN
      CREATE INDEX IF NOT EXISTS idx_wishes_accepted_by ON wishes(accepted_by);
    END IF;
  END IF;
END $$;

-- Tasks indexes (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'tasks' AND column_name = 'status') THEN
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'tasks' AND column_name = 'accepted_by') THEN
      CREATE INDEX IF NOT EXISTS idx_tasks_accepted_by ON tasks(accepted_by);
    END IF;
  END IF;
END $$;

-- 14. Add comments for documentation
COMMENT ON COLUMN categories.type IS 'Category type: listing (marketplace), wish (intent-based), or task (action-based)';
COMMENT ON COLUMN categories.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN categories.sort_order IS 'Display order within category type';

-- 15. Create views for easy querying
CREATE OR REPLACE VIEW v_marketplace_categories AS
SELECT * FROM categories WHERE type = 'listing' ORDER BY sort_order;

CREATE OR REPLACE VIEW v_wish_categories AS
SELECT * FROM categories WHERE type = 'wish' ORDER BY sort_order;

CREATE OR REPLACE VIEW v_task_categories AS
SELECT * FROM categories WHERE type = 'task' ORDER BY sort_order;

-- =====================================================
-- DONE! ✅
-- =====================================================
-- Summary:
-- - 17 Marketplace categories (101-117)
-- - 8 Wish categories (201-208)
-- - 9 Task categories (301-309)
-- - All with type enforcement and rental coverage
-- =====================================================