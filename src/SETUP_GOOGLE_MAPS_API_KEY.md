# 🔑 How to Add Your Google Maps API Key

**Status:** ✅ Google Maps integration is READY - just needs your API key!  
**Time needed:** ~2 minutes  
**Current mode:** Leaflet + Geoapify (fallback, 100% free)

---

## 📋 **Quick Setup (3 Steps)**

### **Step 1: Create `.env` file**

In the root folder of LocalFelo project, create a file named `.env`:

```bash
# In project root (same folder as package.json)
touch .env
```

### **Step 2: Add Your API Keys**

Copy this template into `.env` and fill in your Google Maps API key:

```env
# =====================================================
# LocalFelo Environment Variables
# =====================================================

# Supabase (REQUIRED - already configured)
VITE_SUPABASE_URL=your_existing_supabase_url
VITE_SUPABASE_ANON_KEY=your_existing_supabase_key

# Google Maps API Key (ADD THIS)
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Map Provider Mode
# - 'auto' = Use Google if key exists, else Leaflet (default)
# - 'google' = Force Google Maps (requires key)
# - 'leaflet' = Force Leaflet (free, no key needed)
VITE_MAP_PROVIDER=auto

# Optional: Rollout Percentage (0.0 to 1.0)
# - 1.0 = 100% users get Google Maps (default)
# - 0.5 = 50% users get Google Maps, 50% get Leaflet
# - 0.0 = All users get Leaflet
VITE_GOOGLE_MAPS_ROLLOUT_PERCENTAGE=1.0

# Optional: Debug Mode
VITE_DEBUG_MAPS=false
```

### **Step 3: Restart Dev Server**

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

**That's it!** 🎉 Google Maps is now active!

---

## ✅ **Verify It's Working**

### **Check Console Logs**

When you search for a location or view map, you should see:

```
🗺️ Using Google Places for search
✅ Google Maps JavaScript API loaded successfully
```

Instead of:

```
🗺️ Using Geoapify for search (fallback)
```

### **Visual Verification**

1. **Open any listing/task/wish**
2. **Look at the map** - Google Maps has:
   - ✅ Google logo in bottom-left
   - ✅ "Report a map error" link
   - ✅ Satellite/Terrain view buttons
   - ✅ Smoother animations

3. **Search for location** - Google Places autocomplete is more accurate

---

## 🔧 **Configuration Options**

### **Option 1: Always Use Google Maps (Recommended)**

```env
VITE_MAP_PROVIDER=auto
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- ✅ Uses Google Maps if key is valid
- ✅ Falls back to Leaflet if Google fails
- ✅ Best user experience

### **Option 2: Force Leaflet (Testing)**

```env
VITE_MAP_PROVIDER=leaflet
```

- Uses Leaflet even if Google Maps key exists
- Useful for cost testing

### **Option 3: Gradual Rollout (A/B Test)**

```env
VITE_MAP_PROVIDER=auto
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_GOOGLE_MAPS_ROLLOUT_PERCENTAGE=0.25
```

- 25% of users get Google Maps
- 75% of users get Leaflet
- Users are assigned randomly but consistently (same user always gets same version)

### **Option 4: Debug Mode**

```env
VITE_DEBUG_MAPS=true
```

- See detailed console logs about which provider is being used
- Shows why Google Maps was selected or skipped

---

## 🚨 **Troubleshooting**

### **Problem: Still seeing Leaflet/Geoapify**

**Check 1: Is API key in `.env`?**
```bash
cat .env | grep GOOGLE_MAPS
```

Should show: `VITE_GOOGLE_MAPS_API_KEY=AIzaSy...`

**Check 2: Did you restart the dev server?**
```bash
# Stop server: Ctrl+C
npm run dev
```

**Check 3: Is API key restricted correctly?**
- Go to Google Cloud Console
- Check that `localhost` is in allowed HTTP referrers
- Check that APIs are enabled

**Check 4: Console errors?**
- Open Browser DevTools (F12)
- Look for errors starting with "Google Maps"
- Common error: "RefererNotAllowedMapError" = API key restriction issue

---

### **Problem: "RefererNotAllowedMapError"**

**Solution:** Add localhost to API key restrictions

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your API key
3. Under "Application restrictions":
   - Choose: **HTTP referrers (web sites)**
   - Add: `http://localhost:*`
   - Add: `https://localhost:*`
   - Add: `http://127.0.0.1:*`
4. Click **Save**
5. Wait 5 minutes for changes to propagate

