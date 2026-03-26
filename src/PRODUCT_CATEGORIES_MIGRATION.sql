-- =====================================================
-- PRODUCT CATEGORIES MIGRATION - LocalFelo
-- Two-level category system for Marketplace & Product Wishes
-- =====================================================
-- ⚠️ IMPORTANT: Run this in Supabase SQL Editor
-- =====================================================

-- STEP 1: Add subcategory support to existing tables
-- =====================================================

-- Add subcategory_id to wishes table (nullable for backward compatibility)
ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS subcategory_id TEXT;

-- Add product_name field for "Other" category items
ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS product_name TEXT;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_wishes_subcategory ON wishes(subcategory_id);

-- STEP 2: Create product_categories table
-- =====================================================

CREATE TABLE IF NOT EXISTS product_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  emoji TEXT,
  parent_id TEXT DEFAULT NULL,
  is_main_category BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key for parent categories
ALTER TABLE product_categories 
ADD CONSTRAINT fk_parent_category 
FOREIGN KEY (parent_id) REFERENCES product_categories(id) 
ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);

-- STEP 3: Populate with LocalFelo Product Categories
-- =====================================================

-- MOBILES & ACCESSORIES
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('mobiles-accessories', 'Mobiles & Accessories', 'mobiles-accessories', '📱', NULL, true, 1),
('mobiles-smartphones', 'Smartphones', 'smartphones', '📱', 'mobiles-accessories', false, 1),
('mobiles-feature-phones', 'Feature phones', 'feature-phones', '📞', 'mobiles-accessories', false, 2),
('mobiles-accessories-sub', 'Mobile accessories', 'mobile-accessories', '🔌', 'mobiles-accessories', false, 3),
('mobiles-chargers', 'Chargers & cables', 'chargers-cables', '🔌', 'mobiles-accessories', false, 4),
('mobiles-earphones', 'Earphones & headphones', 'earphones-headphones', '🎧', 'mobiles-accessories', false, 5),
('mobiles-smartwatches', 'Smartwatches', 'smartwatches', '⌚', 'mobiles-accessories', false, 6),
('mobiles-parts', 'Mobile parts', 'mobile-parts', '🔧', 'mobiles-accessories', false, 7),
('mobiles-other', 'Other', 'mobiles-other', '📦', 'mobiles-accessories', false, 99);

-- LAPTOPS & COMPUTERS
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('laptops-computers', 'Laptops & Computers', 'laptops-computers', '💻', NULL, true, 2),
('laptops-laptops', 'Laptops', 'laptops', '💻', 'laptops-computers', false, 1),
('laptops-desktops', 'Desktops', 'desktops', '🖥️', 'laptops-computers', false, 2),
('laptops-accessories', 'Accessories', 'computer-accessories', '⌨️', 'laptops-computers', false, 3),
('laptops-printers', 'Printers & scanners', 'printers-scanners', '🖨️', 'laptops-computers', false, 4),
('laptops-storage', 'Storage devices', 'storage-devices', '💾', 'laptops-computers', false, 5),
('laptops-networking', 'Networking devices', 'networking-devices', '📡', 'laptops-computers', false, 6),
('laptops-other', 'Other', 'laptops-other', '📦', 'laptops-computers', false, 99);

-- ELECTRONICS & GADGETS
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('electronics-gadgets', 'Electronics & Gadgets', 'electronics-gadgets', '🔌', NULL, true, 3),
('electronics-tvs', 'Televisions', 'televisions', '📺', 'electronics-gadgets', false, 1),
('electronics-speakers', 'Speakers & audio', 'speakers-audio', '🔊', 'electronics-gadgets', false, 2),
('electronics-cameras', 'Cameras', 'cameras', '📷', 'electronics-gadgets', false, 3),
('electronics-gaming', 'Gaming consoles', 'gaming-consoles', '🎮', 'electronics-gadgets', false, 4),
('electronics-smart', 'Smart devices', 'smart-devices', '🏠', 'electronics-gadgets', false, 5),
('electronics-other', 'Other', 'electronics-other', '📦', 'electronics-gadgets', false, 99);

