# 🗺️ Google Maps Setup - What You Need to Provide

**Timeline:** ~30-60 minutes to complete  
**Cost:** $0 setup, usage-based billing (starts after $200 free monthly credits)

---

## ✅ **REQUIRED FROM YOUR SIDE**

### **1. Google Cloud Platform Account** (15 mins)

#### **Step 1: Create Google Cloud Account**
1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account (or create new one)
3. Accept terms of service

#### **Step 2: Enable Billing** ⚠️ REQUIRED (even for free tier)
1. Go to: **Billing** → **Create Billing Account**
2. Enter business/personal details
3. **Add payment method** (credit/debit card)
   - ⚠️ Google requires card even for free tier
   - ✅ You get **$200 FREE credits per month**
   - ✅ You won't be charged unless you exceed $200/month
   - ✅ You can set budget alerts (recommended)

**💡 Tip:** Use a separate credit card for cloud services to track expenses

---

### **2. Create Google Cloud Project** (5 mins)

1. Go to: https://console.cloud.google.com/projectcreate
2. **Project Name:** `LocalFelo` (or your choice)
3. **Organization:** Leave as "No organization" (unless you have one)
4. Click **Create**
5. **Save the Project ID** (example: `localfelo-123456`)

---

### **3. Enable Required APIs** (10 mins)

Go to: **APIs & Services** → **Library**

Enable these 4 APIs:

#### **API 1: Maps JavaScript API**
- Search for: "Maps JavaScript API"
- Click **Enable**
- Used for: Map rendering

#### **API 2: Places API**
- Search for: "Places API"
- Click **Enable**
- Used for: Location autocomplete search

#### **API 3: Geocoding API**
- Search for: "Geocoding API"
- Click **Enable**
- Used for: Converting addresses to coordinates

#### **API 4: Geolocation API** (Optional)
- Search for: "Geolocation API"
- Click **Enable**
- Used for: IP-based location fallback (optional)

---

### **4. Create API Keys** (10 mins)

Go to: **APIs & Services** → **Credentials** → **Create Credentials** → **API Key**

#### **Option A: Single API Key (Recommended for Start)**
✅ **Easier setup**  
✅ One key for all APIs  
❌ Less granular control  

