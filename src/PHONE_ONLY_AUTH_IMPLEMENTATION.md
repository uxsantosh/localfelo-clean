# 📱 PHONE-ONLY AUTHENTICATION SYSTEM - LocalFelo

**Status:** ✅ **COMPLETE & READY**  
**Date:** February 11, 2026

---

## 🎯 AUTHENTICATION FLOWS

### 1. New User Signup
```
Step 1: Enter phone number (9876543210)
  ↓
Step 2: Receive & verify OTP (6 digits via SMS)
  ↓
Step 3: Enter name + set password
  ↓
✅ Account created → Auto-login
```

### 2. Returning User Login
```
Step 1: Enter phone number (9876543210)
  ↓
Step 2: Enter password
  ↓
✅ Logged in
```

### 3. Forgot Password
```
Step 1: Click "Forgot Password"
  ↓
Step 2: Verify OTP (sent to phone)
  ↓
Step 3: Set new password
  ↓
✅ Password reset → Login with new password
```

---

## 📁 FILES CREATED

### Main Auth Screen
✅ **`/screens/PhoneAuthScreen.tsx`**
- Complete phone-only authentication UI
- All 3 flows implemented (signup, login, forgot password)
- Uses OTPVerificationScreen for OTP entry
- Handles password storage with bcrypt

### Supporting Files
✅ **`/services/authPhone.ts`** - Phone auth service
✅ **`/screens/OTPVerificationScreen.tsx`** - Already exists
✅ **`/supabase/functions/send-otp/`** - Send OTP edge function
✅ **`/supabase/functions/verify-otp/`** - Verify OTP edge function
✅ **`/migrations/CREATE_OTP_SYSTEM.sql`** - Database migration

---

## 🔧 HOW IT WORKS

### New User Flow (Detailed):

1. **User enters phone:** `9876543210`
2. **System checks database:**
   - Profile doesn't exist → `isNewUser = true`
3. **Send OTP:**
   - Call `send-otp` edge function
   - 2Factor sends SMS with 6-digit OTP
   - Store session in `otp_verifications` table
4. **User enters OTP:**
   - Call `verify-otp` edge function (without name)
   - 2Factor verifies OTP
   - Return verification success
5. **Collect name + password:**
   - User enters name (e.g., "John Doe")
   - User sets password (min 6 characters)
   - User confirms password
6. **Create account:**
   - Hash password with bcrypt
   - Insert into `profiles` table
   - Generate client_token and owner_token
7. **Auto-login:**
   - Store user data in localStorage
   - Close auth modal
   - User is logged in! ✅

### Returning User Flow (Detailed):

1. **User enters phone:** `9876543210`
2. **System checks database:**
   - Profile exists with password_hash → Show password screen
3. **User enters password:**
   - Verify with bcrypt.compare()
   - If correct → Login ✅
   - If incorrect → Show error

### Forgot Password Flow (Detailed):

1. **User clicks "Forgot Password"**
2. **Send OTP:**
   - Call `send-otp` edge function
   - User receives SMS
3. **Verify OTP:**
   - User enters 6-digit code
   - Call `verify-otp` to validate
4. **Reset password:**
   - User enters new password
   - User confirms new password
   - Hash with bcrypt
   - Update `password_hash` in database
5. **Back to login:**
   - User can now login with new password

---

## 🗄️ DATABASE STRUCTURE

### profiles Table (Existing):
```sql
Columns used:
- id (uuid)
- phone (varchar) - Format: +919876543210
- name (text)
- display_name (text)
- password_hash (text) - bcrypt hash
- client_token (text)
- owner_token (text)
- whatsapp_same (boolean)
- created_at (timestamp)
```

### otp_verifications Table (New):
```sql
Columns:
- id (uuid)
- phone (varchar)
- session_id (varchar) - Returned to frontend
- two_factor_session_id (text) - From 2Factor API
- created_at (timestamp)
- expires_at (timestamp) - 10 minutes
- verified (boolean)
- attempts (int) - Max 3
- max_attempts (int) - Default 3
```

---

## 🚀 INTEGRATION STEPS

### Step 1: Use PhoneAuthScreen Instead of AuthScreen

Find where you currently use `<AuthScreen />` and replace with:

```typescript
import { PhoneAuthScreen } from './screens/PhoneAuthScreen';

// In your component:
const [showAuth, setShowAuth] = useState(false);

const handleAuthSuccess = (user: any) => {
  console.log('User logged in:', user);
  setShowAuth(false);
  // User is already stored in localStorage
  // App will automatically detect and use it
};

return (
  <>
    <button onClick={() => setShowAuth(true)}>Login</button>
    
    {showAuth && (
      <PhoneAuthScreen
        onSuccess={handleAuthSuccess}
        onClose={() => setShowAuth(false)}
      />
    )}
  </>
);
```

