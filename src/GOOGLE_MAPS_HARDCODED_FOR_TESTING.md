# 🔑 Google Maps API Key - HARDCODED FOR TESTING

**Status:** ✅ API key is now hardcoded in `/config/maps.ts`  
**Purpose:** Test if Google Maps works before moving to `.env` file  
**Date:** March 16, 2026

---

## ✅ What Was Changed

### **File Updated: `/config/maps.ts`**

Two functions were modified:

1. **`getGoogleMapsApiKey()`** - Now returns hardcoded API key
2. **`isDebugMapsEnabled()`** - Now always returns `true` for logging

---

## 🧪 How to Test

### **Step 1: Refresh the page**
The files are already updated in Figma Make, so just:

1. **Refresh your browser** (Ctrl+R or F5)
2. **Open console** (F12)
3. **Look for logs**

### **Step 2: Check Console Logs**

You should now see:

```
🗺️ Map Provider Configuration:
  - Preference: auto
  - Has Google Maps Key: true
  - API Key (first 20 chars): AIzaSyBngqhmkgNlxluF...
  - Determined Provider: google
  - Using Google Maps: true

🗺️ MapView: Initializing map provider: Google Maps
🗺️ API Key available: true
🗺️ API Key value: AIzaSyBngqhmkgNlxluF...
🗺️ Loading Google Maps JavaScript API...
```

### **Step 3: Check the Map**

1. **Open any listing detail page**
2. **Scroll to map section**
3. **Look for:**
   - ✅ Satellite/Map toggle (top-right)
   - ✅ Street View icon (yellow person)
   - ✅ Google logo (bottom-right)
   - ✅ **"Google"** badge (bottom-left corner)

---

## 🎯 Expected Results

**✅ If Google Maps works:**
- Map shows professional Google Maps tiles
- Satellite view toggle appears
- Console shows "Using Google Maps: true"
- Badge shows "Google"

**❌ If you see errors:**
- Check console for error messages
- Copy the error and share it
- We'll troubleshoot together

---

## ⏰ Wait Time

**Important:** Google API key restrictions take 5-10 minutes to propagate!

If you see errors like:
- `RefererNotAllowedMapError`
- `ApiNotActivatedMapError`

**→ Wait 10 minutes and try again!**

---

## 🔄 After Testing

### **If Google Maps Works ✅**

We'll move the API key to `.env` file for security:

1. Create `.env` file in VS Code
2. Add: `VITE_GOOGLE_MAPS_API_KEY=AIzaSyBngqhmkgNlxluFzOdOtbGVVrGYSPfHuUA`
3. Remove hardcoded key from `/config/maps.ts`
4. Restart server

### **If Google Maps Doesn't Work ❌**

We'll troubleshoot:
1. Check console errors
2. Verify API key restrictions
3. Check if APIs are enabled
4. Debug step-by-step

---

## 📋 Testing Checklist

- [ ] Refresh browser (Ctrl+R)
- [ ] Open console (F12)
- [ ] Check for "Using Google Maps: true" message
- [ ] Open listing detail page
- [ ] Check if map shows Google Maps tiles
- [ ] Look for satellite toggle
- [ ] Check for "Google" badge (bottom-left)
- [ ] Wait 10 minutes if errors appear
- [ ] Share console logs if issues persist

---

## 💬 What to Share

If it's not working, copy and share:

1. **Console logs** (everything that appears in F12 console)
2. **Any error messages** (especially red errors)
3. **What the map looks like** (Google tiles or OpenStreetMap?)
4. **What badge shows** (Google or Leaflet?)

---

## 🎉 Success Indicators

**You'll know it's working when you see:**
- ✅ Console: "Using Google Maps: true"
- ✅ Console: "Google Map initialized successfully"
- ✅ Map: Satellite/terrain toggle button
- ✅ Map: Google logo in corner
- ✅ Badge: "Google" text (bottom-left)

---

**Now just refresh your browser and check if Google Maps loads! 🚀**
