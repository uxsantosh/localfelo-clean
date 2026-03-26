# 🔐 OTP Authentication Guide - OldCycle

## Overview

OldCycle now supports **Phone OTP Authentication** using Supabase Auth. This provides secure login with:
- ✅ Phone OTP verification for registration
- ✅ Login with Password
- ✅ Login with OTP
- ✅ Forgot Password (OTP-based reset)

---

## 📋 What Was Added

### New Screens
1. **OTPVerificationScreen** (`/screens/OTPVerificationScreen.tsx`)
   - 6-digit OTP input with auto-focus
   - Paste support for OTP codes
   - 30-second resend countdown
   - Clean, minimal UI

2. **SetPasswordScreen** (`/screens/SetPasswordScreen.tsx`)
   - Password + Confirm Password fields
   - Show/hide password toggle
   - Password requirements display
   - Validation feedback

### New Component
3. **EnhancedAuthModal** (`/components/EnhancedAuthModal.tsx`)
   - Replaces the old `SoftAuthModal`
   - Supports 4 authentication flows:
     - **Register**: name + phone → OTP → set password
     - **Login with Password**: phone + password
     - **Login with OTP**: phone → OTP
     - **Forgot Password**: phone → OTP → reset password

### Updated Services
4. **auth.ts** (`/services/auth.ts`)
   - New functions:
     - `sendRegistrationOTP(phone)` - Send OTP to phone
     - `verifyOTP(phone, otp)` - Verify OTP code
     - `completeRegistration()` - Complete registration after OTP
     - `loginWithPassword()` - Login with phone + password
     - `loginWithOTP()` - Login with OTP
     - `resetPassword()` - Reset password after OTP verification

### Updated Configuration
5. **supabaseClient.ts** (`/lib/supabaseClient.ts`)
   - Enabled Supabase Auth session management
   - Auto-refresh tokens
   - Persist sessions in localStorage

### Database Migration
6. **database_migration_otp.sql**
   - Adds `auth_user_id` column to profiles table
   - Links profiles to Supabase Auth users
   - Adds RLS policies for authenticated users

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

```sql
-- Go to Supabase Dashboard > SQL Editor
-- Copy and paste the contents of database_migration_otp.sql
-- Run the migration
```

### Step 2: Enable Phone Authentication in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Enable **Phone** authentication
3. Choose SMS provider (recommended: **Twilio** for India)

### Step 3: Configure Twilio (for India)

