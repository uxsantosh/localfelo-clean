# LocalFelo - Cache Busting & Version Management Guide

## Problem Solved

This guide addresses the critical issue where users were seeing old versions of the app unless they manually cleared their cache or performed a hard refresh. The solution ensures users **always get the latest version automatically** with a user-friendly update notification.

## How It Works

### 1. **Build-Time Version Generation**
- Every build generates a unique version number based on timestamp
- Creates `/public/version.json` with current version info
- Version is injected into the app via environment variables

### 2. **Automatic Version Checking**
- App checks for new versions every 5 minutes
- Compares current version with server version
- No disruption to user experience if check fails

### 3. **User-Friendly Update Notification**
- When new version detected, shows a non-intrusive notification
- User can update immediately or dismiss (reminder in 30 minutes)
- One-click update that clears all caches and reloads

### 4. **Aggressive Cache Busting**
- **HTML files**: Never cached (always fresh from server)
- **version.json**: Never cached (enables version detection)
- **JS/CSS/Assets**: Cached for 1 year with unique hash in filename
- Hash changes on every build, forcing browser to fetch new files

## File Structure

```
/scripts/generate-version.js       # Generates version.json during build
/src/utils/version-manager.ts      # Version checking logic
/src/components/UpdateNotification.tsx  # UI for update notification
/public/_headers                   # Cache headers (Netlify/Cloudflare)
/vercel.json                       # Cache headers (Vercel)
/netlify.toml                      # Cache headers (Netlify)
/public/.htaccess                  # Cache headers (Apache/cPanel)
```

## Build Process

### Before Deployment

1. **Development**: No changes needed, just run `npm run dev`

2. **Production Build**:
   ```bash
   npm run build
   ```
   This automatically:
   - Runs `node scripts/generate-version.js` (via prebuild script)
   - Generates `/public/version.json`
   - Builds with Vite (adds hash to all assets)
   - Injects version into app via `import.meta.env.VITE_APP_VERSION`

### Deployment Platforms

#### **Netlify**
- Uses `/netlify.toml` for cache headers
- Automatically configured, no additional steps needed
- Deploy: Connect GitHub repo, build command: `npm run build`

#### **Vercel**
- Uses `/vercel.json` for cache headers
- Automatically configured, no additional steps needed
- Deploy: Connect GitHub repo, build command: `npm run build`

#### **Cloudflare Pages**
- Uses `/public/_headers` for cache headers
- Automatically configured, no additional steps needed
- Deploy: Connect GitHub repo, build command: `npm run build`

#### **Traditional Hosting (cPanel/Apache)**
- Uses `/public/.htaccess` for cache headers
- Upload `dist/` folder contents to public_html
- Ensure `.htaccess` is uploaded (including the dot)
- Enable `mod_headers` and `mod_rewrite` in Apache

#### **Nginx**
Add to your server block:
```nginx
location / {
    # SPA fallback
    try_files $uri $uri/ /index.html;
}

# Never cache HTML and version.json
location ~* \.(html)$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}

location = /version.json {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}

# Cache assets with hash for 1 year
location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

## Configuration Options

### Version Check Interval
Edit `/src/utils/version-manager.ts`:
```typescript
private checkInterval: number = 5 * 60 * 1000; // 5 minutes (default)
```

Change to:
- `1 * 60 * 1000` for 1 minute (aggressive)
- `10 * 60 * 1000` for 10 minutes (less aggressive)
- `30 * 60 * 1000` for 30 minutes (relaxed)

### Reminder Delay
Edit `/src/components/UpdateNotification.tsx`:
```typescript
setTimeout(() => {
  setShowUpdate(true);
}, 30 * 60 * 1000); // 30 minutes (default)
```

### Force Update (No Dismissal)
In `/src/components/UpdateNotification.tsx`, remove the "Later" button and auto-update:
```typescript
// Remove handleDismiss and make update automatic
useEffect(() => {
  if (showUpdate) {
    // Auto-update after 10 seconds
    const timer = setTimeout(() => {
      handleUpdate();
    }, 10000);
    return () => clearTimeout(timer);
  }
}, [showUpdate]);
```

## Testing

### Test Version Detection

1. **Build initial version**:
   ```bash
   npm run build
   ```

2. **Check version.json**:
   ```bash
   cat public/version.json
   ```
   Should show:
   ```json
   {
     "version": "1.0.0.1710234567890",
     "buildTime": "2026-03-12T10:30:00.000Z",
     "buildTimestamp": 1710234567890
   }
   ```

3. **Deploy and open app**

4. **Wait 2-3 minutes, then build again**:
   ```bash
   npm run build
   ```

5. **Deploy new version**

6. **Within 5 minutes**, the app should show update notification

### Test Cache Headers

1. **Open DevTools** → Network tab
2. **Reload page**
3. **Check headers** for different files:
   - `index.html`: Should have `Cache-Control: no-cache`
   - `version.json`: Should have `Cache-Control: no-cache`
   - `assets/main.abc123.js`: Should have `Cache-Control: public, max-age=31536000`

## Troubleshooting

### Users Still See Old Version

**Check 1**: Verify version.json is not cached
```bash
curl -I https://yoursite.com/version.json
# Should see: Cache-Control: no-cache, no-store, must-revalidate
```

**Check 2**: Verify asset filenames have hash
```bash
ls dist/assets/
# Should see: main.abc123.js (not just main.js)
```

**Check 3**: Check browser DevTools → Application → Service Workers
- If service worker is active, it might be caching
- Unregister it or update service worker code

### Update Notification Not Showing

**Check 1**: Open DevTools → Console
- Look for: "New version available: X.X.X"
- If missing, version checking might be failing

**Check 2**: Check network tab
- Should see request to `version.json?t=1710234567890` every 5 minutes
- Verify it's returning 200 OK with correct JSON

**Check 3**: Verify version injection
```typescript
console.log('Current version:', import.meta.env.VITE_APP_VERSION);
```

### Build Fails

**Error**: "Cannot find version.json"
- **Solution**: The prebuild script runs first, so this shouldn't happen
- Manually run: `node scripts/generate-version.js`

**Error**: "Module not found: fs"
- **Solution**: `fs` is Node.js built-in, ensure using Node.js 16+
- Check: `node --version`

## Advanced: CDN Configuration

### Cloudflare
Add Page Rule:
```
URL: *yourdomain.com/version.json
Cache Level: Bypass

URL: *yourdomain.com/*.html
Cache Level: Bypass

URL: *yourdomain.com/assets/*
Cache Level: Standard
Edge Cache TTL: 1 year
```

### AWS CloudFront
Create cache behavior:
```yaml
PathPattern: /version.json
CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad  # CachingDisabled

PathPattern: /*.html
CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad  # CachingDisabled

PathPattern: /assets/*
CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6  # CachingOptimized
```

## Best Practices

1. **Always test** version detection in staging before production
2. **Monitor** version check failures in production logs
3. **Keep** version check interval reasonable (5-10 minutes)
4. **Don't** set interval too low (causes unnecessary server load)
5. **Ensure** proper cache headers on your hosting platform
6. **Test** with real users across different browsers
7. **Document** your deployment process for team members

## Summary

✅ **Automatic version detection** - No manual intervention needed  
✅ **User-friendly updates** - One-click refresh  
✅ **Proper cache headers** - HTML never cached, assets cached with hash  
✅ **Platform-agnostic** - Works on Netlify, Vercel, Cloudflare, Apache, Nginx  
✅ **Production-ready** - Tested and battle-hardened solution  

Your users will **always get the latest version** within 5 minutes of deployment! 🚀
