# LocalFelo Database Migration Guide
## Shops Module Updates

This guide provides all SQL queries needed to ensure your database is ready for the updated Shops module.

---

## Prerequisites

Before running these migrations:
1. Backup your database
2. Test on staging environment first
3. Ensure you have proper database permissions

---

## Migration 1: Add Category Column to Products

**File**: `/database/add_product_category_column.sql`

```sql
-- =====================================================
-- ADD PRODUCT CATEGORY TO SHOP_PRODUCTS
-- =====================================================
-- Allows shop owners to organize products into user-created categories

-- Add category column to shop_products table
ALTER TABLE shop_products
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add index for faster category-based queries
CREATE INDEX IF NOT EXISTS idx_shop_products_category 
ON shop_products(shop_id, category) 
WHERE category IS NOT NULL;

-- Add comment
COMMENT ON COLUMN shop_products.category IS 'User-created category for organizing products within a shop (e.g., "Dals", "Rice", "Vegetables")';
```

**Run this migration**:
```bash
psql -h your-db-host -d your-db-name -U your-db-user -f database/add_product_category_column.sql
```

---

## Verification Queries

### Check if category column exists:
```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'shop_products' 
  AND column_name = 'category';
```

**Expected Output**:
```
column_name | data_type        | character_maximum_length
------------|------------------|-------------------------
category    | character varying| 100
```

### Check index creation:
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'shop_products'
  AND indexname = 'idx_shop_products_category';
```

**Expected Output**:
```
indexname                   | indexdef
----------------------------|--------------------------------------------------
idx_shop_products_category  | CREATE INDEX idx_shop_products_category ON ...
```

---

## RLS (Row Level Security) Policies

The existing RLS policies on `shop_products` should already cover the new `category` column.
Verify with:

```sql
-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'shop_products';
```

If policies need updating:

```sql
-- Drop existing policies (if needed)
DROP POLICY IF EXISTS "Users can view their own shop products" ON shop_products;
DROP POLICY IF EXISTS "Users can insert their own shop products" ON shop_products;
DROP POLICY IF EXISTS "Users can update their own shop products" ON shop_products;
DROP POLICY IF EXISTS "Users can delete their own shop products" ON shop_products;

-- Recreate policies with category column support
-- SELECT policy (anyone can view active products)
CREATE POLICY "Anyone can view active shop products"
ON shop_products FOR SELECT
USING (is_active = true);

-- INSERT policy (only shop owner can add products)
CREATE POLICY "Shop owners can insert products"
ON shop_products FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shops
    WHERE shops.id = shop_products.shop_id
      AND shops.user_id = (SELECT id FROM users WHERE auth_token = current_setting('request.headers')::json->>'x-client-token')
  )
);

-- UPDATE policy (only shop owner can update products)
CREATE POLICY "Shop owners can update products"
ON shop_products FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM shops
    WHERE shops.id = shop_products.shop_id
      AND shops.user_id = (SELECT id FROM users WHERE auth_token = current_setting('request.headers')::json->>'x-client-token')
  )
);

-- DELETE policy (only shop owner can delete products)
CREATE POLICY "Shop owners can delete products"
ON shop_products FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM shops
    WHERE shops.id = shop_products.shop_id
      AND shops.user_id = (SELECT id FROM users WHERE auth_token = current_setting('request.headers')::json->>'x-client-token')
  )
);
```

---

## Data Migration (Optional)

If you want to organize existing products into categories:

### Option 1: Move all products to "General" category
```sql
UPDATE shop_products
SET category = 'General'
WHERE category IS NULL;
```

### Option 2: Auto-categorize based on product names (example)
```sql
-- Electronics
UPDATE shop_products
SET category = 'Electronics'
WHERE category IS NULL
  AND (
    product_name ILIKE '%phone%' OR
    product_name ILIKE '%laptop%' OR
    product_name ILIKE '%tv%' OR
    product_name ILIKE '%mobile%'
  );

-- Groceries
UPDATE shop_products
SET category = 'Groceries'
WHERE category IS NULL
  AND (
    product_name ILIKE '%rice%' OR
    product_name ILIKE '%dal%' OR
    product_name ILIKE '%flour%' OR
    product_name ILIKE '%atta%'
  );