1. Sign up at [Twilio.com](https://www.twilio.com/)
2. Get a phone number with SMS capability
3. Add credentials to Supabase:
   - **Account SID**
   - **Auth Token**
   - **Messaging Service SID** (or Phone Number)
4. Configure phone number format in Supabase:
   - Template: `+91{{.Phone}}` (for India)

### Step 4: Test OTP Flow

1. Build and run your app: `npm run dev`
2. Click "Register / Sign Up"
3. Enter name + phone number (10 digits)
4. You should receive an OTP via SMS
5. Enter OTP to verify
6. Set password
7. Registration complete!

---

## 📱 User Flows

### 1️⃣ Registration Flow

```
User → Tap "Register / Sign Up"
     → Enter Name + Phone Number
     → Tap "Continue"
     → Receive OTP via SMS
     → Enter 6-digit OTP
     → Tap "Verify OTP"
     → Set Password (min 6 characters)
     → Tap "Continue"
     → ✅ Registration Complete
```

### 2️⃣ Login with Password

```
User → Tap "Login with Password"
     → Enter Phone Number
     → Enter Password
     → Tap "Login"
     → ✅ Logged In
```

### 3️⃣ Login with OTP

```
User → Tap "Login with OTP"
     → Enter Phone Number
     → Tap "Send OTP"
     → Receive OTP via SMS
     → Enter 6-digit OTP
     → Tap "Verify OTP"
     → ✅ Logged In
```

### 4️⃣ Forgot Password

```
User → Tap "Login with Password"
     → Tap "Forgot Password?"
     → Enter Phone Number
     → Tap "Send OTP"
     → Receive OTP via SMS
     → Enter 6-digit OTP
     → Tap "Verify OTP"
     → Enter New Password
     → Tap "Continue"
     → ✅ Password Reset Complete
     → Auto-login with new password
```

---

## 🔧 Technical Details

### Phone Number Format

- **User Input**: 10-digit number (e.g., `9876543210`)
- **Stored in DB**: 10-digit number (e.g., `9876543210`)
- **Sent to Supabase**: International format (e.g., `+919876543210`)

### Authentication Flow

1. **Registration**:
   - User enters phone → Supabase sends OTP
   - User verifies OTP → Supabase creates auth user
   - User sets password → Update Supabase Auth user
   - Create profile in `profiles` table with `auth_user_id`

2. **Login with Password**:
   - Supabase Auth validates phone + password
   - Fetch profile from `profiles` table
   - Save to localStorage

3. **Login with OTP**:
   - Send OTP → User verifies
   - Check if profile exists in `profiles` table
   - If not found, show error: "Account not found. Please register first."
   - Save to localStorage

### Security Features

- ✅ OTP expires after 60 seconds
- ✅ Rate limiting on OTP requests (30-second cooldown)
- ✅ Password minimum 6 characters
- ✅ Session management with auto-refresh
- ✅ Secure storage in localStorage
- ✅ No email required (privacy-friendly)

---

## 🧪 Testing Checklist

- [ ] Register new user with OTP
- [ ] Login with password (existing user)
- [ ] Login with OTP (existing user)
- [ ] Forgot password flow
- [ ] Try invalid OTP (should show error)
- [ ] Try wrong password (should show error)
- [ ] Check OTP resend countdown (30 seconds)
- [ ] Test on real phone number (SMS should arrive)
- [ ] Test on mobile browser (responsive design)
- [ ] Check console for any errors

---

## 🐛 Troubleshooting

### OTP Not Received?

1. Check Twilio balance
2. Verify phone number format: `+91XXXXXXXXXX`
3. Check Twilio logs in Dashboard
4. Ensure SMS capability is enabled for your Twilio number

### "Session expired" Error?

- OTP expires after 60 seconds
- User needs to request new OTP

### "Account not found" Error (Login with OTP)?

- User must register first using Registration flow
- Check if profile exists in `profiles` table

### "Failed to send OTP" Error?

- Check Supabase Auth is enabled
- Verify Twilio credentials in Supabase Dashboard
- Check network connectivity

---

## 📝 Files Changed

### New Files
- `/screens/OTPVerificationScreen.tsx`
- `/screens/SetPasswordScreen.tsx`
- `/components/EnhancedAuthModal.tsx`
- `/database_migration_otp.sql`
- `/OTP_AUTHENTICATION_GUIDE.md` (this file)

### Modified Files
- `/App.tsx` - Updated to use `EnhancedAuthModal`
- `/services/auth.ts` - Added OTP functions
- `/lib/supabaseClient.ts` - Enabled auth sessions

### Unchanged Files (Backward Compatible)
- `/components/SoftAuthModal.tsx` - Still exists for reference
- All other screens and components - No changes

---

## 💡 Tips for Deployment

1. **Supabase Dashboard**: Enable Phone Auth **before** deploying
2. **Twilio Setup**: Configure SMS provider with India support
3. **Test First**: Use your own phone number for testing
4. **Monitor Costs**: Each OTP costs ~$0.01 (Twilio pricing)
5. **Rate Limiting**: Consider adding rate limiting to prevent abuse

---

## 🎉 What's Next?

Suggested improvements:
- Add rate limiting (max 3 OTP requests per phone per hour)
- Add email authentication as alternative
- Add social login (Google, Facebook)
- Add 2FA for admin accounts
- Add SMS notifications for listing updates

---

## 📞 Support

If you encounter any issues:
1. Check the console for errors
2. Review Supabase Auth logs
3. Check Twilio logs
4. Verify database migration ran successfully

---

**🎯 That's it! Your OldCycle app now has secure OTP authentication!** 🚀
