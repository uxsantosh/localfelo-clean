# 🏗️ OldCycle - Build Instructions

## 📋 **Pre-Build Checklist**

Before creating a production build, ensure:

- ✅ All code changes are complete and tested locally
- ✅ Supabase credentials are correctly configured in `/lib/supabaseClient.ts`
- ✅ Google OAuth Client ID is set in `/lib/envConfig.js`
- ✅ All features work in development mode (`npm run dev`)
- ✅ No console errors in browser DevTools

---

## 🚀 **Step 1: Build the App**

### Run the build command:

```bash
npm run build
```

### What happens during build:

1. ✅ TypeScript compiles to JavaScript
2. ✅ React components are bundled
3. ✅ Tailwind CSS is processed and optimized
4. ✅ All code is minified for production
5. ✅ Assets are optimized and hashed
6. ✅ `.htaccess` file is automatically copied to `/dist`
7. ✅ Creates a `/dist` folder with production-ready files

### Expected Output:

```
dist/
├── index.html          # Main HTML file
├── .htaccess          # Apache routing config (for URL routing)
└── assets/
    ├── logo.svg       # App logo
    ├── *.js           # JavaScript bundles
    ├── *.css          # Compiled CSS
    └── *.png/svg      # Images
```

### Build Size (Approximate):
- **Total**: ~500-800 KB (gzipped)
- **Main JS Bundle**: ~200-300 KB
- **Vendor Chunks**: ~150-250 KB
- **CSS**: ~20-30 KB

---

## ✅ **Step 2: Verify Build**

### Preview the build locally:

```bash
npm run preview
```

This starts a local server at `http://localhost:4173` with the production build.

### Test these features:

1. ✅ Homepage loads correctly
2. ✅ URL routing works (`/about`, `/privacy`, `/terms`, etc.)
3. ✅ Google Sign-In works
4. ✅ Browse listings works
5. ✅ Create listing works (after sign-in)
6. ✅ All images load properly
7. ✅ Footer links work
8. ✅ Mobile view is responsive
9. ✅ Browser back/forward buttons work
10. ✅ Refresh page stays on current URL

---

## 📤 **Step 3: Deploy to cPanel**

### Option A: Using cPanel File Manager

1. **Login to cPanel**
   - URL: `https://oldcycle.hueandhype.com:2083` (or your cPanel URL)
   - Enter username & password

2. **Open File Manager**
   - Find "File Manager" in cPanel dashboard

3. **Navigate to Web Directory**
   - Go to `public_html` folder
   - If subdomain: go to subdomain folder

4. **Clear Old Files (if updating)**
   - Select all files in directory
   - Click "Delete"
   - Confirm deletion

5. **Upload Build Files**
   - Click "Upload" button
   - Select ALL files from your `/dist` folder:
     - `index.html`
     - `.htaccess` ⚠️ **IMPORTANT**
     - `assets/` folder (entire folder)
   - Wait for upload to complete (usually 30-60 seconds)

6. **Verify Upload**
   - Check that `.htaccess` file is visible
   - Check that `assets/` folder contains JS, CSS, and images
   - File permissions should be:
     - Files: `644`
     - Folders: `755`

### Option B: Using FTP (FileZilla)

1. **Get FTP Credentials**
   - cPanel → "FTP Accounts"
   - Note: hostname, username, password

2. **Connect via FTP**
   - Open FileZilla (or other FTP client)
   - Host: Your FTP hostname
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21

3. **Upload Files**
   - Local: Navigate to your `/dist` folder
   - Remote: Navigate to `public_html`
   - Drag & drop ALL files from left to right
   - Ensure `.htaccess` is included

---

## 🔐 **Step 4: Configure Production URLs**

### Update Google OAuth Console:

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to: **APIs & Services → Credentials**
4. Click on your OAuth 2.0 Client ID
5. **Update Authorized JavaScript origins**:
   ```
   https://oldcycle.hueandhype.com
   ```
6. **Update Authorized redirect URIs**:
   ```
   https://oldcycle.hueandhype.com
   https://oldcycle.hueandhype.com/
   ```
7. **Update OAuth Consent Screen**:
   - Privacy Policy URL: `https://oldcycle.hueandhype.com/privacy`
   - Terms of Service URL: `https://oldcycle.hueandhype.com/terms`
8. Click **"PUBLISH APP"** to make it available to all users

### Update Supabase Configuration:

1. Go to: Supabase Dashboard → Authentication → URL Configuration
2. **Site URL**:
   ```
   https://oldcycle.hueandhype.com
   ```
3. **Redirect URLs** (add these):
   ```
   https://oldcycle.hueandhype.com/**
   http://localhost:5173/**  (keep for local dev)
   ```
4. **Additional Redirect URLs**:
   ```
   https://oldcycle.hueandhype.com/
   https://oldcycle.hueandhype.com/profile
   https://oldcycle.hueandhype.com/create
   ```

---

## 🧪 **Step 5: Test Production Deployment**

### Basic Functionality Tests:

1. ✅ Visit: `https://oldcycle.hueandhype.com/`
2. ✅ Homepage loads with listings
3. ✅ Click a listing → Detail page opens
4. ✅ Browser URL updates correctly
5. ✅ Click browser back → Returns to home
6. ✅ Footer links work (About, Privacy, Terms, Safety, Contact)
7. ✅ Click "Sell" → Google Sign-In modal opens

### Authentication Tests:

