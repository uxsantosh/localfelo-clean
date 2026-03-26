# LocalFelo Professionals - Role-Based System

## 🎯 Overview

The Professionals module has been completely redesigned to use a **role-based system** instead of raw categories. This provides a better user experience where users think in terms of roles (Electrician, Plumber, etc.) while the system maintains the existing category/subcategory backend logic.

## 🚨 Key Principle

**Users see: ROLES** (Electrician, Plumber, Doctor)  
**System stores: SUBCATEGORIES** (fan repair, tap repair, consultation)  
**Mapping: Roles → Subcategories** (transparent to users)

---

## 📦 What Was Implemented

### 1. Database Schema

**New Tables:**
- `roles` - Stores professional roles (Electrician, Plumber, etc.)
- `role_subcategories` - Maps roles to subcategories

**Updated Tables:**
- `professionals` - Added `role_id` and `subcategory_ids[]` columns

**Migration Files:**
- `/supabase/migrations/20260322_create_roles_tables.sql` - Creates tables and inserts 25 default roles
- `/supabase/migrations/20260322_migrate_existing_professionals.sql` - Migrates existing professionals to role system

### 2. Services Layer

**`/services/roles.ts`** - Complete role management:
- `getAllRoles()` - Fetch all active roles
- `getRoleById()` - Get role with subcategories
- `getRoleByName()` - Find role by name
- `findRoleBySubcategory()` - Map subcategory to role
- `getProfessionalsByRole()` - Filter professionals by role
- `searchRolesAndProfessionals()` - Search functionality
- `updateRoleImage()` - Admin: Update role image
- `createRole()` - Admin: Create new role

**`/services/professionals.ts`** - Updated to support roles:
- Added `role_id`, `role_name`, `subcategory_ids` fields to Professional type
- Updated `createProfessional()` to accept role data

### 3. UI Screens

**New Role-Based Screens:**

1. **`/screens/ProfessionalsRoleScreen.tsx`**
   - Shows roles instead of categories on home screen
   - Search functionality
   - "Register as Professional" button

2. **`/screens/RegisterProfessionalRoleScreen.tsx`**
   - 3-step registration flow
   - Step 1: Select role (What do you do?)
   - Step 2: Profile details (name, title, WhatsApp, location)
   - Step 3: Services & photos
   - Auto-maps selected role to subcategories

3. **`/screens/ProfessionalsListingRoleScreen.tsx`**
   - Shows professionals filtered by role
   - Distance-based filtering
   - Subcategory filtering within role
   - Map view support

**Updated Screens:**

- **`/screens/ProfessionalDetailScreen.tsx`** - Shows role name prominently
- **`/components/ProfessionalCard.tsx`** - Added `showRole` prop

### 4. Admin Interface

**`/components/admin/RolesManagementTab.tsx`**
- Upload images for each role
- View role statistics
- Manage role images
- Accessible from Admin panel → Roles tab

---

## 🎨 25 Default Roles

The system includes these professional roles:

1. Electrician
2. Plumber
3. Driver
4. Delivery Partner
5. Cleaner
6. Cook / Chef
7. Teacher / Tutor
8. Photographer
9. CA / Accountant
10. Lawyer
11. Doctor / Healthcare
12. Nurse / Caretaker
13. Technician (IT)
14. Beautician
15. Mechanic
16. Event Planner
17. Pet Caretaker
18. Consultant
19. Freelancer
20. Moving & Packing Helper
21. Laundry Service
22. Home Service Professional
23. Document Helper
24. Partner / Companion
25. Other

Each role is mapped to relevant subcategories from the existing system.

---

## 🚀 Deployment Steps

### Step 1: Run Database Migrations

Execute these SQL files in order on your Supabase database:

```sql
-- 1. Create roles tables and insert default data
\i supabase/migrations/20260322_create_roles_tables.sql

-- 2. Migrate existing professionals to role system
\i supabase/migrations/20260322_migrate_existing_professionals.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy and run the content of each migration file

### Step 2: Verify Database

After migration, verify:

```sql
-- Check roles created
SELECT COUNT(*) FROM roles;
-- Should return 25

-- Check role mappings
SELECT r.name, COUNT(rs.id) as subcategory_count
FROM roles r
LEFT JOIN role_subcategories rs ON r.id = rs.role_id
GROUP BY r.id, r.name
ORDER BY r.display_order;

