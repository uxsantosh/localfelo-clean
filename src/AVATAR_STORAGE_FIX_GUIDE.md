# Avatar Storage Fix Guide

## Problem
Profile photos are showing "profile updated successfully" but the actual photo is not being saved to Supabase Storage. The issue is that **RLS (Row Level Security) policies are blocking storage uploads**, causing the app to fall back to base64 storage in the database.

## Why This Happens
1. The app tries to upload the avatar to Supabase Storage (`user-uploads` bucket)
2. RLS policies on `storage.objects` block the upload (403 Forbidden)
3. The app catches this error and falls back to saving base64 data directly in the `profiles.avatar_url` column
4. The profile update succeeds (you see "profile updated successfully")
5. But the avatar is stored as base64 instead of a proper storage URL

## Current Implementation (Silent Fallback)
```typescript
// In EditProfileModal.tsx lines 52-61
if (avatarBase64 && avatarBase64 !== currentAvatar) {
  try {
    avatarUrl = await uploadAvatar(user.id, avatarBase64);
  } catch (uploadError: any) {
    // Storage upload failed - silently fall back to base64
    // (This is expected if RLS policies aren't set up yet)
    avatarUrl = avatarBase64;
  }
}
```

## Solution

### Option 1: Quick Fix (Recommended)
Run the complete fix script that creates the bucket and sets up RLS policies:

```sql
-- Run this in Supabase SQL Editor
-- File: FIX_AVATAR_STORAGE_COMPLETE.sql
```

This script will:
1. ✅ Create the `user-uploads` bucket if it doesn't exist
2. ✅ Set it to public (for read access)
3. ✅ Remove any conflicting RLS policies
4. ✅ Create new simplified RLS policies that allow authenticated users to upload/update/delete
5. ✅ Verify the profiles table has correct UPDATE policy

### Option 2: Manual Setup
If you prefer to set up manually:

#### Step 1: Create Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Click "Create Bucket"
3. Name: `user-uploads`
4. Check "Public bucket" ✓
5. Click "Create"

#### Step 2: Run RLS Policy Script
```sql
-- Run this in Supabase SQL Editor
-- File: STORAGE_RLS_SETUP.sql
```

### Option 3: Diagnostic First
If you want to understand what's currently wrong:

```sql
-- Run this in Supabase SQL Editor
-- File: DIAGNOSE_AVATAR_ISSUE.sql
```

This will show you:
- Whether the bucket exists
- What RLS policies are currently set up
- How many avatars are base64 vs storage URLs
- Specific recommendations

## Verification

After running the fix, verify it worked:

### 1. Check in Supabase Dashboard
- Go to Storage → user-uploads
- You should see the bucket listed
- It should be marked as "Public"

### 2. Check RLS Policies
```sql
-- Run in SQL Editor
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;
```

You should see 4 policies:
- ✅ `Authenticated avatar delete`
- ✅ `Authenticated avatar update`
- ✅ `Authenticated avatar upload`
- ✅ `Public avatar access`

### 3. Test Avatar Upload in App
1. Open LocalFelo app
2. Go to Profile
3. Click Edit Profile
4. Upload a new avatar
5. Click Save Changes
6. You should see "Profile updated successfully!"
7. The avatar should display immediately

### 4. Verify in Database
```sql
-- Check that new avatars use storage URLs, not base64
SELECT 
  id,
  name,
  CASE 
    WHEN avatar_url LIKE 'data:image%' THEN '❌ Base64 (fallback)'
    WHEN avatar_url LIKE '%supabase%storage%' THEN '✅ Storage URL'
    ELSE '⚠️ Other'
  END as avatar_type,
  LEFT(avatar_url, 100) as url_preview,
  updated_at
FROM profiles
WHERE avatar_url IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;
```

After the fix, new uploads should show `✅ Storage URL` instead of `❌ Base64`.

## Expected Storage URL Format
After the fix, avatar URLs should look like this:
```
https://abcdefghijklmno.supabase.co/storage/v1/object/public/user-uploads/avatars/123e4567-e89b-12d3-a456-426614174000-1234567890.jpg
```

