# ✅ Migration Checklist

Track your progress as you complete the role-based migration for Wishes and Tasks.

---

## 📋 Phase 1: Database Migration (DO THIS NOW)

### Step 1: Run SQL Migrations
- [ ] Open Supabase SQL Editor
- [ ] Run `FINAL_MIGRATION_WISHES_TASKS_ROLES.sql`
  - [ ] Verify: See ✅ success messages
  - [ ] Verify: No error messages
- [ ] Run `FINAL_NOTIFICATIONS_UNIFIED.sql`
  - [ ] Verify: See ✅ success messages
  - [ ] Verify: No error messages
- [ ] Run `VERIFICATION_QUERIES.sql`
  - [ ] Verify: See all 23 sections
  - [ ] Verify: Section 23 shows migration summary
  - [ ] Copy Section 23 output to share

### Step 2: Verify Database Changes
- [ ] wishes table has new columns:
  - [ ] role_id
  - [ ] subcategory_ids
  - [ ] helper_category
  - [ ] intent_type
- [ ] tasks table has new columns:
  - [ ] role_id
  - [ ] subcategory_ids
  - [ ] helper_category
  - [ ] intent_type
- [ ] notifications table has new columns:
  - [ ] related_type
  - [ ] related_id
  - [ ] action_label
  - [ ] metadata

---

## 📋 Phase 2: Frontend Updates (AFTER DB MIGRATION)

### Step 3: Update Wish Creation UI
- [ ] Update `CreateWishScreen.tsx`:
  - [ ] Replace category picker with role picker
  - [ ] Add subcategory multi-select (like professionals)
  - [ ] Update form state to include role_id
  - [ ] Update validation logic
- [ ] Update wish creation service:
  - [ ] Send role_id in POST request
  - [ ] Send subcategory_ids array
  - [ ] Map role → category/subcategory on backend

### Step 4: Update Task Creation UI
- [ ] Update `CreateTaskScreen.tsx`:
  - [ ] Replace category picker with role picker
  - [ ] Add subcategory multi-select (like professionals)
  - [ ] Update form state to include role_id
  - [ ] Update validation logic
- [ ] Update task creation service:
  - [ ] Send role_id in POST request
  - [ ] Send subcategory_ids array
  - [ ] Map role → category/subcategory on backend

### Step 5: Update Notification Routing
- [ ] Update notification navigation logic:
  - [ ] Use related_type to determine module
  - [ ] Use related_id to find specific item
  - [ ] Add routing for wishes module
  - [ ] Add routing for tasks module
- [ ] Test notification clicks:
  - [ ] Listing notifications → listing detail
  - [ ] Wish notifications → wish detail
  - [ ] Task notifications → task detail
  - [ ] Professional notifications → professional profile

---

## 📋 Phase 3: Testing (AFTER FRONTEND UPDATES)

### Step 6: Test Wish Flow
- [ ] Create new wish with role picker
- [ ] Verify role_id saved in database
- [ ] Verify subcategory_ids saved as array
- [ ] Verify wish appears in listings
- [ ] Verify wish search/filter works with roles

### Step 7: Test Task Flow
- [ ] Create new task with role picker
- [ ] Verify role_id saved in database
- [ ] Verify subcategory_ids saved as array
- [ ] Verify task appears in listings
- [ ] Verify task search/filter works with roles

### Step 8: Test Notification Flow
- [ ] Create notification for wish
- [ ] Verify related_type = 'wish'
- [ ] Click notification → navigates to wish
- [ ] Create notification for task
- [ ] Verify related_type = 'task'
- [ ] Click notification → navigates to task

---

## 📋 Phase 4: Backward Compatibility (ONGOING)

### Step 9: Verify Old Data Still Works
- [ ] Existing wishes (without role_id) display correctly
- [ ] Existing tasks (without role_id) display correctly
- [ ] Old notifications still route correctly
- [ ] No broken links or navigation errors

### Step 10: Migration Complete!
- [ ] All new wishes use role_id ✅
- [ ] All new tasks use role_id ✅
- [ ] All new notifications use related_type ✅
- [ ] System unified across all 4 modules ✅

---

## 🎯 Current Status

**Phase 1:** 🔄 In Progress - Run SQL migrations now
**Phase 2:** ⏳ Waiting - After Phase 1 completes
**Phase 3:** ⏳ Waiting - After Phase 2 completes
**Phase 4:** ⏳ Waiting - After Phase 3 completes

---

## 📞 Stuck? Need Help?

If you encounter any issues:
1. Note which step you're on
2. Copy the error message (if any)
3. Share with me and I'll help immediately

---

**Next Action:** Run the 3 SQL migration files in Supabase SQL Editor! 🚀
