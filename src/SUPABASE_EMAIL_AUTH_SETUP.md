# 🔐 OldCycle Email/Password Authentication - Complete Setup Guide

## ✅ What's Already Done (Frontend Code)

### 1. **Authentication Service** (`/services/auth.ts`)
✅ Email/password authentication functions:
- `checkEmailExists()` - Check if email is registered
- `sendVerificationEmail()` - Send magic link for new users
- `loginWithPassword()` - Login with email & password
- `sendPasswordResetEmail()` - Forgot password flow
- `getCurrentUser()` - Get logged-in user
- `logout()` - Sign out user

### 2. **UI Components**
✅ `/components/EmailAuth.tsx` - Complete auth modal with:
- Email input step
- Password login for existing users
- Verification email for new users
- Forgot password flow
- Beautiful modern UI

✅ `/components/PhoneCollectionModal.tsx` - Collect phone after registration

### 3. **Supabase Client** (`/lib/supabaseClient.ts`)
✅ Configured with:
- Auto token refresh enabled
- PKCE flow enabled
- Session persistence enabled
- URL: `https://drofnrntrbedtjtpseve.supabase.co`

### 4. **Integration**
✅ `/App.tsx` already uses `<EmailAuth />` component
✅ Login flow working on frontend

---

## 🚨 REQUIRED: Supabase Backend Setup

You **MUST** configure these in your Supabase project:

### Step 1: Update Profiles Table Schema

Your `profiles` table needs these columns for email auth:

```sql
-- Add email column and auth_user_id
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Make phone nullable (since email users may not have phone initially)
ALTER TABLE profiles ALTER COLUMN phone DROP NOT NULL;

-- Update existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_phone_key;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique ON profiles(phone) WHERE phone IS NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles(auth_user_id);
```

### Step 2: Enable Email Authentication in Supabase

1. Go to **Authentication > Providers** in Supabase Dashboard
2. **Enable Email Provider**
3. Configure Email Settings:
   - ✅ Enable Email Signup
   - ✅ Enable Email Confirmations (for new users)
   - ✅ Double confirm email changes: ON
   - ✅ Secure email change: ON

### Step 3: Configure Email Templates (IMPORTANT!)

Go to **Authentication > Email Templates** and set up:

#### **Confirm Signup Template**
This is sent to new users. They need to click the link to verify their email, then they'll be redirected to set a password.

```
Subject: Welcome to OldCycle - Verify Your Email
```

Body (keep the default Supabase template or customize):
```html
<h2>Welcome to OldCycle!</h2>
<p>Click the link below to verify your email and set up your account:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email</a></p>
```

#### **Reset Password Template**
```
Subject: Reset Your OldCycle Password
```

### Step 4: Set Redirect URLs

In **Authentication > URL Configuration**:

**Site URL:** `http://localhost:5173` (for development)
**Redirect URLs:** Add these:
- `http://localhost:5173`
- `http://localhost:5173/`
- `https://oldcycle.hueandhype.com` (for production)
- `https://oldcycle.hueandhype.com/`

### Step 5: Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = auth_user_id OR auth_user_id IS NULL);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Allow authenticated users to create profile
CREATE POLICY "Authenticated users can create profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- Allow public read for listings (soft auth compatibility)
CREATE POLICY "Anyone can read profiles with client_token"
  ON profiles FOR SELECT
  USING (client_token IS NOT NULL OR auth_user_id IS NOT NULL);
```

---

## 📧 How the Email Auth Flow Works

### **For New Users:**
1. User enters email in EmailAuth modal
2. System checks if email exists → NO
3. Sends verification email via Supabase Auth
4. User clicks link in email → redirected to app
5. Supabase creates auth.users record
6. User is prompted to set password (handled by Supabase)
7. After setting password, user can login
8. App creates profile in `profiles` table with `auth_user_id`

### **For Existing Users:**
1. User enters email in EmailAuth modal
2. System checks if email exists → YES
3. Shows password input
4. User enters password
5. Logs in via `supabase.auth.signInWithPassword()`
6. App retrieves profile from `profiles` table
7. User is logged in ✅

### **Forgot Password:**
1. User clicks "Forgot Password"
2. Enters email
3. Receives password reset email
4. Clicks link → sets new password
5. Can login with new password

---

## 🧪 Testing Checklist

After Supabase setup, test these flows:

### New User Registration
- [ ] Enter new email → "Verification email sent" message appears
- [ ] Check email inbox for verification link
- [ ] Click link → redirected to set password
- [ ] After setting password, can login
- [ ] Profile created in `profiles` table with `auth_user_id`
- [ ] Phone collection modal appears after first login

### Existing User Login
- [ ] Enter registered email → password field appears
- [ ] Enter correct password → logs in successfully
- [ ] Enter wrong password → "Incorrect password" error
- [ ] User data loads from `profiles` table

### Forgot Password
- [ ] Click "Forgot Password" on login screen
- [ ] Enter email → "Password reset email sent"
- [ ] Check inbox for reset link
- [ ] Click link → set new password
- [ ] Can login with new password

### Admin Check
- [ ] Set `is_admin = true` for your profile in Supabase
- [ ] Login → Admin panel should be visible

---

## 🔧 Environment Variables

Make sure you have these in your `.env.local`:

```env
VITE_SUPABASE_URL=https://drofnrntrbedtjtpseve.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyb2Zucm50cmJlZHRqdHBzZXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODMzMjQsImV4cCI6MjA3OTM1OTMyNH0.HONRnz8phA-6j0hwf6XLhD8aRX4zwQR-2x6pQHcUBAo
```

---

## ✅ Quick Verification

To verify everything is working:

```sql
-- Check if email column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('email', 'auth_user_id', 'is_admin');

-- Check email authentication is enabled
SELECT * FROM auth.users LIMIT 1;
```

---

## 🚀 Next Steps After Setup

1. **Run SQL migrations** (Steps 1 & 5 above) in Supabase SQL Editor
2. **Enable email authentication** in Supabase Dashboard
3. **Configure email templates** 
4. **Set redirect URLs**
5. **Test registration flow** with a new email
6. **Deploy to production** and update redirect URLs

---

## 🐛 Troubleshooting

### "Email not authorized" error
→ Check **Authentication > Providers > Email** is enabled

### Email verification link not working
→ Check redirect URLs include your domain

### Profile not created after signup
→ Check RLS policies allow INSERT with auth.uid()

### Password reset not working
→ Verify email templates are configured

### Can't login after setting password
→ Clear browser cache and try again

---

## 📝 Summary

**Frontend:** ✅ COMPLETE (already coded)
**Backend:** ⚠️ NEEDS SETUP (follow steps above)

Once you complete the Supabase setup, the email/password authentication will be fully functional! 🎉
