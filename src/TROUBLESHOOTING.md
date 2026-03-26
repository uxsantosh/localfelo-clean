# 🔧 Role System Troubleshooting Guide

## Common Issues and Solutions

---

## ❌ Error: "relation 'users' does not exist"

**Issue:** RLS policies reference a table called `users` that doesn't exist.

**Solution:** ✅ **FIXED** - Migration file updated to use `profiles` table

**What was changed:**
```sql
-- OLD (incorrect)
SELECT 1 FROM users
WHERE users.id::text = current_setting('request.headers', true)::json->>'x-client-token'

-- NEW (correct)
SELECT 1 FROM profiles
WHERE profiles.client_token = current_setting('request.headers', true)::json->>'x-client-token'
```

**Action:** Re-run the migration with the updated file.

---

## ❌ No roles showing on Professionals screen

**Possible Causes:**

### 1. Migration not run
**Check:**
```sql
SELECT COUNT(*) FROM roles;
```

**Expected:** 25 rows

**Solution:** Run the migration:
```sql
-- Copy and run: /supabase/migrations/20260322_create_roles_tables.sql
```

### 2. RLS blocking access
**Check:**
```sql
SELECT * FROM roles WHERE is_active = true;
```

**If empty but roles exist:**
- RLS policies might be too restrictive
- Verify policies allow public SELECT access

**Solution:**
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'roles';

-- If needed, recreate SELECT policy
DROP POLICY IF EXISTS "Anyone can view active roles" ON roles;
CREATE POLICY "Anyone can view active roles"
  ON roles FOR SELECT
  USING (is_active = true);
```

### 3. Frontend not fetching roles
**Check browser console for errors**

**Solution:** Verify `getAllRoles()` function in `/services/roles.ts`

---

## ❌ Professional registration fails

**Possible Causes:**

### 1. Missing role_id or subcategory_ids
**Check registration data being sent**

**Solution:** Verify the registration screen is sending:
- `role_id` (UUID)
- `subcategory_ids` (array of strings)

### 2. Foreign key constraint error
**Error:** `violates foreign key constraint`

**Solution:** Ensure role_id exists in roles table:
```sql
SELECT id, name FROM roles WHERE name = 'Electrician';
```

### 3. Permissions issue
**Error:** `permission denied` or `RLS policy violation`

**Check:** Is user authenticated?

**Solution:** Verify user has valid `client_token` in headers

---

## ❌ Professionals not appearing in role listing

**Possible Causes:**

### 1. No role_id assigned
**Check:**
```sql
SELECT id, name, role_id, subcategory_ids 
FROM professionals 
WHERE is_active = true;
```

**Solution:** Run migration to assign roles:
```sql
-- Run: /supabase/migrations/20260322_migrate_existing_professionals.sql
```

### 2. Subcategory_ids not populated
**Check:**
```sql
SELECT COUNT(*) FROM professionals 
WHERE subcategory_ids IS NULL OR subcategory_ids = '{}';
```

**Solution:** Run migration or manually update:
```sql
UPDATE professionals
SET subcategory_ids = ARRAY[subcategory_id]
WHERE subcategory_id IS NOT NULL
  AND (subcategory_ids IS NULL OR subcategory_ids = '{}');
```

### 3. Wrong role mapping
**Check which professionals should appear:**
```sql
-- Get subcategories for "Electrician" role
SELECT rs.subcategory_id 
FROM role_subcategories rs
JOIN roles r ON r.id = rs.role_id
WHERE r.name = 'Electrician';

-- Check if professionals have these subcategories
SELECT * FROM professionals
WHERE subcategory_ids && ARRAY['fan-repair', 'switch-repair', 'electrical-wiring'];
```

---

## ❌ Search not finding roles

**Possible Causes:**

### 1. Search function not implemented
**Solution:** Verify `searchRolesAndProfessionals()` exists in `/services/roles.ts`

### 2. Text search case-sensitive
**Solution:** Search should use ILIKE for case-insensitive:
```sql
WHERE LOWER(r.name) LIKE LOWER('%' || search_term || '%')
```

---

## ❌ Admin can't upload role images

**Possible Causes:**

### 1. Not logged in as admin
**Check:**
```sql
SELECT is_admin FROM profiles WHERE client_token = '<your-token>';
```

**Solution:** Grant admin access:
```sql
UPDATE profiles SET is_admin = true WHERE email = 'admin@example.com';
```

### 2. Image upload fails
**Check:** File size and format
- Max size: 5MB
- Formats: JPG, PNG, GIF, WebP

**Solution:** Verify `uploadImage()` function in avatar upload service

### 3. RLS blocking update
**Check:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'roles' AND cmd = 'UPDATE';
```

