# SQL Migration Instructions

## 🎯 Quick Start

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Copy & Run Migration
1. Open `/CRITICAL_FIX_MIGRATION.sql` in this project
2. Copy ALL contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click "Run" button

### Step 3: Verify Success
Look for success messages in the Results panel:
```
✅ CRITICAL FIXES APPLIED SUCCESSFULLY!

Changes Applied:
  ✅ listings.subcategory_id column added
  ✅ professionals.subcategory_ids column added
  ✅ 12 performance indexes created
```

---

## 📋 What This Migration Does

### Database Schema Changes
1. **Adds `subcategory_id` to `listings` table**
   - Stores which specific subcategory a listing belongs to
   - Example: "smartphones", "laptops", "t-shirts"
   - Enables precise wish-marketplace matching

2. **Adds `subcategory_ids` to `professionals` table**
   - Stores array of skills/subcategories a professional offers
   - Example: ["plumbing", "electrical-work"]
   - Enables precise task-professional matching

### Performance Indexes
Creates 12 indexes to speed up:
- Category/subcategory matching queries
- Geographic distance calculations (50km radius)
- Active/approved record filtering

---

## ✅ Verification Queries

After running the migration, you can verify it worked:

### Check New Columns
```sql
-- Verify listings.subcategory_id exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name = 'subcategory_id';

-- Verify professionals.subcategory_ids exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'professionals' 
AND column_name = 'subcategory_ids';
```

### Check Indexes
```sql
-- List all new indexes
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

---

## 🧪 Test the Changes

### Test 1: Create New Listing
1. Go to Marketplace → "Sell" button
2. Create a listing with category + subcategory
3. In Supabase, run:
```sql
SELECT id, title, category_slug, subcategory_id 
FROM listings 
ORDER BY created_at DESC 
LIMIT 1;
```
4. Verify `subcategory_id` is populated

### Test 2: Wish Matching
1. Create a wish for "Mobiles > Smartphones"
2. Create a marketplace listing for "Mobiles > Smartphones"
3. Check notifications table:
```sql
SELECT user_id, title, message, created_at 
FROM notifications 
WHERE type = 'listing'
ORDER BY created_at DESC 
LIMIT 5;
```
4. Wish creator should receive notification

### Test 3: Index Performance
```sql
-- Check if indexes are being used
EXPLAIN ANALYZE
SELECT * FROM listings 
WHERE category_slug = 'mobiles-accessories' 
AND subcategory_id = 'smartphones'
AND is_active = true;
```
Look for "Index Scan using idx_listings_category_slug" in results.

---

## 🔧 Troubleshooting

### Error: "column already exists"
**Solution:** Migration already ran successfully. Safe to ignore.

### Error: "index already exists"
**Solution:** Indexes already created. Safe to ignore.

### Error: "permission denied"
**Solution:** 
1. Make sure you're logged in as project owner
2. Try running each ALTER TABLE separately
3. Contact Supabase support if issue persists

### No success message appears
**Solution:**
1. Check "Results" tab for errors
2. Scroll to bottom of results
3. Success messages appear as NOTICE

---

## 🚨 IMPORTANT NOTES

### Backward Compatibility
- ✅ Old listings without `subcategory_id` will still work
- ✅ Old wishes will match based on category only
- ⚠️ For best results, encourage users to re-post with subcategories

### Data Cleanup (Optional)
If you want to add subcategories to existing listings:
```sql
-- WARNING: This is an example only - customize for your data
UPDATE listings 
SET subcategory_id = 'smartphones'
WHERE category_slug = 'mobiles-accessories'
AND title ILIKE '%iphone%'
AND subcategory_id IS NULL;
```

### Rollback (If Needed)
If you need to undo the migration:
```sql
-- Remove new columns
ALTER TABLE listings DROP COLUMN IF EXISTS subcategory_id;
ALTER TABLE professionals DROP COLUMN IF EXISTS subcategory_ids;

-- Remove indexes
DROP INDEX IF EXISTS idx_listings_category_slug;
DROP INDEX IF EXISTS idx_listings_subcategory;
DROP INDEX IF EXISTS idx_listings_location;
DROP INDEX IF EXISTS idx_wishes_categories;
DROP INDEX IF EXISTS idx_wishes_subcategories;
DROP INDEX IF EXISTS idx_wishes_location;
DROP INDEX IF EXISTS idx_shops_categories;
DROP INDEX IF EXISTS idx_shops_subcategories;
DROP INDEX IF EXISTS idx_shops_location;
DROP INDEX IF EXISTS idx_professionals_subcategories;
DROP INDEX IF EXISTS idx_professionals_location;
DROP INDEX IF EXISTS idx_tasks_category;
DROP INDEX IF EXISTS idx_tasks_subcategory;
DROP INDEX IF EXISTS idx_tasks_location;
```

---

## 📊 Monitoring

After migration, monitor these metrics:

### Database Performance
```sql
-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;
```

### Notification Accuracy
```sql
-- Count notifications sent in last 24 hours
SELECT 
  type,
  COUNT(*) as notification_count
FROM notifications
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY type
ORDER BY notification_count DESC;
```

### Category Distribution
```sql
-- See which subcategories are most popular
SELECT 
  subcategory_id,
  COUNT(*) as listing_count
FROM listings
WHERE is_active = true
AND subcategory_id IS NOT NULL
GROUP BY subcategory_id
ORDER BY listing_count DESC
LIMIT 10;
```

---

## ✅ Success Checklist

- [ ] Ran `/CRITICAL_FIX_MIGRATION.sql` in Supabase
- [ ] Verified success messages appeared
- [ ] Checked `listings.subcategory_id` column exists
- [ ] Checked `professionals.subcategory_ids` column exists
- [ ] Verified 12 indexes were created
- [ ] Tested creating new listing with subcategory
- [ ] Tested wish-marketplace notification matching
- [ ] Monitored database performance
- [ ] Updated documentation (if needed)

---

## 📞 Need Help?

1. Check `/CRITICAL_FIXES_SUMMARY.md` for implementation details
2. Review `/CATEGORY_SYSTEMS_DOCUMENTATION.md` for category system guide
3. Search Supabase docs for SQL migration best practices
4. Contact your database administrator if issues persist

---

**Migration Created:** March 23, 2026
**Estimated Time:** < 5 minutes
**Risk Level:** Low (backward compatible, can be rolled back)