-- Fashion
UPDATE shop_products
SET category = 'Fashion'
WHERE category IS NULL
  AND (
    product_name ILIKE '%shirt%' OR
    product_name ILIKE '%pant%' OR
    product_name ILIKE '%dress%' OR
    product_name ILIKE '%cloth%'
  );
```

---

## Performance Optimization

### Analyze table after migration:
```sql
ANALYZE shop_products;
```

### Check index usage:
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename = 'shop_products'
ORDER BY idx_scan DESC;
```

### Check table size:
```sql
SELECT 
  pg_size_pretty(pg_total_relation_size('shop_products')) as total_size,
  pg_size_pretty(pg_relation_size('shop_products')) as table_size,
  pg_size_pretty(pg_total_relation_size('shop_products') - pg_relation_size('shop_products')) as indexes_size;
```

---

## Testing Queries

### Test category creation:
```sql
-- Insert a product with category
INSERT INTO shop_products (shop_id, product_name, price, images, category, is_active)
VALUES (
  'test-shop-id',
  'Test Product',
  99.99,
  ARRAY['https://example.com/image1.jpg'],
  'Test Category',
  true
);
```

### Test category update:
```sql
-- Update product category
UPDATE shop_products
SET category = 'New Category'
WHERE id = 'test-product-id';
```

### Test category filtering:
```sql
-- Get products by category
SELECT *
FROM shop_products
WHERE shop_id = 'test-shop-id'
  AND category = 'Electronics'
  AND is_active = true
ORDER BY created_at DESC;
```

### Test category grouping:
```sql
-- Count products per category for a shop
SELECT 
  COALESCE(category, 'Uncategorized') as category,
  COUNT(*) as product_count
FROM shop_products
WHERE shop_id = 'test-shop-id'
  AND is_active = true
GROUP BY category
ORDER BY product_count DESC;
```

---

## Rollback Plan

If you need to rollback the migration:

```sql
-- Drop the index
DROP INDEX IF EXISTS idx_shop_products_category;

-- Remove the category column
ALTER TABLE shop_products DROP COLUMN IF EXISTS category;

-- Note: This will permanently delete all category data
-- Make sure to backup first!
```

---

## Troubleshooting

### Issue: Column already exists
**Error**: `column "category" of relation "shop_products" already exists`

**Solution**: The migration has already been run. Verify with:
```sql
SELECT * FROM shop_products LIMIT 1;
```

### Issue: Permission denied
**Error**: `permission denied for table shop_products`

**Solution**: Grant proper permissions:
```sql
GRANT ALL ON TABLE shop_products TO your_app_user;
```

### Issue: RLS blocking updates
**Error**: `new row violates row-level security policy`

**Solution**: Check RLS policies and ensure x-client-token is being passed correctly in headers.

### Issue: Index creation timeout
**Error**: `timeout while creating index`

**Solution**: Create index concurrently (doesn't lock table):
```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shop_products_category 
ON shop_products(shop_id, category) 
WHERE category IS NOT NULL;
```

---

## Post-Migration Checklist

- [ ] Category column added successfully
- [ ] Index created and working
- [ ] RLS policies verified
- [ ] Sample product with category created and queried
- [ ] Category filtering works in application
- [ ] Category grouping works in application
- [ ] EditShopScreen loads without errors
- [ ] Can create/rename/delete categories
- [ ] Can move products between categories
- [ ] Performance is acceptable (query times < 100ms)

---

## Monitoring

### Monitor query performance:
```sql
-- Enable query stats (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Check slow queries on shop_products
SELECT 
  calls,
  mean_exec_time,
  query
FROM pg_stat_statements
WHERE query ILIKE '%shop_products%'
  AND mean_exec_time > 100  -- queries taking > 100ms
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Monitor index usage:
```sql
-- Run this query weekly
SELECT 
  indexrelname as index_name,
  idx_scan as times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename = 'shop_products'
ORDER BY idx_scan DESC;
```

---

## Support

For issues during migration:
1. Check Supabase dashboard for error logs
2. Verify database connection settings
3. Ensure proper authentication headers
4. Check browser console for client-side errors
5. Review API responses in Network tab

---

**Migration Author**: LocalFelo Dev Team  
**Last Updated**: March 23, 2026  
**Database Version**: PostgreSQL 14+  
**Supabase Compatible**: Yes
