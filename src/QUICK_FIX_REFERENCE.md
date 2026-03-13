# ⚡ QUICK FIX REFERENCE

## 🎯 TWO ISSUES - FOUR FILES

---

## 📋 ISSUE 1: Task Details Failed to Load

**Error:** "Could not find a relationship between 'tasks' and 'sub_areas'"

**Fix:** `/services/tasks.ts`
- Removed `sub_area` from query join
- Fetch sub_area separately if exists
- Added null handling

---

## 📋 ISSUE 2: Headers Scrolling with Content

**Problem:** Headers not sticky on detail pages

**Fix:** 3 files - wrap header in sticky div
- `/screens/TaskDetailScreen.tsx`
- `/screens/ListingDetailScreen.tsx`
- `/screens/WishDetailScreen.tsx`

**Pattern:**
```tsx
<div className="sticky top-0 z-40">
  <Header ... />
</div>
```

---

## 📁 FILES TO UPDATE:

| File | Change | Lines |
|------|--------|-------|
| `/services/tasks.ts` | Remove sub_area join | ~40 |
| `/screens/TaskDetailScreen.tsx` | Add sticky wrapper | ~5 |
| `/screens/ListingDetailScreen.tsx` | Add sticky wrapper | ~5 |
| `/screens/WishDetailScreen.tsx` | Add sticky wrapper | ~5 |

**Total:** 4 files, ~55 lines

---

## ✅ VERIFICATION:

### Task Details:
```
✅ Click task card → Loads successfully
✅ Console: "✅ [TaskService] Task found"
❌ No foreign key errors
```

### Sticky Headers:
```
✅ Scroll down → Header stays at top
✅ Back button always accessible
✅ Clean mobile UX
```

---

## 🚀 DEPLOY:

1. Replace 4 files
2. Refresh browser
3. Test both issues
4. Done! ✅

**Time:** 2 minutes  
**Database changes:** None  
**Breaking changes:** None

---

**READY TO DEPLOY!** 🎉
