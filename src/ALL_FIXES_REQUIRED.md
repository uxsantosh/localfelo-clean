# 🔧 ALL FIXES REQUIRED - COMPREHENSIVE LIST

## ✅ 1. Task/Wish Detail Buttons - Black Text (PARTIALLY DONE)

### Files Changed:
- `/screens/TaskDetailScreen.tsx` - ✅ DONE (all bg-primary buttons have black text)
- `/screens/WishDetailScreen.tsx` - ✅ DONE  
- `/screens/CreateWishScreen.tsx` - ✅ DONE

**Status:** COMPLETE - All lemon green buttons now have `style={{ color: '#000000' }}`

---

## ❌ 2. Marketplace Category Pills

### File: `/screens/MarketplaceScreen.tsx`
**Issues:**
1. Pills width needs to align with body content
2. Selected state should be BLACK (`bg-black text-white`) not green

**Changes Needed:**
```tsx
// Change selected state from bg-primary to bg-black
className={`... ${
  selectedCategory === cat.id
    ? 'bg-black text-white font-medium'  // ← CHANGE THIS
    : 'bg-card text-muted hover:text-foreground hover:bg-gray-50'
}`}
```

---

## ✅ 3. My Wishes Button (DONE BUT NOT VISIBLE)

### File: `/screens/WishesScreen.tsx`
**Status:** ✅ Button added BUT might be hidden

**Check:** The button is in the category row - might need repositioning

---

## ❌ 4. Location Selection Before Login

### Files to Check:
- `/App.tsx` - Check `showLocationSetupModal` logic
- `/screens/NewHomeScreen.tsx` - Check if blocking modal
- `/components/LocationSetupModal.tsx` - Check z-index

**Issue:** Location modal not appearing on first load for guest users

**Required:**
1. Auto-show location modal on first visit (guest mode)
2. Ensure z-index is higher than app content
3. Make sure modal isn't blocked by other components

---

## ❌ 5. Notifications Not Working

### File: `/DATABASE_SETUP_NOTIFICATIONS.sql`
**Issue:** RLS policies might be blocking reads

**Check:**
1. Run the SQL again in Supabase
2. Check RLS policies in Supabase dashboard
3. Test notifications manually
4. Check browser console for errors

---

## ❌ 6. My Wishlist Tab Missing in Profile

### File: `/screens/ProfileScreen.tsx`
**Status:** NEEDS TO BE ADDED

**Required:**
Add a "Wishlist" section similar to "My Listings" that shows:
- User's wishlisted items
- Click to view details
- Remove from wishlist option

---

## ❌ 7. Edit Profile Features Missing

### Files to Check:
- `/components/EditProfileModal.tsx` - Should exist
- `/screens/ProfileScreen.tsx` - Should have "Edit Profile" button

**Required:**
1. Edit Profile button in Profile screen
2. Modal to edit: name, avatar URL, bio
3. Change Password option

---

## ❌ 8. Admin Screen Missing

### Files to Check:
- `/screens/AdminScreen.tsx` - Should exist
- `/App.tsx` - Check admin routing
- `/services/auth.ts` - Check `checkIsAdmin()` function

**Required:**
1. Make "uxsantosh@gmail.com" admin in database
2. Show Admin menu item for admin users
3. Admin screen should have:
   - User management
   - Broadcast notifications
   - Content moderation tools

---

## 📋 PRIORITY ORDER:

### **HIGH PRIORITY (Fix First):**
1. ✅ Task/Wish buttons black text - DONE
2. ❌ Marketplace category pills (black selection)
3. ❌ Location modal before login
4. ❌ Make uxsantosh@gmail.com admin
5. ❌ Notifications RLS fix

### **MEDIUM PRIORITY:**
6. ❌ My Wishlist tab
7. ❌ Edit Profile features
8. ❌ Admin Screen complete

### **LOW PRIORITY:**
9. ✅ My Wishes button visibility - DONE but check

---

## 🛠️ FILES THAT NEED UPDATES:

### MUST FIX:
1. `/screens/MarketplaceScreen.tsx` - Category pills
2. `/App.tsx` - Location modal logic
3. `/screens/ProfileScreen.tsx` - Add wishlist + edit button
4. `/screens/AdminScreen.tsx` - Verify exists & working
5. `/DATABASE_SETUP_NOTIFICATIONS.sql` - RLS policies
6. `/services/auth.ts` - Admin check for uxsantosh@gmail.com

### ALREADY FIXED:
- `/screens/TaskDetailScreen.tsx` ✅
- `/screens/WishDetailScreen.tsx` ✅
- `/screens/CreateWishScreen.tsx` ✅
- `/screens/WishesScreen.tsx` ✅ (My Wishes button added)

---

## 🚨 CRITICAL SQL UPDATES:

### Make uxsantosh@gmail.com Admin:
```sql
-- Update admin status
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'uxsantosh@gmail.com';
```

### Fix Notifications RLS:
```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'notifications';

-- If issues, recreate policies from DATABASE_SETUP_NOTIFICATIONS.sql
```

---

**Next Steps:**
1. Fix marketplace category pills
2. Fix location modal for guests
3. Make user admin
4. Add wishlist tab
5. Verify edit profile works
6. Test notifications

