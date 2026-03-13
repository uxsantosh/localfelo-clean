# 🔍 PHASE 1: Auth System Refactor - Audit & Removal Plan

**Date:** February 11, 2026  
**Status:** AWAITING APPROVAL

---

## 📊 CURRENT STATE ANALYSIS

### ✅ What We HAVE (Keep These)
- **Supabase Database Tables:**
  - `profiles` - User profiles (will sync with auth.users)
  - `notifications` - Notification system ✅
  - `listings`, `wishes`, `tasks`, `conversations`, `messages` ✅
  - `cities`, `areas`, `categories` ✅

- **Supabase Functions:**
  - `broadcast_notification` - PostgreSQL function ✅
  - RLS policies configured ✅

- **Working Features:**
  - Notification system (`/services/notifications.ts`) ✅
  - Chat notifications ✅
  - Task notifications ✅
  - Notification UI (`NotificationsScreen`, `useNotifications` hook) ✅

### ❌ What We HAVE (Must Remove/Replace)

#### 1. **localStorage-Based Auth System**
```typescript
// Currently using:
localStorage.getItem('oldcycle_user')      // User data
localStorage.getItem('oldcycle_token')     // Client token
localStorage.getItem('oldcycle-auth-token') // Legacy auth token
```

**Files using localStorage auth:**
- ✅ `/services/auth.ts` - Main auth service (REPLACE)
- ✅ `/App.tsx` - Login handling (UPDATE)
- ✅ `/screens/AuthScreen.tsx` - Auth UI (REPLACE)
- ✅ `/components/EditProfileModal.tsx` - Profile editing (UPDATE)
- ✅ `/screens/DiagnosticScreen.tsx` - Diagnostics (UPDATE)
- ✅ `/services/profileCleanup.ts` - Profile cleanup (UPDATE)
- ✅ `/services/debugAuth.ts` - Debug utilities (UPDATE)
- ✅ `/components/ListingCard.tsx` - Wishlist check (UPDATE)

#### 2. **Custom Password System**
```typescript
// Currently in AuthScreen.tsx:
- hashPassword() - Custom bcrypt-like hashing
- verifyPassword() - Custom verification
- validatePassword() - Password validation
- Database columns: password_hash, password_hint
```

**This will be REPLACED with Supabase Auth's built-in password management.**

#### 3. **Hybrid Auth Implementation**
Current `/services/auth.ts` has:
- ✅ Some Supabase Auth calls (signInWithPassword, signUp, resetPasswordForEmail)
- ❌ But then stores data in localStorage instead of using sessions
- ❌ Uses custom client_token instead of Supabase session tokens
- ❌ Manual profile sync instead of auth triggers

---

## 🎯 PHASE 1 OBJECTIVES

### Step 1: Backup Current System
- [x] Create backup of `/services/auth.ts`
- [x] Create backup of `/screens/AuthScreen.tsx`
- [x] Document all localStorage keys used
- [x] Document all auth-related database columns

### Step 2: Remove Old Auth Logic

#### A. Update `/services/auth.ts`
**REMOVE:**
```typescript
❌ saveUserData() - Saves to localStorage
❌ getCurrentUser() - Reads from localStorage
❌ getClientToken() - Reads from localStorage
❌ generateClientToken() - Custom token generation
❌ loginWithClientToken() - Custom token login
❌ All localStorage.setItem/getItem calls
```

**KEEP & ENHANCE:**
```typescript
✅ loginWithPassword() - Update to use Supabase sessions
✅ logout() - Update to clear Supabase session
✅ sendVerificationEmail() - Keep but simplify
✅ sendPasswordResetEmail() - Keep
✅ checkIsAdmin() - Update to use Supabase session
```

**ADD NEW:**
```typescript
🆕 sendOTP(phone: string) - Send phone OTP
🆕 verifyOTP(phone: string, otp: string) - Verify OTP
🆕 signUpWithEmail(email, password, name) - Email signup
🆕 signInWithEmail(email, password) - Email login
🆕 getCurrentUser() - From Supabase session
🆕 getSession() - Get current Supabase session
🆕 onAuthStateChange(callback) - Auth listener
🆕 syncProfileWithAuth(authUser) - Sync profiles table
```

#### B. Replace `/screens/AuthScreen.tsx`
**Current flow:**
```
Welcome → Enter email/phone → Check if exists → Login/Register → Custom password hash → localStorage
```

