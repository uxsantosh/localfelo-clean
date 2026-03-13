# 🚀 Build LocalFelo Android App - Step by Step

## ✅ Prerequisites Met:
- ✅ Android Studio installed
- ✅ Android device connected

---

## 📱 **Build & Run Android App (5 Steps)**

### **Step 1: Add Android Platform**

Open PowerShell/Terminal in your project folder:

```powershell
# Navigate to project (adjust path if needed)
cd C:\Users\LAPTOPS24\Downloads\LocalFelo

# Add Android platform
npx cap add android
```

**Expected output:**
```
✔ Adding native android project in android in 2.50s
✔ Syncing Gradle
✔ add in 3.73s
✔ Copying web assets from dist to android/app/src/main/assets/public in 1.23s
✔ Creating capacitor.config.json in android/app/src/main/assets in 2ms
✔ copy android in 1.45s
✔ Updating Android plugins in 3ms
✔ sync android in 1.62s
```

**✅ This creates the `android/` folder in your project!**

---

### **Step 2: Build Web App**

```powershell
npm run build
```

**Expected output:**
```
vite build
✓ 1234 modules transformed.
dist/index.html                   1.23 kB │ gzip:  0.45 kB
dist/assets/index-[hash].js     234.56 kB │ gzip: 67.89 kB
✓ built in 5.67s
```

**✅ This creates the `dist/` folder with your compiled app!**

---

### **Step 3: Sync Capacitor**

```powershell
npx cap sync
```

**Expected output:**
```
✔ Copying web assets from dist to android/app/src/main/assets/public in 1.23s
✔ Creating capacitor.config.json in android/app/src/main/assets in 2ms
✔ copy android in 1.45s
✔ Updating Android plugins in 3ms
  Found 6 Capacitor plugins for android:
    @capacitor/android@6.0.0
    @capacitor/app@6.0.0
    @capacitor/core@6.0.0
    @capacitor/device@6.0.0
    @capacitor/geolocation@6.0.0
    @capacitor/preferences@6.0.0
    @capacitor/push-notifications@6.0.0
✔ Updating Gradle
✔ sync android in 1.62s
```

**✅ This installs all Capacitor plugins into Android project!**

---

### **Step 4: Open Android Studio**

```powershell
npx cap open android
```

**What happens:**
- Android Studio opens automatically
- Opens the `android/` folder as a project
- Gradle starts syncing (wait 2-5 minutes)
- Watch bottom-right status bar for "Gradle Build Running..."

**⚠️ IMPORTANT: Let Gradle finish syncing before running!**

---

### **Step 5: Run on Device**

**In Android Studio:**

1. **Check device is detected:**
   - Top toolbar → Device dropdown
   - Should show your phone model (e.g., "Samsung Galaxy A52")
   - If not visible, check USB debugging is enabled

2. **Click the green "Run" button** ▶️
   - Or press `Shift + F10`

3. **First build takes 2-5 minutes** (downloads dependencies)
   - Watch "Build" panel at bottom
   - Wait for: `BUILD SUCCESSFUL in 3m 45s`

4. **App installs and launches on your phone!** 📱

---

## 🔍 **Debug Push Notifications**

### **Once app is running on phone:**

### **Step A: Connect Chrome DevTools**

1. **On your PC, open Chrome**
2. **Go to:** `chrome://inspect/#devices`
3. **Wait 5-10 seconds**
4. **You should see:**
   ```
   Samsung Galaxy A52 (or your device name)
     LocalFelo (com.localfelo.app)
       inspect
   ```
5. **Click "inspect"** → Opens DevTools for your app!

---

### **Step B: Check Console Logs**

**In the DevTools Console tab, you should NOW see:**

```javascript
[usePushNotifications] Hook called with userId: 56d9bf39...
[usePushNotifications] Push support check: { supported: true, permission: 'prompt' }
[usePushNotifications] User is authenticated, starting registration
[usePushNotifications] Attempting push registration for user: 56d9bf39...
[usePushNotifications] Requesting Capacitor location...
📍 [getCurrentPosition] Platform: Capacitor (Mobile)
📍 [getCurrentPosition] Requesting Capacitor location...
📍 [getCurrentPosition] Current permissions: granted
✅ [getCurrentPosition] Capacitor position obtained: { lat: ..., lng: ..., accuracy: ... }
[usePushNotifications] Registering for push notifications on native platform
```

**Then EITHER:**

**SUCCESS:**
```javascript
✅ [usePushNotifications] FCM token received: eF3kL9m2P...
[usePushNotifications] Storing push token in database
✅ Token stored in device_tokens table: { platform: "android", rowId: "abc123..." }
✅ Push notifications registered successfully
```

**OR ERROR:**
```javascript
❌ Database error: { message: "...", code: "..." }
```

---

### **Step C: If You See Database Error**

**Most common errors:**

#### **Error 1: "relation device_tokens does not exist"**

