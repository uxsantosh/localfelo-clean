# 🎯 MANUAL DASHBOARD FIX - Step by Step with Verification

Since SQL isn't fixing it, let's do this manually through the Dashboard with **exact verification steps**.

## Part 1: Delete ALL Old Policies

### Go to Policies
1. **Supabase Dashboard** → **Storage** → **user-uploads**
2. **Click "Policies" tab** (top of page)

### Delete Each Policy One by One
You should see policies like:
- Public avatar access
- Authenticated avatar upload ← **This is the broken one!**
- Authenticated avatar update
- Authenticated avatar delete

**For EACH policy:**
1. Click the **⋮** (three dots) on the right
2. Click **"Delete"**
3. Confirm deletion

**After deletion:** Policies tab should say "No policies yet"

## Part 2: Create New INSERT Policy (The Critical One!)

### Click "New Policy"

### DO NOT use template - Create from scratch
1. Click **"Create a policy from scratch"** (or skip template)

### Fill in EXACTLY:

```
Policy Name:
Authenticated avatar upload

Allowed operation:
☑️ INSERT (check this box ONLY)

Target roles:
☑️ authenticated (check this box)
☐ anon (leave unchecked)
☐ service_role (leave unchecked)

Policy definition for INSERT:

WITH CHECK expression:
bucket_id = 'user-uploads'
```

**CRITICAL:** Make sure "WITH CHECK expression" field has:
```
bucket_id = 'user-uploads'
```

### Review the SQL

Click **"Review"** - you should see:

```sql
CREATE POLICY "Authenticated avatar upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-uploads');
```

**Check:**
- ✅ Has `WITH CHECK`
- ✅ Says `bucket_id = 'user-uploads'`
- ✅ Says `TO authenticated`

### Save It

Click **"Save policy"**

## Part 3: Create Other Policies

### Policy 2: SELECT (Public Read)

**New Policy** → **Create from scratch**

```
Policy Name: Public avatar access
Allowed operation: ☑️ SELECT
Target roles: ☑️ public

USING expression:
bucket_id = 'user-uploads'
```

**Save**

### Policy 3: UPDATE

**New Policy** → **Create from scratch**

```
Policy Name: Authenticated avatar update
Allowed operation: ☑️ UPDATE
Target roles: ☑️ authenticated

USING expression:
bucket_id = 'user-uploads'

WITH CHECK expression:
bucket_id = 'user-uploads'
```

**Save**

### Policy 4: DELETE

**New Policy** → **Create from scratch**

```
Policy Name: Authenticated avatar delete
Allowed operation: ☑️ DELETE
Target roles: ☑️ authenticated

USING expression:
bucket_id = 'user-uploads'
```

**Save**

## Part 4: Verify Policies

You should now see **4 policies** in the Policies tab:

| Policy Name | Operation | Roles | Details |
|-------------|-----------|-------|---------|
| Public avatar access | SELECT | public | USING: bucket_id = 'user-uploads' |
| Authenticated avatar upload | INSERT | authenticated | WITH CHECK: bucket_id = 'user-uploads' |
| Authenticated avatar update | UPDATE | authenticated | USING + WITH CHECK |
| Authenticated avatar delete | DELETE | authenticated | USING: bucket_id = 'user-uploads' |

### Click on "Authenticated avatar upload" to expand it

**Verify you see:**
- Command: `INSERT`
- Roles: `authenticated`
- Policy: `WITH CHECK (bucket_id = 'user-uploads'::text)`

**If you see:** `WITH CHECK` is blank/empty → Delete and recreate it!

## Part 5: Test in Your App

### Hard Refresh
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### Open Console
Press **F12** → **Console** tab

### Upload Avatar
1. Click your profile
2. Edit profile
3. Upload new avatar
4. Save

### Check Console Output

**You should see:**
```
🔵 [EDIT PROFILE] New avatar detected, attempting upload...
🔵 [AVATAR UPLOAD] Starting upload for user: d7f66c14-...
🔵 [AVATAR UPLOAD] Blob created: { size: 45234, type: "image/jpeg" }
🔵 [AVATAR UPLOAD] File path: avatars/d7f66c14-...-1747180800000.jpeg
🔵 [AVATAR UPLOAD] Attempting upload to bucket: user-uploads
✅ [AVATAR UPLOAD] Upload SUCCESS: { path: "avatars/..." }
✅ [AVATAR UPLOAD] Public URL: https://...supabase.co/storage/v1/object/public/user-uploads/avatars/...
✅ [EDIT PROFILE] Upload successful! URL: https://...
```

**If you STILL see:**
```
🔴 [AVATAR UPLOAD] Upload FAILED: new row violates row-level security policy
```

→ Go to Part 6 below

## Part 6: If Still Failing - Check Authentication

### Open Console and run:
```javascript
// Check if user is authenticated
const session = JSON.parse(localStorage.getItem('sb-' + 'YOUR_PROJECT_REF' + '-auth-token'));
console.log('Session:', session);

// Check Supabase client
import { supabase } from './lib/supabaseClient';
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

### Check Network Tab
1. **F12** → **Network** tab
2. **Upload avatar**
3. **Look for request to:** `storage/v1/object/user-uploads/avatars/...`
4. **Click on it**
5. **Check Headers tab**
6. **Look for:** `Authorization: Bearer ...`

**If missing Authorization header:**
→ Your app isn't sending the auth token!

### Check if you're actually logged in
```javascript
// In console
localStorage.getItem('oldcycle_user')
```

**Should show:** Your user object with ID

**If null:** You're not logged in! Login again.

## Part 7: Nuclear Option - Recreate Bucket

If NOTHING works:

1. **Storage** → **user-uploads** → **Settings** (gear icon)
2. **Delete bucket** (this will delete all files!)
3. **Create new bucket:**
   - Name: `user-uploads`
   - ✅ Public bucket
4. **Add policies again** (Part 2-3 above)

## Common Issues

### Issue 1: Policy exists but WITH CHECK is null
**Fix:** Delete policy and recreate manually

### Issue 2: Wrong bucket name in policy
**Fix:** Must be `user-uploads` (with hyphen), not `user_uploads` (underscore)

### Issue 3: Policy targets wrong role
**Fix:** INSERT should target `authenticated`, not `public`

### Issue 4: App not sending auth token
**Fix:** Check supabase client initialization, check session storage

### Issue 5: Session expired
**Fix:** Logout and login again

## Success Indicators

### ✅ In Dashboard:
- Policies tab shows 4 policies
- INSERT policy has WITH CHECK filled in
- Files tab shows avatars/ folder after upload

### ✅ In Console:
- "Upload SUCCESS" message
- Public URL shown
- No 403 errors

### ✅ In Storage:
- Navigate to user-uploads bucket
- See avatars/ folder
- See your uploaded file

### ✅ In Profile:
- Avatar shows immediately
- Database has storage URL (not base64)

---

## Summary

**Problem:** RLS blocks INSERT
**Cause:** Policy WITH CHECK is null/missing
**Fix:** Manually create policy with explicit WITH CHECK
**Critical:** Field must have `bucket_id = 'user-uploads'`

**Do this NOW:**
1. Delete all user-uploads policies
2. Create new INSERT policy with WITH CHECK
3. Verify WITH CHECK is filled
4. Test upload
5. Should work! ✅
