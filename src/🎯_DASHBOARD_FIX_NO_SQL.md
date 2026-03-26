# 🎯 Fix Avatar 400 Error - Dashboard Method (No SQL Needed)

## The Permission Error You Got
```
ERROR: 42501: must be owner of table objects
```

This happens because `storage.objects` is owned by Supabase system, not your user.

## Solution: Use the Dashboard Instead

### Step 1: Create the Bucket (2 minutes)

1. **Go to Supabase Dashboard**
   - Open your project dashboard
   - Click **Storage** in left sidebar

2. **Create New Bucket**
   - Click **"New bucket"** button
   - Name: `user-uploads`
   - **Check the "Public bucket" checkbox** ✓ (IMPORTANT!)
   - Click **"Create bucket"**

3. **Verify**
   - You should see `user-uploads` bucket in the list
   - It should show a 🌍 globe icon (indicating public)

### Step 2: Configure RLS Policies (1 minute)

The bucket is created, but we need to set up access policies.

#### Option A: Use Policy Templates (Easiest)

1. **Click on `user-uploads` bucket**
2. **Go to "Policies" tab** (top of the page)
3. **Click "New Policy"**
4. **Choose template: "Allow public read access"**
   - This lets anyone view uploaded avatars
   - Click "Review" → "Save policy"

5. **Click "New Policy" again**
6. **Choose template: "Allow authenticated users to upload"**
   - This lets logged-in users upload
   - Click "Review" → "Save policy"

7. **Click "New Policy" again**
8. **Choose template: "Allow authenticated users to update own files"**
   - This lets users update their own avatars
   - Click "Review" → "Save policy"

#### Option B: Manual SQL (If templates don't work)

If the templates don't exist, go to **SQL Editor** and run this instead:

```sql
-- Public read access
CREATE POLICY "Public read access"
  ON storage.objects 
  FOR SELECT
  TO public
  USING (bucket_id = 'user-uploads');

-- Authenticated upload
CREATE POLICY "Authenticated upload"
  ON storage.objects 
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'user-uploads');

-- Authenticated update
CREATE POLICY "Authenticated update"
  ON storage.objects 
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'user-uploads')
  WITH CHECK (bucket_id = 'user-uploads');

-- Authenticated delete
CREATE POLICY "Authenticated delete"
  ON storage.objects 
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'user-uploads');
```

**Note:** This might also fail with the same error if your role doesn't have permissions. In that case, contact Supabase support or use the policy templates in the Dashboard.

### Step 3: Test (30 seconds)

1. **Hard refresh your app**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Test avatar upload**
   - Go to Profile → Edit Profile
   - Upload a photo
   - Click Save
   - Should work now! ✅

3. **Verify in Dashboard**
   - Go back to Storage → user-uploads
   - You should see a folder `avatars/` with your uploaded photo!

## Troubleshooting

### Bucket created but still getting 400?

**Check bucket is public:**
1. Go to Storage → user-uploads
2. Click the ⚙️ (settings) icon
3. Make sure "Public bucket" is checked ✓

**Check bucket name:**
- Must be exactly `user-uploads` (with hyphen)
- Not `user_uploads` (underscore) ❌
- Not `userUploads` (camelCase) ❌

### Bucket created but getting 403 now?

**Good!** That means:
- ✅ Bucket exists (400 fixed!)
- ❌ RLS blocking (need policies)

**Fix:** Add the RLS policies from Step 2 above.

### Can't see "New Policy" button?

**Alternative approach:**
1. Go to **Authentication** → **Policies**
2. Look for `storage.objects` table
3. Click "New Policy"
4. Create policies there

### Still stuck?

**Check your Supabase role:**
```sql
SELECT current_user, session_user;
```

If you're not `postgres` or `supabase_admin`, you might not have permissions to create storage policies.

**Contact Supabase support** to request storage permissions for your account.

## Why This Works

### The Permission Issue
```
❌ SQL Script: Tries to ALTER storage.objects directly
   → Fails: "must be owner of table objects"
   → You don't own system tables

✅ Dashboard: Uses Supabase's internal APIs
   → Works: Dashboard has elevated permissions
   → Automatically handles ownership
```

### Bucket Creation via Dashboard
```
Dashboard → Storage → New Bucket
  ↓
Calls Supabase API with admin credentials
  ↓
Creates bucket with correct permissions
  ↓
Bucket owned by your project ✅
```

## Summary

**Problem:** SQL script failed with permission error

**Cause:** Can't modify `storage.objects` table directly

**Solution:** Use Dashboard UI instead:
1. Storage → New Bucket → `user-uploads` (public ✓)
2. Add RLS policies via policy templates
3. Test avatar upload

**Time:** 3 minutes

**Result:** Avatar upload works! ✅

---

## Quick Steps

```
1. Dashboard → Storage → New Bucket
   Name: user-uploads
   Public: ✓ CHECK THIS
   Create ✓

2. Click user-uploads → Policies tab
   Add "Public read access" policy
   Add "Authenticated upload" policy

3. Test in app
   Profile → Edit → Upload Avatar → Save
   Should work! ✅
```

---

**Next:** After creating bucket, test and let me know if you get a different error!
