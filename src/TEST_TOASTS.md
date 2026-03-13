# 🧪 TOAST NOTIFICATION TEST PLAN

## Quick Test (30 seconds)

Open browser console and run:
```javascript
testToast()
```

You should see **4 toasts appear** in sequence:
1. ✅ Success toast (green border)
2. ❌ Error toast (red border)
3. ℹ️ Info toast (blue border)
4. ⚠️ Warning toast (yellow border)

**If you see all 4 toasts → ✅ SYSTEM WORKS!**

---

## Manual Tests

### Test 1: Create Listing
1. Click "+ Create" in bottom nav
2. Fill in:
   - Title: "Test Item"
   - Description: "Testing toasts"
   - Price: "100"
   - Category: Any
   - Phone: Your number
3. Click "Post Listing"

**Expected:** ✅ Green success toast "Listing created successfully!"

---

### Test 2: Admin Broadcast (Requires Admin Access)
1. Login as admin
2. Go to Admin Panel
3. Click "Broadcast" tab
4. Fill in:
   - Title: "Test Notification"
   - Message: "Testing broadcast system"
   - Type: Info
   - Recipients: All Users
5. Click "Send Notification"

**Expected:** ✅ Green success toast "Notification sent to X users!"

---

### Test 3: Edit Profile
1. Click "Profile" in bottom nav
2. Click "Edit Profile"
3. Change your name to "Test User"
4. Click "Save Changes"

**Expected:** ✅ Green success toast "Profile updated!"

---

### Test 4: Invalid Login
1. Logout if logged in
2. Try to login with:
   - Email: "wrong@test.com"
   - Password: "wrongpassword"
3. Click "Login"

**Expected:** ❌ Red error toast "Invalid credentials"

---

### Test 5: Share Listing
1. Open any listing
2. Click "Share" button
3. The link should be copied

**Expected:** ✅ Green success toast "Link copied to clipboard!"

---

### Test 6: Report Content (If you have report feature)
1. Open any listing
2. Click "Report" button
3. Fill in report reason
4. Submit

**Expected:** ✅ Green success toast "Report submitted"

---

### Test 7: Change Location
1. Click location dropdown in header
2. Select a different city/area
3. Confirm selection

**Expected:** ✅ Green success toast "Location updated! 📍"

---

## Console Debug Commands

### Test individual toast types:
```javascript
// Success
import('sonner@2.0.3').then(m => m.toast.success('Success test!'))

// Error
import('sonner@2.0.3').then(m => m.toast.error('Error test!'))

// Info
import('sonner@2.0.3').then(m => m.toast.info('Info test!'))

// Warning  
import('sonner@2.0.3').then(m => m.toast.warning('Warning test!'))
```

### Check if Toaster exists:
```javascript
console.log('Toaster element:', document.querySelector('[data-sonner-toaster]'))
```

### Check for high z-index conflicts:
```javascript
[...document.querySelectorAll('*')]
  .filter(el => {
    const z = window.getComputedStyle(el).zIndex;
    return z !== 'auto' && parseInt(z) > 9000;
  })
  .forEach(el => console.log(el.className, window.getComputedStyle(el).zIndex))
```

---

## Expected Toast Appearance

### Desktop (1024px+)
- Position: Top-right corner
- Width: Auto (max 400px)
- Spacing: 16px from top and right
- Stacking: Vertical, with gap between

### Mobile (<640px)
- Position: Top-center
- Width: Full width minus 32px
- Spacing: 16px from top
- Stacking: Vertical, centered

---

## Troubleshooting

### ❌ No toasts appear at all
**Solution:**
1. Check browser console for JavaScript errors
2. Verify `<Toaster />` is in App.tsx
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### ❌ Toasts appear but are invisible
**Solution:**
1. Check if another element is covering them (z-index issue)
2. Inspect element in DevTools
3. Look for `[data-sonner-toast]` elements

### ❌ Toast appears but wrong color
**Solution:**
- Check `/styles/globals.css` has the custom toast styles
- Clear browser cache
- Check if CSS file loaded properly

### ❌ testToast() function not found
**Solution:**
1. Make sure you're logged into the app
2. Check browser console for errors
3. Verify App.tsx has the testToast useEffect

---

## Success Criteria ✅

All these should show toasts:

- [x] testToast() command works
- [x] Create listing shows success toast
- [x] Edit profile shows success toast
- [x] Login error shows error toast
- [x] Admin broadcast shows success toast
- [x] Share listing shows success toast
- [x] Report shows success toast
- [x] Location change shows success toast
- [x] Delete action shows success toast
- [x] Any error shows error toast

---

## 🎯 Final Verification

Run this complete test in console:
```javascript
console.log('=== TOAST SYSTEM CHECK ===');
console.log('1. Toaster component:', !!document.querySelector('[data-sonner-toaster]'));
console.log('2. testToast function:', typeof testToast);
console.log('3. Running test...');
if (typeof testToast === 'function') {
  testToast();
  console.log('✅ Test started - watch for 4 toasts!');
} else {
  console.log('❌ testToast not available');
}
```

**If you see "✅ Test started" and then 4 toasts appear → EVERYTHING WORKS!** 🎉
