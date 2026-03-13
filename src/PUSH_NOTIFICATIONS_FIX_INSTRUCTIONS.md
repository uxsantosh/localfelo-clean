# 🔧 PUSH NOTIFICATIONS FIX - Deployment Instructions

## 📋 Problem Summary
Push notification tokens are NOT being saved to the database because:
- ❌ Users are logged in via **localStorage** (fake auth)
- ❌ NO real Supabase session exists
- ❌ Push notifications **require** a Supabase session to save tokens

## ✅ Solution Applied
Added code to create **real Supabase sessions** after login for:
1. **New users** - After account creation (PhoneAuthScreen.tsx lines 350-384)
2. **Returning users** - After password login (PhoneAuthScreen.tsx lines 199-230)

The fix calls the `verify-otp` edge function with `skipOtpCheck: true` to generate auth tokens, then calls `supabase.auth.setSession()` to store them in Capacitor Preferences.

---

## 🚀 DEPLOYMENT STEPS

### **STEP 1: Copy Code from Figma Make to VS Code**

1. **Open VS Code** on your computer
2. **Navigate to your LocalFelo project folder**
3. **Copy the following 2 files** from Figma Make to VS Code (overwrite existing files):

   📁 **File 1:** `/screens/PhoneAuthScreen.tsx`
   📁 **File 2:** `/supabase/functions/verify-otp/index.ts`

   **How to copy:**
   - In Figma Make: Select all content from each file (Ctrl+A / Cmd+A)
   - In VS Code: Open the same file and paste (Ctrl+V / Cmd+V)
   - **Save** both files (Ctrl+S / Cmd+S)

---

### **STEP 2: Deploy Edge Function to Supabase**

1. **Open Terminal/Command Prompt in VS Code** (View → Terminal)

2. **Navigate to your project root:**
   ```bash
   cd /path/to/LocalFelo
   ```

3. **Deploy the updated edge function:**
   ```bash
   npx supabase functions deploy verify-otp
   ```

4. **Wait for deployment to complete** - You should see:
   ```
   ✅ Function verify-otp deployed successfully
   ```

---

### **STEP 3: Sync Changes to Android Studio**

1. **In VS Code Terminal, run:**
   ```bash
   npm run build
   ```
   *(Wait for build to complete - should take 30-60 seconds)*

2. **Copy the build to Android:**
   ```bash
   npx cap sync android
   ```
   *(This copies the updated JavaScript to the Android project)*

3. **Verify files were synced:**
   ```
   ✅ Syncing web assets to android/app/src/main/assets/public
   ✅ Synced successfully!
   ```

---

### **STEP 4: Rebuild and Deploy Android App**

1. **Open Android Studio** (if not already open)

2. **Click "Sync Project with Gradle Files"** (elephant icon in toolbar)
   - *Wait for Gradle sync to complete*

3. **Build → Rebuild Project**
   - *This ensures all changes are compiled*

4. **Connect your Android device via USB** (or use emulator)

5. **Click "Run"** (green play button) or press `Shift+F10`
   - *Android Studio will build and install the updated APK*

6. **Wait for installation to complete**

---

### **STEP 5: Test on Android Device**

#### **5A: Clear Old Session**

1. **Connect phone to computer via USB**

2. **Open Chrome** on computer → Navigate to: `chrome://inspect/#devices`

3. **Click "inspect"** under your LocalFelo app

4. **In Console tab, run:**
   ```javascript
   localStorage.clear()
   ```

5. **Force close the app** on your phone (swipe away from recent apps)

6. **Reopen LocalFelo**

---

#### **5B: Login with Real Auth**

1. **You should see the LOGIN screen** (not auto-logged in)

2. **Enter phone:** `+919632349239`

3. **Complete WhatsApp OTP verification**

4. **Enter password** (returning user) OR **create account** (new user)

---

#### **5C: Verify Supabase Session Created**

1. **In Chrome DevTools Console, run:**
   ```javascript
   Capacitor.Plugins.Preferences.keys().then(result => console.log('ALL KEYS:', result.keys))
   ```

2. **You should NOW see:**
   ```javascript
   ALL KEYS: ['sb-drofnrntrbedtjtpseve-auth-token', ...]
   ```
   ✅ **If you see Supabase keys → SUCCESS!**

---

#### **5D: Verify Push Token Saves to Database**

1. **In Chrome DevTools Console, run:**
   ```javascript
   Capacitor.Plugins.PushNotifications.register()
   ```

2. **Watch for these logs:**
   ```
   [usePushNotifications] ✅ FCM token received: eBVn...
   [usePushNotifications] Storing push token in database
   ✅ Token stored in device_tokens table
   ```

3. **Verify in Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Open your project → Table Editor → `device_tokens`
   - **You should see a new row** with:
     - `user_id`: a1111111-1111-1111-1111-111111111111
     - `token`: eBVn... (FCM token)
     - `platform`: android

---

## ✅ SUCCESS CRITERIA

You'll know it's working when:

1. ✅ `Capacitor.Plugins.Preferences.keys()` shows Supabase auth tokens
2. ✅ Push notification logs show "✅ Token stored in device_tokens table"
3. ✅ Supabase `device_tokens` table has a new row with your user_id and FCM token

---

## 🚨 TROUBLESHOOTING

### **If Step 5C fails (no Supabase keys):**

**Run this in Chrome DevTools Console:**
```javascript
// Check for errors
Capacitor.Plugins.Preferences.get({ key: 'sb-drofnrntrbedtjtpseve-auth-token' }).then(result => console.log('TOKEN:', result.value))
```

If it says `null`, the session wasn't created. Check VS Code Terminal for errors during login.

---

### **If Step 5D fails (token not saved):**

**Check logs in Chrome DevTools Console:**
```javascript
// Look for this specific error:
"❌ [usePushNotifications] Failed to store token: User is not authenticated"
```

If you see this, repeat Step 5A (clear localStorage and re-login).

---

## 📞 WHAT TO SHARE IF IT DOESN'T WORK

If any step fails, share:

1. **Screenshot of Step 5C result** (Capacitor.Plugins.Preferences.keys())
2. **Screenshot of Step 5D logs** (push notification registration)
3. **Any error messages** from Chrome DevTools Console
4. **Any error messages** from VS Code Terminal during deployment

---

## 🎯 EXPECTED TIMELINE

- Step 1 (Copy files): **2 minutes**
- Step 2 (Deploy edge function): **1 minute**
- Step 3 (Sync to Android): **2 minutes**
- Step 4 (Rebuild in Android Studio): **3-5 minutes**
- Step 5 (Test on device): **3 minutes**

**Total: ~10-15 minutes**

---

**Ready to start? Begin with STEP 1!** 🚀
