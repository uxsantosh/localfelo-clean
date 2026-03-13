# ✅ LocalFelo Update System - Deployment Checklist

## Pre-Deployment Checklist

### 1. Verify Files Exist

```bash
# Core implementation files
- [x] /scripts/generate-version.js
- [x] /src/utils/version-manager.ts
- [x] /src/components/UpdateNotification.tsx

# Configuration files
- [x] /vite.config.ts (modified)
- [x] /package.json (modified)
- [x] /App.tsx (modified)
- [x] /src/vite-env.d.ts (modified)

# Platform-specific cache headers
- [x] /public/_headers (Netlify/Cloudflare)
- [x] /vercel.json (Vercel)
- [x] /netlify.toml (Netlify)
- [x] /public/.htaccess (Apache)

# Placeholder version file
- [x] /public/version.json
```

### 2. Test Build Process

```bash
# Step 1: Clean previous builds
rm -rf dist/
rm -f public/version.json

# Step 2: Run build
npm run build

# Step 3: Verify outputs
✅ Check: public/version.json created?
✅ Check: dist/ folder created?
✅ Check: dist/assets/ has hashed filenames?
   Example: main.a1b2c3d4.js (not main.js)
```

### 3. Verify Build Outputs

```bash
# Check version.json format
cat public/version.json
# Should show:
# {
#   "version": "1.0.0.<timestamp>",
#   "buildTime": "2026-03-12T...",
#   "buildTimestamp": 1710234567890
# }

# Check asset filenames have hash
ls dist/assets/
# Should see files like:
# - main.abc123.js
# - vendor-react.xyz789.js
# - style.def456.css
```

## Deployment Checklist

### For Netlify

```bash
- [ ] Push to GitHub repository
- [ ] Netlify auto-builds and deploys
- [ ] Check Netlify build logs for errors
- [ ] Visit site URL
- [ ] Open DevTools → Console
- [ ] Verify version logged: "Current version: 1.0.0.<timestamp>"
- [ ] Check Network tab → Headers for index.html
- [ ] Verify Cache-Control: no-cache, no-store
```

### For Vercel

```bash
- [ ] Push to GitHub repository
- [ ] Vercel auto-builds and deploys
- [ ] Check Vercel deployment logs
- [ ] Visit deployment URL
- [ ] Open DevTools → Console
- [ ] Verify version logged
- [ ] Check Network tab → Headers
- [ ] Verify cache headers are correct
```

### For cPanel/Apache

```bash
- [ ] Run: npm run build
- [ ] Upload dist/ contents to public_html/
- [ ] Ensure .htaccess uploaded (including the dot!)
- [ ] Visit site URL
- [ ] Test cache headers (see testing section below)
- [ ] Verify app loads correctly
```

### For VPS/Nginx

```bash
- [ ] Run: npm run build
- [ ] Copy dist/ to server: rsync -avz dist/ user@server:/var/www/html/
- [ ] Update nginx config with cache headers
- [ ] Reload nginx: sudo systemctl reload nginx
- [ ] Visit site URL
- [ ] Test cache headers
```

## Post-Deployment Testing

### 1. Verify Cache Headers

```bash
# Test index.html (should NOT be cached)
curl -I https://yoursite.com/
# Look for: Cache-Control: no-cache, no-store, must-revalidate

# Test version.json (should NOT be cached)
curl -I https://yoursite.com/version.json
# Look for: Cache-Control: no-cache, no-store, must-revalidate

# Test JavaScript (should be cached with hash)
curl -I https://yoursite.com/assets/main.abc123.js
# Look for: Cache-Control: public, max-age=31536000, immutable
```

### 2. Test Version Detection

```bash
# Step 1: Open app in browser
- [ ] Open: https://yoursite.com
- [ ] Open DevTools → Console
- [ ] Note current version number

# Step 2: Make a change and rebuild
- [ ] Edit a file (add a comment)
- [ ] Run: npm run build
- [ ] Deploy new build

# Step 3: Wait and verify
- [ ] Wait 5 minutes (or your configured interval)
- [ ] Check original browser tab
- [ ] Verify update notification appears
- [ ] Click "Update Now"
- [ ] Verify app reloads
- [ ] Check console for new version number
```

### 3. Test User Experience

```bash
# Test dismiss functionality
- [ ] Trigger update notification
- [ ] Click "Later" button
- [ ] Verify notification disappears
- [ ] Wait 30 minutes
- [ ] Verify notification reappears

# Test close functionality
- [ ] Trigger update notification
- [ ] Click X button
- [ ] Verify notification disappears
- [ ] Wait 30 minutes
- [ ] Verify notification reappears

# Test update functionality
- [ ] Trigger update notification
- [ ] Click "Update Now"
- [ ] Verify loading spinner appears
- [ ] Verify page reloads
- [ ] Verify new version loaded
```

### 4. Browser Compatibility Testing

```bash
Test in each browser:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

For each browser:
- [ ] App loads correctly
- [ ] Version check runs
- [ ] Update notification appears
- [ ] Update process works
```

## Monitoring Checklist

### Daily (First Week)

```bash
- [ ] Check analytics: How many users seeing updates?
- [ ] Monitor error logs: Any version check failures?
- [ ] Check user feedback: Any cache-related complaints?
- [ ] Verify cache headers still correct (CDN might reset)
```

### Weekly (Ongoing)

```bash
- [ ] Review version distribution (are users up-to-date?)
- [ ] Check dismissal rate (how many click "Later"?)
- [ ] Monitor average update time (how long to reach 100%?)
- [ ] Review any error patterns
```

## Troubleshooting Checklist

