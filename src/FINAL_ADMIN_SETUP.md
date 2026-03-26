# 🔐 LocalFelo Admin Setup - FINAL GUIDE

## ⚡ **IMPORTANT: Your App Uses Custom Password Authentication**

Your LocalFelo app does **NOT** use Supabase Auth's email/password system. Instead, it uses a custom password system stored in the `profiles` table with SHA-256 hashing.

**This means:**
- ❌ Creating users via Supabase Dashboard → Users table **WILL NOT WORK**
- ✅ You must create the admin user **directly in the profiles table**

---

## 🚀 **METHOD 1: Use the Password Hash Generator (Easiest)**

### Step 1: Open the Hash Generator
1. Open the file `generate_password_hash.html` in your browser
2. It will auto-generate the password hash for `Sun@6000`
3. You'll see the complete SQL query ready to copy

### Step 2: Copy and Run SQL
1. Click "Copy SQL Query"
2. Go to Supabase Dashboard → SQL Editor
3. Paste the query
4. Click **Run**

### Step 3: Login
1. Go to your LocalFelo app
2. Enter email: `uxsantosh@gmail.com`
3. Click Continue
4. Enter password: `Sun@6000`
5. Click Login
6. **You're now logged in as admin!** 🎉

---

## 🔧 **METHOD 2: Manual SQL (If hash generator doesn't work)**

### Step 1: Generate Password Hash

Open your browser console (F12) and run:

```javascript
const password = 'Sun@6000';
const encoder = new TextEncoder();
const data = encoder.encode(password);
crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  console.log('Password Hash:', hashHex);
});
```

Copy the hash output.

### Step 2: Run SQL with the Hash

Go to Supabase SQL Editor and run:

```sql
-- Delete all existing users
DELETE FROM profiles;
DELETE FROM auth.users;

-- Create admin user (replace HASH_HERE with the hash from step 1)
INSERT INTO profiles (
  id,
  email,
  name,
  password_hash,
  password_hint,
  client_token,
  is_admin,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'uxsantosh@gmail.com',
  'Admin',
  'HASH_HERE',  -- ⚠️ Replace with hash from step 1
  'Sun',        -- Password hint (first 3 chars)
  gen_random_uuid()::text,
  true,
  NOW(),
  NOW()
);

-- Verify
SELECT id, email, name, is_admin FROM profiles WHERE email = 'uxsantosh@gmail.com';
```

### Step 3: Login
Same as Method 1, Step 3.

---

## ✅ **What You'll See After Login**

### Admin Features:
- 👑 **Admin badge** in profile
- 🗑️ **Delete/Close buttons** on ALL listings
- 🗑️ **Delete/Close buttons** on ALL wishes
- 🗑️ **Delete/Close buttons** on ALL tasks
- 🛡️ Full moderation access across the platform

---

## 🔍 **Troubleshooting**

### Problem: "Invalid password" when trying to login

**Cause:** The password hash in the database doesn't match.

**Solution:**
1. Use the `generate_password_hash.html` tool
2. Make sure you're using the EXACT password: `Sun@6000` (case-sensitive)
3. Copy the SQL from the generator and run it again

### Problem: "User not found"

**Cause:** Profile doesn't exist in the `profiles` table.

**Solution:**
Run this to check:
```sql
SELECT * FROM profiles WHERE email = 'uxsantosh@gmail.com';
```

If empty, run the INSERT query again.

### Problem: Admin options not showing

**Cause:** `is_admin` flag is not set to `true`.

**Solution:**
```sql
UPDATE profiles SET is_admin = true WHERE email = 'uxsantosh@gmail.com';
```

Then logout and login again.

---

## 📊 **Understanding the Authentication System**

### How LocalFelo Auth Works:

1. **User enters email/phone**
2. App checks `profiles` table (NOT `auth.users`)
3. If profile exists with `password_hash`:
   - Show password input
   - Hash entered password with SHA-256
   - Compare with stored `password_hash`
   - If match → Login successful

4. **Key Fields in profiles table:**
   - `email` or `phone_number` - User identifier
   - `password_hash` - SHA-256 hash of password
   - `password_hint` - First 3 chars of password (for hint)
   - `client_token` - Session token (UUID)
   - `is_admin` - Admin flag (boolean)

---

## 🎯 **Quick Verification Checklist**

After running the SQL, verify:

```sql
-- Check if profile exists
SELECT 
  id,
  email,
  name,
  is_admin,
  password_hash IS NOT NULL as has_password,
  client_token IS NOT NULL as has_token
FROM profiles 
WHERE email = 'uxsantosh@gmail.com';
```

**Expected Results:**
- ✅ `email` = `uxsantosh@gmail.com`
- ✅ `name` = `Admin`
- ✅ `is_admin` = `true`
- ✅ `has_password` = `true`
- ✅ `has_token` = `true`

If all are checked, you're ready to login!

---

## 🔒 **Security Recommendations**

After first login:
1. Change your password to something more secure
2. Don't share admin credentials
3. Consider implementing rate limiting for login attempts
4. In production, use proper backend password hashing (bcrypt/argon2)

---

## 📁 **Files Reference**

- **`generate_password_hash.html`** ⭐ **USE THIS** - Auto-generates hash and SQL
- **`FINAL_ADMIN_SETUP.md`** - This guide (you are here)
- **`ADMIN_USER_DIRECT_CREATE.sql`** - SQL script (if you don't use HTML tool)

---

## 🎉 **Success!**

Once logged in, you'll have full admin control over LocalFelo:
- Manage all listings
- Moderate all wishes
- Oversee all tasks
- Access admin-only features

**Happy moderating! 🚀**