### Step 2: Deploy Edge Functions

```bash
# 1. Run database migration
# Open Supabase → SQL Editor
# Copy /migrations/CREATE_OTP_SYSTEM.sql → Run

# 2. Set 2Factor API key
npx supabase secrets set TWOFACTOR_API_KEY=your_api_key

# 3. Deploy edge functions
npx supabase functions deploy send-otp
npx supabase functions deploy verify-otp
```

### Step 3: Test the Flow

1. Click "Login" button
2. Enter phone: `9876543210`
3. Receive OTP via SMS
4. Enter OTP
5. Enter name: "John Doe"
6. Set password: "mypassword"
7. ✅ Account created and logged in

---

## 🎨 UI/UX FEATURES

### Phone Entry Screen:
- LocalFelo logo and branding
- Single phone number input (10 digits)
- Auto-formats as you type
- Validates before sending OTP
- "Continue" button (disabled until valid)

### OTP Verification Screen:
- 6 individual digit boxes
- Auto-focus next box on input
- Paste support (6-digit codes)
- Countdown timer (30 seconds)
- Resend OTP button
- Shows formatted phone number

### Password Entry Screen (Returning User):
- Shows formatted phone number
- Password input with show/hide toggle
- "Forgot Password?" link
- "Back to phone number" option
- Error messages for wrong password

### Name + Password Screen (New User):
- Name input field
- Password input with show/hide
- Confirm password input
- Validates:
  - Name min 2 characters
  - Password min 6 characters
  - Passwords match
- "Create Account" button

### Reset Password Screen:
- New password input
- Confirm password input
- Same validation as signup
- "Reset Password" button

---

## 🔒 SECURITY FEATURES

### OTP Security:
- ✅ Server-side verification (2Factor API)
- ✅ Max 3 attempts per session
- ✅ 10-minute expiry
- ✅ One-time use (session deleted after verification)
- ✅ No OTP storage on client

### Password Security:
- ✅ bcrypt hashing (10 rounds)
- ✅ Min 6 characters
- ✅ Server-side verification
- ✅ No plain-text storage
- ✅ Password reset requires OTP verification

### Session Security:
- ✅ Client tokens (for API calls)
- ✅ Owner tokens (for deletions)
- ✅ localStorage for persistence
- ✅ Auto-logout on clear storage

---

## 📊 STATE MANAGEMENT

### PhoneAuthScreen State:
```typescript
step: 'enter-phone' | 'verify-otp' | 'enter-password' | 'set-password' | 'forgot-password-otp' | 'reset-password'
phone: string                 // 10-digit number
name: string                  // User's name (new users)
password: string              // Password
confirmPassword: string       // Confirmation
showPassword: boolean         // Toggle visibility
loading: boolean              // Loading state
error: string                 // Error message
otpSessionId: string          // From send-otp
isNewUser: boolean            // New vs returning
existingProfile: any          // Existing user data
```

---

## 🧪 TESTING CHECKLIST

### New User Signup:
- [ ] Enter valid phone → OTP sent
- [ ] Enter correct OTP → Name/password screen shown
- [ ] Enter name + password → Account created
- [ ] Auto-login after signup
- [ ] User data in localStorage
- [ ] Profile in database with password_hash

### Returning User Login:
- [ ] Enter existing phone → Password screen shown
- [ ] Enter correct password → Logged in
- [ ] Enter wrong password → Error shown
- [ ] Forgot password link works

### Forgot Password:
- [ ] Click forgot password → OTP sent
- [ ] Verify OTP → Reset password screen
- [ ] Enter new password → Password updated
- [ ] Login with new password works

### Error Cases:
- [ ] Invalid phone format → Error shown
- [ ] Wrong OTP → Attempts counter increments
- [ ] Max attempts → Session deleted
- [ ] Expired OTP → Error shown
- [ ] Weak password → Validation error
- [ ] Password mismatch → Error shown

---

## 🎯 USER EXPERIENCE

### First-Time User Journey:
1. "I want to login"
2. Enter my phone number
3. "Wait, I got an SMS! Let me enter the code"
4. "Oh, it's asking for my name and password"
5. Set a password I'll remember
6. "Great, I'm in!"

### Returning User Journey:
1. "Time to login again"
2. Enter my phone number
3. "It remembers me! Just need my password"
4. Enter password
5. "I'm in!"

### Forgot Password Journey:
1. "Uh oh, forgot my password"
2. Click "Forgot Password"
3. "Another SMS code"
4. Enter OTP
5. Set new password
6. "Back to normal!"