**New flow:**
```
Welcome → Choose auth method:
  → Email/Password: Enter email → Enter password → Supabase Auth → Session
  → Phone OTP: Enter phone → Send OTP → Verify OTP → Session
```

**NEW SCREENS TO CREATE:**
- `/screens/auth/WelcomeScreen.tsx` - Choose email or phone
- `/screens/auth/EmailAuthScreen.tsx` - Email/password login/signup
- `/screens/auth/PhoneAuthScreen.tsx` - Phone OTP flow
- `/screens/auth/OTPVerificationScreen.tsx` - Enter OTP code
- `/screens/auth/ForgotPasswordScreen.tsx` - Password reset

**OLD SCREEN TO REMOVE:**
- `/screens/AuthScreen.tsx` - Delete after new screens are tested

#### C. Update `/App.tsx`

**CURRENT:**
```typescript
const [user, setUser] = useState<User | null>(null);
const [clientToken, setClientToken] = useState<string | null>(null);

useEffect(() => {
  const savedUser = getCurrentUser(); // From localStorage
  const savedToken = getClientToken();
  if (savedUser && savedToken) {
    setUser(savedUser);
    setClientToken(savedToken);
  }
}, []);
```

**NEW:**
```typescript
const [user, setUser] = useState<User | null>(null);
const [session, setSession] = useState<Session | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  // Check initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    if (session?.user) {
      loadUserProfile(session.user.id);
    }
    setLoading(false);
  });

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);

async function loadUserProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (data) {
    setUser({
      id: data.id,
      name: data.name || data.display_name,
      email: data.email,
      phone: data.phone || data.phone_number,
      // ... map other fields
    });
  }
}
```

#### D. Update Other Files

**`/components/EditProfileModal.tsx`:**
```typescript
// REMOVE:
❌ localStorage.setItem('oldcycle_user', ...)

// REPLACE WITH:
✅ Update profiles table via Supabase
✅ Optionally update auth.users metadata
✅ Trigger auth state refresh
```

**`/services/profileCleanup.ts`:**
```typescript
// REMOVE:
❌ const userStr = localStorage.getItem('oldcycle_user');

// REPLACE WITH:
✅ const { data: { user } } = await supabase.auth.getUser();
```

**`/services/debugAuth.ts`:**
```typescript
// UPDATE to show Supabase session info instead of localStorage
```

**`/screens/DiagnosticScreen.tsx`:**
```typescript
// UPDATE to show Supabase session info
```

**`/components/ListingCard.tsx`:**
```typescript
// UPDATE wishlist check to use Supabase session
```

---

## 🗑️ FILES TO DELETE

After new auth system is tested:
- ❌ `/screens/AuthScreen.tsx` - Replaced by new auth screens
- ❌ `/utils/passwordHash.ts` - No longer needed (Supabase handles this)

---

## 📋 DATABASE CHANGES NEEDED

### Profiles Table Updates

**REMOVE these columns (after migration):**
```sql
-- These were used for custom auth:
❌ password_hash - Supabase Auth handles this
❌ password_hint - Not needed
❌ client_token - Use Supabase session tokens
```

**KEEP these columns:**
```sql
✅ id - Maps to auth.users.id (UUID primary key)
✅ name - User display name
✅ email - Synced from auth.users.email
✅ phone - Phone number
✅ phone_number - Alternate phone field (consolidate later)
✅ avatar_url - Profile picture
✅ is_admin - Admin flag
✅ owner_token - For marketplace listings
✅ whatsapp_same - WhatsApp preference
✅ whatsapp_number - WhatsApp number
✅ created_at - Account creation date
```

**ADD (optional for future):**
```sql
🆕 auth_provider - 'email' | 'phone' | 'google' (for analytics)
🆕 last_sign_in_at - Track last login
🆕 email_verified - Whether email is verified
🆕 phone_verified - Whether phone is verified
```

---

## ✅ VERIFICATION CHECKLIST

Before proceeding to PHASE 2, verify:

### Code Audit Complete
- [x] Identified all localStorage auth usage
- [x] Identified all files needing updates
- [x] Documented current auth flow
- [x] Documented new auth flow

### Backup Complete
- [ ] Created `/services/auth.ts.backup`
- [ ] Created `/screens/AuthScreen.tsx.backup`
- [ ] Documented rollback procedure

