# 🔧 Database Fix Instructions

## ⚠️ IMPORTANT: Run SQL Files in Correct Order!

### Step 1: Check Current Structure (Optional)
Run this to see what columns exist:
```
/QUICK_COLUMN_CHECK.sql        ← Quick diagnostic (30 sec)
/SAFE_SCHEMA_CHECK.sql         ← Detailed read-only report (1 min)
```
This helps you understand the current database structure.

**Recommended:** Start with `/SAFE_SCHEMA_CHECK.sql` for a comprehensive view.

---

### Step 2: Run the Main Database Fix ⭐ REQUIRED
**File:** `/RUN_THIS_DATABASE_FIX_V2.sql`

**What it does:**
- Adds missing columns to wishes and tasks tables
- Fixes constraints
- Updates RLS policies for soft-auth
- Adds critical fields like `status`, `exact_location`, `latitude`, `longitude`

**How to run:**
1. Go to Supabase Dashboard
2. Click "SQL Editor" in left sidebar
3. Click "New Query"
4. Copy the entire contents of `/RUN_THIS_DATABASE_FIX_V2.sql`
5. Paste into the SQL editor
6. Click "Run" (or press Ctrl+Enter)
7. Wait for ✅ Success message

---

### Step 3: Verify Schema (Optional but Recommended)
**File:** `/SUPABASE_SCHEMA_CHECK_FIXED.sql`

**What it does:**
- Verifies all tables exist
- Checks column structure
- Creates performance indexes
- Validates RLS policies
- Checks data integrity
- Provides summary report

**How to run:**
1. Same process as Step 2
2. Copy `/SUPABASE_SCHEMA_CHECK_FIXED.sql`
3. Paste in SQL Editor
4. Run
5. Review the output for any issues

---

## ❌ Error: "column does not exist"

If you see this error, it means:
1. You haven't run `/RUN_THIS_DATABASE_FIX_V2.sql` yet
2. OR the database structure is different than expected

**Solution:**
1. First, run `/QUICK_COLUMN_CHECK.sql` to see actual columns
2. Then run `/RUN_THIS_DATABASE_FIX_V2.sql` to add missing columns
3. Finally run `/SUPABASE_SCHEMA_CHECK_FIXED.sql` to verify

---

## 📋 What Gets Fixed

### Wishes Table:
- ✅ Adds `status` column (active/fulfilled)
- ✅ Adds `exact_location` column
- ✅ Adds `latitude` and `longitude` columns
- ✅ Adds `urgency` column
- ✅ Removes incorrect foreign key constraints
- ✅ Updates RLS policies for soft-auth

### Tasks Table:
- ✅ Adds `status` column (open/in_progress/completed)
- ✅ Adds `exact_location` column
- ✅ Adds `latitude` and `longitude` columns
- ✅ Adds `time_window` column
- ✅ Removes incorrect foreign key constraints
- ✅ Updates RLS policies for soft-auth

### Performance:
- ✅ Creates indexes on `owner_token` columns
- ✅ Creates indexes on `status` columns
- ✅ Creates indexes on `created_at` columns
- ✅ Creates spatial indexes for lat/long

---

## ✅ After Running Fix

You should be able to:
- ✅ Create wishes without errors
- ✅ Create tasks without errors
- ✅ View "My Wishes" tab in profile
- ✅ View "My Tasks" tab in profile
- ✅ Toggle wish status (active ↔ fulfilled)
- ✅ Toggle task status (open ↔ completed)
- ✅ Edit and delete wishes
- ✅ Edit and delete tasks

---

## 🐛 Troubleshooting

### Issue: "relation does not exist"
**Cause:** Table hasn't been created yet  
**Fix:** Create the table first, then run the fix

### Issue: "column already exists"
**Cause:** Column was already added  
**Fix:** This is fine, the fix script checks before adding

### Issue: "permission denied"
**Cause:** Not enough permissions  
**Fix:** Make sure you're logged in as database owner/admin

### Issue: "syntax error near..."
**Cause:** SQL copied incorrectly  
**Fix:** Copy the entire file content, don't modify it

---

## 📊 Expected Results

After running `/RUN_THIS_DATABASE_FIX_V2.sql`, you should see output like:
```
✅ Wishes table fixed
✅ Tasks table fixed  
✅ Foreign key constraints removed
✅ RLS policies updated
✅ COMPLETE: Database is ready!
```

After running `/SUPABASE_SCHEMA_CHECK_FIXED.sql`, you should see:
```
✅ All tables verified
✅ Performance indexes created
✅ Ready for Production
```

---

## 🚀 Quick Start

**Just want to fix it fast?**

1. Run `/RUN_THIS_DATABASE_FIX_V2.sql` in Supabase SQL Editor
2. Wait for success
3. Test your app
4. Done!

**Want to be thorough?**

1. Run `/QUICK_COLUMN_CHECK.sql` - See current structure
2. Run `/RUN_THIS_DATABASE_FIX_V2.sql` - Fix everything
3. Run `/SUPABASE_SCHEMA_CHECK_FIXED.sql` - Verify and optimize
4. Test your app
5. Done!

---

## 📝 Notes

- All SQL scripts are safe to run multiple times
- They check for existing columns/indexes before creating
- No data will be lost
- Existing data remains untouched
- Only structure is modified

---

**Last Updated:** December 2024  
**For:** OldCycle Hyperlocal Marketplace  
**Version:** 2.0 Database Migration