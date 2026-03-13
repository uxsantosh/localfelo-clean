# 🎨 LocalFelo - Website Assets Setup Guide

## 📁 Simple Asset Setup for Website

Since you're building a **website** (not PWA) that will be converted to Android app via Android Studio, you only need **basic web assets**.

---

## ✅ What You Need to Add

### Files to Place in `/public/` folder:

```
public/
├── favicon.svg              ✅ Already exists (don't touch)
├── favicon.ico              ⬅️ ADD THIS (32×32 ICO for browser tabs)
├── og-image.png             ⬅️ ADD THIS (1200×630 for Facebook/WhatsApp)
├── twitter-image.png        ⬅️ ADD THIS (1200×600 for Twitter)
└── logo.png                 ⬅️ ADD THIS (512×512 for SEO)
```

**That's it! Only 4 files needed!** 🎉

---

## 🎨 Design Specifications

### Brand Colors
- **Background**: `#CDFF00` (Bright Green)
- **Text/Logo**: `#000000` (Black)
- **Never**: Green text on green background ❌

### File Requirements

| File | Size | Format | Purpose |
|------|------|--------|---------|
| `favicon.ico` | 32×32 | ICO | Browser tab icon |
| `og-image.png` | 1200×630 | PNG/JPG | Facebook/WhatsApp sharing preview |
| `twitter-image.png` | 1200×600 | PNG/JPG | Twitter card preview |
| `logo.png` | 512×512 | PNG | SEO & general use |

---

## 🖼️ How to Create Each File

### 1. **favicon.ico** (Browser Tab Icon)

**What it looks like:**
```
┌──────┐
│#CDFF00│  ← Bright green background
│  [LF] │  ← Simplified LocalFelo logo
└──────┘
32×32 pixels
```

**How to create:**
1. Use your existing logo from `/assets/logo.svg`
2. Export as 32×32 PNG with green background
3. Convert to ICO format: https://favicon.io/favicon-converter/
4. Save as `favicon.ico` in `/public/`

---

### 2. **og-image.png** (Social Media Preview)

**What it looks like:**
```
┌────────────────────────────────────────────────┐
│  Background: Bright Green (#CDFF00)            │
│                                                │
│           [LocalFelo Logo - Black]             │
│                                                │
│      India's Hyperlocal Marketplace            │
│                                                │
│   🏪 Buy & Sell  |  ⭐ Wishes  |  💼 Tasks    │
│                                                │
│  Connect with your local community             │
│                                                │
└────────────────────────────────────────────────┘
1200×630 pixels
```

**How to create:**