**Solution:** Ensure admin policy exists:
```sql
CREATE POLICY "Admins can manage roles"
  ON roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.client_token = current_setting('request.headers', true)::json->>'x-client-token'
      AND profiles.is_admin = true
    )
  );
```

---

## ❌ TypeScript errors in code

**Common TypeScript issues:**

### 1. Type 'Role' does not exist
**Solution:** Import from roles service:
```typescript
import type { Role, RoleWithSubcategories } from '../services/roles';
```

### 2. Property 'role_name' does not exist on Professional
**Solution:** Professional interface should include:
```typescript
interface Professional {
  // ... existing fields
  role_id?: string;
  role_name?: string;
  subcategory_ids?: string[];
}
```

### 3. Navigation type errors
**Solution:** Update navigation options:
```typescript
professionalsParams?: { 
  roleId?: string; 
  roleName?: string; 
  city: string 
}
```

---

## ❌ Role cards not showing images

**Possible Causes:**

### 1. No images uploaded
**Solution:** Upload images via Admin → Roles tab

### 2. Broken image URLs
**Check:**
```sql
SELECT name, image_url FROM roles WHERE image_url IS NOT NULL;
```

**Solution:** Verify URLs are accessible and valid

### 3. CORS issues
**Check browser console for CORS errors**

**Solution:** Ensure Supabase storage has correct CORS settings

---

## ❌ Migration errors

### Error: "duplicate key value violates unique constraint"
**Cause:** Roles already exist

**Solution:** Migration has `ON CONFLICT DO NOTHING` - this is safe, ignore the message

### Error: "column already exists"
**Cause:** Migration partially run before

**Solution:** Safe to continue - `IF NOT EXISTS` clauses handle this

### Error: "permission denied to create table"
**Cause:** Running as wrong user

**Solution:** Run migration as postgres/superuser or database owner

---

## 🔍 Debug Queries

### Check system health
```sql
-- Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roles', 'role_subcategories', 'professionals');

-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('roles', 'role_subcategories');

-- Count records
SELECT 
  (SELECT COUNT(*) FROM roles) as roles_count,
  (SELECT COUNT(*) FROM role_subcategories) as mappings_count,
  (SELECT COUNT(*) FROM professionals WHERE role_id IS NOT NULL) as professionals_with_role;
```

### Check specific role
```sql
-- Get role details
SELECT * FROM roles WHERE name = 'Electrician';

-- Get role's subcategories
SELECT rs.category_id, rs.subcategory_id
FROM role_subcategories rs
JOIN roles r ON r.id = rs.role_id
WHERE r.name = 'Electrician';

-- Get professionals for role
SELECT p.name, p.title, p.role_id
FROM professionals p
WHERE p.role_id = (SELECT id FROM roles WHERE name = 'Electrician');
```

### Check professional's role
```sql
SELECT 
  p.name,
  r.name as role_name,
  p.subcategory_ids,
  p.category_id,
  p.subcategory_id
FROM professionals p
LEFT JOIN roles r ON r.id = p.role_id
WHERE p.id = '<professional-id>';
```

---

## 📞 Still Having Issues?

### Step 1: Check Browser Console
Look for JavaScript errors or network failures

### Step 2: Check Supabase Logs
Go to Supabase Dashboard → Logs → API/Database logs

### Step 3: Verify Authentication
Ensure `x-client-token` header is being sent correctly

### Step 4: Test with SQL
Run queries directly in Supabase SQL Editor to isolate issues

### Step 5: Check Documentation
- `/PROFESSIONALS_ROLE_SYSTEM.md` - System overview
- `/DEPLOYMENT_CHECKLIST.md` - Deployment steps
- `/ROLE_SUBCATEGORY_MAPPING.md` - Role mappings

---

## 🔄 Reset Everything (Last Resort)

**WARNING:** This will delete all role data!

```sql
-- 1. Backup first!
CREATE TABLE roles_backup AS SELECT * FROM roles;
CREATE TABLE role_subcategories_backup AS SELECT * FROM role_subcategories;
CREATE TABLE professionals_backup AS SELECT * FROM professionals;

-- 2. Drop tables
DROP TABLE IF EXISTS role_subcategories CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 3. Remove columns from professionals
ALTER TABLE professionals DROP COLUMN IF EXISTS role_id;
ALTER TABLE professionals DROP COLUMN IF EXISTS subcategory_ids;

-- 4. Re-run migrations
-- Run: /supabase/migrations/20260322_create_roles_tables.sql
-- Run: /supabase/migrations/20260322_migrate_existing_professionals.sql
```

---

**Last Updated:** March 22, 2026  
**Version:** 1.0.0
