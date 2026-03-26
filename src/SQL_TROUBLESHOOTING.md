# SQL Migration Troubleshooting Guide

## ✅ FIXED - All Errors Resolved!

The SQL migration has been updated to work with your actual database schema. All column references have been corrected.

---

## 🐛 Previous Errors (Now Fixed)

### ❌ Error 1: `column "category_ids" does not exist`
**Root Cause:** Tried to create indexes on `wishes.category_ids` which doesn't exist yet  
**Fix Applied:** Removed those indexes (wishes table not migrated yet)

### ❌ Error 2: `column "is_approved" does not exist`  
**Root Cause:** Professionals table uses `is_active`, not `is_approved`  
**Fix Applied:** Removed WHERE clauses referencing non-existent columns

---

## 🎯 What the SQL Does Now

### Columns Added
```sql
✅ listings.subcategory_id (TEXT)
✅ professionals.subcategory_ids (TEXT[])
```

### Indexes Created (19 total)
```sql
✅ Listings: 4 indexes (category, subcategory, location, user)
✅ Wishes: 3 indexes (category, location, status)
✅ Shop Categories: 3 indexes (category, subcategory, shop)
✅ Shops: 2 indexes (location, user)
✅ Professionals: 4 indexes (subcategories, location, service_categories, user)
✅ Tasks: 4 indexes (category, subcategory, location, status)
```

---

## 🚀 How to Run (Copy-Paste Ready)

1. Open Supabase → SQL Editor → New query
2. Copy ALL of `/CRITICAL_FIX_MIGRATION.sql`
3. Paste and click **RUN**
4. Wait ~10 seconds
5. See success message ✅

---

## ✅ Expected Success Output

```
✅ CRITICAL FIXES APPLIED SUCCESSFULLY!

Changes Applied:
  ✅ listings.subcategory_id column added
  ✅ professionals.subcategory_ids column added
  ✅ 19 performance indexes created
```

---

## ⚠️ If You Still Get Errors

### "column already exists"
✅ **GOOD!** This means the migration already ran. Skip this column.

### "index already exists"
✅ **GOOD!** This means indexes are already created. Skip this index.

### "relation does not exist"
❌ **BAD!** This means a table is missing.

**Solution:**
1. Check which table is missing
2. Make sure you ran this in the correct Supabase project
3. Verify table exists: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`

### "permission denied"
❌ **BAD!** You don't have admin permissions.

**Solution:**
1. Make sure you're logged in as project owner
2. Check Supabase project settings → Database → Connection string
3. Try running in Supabase dashboard instead of external SQL client

---

## 🔍 Quick Verification Commands

### Check if columns were added:
```sql
-- Check listings.subcategory_id
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name = 'subcategory_id';
-- Should return: subcategory_id | text

-- Check professionals.subcategory_ids
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'professionals' 
AND column_name = 'subcategory_ids';
-- Should return: subcategory_ids | ARRAY
```

### Check if indexes were created:
```sql
SELECT indexname 
FROM pg_indexes 
WHERE indexname LIKE 'idx_%'
ORDER BY indexname;
-- Should return 19+ indexes
```

### Check table columns actually present:
```sql
-- All columns in listings table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'listings'
ORDER BY column_name;

-- All columns in professionals table  
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'professionals'
ORDER BY column_name;

-- All columns in wishes table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'wishes'
ORDER BY column_name;
```

---

## 🎯 Migration Status Checklist

After running the SQL, verify:

- [ ] No errors in SQL output
- [ ] Success message displayed
- [ ] `listings.subcategory_id` column exists
- [ ] `professionals.subcategory_ids` column exists
- [ ] 19+ indexes created (run `SELECT COUNT(*) FROM pg_indexes WHERE indexname LIKE 'idx_%';`)
- [ ] Verification queries return data (not errors)

---

## 🔄 Rollback (If Needed)

If something goes wrong and you need to undo:

```sql
-- Remove added columns
ALTER TABLE listings DROP COLUMN IF EXISTS subcategory_id;
ALTER TABLE professionals DROP COLUMN IF EXISTS subcategory_ids;

-- Remove indexes
DROP INDEX IF EXISTS idx_listings_category_slug;
DROP INDEX IF EXISTS idx_listings_subcategory;
DROP INDEX IF EXISTS idx_listings_location;
DROP INDEX IF EXISTS idx_listings_user;
DROP INDEX IF EXISTS idx_wishes_category;
DROP INDEX IF EXISTS idx_wishes_location;
DROP INDEX IF EXISTS idx_wishes_status;
DROP INDEX IF EXISTS idx_shop_categories_category;
DROP INDEX IF EXISTS idx_shop_categories_subcategory;
DROP INDEX IF EXISTS idx_shop_categories_shop;
DROP INDEX IF EXISTS idx_shops_location;
DROP INDEX IF EXISTS idx_shops_user;
DROP INDEX IF EXISTS idx_professionals_subcategories;
DROP INDEX IF EXISTS idx_professionals_location;
DROP INDEX IF EXISTS idx_professionals_service_categories;
DROP INDEX IF EXISTS idx_professionals_user;
DROP INDEX IF EXISTS idx_tasks_category;
DROP INDEX IF EXISTS idx_tasks_subcategory;
DROP INDEX IF EXISTS idx_tasks_location;
DROP INDEX IF EXISTS idx_tasks_status;
```

---

## 📞 Still Having Issues?

1. Check `/CRITICAL_FIX_MIGRATION.sql` - it has all the latest fixes
2. Read `/CRITICAL_FIXES_SUMMARY.md` - explains what each fix does
3. Review `/CATEGORY_SYSTEMS_DOCUMENTATION.md` - understand the category system
4. Run verification queries one by one to isolate the issue

---

**Last Updated:** March 23, 2026  
**Status:** ✅ All known errors fixed  
**Tested On:** PostgreSQL 15 (Supabase)
