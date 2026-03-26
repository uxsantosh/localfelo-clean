# 🔧 Professionals Module - Complete Fix Guide

## 📋 Summary

You're experiencing errors in the Professionals module because:
1. **Database tables don't exist** → 406 errors when fetching category images
2. **RLS policies incompatible** → 42501 error when creating professional profiles

This guide provides everything you need to fix both issues in under 3 minutes.

---

## 🚨 Current Errors

### Error 1: 406 Not Acceptable
```
Failed to load resource: the server responded with a status of 406
professional_categories_images?select=image_url&category_id=eq.cooking
```

### Error 2: 42501 RLS Policy Violation
```json
{
  "code": "42501",
  "message": "new row violates row-level security policy for table \"professionals\""
}
```

---

## ✅ Complete Fix (3 Steps)

### Step 1️⃣: Run Database Migration
**File:** `/PROFESSIONALS_MODULE_SUPABASE_MIGRATION.sql`

This creates:
- ✅ 4 database tables (professionals, professional_services, professional_images, professional_categories_images)
- ✅ Indexes for faster queries
- ✅ Initial RLS policies
- ✅ Storage bucket for images
- ✅ Triggers for auto-updating timestamps

**How to run:**
1. Go to: https://supabase.com/dashboard/project/drofnrntrbedtjtpseve/sql
2. Click **"New Query"**
3. Copy ALL content from `/PROFESSIONALS_MODULE_SUPABASE_MIGRATION.sql`
4. Paste and click **"Run"**
5. Wait for success message

---

### Step 2️⃣: Fix RLS Policies
**File:** `/PROFESSIONALS_RLS_FIX.sql`

This fixes:
- ✅ Creates `get_user_id_from_token()` function
- ✅ Updates all RLS policies to work with LocalFelo's x-client-token authentication
- ✅ Replaces `auth.uid()` checks with custom token validation

**How to run:**
1. In Supabase SQL Editor, click **"New Query"** again
2. Copy ALL content from `/PROFESSIONALS_RLS_FIX.sql`
3. Paste and click **"Run"**
4. Wait for success message

---

### Step 3️⃣: Verify Everything Works
**File:** `/VERIFY_MIGRATION.sql` (Optional)

This checks:
- ✅ All 4 tables exist
- ✅ Helper function created
- ✅ RLS policies configured
- ✅ Storage bucket exists
- ✅ Indexes created
- ✅ Authentication function works

**How to run:**
1. In Supabase SQL Editor, click **"New Query"** again
2. Copy ALL content from `/VERIFY_MIGRATION.sql`
3. Paste and click **"Run"**
4. Check all results show ✅ green checkmarks

---

## 📁 File Guide

| File | Purpose | Required? |
|------|---------|-----------|
| `/QUICK_FIX_GUIDE.md` | Quick 3-step guide | 📖 START HERE |
| `/PROFESSIONALS_MODULE_SUPABASE_MIGRATION.sql` | Creates database tables | ✅ REQUIRED |
| `/PROFESSIONALS_RLS_FIX.sql` | Fixes authentication | ✅ REQUIRED |
| `/VERIFY_MIGRATION.sql` | Verification script | ⚡ RECOMMENDED |
| `/SUPABASE_SETUP_INSTRUCTIONS.md` | Detailed setup guide | 📖 Reference |
| `/ERROR_FIX_EXPLANATION.md` | Technical explanation | 📖 Reference |
| `/README_PROFESSIONALS_FIX.md` | This file | 📖 Overview |

---

## 🎯 What Gets Fixed

### Before Fix:
- ❌ 406 errors when loading categories
- ❌ Cannot register as professional (42501 error)
- ❌ RLS policies block all database operations
- ❌ Professional features completely broken

### After Fix:
- ✅ Category images load properly
- ✅ Can register as professional
- ✅ RLS policies work with LocalFelo auth
- ✅ All Professionals features functional:
  - Browse professionals by category
  - View professional profiles
  - Register as professional
  - Upload profile & gallery images
  - Contact professionals via WhatsApp/Chat
  - Location-based filtering

