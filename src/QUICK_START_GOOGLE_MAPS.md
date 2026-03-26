# ⚡ Google Maps - Quick Start Card

**Time to activate:** ~2 minutes  
**Cost:** $0 for first 1-2K users/month

---

## 🎯 3-Step Activation

### **Step 1: Install Package**
```bash
npm install
```

### **Step 2: Create `.env` File**
```env
# Copy from your existing config
VITE_SUPABASE_URL=your_existing_url
VITE_SUPABASE_ANON_KEY=your_existing_key

# ADD THIS LINE (get key from Google Cloud Console)
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **Step 3: Restart Server**
```bash
npm run dev
```

**Done!** Google Places search is now active. ✅

---

## 🔍 How to Verify

### **Console Logs (F12)**
Should see:
```
🗺️ Using Google Places for search
```

Instead of:
```
🗺️ Using Geoapify for search
```

### **Search Box**
Type "Koramangala" → should get Google Places results (better quality)

---

## ⚙️ Configuration

### **Default (Recommended)**
```env
VITE_MAP_PROVIDER=auto
VITE_GOOGLE_MAPS_ROLLOUT_PERCENTAGE=1.0
```
Uses Google if key exists, falls back to Leaflet automatically.

### **Force Free Tier**
```env
VITE_MAP_PROVIDER=leaflet
```
Uses Leaflet even if Google key exists (testing/cost control).

### **A/B Test (50% Users)**
```env
VITE_GOOGLE_MAPS_ROLLOUT_PERCENTAGE=0.5
```
Half get Google, half get Leaflet.

---

## 💰 Cost

| Users | Cost | Covered by Free Tier? |
|-------|------|-----------------------|
| 100 | $11/mo | ✅ Yes ($200 free) |
| 500 | $55/mo | ✅ Yes |
| 1,000 | $111/mo | ✅ Yes |
| 2,000 | $222/mo | ⚠️ Pay $22/mo |
| 5,000 | $555/mo | ⚠️ Pay $355/mo |

**First $200/month is FREE!**

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| Still shows Geoapify | Restart server after adding key |
| "RefererNotAllowedMapError" | Add `localhost:*` to API key restrictions |
| "API not authorized" | Enable APIs in Google Cloud Console |
| Key rejected | Check key is correct & not restricted |

---

## 📚 Full Documentation

| Quick Ref | Full Guide |
|-----------|------------|
| This card (2 min) | `/README_GOOGLE_MAPS.md` (10 min) |
| Google Cloud setup | `/GOOGLE_MAPS_SETUP_REQUIREMENTS.md` (30-60 min) |
| API key setup | `/SETUP_GOOGLE_MAPS_API_KEY.md` (5 min) |
| Architecture | `/LOCATION_AND_MAPS_ARCHITECTURE_ANALYSIS.md` (30 min) |

---

## ✅ Quick Checklist

**Before Adding Key:**
- [ ] Run `npm install`
- [ ] Create Google Cloud project
- [ ] Enable 3 APIs (Maps, Places, Geocoding)
- [ ] Create & restrict API key
- [ ] Set budget alert

**After Adding Key:**
- [ ] Create `.env` file
- [ ] Add `VITE_GOOGLE_MAPS_API_KEY=...`
- [ ] Restart dev server
- [ ] Test search (should use Google)
- [ ] Check console logs

---

## 🎯 What Works Now

- ✅ **Location search** - Google Places (better results)
- ✅ **Geocoding** - Google API (more accurate)
- ✅ **Fallback** - Auto-switches to Geoapify on error
- ⏳ **Map rendering** - Still Leaflet (Phase 2 update)

---

## 🔗 Quick Links

- Google Cloud Console: https://console.cloud.google.com/
- Enable APIs: https://console.cloud.google.com/apis/library
- API Keys: https://console.cloud.google.com/apis/credentials
- Usage Dashboard: https://console.cloud.google.com/apis/dashboard
- Billing: https://console.cloud.google.com/billing

---

**Need help?** Check `/README_GOOGLE_MAPS.md` for detailed guide.
