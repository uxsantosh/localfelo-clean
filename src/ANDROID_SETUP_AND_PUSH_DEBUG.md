# 🔧 Android Setup & Push Notifications Debug Guide

## 📊 Current Project Status

### ✅ **What's Working:**
- LocalFelo app with 3 core features (Marketplace, Wishes, Tasks)
- WhatsApp OTP authentication (migrated from SMS)
- Geoapify location search with Capacitor Geolocation for mobile
- Infinite scroll across all screens
- Flat design with bright green (#CDFF00) accents
- Database with latitude/longitude/address fields

### ⚠️ **Current Issue:**
- **Push notifications not saving FCM tokens to Supabase** on Android devices
- **Android platform not yet added** to Capacitor project
- **Android Studio not installed** (required for testing)

---

## 🎯 **Root Cause Analysis**

### **Error:** `npx cap open android` fails
```
npm error could not determine executable to run
```

### **Why:**
1. ❌ Android platform NOT added to project yet
2. ❌ Android Studio NOT installed on your PC
3. ⚠️ Push notifications hook can't be tested without native Android app

### **Database Table Confusion:**
Your codebase has TWO push notification table schemas:
- `/supabase/migrations/001_push_notifications.sql` → Creates `push_tokens` table
- `/database/migrations/fix_device_tokens_policies.sql` → References `device_tokens` table
- `/hooks/usePushNotifications.ts` → **Uses `device_tokens`** ✅

**Current Status:** Need to verify which table exists in your Supabase database!

---

## 🚀 **SOLUTION - 3 Options**

Choose based on your current setup:

---

## **Option 1: Full Android Setup (Recommended for Production)**

### **Prerequisites:**
1. **Install Android Studio** (10-15 minutes)
   - Download: https://developer.android.com/studio
   - Install location: `C:\Program Files\Android\Android Studio`
   - During install, select:
     - ✅ Android SDK
     - ✅ Android SDK Platform-Tools
     - ✅ Android Virtual Device (AVD)

2. **Install Java JDK** (if not already installed)
   - Download: https://adoptium.net/
   - Install Java 11 or higher

### **Step-by-Step Setup:**

#### **1. Add Android Platform**
```powershell
# Navigate to project root
cd C:\Users\LAPTOPS24\Downloads\LocalFelo

# Add Android platform (creates android/ folder)
npx cap add android
```

**Expected output:**
```
✔ Adding native android project in android in 2.50s
✔ add in 3.73s
```

#### **2. Verify Geolocation Plugin is Installed**
```powershell
# Check if installed
npm list @capacitor/geolocation

# If not installed, add it:
npm install @capacitor/geolocation@^6.0.0
```

#### **3. Build Web App**
```powershell
npm run build
```

#### **4. Sync Capacitor**
```powershell
npx cap sync
```

**This will:**
- Copy web build to `android/app/src/main/assets/public`
- Install all Capacitor plugins (Geolocation, Push Notifications, etc.)
- Update Android project dependencies

#### **5. Open Android Studio**
```powershell
npx cap open android
```

**First-time setup (wait 5-10 minutes):**
- Android Studio will open
- Gradle will sync dependencies (watch bottom status bar)
- Let it download all Android SDK components
- Don't interrupt this process!

#### **6. Configure Android Device**

**Option A: Physical Device (Recommended)**
1. Enable USB Debugging:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"
2. Connect phone via USB
3. Accept "Allow USB Debugging" prompt on phone
4. In Android Studio, select your device from dropdown
5. Click green Run button ▶️

**Option B: Emulator**
1. In Android Studio: Tools → Device Manager
2. Click "Create Device"
3. Select "Pixel 5" or similar
4. Select System Image (API 33 recommended)
5. Download if needed
6. Finish setup
7. Launch emulator
8. Click Run button ▶️

#### **7. Test Push Notifications**

Once app is running on device:

1. **Open Chrome DevTools** (for debugging):
   - On PC: Open Chrome → `chrome://inspect/#devices`
   - Find "LocalFelo" under your device
   - Click "inspect"

2. **Check Console Logs:**
```javascript
// You should see:
[usePushNotifications] Hook called with userId: <user-id>...
[usePushNotifications] Push support check: { supported: true, ... }
[usePushNotifications] Requesting Capacitor location...
✅ FCM token received: <token>...
[usePushNotifications] Storing push token in database
```

3. **Check for Errors:**
```javascript
// If you see this:
❌ Database error: { message: "...", code: "..." }

// Then there's a database/RLS issue (see Option 2 below)
```

---

## **Option 2: Debug Push Notifications Database Issue (FIRST!)**

**Before setting up Android**, let's verify your database is ready:

### **Step 1: Check Which Table Exists**

Run in **Supabase SQL Editor**:

```sql
-- Check if device_tokens table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'device_tokens'
) AS device_tokens_exists;

-- Check if push_tokens table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'push_tokens'
) AS push_tokens_exists;
```

### **Step 2: If Neither Table Exists - Create It**

Run in **Supabase SQL Editor**:

```sql
-- =====================================================
-- Create device_tokens Table (Used by usePushNotifications hook)
-- =====================================================

CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  device_name TEXT,
  device_model TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_tokens_token 
  ON device_tokens(device_token);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id 
  ON device_tokens(user_id);

-- Enable RLS
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Drop any old/duplicate policies
-- =====================================================
DROP POLICY IF EXISTS "Users can insert own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Users can read own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Users can update own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Users can delete own device tokens" ON device_tokens;

-- =====================================================
-- Create RLS Policies (CRITICAL for token storage)
-- =====================================================

-- INSERT: Users can insert their own tokens
CREATE POLICY "Users can insert own device tokens"
  ON device_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- SELECT: Users can read their own tokens (needed for upsert to return data)
CREATE POLICY "Users can read own device tokens"
  ON device_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- UPDATE: Users can update their own tokens (needed for upsert)
CREATE POLICY "Users can update own device tokens"
  ON device_tokens
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own tokens
CREATE POLICY "Users can delete own device tokens"
  ON device_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Grant permissions to authenticated users
-- =====================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON device_tokens TO authenticated;
```

### **Step 3: Verify RLS Policies**

```sql
-- Check RLS policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'device_tokens'
ORDER BY cmd, policyname;

-- Should show 4 policies:
-- 1. "Users can delete own device tokens" (DELETE)
-- 2. "Users can insert own device tokens" (INSERT)
-- 3. "Users can read own device tokens" (SELECT)
-- 4. "Users can update own device tokens" (UPDATE)
```

### **Step 4: Test Insert Manually**

Get your user ID first:
```sql
-- Get current authenticated user (run while logged in to app)
SELECT auth.uid() AS my_user_id;
```

Then test insert:
```sql
-- Replace <YOUR_USER_ID> with actual UUID from above
INSERT INTO device_tokens (
  user_id,
  device_token,
  platform,
  is_enabled
) VALUES (
  '<YOUR_USER_ID>',
  'test_token_manual_12345',
  'android',
  true
);

-- Check if it worked
SELECT * FROM device_tokens ORDER BY created_at DESC LIMIT 5;
```

**If this fails**, check error message and fix RLS policies.

---

## **Option 3: Test in Browser First (Limited)**

You can test the app without Android Studio, but **push notifications won't work**:

### **Run Development Server:**
```powershell
npm run dev
```

Open: http://localhost:5173

### **What You Can Test:**
- ✅ Login/Register (WhatsApp OTP)
- ✅ Marketplace, Wishes, Tasks
- ✅ Location search (browser geolocation)
- ✅ Chat
- ✅ Profile
- ✅ Admin panel

### **What WON'T Work:**
- ❌ Push notifications (native-only)
- ❌ High-accuracy GPS (no Capacitor Geolocation)
- ❌ Android back button
- ❌ Native camera/file picker

---

## 🐛 **Debugging Push Notifications**

### **Common Issues & Solutions:**

#### **Issue 1: "No data returned from upsert"**
**Cause:** RLS SELECT policy missing or blocking

**Solution:**
```sql
-- Add SELECT policy (allows .select() to return data)
CREATE POLICY "Users can read own device tokens"
  ON device_tokens
  FOR SELECT
  USING (auth.uid() = user_id);
```

#### **Issue 2: "Permission denied for table device_tokens"**
**Cause:** User not authenticated or auth.uid() is NULL

**Solution:**
1. Check if user is logged in: `console.log('User ID:', user?.id)`
2. Verify Supabase session: `supabase.auth.getSession()`
3. Check RLS policies use `auth.uid()` not `user_id`

#### **Issue 3: FCM token not generated**
**Cause:** Running in web browser (not native app)

**Solution:** Only test on real Android device or emulator via Android Studio

#### **Issue 4: "Capacitor Geolocation not available"**
**Cause:** Plugin not installed or not synced

**Solution:**
```powershell
npm install @capacitor/geolocation@^6.0.0
npx cap sync
```

---

## 📱 **Testing Checklist**

### **Before Building Android App:**
- [ ] Database `device_tokens` table created
- [ ] RLS policies added (INSERT, SELECT, UPDATE, DELETE)
- [ ] Test manual insert works in Supabase SQL Editor
- [ ] `@capacitor/geolocation` installed

### **Android Studio Setup:**
- [ ] Android Studio downloaded and installed
- [ ] Java JDK installed
- [ ] Android platform added: `npx cap add android`
- [ ] Web app built: `npm run build`
- [ ] Capacitor synced: `npx cap sync`
- [ ] Android Studio opened: `npx cap open android`

### **On Device Testing:**
- [ ] USB Debugging enabled on phone
- [ ] Device connected and recognized
- [ ] App installed and running
- [ ] Chrome DevTools connected: `chrome://inspect/#devices`
- [ ] Console shows FCM token received
- [ ] Token saved to Supabase (check console logs)
- [ ] Verify in database: `SELECT * FROM device_tokens;`

---

## 🎯 **Recommended Next Steps**

### **If You Have Time (Full Setup):**
1. Install Android Studio
2. Add Android platform: `npx cap add android`
3. Fix database (run SQL from Option 2)
4. Build and test on Android device
5. Verify FCM tokens are saved

### **If You Need Quick Answer (Debug Database First):**
1. Run SQL queries from **Option 2**
2. Fix `device_tokens` table and RLS policies
3. Test manual insert
4. Once database works, proceed with Android setup later

### **If Just Exploring (Browser Testing):**
1. Run `npm run dev`
2. Test all features except push notifications
3. Plan Android setup for later

---

## 📊 **What to Check in Console**

### **Expected Console Logs (Success):**
```
[usePushNotifications] Hook called with userId: abc12345...
[usePushNotifications] Push support check: { supported: true, permission: 'prompt' }
[usePushNotifications] Requesting Capacitor location...
[usePushNotifications] Current permissions: granted
✅ [usePushNotifications] FCM token received: eF3kL9...
[usePushNotifications] Storing push token in database
[usePushNotifications] Attempting upsert with data: { user_id: "abc...", platform: "android", ... }
✅ Token stored in device_tokens table: { platform: "android", rowId: "xyz..." }
✅ Push notifications registered successfully
```

### **Error Logs (Database Issue):**
```
❌ Database error: {
  message: "new row violates row-level security policy for table \"device_tokens\"",
  code: "42501"
}
```
**Solution:** RLS policy missing or incorrect

```
❌ No data returned from upsert - row may not have been inserted/updated
```
**Solution:** Missing SELECT policy

---

## 🚀 **Quick Decision Tree**

```
Do you have Android Studio installed?
├─ NO → Install it first (10-15 min) OR test in browser only
└─ YES ↓

    Have you added Android platform?
    ├─ NO → Run: npx cap add android
    └─ YES ↓

        Does device_tokens table exist in Supabase?
        ├─ NO → Run SQL from Option 2
        └─ YES ↓

            Can you insert test token manually?
            ├─ NO → Fix RLS policies (Option 2)
            └─ YES ↓

                Build and test on Android device!
                ✅ You're ready to debug push notifications
```

---

## 📞 **Need Help?**

Run these diagnostic commands and share the output:

```powershell
# 1. Check Node/NPM versions
node --version
npm --version

# 2. Check Capacitor CLI
npx cap --version

# 3. Check if Android folder exists
Test-Path android

# 4. Check installed packages
npm list @capacitor/geolocation
npm list @capacitor/push-notifications
npm list @capacitor/cli

# 5. Check Android Studio
Test-Path "C:\Program Files\Android\Android Studio\bin\studio64.exe"
```

Paste the output and I'll help you debug further!

---

## ✅ **Summary**

**What You Need:**
1. ✅ Android Studio installed
2. ✅ Android platform added: `npx cap add android`
3. ✅ Database table `device_tokens` created with RLS policies
4. ✅ Physical Android device with USB Debugging

**Once Setup:**
- Push notifications will save FCM tokens
- Location detection will use high-accuracy GPS
- Full native app experience

**Current Workaround:**
- Test in browser: `npm run dev`
- Manually verify database setup
- Plan Android testing for later

---

**Status:** Ready to proceed! Choose your option above. 🚀
