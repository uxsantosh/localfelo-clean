# 🔍 Debug Authentication Issues

## 🚨 Common Issues & Solutions

### **Issue 1: "Resend not working"**

This usually means one of these:

#### **A) Supabase Email Confirmations Disabled**
If Supabase has "Confirm email" turned OFF, it will:
- ✅ Create the user immediately
- ❌ NOT send any verification email
- ❌ User is already "confirmed" so resend won't work

**Solution:**
```
1. Go to Supabase Dashboard
2. Authentication → Providers → Email
3. Turn ON "Confirm email"
4. Delete test users from Authentication → Users
5. Try again
```

#### **B) Email Already Sent (Rate Limited)**
Supabase won't send duplicate emails within a short time period.

**Solution:**
```
1. Wait 60 seconds
2. Try resending again
3. OR check spam folder for original email
```

#### **C) User Already Confirmed**
If you already clicked the verification link, the user is confirmed.

**Solution:**
```
1. Try logging in instead of signing up
2. OR delete the user from Supabase Dashboard
3. Sign up fresh
```

---

## 🧪 Step-by-Step Debugging

### **Step 1: Check Browser Console**

Open browser console (F12) and look for these logs:

**Good signs:**
```
📧 Sending verification email to: test@example.com
✅ Verification email sent successfully
```

**Bad signs:**
```
❌ Signup error details: { message: "...", status: 400 }
🔄 User might exist, attempting to resend...
❌ Resend also failed: ...
```

**Copy the error message and check below.**

---

### **Step 2: Identify the Error**

#### **Error: "User already registered"**
```
Meaning: User exists in auth.users but email not confirmed
Solution: 
  1. Check Supabase Dashboard → Authentication → Users
  2. Look for your email
  3. Check "Email Confirmed" column
  4. If "No" → Delete the user and try again
  5. If "Yes" → Try logging in instead
```

#### **Error: "Email rate limit exceeded"**
```
Meaning: Supabase won't send more emails for a while
Solution:
  1. Wait 60-120 seconds
  2. Try again
  3. OR check spam folder for existing email
```

#### **Error: "Invalid email"**
```
Meaning: Email format is wrong or blocked
Solution:
  1. Use a valid email format
  2. Try a different email provider (Gmail, etc.)
```

#### **Error: "Signups not allowed"**
```
Meaning: Supabase has signups disabled
Solution:
  1. Go to Supabase Dashboard
  2. Authentication → Providers → Email
  3. Make sure "Enable Email provider" is ON
```

---

### **Step 3: Check Supabase Configuration**

#### **Check 1: Email Provider Enabled**
```
Supabase Dashboard → Authentication → Providers → Email

Must have:
✅ Enable Email provider: ON
✅ Confirm email: ON (CRITICAL!)
```

**If "Confirm email" is OFF:**
- Users are auto-confirmed
- No verification email is sent
- Resend won't work
- **Turn it ON and delete existing test users**

#### **Check 2: URL Configuration**
```
Supabase Dashboard → Authentication → URL Configuration

Site URL: http://localhost:5173
Redirect URLs: http://localhost:5173/**
```

**If wrong:**
- Verification links won't redirect correctly
- Update and try again

#### **Check 3: Email Templates**
```
Supabase Dashboard → Authentication → Email Templates → Confirm signup

Make sure it's enabled and has a template.
```

#### **Check 4: SMTP Settings**
```
Supabase Dashboard → Project Settings → Auth

Check if SMTP is configured.
If not, Supabase uses their default (which is fine for testing).
```

---

### **Step 4: Clean Slate Test**

Let's start fresh:

```bash
# 1. Clear browser data
- Open DevTools (F12)
- Application tab → Storage → Clear site data

# 2. Clear Supabase test users
- Supabase Dashboard → Authentication → Users
- Delete any test users (test@example.com, etc.)

# 3. Check Supabase settings
- Email provider: ON
- Confirm email: ON
- Site URL: http://localhost:5173
- Redirect URLs: http://localhost:5173/**

# 4. Test with fresh email
- Use a real email you have access to
- Enter email → Click Continue
- Check inbox (and spam folder!)
- Look for email from Supabase

# 5. Check browser console
- Should see: "✅ Verification email sent successfully"
- If error, copy the full error message
```

