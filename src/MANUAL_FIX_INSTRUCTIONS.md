# Manual Fix Instructions for App.tsx

Since the file is too large to edit completely, here are the exact find-replace operations you need to do:

## Step 1: Find and Replace (Global)
Use your code editor's find-replace feature (Ctrl+H or Cmd+H):

### Replace 1: Fix all location click handlers
**Find:** `setShowLocationSheet(true)`
**Replace with:** `setShowLocationSetupModal(true)`

This will fix all these lines:
- Line ~704: `onLocationClick={() => setShowLocationSheet(true)}`
- Line ~729: `setShowLocationSheet(true);`
- Line ~955: `onLocationClick={() => setShowLocationSheet(true)}`
- Line ~993: `onLocationClick={() => setShowLocationSheet(true)}`
- Line ~1032: `onLocationClick={() => setShowLocationSheet(true)}`
- Line ~1089: `onLocationClick={() => setShowLocationSheet(true)}`
- Line ~1176: `onSetLocation={() => setShowLocationSheet(true)}`
- Line ~1210: `onLocationClick={() => setShowLocationSheet(true)}`

### Replace 2: Fix variable name
**Find:** `showLocationSheet`
**Replace with:** `showLocationSetupModal`

## Step 2: Remove LocationBottomSheet Component
Find this block (around line 1229-1240) and **DELETE IT**:

```typescript
{/* Location Bottom Sheet */}
<LocationBottomSheet
  isOpen={showLocationSheet}
  onClose={() => setShowLocationSheet(false)}
  currentLocation={globalLocation}
  onSave={handleSaveLocation}
  onDetect={handleDetectLocation}
  cities={cities}
  detectedCoords={detectedCoords}
  loading={locationLoading}
  error={locationError}
/>
```

## Step 3: Add New LocationSetupModal for Manual Changes
After the AuthScreen Modal closing brace, add this (around line 1215):

```typescript
{/* Location Change Modal - When user manually clicks to change location */}
{showLocationSetupModal && globalLocation && globalLocation.latitude && (
  <LocationSetupModal
    isOpen={showLocationSetupModal}
    onClose={() => setShowLocationSetupModal(false)}
    cities={cities}
    onSetLocation={async (data) => {
      const selectedCity = cities.find(c => c.id === data.city);
      const selectedArea = selectedCity?.areas?.find(a => a.id === data.area);
      const selectedSubArea = selectedArea?.sub_areas?.find((sa: any) => sa.id === data.subArea);
      
      const latitude = selectedSubArea?.latitude || selectedArea?.latitude;
      const longitude = selectedSubArea?.longitude || selectedArea?.longitude;
      
      if (!latitude || !longitude) {
        toast.error('Location coordinates missing.');
        return;
      }
      
      const locationData = {
        city: selectedCity?.name || data.city,
        area: selectedArea?.name || data.area,
        cityId: data.city,
        areaId: data.area,
        subAreaId: data.subArea,
        subArea: selectedSubArea?.name,
        latitude: latitude,
        longitude: longitude,
        isGPS: false,
      };
      
      await updateGlobalLocation(locationData);
      setShowLocationSetupModal(false);
      toast.success('Location updated! 📍');
    }}
  />
)}
```

## Step 4: Verify Changes
After making these changes:

1. **Check for compile errors:** `npm run build` or check TypeScript in your editor
2. **Look for any remaining** `showLocationSheet` references - there should be NONE
3. **Look for any remaining** `LocationBottomSheet` references - there should be NONE
4. **Test the flow:**
   - First load → LocationSetupModal shows (clean 3-level)
   - Select location → saves successfully
   - Click location icon → LocationSetupModal opens (NOT old UI)
   - NO browser permission popups
   - NO auto-detect buttons

## Expected Result
✅ Only LocationSetupModal (clean, 3-level selection)  
❌ No LocationBottomSheet (old UI with auto-detect)  
❌ No browser permission modals  
❌ No GPS auto-detection  

## If You Still See Old UI
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check console for errors
4. Verify all replacements were applied

---

**Need help?** Check `/LOCATION_FIX_CHANGES.md` for detailed explanation of what was changed and why.
