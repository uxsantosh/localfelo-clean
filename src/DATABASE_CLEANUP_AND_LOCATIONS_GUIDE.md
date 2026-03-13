# 🗑️ Database Cleanup & 3-Level Locations Setup Guide

This guide will help you:
1. **Delete all user data** (keeping only admin)
2. **Add complete 3-level location data** for all cities
3. **Add road distance matrix** for accurate distance calculations

---

## 📋 Step-by-Step Instructions

### **Step 1: Delete All User Data (Keep Admin Only)**

⚠️ **IMPORTANT**: This will permanently delete all listings, tasks, wishes, conversations, messages, notifications, and users EXCEPT the admin account.

**Before running, make sure:**
- Your admin account exists with email: `admin@oldcycle.com`
- If your admin has a different email, edit the SQL file and change the email on line 11

**Run this file:**
```
/DELETE_ALL_USER_DATA_KEEP_ADMIN.sql
```

**What it does:**
- ✅ Deletes all non-admin messages
- ✅ Deletes all non-admin conversations  
- ✅ Deletes all non-admin notifications
- ✅ Deletes all non-admin tasks
- ✅ Deletes all non-admin wishes
- ✅ Deletes all non-admin listings
- ✅ Deletes all reports
- ✅ Deletes all non-admin profiles
- ✅ Deletes all non-admin auth users from Supabase Auth
- ✅ Shows verification counts at the end

**Expected Result:**
```
✅ Admin found with token: <token>
✅ Deleted messages from non-admin conversations
✅ Deleted non-admin conversations
✅ Deleted non-admin notifications
✅ Deleted non-admin tasks
✅ Deleted non-admin wishes
✅ Deleted non-admin listings
✅ Deleted all reports
✅ Deleted all non-admin users
✅ Deleted all non-admin auth users
🎉 DATABASE CLEANED! Only admin data remains.
```

---

### **Step 2: Add Complete 3-Level Location Data**

This adds street-level/sub-area data for **ALL 33 areas** across 5 cities.

**Run this file:**
```
/COMPLETE_3_LEVEL_LOCATIONS_ALL_CITIES.sql
```

**What it covers:**
- 🏙️ **Mumbai (8 areas)**: Andheri, Bandra, Borivali, Dadar, Goregaon, Malad, Powai, Thane
- 🏙️ **Delhi (6 areas)**: Connaught Place, Dwarka, Lajpat Nagar, Nehru Place, Rohini, Saket
- 🏙️ **Bangalore (6 areas)**: Indiranagar, Koramangala, Whitefield, Jayanagar, Electronic City, HSR Layout
- 🏙️ **Hyderabad (5 areas)**: Banjara Hills, Gachibowli, Hitech City, Jubilee Hills, Madhapur
- 🏙️ **Pune (5 areas)**: Hinjewadi, Kothrud, Wakad, Viman Nagar, Pimpri-Chinchwad

**Total Coverage:**
- ✅ 5 Cities
- ✅ 33 Areas  
- ✅ 264 Sub-Areas (streets/landmarks)

**Expected Result:**
```
✅ 3-LEVEL LOCATION SYSTEM COMPLETE!
📍 5 Cities Covered
📍 33 Areas Covered
📍 264 Sub-Areas Added

✅ Every area now has detailed street-level data!
```

**Verification Query:**
The script will automatically show a breakdown table at the end showing:
- City name
- Total areas per city
- Total sub-areas per city

---

### **Step 3: Add Road Distance Matrix (Optional but Recommended)**

This adds pre-calculated road distances between nearby sub-areas based on Google Maps data.

**Run this file:**
```
/ADD_ROAD_DISTANCES_MATRIX.sql
```

**What it does:**
- ✅ Adds realistic road distances (not straight-line calculations)
- ✅ Includes travel time estimates
- ✅ Covers nearby sub-areas within same city
- ✅ Makes distance badges accurate (e.g., "2.5 km away")

