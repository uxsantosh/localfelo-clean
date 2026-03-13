# 🚀 LocalFelo - Pre-Deployment Checklist

## ⚠️ CRITICAL FIXES REQUIRED BEFORE DEPLOYMENT

### **1. ❗ FIX MARKETPLACE TESTING MODE**

**File:** `/screens/MarketplaceScreen.tsx` (Line 66)

**Current (TESTING MODE):**
```typescript
const [includeOwnListings, setIncludeOwnListings] = useState(true);  // ✅ TRUE by default for testing
```

**Change to (PRODUCTION MODE):**
```typescript
const [includeOwnListings, setIncludeOwnListings] = useState(false);  // ✅ FALSE for production - users won't see their own listings
```

**Why:** Right now, logged-in users can see their own listings in the marketplace. In production, users should only see others' listings in the feed (they manage their own listings from Profile > My Listings).

---

## 📋 Deployment Checklist

### **Environment Setup**

- [ ] **Environment Variables Set**
  - Check `.env.local` or your hosting platform's environment variables:
    - `VITE_SUPABASE_URL` = `https://drofnrntrbedtjtpseve.supabase.co`
    - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOi...` (your anon key)
  - If not set, hardcoded fallbacks in `/lib/supabaseClient.ts` will be used

- [ ] **Supabase Project Configuration**
  - Verify authentication settings in Supabase dashboard
  - Verify RLS (Row Level Security) policies are enabled
  - Check that site URLs are configured in Supabase Authentication settings

---

### **Code Changes**

- [ ] **Fix Marketplace Testing Mode** (CRITICAL - see above)
  - Change `includeOwnListings` from `true` → `false` in `/screens/MarketplaceScreen.tsx`

- [ ] **Optional: Remove Verbose Console Logs**
  - Logs in `/lib/supabaseClient.ts` (lines 12-16, 52-54) - Optional to remove
  - Logs in `/services/listings.js` - Search for `console.log` and remove/comment if desired
  - Logs in `/App.tsx` - Search for debug logs

---

### **Build & Verify**

- [ ] **Run Build Command**
  ```bash
  npm run build
  ```

- [ ] **Verify Build Output**
  - Check `/dist` folder was created
  - Verify `/dist/.htaccess` exists (if deploying to Apache)
  - Check for any build errors or warnings

- [ ] **Test Production Build Locally**
  ```bash
  npm run preview
  ```
  Then test:
  - `http://localhost:4173/marketplace` - Should load correctly
  - `http://localhost:4173/wishes` - Should load correctly
  - `http://localhost:4173/tasks` - Should load correctly
  - Refresh each page - Should NOT show 404

---

### **Deployment Platform Configuration**

Choose your deployment platform and follow the relevant steps:

#### **Option A: Apache Server (cPanel, Traditional Hosting)**

- [ ] Upload entire `/dist` folder to server
- [ ] Verify `.htaccess` file is in root of deployed app
- [ ] Ensure Apache `mod_rewrite` is enabled
- [ ] Test direct URLs work (no 404 errors)

**Verify .htaccess:**
```bash
# SSH into server and check
ls -la /path/to/deployment/.htaccess
cat /path/to/deployment/.htaccess
```

---

#### **Option B: Nginx Server (VPS, Digital Ocean, AWS)**

- [ ] Upload `/dist` folder to server (e.g., `/var/www/localfelo/dist`)
- [ ] Copy `/nginx.conf` content to `/etc/nginx/sites-available/localfelo`
- [ ] Update `root` path in nginx config to match your deployment
- [ ] Create symlink: `sudo ln -s /etc/nginx/sites-available/localfelo /etc/nginx/sites-enabled/`
- [ ] Test config: `sudo nginx -t`
- [ ] Reload Nginx: `sudo systemctl reload nginx`
- [ ] Test direct URLs work

---

#### **Option C: Vercel**

- [ ] Ensure `/vercel.json` exists in project root (✅ Already created)
- [ ] Connect GitHub repo to Vercel or use Vercel CLI:
  ```bash
  npm i -g vercel
  vercel --prod
  ```
- [ ] Set environment variables in Vercel dashboard:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Deploy and test direct URLs

---

#### **Option D: Netlify**

- [ ] Ensure `/public/_redirects` exists (✅ You've manually edited this)
- [ ] Connect GitHub repo to Netlify or drag-drop `/dist` folder
- [ ] Set environment variables in Netlify dashboard:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Deploy and test direct URLs

---

### **Post-Deployment Testing**

Test all these URLs on your production domain:

**Direct URL Access:**
- [ ] `https://www.localfelo.com/` - Home
- [ ] `https://www.localfelo.com/marketplace` - Marketplace
- [ ] `https://www.localfelo.com/wishes` - Wishes
- [ ] `https://www.localfelo.com/tasks` - Tasks
- [ ] `https://www.localfelo.com/profile` - Profile (requires login)
- [ ] `https://www.localfelo.com/about` - About
- [ ] `https://www.localfelo.com/terms` - Terms
- [ ] `https://www.localfelo.com/privacy` - Privacy
- [ ] `https://www.localfelo.com/safety` - Safety

**Refresh Test:**
- [ ] Navigate to Marketplace → Refresh page → Should stay on marketplace
- [ ] Navigate to Wishes → Refresh page → Should stay on wishes
- [ ] Navigate to Tasks → Refresh page → Should stay on tasks

**Authentication Flow:**
- [ ] Guest can browse marketplace, wishes, tasks
- [ ] Login works correctly
- [ ] After login, user doesn't see their own listings in marketplace feed
- [ ] User can see their own listings in Profile > My Listings
- [ ] Logout works correctly

**Core Features:**
- [ ] Can create listing/wish/task
- [ ] Can view detail pages
- [ ] Can edit own content
- [ ] Can chat with other users
- [ ] Location search works
- [ ] Filters work
- [ ] Search works

---

## 🔐 Security Checklist

- [ ] **Supabase RLS Policies Enabled**
  - Check all tables have proper Row Level Security
  - Test that users can only edit/delete their own content

- [ ] **API Keys Protected**
  - Anon key is public (safe to expose)
  - Service role key is NEVER exposed in frontend code

- [ ] **HTTPS Enabled**
  - Production site uses HTTPS
  - No mixed content warnings

---

## 📊 Performance Checklist

- [ ] **Assets Optimized**
  - Images are compressed
  - Bundle size is reasonable (check in build output)

- [ ] **Caching Configured**
  - Static assets cached (handled by `.htaccess`, `nginx.conf`, or platform)
  - HTML not cached

---

## 🎉 Ready to Deploy!

Once all checkboxes are complete:

1. Make the critical fix to `/screens/MarketplaceScreen.tsx` (Line 66)
2. Run `npm run build`
3. Deploy `/dist` folder to your chosen platform
4. Test all URLs and features
5. Monitor for errors in browser console and Supabase logs

---

## 🆘 If Something Goes Wrong

**404 Errors on Direct URLs:**
- Apache: Check `.htaccess` exists and `mod_rewrite` is enabled
- Nginx: Verify `try_files` directive is correct
- Vercel/Netlify: Check rewrites config is deployed

**Blank White Screen:**
- Check browser console for errors
- Verify Supabase credentials are correct
- Check network tab for failed API calls

**Can't See Listings:**
- Check you're not logged in as the listing owner (or change `includeOwnListings` back to `true` temporarily)
- Verify listings exist in Supabase database
- Check browser console for errors

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify environment variables are set correctly
4. Test locally with `npm run preview` first
