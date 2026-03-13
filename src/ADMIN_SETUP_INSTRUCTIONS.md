# LocalFelo Admin Setup Instructions

## Quick Setup (Recommended Method)

### Step 1: Delete All Users
Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Delete all users from profiles table
DELETE FROM profiles;

-- Delete all users from auth
DELETE FROM auth.users;
```

### Step 2: Create Admin User via Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Navigate to: `Authentication` → `Users`

2. **Click "Add User" or "Invite User"**

3. **Fill in the details:**
   - **Email:** `uxsantosh@gmail.com`
   - **Password:** `Sun@6000`
   - **Auto Confirm User:** ✅ YES (check this box!)
   - **Send Email Confirmation:** ❌ NO

4. **Click "Create User"**

5. **Copy the User ID (UUID)**
   - After creation, you'll see a UUID like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
   - Copy this ID

### Step 3: Set Admin Flag

Go back to SQL Editor and run:

```sql
-- Replace 'USER_ID_HERE' with the UUID you copied in step 2
INSERT INTO profiles (id, email, name, is_admin, created_at, updated_at)
VALUES (
  'USER_ID_HERE',  -- ⚠️ REPLACE THIS
  'uxsantosh@gmail.com',
  'Admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET is_admin = true;
```

### Step 4: Verify Admin Setup

Run this query to verify:

```sql
SELECT id, email, name, is_admin 
FROM profiles 
WHERE email = 'uxsantosh@gmail.com';
```

You should see:
- ✅ `is_admin` = `true`

### Step 5: Login to LocalFelo

1. Go to your LocalFelo app
2. Click Login
3. Enter:
   - **Email:** `uxsantosh@gmail.com`
   - **Password:** `Sun@6000`
4. You should now see admin options! 🎉

---

## Alternative Method: Using SQL Only

If you prefer to do everything via SQL:

```sql
-- 1. Delete all users
DELETE FROM profiles;
DELETE FROM auth.users;

-- 2. Create user in auth.users (Advanced - requires RPC function)
-- This is more complex and requires Supabase Edge Functions
-- Recommended to use Dashboard method above instead
```

---

## Troubleshooting

### Problem: "User not found" when logging in
**Solution:** Make sure you checked "Auto Confirm User" when creating the user

### Problem: "No admin options showing"
**Solution:** 
1. Check if `is_admin` is set to `true` in profiles table
2. Make sure you're logged in with the correct email
3. Try logging out and logging back in

### Problem: "Profile not found"
**Solution:** The profile might not have been created automatically. Run the INSERT query from Step 3 again.

---

## What Data is Preserved?

✅ **Preserved:**
- All listings (marketplace items)
- All wishes
- All tasks
- All categories
- All cities and areas
- All chat messages and conversations

❌ **Deleted:**
- All user accounts
- All user profiles
- User authentication sessions

---

## Security Notes

⚠️ **Important:**
- Change the admin password after first login
- Don't share admin credentials
- Use a strong password in production
- The default password `Sun@6000` is only for initial setup