**Option A - Canva (Easiest):**
1. Go to https://www.canva.com/
2. Create custom size: 1200×630
3. Add bright green background (#CDFF00)
4. Add LocalFelo logo (from `/assets/logo.svg`)
5. Add text: "India's Hyperlocal Marketplace"
6. Add emoji icons: 🏪 ⭐ 💼
7. Download as PNG
8. Save as `og-image.png` in `/public/`

**Option B - Figma:**
1. Create 1200×630 frame
2. Fill with #CDFF00
3. Import logo from `/assets/logo.svg`
4. Add text layers (black text)
5. Export as PNG
6. Save to `/public/`

**Option C - Online Tool:**
- Use: https://www.opengraph.xyz/ (social media image generator)

---

### 3. **twitter-image.png** (Twitter Card)

Same as `og-image.png` but **1200×600** instead of 1200×630.

Just resize your og-image to 1200×600 and save as `twitter-image.png`.

---

### 4. **logo.png** (General Purpose Logo)

**Simple!**
1. Export your `/assets/logo.svg` as PNG
2. Size: 512×512 pixels
3. Background: Bright green (#CDFF00)
4. Logo: Black, centered
5. Save as `logo.png` in `/public/`

---

## 🚀 Quick Setup Steps

### Step 1: Download Code to VS Code
```bash
# Your LocalFelo project folder
cd localfelo
```

### Step 2: Add 4 Image Files

Drag and drop these files into `/public/` folder:
- `favicon.ico` (32×32)
- `og-image.png` (1200×630)
- `twitter-image.png` (1200×600)
- `logo.png` (512×512)

### Step 3: Verify Files Exist
```bash
ls -la public/

# You should see:
# favicon.ico ✅
# og-image.png ✅
# twitter-image.png ✅
# logo.png ✅
# favicon.svg ✅ (already there)
```

### Step 4: Test Locally
```bash
npm run dev

# Check:
# - Browser tab shows favicon ✅
# - http://localhost:5173/og-image.png loads ✅
# - http://localhost:5173/logo.png loads ✅
```

### Step 5: Done! 🎉
Build and deploy:
```bash
npm run build
```

---

## 🎨 Design Tools

### For Social Media Images:
- **Canva**: https://www.canva.com/ (Easy, free)
- **Figma**: https://www.figma.com/ (Professional)
- **OpenGraph**: https://www.opengraph.xyz/ (Quick generator)

### For Favicon:
- **Favicon.io**: https://favicon.io/ (ICO converter)
- **RealFavicon**: https://realfavicongenerator.net/

### For Image Optimization:
- **TinyPNG**: https://tinypng.com/ (Compress files)
- **Squoosh**: https://squoosh.app/ (Google's tool)

---

## 📊 Recommended File Sizes

| File | Target Size | Max Size |
|------|-------------|----------|
| favicon.ico | ~15 KB | 50 KB |
| og-image.png | 300-500 KB | 1 MB |
| twitter-image.png | 300-500 KB | 1 MB |
| logo.png | ~50 KB | 200 KB |

**Total**: Under 1.5 MB for all assets

---

## ✅ Verification Checklist

Before deploying:

- [ ] `favicon.ico` exists in `/public/` (32×32)
- [ ] `og-image.png` exists in `/public/` (1200×630)
- [ ] `twitter-image.png` exists in `/public/` (1200×600)
- [ ] `logo.png` exists in `/public/` (512×512)
- [ ] All files have bright green background (#CDFF00)
- [ ] All files optimized (under max sizes)
- [ ] Favicon visible in browser tab
- [ ] `npm run build` completes without errors
- [ ] Ready to deploy! 🚀

---

## 🔍 Testing After Deployment

### 1. Favicon Test
- Open your website
- Check browser tab shows favicon ✅

### 2. Social Media Test
- Share link on WhatsApp
- Preview should show `og-image.png` ✅

### 3. Twitter Test
- Share link on Twitter
- Card should show `twitter-image.png` ✅

### 4. SEO Test
- View page source
- Search for `og-image.png` ✅
- Search for `logo.png` ✅

---

## 🆘 Common Issues

### Issue: Favicon not showing
**Solution:**
```bash
# Hard refresh browser
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Clear browser cache
# Or use incognito/private mode
```

### Issue: Social preview not showing
**Solution:**
- Images must be publicly accessible (HTTPS)
- Check correct dimensions (1200×630 for OG)
- Use Facebook Debugger: https://developers.facebook.com/tools/debug/
- Use Twitter Card Validator: https://cards-dev.twitter.com/validator

### Issue: Files not loading after build
**Solution:**
```bash
# Ensure files are in /public/ not elsewhere
# Rebuild project
npm run build

# Check dist folder has the files
ls -la dist/
```

---

## 💡 Pro Tips

1. **Use existing logo**: Export `/assets/logo.svg` at different sizes
2. **Keep it simple**: Clean design works best for social sharing
3. **Test on real devices**: Check how it looks on mobile
4. **Optimize images**: Use TinyPNG before uploading
5. **Consistent branding**: All assets should match your brand

---

## 📱 Android App Note

Since you're converting to Android app in Android Studio:
- These web assets are for the **website version**
- Android app will use different assets (configured in Android Studio)
- You'll need Android-specific icons/splash screens in Android Studio
- These social media images still useful for sharing from the app

---

## 🎯 Priority Order

If you're short on time, add in this order:

1. **favicon.ico** ⭐ HIGH (browser tab icon)
2. **og-image.png** ⭐ HIGH (WhatsApp/Facebook sharing)
3. **logo.png** ⭐ MEDIUM (SEO)
4. **twitter-image.png** ⭐ LOW (Twitter only)

You can deploy with just favicon + og-image and add the rest later!

---

## ✅ Summary

**Total files needed:** 4  
**Total size:** ~1.5 MB  
**Time to create:** 15-30 minutes  
**Difficulty:** Easy 😊

Once these 4 files are added to `/public/`, your website is ready for production deployment!

---

## 📞 Need Help?

If you need any clarification or have questions, let me know!

**Created**: March 10, 2026  
**For**: Website version (not PWA)  
**Status**: ✅ Ready to Use
