# 🚀 OldCycle - Razorhost cPanel Deployment Guide

This guide will walk you through building and deploying your OldCycle app to Razorhost cPanel hosting.

---

## 📋 Prerequisites

Before you begin, make sure you have:
- ✅ Node.js installed (v18 or higher)
- ✅ Access to your Razorhost cPanel
- ✅ Supabase project setup and credentials
- ✅ FTP/File Manager access to cPanel

---

## 🛠️ Step 1: Build the Production App

### 1.1 Install Dependencies (if not already done)
```bash
npm install
```

### 1.2 Verify Supabase Configuration
Make sure your Supabase credentials are set in `/lib/supabaseClient.ts`:
```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

⚠️ **IMPORTANT**: For production, consider using environment variables or moving these to a config file.

### 1.3 Build the App
Run the build command:
```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Bundle and minify all files
- Optimize assets (images, CSS, JS)
- Create a production-ready `/dist` folder

✅ **Expected Output**: A `/dist` folder with:
- `index.html` - Main HTML file
- `assets/` - Optimized CSS, JS, and images
- `.htaccess` - Apache configuration for routing

---

## 📤 Step 2: Upload to Razorhost cPanel

### Option A: Using cPanel File Manager (Recommended for beginners)

1. **Login to cPanel**
   - Go to your Razorhost cPanel URL
   - Enter your username and password

2. **Navigate to File Manager**
   - Find "File Manager" in cPanel dashboard
   - Click to open

3. **Go to Public Directory**
   - Navigate to `public_html` (or `www` or `htdocs` depending on your setup)
   - If deploying to subdomain, go to the subdomain folder

4. **Clear Existing Files (if any)**
   - Select all existing files in the directory
   - Click "Delete"

5. **Upload the Build Files**
   - Click "Upload" button
   - Select ALL files from your local `/dist` folder:
     - `index.html`
     - `.htaccess`
     - `assets/` folder
     - Any other files in `/dist`
   - Wait for upload to complete

6. **Set Permissions**
   - Select the uploaded `.htaccess` file
   - Click "Permissions"
   - Set to 644
   - Click "Change Permissions"

### Option B: Using FTP Client (FileZilla, WinSCP, etc.)

1. **Get FTP Credentials**
   - In cPanel, go to "FTP Accounts"
   - Note your FTP hostname, username, and password

2. **Connect via FTP**
   - Open your FTP client
   - Connect using your credentials
   - Protocol: FTP or SFTP (if available)
   - Port: 21 (FTP) or 22 (SFTP)

3. **Upload Files**
   - Navigate to `public_html` on remote server
   - Upload ALL contents of `/dist` folder
   - Ensure `.htaccess` is included

---

## ⚙️ Step 3: Configure cPanel Settings

### 3.1 Set Default Document (if needed)
1. In cPanel, go to "Indexes"
2. Ensure `index.html` is listed as a priority index file
3. If not, add it

### 3.2 Enable .htaccess (usually enabled by default)
1. In cPanel, check "Apache Configuration" or "MultiPHP INI Editor"
2. Ensure `AllowOverride` is set to `All`
3. If you can't change this, contact Razorhost support