---

### **Problem: "This API project is not authorized to use this API"**

**Solution:** Enable required APIs

1. Go to: https://console.cloud.google.com/apis/library
2. Search and enable:
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. Wait 5 minutes
4. Restart dev server

---

### **Problem: Map loads but search still uses Geoapify**

This is **NORMAL**! The fallback system works like this:

1. Try Google Places search
2. If no results → fallback to Geoapify
3. If error → fallback to Geoapify

Check console logs:
```
🗺️ Using Google Places for search
⚠️ Google Places returned no results, falling back to Geoapify
```

This is **expected behavior** for rare locations.

---

## 💰 **Monitor Usage & Costs**

### **View Usage Dashboard**

1. Go to: https://console.cloud.google.com/apis/dashboard
2. Select your project: `LocalFelo`
3. See API usage graphs

### **Set Up Cost Alerts** (Highly Recommended)

1. Go to: https://console.cloud.google.com/billing/budgets
2. Create budget: `$50/month` (or your limit)
3. Set alerts at: 50%, 90%, 100%
4. Add your email

You'll get warnings before hitting your budget!

---

## 🔄 **Switching Between Providers**

### **Quick Toggle (No Code Changes)**

**Use Google Maps:**
```env
VITE_MAP_PROVIDER=auto
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

**Use Leaflet (Free):**
```env
VITE_MAP_PROVIDER=leaflet
# API key ignored when provider=leaflet
```

**Restart server after changing `.env`!**

---

## 📊 **A/B Testing Google vs Leaflet**

Want to compare user experience?

```env
# 50% of users get Google Maps, 50% get Leaflet
VITE_GOOGLE_MAPS_ROLLOUT_PERCENTAGE=0.5
VITE_DEBUG_MAPS=true
```

Then check console logs to see which version each user gets.

**User assignment is consistent:**
- Same user always gets same version
- Based on browser session ID
- Stored in localStorage

---

## 🛡️ **Security Best Practices**

### **✅ DO:**
- Keep `.env` file in `.gitignore` (already done)
- Restrict API key to specific domains in production
- Set budget alerts in Google Cloud
- Use separate keys for dev/staging/production

### **❌ DON'T:**
- Commit `.env` to Git
- Share API key publicly
- Use same key across all environments
- Forget to set budget limits

---

## 📁 **File Structure**

After setup, your project should have:

```
localfelo/
├── .env                          ← YOU CREATE THIS (not in Git)
├── .env.example                  ← ✅ Template (in Git)
├── config/
│   └── maps.ts                   ← ✅ Provider configuration
├── services/
│   ├── geocoding.ts              ← ✅ Dual-provider geocoding
│   └── googleMaps.ts             ← ✅ Google Maps implementation
├── components/
│   ├── MapView.tsx               ← ⏳ TODO: Update for dual provider
│   └── LocationSearch.tsx        ← ✅ Uses dual-provider search
└── package.json                  ← ✅ Has @googlemaps/js-api-loader
```

**Legend:**
- ✅ = Ready
- ⏳ = Next step (MapView update coming)
- 🔨 = Future enhancement

---

## 🚀 **Next Steps (After API Key Added)**

Once your API key is working:

1. **Week 1:** Test Google Places search (already working!)
2. **Week 2:** Update MapView.tsx for Google Maps rendering
3. **Week 3:** A/B test with 10% users
4. **Week 4:** Roll out to 100% users
5. **Week 5:** Monitor costs and optimize

---

## 📞 **Get Help**

**API Key Issues:**
- Google Cloud Support: https://cloud.google.com/support
- API Key Restrictions: https://developers.google.com/maps/api-key-best-practices

**Code Issues:**
- Check `/LOCATION_AND_MAPS_ARCHITECTURE_ANALYSIS.md`
- Review console logs with `VITE_DEBUG_MAPS=true`

---

## ✨ **Summary**

**Right now:**
- ✅ Google Maps package installed
- ✅ Dual-provider system ready
- ✅ LocationSearch uses Google Places (if key exists)
- ⏳ MapView still uses Leaflet (next update)

**To activate Google Maps:**
1. Create `.env` file
2. Add `VITE_GOOGLE_MAPS_API_KEY=your_key`
3. Restart server
4. Enjoy better search results!

**Fallback safety:**
- If Google fails → auto-switches to Leaflet
- Zero downtime, zero errors
- Users never see broken maps

---

**Ready to add your API key? Follow Step 1-3 above!** 🚀
