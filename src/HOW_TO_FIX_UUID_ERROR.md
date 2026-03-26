# 🔧 Fix UUID Error - Step by Step

## ❌ The Problem

You're getting this error:
```
ERROR: invalid input syntax for type uuid: "bangalore-arekere-north"
```

**Root Cause:** The `wishes` and `tasks` tables have `city_id`, `area_id`, and `sub_area_id` columns set as **UUID** type, but the location tables (cities, areas, sub_areas) use **TEXT** slugs as primary keys.

## ✅ The Solution

Run these 2 SQL scripts **in order** in your Supabase SQL Editor:

### Step 1: Fix Column Types
```
Run: /FIX_LOCATION_COLUMNS_TYPE.sql
```

This script will:
1. Check current column types
2. Convert UUID columns to TEXT columns
3. Fix foreign key constraints
4. Verify the fix

### Step 2: Seed the Data
```
Run: /SEED_COMPREHENSIVE_WISHES_TASKS.sql
```

This script will create at least 1 wish and 1 task for every city and area.

## 🎯 Quick Copy-Paste

Just open the Supabase SQL Editor and run these two files in sequence:

1. **FIX_LOCATION_COLUMNS_TYPE.sql** - Fixes the column type mismatch
2. **SEED_COMPREHENSIVE_WISHES_TASKS.sql** - Populates all the data

## ✨ What Happens

After running both scripts:
- ✅ All location columns will be TEXT type (matching the slug-based location system)
- ✅ Every city will have sample wishes
- ✅ Every area will have sample tasks
- ✅ Your entire platform will look populated
- ✅ No more UUID errors!

## 📊 Expected Output

The fix script will show you:
- Which columns were converted (if any)
- Verification that all columns are now TEXT
- Success message

The seed script will show you:
- How many wishes were created
- How many tasks were created
- Distribution by city
- Sample data

Done! 🎉