-- Check professionals migrated
SELECT COUNT(*) FROM professionals WHERE role_id IS NOT NULL;
SELECT COUNT(*) FROM professionals WHERE subcategory_ids IS NOT NULL;
```

### Step 3: Deploy Code

The code changes are already integrated into:
- ✅ App.tsx (routing updated)
- ✅ AdminScreen.tsx (roles tab added)
- ✅ All necessary services and components

Just deploy your application normally.

### Step 4: Upload Role Images (Optional)

As admin:
1. Go to Admin Panel
2. Click "Roles" tab
3. Upload images for each role
4. Recommended: 400x400px PNG with transparent background

---

## 🔄 How It Works

### For Users (Registration Flow)

1. User clicks "Register as Professional"
2. **Step 1:** Selects a role (e.g., "Electrician")
3. **Step 2:** Enters profile details (name, title, WhatsApp, location)
4. **Step 3:** Adds services and photos
5. System automatically maps role to subcategories behind the scenes

### For Users (Search/Browse Flow)

1. User goes to Professionals screen
2. Sees role cards (Electrician, Plumber, etc.)
3. Clicks a role
4. Sees all professionals for that role in their area
5. Can filter by subcategories within the role

### Backend Mapping

When a professional selects "Electrician" role:
- System maps to subcategories: `['fan-repair', 'switch-repair', 'electrical-wiring']`
- Stores `role_id` = Electrician's UUID
- Stores `subcategory_ids` = array of subcategory IDs
- Professional appears in searches for any of these subcategories

---

## 📊 Backward Compatibility

The system maintains backward compatibility:

- **Old fields still work:** `category_id`, `subcategory_id`
- **New fields added:** `role_id`, `subcategory_ids[]`
- **Fallback logic:** If role not set, displays category
- **Migration script:** Auto-assigns roles to existing professionals

---

## 🔍 Matching Logic

### Tasks → Professionals

When a task is created:
1. Task has `category_id` and `subcategory_id`
2. System finds professionals where `subcategory_ids` contains the task's subcategory
3. Notifies matching professionals
4. **No changes needed** - existing matching logic still works!

### Search

Search matches:
- Role names
- Professional names
- Services offered
- Subcategory names (behind the scenes)

---

## 🎯 Admin Capabilities

### Role Management
- Upload/update images for roles
- View statistics (total roles, with/without images)
- Create new roles (advanced)

### Professional Management
- View all professionals
- See which role each professional is assigned to
- Manage professional status

---

## 🚨 Important Notes

### DO NOT:
- ❌ Delete or modify existing category/subcategory tables
- ❌ Change the Tasks, Wishes, or Marketplace flows
- ❌ Remove backward compatibility with old category system

### DO:
- ✅ Use role-based screens for all new professional flows
- ✅ Upload role images for better UX
- ✅ Keep role mappings up to date
- ✅ Test professional registration and search

---

## 🐛 Troubleshooting

### Professionals not appearing in role listing

**Solution:**
```sql
-- Check if professional has role assigned
SELECT id, name, role_id, subcategory_ids 
FROM professionals 
WHERE id = 'professional-id';

-- If role_id is NULL, run migration again
\i supabase/migrations/20260322_migrate_existing_professionals.sql
```

### Role images not showing

**Solution:**
1. Go to Admin → Roles tab
2. Upload image for the role
3. Check that image URL is saved:
```sql
SELECT name, image_url FROM roles WHERE name = 'Electrician';
```

### Search not working

**Solution:**
- Ensure RLS policies are correct
- Check that `roles` table has `is_active = true`
- Verify search function in `/services/roles.ts`

---

## 📈 Future Enhancements

Potential improvements:
1. **AI-powered role suggestions** based on services
2. **Multi-role support** (one professional, multiple roles)
3. **Role categories** (group related roles)
4. **Skill levels** (beginner, intermediate, expert)
5. **Certifications** per role
6. **Role-specific fields** (e.g., license number for drivers)

---

## 📞 Support

For issues or questions:
1. Check console logs for errors
2. Verify database migrations ran successfully
3. Test with a fresh professional registration
4. Check Admin → Roles tab for role data

---

## ✅ Success Criteria

System is working correctly when:
- ✅ Professionals screen shows 25 role cards
- ✅ Registration flow uses 3-step role selection
- ✅ Professional listings show by role
- ✅ Professional detail shows role name
- ✅ Admin can upload role images
- ✅ Search works across roles and professionals
- ✅ Existing professionals migrated successfully

---

**Last Updated:** March 22, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