1. ✅ Click "Sign in with Google"
2. ✅ Google popup opens
3. ✅ Select Google account
4. ✅ Redirects back to OldCycle
5. ✅ Shows "Add Phone Number" prompt (if first time)
6. ✅ Can create a listing after adding phone

### URL Routing Tests:

Test these URLs directly in browser:
- ✅ `https://oldcycle.hueandhype.com/` → Home page
- ✅ `https://oldcycle.hueandhype.com/about` → About page
- ✅ `https://oldcycle.hueandhype.com/privacy` → Privacy Policy
- ✅ `https://oldcycle.hueandhype.com/terms` → Terms of Service
- ✅ `https://oldcycle.hueandhype.com/safety` → Safety Guidelines
- ✅ `https://oldcycle.hueandhype.com/contact` → Contact page

**Important**: All URLs should load correctly (not 404). If you get 404, check `.htaccess` was uploaded.

### Mobile Tests:

1. ✅ Open on mobile device
2. ✅ Responsive layout works
3. ✅ Bottom navigation shows
4. ✅ Google Sign-In works on mobile
5. ✅ Can browse and view listings

---

## 🐛 **Common Build Issues**

### Issue 1: Build fails with TypeScript errors

**Error**: `npm run build` shows TS errors

**Solution**:
```bash
# Check for errors first
npx tsc --noEmit

# Fix TypeScript errors in your code
# Then rebuild
npm run build
```

### Issue 2: Build succeeds but site shows blank page

**Problem**: White screen after deployment

**Solution**:
1. Open browser DevTools (F12)
2. Check Console for errors
3. Common causes:
   - Missing `.htaccess` file
   - Wrong base URL in vite.config
   - Supabase credentials missing
4. Check Network tab for failed requests

### Issue 3: URLs show 404 error on refresh

**Problem**: `/about`, `/privacy` etc. show 404 when accessed directly

**Solution**:
- ✅ Ensure `.htaccess` file is in root of `public_html`
- ✅ Check file permissions: `644`
- ✅ Contact hosting support to enable `mod_rewrite`

### Issue 4: Google Sign-In fails in production

**Problem**: "Error 400: redirect_uri_mismatch"

**Solution**:
1. Go to Google Cloud Console
2. Add production URL to Authorized JavaScript origins
3. Add production URL to Authorized redirect URIs
4. Wait 5 minutes for changes to propagate

### Issue 5: Supabase requests fail

**Problem**: Data doesn't load, console shows CORS errors

**Solution**:
1. Go to Supabase Dashboard
2. Add production domain to allowed origins
3. Check Supabase credentials in `/lib/supabaseClient.ts`
4. Verify Supabase project is not paused

---

## 🔄 **Updating Production (After Initial Deployment)**

When you make changes:

### Step 1: Make changes locally
- Edit code
- Test with `npm run dev`
- Verify everything works

### Step 2: Rebuild
```bash
npm run build
```

### Step 3: Upload ONLY changed files (faster)
- If only code changed → Upload `index.html` + `assets/*.js` files
- If styles changed → Upload `assets/*.css` files
- If `.htaccess` changed → Upload `.htaccess`

### Step 4: Clear browser cache
- On your site: Press `Ctrl + Shift + R` (hard refresh)
- Or: Add version query param `?v=2` to force reload

---

## 📊 **Performance Monitoring**

### Check Site Speed:
- Use: https://pagespeed.web.dev/
- Test your production URL
- Aim for: 90+ score on mobile and desktop

### Monitor Supabase Usage:
- Supabase Dashboard → Settings → Usage
- Check:
  - Database size
  - API requests
  - Storage usage
  - Auth users

### Enable Cloudflare (Optional - FREE):
1. Sign up: https://cloudflare.com/
2. Add your domain
3. Update nameservers at domain registrar
4. Benefits:
   - ✅ Faster global load times (CDN)
   - ✅ DDoS protection
   - ✅ SSL/TLS
   - ✅ Analytics

---

## ✅ **Final Deployment Checklist**

Before announcing your app is live:

- [ ] Production build created successfully
- [ ] All files uploaded to cPanel
- [ ] `.htaccess` file present in root
- [ ] SSL certificate enabled (https://)
- [ ] Google OAuth configured for production domain
- [ ] Supabase configured for production domain
- [ ] Homepage loads correctly
- [ ] All footer links work
- [ ] URL routing works (no 404s)
- [ ] Google Sign-In works
- [ ] Phone number collection works
- [ ] Create listing works
- [ ] Browse listings works
- [ ] Images load properly
- [ ] Mobile responsive works
- [ ] Browser back/forward works
- [ ] Page refresh maintains URL
- [ ] No console errors in DevTools
- [ ] Privacy Policy accessible at `/privacy`
- [ ] Terms of Service accessible at `/terms`

---

## 🎉 **You're Live!**

Your OldCycle marketplace is now live at:
**https://oldcycle.hueandhype.com**

### Share your app:
- 📱 Test on multiple devices
- 👥 Share with friends and family
- 📢 Promote on social media
- 💬 Collect user feedback
- 🔄 Iterate and improve!

---

## 📞 **Support**

### If you need help:

1. **Check DevTools Console** (F12) for errors
2. **Check Supabase Logs** for API issues
3. **Check cPanel Error Logs** for server issues
4. **Contact Razorhost Support** for hosting issues
5. **Check DEPLOYMENT_GUIDE.md** for detailed troubleshooting

---

**Built with ❤️ for Indian users | OldCycle - Your Local Marketplace**
