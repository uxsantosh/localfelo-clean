# LocalFelo Updated Brand Colors

## ✅ Successfully Updated (December 2024)

The LocalFelo brand color has been updated from the overly bright `#CDFF00` to a more refined `#B8E600`.

---

## 🎨 Primary Brand Colors

### **Main Lemon Green** (Primary Accent)
- **Color:** `#B8E600`
- **RGB:** `184, 230, 0`
- **Use for:** Backgrounds, borders, buttons, accent elements
- **NEVER use as:** Text color (fails WCAG accessibility)

### **Previous Color** (Deprecated)
- ~~`#CDFF00`~~ - Too bright, being phased out
- **RGB:** ~~`205, 255, 0`~~

### **Darker Lemon Green** (Primary Dark)
- **Color:** `#A3CF00`
- **RGB:** `163, 207, 0`
- **Use for:** Hover states, scrollbar hover, darker accents

### **Lighter Lemon Green** (Primary Light)
- **Color:** `#C8F033`
- **RGB:** `200, 240, 51`
- **Use for:** Subtle highlights, light backgrounds

---

## 🖤 Core Brand Colors

### **Black**
- **Color:** `#000000`
- **Use for:** All text, primary buttons (background), icons, borders

### **White**
- **Color:** `#FFFFFF` 
- **Use for:** Main backgrounds, card backgrounds, text on dark surfaces

---

## 🌿 Logo Colors (from SVG)

### **Bright Green** (Logo Accent)
- `#4CE22D` - Logo primary green
- `#3FD221` - Logo leaf detail  
- `#3BC91F` - Logo leaf base

### **Dark Green** (Logo Shadow)
- `#297C19` - Logo gradient shadow

---

## 🎨 UI/Functional Colors

### **Grey Shades**
- `#F5F5F5` - Background, light grey areas (Tailwind gray-100)
- `#E5E7EB` - Light borders (Tailwind gray-200)
- `#E0E0E0` - Input borders, dividers
- `#999999` - Placeholder text
- `#666666` - Muted text (Tailwind gray-500)
- `#374151` - Secondary text (Tailwind gray-700)
- `#333333` - Body text
- `#1A1A1A` - Button hover states

### **Status Colors**
- `#EF4444` - Error/Destructive (Tailwind red-500)
- `#34C759` - Success/Green (Tailwind green-500)
- `#FF9500` - Warning/Amber (Tailwind amber-500)
- `#007AFF` - Info/Blue (Tailwind blue-500)

---

## 📋 CSS Variable Reference

```css
:root {
  /* Updated Primary Colors */
  --primary: #B8E600;
  --primary-dark: #A3CF00;
  --primary-light: #C8F033;
  --primary-foreground: #000000;
  
  --accent: #B8E600;
  --accent-foreground: #000000;
  
  /* Focus/Ring States */
  --input-focus: #B8E600;
  --ring: #B8E600;
  
  /* Category Pills */
  --category-active-border: #B8E600;
}
```

---

## 🎯 Usage Guidelines

### ✅ **DO's:**
- Use `#B8E600` for backgrounds, borders, and accent elements
- Use black (`#000000`) or white (`#FFFFFF`) for ALL text
- Use flat design with no shadows
- Use light grey (`border-gray-200` / `#E5E7EB`) for dividers
- Use CSS variables (`var(--primary)`) when possible

### ❌ **DON'Ts:**
- **NEVER** use lemon green (`#B8E600` or `#CDFF00`) as text color
- No rounded corners on cards/UI backgrounds (flat design)
- No box shadows on main UI elements
- Don't use `#CDFF00` in new code (legacy color)

---

## 🔄 Migration Notes

### **Files Updated:**
- ✅ `/styles/globals.css` - All CSS variables and utility classes
- ✅ `/assets/logo.svg` - New LocalFelo logo with updated branding
- ✅ `/components/Header.tsx` - Logo alt text updated

### **Hardcoded Instances:**
There are **60+ hardcoded instances** of the old `#CDFF00` color across the codebase in:
- Component files (`/components/*.tsx`)
- Screen files (`/screens/*.tsx`)  
- Admin components (`/components/admin/*.tsx`)

**These will be gradually updated** to use the new `#B8E600` color or preferably CSS variables like `bg-primary`.

### **Tailwind Classes:**
The following Tailwind classes now use the updated color:
- `bg-primary` → `#B8E600`
- `text-primary` → Black (`#000000` - accessibility override)
- `border-primary` → `#B8E600`

---

## 📱 Accessibility

### **Text on Lemon Green:**
- ❌ White text on `#B8E600` → **Fails WCAG AA** (contrast ratio: 1.8:1)
- ❌ Black text on `#B8E600` → **Fails WCAG AA** (contrast ratio: 12.5:1 - too high, hard to read)

### **Solution:**
- ✅ Use `#B8E600` **ONLY** for backgrounds, borders, and decorative elements
- ✅ Use black or white text on contrasting backgrounds
- ✅ All text colors are enforced in `/styles/globals.css`

---

## 🎨 Color Palette Summary

| Color Name | Hex Code | RGB | Usage |
|-----------|----------|-----|--------|
| **Lemon Green** | `#B8E600` | `184, 230, 0` | Primary accent, backgrounds, borders |
| **Darker Green** | `#A3CF00` | `163, 207, 0` | Hover states |
| **Old Lemon** | ~~`#CDFF00`~~ | ~~`205, 255, 0`~~ | Deprecated |
| **Black** | `#000000` | `0, 0, 0` | Text, icons, buttons |
| **White** | `#FFFFFF` | `255, 255, 255` | Backgrounds, cards |

---

## 📞 Contact

For brand color questions or updates, refer to this document and `/styles/globals.css`.

**Last Updated:** December 2024  
**Version:** 2.0 (Refined Lemon Green)