1. Click **Create Credentials** → **API Key**
2. Copy the key (looks like: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
3. Click **Restrict Key** (IMPORTANT for security)

**Key Restrictions:**
- **Application restrictions:**
  - Choose: **HTTP referrers (web sites)**
  - Add: `https://localfelo.com/*`
  - Add: `https://www.localfelo.com/*`
  - Add: `http://localhost:*` (for development)
  - Add: `https://*.netlify.app/*` (if using Netlify)
  - Add: `https://*.vercel.app/*` (if using Vercel)

- **API restrictions:**
  - Choose: **Restrict key**
  - Select:
    - ☑️ Maps JavaScript API
    - ☑️ Places API
    - ☑️ Geocoding API
    - ☑️ Geolocation API (if enabled)

4. Click **Save**

#### **Option B: Separate Keys (Better for Production)**
✅ **Better security**  
✅ **Separate usage tracking**  
❌ More keys to manage  

**Create 2 keys:**

**Key 1: Client-Side Key** (for browser/mobile)
- Name: `LocalFelo - Client Side`
- Restrictions: HTTP referrers (websites) + Android/iOS apps
- APIs: Maps JavaScript API, Places API

**Key 2: Server-Side Key** (for backend)
- Name: `LocalFelo - Server Side`
- Restrictions: IP addresses (your server IP)
- APIs: Geocoding API, Geolocation API

---

### **5. Set Budget Alerts** (5 mins) ⚠️ HIGHLY RECOMMENDED

Prevent surprise charges!

1. Go to: **Billing** → **Budgets & Alerts**
2. Click **Create Budget**
3. **Budget name:** `LocalFelo Monthly Limit`
4. **Budget amount:** 
   - Set to: **$50/month** (for testing)
   - Or: **$200/month** (to use full free credits)
5. **Alert thresholds:**
   - ☑️ 50% of budget ($25 or $100)
   - ☑️ 90% of budget ($45 or $180)
   - ☑️ 100% of budget ($50 or $200)
6. **Email recipients:** Your email
7. Click **Finish**

**💡 Why?** You'll get email alerts if costs approach your budget limit.

---

### **6. Configure Android/iOS (for Mobile App)** (Optional - 15 mins)

If you want Google Maps in your Capacitor Android/iOS app:

#### **Android:**
1. Go to: **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Name: `LocalFelo - Android`
4. **Application restrictions:**
   - Choose: **Android apps**
   - Add package name: `com.localfelo.app` (your Android package name)
   - Add SHA-1 fingerprint (get from Android Studio)
5. **API restrictions:**
   - Maps SDK for Android
   - Places API

#### **iOS:**
1. Create another API key
2. Name: `LocalFelo - iOS`
3. **Application restrictions:**
   - Choose: **iOS apps**
   - Add bundle ID: `com.localfelo.app` (your iOS bundle ID)
4. **API restrictions:**
   - Maps SDK for iOS
   - Places API

---

## 📋 **WHAT TO SEND ME**

After completing the above steps, send me:

### **Required Information:**

```
1. Google Maps API Key (Client-Side):
   AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

2. Google Cloud Project ID:
   localfelo-123456

3. Your domain(s):
   - Production: https://localfelo.com
   - Staging: https://staging.localfelo.com (if any)
   - Dev: http://localhost:5173

4. Android package name (if applicable):
   com.localfelo.app

5. iOS bundle ID (if applicable):
   com.localfelo.app
```

### **Optional Information:**

```
6. Separate Server-Side API Key (if you created one):
   AIzaSyCxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

7. Android API Key (if mobile app):
   AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

8. iOS API Key (if mobile app):
   AIzaSyExxxxxxxxxxxxxxxxxxxxxxxxxxxxx

9. Android SHA-1 Fingerprint:
   AB:CD:EF:12:34:56...
```

---

## 🔒 **SECURITY CHECKLIST**

Before sending keys, ensure:

- ☑️ **API keys are restricted** (not open to any domain)
- ☑️ **HTTP referrers configured** (only your domains can use keys)
- ☑️ **Budget alerts set** (you'll get warnings if costs spike)
- ☑️ **API restrictions enabled** (only allowed APIs can be called)
- ☑️ **Keys NOT committed to Git** (I'll add them to .env file)

---

## 💰 **COST ESTIMATE**

### **Free Tier (First $200/month FREE)**

| Users | Map Loads | Searches | Geocodes | Total Cost | After $200 Free |
|-------|-----------|----------|----------|------------|-----------------|
| 100 | 300 | 500 | 100 | $11 | **$0** ✅ |
| 500 | 1,500 | 2,500 | 500 | $55 | **$0** ✅ |
| 1,000 | 3,000 | 5,000 | 1,000 | $111 | **$0** ✅ |
| 2,000 | 6,000 | 10,000 | 2,000 | $222 | **$22/mo** |
| 5,000 | 15,000 | 25,000 | 5,000 | $555 | **$355/mo** |
| 10,000 | 30,000 | 50,000 | 10,000 | $1,110 | **$910/mo** |

**Pricing Breakdown:**
- Maps JavaScript API: **$7 per 1,000 loads**
- Places API (Autocomplete): **$17 per 1,000 requests**
- Geocoding API: **$5 per 1,000 requests**

**💡 Pro Tip:** Most apps stay under $200/month (free tier) for first 1-2K users

---

## ⚠️ **IMPORTANT NOTES**

### **1. Billing is REQUIRED**
Even for free tier, Google requires a valid payment method. This is to:
- Prevent abuse
- Verify identity
- Auto-charge if you exceed $200/month

### **2. You Won't Be Charged Immediately**
- First $200/month usage is FREE
- You only pay if you exceed $200/month
- Charges appear at end of month

### **3. API Keys are PUBLIC (Client-Side)**
- API keys for Maps JavaScript API are visible in browser
- This is NORMAL and EXPECTED
- Security comes from:
  - ✅ HTTP referrer restrictions (only your domains)
  - ✅ API restrictions (only allowed APIs)
  - ✅ Budget limits
- DO NOT try to hide client-side keys (impossible in JavaScript)

### **4. Keep Leaflet as Fallback**
- If Google Maps fails (outage, quota exceeded, etc.)
- App auto-switches to Leaflet + Geoapify (current system)
- Users won't see broken maps

---

## 🚀 **AFTER YOU SEND KEYS**

### **What I'll Do:**

**Week 1:**
1. Add API keys to environment variables (`.env` file)
2. Install Google Maps SDK (`@googlemaps/js-api-loader`)
3. Update `MapView.tsx` for dual-provider support
4. Test on localhost

**Week 2:**
1. Implement Google Places autocomplete in `LocationSearch.tsx`
2. Add fallback logic (Google → Geoapify)
3. Test search functionality

**Week 3:**
1. Add Google Geocoding API for reverse geocoding
2. Update marker styling for Google Maps
3. Test on staging environment

**Week 4:**
1. A/B testing (10% users get Google Maps)
2. Monitor costs and performance
3. Bug fixes

**Week 5:**
1. Gradual rollout (10% → 50% → 100%)
2. Monitor user feedback
3. Optimize API calls

---

## 📞 **SUPPORT**

### **If You Get Stuck:**

**Issue:** Can't enable billing
- **Solution:** Contact Google Cloud support or try different card

**Issue:** APIs not showing up
- **Solution:** Wait 5-10 minutes after enabling (propagation delay)

**Issue:** API key not working
- **Solution:** Check restrictions, ensure domains are whitelisted

**Issue:** Want to test without billing
- **Solution:** Stick with current Leaflet + Geoapify (100% free)

---

## ✅ **QUICK START CHECKLIST**

Copy this and check off as you complete:

```
[ ] 1. Created Google Cloud account
[ ] 2. Enabled billing (added payment method)
[ ] 3. Created project: LocalFelo
[ ] 4. Enabled Maps JavaScript API
[ ] 5. Enabled Places API
[ ] 6. Enabled Geocoding API
[ ] 7. Created API key
[ ] 8. Restricted API key (HTTP referrers)
[ ] 9. Restricted API key (API list)
[ ] 10. Set budget alert ($50 or $200)
[ ] 11. Sent API key + project details to dev team
```

---

## 🎯 **ALTERNATIVE: Skip Google Maps for Now**

**Not ready to set up billing?**

**Option 1:** Stick with current system (Leaflet + Geoapify)
- ✅ 100% free forever
- ✅ No billing required
- ✅ Works perfectly
- ❌ Slightly worse search quality

**Option 2:** Defer Google Maps to later
- Start with free tier
- Migrate when you have funding/users
- Add Google Maps in Phase 2

**You decide!** Both options are production-ready.

---

**Questions? Let me know which option you prefer, and I'll proceed accordingly.**
