# 🧪 QUICK TEST GUIDE - 5 Minute Verification

## Step 0: CRITICAL - Clear Storage First!
```javascript
// Open browser console (F12) → Run this:
localStorage.clear();
// Then refresh the page
```

## Test 1: Your Own Task (30 seconds)
1. Login to your account
2. Go to Tasks → Create a new task
3. After creating, click on it to view details
4. **✅ PASS:** See "Edit" and "Delete" buttons ONLY
5. **❌ FAIL:** See "Accept" or "Navigate" buttons

## Test 2: Someone Else's Task - Before Accept (30 seconds)
1. Stay logged in (or use incognito window for different user)
2. Browse Tasks list
3. Click on ANY task you didn't create
4. **✅ PASS:** See "Negotiate" and "Accept" buttons
5. **❌ FAIL:** See "Edit" or "Delete" buttons

## Test 3: Accept and Check Helper Buttons (1 minute)
1. While viewing someone else's task
2. Click "Accept" button
3. After accepting, check the buttons
4. **✅ PASS:** See all four buttons:
   - "Chat"
   - "Navigate" 
   - "Complete"
   - "Cancel"
5. **❌ FAIL:** Missing any of these buttons

## Test 4: Check Creator's View After Acceptance (1 minute)
1. Logout from helper account
2. Login as the task creator (original user)
3. View the task that was just accepted
4. **✅ PASS:** See exactly 2 buttons:
   - "Chat with Helper"
   - "Complete"
5. **❌ FAIL:** See "Navigate", "Cancel", "Edit", or "Delete"

## Test 5: Your Own Wish (30 seconds)
1. Go to Wishes → Create a new wish
2. Click on it to view details
3. **✅ PASS:** See "Edit" and "Delete" buttons
4. **❌ FAIL:** See only "Chat" button

## Test 6: Someone Else's Wish (30 seconds)
1. Browse Wishes
2. Click on ANY wish you didn't create
3. **✅ PASS:** See "Chat" button ONLY
4. **❌ FAIL:** See "Edit" or "Delete" buttons

## Quick Console Check
Open console (F12) and look for this log when viewing a task:
```
🎯 [TaskDetail] BUTTON RENDERING LOGIC: {
  currentUserResolvedUUID: "abc-123...",  ← Should be a UUID, not null
  taskUserId: "def-456...",
  isCreator: true or false,  ← Should match correctly
  isHelper: true or false
}
🔘 [TaskDetail] Selected button set: creator-open  ← Should match your role
```

## Expected Button Sets

| Your Role | Task Status | Buttons You Should See |
|-----------|-------------|------------------------|
| Creator | Open | Edit, Delete |
| Creator | Accepted | Chat with Helper, Complete |
| Helper | Accepted | Chat, Navigate, Complete, Cancel |
| Other User | Open | Negotiate, Accept |
| Other User | Accepted | None (message: "task taken") |

| Your Role | Wish Status | Buttons You Should See |
|-----------|-------------|------------------------|
| Creator | Any | Edit, Delete |
| Other User | Any | Chat |

## If Tests Fail

### Option 1: Check Console for Errors
Look for:
- Red error messages
- Warnings about undefined variables
- Failed API calls

### Option 2: Run Database Diagnostic
```sql
-- In Supabase SQL Editor, run:
-- File: /DEBUG_DATABASE_COMPLETE.sql
-- Share the results
```

### Option 3: Share These Logs
```
1. Console logs from browser (F12 → Console tab)
2. Network tab errors (F12 → Network tab, filter by "Failed")
3. Screenshot of what buttons you see
4. Your user ID and task ID being tested
```

## Success Criteria

✅ All 6 tests pass
✅ Console logs show correct role detection  
✅ No JavaScript errors in console
✅ Buttons match expected button sets table

If all tests pass → **System is working correctly!** 🎉

If any test fails → **Share the failing test number and console logs**