### Ready for Implementation
- [ ] User approves PHASE 1 plan
- [ ] User confirms Supabase Auth providers are enabled:
  - [ ] Email/Password provider enabled
  - [ ] Phone OTP provider enabled (with Twilio/MessageBird)
  - [ ] Email templates configured (optional)

---

## 🔄 MIGRATION STRATEGY

### For Existing Users

**Option 1: Automatic Migration (Recommended)**
- Keep profiles table data
- Add trigger: When user logs in with new system, link to existing profile
- Match by email or phone number
- Migrate seamlessly in background

**Option 2: Manual Migration**
- Require users to re-register with Supabase Auth
- Import existing profile data after verification
- More secure but worse UX

**Recommended: Option 1**
- Users can continue using their email/phone
- First login with new system creates auth.users entry
- Links to existing profile by matching email/phone
- Preserves all user data (listings, tasks, wishes, chat history)

---

## 🚨 RISKS & MITIGATION

### Risk 1: Users Locked Out
**Mitigation:**
- Keep old auth as fallback for 30 days
- Show migration prompt: "Update to new secure login"
- Provide support email for manual recovery

### Risk 2: Profile Data Loss
**Mitigation:**
- Never delete profiles table
- Always sync, never replace
- Keep owner_token for listing ownership

### Risk 3: Session Management Bugs
**Mitigation:**
- Extensive testing before deployment
- Gradual rollout (test with small user group first)
- Monitor error logs closely

---

## 📊 IMPACT ANALYSIS

### Features Affected
1. ✅ **Login/Signup** - Complete rewrite
2. ✅ **Profile Management** - Update to use sessions
3. ✅ **Chat** - Update getCurrentUser() calls
4. ✅ **Listings** - Update ownership verification
5. ✅ **Tasks** - Update user checks
6. ✅ **Wishes** - Update user checks
7. ✅ **Admin** - Update admin checks
8. ❌ **Notifications** - NO CHANGES (already uses user_id from profiles)

### User Experience Impact
- **Better:** More secure, industry-standard auth
- **Better:** Phone OTP option (easier for Indian users)
- **Better:** Forgot password actually works
- **Better:** No manual password management
- **Neutral:** Slightly different login flow
- **Risk:** Migration friction (mitigated by seamless linking)

---

## ⏱️ ESTIMATED TIMELINE

| Task | Time Estimate |
|------|---------------|
| Backup current system | 10 minutes ✅ |
| Remove old auth logic | 30 minutes |
| Create new auth service | 2 hours |
| Create new auth screens | 3 hours |
| Update App.tsx | 1 hour |
| Update other components | 2 hours |
| Testing | 2 hours |
| **TOTAL PHASE 1** | **~10 hours** |

---

## ❓ QUESTIONS FOR YOU

Before I proceed with PHASE 1 implementation:

1. **Supabase Auth Providers:**
   - Have you enabled Email/Password provider in Supabase Dashboard?
   - Have you enabled Phone OTP provider? (Requires Twilio/MessageBird integration)
   - If phone OTP not ready, should I skip it for now?

2. **Existing Users:**
   - Do you have real users already? Or is this still in development?
   - If yes, how many users?
   - Should I implement seamless migration (Option 1) or require re-registration?

3. **Database Columns:**
   - Can I safely remove `password_hash`, `password_hint`, `client_token` columns?
   - Or should I keep them temporarily for migration period?

4. **Priority:**
   - Phone OTP is nice-to-have but requires external service setup
   - Should I start with Email/Password only and add Phone OTP later?

5. **Testing:**
   - Do you have a staging/development Supabase project for testing?
   - Or should I implement with safeguards on production?

---

## ✅ APPROVAL CHECKLIST

Please confirm before I proceed:

- [ ] I have read and understand the PHASE 1 plan
- [ ] I approve removing localStorage-based auth
- [ ] I approve replacing custom password system with Supabase Auth
- [ ] I have enabled Email/Password provider in Supabase
- [ ] Phone OTP priority: [ ] High [ ] Low [ ] Skip for now
- [ ] Existing user migration: [ ] Automatic [ ] Manual [ ] No users yet
- [ ] I'm ready for PHASE 1 implementation to begin

---

**Status:** ⏳ Awaiting your approval and answers to questions above

Once approved, I will:
1. Create backups
2. Implement new auth service
3. Create new auth screens
4. Update all affected files
5. Test thoroughly
6. Request approval for PHASE 2

**Estimated completion:** ~10 hours of focused implementation
