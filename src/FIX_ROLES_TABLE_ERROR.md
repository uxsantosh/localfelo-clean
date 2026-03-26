# 🔧 Fix: "Could not find table 'public.roles'"

## The Problem

You're seeing this error:
```
Error fetching roles: {
  "code": "PGRST205",
  "message": "Could not find the table 'public.roles' in the schema cache"
}
```

**Root Cause:** The `roles` table doesn't exist in your database yet because the migration hasn't been run.

---

## ✅ Solution: Run the Migration

### Step 1: Go to Supabase Dashboard

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Run the Migration Script

**Option A: Use the Quick Migration (Recommended)**

Copy the entire contents of this file:
```
/supabase/migrations/00_verify_and_create_roles.sql
```

Paste it into the SQL Editor and click **RUN**

**Option B: Use the Original Migration**

Copy the entire contents of this file:
```
/supabase/migrations/20260322_create_roles_tables.sql
```

Paste it into the SQL Editor and click **RUN**

### Step 3: Verify Success

You should see output like:
```
✅ ROLES SYSTEM CREATED SUCCESSFULLY
Total roles: 25
Total mappings: 100+
```

### Step 4: Refresh Schema Cache

**IMPORTANT:** After running the migration, you MUST refresh Supabase's schema cache:

**Method 1: Wait (Automatic)**
- Wait 30-60 seconds for Supabase to auto-refresh

**Method 2: Manual Refresh (Faster)**
- Go to **Settings** → **API** 
- Click **Restart API Server** (if available)

**Method 3: Force Refresh**
- Make a simple query to force cache refresh:
  ```sql
  SELECT COUNT(*) FROM roles;
  ```

### Step 5: Test in Your App

Refresh your LocalFelo app and navigate to the Professionals section. You should now see 25 role cards.

---

## 🔍 Verification Queries

Run these in Supabase SQL Editor to verify everything works:

### Check tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roles', 'role_subcategories');
```

**Expected:** 2 rows (roles, role_subcategories)

### Check roles created:
```sql
SELECT COUNT(*) FROM roles;
```

**Expected:** 25

### Check mappings created:
```sql
SELECT COUNT(*) FROM role_subcategories;
```

**Expected:** 100+ rows

### Check RLS policies:
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('roles', 'role_subcategories');
```

**Expected:** 4 policies (2 for each table)

### Test SELECT access:
```sql
SELECT * FROM roles WHERE is_active = true ORDER BY display_order;
```

**Expected:** 25 rows showing all roles

---

## 🚨 If Migration Fails

### Error: "permission denied"

**Solution:** Make sure you're running as the database owner or postgres user.

In Supabase, this shouldn't happen. If it does, contact Supabase support.

### Error: "relation already exists"

**Solution:** Tables already exist! This is fine. Run verification queries to check data.

If tables exist but have no data:
```sql
-- Check if roles table is empty
SELECT COUNT(*) FROM roles;

-- If 0, manually insert roles
INSERT INTO roles (name, description, display_order, is_active) VALUES
  ('Electrician', 'Electrical repairs and installations', 1, true),
  ('Plumber', 'Plumbing repairs and maintenance', 2, true)
  -- ... (copy rest from migration file)
ON CONFLICT (name) DO NOTHING;
```

### Error: "current_setting" errors

**Solution:** RLS policies reference request headers. This is correct for LocalFelo's auth system.

The error might occur if:
1. You're testing in SQL Editor (RLS doesn't apply there)
2. You need to disable RLS temporarily:
   ```sql
   ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
   ALTER TABLE role_subcategories DISABLE ROW LEVEL SECURITY;
   ```
   
   **WARNING:** Only disable RLS temporarily for testing! Re-enable after:
   ```sql
   ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE role_subcategories ENABLE ROW LEVEL SECURITY;
   ```

---

## 📋 Complete Migration Checklist

- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Copy `/supabase/migrations/00_verify_and_create_roles.sql`
- [ ] Paste into SQL Editor
- [ ] Click RUN
- [ ] Verify success message
- [ ] Wait 30 seconds for cache refresh (or restart API)
- [ ] Run verification query: `SELECT COUNT(*) FROM roles;`
- [ ] Should return 25
- [ ] Refresh LocalFelo app
- [ ] Navigate to Professionals section
- [ ] Should see 25 role cards
- [ ] ✅ Done!

---

## 🔄 After Migration: Migrate Existing Professionals

If you have existing professionals in your database, run this second migration:

```sql
-- Copy and run: /supabase/migrations/20260322_migrate_existing_professionals.sql
```

This will:
- Assign roles to existing professionals based on their subcategories
- Populate the `subcategory_ids` array
- Ensure all professionals work with the new role system

---

## 🎉 Success!

Once the migration runs successfully:

✅ Roles table created  
✅ 25 professional roles available  
✅ Role-subcategory mappings configured  
✅ RLS policies active  
✅ Professionals screen shows role cards  
✅ Registration flow uses 3-step role selection  

---

## 📞 Still Not Working?

### Check 1: Table exists but still getting error?

**Clear browser cache and hard refresh:**
- Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

### Check 2: RLS blocking access?

**Temporarily disable to test:**
```sql
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
```

If this fixes it, the issue is with RLS policies. Check that your `profiles` table has the `client_token` column:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'client_token';
```

### Check 3: Supabase URL correct?

Verify in your `.env` or environment variables that:
- `VITE_SUPABASE_URL` points to your project
- `VITE_SUPABASE_ANON_KEY` is correct

### Check 4: Still stuck?

1. Check browser console for more detailed errors
2. Check Supabase Dashboard → Logs → API logs
3. Try restarting your local dev server
4. Verify Supabase project is not paused

---

**Last Updated:** March 22, 2026  
**Status:** Ready to deploy after migration
