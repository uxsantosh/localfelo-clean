# 🚀 Quick Start - Run These 3 Files in Order

### Step 1: Schema Migration (Wishes & Tasks)
📄 **File:** `FINAL_MIGRATION_WISHES_TASKS_ROLES.sql`
- Adds role_id column to wishes and tasks tables
- Creates indexes for performance
- Updates RLS policies

### Step 2: Notifications System Update
📄 **File:** `FINAL_NOTIFICATIONS_UNIFIED.sql`
- Adds notification columns (related_type, related_id, action_label, metadata)
- Creates notification_details view
- Adds helper functions and indexes

### Step 3: Verification
📄 **File:** `VERIFICATION_QUERIES.sql`
- Checks all migrations succeeded
- Shows summary statistics
- Identifies any issues

---

## ⚠️ IMPORTANT: Data Migration Required

After running the 3 files above, you'll see that wishes and tasks have:
- ✅ The new `role_id` column created
- ❌ But all role_id values are NULL (0 records with role)

This is expected! Now run the data migration to populate the roles:

### Step 4: Populate Role Data 🆕
📄 **File:** `DATA_MIGRATION_POPULATE_ROLES.sql`
- Maps existing wishes/tasks category+subcategory to role_id
- Updates all existing records with appropriate roles
- Shows which records (if any) couldn't be auto-mapped

**This will:**
- Analyze your existing wishes/tasks categories
- Map them to the 85 professional roles
- Update all records automatically
- Report any unmapped records for manual review

---

## 🎯 After Running - Share Results

**Please share the output from Section 23 (Migration Summary) which shows:**
```
table_name    | total_records | with_role | with_subcategories | with_helper_category
wishes        | X             | 0         | 0                  | 0
tasks         | X             | 0         | 0                  | 0
professionals | X             | Y         | Y                  | NULL
notifications | X             | Y         | Y                  | Z (unread)
```

This will confirm:
- ✅ All tables exist
- ✅ New columns created (currently 0 because no new data yet)
- ✅ Existing professionals have role data
- ✅ Notifications system working

---

## ⚠️ Troubleshooting

### If you get "column already exists" error:
✅ **This is OK!** The migrations use `ADD COLUMN IF NOT EXISTS` - safe to re-run

### If you get "constraint already exists" error:
✅ **This is OK!** The migrations check for existing constraints - safe to re-run

### If you get "relation does not exist" error:
❌ **Run the files in order!** File 3 depends on File 1 and File 2 completing successfully

### If you get foreign key constraint error:
❌ **Check roles table:** Run `SELECT * FROM roles;` - should show Electrician, Plumber, etc.

---

## 🎉 What's Next After Migration

Once the migrations complete successfully, I'll help you:

1. **Update CreateWishScreen.tsx** to use role picker (like professionals)
2. **Update CreateTaskScreen.tsx** to use role picker (like professionals)
3. **Update wish creation service** to send role_id + subcategory_ids
4. **Update task creation service** to send role_id + subcategory_ids
5. **Update notification routing** to use related_type for module navigation

---

## 📞 Need Help?

If you encounter any errors while running the migrations:
1. **Copy the full error message**
2. **Note which file** you were running (1, 2, or 3)
3. **Share it with me** and I'll help fix it immediately

---

Ready? Run the files now and share the verification output! 🚀