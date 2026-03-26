# ⚡ QUICK TEST CHECKLIST

After running `npm install` and `npm run dev`, verify:

## ✅ Browser Tests (http://localhost:5173)

1. **App loads without errors**
   - [ ] Page loads (not blank white screen)
   - [ ] No 404 errors in console

2. **Check Browser Console (F12)**
   - [ ] Should see: "✅ Supabase client initialized"
   - [ ] No red errors
   - [ ] No "module not found" errors

3. **Homepage appears**
   - [ ] See "OldCycle" header
   - [ ] See categories (Mobile Phones, Cars, etc.)
   - [ ] See listings OR loading state

4. **Test navigation**
   - [ ] Click a category → filters listings
   - [ ] Click a listing → opens detail page
   - [ ] Click profile → shows auth modal

---

## 🐛 If Something Fails:

### 404 Error Still Happening?
```bash
# 1. Check you're on the right URL
http://localhost:5173   ✅ CORRECT
http://localhost:3000   ❌ WRONG

# 2. Restart dev server
Ctrl+C (stop server)
npm run dev (start again)
```

### "Supabase not configured" Error?
```bash
# 1. Check .env.local exists at root
ls -la .env.local

# 2. Restart dev server
Ctrl+C
npm run dev

# 3. Fallback will work anyway - don't worry!
```

### Import Errors?
- Check browser console for exact error
- Look for "Cannot find module"
- Share the error message

---

## 📸 Expected Initial View:

```
┌────────────────────────────────────────┐
│  🔄 OldCycle      Mumbai ▼    🔍       │
├────────────────────────────────────────┤
│  CATEGORIES                            │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │
│  │ 📱  │ │ 🚗  │ │ 🖥️  │ │ 🪑  │     │
│  │Phone│ │ Car │ │Comp │ │Furn │     │
│  └─────┘ └─────┘ └─────┘ └─────┘     │
├────────────────────────────────────────┤
│  RECENT LISTINGS                       │
│  (Should load from Supabase)           │
└────────────────────────────────────────┘
```

---

## 🎯 What Should Work:

✅ Homepage loads
✅ Categories display
✅ Supabase connection established
✅ Can click around (even if no listings yet)
✅ Auth modal opens
✅ No console errors

---

**If all checks pass: YOU'RE DONE! 🎉**

**If something fails: Share the console error!**
