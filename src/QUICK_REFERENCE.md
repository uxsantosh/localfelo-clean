# 📋 LocalFelo Cache Busting - Quick Reference Card

## 🎯 Problem → Solution

| Problem | Solution |
|---------|----------|
| Users see old version after deployment | Automatic version detection |
| Need to tell users "clear your cache" | One-click update notification |
| Stale JavaScript/CSS served | Hashed filenames force new downloads |
| HTML cached by browser | Never-cache headers on index.html |

## 🚀 One-Command Deploy

```bash
npm run build    # Automatically generates version + builds + hashes files
# Then deploy dist/ folder to your hosting
```

## 📁 Key Files

| File | Purpose | Touch It? |
|------|---------|-----------|
| `/scripts/generate-version.js` | Generates version.json | ❌ No |
| `/src/utils/version-manager.ts` | Checks for updates | ⚙️ Configure |
| `/src/components/UpdateNotification.tsx` | Shows UI | 🎨 Style |
| `/vite.config.ts` | Build config | ❌ No |
| `/package.json` | Prebuild script | ❌ No |
| `/App.tsx` | Mounts component | ❌ No |

## ⚙️ Configuration Cheat Sheet

### Change Check Interval

**File**: `/src/utils/version-manager.ts`

```typescript
private checkInterval: number = 5 * 60 * 1000; // DEFAULT

// OPTIONS:
1 * 60 * 1000   // 1 minute  (aggressive)
5 * 60 * 1000   // 5 minutes (balanced) ⭐
10 * 60 * 1000  // 10 minutes (relaxed)
```

### Change Reminder Delay

**File**: `/src/components/UpdateNotification.tsx`

```typescript
setTimeout(() => setShowUpdate(true), 30 * 60 * 1000); // DEFAULT

// OPTIONS:
15 * 60 * 1000  // 15 minutes
30 * 60 * 1000  // 30 minutes ⭐
60 * 60 * 1000  // 1 hour
```

### Force Updates (No "Later" Button)

**File**: `/src/components/UpdateNotification.tsx`

```typescript
// Replace handleDismiss with:
useEffect(() => {
  if (showUpdate) {
    const timer = setTimeout(() => {
      versionManager.reloadApp();
    }, 10000); // Auto-update after 10 seconds
    return () => clearTimeout(timer);
  }
}, [showUpdate]);
```

## 🧪 Testing Commands

```bash
# Build and check version
npm run build
cat public/version.json

# Check asset hashes
ls dist/assets/
# Should see: main.abc123.js (with hash)

# Test cache headers (after deploy)
curl -I https://yoursite.com/
# Look for: Cache-Control: no-cache

curl -I https://yoursite.com/version.json
# Look for: Cache-Control: no-cache

curl -I https://yoursite.com/assets/main.abc123.js
# Look for: Cache-Control: max-age=31536000
```

## 🔍 Debugging Quick Checks

### ❌ Users See Old Version

```bash
1. curl -I https://yoursite.com/
   → Check: Cache-Control: no-cache ✅

2. ls dist/assets/
   → Check: Files have hash (main.abc123.js) ✅

3. curl https://yoursite.com/version.json
   → Check: Returns latest version ✅

4. If using CDN: Purge cache
```

### ❌ Update Notification Not Showing

```javascript
// Open DevTools → Console
1. Look for: "New version available: ..."
   → If missing: Version check failing

2. Network tab: Check for version.json requests
   → Should happen every 5 minutes

3. Check: versionManager.getCurrentVersion()
   → Should return version string
```

### ❌ Build Fails

```bash
1. node scripts/generate-version.js
   → Should create public/version.json

2. Check Node.js version
   node --version
   → Should be 16+

3. Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
```

## 📊 Cache Strategy Matrix

| File Type | Cache? | Duration | Why? |
|-----------|--------|----------|------|
| `index.html` | ❌ Never | 0 | Entry point must be fresh |
| `version.json` | ❌ Never | 0 | Enables update detection |
| `*.js` (hashed) | ✅ Yes | 1 year | Hash changes = new file |
| `*.css` (hashed) | ✅ Yes | 1 year | Hash changes = new file |
| `*.png` (hashed) | ✅ Yes | 1 year | Hash changes = new file |

