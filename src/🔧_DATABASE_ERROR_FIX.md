# 🔧 Database Error Fix - "skills column does not exist"

## The Error

```
ERROR: 42703: column "skills" does not exist
LINE 35: (skills IS NULL OR skills = '[]' OR array_length(skills, 1) = 0)
```

## Root Cause

The `helper_preferences` table doesn't have a `skills` column. The original migration assumed it existed, but it doesn't in your actual database.

---

## ✅ FIXED Migration

**Use this file instead:** `/migrations/add_helper_onboarding_tracking_FIXED.sql`

### What It Does

1. **Creates missing columns:**
   - `selected_categories` (TEXT[]) - stores category slugs (replaces `skills`)
   - `onboarding_completed` (BOOLEAN)
   - `onboarding_reminder_count` (INTEGER)
   - `onboarding_skipped_at` (TIMESTAMP)
   - `notify_urgent_tasks` (BOOLEAN)
   - `show_uncategorized_tasks` (BOOLEAN)
   - `show_all_tasks` (BOOLEAN)
   - `min_confidence_threshold` (INTEGER)
   - `max_distance` (INTEGER)
   - `min_budget` (INTEGER)

2. **Handles existing data:**
   - Sets smart defaults for existing helpers
   - Marks incomplete profiles for onboarding
   - Enables `show_all_tasks` so helpers don't see empty screen

3. **Creates helper functions:**
   - `needs_helper_onboarding(user_id)` - Check if user needs onboarding
   - `get_helper_onboarding_progress(user_id)` - Get completion percentage

4. **Sets up RLS policies:**
   - Users can only view/edit their own preferences

---

## 🚀 How to Fix

### Step 1: Check Current Schema (Optional)

```sql
-- Run this to see what columns actually exist
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'helper_preferences'
ORDER BY ordinal_position;
```

### Step 2: Run the FIXED Migration

```sql
-- Copy and paste ALL of this file in Supabase SQL Editor:
-- /migrations/add_helper_onboarding_tracking_FIXED.sql

-- Click "Run"
```

### Step 3: Verify It Worked

```sql
-- Check new columns exist
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'helper_preferences'
  AND column_name IN (
    'selected_categories',
    'onboarding_completed',
    'show_all_tasks',
    'max_distance',
    'min_budget'
  );

-- Should return 5 rows ✅

-- Check functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name IN (
  'needs_helper_onboarding',
  'get_helper_onboarding_progress'
);

-- Should return 2 rows ✅

-- Test the function
SELECT needs_helper_onboarding('your-user-id-here');
-- Should return true or false
```

### Step 4: Test Onboarding Flow

```sql
-- Insert a test helper preference
INSERT INTO helper_preferences (user_id, selected_categories, onboarding_completed)
VALUES ('your-user-id-here', ARRAY['delivery-pickup', 'tech-help'], true)
ON CONFLICT (user_id) DO UPDATE
SET selected_categories = ARRAY['delivery-pickup', 'tech-help'],
    onboarding_completed = true;

-- Check if onboarding needed
SELECT needs_helper_onboarding('your-user-id-here');
-- Should return false (onboarding complete) ✅

-- Check progress
SELECT * FROM get_helper_onboarding_progress('your-user-id-here');
-- Should show progress percentage
```

---

## 📝 Summary of Changes

### Old Migration (BROKEN)
```sql
-- Assumed 'skills' column existed
WHERE skills IS NULL OR skills = '[]'  ❌
```

### New Migration (FIXED)
```sql
-- Creates 'selected_categories' column first
ALTER TABLE helper_preferences 
ADD COLUMN IF NOT EXISTS selected_categories TEXT[] DEFAULT '{}';

-- Then uses it safely
WHERE selected_categories IS NULL OR selected_categories = '{}'  ✅
```

---

## 🎯 What Happens Next

After running the fixed migration:

1. **New helpers:**
   - First time enabling helper mode → forced onboarding
   - Must select at least 1 category
   - Stored in `selected_categories` column

2. **Existing helpers with no categories:**
   - `show_all_tasks` = true (see everything)
   - `onboarding_completed` = false (show prompts)
   - Never see empty screen

3. **Existing helpers with categories:**
   - No change (continue as normal)
   - No onboarding prompt

---

## 🔍 Debugging

### If migration still fails:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'helper_preferences'
);
-- Should return true

-- If false, create table first:
CREATE TABLE helper_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### If function creation fails:

```sql
-- Check if plpgsql language exists
SELECT EXISTS (
  SELECT FROM pg_language WHERE lanname = 'plpgsql'
);
-- Should return true

-- If false (rare):
CREATE EXTENSION IF NOT EXISTS plpgsql;
```

---

## ✅ Files Updated

1. **`/migrations/add_helper_onboarding_tracking_FIXED.sql`** ✅
   - Complete, safe migration
   - Creates all columns
   - Handles existing data
   - Creates helper functions

2. **`/screens/HelperOnboardingScreen.tsx`** ✅
   - Changed `skills` → `selected_categories`
   - Now saves to correct column

3. **`/CHECK_HELPER_PREFERENCES_SCHEMA.sql`** ✅
   - Quick query to check current schema

---

## 🚨 Important Notes

- **DO NOT** run the old migration (`add_helper_onboarding_tracking.sql`)
- **USE** the fixed migration (`add_helper_onboarding_tracking_FIXED.sql`)
- The fixed migration is **idempotent** (safe to run multiple times)
- All `ADD COLUMN IF NOT EXISTS` statements won't error if column exists

---

## ⏱️ Time to Fix

- Run fixed migration: **2 minutes**
- Verify with test queries: **3 minutes**
- Test onboarding flow: **5 minutes**

**Total: ~10 minutes** 🚀

---

## 🆘 Still Having Issues?

1. **Share the error message** - Exact text helps diagnose
2. **Run schema check** - `/CHECK_HELPER_PREFERENCES_SCHEMA.sql`
3. **Check Supabase logs** - Database → Logs section
4. **Try manual column creation:**

```sql
-- Minimal fix to just add the column
ALTER TABLE helper_preferences 
ADD COLUMN IF NOT EXISTS selected_categories TEXT[] DEFAULT '{}';

-- Then try the full migration again
```

---

The error is fixed! Run the FIXED migration and you're good to go. 🎉
