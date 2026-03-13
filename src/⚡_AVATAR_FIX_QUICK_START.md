# ⚡ Avatar Upload Fix - Quick Start

## Problem
✅ Profile shows "updated successfully"  
❌ Photo not saving to Supabase Storage  
⚠️ Using base64 fallback instead

## Root Cause
**RLS policies are blocking storage uploads** → App falls back to base64 in database

## Quick Fix (2 minutes)

### Step 1: Diagnose (Optional)
```sql
-- Run in Supabase SQL Editor
-- File: DIAGNOSE_AVATAR_ISSUE.sql
```

### Step 2: Fix It
```sql
-- Run in Supabase SQL Editor  
-- File: FIX_AVATAR_STORAGE_COMPLETE.sql
```

### Step 3: Test
1. Open app
2. Profile → Edit Profile
3. Upload new photo
4. Save
5. ✅ Should see storage URL in database now

## Verify Fix Worked

```sql
-- Quick check
SELECT 
  name,
  CASE 
    WHEN avatar_url LIKE '%storage%' THEN '✅ FIXED'
    WHEN avatar_url LIKE 'data:image%' THEN '❌ Still base64'
    ELSE '?' 
  END as status,
  updated_at
FROM profiles
WHERE avatar_url IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;
```

## What the Fix Does

1. ✅ Creates `user-uploads` storage bucket (if missing)
2. ✅ Sets bucket to public (for read access)
3. ✅ Creates 4 RLS policies:
   - Public read access
   - Authenticated upload
   - Authenticated update  
   - Authenticated delete
4. ✅ Verifies profiles table permissions

## Expected Result

**Before Fix:**
```
avatar_url: data:image/jpeg;base64,/9j/4AAQSkZJRg...
```

**After Fix:**
```
avatar_url: https://xxx.supabase.co/storage/v1/object/public/user-uploads/avatars/123-456.jpg
```

## Why Base64 Fallback Exists
- Safety net if storage fails
- Ensures app never breaks
- Silent failover (no errors shown to user)
- Gets replaced with storage URL once RLS is fixed

## Troubleshooting

**Still seeing base64 after fix?**
1. Hard refresh app (Ctrl+Shift+R)
2. Log out and log back in
3. Upload a NEW photo (different file)
4. Check browser console for errors

**Getting policy errors?**
- Run DIAGNOSE script first
- Check if policies already exist
- Drop old policies before creating new ones

**Bucket already exists error?**
- That's fine! Just means bucket is already there
- Skip to RLS policy setup (STORAGE_RLS_SETUP.sql)

## Files
- 📊 `DIAGNOSE_AVATAR_ISSUE.sql` - See what's wrong
- 🔧 `FIX_AVATAR_STORAGE_COMPLETE.sql` - Fix everything
- 📝 `AVATAR_STORAGE_FIX_GUIDE.md` - Detailed explanation
- 📁 `STORAGE_RLS_SETUP.sql` - Just RLS policies

## Need Help?
Read the full guide: `AVATAR_STORAGE_FIX_GUIDE.md`
