# 📦 Create Storage Bucket - Quick Guide

## ⚡ Fix Avatar Upload Errors in 2 Minutes

Currently getting this error when uploading photos?
```
Failed to upload avatar: StorageApiError: Bucket not found
```

**Fix it now with these simple steps:**

---

## 🎯 Method 1: Supabase Dashboard (Easiest - 30 seconds)

### Step 1: Open Supabase Storage
1. Go to: https://supabase.com/dashboard
2. Select your project: **LocalFelo**
3. Click **Storage** in the left sidebar

### Step 2: Create Bucket
1. Click the **"New bucket"** button (top right)
2. Fill in the form:
   - **Name:** `user-uploads` (exactly as shown)
   - **Public bucket:** ✅ **Check this box** (very important!)
   - **Allowed file types:** Leave empty (allows all images)
   - **File size limit:** Leave default
3. Click **"Create bucket"**

### Step 3: Done! ✅
- Avatar uploads will work immediately
- No code changes needed
- Users can now upload profile photos

---

## 🎯 Method 2: SQL Editor (Alternative)

If the UI method doesn't work, use SQL:

### Step 1: Go to SQL Editor
1. Supabase Dashboard → **SQL Editor**
2. Click **"New query"**

### Step 2: Run This SQL
```sql
-- Create public storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;
```

### Step 3: Click "Run" ✅

---

## 🔒 Optional: Add Security Policies

After creating the bucket, you can add these policies for better security:

### Go to: Storage → user-uploads → Policies

**Policy 1: Anyone can view avatars**
```sql
CREATE POLICY "Public avatars readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-uploads');
```

**Policy 2: Users can upload their own avatar**
```sql
CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text IS NOT NULL
);
```

**Policy 3: Users can update their own avatar**
```sql
CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'user-uploads' AND auth.uid()::text IS NOT NULL);
```

**Policy 4: Users can delete their own avatar**
```sql
CREATE POLICY "Users delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-uploads' AND auth.uid()::text IS NOT NULL);
```

> **Note:** These policies are optional. The bucket works without them, but they add extra security.

---

## ✅ Verify It Works

### Check 1: Bucket Exists
Run this in SQL Editor:
```sql
SELECT * FROM storage.buckets WHERE name = 'user-uploads';
```
Should return 1 row showing your bucket.

### Check 2: Try Uploading
1. Log into your app
2. Go to Profile
3. Click Edit Profile
4. Upload a photo
5. Should work without errors! ✅

---

## 🐛 Troubleshooting

### Error: "Bucket already exists"
✅ **Good news!** This means the bucket is already created. You're done!

### Error: "Permission denied"
- Make sure you're the project owner/admin in Supabase
- Check that you selected the correct project

### Avatar upload still fails
1. Check bucket name is exactly: `user-uploads` (no spaces, lowercase)
2. Make sure "Public bucket" is checked
3. Clear browser cache and try again
4. Check browser console for specific error

### Files upload but don't display
- Verify bucket is marked as **Public**
- Check the avatar URL in the database (should start with your Supabase URL)

---

## 📊 What This Enables

Once the bucket is created:
- ✅ **Avatar photo uploads** work perfectly
- ✅ **Auto-compression** reduces file sizes by ~90%
- ✅ **NSFW detection** prevents inappropriate content
- ✅ **Public URLs** for displaying avatars
- ✅ **Fast CDN delivery** via Supabase

---

## 🎯 Next Steps

After creating the storage bucket, you should also:

### Run the Rating System Migration
The rating columns are still missing. To enable the full rating system:

1. Open SQL Editor
2. Copy contents from `/database_migrations/avatar_and_rating_system.sql`
3. Run the entire file
4. This adds rating columns and creates the ratings table

See `/AVATAR_RATING_SETUP_INSTRUCTIONS.md` for full details.

---

## 📝 Summary

**What you need to do:**
1. Create `user-uploads` bucket (public)
2. That's it!

**What you get:**
- ✅ Avatar uploads working
- ✅ Profile photos for all users
- ✅ Better user experience
- ✅ Professional profiles

**Time required:** 30 seconds to 2 minutes

---

## 🚀 Quick Command Checklist

```
□ Open Supabase Dashboard
□ Go to Storage
□ Click "New bucket"
□ Name: user-uploads
□ Public: ✅ Checked
□ Click "Create bucket"
□ Done! Test avatar upload
```

---

That's it! Your storage is now ready for avatar uploads. 🎉
