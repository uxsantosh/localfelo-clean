# Supabase Setup Instructions for Professionals Module

## ⚠️ CRITICAL: You MUST run these SQL migrations before the Professionals module will work!

The errors you're seeing are because:
1. The database tables don't exist yet (406 errors)
2. The RLS policies need to work with LocalFelo's x-client-token authentication (42501 error)

## Steps to Fix:

### 1. Open Supabase SQL Editor
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `drofnrntrbedtjtpseve`
3. Click on **SQL Editor** in the left sidebar

### 2. Run the Main Migration SQL (Create Tables)
1. Click **"New Query"**
2. Copy ALL the SQL from `/PROFESSIONALS_MODULE_SUPABASE_MIGRATION.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** or press `Ctrl+Enter` / `Cmd+Enter`
5. Wait for it to complete (you may see some warnings about existing policies - that's OK)

### 3. Run the RLS Fix SQL (Fix Authentication)
1. Click **"New Query"** again
2. Copy ALL the SQL from `/PROFESSIONALS_RLS_FIX.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** or press `Ctrl+Enter` / `Cmd+Enter`
5. This fixes the "row violates row-level security policy" error

### 4. Verify Tables Were Created
Run this query to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'professional%';
```

You should see:
- `professionals`
- `professional_services`
- `professional_images`
- `professional_categories_images`

### 5. Create Storage Bucket (If Not Auto-Created)
1. Go to **Storage** in Supabase Dashboard
2. Click **"New Bucket"**
3. Name: `professional-images`
4. Make it **PUBLIC**
5. Click **Create**

### 6. Test the App
After running the migration:
1. Refresh your LocalFelo app
2. The 406 errors should be gone
3. You should be able to register as a professional
4. Category images will load properly

## What This Migration Creates:

✅ **4 Database Tables**
- `professionals` - Main professional profiles
- `professional_services` - Services offered by professionals
- `professional_images` - Gallery images for professionals
- `professional_categories_images` - Category icon/images

✅ **Row Level Security (RLS) Policies**
- Users can only edit their own profiles
- Anyone can view active professionals
- Admins have full access

✅ **Storage Bucket**
- `professional-images` - For profile and gallery images

✅ **Indexes & Triggers**
- Optimized queries for better performance
- Auto-update timestamps

## Troubleshooting:

**If you get errors when running the SQL:**
1. Make sure you're running it in the correct project
2. Make sure your `profiles` table has an `is_admin` column
3. Check if some tables already exist (ignore "already exists" warnings)

**If images don't upload:**
1. Make sure the `professional-images` storage bucket exists
2. Make sure it's set to PUBLIC
3. Check the storage policies are applied

## After Migration:

The Professionals module will be fully functional:
- ✅ Browse professionals by category
- ✅ View professional profiles
- ✅ Register as a professional
- ✅ Upload profile and gallery images
- ✅ Contact professionals via WhatsApp/Chat
- ✅ Location-based filtering

---

**Need help?** Check the Supabase logs in Dashboard → Logs → Postgres Logs