# 🔧 Supabase Configuration for OldCycle Email Auth

## ✅ What We Fixed

We updated the email/password authentication flow to:
1. ✅ Redirect to home page (`/`) instead of `/auth/callback`
2. ✅ Show password setup modal automatically after email verification
3. ✅ Auto-login users after they set their password
4. ✅ Create OldCycle profile seamlessly
5. ✅ **Handle resending verification emails** (for users who didn't receive the first one)

---

## 📋 Supabase Dashboard Configuration Needed

### **1. Update URL Configuration** (CRITICAL!)

**Location:** `Supabase Dashboard → Authentication → URL Configuration`

**Update to:**
```
Site URL: http://localhost:5173
```

**Redirect URLs (add both):**
```
http://localhost:5173
http://localhost:5173/**
```

> **Note:** For production, also add:
> - `https://oldcycle.hueandhype.com`
> - `https://oldcycle.hueandhype.com/**`

---

### **2. Email Provider Settings** (CRITICAL!)

**Location:** `Supabase Dashboard → Authentication → Providers`

**Click on "Email" and ensure:**
- ✅ **Enable Email provider** - ON
- ✅ **Confirm email** - ON
- ⚙️ **Secure email change** - ON (recommended)
- ⚙️ **Secure password change** - ON (recommended)

---

### **3. Email Templates** (Optional - Default is Fine)

**Location:** `Supabase Dashboard → Authentication → Email Templates`

The **default "Confirm signup" template** works perfectly! You can customize it later if needed.

**Default template:**
```
Subject: Confirm Your Email

Follow this link to confirm your email:
{{ .ConfirmationURL }}

If you didn't request this, you can safely ignore this email.
```

---

## 🎯 Testing the Complete Flow

### **Step 1: Sign Up**
1. Go to `http://localhost:5173`
2. Click "Login/Sign Up"
3. Enter email: `test@example.com`
4. Click "Continue"
5. Should see: "✅ Verification email sent!"

### **Step 2: Verify Email**
1. Check inbox for verification email from Supabase
2. Click the "Confirm your mail" link
3. Browser redirects to: `http://localhost:5173/`

### **Step 3: Set Password** (Auto-triggered!)
1. Password Setup Modal appears automatically! 🎉
2. Enter password (min 6 characters)
3. Confirm password
4. Click "Set Password & Continue"

### **Step 4: Auto-Login** ✨
1. Password is set
2. User is automatically logged in
3. Profile is created in `profiles` table
4. Welcome message appears!

---

## 🔍 How to Check if Configuration is Correct

### **Check URL Configuration:**
```
1. Go to Supabase Dashboard
2. Click your project
3. Click "Authentication" in sidebar
4. Click "URL Configuration" tab
5. Verify Site URL and Redirect URLs
```

### **Check Email Provider:**
```
1. Go to Supabase Dashboard
2. Click "Authentication" → "Providers"
3. Find "Email" in the list
4. Click to expand
5. Verify it's enabled with "Confirm email" ON
```

---

## 🚨 Troubleshooting

### **Problem: Can't login after setting password**
- ✅ Make sure password is at least 6 characters
- ✅ Try logging in manually with email/password
- ✅ Check browser console for error messages

### **Problem: Email not received / Need to resend**
- ✅ Click "Didn't receive? Resend email" button on the confirmation screen
- ✅ Check your spam/junk folder
- ✅ Wait 2-3 minutes (sometimes emails are delayed)
- ✅ Make sure your email address is correct
- ✅ Try with a different email provider (Gmail, Outlook, etc.)

### **Problem: "User already registered" error**
- ✅ This means you already signed up but didn't verify email
- ✅ Use the "Resend email" button to get a new verification link
- ✅ Or try logging in if you already set a password

---

## 📊 Database Schema (No Changes Needed!)

Your existing `profiles` table already has everything:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  display_name TEXT,
  phone TEXT,
  whatsapp_same BOOLEAN DEFAULT true,
  whatsapp_number TEXT,
  client_token TEXT,
  owner_token TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**No migrations needed!** 🎉

---

## 🎨 User Flow Summary

```
1. User enters email → Email sent
   ↓
2. User clicks link → Redirects to home
   ↓
3. Auth event fires → SIGNED_IN
   ↓
4. App checks → needs_password_setup = true
   ↓
5. Password Modal → Automatically appears
   ↓
6. User sets password → Profile created
   ↓
7. Auto-login → Welcome message! 🎉
```

---

## ✅ Checklist

Before testing, make sure:
- [ ] Site URL is `http://localhost:5173`
- [ ] Redirect URL includes `http://localhost:5173/**`
- [ ] Email provider is enabled
- [ ] "Confirm email" is turned ON
- [ ] Dev server is running (`npm run dev`)
- [ ] Browser console is open (for debugging)

---

## 🚀 Ready to Test!

1. **Save all Supabase settings**
2. **Refresh your app** (`http://localhost:5173`)
3. **Try signing up** with a real email
4. **Check your inbox** for verification email
5. **Click the link** and watch the magic! ✨

The password setup modal should appear automatically! 🎉