# ✅ COMPLETE TESTING CHECKLIST

## 🚀 BEFORE YOU START

### Database Setup:
- [ ] Run `/SIMPLE_HELPER_12_CATEGORIES_MIGRATION.sql` in Supabase SQL Editor
- [ ] Run `/FIX_HELPER_PREFERENCES_RLS.sql` in Supabase SQL Editor
- [ ] Verify tables exist:
  - `helper_preferences`
  - `task_classifications`
  - `tasks`
  - `profiles`
- [ ] Verify RLS is disabled for `helper_preferences`
- [ ] Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)

---

## 📱 TEST FLOW 1: NEW USER - NOT LOGGED IN

### Step 1: Turn On Button (Home Screen)
1. [ ] Open home screen
2. [ ] Verify "Turn On" button exists in "Earn by helping nearby" section
3. [ ] Click "Turn On" button
4. [ ] **EXPECTED:** Login modal opens ✅
5. [ ] Login with phone number
6. [ ] **EXPECTED:** After login, tasks screen opens with category modal ✅

### Step 2: Category Selection
7. [ ] Verify category selection modal is open
8. [ ] Verify distance options show: 1, 3, 5, 10, 25, 50, 100 km
9. [ ] Select distance: Click "10" km
10. [ ] **EXPECTED:** 10km button turns bright green (#CDFF00) ✅
11. [ ] Tap on "📦 Carry or Move Things" card (anywhere on card, not just checkbox)
12. [ ] **EXPECTED:** Checkmark appears, card border turns green ✅
13. [ ] Click expand button (⌄) on same category
14. [ ] **EXPECTED:** Sub-skills appear ✅
15. [ ] Tap "Carry luggage" sub-skill
16. [ ] **EXPECTED:** Sub-skill button turns green with checkmark ✅
17. [ ] Tap "Help shifting items" sub-skill
18. [ ] **EXPECTED:** Sub-skill button turns green with checkmark ✅
19. [ ] Select 2 more categories (e.g., "🔧 Fix Something", "💻 Tech Help")
20. [ ] Verify footer shows "Save & Apply (3)" with count ✅
21. [ ] Click "Save & Apply (3)"
22. [ ] **EXPECTED:** 
    - Modal closes
    - Tasks screen shows filtered tasks
    - Active filters show: "📦 Carry/Move 🔧 Fix 💻 Tech +2 sub-skills"
    - Helper toggle shows "Helper ON" in bright green
    - Toast: "✅ Helper preferences saved!"

### Step 3: Verify Tasks Display
23. [ ] Verify tasks load and display
24. [ ] Verify category tags show on each task (📦 Carry/Move, etc.)
25. [ ] Verify price shows (₹100, ₹50, ₹10, etc.)
26. [ ] Verify distance shows (2.3km, 850m, etc.)
27. [ ] Verify status badge shows "OPEN" in green
28. [ ] Verify tasks are sorted by distance (nearest first)

---

## 📱 TEST FLOW 2: EXISTING USER WITH PREFERENCES

### Step 1: Return to Home
1. [ ] Navigate to home screen
2. [ ] **EXPECTED:** "Turn On" button shows "Active" (if helper mode ON) ✅

### Step 2: Click Tasks Tab
3. [ ] Click Tasks tab in bottom navigation
4. [ ] **EXPECTED:** 
    - Tasks screen opens WITHOUT category modal
    - Categories are pre-selected from previous session
    - Active filters show at top
    - Helper toggle shows "Helper ON"

### Step 3: Modify Filters
5. [ ] Click "Categories" button
6. [ ] **EXPECTED:** Category modal opens with previous selections ✅
7. [ ] Deselect one category
8. [ ] Select a new category
9. [ ] Click "Save & Apply"
10. [ ] **EXPECTED:** Tasks re-filter with new selections ✅

---

## 📱 TEST FLOW 3: AUTO-ENABLE HELPER MODE

### Step 1: Regular Task Browsing
1. [ ] Log out (if logged in)
2. [ ] Click Tasks tab
3. [ ] **EXPECTED:** 
    - Tasks screen shows all tasks
    - No category filters applied
    - "Turn On" button shows (gray/inactive)

### Step 2: Click on a Task
4. [ ] Click on any task card
5. [ ] **EXPECTED:**
    - Navigate to task detail screen
    - Toast: "✅ Helper mode enabled for this category!"
    
### Step 3: Verify Auto-Enable
6. [ ] Go back to tasks screen
7. [ ] **EXPECTED:**
    - Helper toggle now shows "Helper ON" (green)
    - Task's categories are now in active filters
    - Tasks filtered by auto-enabled categories

---

## 📱 TEST FLOW 4: MOBILE UX

### Category Selection Modal
1. [ ] Open category modal on mobile device or mobile view (< 768px)
2. [ ] Verify modal is full-screen ✅
3. [ ] Verify all touch targets are large (minimum 48px):
   - [ ] Category cards (60px+ height)
   - [ ] Expand button (48px × 48px)
   - [ ] Sub-skill buttons (48px height)
   - [ ] Distance buttons (48px height)
4. [ ] Tap category card in different places (top, middle, bottom)
5. [ ] **EXPECTED:** All areas of card work (not just checkbox) ✅
6. [ ] Verify sticky header (title + close button stays at top)
7. [ ] Verify sticky footer ("Clear All" + "Save & Apply" stays at bottom)
8. [ ] Scroll modal content
9. [ ] **EXPECTED:** Header and footer remain visible ✅

### Tasks Screen Mobile
10. [ ] Verify action bar is sticky (stays at top when scrolling)
11. [ ] Verify all buttons are easily tappable
12. [ ] Verify task cards are large enough to tap
13. [ ] Tap various parts of task card
14. [ ] **EXPECTED:** Entire card is clickable ✅

---

## 📱 TEST FLOW 5: FILTERS & SORTING

### Distance Filter
1. [ ] Set location (if not set)
2. [ ] Click distance button (e.g., "10km")
3. [ ] **EXPECTED:** Distance modal opens ✅
4. [ ] Click "50km"
5. [ ] **EXPECTED:** 
    - Modal closes
    - Button shows "50km"
    - Tasks re-filter to show tasks within 50km

### Sort Options
6. [ ] Change sort to "Newest"
7. [ ] **EXPECTED:** Tasks re-sort by creation date ✅
8. [ ] Change sort to "Highest ₹"
9. [ ] **EXPECTED:** Tasks re-sort by price (highest first) ✅
10. [ ] Change sort to "Nearest"
11. [ ] **EXPECTED:** Tasks re-sort by distance ✅

### Clear Filters
12. [ ] Click "Clear all" in active filters bar
13. [ ] **EXPECTED:**
     - All category filters removed
     - All sub-skill filters removed
     - All tasks shown (no category filter)
     - Active filters bar disappears

---

## 📱 TEST FLOW 6: HELPER MODE TOGGLE

### Toggle OFF
1. [ ] Ensure helper mode is ON (green button)
2. [ ] Click "Helper ON" button
3. [ ] **EXPECTED:**
    - Button changes to gray "Turn On"
    - Toast: "⚪ Helper mode OFF"
    - Database updated (is_available = false)

### Toggle ON
4. [ ] Click "Turn On" button
5. [ ] **EXPECTED:** Category selection modal opens ✅
6. [ ] Select categories and click "Save & Apply"
7. [ ] **EXPECTED:**
    - Button changes to green "Helper ON"
    - Toast: "✅ Helper mode ON"
    - Database updated (is_available = true)

---

## 📱 TEST FLOW 7: POST TASK

### Not Logged In
1. [ ] Log out
2. [ ] Click "+ Post" button in tasks screen
3. [ ] **EXPECTED:** Login modal opens ✅

### Logged In
4. [ ] Log in
5. [ ] Click "+ Post" button
6. [ ] **EXPECTED:** Navigate to create-task screen ✅

---

## 📱 TEST FLOW 8: SUB-SKILLS FILTERING

### Select Sub-Skills
1. [ ] Open category modal
2. [ ] Expand "🔧 Fix Something"
3. [ ] Select "Fix tap or water leak"
4. [ ] Select "Fix door lock or handle"
5. [ ] Click "Save & Apply"
6. [ ] **EXPECTED:**
    - Active filters show: "🔧 Fix +2 sub-skills"
    - Tasks are filtered by BOTH category AND sub-skills
    - Only tasks with keywords "tap", "leak", "door", "lock", "handle" show

---

## 📱 TEST FLOW 9: EDGE CASES

### No Location Set
1. [ ] Clear location (if set)
2. [ ] Go to tasks screen
3. [ ] **EXPECTED:**
    - Tasks load but no distance shown
    - Distance filter button hidden
    - Message: "Set location to see distances"

### No Tasks Match Filters
4. [ ] Select very specific categories + high distance limit
5. [ ] **EXPECTED:**
    - Empty state shows
    - Message: "No tasks found. Try adjusting your filters or increase distance"
    - "Clear Filters" button shows

### Minimum Price (₹10)
6. [ ] Create a task with price ₹10
7. [ ] **EXPECTED:** Task created successfully ✅
8. [ ] View task in tasks screen
9. [ ] **EXPECTED:** Shows "₹10" correctly ✅

---

## 📱 TEST FLOW 10: DATABASE VERIFICATION

### Check helper_preferences Table
1. [ ] Go to Supabase → Table Editor → helper_preferences
2. [ ] Find your user row
3. [ ] Verify:
    - [ ] `selected_categories` has array of category IDs
    - [ ] `selected_sub_skills` has array of sub-skill strings
    - [ ] `max_distance` has number (1-100)
    - [ ] `is_available` is true/false
    - [ ] `onboarding_completed` is true

### Check Auto-Enable Updates
4. [ ] Click on a task with category "deliver"
5. [ ] Go back to Supabase
6. [ ] Refresh helper_preferences table
7. [ ] Verify:
    - [ ] `selected_categories` now includes "deliver"
    - [ ] `is_available` is true

---

## 📱 TEST FLOW 11: NAVIGATION

### From Home
1. [ ] Home → Click "Turn On" → Category modal opens ✅
2. [ ] Home → Click Tasks tab → Tasks screen (no modal) ✅

### From Tasks Screen
3. [ ] Tasks → Click task → Task detail ✅
4. [ ] Tasks → Click "+ Post" → Create task ✅
5. [ ] Tasks → Click "Categories" → Modal opens ✅
6. [ ] Tasks → Click distance → Modal opens ✅

### Back Navigation
7. [ ] Tasks → Browser back button → Previous screen ✅
8. [ ] Task detail → Back button → Tasks screen ✅

---

## 📱 TEST FLOW 12: VISUAL & ACCESSIBILITY

### Colors
1. [ ] Verify bright green (#CDFF00) ONLY used for backgrounds ✅
2. [ ] Verify text on green is BLACK (#000000) ✅
3. [ ] Verify no bright green text on bright green background ✅

### Touch Targets
4. [ ] All buttons minimum 44px (preferably 48px) ✅
5. [ ] Category cards 60px+ height ✅
6. [ ] Sub-skill buttons 48px height ✅

### Text Readability
7. [ ] All text is readable (good contrast) ✅
8. [ ] Font sizes appropriate for mobile ✅

---

## 📱 TEST FLOW 13: CONSOLE ERRORS

### Check Console
1. [ ] Open browser console (F12)
2. [ ] Navigate through all flows
3. [ ] **EXPECTED:** No errors in console ✅
4. [ ] Check for:
    - [ ] No "Error loading tasks"
    - [ ] No "Error loading helper preferences"
    - [ ] No "Error saving preferences"
    - [ ] No React warnings
    - [ ] No nested button warnings

---

## 📱 TEST FLOW 14: PERFORMANCE

### Loading States
1. [ ] Verify loading spinner shows when loading tasks ✅
2. [ ] Verify tasks load within 2-3 seconds ✅
3. [ ] Verify category modal opens instantly ✅

### Smooth Animations
4. [ ] Verify modal slide-up animation is smooth ✅
5. [ ] Verify task card hover effect is smooth ✅
6. [ ] Verify button transitions are smooth ✅

---

## 🎉 SUCCESS CRITERIA

**ALL tests pass if:**
- ✅ Login required works (Turn On button → Login modal)
- ✅ Category selection is mobile-friendly (large tap targets)
- ✅ Sub-skills can be selected
- ✅ Distance up to 100km works
- ✅ Pricing supports ₹10+
- ✅ Auto-enable helper mode works on task click
- ✅ No console errors
- ✅ Database updates correctly
- ✅ All navigation works
- ✅ Mobile UX is smooth
- ✅ Colors follow accessibility rules (black text on green)

---

## 🐛 IF TESTS FAIL

### Common Issues:

**1. Category modal doesn't open:**
- Check: `showCategorySelectionOnMount` prop is set correctly
- Check: No JavaScript errors in console

**2. Tasks don't load:**
- Check: Supabase migrations ran successfully
- Check: RLS policies are disabled for helper_preferences
- Check: User has location set

**3. Distance doesn't show:**
- Check: User location is set (globalLocation has latitude/longitude)
- Check: Tasks have latitude/longitude in database

**4. Auto-enable doesn't work:**
- Check: task_classifications table has detected_categories
- Check: Task categories are in array format
- Check: User is logged in

**5. Sub-skills don't filter:**
- Check: Task description contains sub-skill keywords
- Check: Filter logic checks both title and description

---

## 📞 DEBUGGING TIPS

1. **Check console logs:**
   - Look for "Error loading tasks"
   - Look for "Error loading helper preferences"
   - Look for network errors

2. **Check Supabase:**
   - Go to Table Editor → helper_preferences
   - Verify data is being saved
   - Check for RLS policy errors

3. **Check state:**
   - Use React DevTools
   - Inspect `selectedCategories`, `selectedSubSkills`, `maxDistance`
   - Verify state updates on button clicks

4. **Check network:**
   - Open Network tab
   - Look for failed API calls
   - Check Supabase query responses

---

## ✅ FINAL CHECKLIST

- [ ] All flows tested
- [ ] No console errors
- [ ] Database updates correctly
- [ ] Mobile UX is smooth
- [ ] Colors are accessible
- [ ] Touch targets are large enough
- [ ] Loading states show
- [ ] Empty states show
- [ ] Filters work correctly
- [ ] Sorting works correctly
- [ ] Navigation works correctly
- [ ] Auto-enable works
- [ ] Login required works

**IF ALL CHECKED → YOU'RE READY TO LAUNCH! 🚀**
