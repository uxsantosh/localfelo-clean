# 🧪 Location UX Testing Script

## Quick Test Commands (Browser Console)

### **1. Check Current Status**
```javascript
// Check if modal has ever been shown
console.log('Modal shown before:', localStorage.getItem('localfelo_location_modal_shown'));

// Check saved guest location
const guestLoc = localStorage.getItem('localfelo_guest_location');
console.log('Guest location:', guestLoc ? JSON.parse(guestLoc) : 'None');

// Check user
const user = localStorage.getItem('localfelo_user') || localStorage.getItem('oldcycle_user');
console.log('User:', user ? JSON.parse(user) : 'Not logged in');
```

### **2. Reset Everything (For Testing)**
```javascript
// Clear all location data
localStorage.removeItem('localfelo_location_modal_shown');
localStorage.removeItem('localfelo_guest_location');
localStorage.removeItem('oldcycle_guest_location');
console.log('✅ Location data cleared - refresh to test first-time experience');
```

### **3. Simulate First-Time User**
```javascript
// Step 1: Clear data
localStorage.removeItem('localfelo_location_modal_shown');
localStorage.removeItem('localfelo_guest_location');
localStorage.removeItem('oldcycle_guest_location');

// Step 2: Refresh browser
location.reload();

// Expected: Location modal should appear
```

### **4. Simulate Returning User**
```javascript
// Step 1: Set mock location
const mockLocation = {
  cityId: '3',
  city: 'Bangalore',
  areaId: '3-2',
  area: 'Koramangala',
  subAreaId: '3-2-1',
  subArea: 'Koramangala 5th Block',
  latitude: 12.9352,
  longitude: 77.6245,
  updatedAt: new Date().toISOString()
};
localStorage.setItem('localfelo_guest_location', JSON.stringify(mockLocation));
localStorage.setItem('localfelo_location_modal_shown', 'true');

// Step 2: Refresh browser
location.reload();

// Expected: NO modal, location should be loaded
```

---

## 📋 Manual Testing Checklist

### **Test 1: First-Time Guest User**
1. [ ] Open app in **incognito mode**
2. [ ] **Expected:** Location modal appears
3. [ ] Select: Bangalore → Koramangala → 5th Block
4. [ ] **Expected:** Modal closes, location saved
5. [ ] Check console: `localStorage.getItem('localfelo_location_modal_shown')` → `"true"`
6. [ ] **Close browser completely**
7. [ ] **Reopen in incognito**
8. [ ] **Expected:** NO modal, location loaded from localStorage

**Result:** ✅ Pass / ❌ Fail

---

### **Test 2: Guest → Login Migration**
1. [ ] Open app as **guest** (incognito)
2. [ ] **Expected:** Location modal appears
3. [ ] Select location (any city/area)
4. [ ] Create a listing (verify location auto-filled)
5. [ ] Click **Login/Register**
6. [ ] Complete login
7. [ ] **Expected:** NO location modal shown after login
8. [ ] Check: Location visible in header
9. [ ] Create another listing
10. [ ] **Expected:** Location auto-filled from profile

**Result:** ✅ Pass / ❌ Fail

---

### **Test 3: Returning User Login**
1. [ ] **Logout** (if logged in)
2. [ ] **Close browser completely**
3. [ ] **Reopen browser**
4. [ ] Click **Login**
5. [ ] Enter credentials and login
6. [ ] **Expected:** NO location modal
7. [ ] Check: Location loaded from Supabase profile
8. [ ] Header shows correct location

**Result:** ✅ Pass / ❌ Fail

---

### **Test 4: Location Persists Across App Restarts**
1. [ ] As **logged-in user**, select location (if not already set)
2. [ ] Note current location from header
3. [ ] **Close browser completely** (not just tab)
4. [ ] Wait 10 seconds
5. [ ] **Reopen browser**
6. [ ] Navigate to app
7. [ ] **Expected:** Same location loaded, NO modal
8. [ ] Header shows correct location

**Result:** ✅ Pass / ❌ Fail

---

### **Test 5: Create Screens Auto-Population**

#### **Test 5A: Create Listing**
1. [ ] Ensure location is set (check header)
2. [ ] Navigate to **Marketplace** → **Post Ad**
3. [ ] Go to **Location step** (step 5)
4. [ ] **Expected:** City, Area, Sub-area all pre-filled
5. [ ] Can change if needed
6. [ ] Submit listing with pre-filled location

**Result:** ✅ Pass / ❌ Fail

#### **Test 5B: Create Wish**
1. [ ] Navigate to **Wishes** → **Create Wish**
2. [ ] Enter wish text
3. [ ] Expand "Optional details"
4. [ ] **Expected:** Location auto-filled (not shown in UI but used in background)
5. [ ] Submit wish
6. [ ] Check: Wish has correct location in database

**Result:** ✅ Pass / ❌ Fail

