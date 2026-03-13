# 🚀 Automatic Version Updates - Quick Start

## What This Solves

**Problem**: Users see old versions of LocalFelo unless they manually clear cache or hard refresh.

**Solution**: Automatic version detection that notifies users when a new version is available with one-click update.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Developer pushes update → CI/CD builds → Deploys            │
│  2. Build generates unique version (timestamp-based)             │
│  3. User's app checks /version.json every 5 minutes             │
│  4. New version detected → Shows update notification            │
│  5. User clicks "Update Now" → App reloads with new version     │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

✅ **Zero manual intervention** - Works automatically  
✅ **Non-intrusive** - Users can dismiss and update later  
✅ **Cache-proof** - HTML and version.json never cached  
✅ **Asset optimization** - JS/CSS cached with unique hash  
✅ **Platform agnostic** - Works on any hosting provider  

## Quick Deploy Checklist

- [x] Run `npm run build` (automatically generates version)
- [x] Deploy `dist/` folder to your hosting platform
- [x] Ensure cache headers are configured (auto for Netlify/Vercel/Cloudflare)
- [x] For Apache/Nginx, ensure `.htaccess` or config is applied
- [x] Test by deploying twice and waiting 5 minutes

## Files Added

```
/scripts/generate-version.js           # Generates version during build
/src/utils/version-manager.ts          # Version checking logic  
/src/components/UpdateNotification.tsx # Update notification UI
/public/_headers                       # Cache headers (Netlify/Cloudflare)
/vercel.json                          # Cache headers (Vercel)
/netlify.toml                         # Cache headers (Netlify)
/public/.htaccess                     # Cache headers (Apache)
```

## Files Modified

```
/vite.config.ts     # Added version injection + cache-busting hash
/package.json       # Added prebuild script
/App.tsx            # Added UpdateNotification component
```

## Testing

### Test Update Flow

1. **Deploy version 1**:
   ```bash
   npm run build
   # Deploy to hosting
   ```

2. **Wait 2 minutes** (let users load the app)

3. **Deploy version 2**:
   ```bash
   npm run build
   # Deploy to hosting
   ```

4. **Within 5 minutes**, users should see:
   ```
   ┌──────────────────────────────────────────────┐
   │  🔄  New Version Available                   │
   │                                               │
   │  A new version of LocalFelo is available.    │
   │  Please update to get the latest features.   │
   │                                               │
   │  [Update Now]  [Later]                   [×] │
   └──────────────────────────────────────────────┘
   ```

### Verify Cache Headers

**Open DevTools → Network Tab**

| File Type | Cache-Control Header | Why? |
|-----------|---------------------|------|
| `index.html` | `no-cache, no-store` | Always fetch fresh HTML |
| `version.json` | `no-cache, no-store` | Always check for updates |
| `main.abc123.js` | `max-age=31536000, immutable` | Hash changes = new file |
| `style.xyz789.css` | `max-age=31536000, immutable` | Hash changes = new file |

## Configuration

### Change Check Interval

**File**: `/src/utils/version-manager.ts`

```typescript
// Default: Check every 5 minutes
private checkInterval: number = 5 * 60 * 1000;

// More frequent: Check every 1 minute
private checkInterval: number = 1 * 60 * 1000;

// Less frequent: Check every 15 minutes  
private checkInterval: number = 15 * 60 * 1000;
```

### Change Reminder Delay

**File**: `/src/components/UpdateNotification.tsx`

```typescript
// Default: Remind after 30 minutes
setTimeout(() => {
  setShowUpdate(true);
}, 30 * 60 * 1000);

// Remind after 1 hour
setTimeout(() => {
  setShowUpdate(true);
}, 60 * 60 * 1000);
```

## Platform-Specific Setup

### Netlify / Vercel / Cloudflare Pages
✅ **Auto-configured** - Just deploy, no extra steps

### Apache (cPanel / Shared Hosting)
1. Upload `dist/` contents to `public_html/`
2. Ensure `.htaccess` is uploaded (including the dot)
3. Enable `mod_headers` and `mod_rewrite` in cPanel

### Nginx
Add to server block:
```nginx
# Never cache HTML and version.json
location ~* \.(html)$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}

location = /version.json {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}

# Cache hashed assets for 1 year
location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

## Troubleshooting

### ❌ Users still see old version

**Fix 1**: Check cache headers
```bash
curl -I https://yoursite.com/version.json
# Should show: Cache-Control: no-cache, no-store, must-revalidate
```

**Fix 2**: Check asset hashes
```bash
ls dist/assets/
# Should show: main.a1b2c3d4.js (not just main.js)
```

**Fix 3**: Clear CDN cache (if using Cloudflare/CloudFront)

### ❌ Update notification not showing

**Fix 1**: Check console for errors
```javascript
// Open DevTools → Console
// Should see: "New version available: 1.0.0.1710234567890"
```

**Fix 2**: Verify version check is running
```javascript
// Network tab should show request to version.json every 5 minutes
```

### ❌ Build fails with "Cannot find version.json"

**Fix**: Manually run version generation
```bash
node scripts/generate-version.js
npm run build
```

## Advanced: Force Updates

If you want to **force updates** without user confirmation:

**File**: `/src/components/UpdateNotification.tsx`

```typescript
useEffect(() => {
  if (showUpdate) {
    // Auto-update after 10 seconds
    const timer = setTimeout(() => {
      setIsRefreshing(true);
      versionManager.reloadApp();
    }, 10000);
    
    return () => clearTimeout(timer);
  }
}, [showUpdate]);
```

## Summary

Your LocalFelo app now:
- ✅ Automatically detects new versions
- ✅ Notifies users with friendly UI
- ✅ Updates with one click
- ✅ Never shows stale content
- ✅ Optimizes asset caching

**Users will always get the latest version within 5 minutes of deployment!** 🎉

For detailed documentation, see [DEPLOYMENT_CACHE_GUIDE.md](./DEPLOYMENT_CACHE_GUIDE.md)
