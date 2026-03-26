# 🔧 FIX: Google Maps Domain Not Authorized

## ❌ Current Error

```
RefererNotAllowedMapError
Your site URL to be authorized: 
https://3ea37aa6-e9f3-4500-a9b0-f86df9b6a6a2-v2-figmaiframepreview.figma.site/tasks
```

**What this means:** Your Google Maps API key has domain restrictions, and Figma's preview domain is not whitelisted.

---

## ✅ **QUICK FIX (Choose One Option)**

---

### **OPTION 1: Whitelist Figma Domains (Recommended for Testing)**

#### **Step 1: Go to Google Cloud Console**
1. Open: https://console.cloud.google.com/
2. Sign in with your Google account

#### **Step 2: Navigate to API Credentials**
1. Click **"APIs & Services"** in left menu
2. Click **"Credentials"**
3. Find your API key: `AIzaSyBngqhmkgNlxluFzOdOtbGVVrGYSPfHuUA`
4. Click on the API key name

#### **Step 3: Add Figma Domains**
Under **"Website restrictions"**:

Add these domains (one per line):
```
*.figma.com/*
*.figma.site/*
*figmaiframepreview.figma.site/*
https://*figmaiframepreview.figma.site/*
```

**Screenshot locations:**
- Look for "Application restrictions"
- Select "HTTP referrers (web sites)"
- Click "+ ADD AN ITEM"
- Paste each domain pattern

#### **Step 4: Save and Wait**
1. Click **"Save"** button
2. Wait **5-10 minutes** for changes to propagate
3. Hard refresh your browser (Ctrl+Shift+R)

---

### **OPTION 2: Remove All Restrictions (TESTING ONLY - Not Secure!)**

⚠️ **WARNING:** Only use this for local development/testing. NOT for production!

#### **Steps:**
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your API key
4. Under **"Application restrictions"**:
   - Select **"None"** (instead of "HTTP referrers")
5. Click **"Save"**
6. Wait 5-10 minutes
7. Hard refresh browser (Ctrl+Shift+R)

**⚠️ Security Note:** This makes your API key public and anyone can use it. Only use for testing!

---

### **OPTION 3: Create a New Unrestricted Key (For Testing)**

#### **Steps:**
1. Go to Google Cloud Console
2. **APIs & Services** → **Credentials**
3. Click **"+ CREATE CREDENTIALS"** → **"API key"**
4. Copy the new API key
5. Click **"RESTRICT KEY"**
6. Name it: "LocalFelo - Development (Unrestricted)"
7. Under **"Application restrictions"**: Select **"None"**
8. Under **"API restrictions"**: 
   - Select "Restrict key"
   - Check:
     - ✅ Maps JavaScript API
     - ✅ Places API
     - ✅ Geocoding API
9. Click **"Save"**
10. Replace the API key in `/config/maps.ts`

---

## 📋 **After Whitelisting - Verify Setup**

### **Step 1: Clear Browser Cache**
- Press **Ctrl+Shift+R** (hard refresh)
- Or clear all browser cache

### **Step 2: Check Console**
Open F12 console, you should see:
```
✅ Google Maps script loaded successfully
✅ Google Maps fully loaded and ready
✅ Google Map initialized successfully
```

**NO MORE** `RefererNotAllowedMapError` ❌

### **Step 3: Check Map**
- ✅ Google Maps tiles visible
- ✅ Satellite toggle works
- ✅ Google logo visible
- ✅ No red error overlays

---

## 🎯 **Current Allowed Domains (Example)**

If you go to your API key settings, it should look like:

```
Application restrictions: HTTP referrers (web sites)

Accept requests from these HTTP referrers:
┌─────────────────────────────────────────────┐
│ *.figma.com/*                               │
│ *.figma.site/*                              │
│ *figmaiframepreview.figma.site/*            │
│ localhost/*                                 │
│ 127.0.0.1/*                                 │
└─────────────────────────────────────────────┘
```

---

## ⏱️ **How Long Does It Take?**

After saving changes:
- **Minimum:** 1-2 minutes
- **Typical:** 5-10 minutes
- **Maximum:** Up to 30 minutes (rare)

💡 **Tip:** Keep refreshing every 2-3 minutes to check if it's working.

---

## 🔍 **How to Check Current Restrictions**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your key: `AIzaSyBngqhmkgNlxluFzOdOtbGVVrGYSPfHuUA`
3. Click on it
4. Scroll to **"Application restrictions"**
5. You'll see either:
   - **"None"** = Unrestricted (works everywhere but less secure)
   - **"HTTP referrers"** = Restricted to specific domains (more secure)

---

## 📸 **Visual Guide**

### **Google Cloud Console Steps:**

1. **Navigate to Credentials:**
   ```
   Left Menu → APIs & Services → Credentials
   ```

2. **Find Your Key:**
   Look for: `AIzaSyBngqhmkgNlxluFzOdOtbGVVrGYSPfHuUA`

3. **Click the Key Name** (not the copy icon)

4. **Look for "Application Restrictions":**
   ```
   ○ None
   ● HTTP referrers (web sites)
   ○ IP addresses
   ○ Android apps
   ○ iOS apps
   ```

5. **Add Figma Domains:**
   Click "+ ADD AN ITEM" and paste:
   ```
   *.figma.site/*
   ```

6. **Save Changes**

---

## ✅ **Success Checklist**

After adding domains and waiting 5-10 minutes:

- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Opened Wishes → Map View
- [ ] Console shows: `✅ Google Maps fully loaded and ready`
- [ ] NO `RefererNotAllowedMapError` in console
- [ ] Map shows Google Maps tiles (not OpenStreetMap)
- [ ] Google logo visible in bottom-right
- [ ] Satellite toggle button works

---

## 🆘 **Still Not Working?**

### **Check These:**

1. **Did you save?** Click the blue "Save" button in Google Cloud Console
2. **Did you wait?** Changes take 5-10 minutes to propagate
3. **Did you hard refresh?** Press Ctrl+Shift+R
4. **Is the API enabled?** Check "APIs & Services" → "Enabled APIs" → Should see "Maps JavaScript API"
5. **Billing enabled?** Google Maps requires a billing account (but free tier is generous)

### **Share if Still Failing:**
1. Screenshot of your API restrictions page
2. Full console error logs
3. Time elapsed since you saved changes

---

## 🎉 **Once Fixed, You'll See:**

```console
🚀🚀🚀 MAPS CONFIG FILE LOADED! 🚀🚀🚀
🔑 Hardcoded API Key exists: true
🔄 Loading Google Maps API with key: AIzaSyBngqhmkgNlxluF...
📜 Added Google Maps script to document
✅ Google Maps script loaded successfully
✅ Google Maps fully loaded and ready
✅ Google Map initialized successfully
```

**Perfect Google Maps with satellite view, Street View, and professional tiles!** 🗺️

---

**Go to Google Cloud Console now and add the Figma domains!** 🚀
