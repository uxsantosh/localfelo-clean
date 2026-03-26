# 🚀 Database Quick Start Guide

## ❌ Getting Errors? Follow These 3 Steps:

---

## 1️⃣ **See What You Have** (30 seconds)

**Run this in Supabase SQL Editor:**
```sql
/SAFE_SCHEMA_CHECK.sql
```

**What it shows:**
- ✅ All your tables and columns
- ✅ What's missing
- ✅ Current indexes
- ✅ Record counts
- 🔒 READ-ONLY (makes no changes)

---

## 2️⃣ **Fix Missing Columns** (30 seconds) ⭐ CRITICAL

**Run this in Supabase SQL Editor:**
```sql
/RUN_THIS_DATABASE_FIX_V2.sql
```

**What it fixes:**
- ➕ Adds `status` to wishes/tasks
- ➕ Adds `exact_location` to wishes/tasks
- ➕ Adds `latitude` and `longitude`
- ➕ Adds `urgency` to wishes
- ➕ Adds `time_window` to tasks
- 🔐 Updates RLS policies for soft-auth
- 🗑️ Removes bad constraints

**Success message:**
```
✅ Wishes table fixed
✅ Tasks table fixed
✅ COMPLETE: Database is ready!
```

---

## 3️⃣ **Add Performance Indexes** (20 seconds)

**Run this in Supabase SQL Editor:**
```sql
/SUPABASE_SCHEMA_CHECK_FIXED.sql
```

**What it adds:**
- 🚀 Speed indexes on `owner_token`
- 🚀 Speed indexes on `status`
- 🚀 Speed indexes on `created_at`
- 🚀 Spatial indexes for location search
- ✅ Validates everything is correct

---

## 📁 All Available SQL Files

| File | Purpose | Time | Changes DB? |
|------|---------|------|-------------|
| `/SAFE_SCHEMA_CHECK.sql` | Detailed diagnostic report | 1 min | ❌ No |
| `/QUICK_COLUMN_CHECK.sql` | Fast column check | 10 sec | ❌ No |
| `/RUN_THIS_DATABASE_FIX_V2.sql` | **ADD MISSING COLUMNS** | 30 sec | ✅ **YES** |
| `/SUPABASE_SCHEMA_CHECK_FIXED.sql` | Verify + add indexes | 20 sec | ✅ Yes (indexes only) |

---

## 🎯 Common Error Messages & Fixes

### Error: `column "status" does not exist`
**Fix:** Run `/RUN_THIS_DATABASE_FIX_V2.sql`

### Error: `column "exact_location" does not exist`
**Fix:** Run `/RUN_THIS_DATABASE_FIX_V2.sql`

### Error: `column "listing_owner_id" does not exist`
**Fix:** Run `/SAFE_SCHEMA_CHECK.sql` to see actual column names
- Your conversations table might use `seller_id` instead
- The fixed schema check handles this automatically

### Error: `relation "wishes" does not exist`
**Fix:** You need to create the wishes table first
- Check if you have the table creation SQL
- Contact support if table is missing

---

## ✅ How to Know It Worked

After running the fix, try these in your app:

### Can Create Wishes?
1. Go to Profile → My Wishes tab
2. Click "Create Wish"
3. Fill out form
4. Submit
5. ✅ Should work without errors

### Can Create Tasks?
1. Go to Profile → My Tasks tab
2. Click "Create Task"
3. Fill out form
4. Submit
5. ✅ Should work without errors

### Can Toggle Status?
1. View your wish/task
2. Click the status button
3. ✅ Should toggle: active ↔ fulfilled (wishes) or open ↔ completed (tasks)

---

## 🔒 Safety Notes

- ✅ All scripts are safe to run multiple times
- ✅ Scripts check before adding columns
- ✅ Won't break existing data
- ✅ Won't delete anything
- ✅ Only adds missing structure

---

## 📞 Still Having Issues?

1. Run `/SAFE_SCHEMA_CHECK.sql` 
2. Copy the full output
3. Share with support
4. We'll tell you exactly what's missing

---

## 🎉 Success Checklist

After running all scripts, you should have:

- [x] All tables exist (listings, wishes, tasks, etc.)
- [x] All required columns exist
- [x] Soft-auth tokens (owner_token, client_token) on all tables
- [x] Status columns on wishes and tasks
- [x] Location columns (exact_location, lat, lng)
- [x] Performance indexes created
- [x] RLS policies configured
- [x] No foreign key constraint errors
- [x] App works without database errors

---

**Ready to test? Run Step 2 above! 🚀**

Last Updated: December 2024  
OldCycle Hyperlocal Marketplace v2.0