-- HOME APPLIANCES
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('home-appliances', 'Home Appliances', 'home-appliances', '🏠', NULL, true, 4),
('appliances-refrigerators', 'Refrigerators', 'refrigerators', '🧊', 'home-appliances', false, 1),
('appliances-washing', 'Washing machines', 'washing-machines', '👕', 'home-appliances', false, 2),
('appliances-ac', 'Air conditioners', 'air-conditioners', '❄️', 'home-appliances', false, 3),
('appliances-microwave', 'Microwave ovens', 'microwave-ovens', '🍲', 'home-appliances', false, 4),
('appliances-purifiers', 'Water purifiers', 'water-purifiers', '💧', 'home-appliances', false, 5),
('appliances-kitchen', 'Kitchen appliances', 'kitchen-appliances', '🍳', 'home-appliances', false, 6),
('appliances-geysers', 'Geysers & heaters', 'geysers-heaters', '🔥', 'home-appliances', false, 7),
('appliances-other', 'Other', 'appliances-other', '📦', 'home-appliances', false, 99);

-- FURNITURE
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('furniture', 'Furniture', 'furniture', '🛋️', NULL, true, 5),
('furniture-beds', 'Beds & mattresses', 'beds-mattresses', '🛏️', 'furniture', false, 1),
('furniture-sofas', 'Sofas & chairs', 'sofas-chairs', '🛋️', 'furniture', false, 2),
('furniture-tables', 'Tables & desks', 'tables-desks', '🪑', 'furniture', false, 3),
('furniture-wardrobes', 'Wardrobes & storage', 'wardrobes-storage', '🗄️', 'furniture', false, 4),
('furniture-office', 'Office furniture', 'office-furniture', '💼', 'furniture', false, 5),
('furniture-other', 'Other', 'furniture-other', '📦', 'furniture', false, 99);

-- HOME & KITCHEN
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('home-kitchen', 'Home & Kitchen', 'home-kitchen', '🍽️', NULL, true, 6),
('home-cookware', 'Cookware', 'cookware', '🍳', 'home-kitchen', false, 1),
('home-decor', 'Home decor', 'home-decor', '🖼️', 'home-kitchen', false, 2),
('home-lighting', 'Lighting', 'lighting', '💡', 'home-kitchen', false, 3),
('home-curtains', 'Curtains & furnishings', 'curtains-furnishings', '🪟', 'home-kitchen', false, 4),
('home-storage', 'Storage & organizers', 'storage-organizers', '📦', 'home-kitchen', false, 5),
('home-other', 'Other', 'home-other', '📦', 'home-kitchen', false, 99);

-- FASHION & CLOTHING
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('fashion-clothing', 'Fashion & Clothing', 'fashion-clothing', '👔', NULL, true, 7),
('fashion-mens', 'Men''s clothing', 'mens-clothing', '👔', 'fashion-clothing', false, 1),
('fashion-womens', 'Women''s clothing', 'womens-clothing', '👗', 'fashion-clothing', false, 2),
('fashion-kids', 'Kids clothing', 'kids-clothing', '👶', 'fashion-clothing', false, 3),
('fashion-footwear', 'Footwear', 'footwear', '👟', 'fashion-clothing', false, 4),
('fashion-bags', 'Bags & wallets', 'bags-wallets', '👜', 'fashion-clothing', false, 5),
('fashion-accessories', 'Accessories', 'fashion-accessories', '👓', 'fashion-clothing', false, 6),
('fashion-other', 'Other', 'fashion-other', '📦', 'fashion-clothing', false, 99);

-- BEAUTY & PERSONAL CARE
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('beauty-care', 'Beauty & Personal Care', 'beauty-care', '💄', NULL, true, 8),
('beauty-skincare', 'Skincare', 'skincare', '🧴', 'beauty-care', false, 1),
('beauty-haircare', 'Hair care', 'hair-care', '💇', 'beauty-care', false, 2),
('beauty-makeup', 'Makeup', 'makeup', '💄', 'beauty-care', false, 3),
('beauty-grooming', 'Grooming tools', 'grooming-tools', '💈', 'beauty-care', false, 4),
('beauty-perfumes', 'Perfumes', 'perfumes', '🌸', 'beauty-care', false, 5),
('beauty-other', 'Other', 'beauty-other', '📦', 'beauty-care', false, 99);