**Fix:** Run this in Supabase SQL Editor:

```sql
-- Create device_tokens table
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_device_tokens_token 
  ON device_tokens(device_token);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id 
  ON device_tokens(user_id);

ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own device tokens"
  ON device_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own device tokens"
  ON device_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own device tokens"
  ON device_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own device tokens"
  ON device_tokens FOR DELETE
  USING (auth.uid() = user_id);
```

**Then restart the app on your phone.**

---

#### **Error 2: "new row violates row-level security policy"**

**Fix:** Add SELECT policy (allows upsert to return data):

```sql
CREATE POLICY "Users can read own device tokens"
  ON device_tokens FOR SELECT
  USING (auth.uid() = user_id);
```

---

#### **Error 3: "No data returned from upsert"**

**Fix:** Same as Error 2 - missing SELECT policy.

---

## 🎯 **Verify FCM Token is Saved**

**Run in Supabase SQL Editor:**

```sql
-- Check if tokens are being saved
SELECT 
  id,
  user_id,
  device_token,
  platform,
  device_name,
  device_model,
  is_enabled,
  created_at
FROM device_tokens
ORDER BY created_at DESC
LIMIT 10;
```

**Expected result:**
```
id: abc123...
user_id: 56d9bf39-383a-49cd-a1a3-8593dbcd1f8d
device_token: eF3kL9m2P... (long string)
platform: android
device_name: Samsung Galaxy A52
is_enabled: true
created_at: 2025-03-03 10:30:45
```

**If you see a row**, FCM tokens are saving! ✅

---

## 🐛 **Troubleshooting**

### **Issue: "Android folder already exists"**

**If you already ran `npx cap add android` before:**

```powershell
# Remove old Android folder
Remove-Item -Recurse -Force android

# Add fresh Android platform
npx cap add android
npm run build
npx cap sync
```

---

### **Issue: "Device not showing in Android Studio"**

**On your phone:**
1. Settings → About Phone → Tap "Build Number" 7 times
2. Settings → Developer Options → Enable "USB Debugging"
3. Disconnect and reconnect USB cable
4. Accept "Allow USB Debugging" prompt on phone

**In Android Studio:**
1. Tools → SDK Manager → SDK Tools tab
2. Check "Google USB Driver" (if Windows)
3. Click Apply

---

### **Issue: "Gradle sync failed"**

**Common causes:**
- No internet connection
- Firewall blocking Gradle downloads
- Antivirus blocking Android Studio

**Fix:**
1. Check internet connection
2. Wait longer (first sync can take 10 minutes)
3. File → Invalidate Caches / Restart
4. Try again

---

### **Issue: "App crashes on launch"**

**Check Logcat in Android Studio:**
1. View → Tool Windows → Logcat
2. Look for red error messages
3. Share error with me

**Common causes:**
- Missing permissions in AndroidManifest.xml
- Capacitor plugins not synced
- Web build not copied to android/ folder

**Fix:**
```powershell
npm run build
npx cap sync
# Then rebuild in Android Studio
```

---

## 📊 **Success Indicators**

### **✅ You'll know it's working when you see:**

**On Phone:**
- App launches successfully
- Can login with WhatsApp OTP
- Location detection works with GPS
- Can browse marketplace, wishes, tasks

**In Chrome DevTools Console:**
- `[usePushNotifications] Hook called with userId: ...` ✅
- `✅ FCM token received: ...` ✅
- `✅ Token stored in device_tokens table` ✅
- `✅ Push notifications registered successfully` ✅

**In Supabase Database:**
- Row in `device_tokens` table with your user_id ✅
- Platform shows "android" ✅
- Device token is a long alphanumeric string ✅

---

## 🚀 **Next Steps After Success**

Once push notifications are working:

1. **Test sending a push notification:**
   - Have someone message you in chat
   - Check if notification appears on phone
   - Check notification badge on app icon

2. **Test location accuracy:**
   - Use "Current Location" button
   - Should show 10-20m accuracy (GPS)
   - Much better than browser WiFi location!

3. **Test all features:**
   - Create marketplace listing with photo
   - Post a task
   - Post a wish
   - Chat with someone
   - Check notifications

---

## ✅ **Quick Commands Reference**

```powershell
# Full rebuild workflow
npm run build && npx cap sync && npx cap open android

# Just sync changes (after code edit)
npm run build && npx cap sync

# View Android logs from command line
npx cap run android --livereload
```

---

## 📞 **Need Help?**

After running the steps, share with me:

1. **Output of Step 1** (`npx cap add android`)
2. **Output of Step 3** (`npx cap sync`)
3. **Console logs from Chrome DevTools** (after app launches)
4. **Any error messages** from Android Studio

I'll help debug! 🔧

---

**Ready to start?** 

Just copy and paste the commands one by one! 🚀

**Start with:**
```powershell
npx cap add android
```
