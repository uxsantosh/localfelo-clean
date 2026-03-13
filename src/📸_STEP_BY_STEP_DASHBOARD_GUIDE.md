# 📸 Step-by-Step Dashboard Guide (With Screenshots)

## Why SQL Failed

```
ERROR: 42501: must be owner of table objects
```

**Explanation:**
- The `storage.objects` table is owned by Supabase's system
- Your postgres user doesn't have owner permissions
- You can't create RLS policies directly via SQL
- **Solution:** Use the Dashboard UI instead

## Dashboard Method (Visual Guide)

### STEP 1: Go to Storage

```
┌─────────────────────────────────────────────┐
│  SUPABASE DASHBOARD                         │
├─────────────────────────────────────────────┤
│                                             │
│  [🏠 Home]                                  │
│  [📊 Table Editor]                          │
│  [🔐 Authentication]                        │
│  [🗄️  Storage]  ← CLICK HERE               │
│  [📡 Database]                              │
│  [⚡ Edge Functions]                        │
│                                             │
└─────────────────────────────────────────────┘
```

### STEP 2: Create New Bucket

```
┌─────────────────────────────────────────────────────────┐
│  Storage                                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [+ New bucket]  ← CLICK HERE                          │
│                                                         │
│  No buckets yet                                         │
│  Create your first bucket to start uploading files      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### STEP 3: Configure Bucket

```
┌─────────────────────────────────────────────────────────┐
│  Create a new bucket                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Name of bucket *                                       │
│  ┌─────────────────────────────────────────┐           │
│  │ user-uploads                            │ ← TYPE THIS│
│  └─────────────────────────────────────────┘           │
│                                                         │
│  ☑️ Public bucket  ← CHECK THIS BOX!                   │
│                                                         │
│  File size limit                                        │
│  ┌─────────────────────────────────────────┐           │
│  │ 10                                      │ MB         │
│  └─────────────────────────────────────────┘           │
│                                                         │
│  Allowed MIME types                                     │
│  ┌─────────────────────────────────────────┐           │
│  │ image/*                                 │           │
│  └─────────────────────────────────────────┘           │
│                                                         │
│  [Cancel]  [Create bucket]  ← CLICK CREATE             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**IMPORTANT:** 
- ✅ Name must be exactly: `user-uploads` (with hyphen)
- ✅ "Public bucket" must be CHECKED ☑️
- ✅ File size: 10 MB or more
- ✅ MIME types: `image/*` or leave blank

### STEP 4: Verify Bucket Created

```
┌─────────────────────────────────────────────────────────┐
│  Storage                                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [+ New bucket]                                         │
│                                                         │
│  📦 Buckets                                             │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 🌍 user-uploads          0 objects    Created now │ │
│  │    ↑                                              │ │
│  │    Public bucket (globe icon)                     │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Check:**
- ✅ See 🌍 globe icon (means public)
- ✅ Name is `user-uploads`

### STEP 5: Add RLS Policies

Click on the `user-uploads` bucket, then:

```
┌─────────────────────────────────────────────────────────┐
│  user-uploads                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Objects] [Policies] [Settings]                        │
│             ↑                                           │
│         CLICK HERE                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Then:

```
┌─────────────────────────────────────────────────────────┐
│  Policies                                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [+ New policy]  ← CLICK HERE                          │
│                                                         │
│  No policies yet                                        │
│  RLS is enabled. Create your first policy.              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### STEP 6: Create Policies (Do This 3 Times)

#### Policy 1: Public Read Access

```
┌─────────────────────────────────────────────────────────┐
│  Create policy                                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Choose a template                                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 🔓 Allow public read access                       │ │
│  │    ← SELECT THIS                                  │ │
│  │                                                   │ │
│  │ 🔐 Allow authenticated users to upload           │ │
│  │                                                   │ │
│  │ 🔐 Allow users to update own files               │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  [Cancel]  [Review]  ← CLICK REVIEW                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Then click **"Save policy"**

#### Policy 2: Authenticated Upload

Click **"+ New policy"** again:

```
┌─────────────────────────────────────────────────────────┐
│  Choose a template                                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 🔐 Allow authenticated users to upload            │ │
│  │    ← SELECT THIS                                  │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  [Cancel]  [Review]  ← CLICK REVIEW                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Then click **"Save policy"**

#### Policy 3: Users Update Own Files

Click **"+ New policy"** again:

```
┌─────────────────────────────────────────────────────────┐
│  Choose a template                                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 🔐 Allow users to update own files                │ │
│  │    ← SELECT THIS                                  │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  [Cancel]  [Review]  ← CLICK REVIEW                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Then click **"Save policy"**

### STEP 7: Verify Policies

You should now see:

```
┌─────────────────────────────────────────────────────────┐
│  Policies for user-uploads                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ Allow public read access                           │
│     Target: SELECT                                      │
│     To: public                                          │
│                                                         │
│  ✅ Allow authenticated users to upload                │
│     Target: INSERT                                      │
│     To: authenticated                                   │
│                                                         │
│  ✅ Allow users to update own files                    │
│     Target: UPDATE                                      │
│     To: authenticated                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Check:** Should see 3 policies ✅

### STEP 8: Test in App

1. **Hard refresh browser**
   ```
   Windows/Linux: Ctrl + Shift + R
   Mac: Cmd + Shift + R
   ```

2. **Go to Profile**
   - Click profile icon
   - Click "Edit Profile"

3. **Upload Avatar**
   - Click avatar circle
   - Select photo
   - Click "Save Changes"

4. **Should work!** ✅
   - No 400 error
   - Photo uploads
   - Avatar displays immediately

### STEP 9: Verify Upload

Go back to Dashboard:

```
┌─────────────────────────────────────────────────────────┐
│  Storage → user-uploads → Objects                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📁 avatars/                                            │
│    └─ 📄 d7f66c14-...-1773309956645.jpeg   823 KB      │
│                                                         │
│  ✅ File uploaded successfully!                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Can't find policy templates?

**If you don't see the template options, create manually:**

1. Click **"+ New policy"**
2. Choose **"Create a policy from scratch"**
3. Fill in:
   ```
   Policy name: Public read access
   Target roles: public
   Policy command: SELECT
   USING expression: bucket_id = 'user-uploads'
   ```
4. Repeat for INSERT and UPDATE with `authenticated` role

### Bucket created but no globe icon?

**Bucket is private, make it public:**

1. Click ⚙️ settings icon on bucket
2. Check ☑️ "Public bucket"
3. Save

### Getting 403 instead of 400 now?

**Good! Progress made:**
- ✅ Bucket exists (400 fixed!)
- ❌ Missing policies (403 error)

**Fix:** Complete Step 5-7 above to add policies

### Still getting 400?

**Check these:**

1. **Bucket name exact?**
   ```sql
   SELECT id FROM storage.buckets WHERE id = 'user-uploads';
   -- Should return 1 row
   ```

2. **Hard refreshed app?**
   - Ctrl+Shift+R / Cmd+Shift+R

3. **Logged in as authenticated user?**
   - Log out and log back in

## Summary

**SQL Failed:** Permission denied on `storage.objects` table

**Solution:** Use Dashboard UI instead

**Steps:**
1. ✅ Storage → New Bucket → `user-uploads` (public ✓)
2. ✅ Policies → Add 3 policies (read, upload, update)
3. ✅ Test → Upload avatar → Should work!

**Time:** 3-5 minutes

**Result:** Avatar uploads work! ✅

---

## Quick Checklist

```
[ ] Go to Storage in Dashboard
[ ] Create bucket: user-uploads
[ ] Check "Public bucket" ✓
[ ] Go to Policies tab
[ ] Add "Public read access" policy
[ ] Add "Authenticated upload" policy
[ ] Add "Users update own files" policy
[ ] Hard refresh app (Ctrl+Shift+R)
[ ] Test avatar upload
[ ] Check Storage → user-uploads for file
[ ] Done! ✅
```

---

**Still stuck?** Share what step you're on and what you see!
