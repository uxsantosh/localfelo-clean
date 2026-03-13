# ⚡ Quick Build Commands

## 🔨 Build for Production

```bash
npm run build
```

**Output**: Creates `/dist` folder with production files

---

## 👀 Preview Production Build Locally

```bash
npm run preview
```

**URL**: http://localhost:4173

---

## 🧪 Development Mode (Local Testing)

```bash
npm run dev
```

**URL**: http://localhost:5173

---

## 📋 Quick Deployment Steps

### 1️⃣ Build
```bash
npm run build
```

### 2️⃣ Upload to cPanel
- Login to cPanel File Manager
- Navigate to `public_html`
- Delete old files (if updating)
- Upload ALL files from `/dist` folder
- ⚠️ **Don't forget `.htaccess` file!**

### 3️⃣ Test
- Visit: https://oldcycle.hueandhype.com
- Test all features
- Check browser console for errors

---

## 🚨 If Build Fails

### Check TypeScript errors:
```bash
npx tsc --noEmit
```

### Clean and rebuild:
```bash
rm -rf dist
rm -rf node_modules
npm install
npm run build
```

---

## 📦 What's in the Build?

```
dist/
├── index.html          # Main HTML
├── .htaccess          # URL routing config
└── assets/
    ├── logo.svg
    ├── *.js           # JavaScript bundles
    ├── *.css          # Optimized CSS
    └── *.png/svg      # Images
```

---

## ✅ Files to Upload to cPanel

Upload **EVERYTHING** from `/dist` folder:
- ✅ `index.html`
- ✅ `.htaccess` ← **CRITICAL for URL routing**
- ✅ `assets/` folder (entire folder with all files)

---

## 🔧 Production URLs to Configure

### Google OAuth Console:
- Authorized origins: `https://oldcycle.hueandhype.com`
- Redirect URIs: `https://oldcycle.hueandhype.com/`
- Privacy URL: `https://oldcycle.hueandhype.com/privacy`
- Terms URL: `https://oldcycle.hueandhype.com/terms`

### Supabase Dashboard:
- Site URL: `https://oldcycle.hueandhype.com`
- Redirect URLs: `https://oldcycle.hueandhype.com/**`

---

## 🧪 Test These After Deploy

- [ ] Homepage: https://oldcycle.hueandhype.com/
- [ ] Privacy: https://oldcycle.hueandhype.com/privacy
- [ ] Terms: https://oldcycle.hueandhype.com/terms
- [ ] About: https://oldcycle.hueandhype.com/about
- [ ] Safety: https://oldcycle.hueandhype.com/safety
- [ ] Contact: https://oldcycle.hueandhype.com/contact
- [ ] Google Sign-In works
- [ ] Create listing works
- [ ] URL changes when navigating
- [ ] Browser back button works
- [ ] Refresh page maintains URL

---

## 💡 Pro Tips

### Faster Updates:
Only upload changed files instead of everything:
- Code changed? → Upload `index.html` + `assets/*.js`
- Styles changed? → Upload `assets/*.css`

### Clear Browser Cache:
After deploy: `Ctrl + Shift + R` (hard refresh)

### Check for Errors:
Open DevTools (F12) → Console tab

---

## 📞 Quick Help

**Build fails?** → Check TypeScript errors with `npx tsc --noEmit`

**Blank page?** → Check `.htaccess` uploaded & browser console

**404 on URLs?** → Verify `.htaccess` in root of public_html

**Sign-in fails?** → Check Google OAuth redirect URIs

**No data?** → Check Supabase credentials & allowed origins

---

## 🎯 One-Command Deploy Summary

```bash
# Build the app
npm run build

# Output is in /dist folder
# Upload contents to cPanel public_html
# Test at https://oldcycle.hueandhype.com
```

---

**That's it! 🚀**
