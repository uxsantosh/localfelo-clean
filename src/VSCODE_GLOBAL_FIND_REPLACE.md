# 🔍 VS CODE GLOBAL FIND & REPLACE - Orange → Green

## 🎯 ONE-TIME FIX FOR ENTIRE PROJECT

Use VS Code's global Find & Replace (Ctrl+Shift+H / Cmd+Shift+H) to replace ALL orange colors at once!

---

## 📝 STEP-BY-STEP INSTRUCTIONS:

### 1. Open VS Code Global Find & Replace
- Press `Ctrl + Shift + H` (Windows/Linux)
- Or `Cmd + Shift + H` (Mac)

### 2. Configure Settings
- ✅ Enable "Match Case" (Aa button)
- ✅ Enable "Use Regular Expression" (.* button)
- In "files to include": `**/*.{tsx,ts,css}`
- In "files to exclude": `**/node_modules/**, **/components/admin/**, **/screens/AdminScreen.tsx`

---

## 🎨 REPLACEMENT PATTERNS (Execute in Order):

### **ROUND 1: Hex Color Codes**

#### Replace #1: Primary Orange → Green
```
Find: #FF6B35
Replace: #CDFF00
```

#### Replace #2: Orange Hover State 1
```
Find: #ff5520
Replace: #CDFF00
```

#### Replace #3: Orange Hover State 2
```
Find: #FF5722
Replace: #CDFF00
```

#### Replace #4: Orange Hover State 3
```
Find: #E85A28
Replace: #CDFF00
```

#### Replace #5: Orange Gradient Color
```
Find: #F7931E
Replace: #CDFF00
```

---

### **ROUND 2: Tailwind Classes - Backgrounds**

#### Replace #6: Orange Background 50
```
Find: bg-orange-50
Replace: bg-amber-50
```

#### Replace #7: Orange Background 100
```
Find: bg-orange-100
Replace: bg-amber-100
```

#### Replace #8: Orange Background 200
```
Find: bg-orange-200
Replace: bg-amber-200
```

#### Replace #9: Orange Background 500
```
Find: bg-orange-500
Replace: bg-primary
```

#### Replace #10: Orange Background 600
```
Find: bg-orange-600
Replace: bg-primary
```

---

### **ROUND 3: Tailwind Classes - Text Colors**

#### Replace #11: Orange Text 600
```
Find: text-orange-600
Replace: text-primary
```

#### Replace #12: Orange Text 700
```
Find: text-orange-700
Replace: text-amber-700
```

#### Replace #13: Orange Text 900
```
Find: text-orange-900
Replace: text-amber-900
```

---

### **ROUND 4: Tailwind Classes - Borders**

#### Replace #14: Orange Border 200
```
Find: border-orange-200
Replace: border-amber-200
```

#### Replace #15: Orange Border 500
```
Find: border-orange-500
Replace: border-primary
```

---

### **ROUND 5: Tailwind Classes - Hover States**

#### Replace #16: Hover Orange 100
```
Find: hover:bg-orange-100
Replace: hover:bg-amber-100
```

#### Replace #17: Hover Orange 700
```
Find: hover:text-orange-700
Replace: hover:text-amber-700
```

---

### **ROUND 6: Gradient Classes (Auth Screen)**

#### Replace #18: Orange Gradient From
```
Find: from-orange-500
Replace: from-primary
```

#### Replace #19: Orange Gradient Via
```
Find: via-orange-600
Replace: via-primary
```

#### Replace #20: Orange Gradient To
```
Find: to-orange-500
Replace: to-primary
```

#### Replace #21: Orange Gradient To 2
```
Find: to-orange-600
Replace: to-primary
```

---

### **ROUND 7: Shadow Classes**

#### Replace #22: Orange Shadow
```
Find: shadow-orange-300/50
Replace: shadow-primary/50
```

---

### **ROUND 8: Focus Ring Classes**

#### Replace #23: Orange Focus Ring
```
Find: focus:ring-orange-500
Replace: focus:ring-primary
```

#### Replace #24: Orange Focus Ring 100
```
Find: focus:ring-orange-100
Replace: focus:ring-primary/20
```

#### Replace #25: Orange Focus Border
```
Find: focus:border-orange-400
Replace: focus:border-primary
```

#### Replace #26: Group Focus Orange
```
Find: group-focus-within:text-orange-500
Replace: group-focus-within:text-primary
```

---

### **ROUND 9: Hover Border**