**Expected Result:**
```
✅ ROAD DISTANCE MATRIX COMPLETE!
🛣️  Pre-calculated distances added for nearby sub-areas
📊 All distances based on Google Maps road network

✅ Distance calculations will now be ACCURATE!
```

---

## 🎯 What You Get

### **Before:**
- Only 2-level locations (City → Area)
- Inaccurate straight-line distances
- Generic location selection

### **After:**
- ✅ 3-level locations (City → Area → Sub-Area/Street)
- ✅ Accurate road distances with travel times
- ✅ Detailed street-level addresses
- ✅ Every area has 8 sub-areas minimum
- ✅ Real landmarks for easy identification

---

## 📍 Example Sub-Areas

### Bangalore > Koramangala:
- 1st Block (Forum Mall)
- 2nd Block (Jyoti Nivas College)
- 3rd Block (Sony World Junction)
- 4th Block (27th Main Road)
- 5th Block (80 Feet Road)
- 6th Block (Intermediate Ring Road)
- 7th Block (Koramangala Club)
- 8th Block (Raheja Arcade)

### Mumbai > Bandra:
- Bandra West (Bandstand Promenade)
- Bandra East (Bandra Kurla Complex)
- Pali Hill (Mount Mary Church)
- Linking Road (Shopping Street)
- Hill Road (Bandra Station)
- Perry Cross Road
- Carter Road (Sea Face)
- Reclamation (BKC Metro)

### Delhi > Dwarka:
- Sector 1
- Sector 6 (Metro Station)
- Sector 8
- Sector 10 (Metro Station)
- Sector 12 (Metro Station)
- Sector 14 (Metro Station)
- Sector 19
- Sector 21 (Metro Station)

---

## ⚠️ Important Notes

1. **Admin Email**: If your admin uses a different email than `admin@oldcycle.com`, update the SQL file before running Step 1.

2. **Backup First**: Although the delete script only targets non-admin data, it's always good practice to have a Supabase backup before running destructive operations.

3. **Run in Order**: Run the SQL files in the order listed (1 → 2 → 3).

4. **Verification**: Each script includes verification queries that run automatically at the end to confirm success.

5. **Sub-Areas Table**: Make sure the `sub_areas` table exists before running Step 2. If you ran the earlier location migration, it should already exist.

---

## 🔍 Verify Installation

After running all scripts, run these verification queries:

```sql
-- Check sub-areas count
SELECT COUNT(*) FROM sub_areas;
-- Expected: 264

-- Check distance matrix count  
SELECT COUNT(*) FROM area_distances;
-- Expected: 100+ records

-- Check user count (should be 1 = admin only)
SELECT COUNT(*) FROM profiles;
-- Expected: 1

-- Check listings count (should be 0 or admin's only)
SELECT COUNT(*) FROM listings;
```

---

## ✅ Success Criteria

You'll know everything worked when:
- ✅ Only admin user remains in the database
- ✅ All 264 sub-areas are inserted
- ✅ Distance matrix has 100+ entries
- ✅ Users can select City → Area → Sub-Area when posting
- ✅ Distance badges show accurate km (e.g., "2.5 km away")

---

## 🆘 Troubleshooting

**Problem**: Admin not found error
**Solution**: Update the email in the DELETE script to match your admin's email

**Problem**: Sub-areas table doesn't exist
**Solution**: Run `/3_LEVEL_LOCATION_WITH_DISTANCES.sql` first to create the table

**Problem**: Foreign key constraint error
**Solution**: Make sure areas table has all the area IDs (3-1, 3-2, etc.)

**Problem**: Duplicate key error
**Solution**: Safe to ignore - it means some sub-areas already exist

---

## 📞 Need Help?

If you encounter any issues:
1. Check the error message carefully
2. Verify all prerequisite tables exist
3. Make sure you ran the migrations in order
4. Check that your admin account exists

---

**That's it! Your database will be clean with comprehensive 3-level location data. 🎉**