## 🌐 Platform-Specific Quick Deploy

### Netlify / Vercel / Cloudflare Pages
```bash
git push    # Auto-deploys with correct headers ✅
```

### cPanel / Apache
```bash
npm run build
# Upload dist/ to public_html/
# Ensure .htaccess uploaded
```

### VPS / Nginx
```bash
npm run build
rsync -avz dist/ user@server:/var/www/html/
# Ensure nginx config has cache headers
sudo systemctl reload nginx
```

## 🎨 Customization Snippets

### Change Notification Position

```typescript
// Top center (default)
className="fixed top-4 left-1/2 -translate-x-1/2"

// Top right
className="fixed top-4 right-4"

// Bottom center
className="fixed bottom-4 left-1/2 -translate-x-1/2"
```

### Change Colors

```typescript
// Background
className="bg-white"           // White (default)
className="bg-black"           // Black
className="bg-[#CDFF00]"      // Brand color

// Border
className="border-[#CDFF00]"   // Brand (default)
className="border-gray-300"    // Gray
```

### Add Sound on Update

```typescript
const handleUpdate = () => {
  const audio = new Audio('/notification.mp3');
  audio.play();
  versionManager.reloadApp();
};
```

## 📈 Success Metrics

Monitor these after deployment:

| Metric | Target |
|--------|--------|
| Users on latest version | 100% within 5 min |
| Cache-clear support requests | 0 per week |
| Update notification shown | >0 after each deploy |
| Update completion rate | >80% click "Update" |

## 🆘 Emergency Rollback

If updates cause issues:

```typescript
// Quick disable in App.tsx
// Comment out:
// <UpdateNotification />

// Rebuild and deploy
npm run build
```

## 📚 Documentation Links

- **Comprehensive Guide**: [DEPLOYMENT_CACHE_GUIDE.md](./DEPLOYMENT_CACHE_GUIDE.md)
- **Quick Start**: [VERSION_UPDATE_README.md](./VERSION_UPDATE_README.md)
- **Architecture**: [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
- **Checklist**: [UPDATE_SYSTEM_CHECKLIST.md](./UPDATE_SYSTEM_CHECKLIST.md)
- **Summary**: [CACHE_SOLUTION_SUMMARY.md](./CACHE_SOLUTION_SUMMARY.md)

## 💡 Pro Tips

1. **Test on staging first** - Always deploy to staging and verify before production
2. **Monitor version checks** - Add analytics to track update notification show/dismiss rates
3. **Keep interval reasonable** - 5 minutes is optimal (not too frequent, not too slow)
4. **Clear CDN cache** - After deploy, purge CDN cache if using Cloudflare/CloudFront
5. **Communicate updates** - If major, tell users in the notification what's new

## 🔗 Quick Links

| Action | Command/URL |
|--------|-------------|
| Build | `npm run build` |
| Check version | `cat public/version.json` |
| Test locally | `npm run dev` |
| Preview build | `npm run preview` |
| Check cache | `curl -I https://yoursite.com/` |

## 📞 Support Checklist

If users report issues:

- [ ] Ask: "What browser and version?"
- [ ] Ask: "When did you last reload?"
- [ ] Check: Is latest version deployed?
- [ ] Check: Are cache headers correct?
- [ ] Guide: Hard refresh (Ctrl+Shift+R)
- [ ] Last resort: Clear all site data in browser

---

## ✅ Daily Health Check

Run this after each deployment:

```bash
# 1. Verify build
npm run build && echo "✅ Build successful"

# 2. Check version file
cat public/version.json | grep version && echo "✅ Version file OK"

# 3. Check hashed assets
ls dist/assets/*.js | grep -E '\.[a-f0-9]{8}\.js$' && echo "✅ Assets hashed"

# 4. Deploy
# ... your deployment command ...

# 5. Wait 5 minutes, then check your site
# 6. Verify update notification appears (if you're running old version)
```

---

**Last Updated**: March 12, 2026  
**Version System**: 1.0.0  
**Status**: ✅ Production Ready
