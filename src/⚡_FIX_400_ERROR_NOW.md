# ⚡ Fix 400 Bad Request Error - Avatar Upload

## Error Found in Logs (Line 98)
```
POST https://...supabase.co/storage/v1/object/user-uploads/avatars/...jpeg 400 (Bad Request)
```

## Problem Identified
**This is NOT an RLS issue!** (That would be 403 Forbidden)

The **400 Bad Request** error means:
❌ The storage bucket `user-uploads` **does not exist**

OR

❌ The bucket exists but is misconfigured

## Quick Fix

### Step 1: Check if bucket exists
```sql
-- Run in Supabase SQL Editor
CHECK_STORAGE_BUCKET_NOW.sql
```

### Step 2: Create bucket and fix RLS
```sql
-- Run in Supabase SQL Editor
FIX_400_STORAGE_ERROR.sql
```

### Step 3: Test in app
1. Hard refresh browser (Ctrl+Shift+R)
2. Go to Profile → Edit Profile
3. Upload avatar
4. Should work now! ✅

## Understanding the Error

### 400 vs 403 - What's the Difference?

| Error | Meaning | Cause |
|-------|---------|-------|
| **400 Bad Request** | Invalid request | Bucket doesn't exist or request malformed |
| **403 Forbidden** | Permission denied | Bucket exists but RLS blocks access |

Your error is **400**, not 403, so it's a bucket issue, not RLS!

## What the Fix Does

1. ✅ Creates `user-uploads` bucket if missing
2. ✅ Sets bucket to public (for read access)
3. ✅ Sets file size limit to 10MB
4. ✅ Allows image types: jpeg, jpg, png, webp, gif
5. ✅ Creates 4 RLS policies (read, upload, update, delete)

## Manual Fix (Alternative)

If SQL script doesn't work, create bucket manually:

### Via Supabase Dashboard:
1. Go to Dashboard → Storage
2. Click "New bucket"
3. Name: `user-uploads`
4. **Check "Public bucket"** ✓
5. Click "Create bucket"

### Then run RLS policies:
```sql
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-uploads');

-- Authenticated upload
CREATE POLICY "Authenticated upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'user-uploads');

-- Authenticated update
CREATE POLICY "Authenticated update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'user-uploads');

-- Authenticated delete
CREATE POLICY "Authenticated delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'user-uploads');
```

## Verification

After fix, check:

### 1. Bucket exists
```sql
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'user-uploads';
```

Should return:
```
id: user-uploads
name: user-uploads
public: true
```

### 2. RLS policies exist
```sql
SELECT policyname 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';
```

Should return 4 policies

### 3. Test in app
Upload avatar → Should see success! ✅

## Expected Results

### Before Fix
```
❌ 400 Bad Request
❌ Avatar not uploaded
✅ Falls back to base64
✅ Profile shows "updated" (but with base64)
```

### After Fix
```
✅ 200 OK
✅ Avatar uploaded to storage
✅ Profile updated with storage URL
✅ User sees success message
```

## Troubleshooting

### Still getting 400 after fix?

Check these:

**1. Bucket definitely exists?**
```sql
SELECT * FROM storage.buckets WHERE id = 'user-uploads';
```
Should return a row.

**2. Bucket is public?**
```sql
SELECT id, public FROM storage.buckets WHERE id = 'user-uploads';
```
`public` should be `true`.

**3. File too large?**
- Check file size in browser
- Should be < 10MB
- App compresses to ~800KB, so this shouldn't be an issue

**4. Wrong Supabase URL?**
- Check your `.env` or config
- Make sure SUPABASE_URL is correct

**5. Anon key correct?**
- Check SUPABASE_ANON_KEY
- Make sure it's from the correct project

### Getting different error now?

**403 Forbidden:**
- Good! This means bucket exists
- Now it's an RLS issue
- Run the RLS policy part of the script

**404 Not Found:**
- Bucket doesn't exist
- Create manually via Dashboard

**413 Payload Too Large:**
- File is too big
- Check compression settings in AvatarUploader.tsx

## Why This Happened

The storage bucket was never created during initial setup. The avatar upload system works like this:

1. ✅ App compresses image
2. ✅ App validates content (NSFW check)
3. ✅ App converts to base64
4. ❌ App tries to upload to `user-uploads` bucket
5. ❌ Bucket doesn't exist → 400 error
6. ✅ App catches error and falls back to base64
7. ✅ Profile updates successfully (with base64)

So everything AFTER the storage upload works fine, which is why you see "Profile updated successfully!" but the photo goes to base64 instead of storage.

## Summary

**Error:** 400 Bad Request when uploading avatar

**Cause:** Storage bucket `user-uploads` doesn't exist

**Fix:** Run `FIX_400_STORAGE_ERROR.sql` to create bucket + RLS policies

**Time:** 1 minute

**Result:** Avatars will upload to storage instead of falling back to base64

---

## Quick Action Plan

```bash
# 1. Diagnose (30 seconds)
Run: CHECK_STORAGE_BUCKET_NOW.sql

# 2. Fix (30 seconds)
Run: FIX_400_STORAGE_ERROR.sql

# 3. Test (1 minute)
Profile → Edit Profile → Upload Avatar → Save

# 4. Verify
Check avatar_url in database - should be storage URL now!
```

**Expected result:** Avatar upload works, no more 400 error! ✅