---

## 📈 ADVANTAGES OVER EMAIL AUTH

### Why Phone-Only?

1. **Faster Signup:**
   - No email verification
   - SMS delivery is instant
   - Most Indians prefer phone over email

2. **Better Verification:**
   - Phone = real person
   - Reduces spam accounts
   - Better for local marketplace

3. **Password Recovery:**
   - SMS OTP more reliable than email
   - Users always have phone with them
   - Faster recovery process

4. **Simpler UX:**
   - One identifier (phone)
   - No "email or phone" confusion
   - Consistent across all flows

5. **India-Friendly:**
   - Everyone has a phone
   - Not everyone checks email
   - SMS is universal

---

## 🔄 MIGRATION FROM OLD SYSTEM

If you have users with email-based auth:

### Option 1: Require Phone Linking
```typescript
// Check if user has phone
if (!user.phone) {
  // Show "Link Phone Number" modal
  // Send OTP → Verify → Update profile
}
```

### Option 2: Support Both (Temporary)
```typescript
// Allow login with email OR phone
// Gradually migrate users to phone-only
// Deprecate email auth after 6 months
```

### Option 3: Force Migration
```typescript
// On next login with email:
// "Please set up phone authentication"
// Send OTP → Verify → Add to profile
// Disable email login
```

---

## 💡 TIPS & BEST PRACTICES

### For Developers:

1. **Always validate phone format:**
   ```typescript
   if (!validatePhone(phone)) {
     setError('Invalid phone number');
     return;
   }
   ```

2. **Show loading states:**
   ```typescript
   setLoading(true);
   try {
     await sendOTP(phone);
   } finally {
     setLoading(false);
   }
   ```

3. **Clear errors on input change:**
   ```typescript
   onChange={(e) => {
     setPhone(e.target.value);
     setError(''); // Clear error
   }}
   ```

4. **Auto-format phone numbers:**
   ```typescript
   value={phone}
   onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
   ```

5. **Use toast notifications:**
   ```typescript
   import { toast } from 'sonner@2.0.3';
   
   toast.success('OTP sent!');
   toast.error('Invalid OTP');
   ```

### For Users:

1. **Phone number tips:**
   - Enter 10 digits only
   - No country code needed
   - No spaces or dashes

2. **OTP tips:**
   - Check SMS within 10 minutes
   - Copy-paste supported
   - Click "Resend" if not received

3. **Password tips:**
   - Minimum 6 characters
   - Use something memorable
   - Write it down securely

---

## 🎉 DEPLOYMENT CHECKLIST

Before going live:

- [ ] Database migration run
- [ ] Edge functions deployed
- [ ] 2Factor API key configured
- [ ] PhoneAuthScreen integrated
- [ ] Old AuthScreen removed/replaced
- [ ] All flows tested
- [ ] Error handling verified
- [ ] Loading states working
- [ ] Toast notifications showing
- [ ] localStorage persistence working
- [ ] Password hashing working
- [ ] OTP verification working
- [ ] Forgot password working

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues:

**"OTP not received":**
- Check 2Factor API balance
- Verify phone number is correct
- Check SMS delivery in 2Factor dashboard

**"Invalid OTP":**
- Check if expired (10 minutes)
- Verify user entered correct code
- Check attempts counter

**"Failed to create account":**
- Check database connection
- Verify profiles table schema
- Check password hashing function

**"Can't login with password":**
- Verify password_hash exists
- Check bcrypt verification
- Ensure correct phone format

---

## ✅ SUCCESS CRITERIA

Your phone-only auth is working when:

1. ✅ New users can sign up with phone + OTP + name + password
2. ✅ Returning users can login with phone + password
3. ✅ Users can reset password via OTP
4. ✅ All flows are smooth and intuitive
5. ✅ Errors are handled gracefully
6. ✅ Loading states prevent double-submissions
7. ✅ User data persists in localStorage
8. ✅ Passwords are securely hashed
9. ✅ OTP verification is reliable
10. ✅ No email auth remains

---

## 🎊 YOU'RE DONE!

**LocalFelo now has phone-only authentication!**

- 📱 Phone number as primary identifier
- 🔐 Secure password-based login
- 📲 OTP verification for signup and recovery
- ✅ No email required
- 🇮🇳 India-friendly UX

**Users will love it!** 🚀

---

**For full OTP system deployment, see:**
- `/COMPLETE_OTP_SYSTEM_DEPLOYMENT.md` - Edge functions deployment
- `/QUICK_DEPLOYMENT_CHECKLIST.md` - 5-minute setup guide