#### Replace #27: Hover Orange Border
```
Find: hover:bg-orange-50
Replace: hover:bg-primary/10
```

---

### **ROUND 10: Auth Screen Special Cases**

#### Replace #28: Orange 50 Background (Special)
```
Find: from-orange-50
Replace: from-primary/5
```

#### Replace #29: Via Amber 50
```
Find: via-amber-50
Replace: via-primary/10
```

#### Replace #30: To Orange 50
```
Find: to-orange-50
Replace: to-primary/5
```

---

## ⚠️ MANUAL FIXES NEEDED (Can't auto-replace):

After global replace, manually check these files:

### 1. `/components/admin/SiteSettingsTab.tsx`
- Lines 8-10, 31-33, 151, 172, 195
- Change default banner colors from orange to green

### 2. `/styles/globals.css`
Verify this line exists:
```css
--color-primary: 203 255 0; /* #CDFF00 */
```

---

## 🎯 SEMANTIC COLOR EXCEPTIONS:

These should stay as-is (semantic meaning for warnings/status):

### Keep Orange in Admin:
- `/components/admin/*` (excluded in search)
- `/screens/AdminScreen.tsx` (excluded in search)

### Keep for Specific Statuses:
- **"today" urgency:** `bg-amber-100 text-amber-700` (warm, not urgent)
- **"in_progress" status:** Should be `bg-blue-100 text-blue-700` (processing)

**Note:** These are already handled by the replacements above (orange → amber for warnings)

---

## 🔄 SPECIAL CASE: In Progress Status

Some files incorrectly use orange for "in_progress" status. After global replace, do this additional replace:

### Additional Replace: Fix In Progress Status
```
Find: bg-amber-100 text-amber-700
Replace: bg-blue-100 text-blue-700

Files to include: **/TaskCard.tsx, **/TaskDetailScreen.tsx, **/ProfileScreen.tsx
```

---

## ✅ VERIFICATION CHECKLIST:

After all replacements, verify in VS Code:

### Search for Remaining Orange (Should find 0 results):
```
Find: (orange|#FF6B35|#ff6b35|#FF5722|#E85A28|#F7931E)
Files to include: **/*.{tsx,ts}
Files to exclude: **/node_modules/**, **/components/admin/**, **/screens/AdminScreen.tsx
```

If you find any results:
- Check if it's in a comment → ignore
- Check if it's in admin files → ignore  
- Otherwise → replace with appropriate green/amber

---

## 🚀 EXECUTION ORDER:

### Step 1: Global Find & Replace (30 replacements above)
- Do all 30 replacements in order
- Check "Replace All" for each
- Takes ~5 minutes total

### Step 2: Manual Fixes
- Update `/components/admin/SiteSettingsTab.tsx` default colors
- Verify `/styles/globals.css` has correct primary color

### Step 3: Fix In Progress Status
- Do the additional replace for in_progress status

### Step 4: Verify
- Search for any remaining orange
- Should be 0 results (except admin files)

### Step 5: Test
- Clear browser cache (Ctrl+Shift+R)
- Test all screens
- Verify green branding everywhere

---

## 📊 EXPECTED RESULTS:

**Before:** ~200+ instances of orange colors  
**After:** 0 instances (except admin panels)

**Time:** ~10 minutes total  
**Effort:** Way less than file-by-file! 🎉

---

## 🐛 TROUBLESHOOTING:

### Issue: "Replace All" button is greyed out
**Fix:** Make sure you have "Use Regular Expression" enabled and pattern is valid

### Issue: Too many replacements (thousands)
**Fix:** Check your "files to exclude" includes `**/node_modules/**`

### Issue: Some files still have orange
**Fix:** Make sure you did ALL 30 replacements in order

### Issue: Admin panel lost colors
**Fix:** You didn't exclude admin files - restore from git

---

## 💡 PRO TIP:

Before starting, create a git commit or backup so you can revert if needed:

```bash
git add .
git commit -m "Backup before color replacement"
```

Then after replacements:

```bash
git add .
git commit -m "Replace all orange with green branding"
```

---

## 🎨 FINAL COLOR SCHEME:

After all replacements, your app will use:

✅ **Primary:** #CDFF00 (Lemon Green)  
✅ **Warnings:** Amber shades (yellow tint)  
✅ **In Progress:** Blue shades  
✅ **Errors:** Red shades  
✅ **Success:** Green shades  
✅ **Admin Warnings:** Orange (semantic)  

**Result:** Consistent, clean lemon green branding! 🎉