-- HEALTH & FITNESS
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('health-fitness', 'Health & Fitness', 'health-fitness', '💪', NULL, true, 9),
('health-equipment', 'Fitness equipment', 'fitness-equipment', '🏋️', 'health-fitness', false, 1),
('health-gym', 'Gym accessories', 'gym-accessories', '🎽', 'health-fitness', false, 2),
('health-supplements', 'Supplements', 'supplements', '💊', 'health-fitness', false, 3),
('health-medical', 'Medical devices', 'medical-devices', '🩺', 'health-fitness', false, 4),
('health-other', 'Other', 'health-other', '📦', 'health-fitness', false, 99);

-- BOOKS & STATIONERY
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('books-stationery', 'Books & Stationery', 'books-stationery', '📚', NULL, true, 10),
('books-academic', 'Academic books', 'academic-books', '📖', 'books-stationery', false, 1),
('books-exam', 'Exam preparation books', 'exam-books', '📝', 'books-stationery', false, 2),
('books-novels', 'Novels', 'novels', '📕', 'books-stationery', false, 3),
('books-stationery-sub', 'Stationery', 'stationery', '✏️', 'books-stationery', false, 4),
('books-other', 'Other', 'books-other', '📦', 'books-stationery', false, 99);

-- SPORTS & OUTDOORS
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('sports-outdoors', 'Sports & Outdoors', 'sports-outdoors', '⚽', NULL, true, 11),
('sports-equipment', 'Sports equipment', 'sports-equipment', '🏏', 'sports-outdoors', false, 1),
('sports-outdoor-gear', 'Outdoor gear', 'outdoor-gear', '🏕️', 'sports-outdoors', false, 2),
('sports-cycles', 'Cycles', 'cycles', '🚴', 'sports-outdoors', false, 3),
('sports-fitness-gear', 'Fitness gear', 'fitness-gear', '🏃', 'sports-outdoors', false, 4),
('sports-other', 'Other', 'sports-other', '📦', 'sports-outdoors', false, 99);

-- VEHICLES
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('vehicles', 'Vehicles', 'vehicles', '🚗', NULL, true, 12),
('vehicles-cars', 'Cars', 'cars', '🚗', 'vehicles', false, 1),
('vehicles-bikes', 'Bikes & scooters', 'bikes-scooters', '🏍️', 'vehicles', false, 2),
('vehicles-electric', 'Electric vehicles', 'electric-vehicles', '⚡', 'vehicles', false, 3),
('vehicles-accessories', 'Accessories', 'vehicle-accessories', '🔧', 'vehicles', false, 4),
('vehicles-parts', 'Spare parts', 'spare-parts', '⚙️', 'vehicles', false, 5),
('vehicles-other', 'Other', 'vehicles-other', '📦', 'vehicles', false, 99);

-- REAL ESTATE
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('real-estate', 'Real Estate', 'real-estate', '🏘️', NULL, true, 13),
('realestate-flats', 'Flats for sale', 'flats-for-sale', '🏢', 'real-estate', false, 1),
('realestate-houses', 'Houses for sale', 'houses-for-sale', '🏡', 'real-estate', false, 2),
('realestate-plots', 'Plots / land', 'plots-land', '🏞️', 'real-estate', false, 3),
('realestate-commercial', 'Commercial property', 'commercial-property', '🏬', 'real-estate', false, 4),
('realestate-other', 'Other', 'realestate-other', '📦', 'real-estate', false, 99);