Not like this (base64):
```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD...
```

## Why We Still Keep Base64 Fallback
The base64 fallback is intentionally kept in the code because:
1. ✅ It ensures the app never breaks if storage is misconfigured
2. ✅ It provides a smooth user experience even during setup
3. ✅ Base64 avatars still work perfectly fine for profile display
4. ✅ It's a safety net for edge cases

However, **storage URLs are preferred** because:
1. ✅ Better performance (smaller database size)
2. ✅ Faster loading (CDN-backed)
3. ✅ Easier to manage and backup
4. ✅ Standard best practice

## RLS Policy Explanation

### Public Read Access
```sql
CREATE POLICY "Public avatar access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-uploads');
```
- Allows anyone (authenticated or not) to view/download avatar images
- This is safe because avatars are meant to be public profile pictures

### Authenticated Upload
```sql
CREATE POLICY "Authenticated avatar upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'user-uploads');
```
- Only logged-in users can upload files
- They can upload to anywhere in the `user-uploads` bucket
- The app code controls the file path format (`avatars/{userId}-{timestamp}.{ext}`)

### Authenticated Update
```sql
CREATE POLICY "Authenticated avatar update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'user-uploads')
  WITH CHECK (bucket_id = 'user-uploads');
```
- Logged-in users can replace/update any file in the bucket
- The `upsert: true` option in the upload code uses this to replace old avatars

### Authenticated Delete
```sql
CREATE POLICY "Authenticated avatar delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'user-uploads');
```
- Logged-in users can delete files (used for cleanup of old avatars)
- The app handles this in `deleteAvatar()` function

## Troubleshooting

### Issue: "Bucket already exists" error
**Solution:** The bucket is already created. Just run the RLS policy part of the script (STORAGE_RLS_SETUP.sql).

### Issue: Policies already exist
**Solution:** Run the DIAGNOSE script to see current policies, then manually drop conflicting ones.

### Issue: Still getting base64 after fix
**Checklist:**
1. ✅ Did you refresh the app? (Ctrl+Shift+R / Cmd+Shift+R)
2. ✅ Did you log out and log back in?
3. ✅ Are you actually uploading a NEW photo (not the same one)?
4. ✅ Check browser console for any storage errors
5. ✅ Verify policies exist using the verification query above

### Issue: Console shows "Failed to upload avatar"
This might still show up in browser console even after the fix. Check:
1. Is the user authenticated? (Storage uploads require login)
2. Is the file size under 5MB?
3. Is the file type an image? (jpg, png, webp, gif)
4. Check Supabase logs for more details

## Migration Strategy for Existing Base64 Avatars

If you have existing users with base64 avatars and want to migrate them to storage:

```sql
-- This is OPTIONAL and can be done later
-- Converts existing base64 avatars to storage URLs
-- (You'll need to implement the conversion logic in the app)

SELECT 
  id,
  name,
  avatar_url
FROM profiles
WHERE avatar_url LIKE 'data:image%'
ORDER BY updated_at DESC;
```

The conversion would require:
1. Reading the base64 data
2. Uploading it to storage
3. Updating the profile with the new storage URL

This is **not urgent** - base64 avatars work fine and will naturally convert when users next update their profile.

## Files Reference

- **FIX_AVATAR_STORAGE_COMPLETE.sql** - Run this first (all-in-one fix)
- **STORAGE_RLS_SETUP.sql** - Alternative: Just RLS policies
- **DIAGNOSE_AVATAR_ISSUE.sql** - Diagnostic to understand current state
- **services/avatarUpload.ts** - Upload logic with fallback
- **components/EditProfileModal.tsx** - Profile update with silent fallback
- **components/AvatarUploader.tsx** - UI component for avatar selection

## Summary

**The Problem:** RLS policies are restricting storage uploads, causing silent fallback to base64.

**The Fix:** Run `FIX_AVATAR_STORAGE_COMPLETE.sql` to set up proper RLS policies.

**The Result:** New avatar uploads will use storage URLs instead of base64.

**User Experience:** No change - the fallback ensures it always works, but storage is better.