### Issue: Users See Old Version

```bash
Step 1: Verify cache headers
- [ ] curl -I https://yoursite.com/
- [ ] Check: Cache-Control on index.html
- [ ] Expected: no-cache, no-store, must-revalidate

Step 2: Verify asset hashing
- [ ] Check dist/assets/ folder
- [ ] Confirm: Files have hash (main.abc123.js)
- [ ] If not: Check vite.config.ts build.rollupOptions.output

Step 3: Verify version.json
- [ ] curl https://yoursite.com/version.json
- [ ] Confirm: Returns latest version
- [ ] Confirm: Not cached (different each request)

Step 4: Check CDN
- [ ] If using CDN (Cloudflare, CloudFront)
- [ ] Purge CDN cache
- [ ] Retest

Step 5: Check browser
- [ ] Open DevTools → Application → Service Workers
- [ ] If service worker present: Unregister it
- [ ] Clear all site data
- [ ] Reload
```

### Issue: Update Notification Not Appearing

```bash
Step 1: Check console
- [ ] Open DevTools → Console
- [ ] Deploy new version
- [ ] Wait 5 minutes
- [ ] Look for: "New version available: ..."
- [ ] If missing: Version check failing

Step 2: Check network
- [ ] Open DevTools → Network
- [ ] Look for: version.json requests every 5 minutes
- [ ] Check: Request succeeds (200 OK)
- [ ] Check: Response has correct version

Step 3: Verify component mounted
- [ ] Search App.tsx for: <UpdateNotification />
- [ ] Confirm: Component is imported and rendered
- [ ] Check: No console errors about missing component

Step 4: Check version manager
- [ ] Console: versionManager.getCurrentVersion()
- [ ] Should return: Current version string
- [ ] If undefined: Version manager not initializing
```

### Issue: Build Fails

```bash
Step 1: Check prebuild script
- [ ] Verify: package.json has "prebuild" script
- [ ] Test manually: node scripts/generate-version.js
- [ ] Check: public/version.json created

Step 2: Check dependencies
- [ ] Verify: Node.js version 16+
- [ ] Run: npm install
- [ ] Check: All packages installed

Step 3: Check vite config
- [ ] Verify: vite.config.ts syntax correct
- [ ] Test: npm run build
- [ ] Check build logs for errors
```

## Rollback Checklist

### If Updates Cause Issues

```bash
Step 1: Quick disable (emergency)
- [ ] Remove <UpdateNotification /> from App.tsx
- [ ] Rebuild and deploy
- [ ] Users will stop seeing notifications
- [ ] App continues working normally

Step 2: Investigate
- [ ] Check error logs
- [ ] Review recent changes
- [ ] Test in staging environment
- [ ] Identify root cause

Step 3: Fix and redeploy
- [ ] Apply fix
- [ ] Test thoroughly
- [ ] Re-add <UpdateNotification />
- [ ] Deploy
```

## Performance Checklist

### Monitor These Metrics

```bash
- [ ] Initial page load time (should be unchanged)
- [ ] Time to interactive (should be unchanged)
- [ ] Bundle size (should increase ~5KB only)
- [ ] Network requests (should add 1 per 5 minutes)
- [ ] Memory usage (should be negligible increase)
```

### Optimization Tips

```bash
- [ ] If version checks are too frequent: Increase interval
- [ ] If bundle too large: Code split version manager
- [ ] If network load high: Increase check interval
- [ ] If users annoyed: Adjust notification frequency
```

## Documentation Checklist

### For Your Team

```bash
- [ ] Share: CACHE_SOLUTION_SUMMARY.md
- [ ] Share: DEPLOYMENT_CACHE_GUIDE.md
- [ ] Document: Your specific deployment process
- [ ] Document: Emergency rollback procedure
- [ ] Train: Developers on version system
- [ ] Train: Support team on cache issues
```

### For Users

```bash
- [ ] Create: Help article about updates
- [ ] Explain: Why they see update notifications
- [ ] Guide: How to update manually (if needed)
- [ ] FAQ: Common questions about updates
```

## Success Criteria

### You've succeeded when:

```bash
✅ All users receive updates within 5 minutes of deployment
✅ Zero manual "clear your cache" support requests
✅ Update notification works in all browsers
✅ Cache headers configured correctly on server
✅ Version detection runs without errors
✅ Users can update with one click
✅ Team understands the system
```

## Maintenance Schedule

### Monthly

```bash
- [ ] Review version check error logs
- [ ] Check cache header configuration
- [ ] Verify CDN settings (if applicable)
- [ ] Review user feedback on updates
```

### Quarterly

```bash
- [ ] Analyze update adoption rates
- [ ] Review and optimize check interval
- [ ] Consider UX improvements to notification
- [ ] Update documentation as needed
```

### Annually

```bash
- [ ] Evaluate new cache strategies
- [ ] Consider progressive rollout features
- [ ] Review browser compatibility
- [ ] Update platform configurations
```

---

## Quick Reference Commands

```bash
# Build for production
npm run build

# Test version generation
node scripts/generate-version.js

# Check version file
cat public/version.json

# Test cache headers
curl -I https://yoursite.com/

# Deploy to various platforms
# Netlify/Vercel: git push
# cPanel: Upload dist/
# VPS: rsync -avz dist/ user@server:/var/www/html/
```

---

**Status**: 
- [ ] Pre-deployment checks complete
- [ ] Deployment successful
- [ ] Post-deployment testing passed
- [ ] Monitoring in place
- [ ] Team trained
- [ ] Documentation complete

**Date**: _______________

**Deployed by**: _______________

**Notes**: _______________________________________________