-- RENTALS
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('rentals', 'Rentals', 'rentals', '🔑', NULL, true, 14),
('rentals-electronics', 'Electronics on rent', 'electronics-rent', '📱', 'rentals', false, 1),
('rentals-furniture', 'Furniture on rent', 'furniture-rent', '🛋️', 'rentals', false, 2),
('rentals-vehicles', 'Vehicles on rent', 'vehicles-rent', '🚗', 'rentals', false, 3),
('rentals-event', 'Event items', 'event-items', '🎉', 'rentals', false, 4),
('rentals-other', 'Other', 'rentals-other', '📦', 'rentals', false, 99);

-- PET SUPPLIES
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('pet-supplies', 'Pet Supplies', 'pet-supplies', '🐾', NULL, true, 15),
('pet-food', 'Pet food', 'pet-food', '🍖', 'pet-supplies', false, 1),
('pet-accessories', 'Accessories', 'pet-accessories', '🦴', 'pet-supplies', false, 2),
('pet-beds', 'Beds & cages', 'beds-cages', '🏠', 'pet-supplies', false, 3),
('pet-grooming', 'Grooming products', 'grooming-products', '🧼', 'pet-supplies', false, 4),
('pet-other', 'Other', 'pet-other', '📦', 'pet-supplies', false, 99);

-- BABY & KIDS
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('baby-kids', 'Baby & Kids', 'baby-kids', '👶', NULL, true, 16),
('baby-products', 'Baby products', 'baby-products', '🍼', 'baby-kids', false, 1),
('baby-toys', 'Toys', 'toys', '', 'baby-kids', false, 2),
('baby-school', 'School supplies', 'school-supplies', '🎒', 'baby-kids', false, 3),
('baby-other', 'Other', 'baby-other', '📦', 'baby-kids', false, 99);

-- INDUSTRIAL & BUSINESS
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('industrial-business', 'Industrial & Business', 'industrial-business', '🏭', NULL, true, 17),
('industrial-machinery', 'Machinery', 'machinery', '⚙️', 'industrial-business', false, 1),
('industrial-tools', 'Tools', 'tools', '🔨', 'industrial-business', false, 2),
('industrial-shop', 'Shop supplies', 'shop-supplies', '🏪', 'industrial-business', false, 3),
('industrial-office', 'Office supplies', 'office-supplies', '📎', 'industrial-business', false, 4),
('industrial-other', 'Other', 'industrial-other', '📦', 'industrial-business', false, 99);

-- FOOD & GROCERY
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('food-grocery', 'Food & Grocery', 'food-grocery', '🛒', NULL, true, 18),
('food-fresh', 'Fresh groceries', 'fresh-groceries', '🥬', 'food-grocery', false, 1),
('food-packaged', 'Packaged food', 'packaged-food', '📦', 'food-grocery', false, 2),
('food-homemade', 'Homemade food', 'homemade-food', '🍛', 'food-grocery', false, 3),
('food-beverages', 'Beverages', 'beverages', '🧃', 'food-grocery', false, 4),
('food-other', 'Other', 'food-other', '📦', 'food-grocery', false, 99);

-- OTHER
INSERT INTO product_categories (id, name, slug, emoji, parent_id, is_main_category, sort_order) VALUES
('other', 'Other', 'other', '📦', NULL, true, 99),
('other-items', 'Other items', 'other-items', '📦', 'other', false, 1);

-- =====================================================
-- STEP 4: Create helper functions
-- =====================================================

-- Get all main categories
CREATE OR REPLACE FUNCTION get_main_product_categories()
RETURNS TABLE (
  id TEXT,
  name TEXT,
  slug TEXT,
  emoji TEXT,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.name,
    pc.slug,
    pc.emoji,
    pc.sort_order
  FROM product_categories pc
  WHERE pc.is_main_category = true
  ORDER BY pc.sort_order;
END;
$$ LANGUAGE plpgsql;

-- Get subcategories by parent
CREATE OR REPLACE FUNCTION get_product_subcategories(parent_category_id TEXT)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  slug TEXT,
  emoji TEXT,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.name,
    pc.slug,
    pc.emoji,
    pc.sort_order
  FROM product_categories pc
  WHERE pc.parent_id = parent_category_id
  ORDER BY pc.sort_order;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DONE! Product categories ready to use
-- =====================================================