# 🚀 LocalFelo - VS Code Setup Guide

## **Quick Start (5 minutes)**

### **Step 1: Copy Files to Your Computer**

1. Download the entire project folder
2. Extract to a location like: `C:\Projects\LocalFelo`
3. Open VS Code
4. `File` → `Open Folder` → Select the LocalFelo folder

---

### **Step 2: Create .env File**

1. In VS Code, create a new file named `.env` in the root folder
2. Copy this template and add your keys:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://drofnrntrbedtjtpseve.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyb2Zucm50cmJlZHRqdHBzZXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODMzMjQsImV4cCI6MjA3OTM1OTMyNH0.HONRnz8phA-6j0hwf6XLhD8aRX4zwQR-2x6pQHcUBAo

# Google Maps API Key (REQUIRED for Google Maps)
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE

# Map Provider (choose one)
VITE_MAP_PROVIDER=auto

# Google Maps Rollout (1.0 = 100% of users)
VITE_GOOGLE_MAPS_ROLLOUT_PERCENTAGE=1.0

# Debug Mode
VITE_DEBUG_MAPS=true
```

3. **Replace `YOUR_API_KEY_HERE`** with your actual Google Maps API key

---

### **Step 3: Install Dependencies**

Open VS Code terminal (`Ctrl + ~`) and run:

```bash
npm install
```

This will take 2-3 minutes.

---

### **Step 4: Start Development Server**

```bash
npm run dev
```

You should see:

```
VITE v6.3.5  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

Open `http://localhost:3000` in your browser! 🎉

---

## **Map Provider Behavior**

### **With Google Maps API Key:**

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxx
VITE_MAP_PROVIDER=auto
```

- ✅ Uses Google Maps (satellite view, Street View, etc.)
- ✅ Professional branded pins
- ✅ Better geocoding accuracy
- ⚠️ **Requires whitelisting Figma domains** if testing in Figma

---

### **Without Google Maps API Key:**

```env
# VITE_GOOGLE_MAPS_API_KEY=  (commented out or empty)
VITE_MAP_PROVIDER=auto
```

- ✅ Uses free Leaflet/OpenStreetMap
- ✅ Works everywhere (no domain restrictions)
- ⚠️ No satellite view, no Street View
- ⚠️ Basic map pins

---

### **Force Leaflet (Skip Google Maps):**

```env
VITE_MAP_PROVIDER=leaflet
```

- Always uses Leaflet, even if API key exists
- Good for testing or development without Google Maps quota usage

---

## **Troubleshooting**

### **❌ Error: "Unable to resolve @import tailwindcss"**

**Fix:**

```bash
# Delete cache folders
rmdir /s /q .vite
rmdir /s /q dist

# Restart
npm run dev
```

If that doesn't work:

```bash
# Full reinstall
rmdir /s /q node_modules
npm install
npm run dev
```

---

### **❌ Maps Not Loading (RefererNotAllowedMapError)**

**Cause:** Google Maps API key is restricted and doesn't allow your domain.

**Fix Options:**

1. **Allow localhost** in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Edit your API key
   - Under "Application restrictions" → "HTTP referrers"
   - Add:
     - `http://localhost:3000/*`
     - `http://127.0.0.1:3000/*`
   - Save and wait 5 minutes

2. **Use unrestricted key** (for testing only):
   - Create a new API key without restrictions
   - **⚠️ NEVER use unrestricted keys in production!**

3. **Use Leaflet instead**:
   ```env
   VITE_MAP_PROVIDER=leaflet
   ```

---

### **❌ Console Shows "No Google Maps API key found"**

**Check:**

1. `.env` file exists in root folder (next to `package.json`)
2. Variable name is exactly: `VITE_GOOGLE_MAPS_API_KEY`
3. No spaces around `=`
4. No quotes around the value
5. You restarted the dev server after creating `.env`

**Correct:**
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxx
```

**Wrong:**
```env
VITE_GOOGLE_MAPS_API_KEY = "AIzaSy..."  ❌ (spaces and quotes)
```

---

### **❌ "Module not found" Errors**

```bash
# Clear cache and reinstall
rmdir /s /q node_modules
rmdir /s /q .vite
npm install
npm run dev
```

---

## **Verify Google Maps is Working**

### **Check Console Logs:**

Open browser DevTools (`F12`) and look for:

```
🗺️ Map Provider Configuration:
  - Preference: auto
  - Has Google Maps Key: true
  - API Key (first 20 chars): AIzaSyBngqhmkgNlxlu...
  - Determined Provider: google
  - Using Google Maps: true
```

If you see `google`, Google Maps is active! ✅

If you see `leaflet`, it's using the fallback.

---

### **Check Map Features:**

1. Go to any map view in the app
2. Look for:
   - ✅ Satellite/Terrain view toggle (only in Google Maps)
   - ✅ Street View button (only in Google Maps)
   - ✅ LocalFelo branded green pins
3. Try switching views - if satellite works, Google Maps is working!

---

## **Environment Variables Reference**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_SUPABASE_URL` | ✅ Yes | - | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | - | Supabase anonymous key |
| `VITE_GOOGLE_MAPS_API_KEY` | ⚠️ Optional | - | Google Maps API key (for Google Maps) |
| `VITE_MAP_PROVIDER` | ❌ No | `auto` | Map provider: `auto`, `google`, or `leaflet` |
| `VITE_GOOGLE_MAPS_ROLLOUT_PERCENTAGE` | ❌ No | `1.0` | Rollout percentage (0.0-1.0) |
| `VITE_DEBUG_MAPS` | ❌ No | `false` | Enable debug logs for maps |

---

## **Production Build**

### **Build for deployment:**

```bash
npm run build
```

Output will be in `/dist` folder.

### **Preview production build locally:**

```bash
npm run preview
```

---

## **File Structure**

```
LocalFelo/
├── .env                    # Your environment variables (CREATE THIS)
├── .env.example            # Template for .env file
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
├── index.html              # HTML entry point
├── src/
│   ├── main.tsx            # React entry point
│   └── App.tsx             # Main app component
├── config/
│   └── maps.ts             # Map provider configuration (NO HARDCODED KEY)
├── components/             # React components
├── screens/                # Page components
├── services/               # API services
├── styles/
│   └── globals.css         # Global styles (Tailwind)
└── public/                 # Static assets
```

---

## **Next Steps**

1. ✅ Create `.env` file with your API keys
2. ✅ Run `npm install`
3. ✅ Run `npm run dev`
4. ✅ Open `http://localhost:3000`
5. ✅ Check console logs to verify map provider
6. ✅ Test location selection, map views, etc.

---

## **Important Notes**

### **🔒 Security:**

- **NEVER commit `.env` file to git!**
- `.gitignore` already excludes it
- Use `.env.example` as a template for others

### **🗺️ Google Maps Setup:**

- Get API key from: https://console.cloud.google.com/apis/credentials
- Enable these APIs:
  - Maps JavaScript API
  - Geocoding API
  - Places API
- Set up billing (required for Google Maps)
- Configure domain restrictions

### **💰 Cost Control:**

- Google Maps is free up to $200/month credit
- Monitor usage in Google Cloud Console
- Use `VITE_MAP_PROVIDER=leaflet` for development to save quota

---

## **Support**

If you encounter issues:

1. Check `/FIX_TAILWIND_ERROR.md` for Vite cache issues
2. Check `/GOOGLE_MAPS_EVERYWHERE.md` for Google Maps setup
3. Check `/GOOGLE_MAPS_SETUP_REQUIREMENTS.md` for detailed API setup

---

**Ready to build! 🚀**