### 3.3 Setup SSL Certificate (Highly Recommended)
1. In cPanel, go to "SSL/TLS Status"
2. Enable AutoSSL (Let's Encrypt - FREE)
3. Wait for certificate to be issued (~5 minutes)
4. Your site will be accessible via `https://`

---

## 🔐 Step 4: Configure Supabase for Production

### 4.1 Add Your Domain to Supabase Allowed Origins
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your production URL to "Site URL":
   ```
   https://yourdomain.com
   ```
3. Add to "Redirect URLs":
   ```
   https://yourdomain.com
   https://yourdomain.com/**
   ```

### 4.2 Update CORS Settings (if needed)
In Supabase Dashboard → Project Settings → API:
- Add your domain to allowed origins

---

## ✅ Step 5: Test Your Deployment

### 5.1 Basic Tests
Visit your website and test:
- ✅ Homepage loads correctly
- ✅ Categories display properly
- ✅ Location selector works
- ✅ Logo click navigates to home
- ✅ Listing cards display with images
- ✅ Search functionality works

### 5.2 Authentication Tests
- ✅ Click "Sell" button → Login modal opens
- ✅ Submit Name + Phone Number
- ✅ Token is stored in localStorage
- ✅ Can create a listing

### 5.3 Deep Link Tests
Test these URLs directly to ensure routing works:
- `https://yourdomain.com/` - Home
- `https://yourdomain.com/listing/123` - Listing detail (should redirect to home if ID doesn't exist)
- All should load properly (not 404)

### 5.4 Mobile Tests
- ✅ Open on mobile device
- ✅ Test responsive layout
- ✅ Bottom navigation works
- ✅ Touch interactions work

---

## 🐛 Common Issues & Solutions

### Issue 1: Page Refreshes Show 404 Error
**Problem**: Direct URLs or page refresh shows 404  
**Solution**: 
- Ensure `.htaccess` file is uploaded and in the root directory
- Check that cPanel has `mod_rewrite` enabled
- Contact Razorhost support to enable `AllowOverride All`

### Issue 2: Supabase Connection Fails
**Problem**: Data doesn't load, authentication fails  
**Solution**:
- Check browser console for CORS errors
- Verify Supabase URL and Key in `/lib/supabaseClient.ts`
- Add your domain to Supabase allowed origins
- Check Supabase project is not paused (billing issue)

### Issue 3: Images Don't Load
**Problem**: Placeholder images or broken images  
**Solution**:
- Check `assets/` folder was uploaded completely
- Verify image paths in browser DevTools
- Ensure Supabase Storage bucket is public (for listing images)

### Issue 4: Blank White Screen
**Problem**: Website shows blank page  
**Solution**:
- Open browser DevTools (F12)
- Check Console for JavaScript errors
- Verify all files were uploaded correctly
- Check `index.html` is in root directory

### Issue 5: CSS Not Applied / Looks Broken
**Problem**: Website loads but styling is wrong  
**Solution**:
- Check `assets/` folder contains CSS files
- Clear browser cache (Ctrl + Shift + R)
- Verify file permissions (should be 644 for files, 755 for folders)

---

## 🔄 Updating Your Live Site

When you make changes to your app:

1. **Make code changes** in your local project
2. **Build again**: `npm run build`
3. **Upload new files**: 
   - Delete old files from `public_html` (except `.htaccess` if unchanged)
   - Upload new files from `/dist`
   - Or overwrite all files

**Pro Tip**: Use FTP sync feature to only upload changed files for faster updates!

---

## 📊 Performance Optimization (Optional)

### Enable Cloudflare (FREE)
1. Sign up at cloudflare.com
2. Add your domain
3. Update nameservers at Razorhost
4. Enable CDN caching for static assets
5. Enjoy faster load times globally!

### Compress Images
Before uploading listing images:
- Use TinyPNG or Squoosh to compress
- Aim for <200KB per image
- Convert to WebP format if possible

---

## 🆘 Need Help?

### Check These First:
1. ✅ Browser Console (F12) - Check for errors
2. ✅ Supabase Dashboard - Check API logs
3. ✅ cPanel Error Logs - Check Apache errors

### Contact Support:
- **Razorhost Support**: For cPanel/hosting issues
- **Supabase Support**: For database/API issues
- **GitHub Issues**: For app code issues

---

## 🎉 Congratulations!

Your OldCycle marketplace is now live! 🚀

**Next Steps**:
- Share your website link
- Test thoroughly
- Monitor Supabase usage
- Collect user feedback
- Iterate and improve!

---

## 📱 Quick Checklist

Before going live, verify:
- [ ] Production build created (`npm run build`)
- [ ] All files uploaded to cPanel
- [ ] `.htaccess` file uploaded
- [ ] SSL certificate enabled
- [ ] Supabase credentials configured
- [ ] Domain added to Supabase allowed origins
- [ ] Homepage loads correctly
- [ ] Login/authentication works
- [ ] Create listing works
- [ ] Browse listings works
- [ ] Mobile responsive works
- [ ] All links work (no 404s)
- [ ] Images load properly

---

**Built with ❤️ for Indian users | OldCycle - Your Local Marketplace**