---

## 🔧 Manual Testing Commands

Open browser console and run:

### **Test 1: Check Current Auth State**
```javascript
const { data, error } = await supabase.auth.getSession();
console.log('Current session:', data);
```

### **Test 2: Manually Send Verification**
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'your-test@email.com',
  password: 'temp_password_123',
  options: {
    emailRedirectTo: window.location.origin,
  }
});
console.log('Signup result:', { data, error });
```

### **Test 3: Manually Resend**
```javascript
const { data, error } = await supabase.auth.resend({
  type: 'signup',
  email: 'your-test@email.com',
  options: {
    emailRedirectTo: window.location.origin,
  }
});
console.log('Resend result:', { data, error });
```

### **Test 4: Check User in Database**
```javascript
const { data, error } = await supabase.auth.admin.listUsers();
console.log('All users:', data);
```

---

## 📊 Expected Flow (With "Confirm Email" ON)

```
1. User enters email
   ↓
2. supabase.auth.signUp() called
   ↓
3. User created in auth.users with:
   - email_confirmed_at: NULL
   - confirmation_sent_at: NOW()
   ↓
4. Email sent to user
   ↓
5. User clicks link
   ↓
6. Redirects to your app
   ↓
7. email_confirmed_at: NOW()
   ↓
8. Password setup modal appears
```

---

## 🚫 What Happens (With "Confirm Email" OFF)

```
1. User enters email
   ↓
2. supabase.auth.signUp() called
   ↓
3. User created in auth.users with:
   - email_confirmed_at: NOW() (auto-confirmed!)
   - NO EMAIL SENT
   ↓
4. User never gets verification email
   ↓
5. Resend won't work (already confirmed)
   ↓
6. Password setup won't trigger (no confirmation)
```

**This is why "Confirm email" MUST be ON!**

---

## ✅ Checklist

Before asking for help, confirm:

- [ ] Email provider is enabled in Supabase
- [ ] "Confirm email" is turned ON in Supabase
- [ ] Site URL is correct (`http://localhost:5173`)
- [ ] Redirect URLs include `http://localhost:5173/**`
- [ ] Browser console is open (F12)
- [ ] Deleted all test users from Supabase
- [ ] Using a real email address
- [ ] Checked spam folder
- [ ] Waited at least 60 seconds between attempts
- [ ] Copied the full error message from console

---

## 🆘 Still Not Working?

**Provide this info:**

1. **Exact error from browser console** (copy full message)
2. **Screenshot of Supabase Email provider settings**
3. **What you see when you click Continue** (any toast messages?)
4. **Check Supabase Dashboard → Authentication → Users**
   - Is the user created?
   - Is "Email Confirmed" Yes or No?
5. **Run the manual test commands** (see above) and share results

---

## 💡 Quick Fixes

### **Fix 1: Reset Everything**
```
1. Supabase Dashboard → Authentication → Users
2. Delete ALL test users
3. Turn "Confirm email" ON
4. Clear browser data (F12 → Application → Clear)
5. Try signup with NEW email
```

### **Fix 2: Use Gmail**
```
Some email providers block automated emails.
Try with a Gmail address instead.
```

### **Fix 3: Check Spam**
```
Supabase emails often go to spam folder.
Check there first!
```

### **Fix 4: Wait & Retry**
```
Rate limits are real.
Wait 2-3 minutes and try again.
```

---

## 🎯 Expected Console Output (Success)

```
🔍 Checking if email exists: test@example.com
❌ Email not found in database
📧 Sending verification email to: test@example.com
✅ Verification email sent (user needs to confirm)
```

**Then after clicking email link:**
```
🔔 Auth event: SIGNED_IN
🔄 [App] Syncing Supabase session with OldCycle auth...
📝 [App] Creating new OldCycle profile...
✅ [App] Profile created successfully
✅ [App] OldCycle auth synced successfully
🔐 User needs to set password
```

**If you don't see this, something is wrong!**
