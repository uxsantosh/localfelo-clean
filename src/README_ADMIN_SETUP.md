# 🔐 LocalFelo Admin Setup - Quick Guide

## ✅ **Simple 3-Step Process**

### **Step 1: Run SQL Script**
1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the entire content of `COMPLETE_ADMIN_SETUP.sql`
4. Click **Run**

This will:
- ✅ Create auto-profile trigger
- ✅ Delete all existing users (data like wishes, tasks, listings is preserved!)
- ✅ Prepare database for admin user

---

### **Step 2: Create Admin User in Dashboard**
1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click **"Add User"** or **"Invite User"**
3. Fill in the form:
   ```
   Email: uxsantosh@gmail.com
   Password: Sun@6000
   ```
4. **IMPORTANT:** Check ✅ **"Auto Confirm User"**
5. Click **"Create User"**

The profile will be automatically created via the trigger!

---

### **Step 3: Set Admin Flag**
Go back to **SQL Editor** and run:

```sql
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'uxsantosh@gmail.com';
```

---

### **Step 4: Verify & Login**

**Verify in SQL Editor:**
```sql
SELECT id, email, name, is_admin 
FROM profiles 
WHERE email = 'uxsantosh@gmail.com';
```

You should see:
- ✅ `is_admin` = `true`

**Login to LocalFelo:**
1. Go to your LocalFelo app
2. Click **Login**
3. Enter:
   - Email: `uxsantosh@gmail.com`
   - Password: `Sun@6000`
4. **You should now see admin options!** 🎉

---

## 🎯 What Admin Can Do

After logging in as admin, you should see:
- ✅ Admin badge in profile
- ✅ Close/Delete buttons on all listings
- ✅ Close/Delete buttons on all wishes
- ✅ Close/Delete buttons on all tasks
- ✅ Access to moderation features

---

## 📊 What Data is Preserved?

✅ **PRESERVED:**
- All marketplace listings
- All wishes
- All tasks
- All categories
- All cities and areas
- All chat messages and conversations

❌ **DELETED:**
- All user accounts
- All user profiles
- All authentication sessions

---

## 🔍 Troubleshooting

### Problem: "User not found" or "Invalid credentials"
**Solution:** 
- Make sure you checked ✅ **"Auto Confirm User"** when creating the user
- Try resetting the password in Supabase Dashboard

### Problem: "No admin options showing"
**Solution:**
```sql
-- Check if is_admin is set
SELECT is_admin FROM profiles WHERE email = 'uxsantosh@gmail.com';

-- If false, run this:
UPDATE profiles SET is_admin = true WHERE email = 'uxsantosh@gmail.com';
```

### Problem: "Profile not found"
**Solution:**
The trigger should auto-create it. If it didn't, manually create:
```sql
-- First, get the user ID from auth.users
SELECT id FROM auth.users WHERE email = 'uxsantosh@gmail.com';

-- Then insert profile (replace USER_ID_HERE with the ID from above)
INSERT INTO profiles (id, email, name, is_admin, created_at, updated_at)
VALUES (
  'USER_ID_HERE',
  'uxsantosh@gmail.com',
  'Admin',
  true,
  NOW(),
  NOW()
);
```

---

## 🔒 Security Notes

⚠️ **Important:**
- Change the password `Sun@6000` after first login for security
- Don't share admin credentials
- Use a strong password in production
- This default password is only for initial setup

---

## 📁 Files Reference

- **`COMPLETE_ADMIN_SETUP.sql`** - Main setup script (run this first)
- **`ADMIN_SETUP.sql`** - Alternative script with manual steps
- **`ADMIN_SETUP_INSTRUCTIONS.md`** - Detailed step-by-step guide

---

## ✅ Quick Checklist

- [ ] Ran `COMPLETE_ADMIN_SETUP.sql` in Supabase SQL Editor
- [ ] Created user via Supabase Dashboard with email: `uxsantosh@gmail.com`
- [ ] Checked ✅ "Auto Confirm User" option
- [ ] Ran UPDATE query to set `is_admin = true`
- [ ] Verified `is_admin` is `true` in database
- [ ] Logged in to LocalFelo with credentials
- [ ] Can see admin options in the app

**If all checked, you're done! 🎉**

---

Need help? Check the troubleshooting section above or contact support.
