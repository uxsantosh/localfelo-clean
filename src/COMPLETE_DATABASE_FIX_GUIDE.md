# 🔧 Complete Database Fix Guide - Wishes & Tasks

## 🐛 Problems Encountered

### Error 1: Urgency Constraint
```
new row for relation "wishes" violates check constraint "wishes_urgency_check"
```

### Error 2: Foreign Key Constraint
```
insert or update on table "wishes" violates foreign key constraint "wishes_owner_token_fkey"
```

### Error 3: Policy Blocking Column Alteration
```
cannot alter type of a column used in a policy definition
policy Users can update own wishes on table wishes depends on column "owner_token"
```

## 🎯 Root Cause

The database schema has **incorrect configurations**:

1. **Missing/incorrect urgency constraint** - The `urgency` column check constraint is missing or misconfigured
2. **Incorrect foreign key on owner_token** - The `owner_token` field has a foreign key constraint when it should be a simple TEXT field for soft-auth
3. **Similar issues may exist on tasks table**

## ✅ Complete Solution

### 🚀 Quick Fix (Recommended)

Run **ONE** comprehensive SQL file that fixes everything:

1. Go to **Supabase Dashboard → SQL Editor**
2. Copy and paste the contents of **`RUN_THIS_DATABASE_FIX_V2.sql`** ⭐ (USE V2!)
3. Click **Run**

That's it! Both tables will be fixed in one go!

**Alternative (Individual fixes):**
- Run `FIX_WISHES_TABLE_COMPLETE.sql` first
- Then run `FIX_TASKS_TABLE_COMPLETE.sql`

### 📋 What Gets Fixed

#### For Wishes Table:
- ✅ Removes incorrect foreign key constraint on `owner_token`
- ✅ Removes incorrect foreign key constraint on `client_token`
- ✅ Removes incorrect foreign key constraint on `user_id`
- ✅ Sets `owner_token` and `client_token` as TEXT fields
- ✅ Makes `user_id` nullable (for soft-auth)
- ✅ Fixes urgency constraint to: `'asap' | 'today' | 'flexible'`
- ✅ Adds missing columns: `exact_location`, `latitude`, `longitude`
- ✅ Verifies all changes

#### For Tasks Table:
- ✅ Removes incorrect foreign key constraint on `owner_token`
- ✅ Removes incorrect foreign key constraint on `client_token`
- ✅ Removes incorrect foreign key constraint on `user_id`
- ✅ Sets `owner_token` and `client_token` as TEXT fields
- ✅ Makes `user_id` nullable (for soft-auth)
- ✅ Fixes time_window constraint to: `'asap' | 'today' | 'tomorrow'`
- ✅ Adds missing columns: `exact_location`, `latitude`, `longitude`, `status`
- ✅ Verifies all changes

## 🔍 Understanding Soft-Auth

**OldCycle uses a "soft-auth" system:**

```
┌─────────────────────────────────────────────────┐
│ Soft-Auth System                                │
├─────────────────────────────────────────────────┤
│ owner_token  → TEXT (NOT a foreign key)         │
│               Used to verify ownership          │
│                                                  │
│ client_token → TEXT (NOT a foreign key)         │
│               Used to identify the client       │
│                                                  │
│ user_id      → UUID (nullable)                  │
│               Can be NULL for non-registered    │
│               users                             │
└─────────────────────────────────────────────────┘
```

**These should NEVER have foreign key constraints!**

## 📁 Files Created

1. **`FIX_WISHES_TABLE_COMPLETE.sql`** ⭐ - Complete fix for wishes table
2. **`FIX_TASKS_TABLE_COMPLETE.sql`** ⭐ - Complete fix for tasks table
3. **`FIX_WISHES_URGENCY_CONSTRAINT.sql`** - Urgency-only fix (partial)
4. **`FIX_WISHES_OWNER_TOKEN_FK.sql`** - Owner token FK fix (partial)

**Recommendation:** Use the **COMPLETE** SQL files (1 & 2) as they fix all issues at once.

## 📁 Code Files Updated

1. ✅ **`/types/index.ts`**
   - Added `exactLocation?: string;` to `CreateWishData`
   - Added `exactLocation?: string;` to `Wish`

2. ✅ **`/screens/CreateWishScreen.tsx`**
   - Added inline location selector
   - Auto-fills from global location
   - Manual override capability

3. ✅ **`/screens/CreateTaskScreen.tsx`**
   - Added inline location selector
   - Auto-fills from global location
   - Manual override capability

## 🧪 Testing Instructions

### Test Wish Creation:

1. **Login** to OldCycle
2. Go to **"Wishes Nearby"** tab
3. Click **"+"** button (Post Wish)
4. Fill in the form:
   - **What you're looking for:** "Looking for a used laptop under 10k"
   - **Urgency:** Select "Flexible" or "Today" or "ASAP"
   - **Budget:** 10000
   - **Location:** Should auto-fill, or select manually
5. Click **"Post Wish & Start Chat"**

**Expected Result:** ✅ Wish created successfully!

### Test Task Creation:

1. Go to **"Tasks Nearby"** tab
2. Click **"+"** button (Post Task)
3. Fill in the form:
   - **What service do you need?** "Need a plumber to fix leaking tap"
   - **Price:** 500
   - **When:** Select "Today"
   - **Location:** Should auto-fill, or select manually
4. Click **"Post Task & Start Chat"**

**Expected Result:** ✅ Task created successfully!

## 🔍 Verification Queries

After running the fixes, verify in Supabase SQL Editor:

### Check Wishes Table:
```sql
-- Check column types
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'wishes'
ORDER BY ordinal_position;

-- Check constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'wishes'::regclass;
```

### Check Tasks Table:
```sql
-- Check column types
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- Check constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'tasks'::regclass;
```

## ⚠️ Important Notes

1. **Run both SQL fixes** - Wishes AND Tasks tables need fixing
2. **No data loss** - The SQL scripts are safe and won't delete data
3. **Idempotent** - You can run the scripts multiple times safely
4. **Verification included** - Each script shows verification queries

## 🎉 After Running

Once you've run both SQL fixes:

1. ✅ Wish creation will work
2. ✅ Task creation will work
3. ✅ Location auto-fill will work
4. ✅ No more constraint errors
5. ✅ Soft-auth system will function properly

## 🆘 If Issues Persist

If you still see errors after running the SQL:

1. **Check the verification output** at the end of each SQL script
2. **Look for any error messages** in the Supabase SQL Editor
3. **Share the error** - Copy the exact error message
4. **Check foreign keys** - Run the verification query to see if any incorrect FKs remain

---

**Next Step:** 🎯 **Run the SQL fixes in Supabase!**