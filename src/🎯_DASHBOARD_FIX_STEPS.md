# 🎯 EXACT FIX FOR RLS ERROR (Dashboard Method)

## The Error You're Getting

```
🔴 new row violates row-level security policy
Status: 403
```

## Why This Happens

Your INSERT policy exists but has `with_check: null`:

```json
{
  "policyname": "Authenticated avatar upload",
  "operation": "INSERT",
  "condition": null  ← THIS IS THE PROBLEM!
}
```

When Supabase tries to INSERT a file, it checks the WITH CHECK clause. Since it's NULL, the check fails → 403 error.

## Fix via Supabase Dashboard (2 Minutes)

### Step 1: Go to Storage Policies

1. **Open Supabase Dashboard**
2. **Go to:** Storage → user-uploads
3. **Click the "Policies" tab** (at the top)

### Step 2: Delete Broken Policy

1. **Find:** "Authenticated avatar upload"
2. **Click the ⋮ menu** (three dots on the right)
3. **Click "Delete"**
4. **Confirm deletion**

### Step 3: Create New Policy Correctly

1. **Click "New Policy"**

2. **Select template:** "Allow authenticated uploads"
   - OR click "Create a policy from scratch"

3. **Fill in these EXACT values:**

   ```
   Policy name: Authenticated avatar upload
   
   Allowed operation: INSERT
   
   Target roles: authenticated
   
   WITH CHECK expression: bucket_id = 'user-uploads'
   ```

4. **IMPORTANT:** Make sure "WITH CHECK expression" is filled in!
   - It should say: `bucket_id = 'user-uploads'`
   - NOT blank/empty!

5. **Click "Review"**

6. **Verify the SQL shows:**
   ```sql
   CREATE POLICY "Authenticated avatar upload"
   ON storage.objects
   FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'user-uploads');
   ```

7. **Click "Save policy"**

### Step 4: Verify Policy is Correct

1. **Stay on Policies tab**
2. **Find your new policy**
3. **Click to expand it**
4. **Check:**
   - ✅ Name: "Authenticated avatar upload"
   - ✅ Command: INSERT
   - ✅ Roles: authenticated
   - ✅ WITH CHECK: `bucket_id = 'user-uploads'`

### Step 5: Test Upload

1. **Go back to your app**
2. **Hard refresh:** Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. **Open browser console:** F12 → Console
4. **Upload avatar**
5. **Look for:**
   ```
   ✅ [AVATAR UPLOAD] Upload SUCCESS
   ✅ [AVATAR UPLOAD] Public URL: https://...
   ```

6. **Check Storage:**
   - Go to Storage → user-uploads → Files
   - Click "Reload"
   - Should see `avatars/` folder with your file! ✅

## Alternative: SQL Method

If you have SQL Editor access, run:
```
🚨_FIX_RLS_POLICY_NOW.sql
```

This will drop and recreate the policy automatically.

## What Each Policy Should Look Like

After fix, you should have 3 policies for user-uploads:

### ✅ Policy 1: Public Read
```
Name: Public avatar access
Command: SELECT
WITH CHECK: bucket_id = 'user-uploads'
```

### ✅ Policy 2: Authenticated Upload (THE ONE WE'RE FIXING)
```
Name: Authenticated avatar upload
Command: INSERT
WITH CHECK: bucket_id = 'user-uploads'  ← MUST NOT be null!
```

### ✅ Policy 3: Authenticated Update
```
Name: Authenticated avatar update
Command: UPDATE
USING: bucket_id = 'user-uploads'
WITH CHECK: bucket_id = 'user-uploads'
```

### ✅ Policy 4: Authenticated Delete
```
Name: Authenticated avatar delete
Command: DELETE
USING: bucket_id = 'user-uploads'
```

## Common Mistakes to Avoid

### ❌ Mistake 1: Leaving WITH CHECK empty
```
WITH CHECK:   [empty]  ← WRONG!
```

### ✅ Correct:
```
WITH CHECK: bucket_id = 'user-uploads'  ← RIGHT!
```

### ❌ Mistake 2: Wrong bucket name
```
WITH CHECK: bucket_id = 'user_uploads'  ← Wrong (underscore)
```

### ✅ Correct:
```
WITH CHECK: bucket_id = 'user-uploads'  ← Right (hyphen)
```

### ❌ Mistake 3: Using USING instead of WITH CHECK
For INSERT, you need WITH CHECK, not USING.

## After Successful Fix

You should see this in console:
```
🔵 [AVATAR UPLOAD] Starting upload for user: d7f66c14-...
🔵 [AVATAR UPLOAD] Blob created: { size: 45234, type: "image/jpeg" }
🔵 [AVATAR UPLOAD] File path: avatars/d7f66c14-...-1234567890.jpeg
🔵 [AVATAR UPLOAD] Attempting upload to bucket: user-uploads
✅ [AVATAR UPLOAD] Upload SUCCESS: { path: "avatars/..." }
✅ [AVATAR UPLOAD] Public URL: https://project.supabase.co/storage/v1/object/public/user-uploads/avatars/...
✅ [EDIT PROFILE] Upload successful! URL: https://...
```

And in Storage:
```
user-uploads/
  📁 avatars/
     └─ 📄 d7f66c14-...-1234567890.jpeg  ✅
```

## Summary

**Problem:** INSERT policy has `with_check: null`

**Error:** "new row violates row-level security policy"

**Fix:** Delete and recreate policy with proper WITH CHECK

**Location:** Dashboard → Storage → user-uploads → Policies

**Key:** WITH CHECK field MUST have `bucket_id = 'user-uploads'`

**Result:** Avatars will upload to Storage bucket! ✅

---

## DO THIS NOW:

1. ✅ Dashboard → Storage → user-uploads → Policies
2. ✅ Delete "Authenticated avatar upload"
3. ✅ New Policy → Fill in WITH CHECK: `bucket_id = 'user-uploads'`
4. ✅ Save
5. ✅ Test upload in app
6. ✅ Should work immediately!
