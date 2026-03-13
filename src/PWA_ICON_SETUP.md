# PWA Icon Setup Guide

## 📱 Icons Required

LocalFelo PWA needs two icon sizes in the `/public` folder:

1. **pwa-192x192.png** - 192x192 pixels
2. **pwa-512x512.png** - 512x512 pixels

---

## 🎨 Icon Specifications

### Design Elements:
- **Logo:** LocalFelo bright green leaf on black/dark background
- **Format:** PNG with transparency (optional)
- **Colors:** 
  - Bright green: #CDFF00
  - Background: Black or dark color
- **Safe zone:** 10% padding from edges (maskable safe zone)

### Technical Specs:
- **File format:** PNG
- **Color mode:** RGB
- **Transparency:** Optional (can have transparent or solid background)
- **Quality:** High resolution, optimized for web

---

## 📂 File Structure

After saving, your project should have:

```
/public
  ├── pwa-192x192.png  ← 192x192px icon
  └── pwa-512x512.png  ← 512x512px icon
```

---

## ✅ How to Save the Icons

### Option 1: Manual Save (Recommended)
1. Open the first icon image you have
2. Resize to 192x192 pixels (if needed)
3. Save as `/public/pwa-192x192.png`
4. Open the second icon image
5. Resize to 512x512 pixels (if needed)
6. Save as `/public/pwa-512x512.png`

### Option 2: Using Image Editing Tools

**Using Photoshop/GIMP:**
1. Open the icon image
2. Image → Image Size
3. Set width and height to 192px (or 512px)
4. Export as PNG
5. Save to `/public` folder

**Using Online Tools:**
1. Go to: https://www.iloveimg.com/resize-image
2. Upload your icon
3. Resize to 192x192 (then repeat for 512x512)
4. Download and save to `/public` folder

**Using Command Line (ImageMagick):**
```bash
# Resize to 192x192
convert your-icon.png -resize 192x192 public/pwa-192x192.png

# Resize to 512x512
convert your-icon.png -resize 512x512 public/pwa-512x512.png
```

---

## 🔍 Verification

After saving the icons, verify they're correct:

### Check File Sizes:
```bash
ls -lh public/pwa-*.png
```

Should show:
- `pwa-192x192.png` (typically 5-20 KB)
- `pwa-512x512.png` (typically 20-80 KB)

### Check Dimensions:
```bash
file public/pwa-192x192.png
file public/pwa-512x512.png
```

Should show:
- `PNG image data, 192 x 192`
- `PNG image data, 512 x 512`

### Visual Check:
Open both files and verify:
- ✅ LocalFelo logo is visible and centered
- ✅ Logo has proper padding (not touching edges)
- ✅ Colors are correct (bright green #CDFF00)
- ✅ Image is clear and not pixelated
- ✅ Background is appropriate (dark or transparent)

---

## 🚀 After Icons Are Saved

1. **Run npm install:**
   ```bash
   npm install
   ```

2. **Test locally:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Verify PWA manifest:**
   - Open DevTools → Application → Manifest
   - Check that both icons appear correctly

5. **Test install:**
   - On Android Chrome: Install banner should appear
   - On iOS Safari: Share → Add to Home Screen
   - Icon should display correctly on home screen

---

## ⚠️ Common Issues

### Issue: Icons don't appear in manifest
**Solution:** Clear cache and rebuild:
```bash
rm -rf node_modules/.vite
npm run build
```

### Issue: Icons are blurry on home screen
**Solution:** Ensure icons are exactly 192x192 and 512x512 pixels (not scaled up from smaller images)

### Issue: Icons have white/wrong background
**Solution:** 
- Use PNG with transparency
- Or ensure background color matches your design

### Issue: "Failed to fetch manifest" error
**Solution:** 
- Check that files are in `/public` folder (not `/src` or `/public/images`)
- Verify filenames are exactly `pwa-192x192.png` and `pwa-512x512.png`

---

## 📋 Checklist

Before deploying, ensure:

- [ ] `/public` folder exists
- [ ] `pwa-192x192.png` exists and is 192x192 pixels
- [ ] `pwa-512x512.png` exists and is 512x512 pixels
- [ ] Both icons display LocalFelo logo clearly
- [ ] Icons have proper padding (maskable safe zone)
- [ ] Both icons are optimized (< 100 KB each)
- [ ] Icons appear in browser DevTools → Application → Manifest
- [ ] npm install has been run
- [ ] App builds successfully (npm run build)

---

## ✅ Ready!

Once both icons are saved and verified, your PWA is ready for deployment with full icon support on both Android and iOS devices!

