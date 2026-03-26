# ⚠️ PENDING FILES - What Still Needs Work

## ✅ **FULLY COMPLETED** (7 files)

1. `/3_LEVEL_LOCATION_SAFE_MIGRATION.sql` ✅
2. `/services/locations.ts` ✅
3. `/components/LocationSetupModal.tsx` ✅
4. `/components/LocationBottomSheet.tsx` ✅
5. `/App.tsx` ✅
6. `/screens/CreateListingScreen.tsx` ✅
7. `/screens/CreateWishScreen.tsx` ✅

---

## ⚠️ **PARTIALLY COMPLETED** (1 file)

### `/screens/CreateTaskScreen.tsx` - HAS COMPILATION ERRORS

**Issue**: File references undefined variables (`exactLocation`, `latitude`, `longitude`, `setExactLocation`, `setLatitude`, `setLongitude`) that were part of the old GPS system.

**What's done**:
- ✅ Added `subAreaId` state
- ✅ Added 3rd dropdown UI with landmarks
- ✅ Auto-fill from global location includes sub-area
- ✅ Submission includes `subAreaId`

**What's broken**:
- ❌ Missing state variables for GPS (lines referencing `latitude`, `longitude`, `exactLocation`)
- ❌ Auto-GPS detection code still present (lines 82-99)
- ❌ GPS indicator UI still present (lines 450-477)

**Quick Fix Option 1** - Remove GPS entirely:
```typescript
// Remove lines 82-99 (GPS auto-detection useEffect)
// Remove GPS state indicators from UI (lines 450-477)
// Update submission to use area/sub-area coordinates only
```

**Quick Fix Option 2** - Keep GPS but fix states:
```typescript
// Add missing states at top:
const [exactLocation, setExactLocation] = useState('');
const [latitude, setLatitude] = useState<number | undefined>();
const [longitude, setLongitude] = useState<number | undefined>();
```

**Recommended**: Option 1 (remove GPS) since we're moving to pre-stored coordinates only.

---

## ⏳ **NOT STARTED YET** (Distance Calculation)

These files need updating to use road distance instead of straight-line:

### Distance Calculation Files (3 files)

1. **`/components/ListingCard.tsx`** - Update distance calculation
   - Current: Uses Haversine formula (straight-line)
   - Needed: Use `get_distance_km()` from database
   - Complexity: Medium (15 min)

2. **`/components/TaskCard.tsx`** - Update distance calculation
   - Current: Uses Haversine formula
   - Needed: Use `get_distance_km()` from database
   - Complexity: Medium (10 min)

3. **`/components/WishCard.tsx`** - Update distance calculation
   - Current: Uses Haversine formula
   - Needed: Use `get_distance_km()` from database
   - Complexity: Medium (10 min)

**How to update distance calculation**:
```typescript
// OLD (Haversine - straight-line):
const distance = calculateDistance(
  userLat, userLon,
  itemLat, itemLon
);

// NEW (Road distance from database):
const { data } = await supabase.rpc('get_distance_km', {
  from_sub_area_id: userSubAreaId,
  to_sub_area_id: itemSubAreaId
});
const distance = data;
```

---

## ⏳ **NOT STARTED YET** (3-Level Address Display)

These files should show full 3-level address instead of just city/area:

### Detail Screens (3 files)

1. **`/screens/ListingDetailScreen.tsx`** - Show 3-level address
   - Current: Shows "Area, City"
   - Needed: Show "Sub-area, Area, City" (if sub-area exists)
   - Complexity: Easy (5 min)

2. **`/screens/TaskDetailScreen.tsx`** - Show 3-level address
   - Current: Shows "Area, City"
   - Needed: Show "Sub-area, Area, City"
   - Complexity: Easy (5 min)

3. **`/screens/WishDetailScreen.tsx`** - Show 3-level address
   - Current: Shows "Area, City"
   - Needed: Show "Sub-area, Area, City"
   - Complexity: Easy (5 min)

**How to update address display**:
```typescript
// OLD:
<p>{listing.area}, {listing.city}</p>

// NEW:
<p>
  {listing.subArea && `${listing.subArea}, `}
  {listing.area}, {listing.city}
</p>
```

---

## 📊 **SUMMARY**

| Status | Count | Files |
|--------|-------|-------|
| ✅ Complete | 7 | Location modals, App, Listing & Wish creation |
| ⚠️ Has Errors | 1 | CreateTaskScreen (GPS code issue) |
| ⏳ Pending | 6 | Cards (distance) + Detail screens (address) |

**Total Files**: 14  
**Completed**: 7 (50%)  
**With Errors**: 1 (7%)  
**Pending**: 6 (43%)  

---

## 🎯 **RECOMMENDED ACTION PLAN**

### **Priority 1: Fix CreateTaskScreen** (10 minutes)
Remove GPS code entirely or add missing state variables.

### **Priority 2: Update Distance Calculation** (35 minutes)
Update all 3 card components to use database road distances.

### **Priority 3: Update Detail Screens** (15 minutes)
Show 3-level address in all detail views.

**Total remaining work: ~60 minutes**

---

## 🐛 **KNOWN ISSUES**

1. **CreateTaskScreen won't compile** - Missing GPS state variables
2. **Distances inaccurate** - Still using straight-line Haversine
3. **Addresses incomplete** - Not showing sub-area in details

---

## ✅ **WHAT'S WORKING NOW**

1. ✅ Location modals (3 levels, working perfectly)
2. ✅ Creating listings (full 3-level support)
3. ✅ Creating wishes (full 3-level support)
4. ✅ Database has all 3-level data and road distances
5. ⚠️ Creating tasks (has UI but won't compile)
6. ⚠️ Viewing items (works but distances wrong)

---

## 🚀 **DEPLOYMENT STATUS**

**Can deploy?**: ⚠️ **NOT YET** - CreateTaskScreen has compilation errors

**Blocker**: CreateTaskScreen references undefined variables

**Quick fix**: Remove GPS code from CreateTaskScreen (10 min), then safe to deploy

**After fix**: Can deploy with degraded distance accuracy (straight-line instead of road)

---

**Your options**:
1. ✅ **Let me fix CreateTaskScreen now** (remove GPS code)
2. ⏳ **Fix it manually** (remove lines 82-99 and 450-477, update submission logic)
3. 🔄 **Skip tasks for now** (deploy without task creation feature)

Which do you prefer?
