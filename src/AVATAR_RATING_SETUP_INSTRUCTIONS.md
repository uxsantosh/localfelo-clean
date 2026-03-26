# 🎯 Avatar & Rating System - Setup Instructions

## ⚠️ IMPORTANT: Database Migration Required

The avatar photo upload and rating system features require database changes. Follow these steps to activate them:

---

## 📋 Step 1: Run the SQL Migration

1. **Open Supabase Dashboard**
   - Go to your project: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   - Click on **SQL Editor** in the left sidebar

2. **Run the Migration**
   - Open the file: `/database_migrations/avatar_and_rating_system.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **Run** button

3. **Verify Success**
   - You should see: "Success. No rows returned"
   - Check the Messages tab for any errors

---

## 📦 Step 2: Create Storage Bucket

1. **Go to Storage**
   - In Supabase Dashboard, click **Storage** in left sidebar
   - Click **New bucket** button

2. **Create Bucket**
   - **Name:** `user-uploads`
   - **Public bucket:** ✅ Enable (checked)
   - Click **Create bucket**

3. **Set Bucket Policies** (Optional - for more security)
   - Click on the `user-uploads` bucket
   - Go to **Policies** tab
   - Add these policies if you want folder-level security:
   
   ```sql
   -- View avatars
   CREATE POLICY "Avatar images are publicly accessible"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = 'avatars');
   
   -- Upload own avatar
   CREATE POLICY "Users can upload own avatar"
     ON storage.objects FOR INSERT
     WITH CHECK (
       bucket_id = 'user-uploads' 
       AND (storage.foldername(name))[1] = 'avatars'
       AND auth.uid()::text = (storage.foldername(name))[2]
     );
   
   -- Update own avatar
   CREATE POLICY "Users can update own avatar"
     ON storage.objects FOR UPDATE
     USING (
       bucket_id = 'user-uploads' 
       AND (storage.foldername(name))[1] = 'avatars'
       AND auth.uid()::text = (storage.foldername(name))[2]
     );
   
   -- Delete own avatar
   CREATE POLICY "Users can delete own avatar"
     ON storage.objects FOR DELETE
     USING (
       bucket_id = 'user-uploads' 
       AND (storage.foldername(name))[1] = 'avatars'
       AND auth.uid()::text = (storage.foldername(name))[2]
     );
   ```

---

## ✅ Step 3: Verify Installation

### Check Database Columns

Run this in SQL Editor:

```sql
SELECT 
  id,
  name,
  email,
  avatar_url,
  gender,
  helper_rating_avg,
  helper_rating_count,
  task_owner_rating_avg,
  task_owner_rating_count
FROM profiles
LIMIT 5;
```

You should see all columns without errors.

### Check Ratings Table

```sql
SELECT * FROM ratings LIMIT 5;
```

Table should exist (even if empty).

### Check Storage Bucket

```sql
SELECT * FROM storage.buckets WHERE name = 'user-uploads';
```

Should return 1 row with the bucket info.

---

## 🎨 Features Enabled After Setup

### 1. Avatar Photo Upload
- ✅ Users can upload profile photos
- ✅ Auto-compressed to 400x400px max
- ✅ NSFW content detection (prevents inappropriate photos)
- ✅ Gender selection (male/female/other)
- ✅ Photos stored in Supabase Storage

### 2. Dual Rating System
- ✅ **Helper Rating:** Rate users when they complete tasks
- ✅ **Task Owner Rating:** Rate users who posted tasks
- ✅ 5-star rating with optional comments
- ✅ Automatic average calculation
- ✅ Rating counts displayed on profiles
- ✅ Ratings immutable (can't be changed after 24 hours)

### 3. Profile Enhancements
- ✅ Avatar displayed in profile, chat, listings
- ✅ Star ratings visible on profile page
- ✅ Separate ratings for helper vs task owner roles
- ✅ Rating history visible to admins

---

## 🧪 Testing the Features

### Test Avatar Upload
1. Log in to your account
2. Go to Profile page
3. Click the camera icon
4. Upload a photo
5. Photo should compress and upload automatically

### Test Rating System
1. Create a task
2. Have another user accept it
3. Complete the task (both parties confirm)
4. Rating modals should appear for both users
5. Submit ratings
6. Check profile - ratings should update automatically

---

## 🐛 Troubleshooting

### Error: "column profiles.helper_rating_avg does not exist"
**Fix:** Run the SQL migration in Step 1

### Error: "Storage bucket not found"
**Fix:** Create the `user-uploads` bucket in Step 2

### Avatar upload fails silently
**Check:**
- Browser console for errors
- Supabase Storage logs
- File size (must be under 10MB)
- File type (must be image)

### Ratings not updating
**Check:**
- Triggers are enabled: `SELECT * FROM pg_trigger WHERE tgname LIKE '%rating%';`
- Function exists: `SELECT * FROM pg_proc WHERE proname = 'update_user_average_ratings';`

---

## 📊 Database Schema Summary

### New Columns in `profiles` table:
- `avatar_url` (TEXT) - URL to profile photo
- `gender` (TEXT) - User gender (male/female/other)
- `helper_rating_avg` (NUMERIC 3,2) - Average rating as helper (0-5)
- `helper_rating_count` (INTEGER) - Number of ratings as helper
- `task_owner_rating_avg` (NUMERIC 3,2) - Average rating as task owner (0-5)
- `task_owner_rating_count` (INTEGER) - Number of ratings as task owner

### New Table: `ratings`
- `id` (UUID) - Primary key
- `task_id` (UUID) - Reference to task
- `rated_user_id` (UUID) - User being rated
- `rater_user_id` (UUID) - User giving rating
- `rating_type` (TEXT) - 'helper' or 'task_owner'
- `rating` (INTEGER) - 1-5 stars
- `comment` (TEXT) - Optional feedback
- `created_at` (TIMESTAMP) - When rating was submitted

### New Functions:
- `update_user_average_ratings(user_id UUID)` - Recalculates averages
- `trigger_update_ratings()` - Auto-triggers on insert/delete

### New Triggers:
- `ratings_insert_trigger` - Updates averages on new rating
- `ratings_delete_trigger` - Updates averages on rating deletion

---

## 🔒 Security Features

1. **RLS Policies:** Anyone can view ratings, only raters can create
2. **Immutable Ratings:** Can't update ratings after creation
3. **24-hour Delete Window:** Users can delete mistakes within 24 hours
4. **NSFW Detection:** Prevents inappropriate profile photos
5. **One Rating Per Task:** Can't rate same user twice for same task
6. **Storage Policies:** Users can only modify their own avatars

---

## 📝 Notes

- **Migration is idempotent:** Safe to run multiple times
- **Existing users:** All get default rating values (0)
- **Avatar compression:** Reduces file size by ~90%
- **NSFW model:** Loads automatically, may take 1-2 seconds first time
- **Rating triggers:** Update averages automatically in real-time

---

## ✅ Ready to Go!

Once you complete Steps 1 & 2, the avatar and rating features will be fully functional. The code already handles missing columns gracefully, so the app won't break if migration is pending.

**Questions?** Check the migration file comments for detailed explanations.
