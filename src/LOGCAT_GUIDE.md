# 📊 How to Use Logcat in Android Studio

## **Method 1: Logcat Window (Recommended)**

### **Step 1: Open Logcat**
In Android Studio:
- **View** → **Tool Windows** → **Logcat**
- Or press: **Alt + 6** (Windows) / **Cmd + 6** (Mac)

### **Step 2: Filter to Your App Only**

In the Logcat window, you'll see several dropdowns:

**Dropdown 1: Select Device**
- Choose your phone (e.g., "Samsung Galaxy A52")

**Dropdown 2: Select Process**
- Choose "com.localfelo.app" (your app package)

**Dropdown 3: Log Level**
- Choose "Verbose" (shows ALL logs)
- Or "Debug" (shows debug logs and higher)

**Dropdown 4: Filter**
- Type: `Capacitor` to see only Capacitor logs
- Or type: `console` to see console.log messages
- Or leave empty to see all logs

---

## **Step 3: Look for Push Notification Logs**

Search for these tags in Logcat:

### **Filter by Tag:**

**1. Firebase Cloud Messaging:**
```
Tag: FCM
```
Expected logs:
```
D/FCM: Token received: eF3kL9m2P...
D/FCM: Registering device token
```

**2. Capacitor Push Notifications:**
```
Tag: PushNotifications
```
Expected logs:
```
D/PushNotifications: Registration succeeded, token: eF3kL9m2P...
I/PushNotifications: Requesting notification permission
```

**3. Capacitor Console Logs:**
```
Tag: Capacitor/Console
```
This shows ALL your console.log() messages from JavaScript!

**4. Your App Logs:**
```
Tag: chromium
```
Shows JavaScript console logs

---

## **Step 4: Copy Relevant Logs**

**How to copy:**
1. Right-click on a log line
2. Select "Copy" → "Copy All"
3. Paste into a text file

**Or:**
- Select multiple lines with Shift+Click
- Right-click → Copy

---

## **What to Look For:**

### **✅ SUCCESS - You should see:**

```
D/PushNotifications: Registration succeeded, token: eF3kL9m2P8qK4...
I/Capacitor/Console: [usePushNotifications] Hook called with userId: 56d9bf39...
I/Capacitor/Console: ✅ FCM token received: eF3kL9m2P8qK4...
I/Capacitor/Console: ✅ Token stored in device_tokens table
D/FCM: Token refreshed
```

### **❌ ERROR - Watch out for:**

```
E/PushNotifications: Registration failed: ...
E/Capacitor/Console: ❌ Database error: ...
W/FirebaseMessaging: Missing google-services.json
E/FCM: Error getting FCM token
```

---

## **Method 2: Search in Logcat**

### **Use the Search Box:**

In Logcat window, top-right corner:

**Search for:**
```
usePushNotifications
```
Shows all push notification related logs from your React app

**Or search:**
```
FCM token
```
Shows Firebase token logs

**Or search:**
```
device_tokens
```
Shows database insert logs

---

## **Method 3: Export Logs to File**

**To save all logs:**

1. In Logcat window, right-click anywhere
2. **Save As...** → Choose location
3. Save as: `localfelo-android-logs.txt`
4. Share the file with me!

---

## **Pro Tips:**

### **Clear Logs Before Testing:**

In Logcat window:
- Click the **trash can icon** 🗑️ (top-left)
- Or right-click → **Clear All**
- Then restart your app
- Now you only see fresh logs!

### **Pause/Resume Auto-Scroll:**

- Click the **pause icon** ⏸️ to stop auto-scroll
- Helps when logs are flying by too fast

### **Filter by Priority:**

- **Verbose (V):** Everything (noisy)
- **Debug (D):** Debug info (recommended)
- **Info (I):** Important info
- **Warn (W):** Warnings only
- **Error (E):** Errors only (start here if app crashes)

---

## **Quick Command to Run:**

### **In Your App (on phone), Open Chrome DevTools Console:**

Run this to trigger push notification logs:

```javascript
// This will force re-registration
window.location.reload();
```

**Then check Logcat for:**
```
I/Capacitor/Console: [usePushNotifications] Hook called...
```

---

## **Common Logcat Filters:**

**See ONLY errors:**
```
level:ERROR
```

**See push notification + FCM logs:**
```
tag:PushNotifications|FCM
```

**See Capacitor console logs:**
```
tag:Capacitor/Console
```

**See database queries:**
```
Supabase
```

---

## **Screenshot: What Logcat Looks Like**

```
┌─────────────────────────────────────────────────────────┐
│ Logcat                                          ⏸ 🗑️ ⚙️│
├─────────────────────────────────────────────────────────┤
│ Device: Samsung Galaxy A52  │ Process: com.localfelo.app│
│ Level: Verbose             │ Filter: _________________ │
├──────┬────────┬─────────────────────────────────────────┤
│ Time │  Tag   │              Message                    │
├──────┼────────┼─────────────────────────────────────────┤
│10:30 │  I/Cap │ [usePushNotifications] Hook called...  │
│10:30 │  D/FCM │ Token received: eF3kL9m2P...           │
│10:30 │  I/Cap │ ✅ FCM token received                  │
│10:30 │  I/Cap │ ✅ Token stored in device_tokens       │
└──────┴────────┴─────────────────────────────────────────┘
```

---

## **Next Steps:**

1. Open Logcat (Alt + 6)
2. Clear logs (trash icon)
3. Restart your app on phone
4. Filter by: `Capacitor/Console`
5. Copy the first 50 lines
6. Share with me!

---