---

## 🔍 Technical Details

### Why Auth Fix is Needed

**LocalFelo Architecture:**
- Uses **custom authentication** with `x-client-token` in HTTP headers
- User data stored in localStorage/Capacitor Preferences
- Does NOT use Supabase Auth sessions
- No `auth.uid()` available

**Standard Supabase:**
- Uses Supabase Auth (email/password, OAuth)
- RLS policies check `auth.uid()` for user identification
- Session managed by Supabase Auth client

**The Bridge:**
Our `get_user_id_from_token()` function:
1. Extracts `x-client-token` from HTTP request headers
2. Looks up corresponding `user_id` in `profiles` table
3. Returns `user_id` for RLS policy validation
4. Works seamlessly with LocalFelo's auth system

---

## 🛠 Troubleshooting

### Issue: Still getting 42501 error after running SQL

**Check:**
1. Both SQL files were run successfully
2. Function exists: `SELECT * FROM pg_proc WHERE proname = 'get_user_id_from_token';`
3. You're logged into LocalFelo
4. Browser DevTools → Network → Request Headers shows `x-client-token`

**Fix:**
- Run `/VERIFY_MIGRATION.sql` to diagnose
- Check Supabase Dashboard → Logs → Postgres Logs

---

### Issue: Images not uploading

**Check:**
1. Storage bucket `professional-images` exists
2. Bucket is set to PUBLIC
3. Storage policies applied

**Fix:**
1. Go to Supabase Dashboard → Storage
2. Create bucket: `professional-images`
3. Make it PUBLIC
4. Or run bucket creation SQL from migration file

---

### Issue: Category images still showing 406

**Check:**
1. Table `professional_categories_images` exists
2. Table has RLS policy allowing SELECT for everyone

**Fix:**
- Run `/PROFESSIONALS_MODULE_SUPABASE_MIGRATION.sql` again
- Verify with: `SELECT * FROM professional_categories_images LIMIT 1;`

---

## ✨ Features After Fix

### For Users:
- 🔍 Browse professionals by service category
- 📍 Filter by location (city, area)
- 👤 View detailed professional profiles
- 💬 Contact via WhatsApp or in-app chat
- 🖼️ See profile images and work gallery
- 📊 View services and pricing

### For Professionals:
- ✍️ Register professional profile
- 🏢 Add business/personal info
- 📸 Upload profile image (optional)
- 🖼️ Add gallery images (up to 5)
- 💼 List services and prices
- 📍 Set service location
- ✏️ Edit profile later (future feature)

---

## 📊 Database Schema Created

### `professionals` table
Stores professional profiles (name, title, category, location, etc.)

### `professional_services` table
Stores services offered by each professional

### `professional_images` table
Stores gallery images for professionals

### `professional_categories_images` table
Stores category icons/images

---

## 🎉 Success Indicators

After running both SQL files, you should see:
- ✅ No more 406 errors in browser console
- ✅ Category images load properly
- ✅ Can register as professional without errors
- ✅ Professional profile created successfully
- ✅ Can view professionals list
- ✅ Can view professional detail pages

---

## 📞 Need Help?

1. **Run verification:** `/VERIFY_MIGRATION.sql`
2. **Check logs:** Supabase Dashboard → Logs → Postgres Logs
3. **Review error details:** `/ERROR_FIX_EXPLANATION.md`
4. **Technical docs:** `/SUPABASE_SETUP_INSTRUCTIONS.md`

---

## 🎊 You're All Set!

The Professionals module is now fully functional and ready to use. Users can browse, register, and connect with local service professionals in your hyperlocal marketplace.

**Happy coding! 🚀**

---

**Last Updated:** Current implementation  
**Compatibility:** LocalFelo custom auth system  
**Database:** Supabase PostgreSQL  
**Time to Fix:** ~3 minutes  
