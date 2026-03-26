# LocalFelo - Hosting Configuration Guide

This guide explains how to deploy LocalFelo on different hosting platforms to ensure proper SPA (Single Page Application) routing and Google indexing.

## The Problem

LocalFelo is a Single Page Application (SPA) that uses client-side routing. When users access URLs directly (like `https://www.localfelo.com/tasks`), the server needs to be configured to serve `index.html` for ALL routes, allowing React Router to handle navigation on the client side.

Without proper configuration, direct URL access results in **404 errors**.

---

## Solution Files Included

We've included configuration files for all major hosting platforms:

```
/vercel.json           → Vercel
/netlify.toml          → Netlify
/public/_redirects     → Netlify/Cloudflare Pages
/public/.htaccess      → Apache/cPanel/Shared Hosting
/public/404.html       → GitHub Pages/Static Hosts (fallback)
```

---

## Platform-Specific Setup

### 1. **Vercel** ✅ (Recommended)

**Configuration:** `vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Deployment:**
```bash
npm run build
vercel --prod
```

**Status:** ✅ Already configured

---

### 2. **Netlify** ✅

**Configuration:** `netlify.toml` + `public/_redirects`

**netlify.toml:**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**public/_redirects:**
```
/*    /index.html   200
```

**Deployment:**
```bash
npm run build
# Deploy via Netlify UI or CLI
netlify deploy --prod --dir=dist
```

**Status:** ✅ Already configured

---

### 3. **Apache / cPanel / Shared Hosting** ✅

**Configuration:** `/public/.htaccess`

The `.htaccess` file is now included in `/public/.htaccess`. It will automatically be copied to your build directory.

**Manual Setup (if needed):**
1. Build your app: `npm run build`
2. Upload the `dist` folder contents to your web root (usually `public_html`)
3. Ensure `.htaccess` is in the root directory
4. Make sure `mod_rewrite` is enabled on your Apache server

**To verify mod_rewrite is enabled:**
- Contact your hosting provider, OR
- Check your PHP info page (`<?php phpinfo(); ?>`)

**Status:** ✅ Already configured

---

### 4. **Nginx** 🔧

**Configuration:** Create `nginx.conf`

```nginx
server {
    listen 80;
    server_name www.localfelo.com localfelo.com;
    root /var/www/localfelo/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache control for static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
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

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

**Deployment:**
1. Build: `npm run build`
2. Copy `dist/*` to `/var/www/localfelo/dist/`
3. Update nginx config: `sudo nano /etc/nginx/sites-available/localfelo`
4. Create symlink: `sudo ln -s /etc/nginx/sites-available/localfelo /etc/nginx/sites-enabled/`
5. Test: `sudo nginx -t`
6. Reload: `sudo systemctl reload nginx`

---

### 5. **Cloudflare Pages** ✅

**Configuration:** `public/_redirects`

```
/*    /index.html   200
```

**Deployment:**
1. Connect your GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Deploy

**Status:** ✅ Already configured

---

### 6. **GitHub Pages** ✅

GitHub Pages doesn't support server-side redirects, so we use a special `404.html` trick.

**Configuration:** `/public/404.html`

This file automatically redirects to `index.html` while preserving the path in sessionStorage. The app then restores the correct route.

**Deployment:**
```bash
npm run build
# Copy dist to gh-pages branch or use gh-pages package
npx gh-pages -d dist
```

**Status:** ✅ Already configured

---

### 7. **Firebase Hosting**

**Configuration:** Create `firebase.json`

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|js|css|woff|woff2)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(html)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  }
}
```

**Deployment:**
```bash
npm run build
firebase deploy
```

---

### 8. **AWS S3 + CloudFront**

**S3 Setup:**
1. Upload `dist/*` to S3 bucket
2. Enable static website hosting
3. Set index document: `index.html`
4. Set error document: `index.html` (this handles 404s)

**CloudFront Setup:**
1. Create CloudFront distribution pointing to S3
2. Set default root object: `index.html`
3. Create custom error response:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200

---

## SEO & Google Indexing

### Current SEO Features ✅

1. **Meta Tags** - Comprehensive SEO meta tags in `index.html`
2. **Open Graph** - Social media sharing optimization
3. **JSON-LD Schema** - Structured data for rich snippets
4. **Sitemap** - `/public/sitemap.xml` (update with your routes)
5. **Robots.txt** - `/public/robots.txt`
6. **Canonical URLs** - Proper canonical tags

### Update Sitemap

Edit `/public/sitemap.xml` and add all your important routes:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.localfelo.com/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.localfelo.com/marketplace</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.localfelo.com/tasks</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.localfelo.com/wishes</loc>
    <priority>0.8</priority>
  </url>
  <!-- Add more routes -->
</urlset>
```

### Submit to Google

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property: `https://www.localfelo.com`
3. Verify ownership
4. Submit sitemap: `https://www.localfelo.com/sitemap.xml`

---

## Testing Your Deployment

After deploying, test these URLs directly in the browser:

- ✅ `https://www.localfelo.com/`
- ✅ `https://www.localfelo.com/marketplace`
- ✅ `https://www.localfelo.com/tasks`
- ✅ `https://www.localfelo.com/wishes`
- ✅ `https://www.localfelo.com/profile`

All should load without 404 errors.

---

## Troubleshooting

### Still Getting 404 Errors?

1. **Check your hosting platform** - Make sure you're using the correct config file
2. **Verify file deployment** - Ensure config files are in the deployed build
3. **Clear cache** - Hard refresh (Ctrl+Shift+R) or clear browser cache
4. **Check server logs** - Look for errors in your hosting platform's logs
5. **Verify mod_rewrite** (Apache) - Contact your host to enable it

### Config File Not Working?

- **Vercel/Netlify**: Config files must be in the repository root
- **Apache**: `.htaccess` must be in the web root with the build files
- **Nginx**: Config must be in `/etc/nginx/sites-available/`

---

## Current Hosting Platform

Based on your domain `https://www.localfelo.com`, you should:

1. **Identify your current host** (check your hosting dashboard)
2. **Apply the appropriate configuration** from this guide
3. **Rebuild and redeploy** with: `npm run build`
4. **Test all routes** to ensure they work

---

## Need Help?

If you're still experiencing issues:

1. Check which hosting platform you're using
2. Verify the appropriate config file is deployed
3. Check server error logs
4. Contact your hosting provider for mod_rewrite/redirect support

---

**Last Updated:** March 18, 2026
