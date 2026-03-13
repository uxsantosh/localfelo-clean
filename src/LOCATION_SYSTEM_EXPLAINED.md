# OldCycle Location System - Complete Explanation

## Overview
OldCycle uses a **two-coordinate system** to calculate distances accurately, regardless of whether users use GPS or manually select their location.

---

## How Distance Calculation Works

### Two Types of Coordinates:

#### 1. **User's Reference Location** (Browsing Location)
Where the user wants to browse FROM:
- **GPS Method**: User allows GPS → we store their exact coordinates
- **Manual Method**: User selects City/Area → we store that area's representative coordinates

#### 2. **Listing Location** (Item/Task/Wish Location)
Where the item/task/wish is located:
- Always requires GPS coordinates when creating a listing/task/wish
- Users must enable location services when posting

---

## Database Schema

### `profiles` Table (User's Browsing Location)
```sql
- city: TEXT (e.g., "Chennai")
- area: TEXT (e.g., "adyar-adyar")
- latitude: DECIMAL(10, 7) -- User's GPS OR area's representative coords
- longitude: DECIMAL(10, 7) -- User's GPS OR area's representative coords
- location_updated_at: TIMESTAMP
```

### `areas` Table (Representative Coordinates)
```sql
- id: TEXT (e.g., "adyar-adyar")
- city_id: TEXT (e.g., "chennai")
- name: TEXT (e.g., "Adyar")
- latitude: DECIMAL(10, 7) -- Area center point (NEW!)
- longitude: DECIMAL(10, 7) -- Area center point (NEW!)
```

### `listings/tasks/wishes` Tables (Item Location)
```sql
- latitude: DECIMAL(10, 7) -- Exact GPS where item/task is located
- longitude: DECIMAL(10, 7) -- Exact GPS where item/task is located
```

---

## User Flow Examples

### Example 1: GPS User Browsing
1. User logs in → LocationSetupModal appears
2. User clicks "Use GPS Location" → Grants permission
3. User selects City: Chennai, Area: Adyar
4. System stores:
   ```
   profiles.city = "Chennai"
   profiles.area = "adyar-adyar"
   profiles.latitude = 13.0067 (exact GPS)
   profiles.longitude = 80.2570 (exact GPS)
   ```
5. When browsing listings:
   - Distance = calculate(user's GPS coords, listing's GPS coords)
   - Shows: "📍 2.3 km away"

### Example 2: Manual Selection User Browsing
1. User logs in → LocationSetupModal appears
2. User clicks "Select Manually"
3. User selects City: Chennai, Area: T Nagar
4. System fetches area coordinates from `areas` table:
   ```sql
   SELECT latitude, longitude FROM areas WHERE id = 't-nagar-t-nagar'
   -- Returns: 13.0418, 80.2341
   ```
5. System stores:
   ```
   profiles.city = "Chennai"
   profiles.area = "t-nagar-t-nagar"
   profiles.latitude = 13.0418 (area center)
   profiles.longitude = 80.2341 (area center)
   ```
6. When browsing listings:
   - Distance = calculate(T Nagar center coords, listing's GPS coords)
   - Shows: "📍 5.7 km away" (from T Nagar center)

### Example 3: User Posting from Different Location
1. User's browsing location: Adyar (set earlier)
2. User wants to post a listing for an item in Velachery
3. User goes to Create Listing screen
4. User can select ANY city/area for the listing
5. When posting, listing's GPS is detected separately:
   ```
   listings.city = "Chennai"
   listings.area = "velachery-velachery"
   listings.latitude = 12.9750 (item's actual GPS)
   listings.longitude = 80.2210 (item's actual GPS)
   ```
6. User's browsing location stays unchanged in their profile

---

## Key Files

### 1. `/ADD_AREA_COORDINATES.sql`
- Migration script to add latitude/longitude to `areas` table
- Seeds representative coordinates for all Chennai areas
- Run this in Supabase SQL Editor

### 2. `/hooks/useLocation.ts`
- Manages user's browsing location
- Fetches area coordinates when manual selection
- Stores in `profiles` table

### 3. `/components/LocationSetupModal.tsx`
- First-load prompt for setting browsing location
- Offers GPS or Manual selection
- Shows immediately when user has no location set

### 4. `/services/locations.ts`
- Fetches cities and areas with coordinates
- Returns area coordinates for manual selection fallback

---

## Why This Approach?

### ❌ Old Approach (Broken)
- Used a random task's coordinates as "representative"
- Always showed same distance (11.7km) regardless of selection
- Confusing and inaccurate

### ✅ New Approach (Fixed)
- Each area has a fixed center point coordinate
- GPS users get exact distances
- Manual users get distances from area center
- Accurate, predictable, and reliable

---

## Migration Steps

### Step 1: Run Database Migration
```sql
-- In Supabase SQL Editor
-- Paste contents of: /ADD_AREA_COORDINATES.sql
```

### Step 2: Verify Migration
```sql
-- Check all areas have coordinates
SELECT 
  a.name, 
  c.name as city_name,
  a.latitude, 
  a.longitude,
  CASE WHEN a.latitude IS NULL THEN '❌ Missing' ELSE '✅ Set' END as status
FROM areas a
JOIN cities c ON a.city_id = c.id
ORDER BY c.name, a.name;
```

### Step 3: Test User Flow
1. Clear your location: `localStorage.removeItem('oldcycle_location_setup_dismissed')`
2. Refresh app
3. LocationSetupModal should appear
4. Test both GPS and Manual selection
5. Verify distances show correctly

---

## FAQ

**Q: What if I select Adyar but I'm physically in T Nagar?**
A: You'll see distances calculated from Adyar center (where you selected), not your physical location. This is by design - you're browsing "as if" you're in Adyar.

**Q: Can I browse listings in a different city?**
A: Yes! You can change your browsing location anytime by clicking the location icon. Distances will recalculate based on your new selection.

**Q: What if I post a listing while in a different location?**
A: No problem! When creating a listing, you can select any city/area. The listing's GPS coordinates are captured separately from your browsing location.

**Q: Do I need to set location every time I log in?**
A: No, it's saved in your profile. You only need to set it once (or when you want to change it).

**Q: What if an area doesn't have coordinates?**
A: The migration script adds coordinates to all Chennai areas. New areas should be added with coordinates when created.

---

## Technical Details

### Distance Calculation Formula
```javascript
// Haversine formula for calculating distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance; // in km
}
```

### Coordinate Storage
- **Decimal Precision**: DECIMAL(10, 7)
  - 10 total digits
  - 7 decimal places
  - Accuracy: ~1.1 cm (sufficient for our use case)

### Representative Coordinates
- Based on Google Maps center points for each area
- Manually curated for Chennai areas
- Can be updated in SQL migration file

---

## Summary

✅ **GPS Users**: Get exact distances from their real-time location
✅ **Manual Users**: Get distances from selected area's center point
✅ **Listing Creators**: Can post items from ANY location
✅ **Distance Calculation**: Always accurate, never shows fixed 11.7km
✅ **First-Load UX**: Smooth prompt to set location immediately
✅ **Flexible**: Users can change browsing location anytime
