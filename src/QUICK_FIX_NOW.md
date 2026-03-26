# ⚡ QUICK FIX - Do This Now!

## 🎯 The Problem
You're getting database errors when creating wishes/tasks:
- ❌ `wishes_urgency_check` constraint violation
- ❌ `wishes_owner_token_fkey` foreign key violation
- ❌ `cannot alter type of a column used in a policy definition`

## ✅ The Solution (2 Minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your OldCycle project
3. Click **"SQL Editor"** in the left sidebar

### Step 2: Run the Fix
1. Open the file: **`RUN_THIS_DATABASE_FIX_V2.sql`** ⭐ (USE V2!)
2. Copy ALL the contents
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press Cmd/Ctrl + Enter)

### Step 3: Verify
Look at the output - you should see:
- ✅ Table columns listed
- ✅ Constraints showing correct definitions
- ✅ Policies recreated
- ✅ No error messages

### Step 4: Test
1. Go back to OldCycle app
2. Try creating a wish or task
3. It should work! 🎉

---

## 📋 What Was Fixed in the Code

The following files were already updated:

1. ✅ **`/types/index.ts`** - Added missing `exactLocation` field
2. ✅ **`/screens/CreateWishScreen.tsx`** - Added location selector
3. ✅ **`/screens/CreateTaskScreen.tsx`** - Added location selector

You don't need to do anything with these - they're already fixed!

---

## 🆘 If It Still Doesn't Work

Check the Supabase SQL Editor output for errors. If you see any errors, copy them and let me know.

**Common issues:**
- Foreign key still exists → The SQL should have dropped it
- Permission denied → Make sure you're using the right Supabase project
- Column doesn't exist → The SQL should create it

---

## 📚 Full Documentation

For detailed explanation, see:
- **`COMPLETE_DATABASE_FIX_GUIDE.md`** - Full technical guide
- **`FIX_WISHES_TABLE_COMPLETE.sql`** - Wishes table fix only
- **`FIX_TASKS_TABLE_COMPLETE.sql`** - Tasks table fix only

---

**🚀 Ready? Go to Supabase and run `RUN_THIS_DATABASE_FIX_V2.sql` now!**