#### **Test 5C: Create Task**
1. [ ] Navigate to **Tasks** → **Create Task**
2. [ ] Enter task description
3. [ ] **Expected:** Location auto-filled (check console logs)
4. [ ] Submit task
5. [ ] Check: Task has correct location

**Result:** ✅ Pass / ❌ Fail

---

### **Test 6: Change Location via Header**
1. [ ] Click **location dropdown** in header
2. [ ] Select different: City → Area → Sub-area
3. [ ] **Expected:** Location updated
4. [ ] Header shows new location
5. [ ] Create listing/wish/task
6. [ ] **Expected:** New location auto-filled
7. [ ] Close and reopen app
8. [ ] **Expected:** New location persists

**Result:** ✅ Pass / ❌ Fail

---

### **Test 7: Modal Never Shows Again After First Time**
1. [ ] Complete Test 1 (first-time user)
2. [ ] **Close app completely**
3. [ ] **Reopen** → **Expected:** NO modal
4. [ ] **Logout**
5. [ ] **Expected:** NO modal
6. [ ] **Login again**
7. [ ] **Expected:** NO modal
8. [ ] **Close and reopen app 5 times**
9. [ ] **Expected:** NEVER shows modal again

**Result:** ✅ Pass / ❌ Fail

---

### **Test 8: Clear Location (Edge Case)**
1. [ ] Run in console:
```javascript
localStorage.clear();
location.reload();
```
2. [ ] **Expected:** Modal appears (first-time experience)
3. [ ] Select location
4. [ ] **Expected:** Works normally from here

**Result:** ✅ Pass / ❌ Fail

---

## 🐛 Common Issues & Solutions

### **Issue 1: Modal keeps appearing**
**Diagnosis:**
```javascript
// Check flag
console.log(localStorage.getItem('localfelo_location_modal_shown'));
// Should be "true" after first time
```

**Solution:**
- Check if `handleSaveLocation` is being called
- Check console for errors during location save
- Verify `localStorage.setItem('localfelo_location_modal_shown', 'true')` is executed

---

### **Issue 2: Location not auto-filled in create screens**
**Diagnosis:**
```javascript
// In browser console
console.log('Global location:', globalLocation);
```

**Solution:**
- Check if `useLocation` hook is returning valid data
- Verify `globalLocation` has `cityId`, `areaId`, `subAreaId`
- Check create screen `useEffect` dependencies

---

### **Issue 3: Location not persisting after app restart**
**Diagnosis:**
```javascript
// Check localStorage
console.log('Guest:', localStorage.getItem('localfelo_guest_location'));
console.log('User:', localStorage.getItem('localfelo_user'));
```

**Solution:**
- For guests: Check if localStorage is being saved
- For logged-in: Check if profile has location columns populated in Supabase
- Verify `useLocation` hook is loading data correctly

---

### **Issue 4: Modal appears after login**
**Diagnosis:**
```javascript
// Check these flags in React DevTools
hasShownLocationModalThisSession
hadValidLocationOnce
hasEverShownLocationModal
```

**Solution:**
- Ensure `handleSupabaseSession` sets flags correctly
- Check if location migration is working
- Verify localStorage flag is set during login

---

## ✅ Success Criteria

All tests pass = Location UX is working perfectly! 🎉

### **Expected Behavior:**
- ✅ Modal shows **ONLY ONCE** on first visit
- ✅ Location **persists** across app restarts
- ✅ **NO modal** after login/register
- ✅ Create screens **auto-populate** location
- ✅ Can **change location** via header anytime
- ✅ Guest location **migrates** to account on login

---

## 📊 Test Results Template

```
Date: __________
Tester: __________

Test 1 (First-Time Guest):        ✅ / ❌
Test 2 (Guest → Login):            ✅ / ❌
Test 3 (Returning User):           ✅ / ❌
Test 4 (App Restart Persistence):  ✅ / ❌
Test 5A (Create Listing):          ✅ / ❌
Test 5B (Create Wish):             ✅ / ❌
Test 5C (Create Task):             ✅ / ❌
Test 6 (Change via Header):        ✅ / ❌
Test 7 (Never Shows Again):        ✅ / ❌
Test 8 (Clear & Reset):            ✅ / ❌

Overall: ✅ Pass / ❌ Fail

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🚀 Quick Deployment Verification

After deploying, run this quick check:

```javascript
// 1. Check code version
console.log('Has location modal tracking:', 
  typeof hasEverShownLocationModal !== 'undefined'
);

// 2. Check localStorage keys exist
console.log('Uses new key:', 
  localStorage.getItem('localfelo_location_modal_shown') !== null
);

// 3. Test flow
// - Open in incognito
// - Modal appears once
// - Close and reopen
// - NO modal
console.log('✅ Deployment successful if all above checks pass');
```

---

**Happy Testing! 🎉**
