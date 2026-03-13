# Global Location System Implementation

## Overview
A lightweight global location system for OldCycle that allows users to set their location once and have it persist across the app.

## Features Implemented

### 1. Auto-detect Location
- Uses browser geolocation API (`navigator.geolocation`)
- Requests permission only once
- Stores permission status in localStorage
- Works on mobile (auto-detect) and desktop (manual entry)

### 2. Location Storage
- Stores location data in Supabase `profiles` table
- Fields added:
  - `city` (string) - City name
  - `area` (string) - Area/locality name
  - `street` (string, optional) - Street/landmark detail
  - `latitude` (decimal) - GPS latitude (stored but not publicly shown)
  - `longitude` (decimal) - GPS longitude (stored but not publicly shown)
  - `location_updated_at` (timestamp) - Last update time

### 3. Compact Header Display
- Shows location in header with Swiggy-like style: "📍 Area Name ⌄"
- Only visible when user is logged in
- Clicking opens location bottom sheet
- Responsive design works on all screen sizes

### 4. Location Bottom Sheet
- Compact form for manual location entry
- Auto-detect button (mobile-friendly)
- Optional street/landmark field
- Save button with loading state
- Error handling with user-friendly messages
- Smooth slide-up animation

## File Changes

### NEW FILES:
1. `/hooks/useLocation.ts` - React hook for location management
2. `/components/LocationBottomSheet.tsx` - UI component for location update
3. `/migrations/add_location_to_profiles.sql` - Database migration

### UPDATED FILES:
1. `/components/Header.tsx` - Added global location display
2. `/screens/HomeScreen.tsx` - Integrated global location props
3. `/App.tsx` - Added location hook and bottom sheet
4. `/styles/globals.css` - Added slide-up animation

## Usage

### For Users:
1. Login to OldCycle
2. Click on location indicator in header (📍)
3. Either:
   - Click "Auto-detect my location" (mobile)
   - Manually enter City and Area
4. Save location

### For Developers:

#### Using the Location Hook:
```typescript
import { useLocation } from '../hooks/useLocation';

const { 
  location,           // Current location data
  loading,           // Loading state
  error,             // Error message
  updateLocation,    // Function to update location
  detectLocation,    // Function to auto-detect location
  clearLocation      // Function to clear location
} = useLocation(userId);
```

#### Location Data Structure:
```typescript
interface UserLocation {
  city: string;
  area: string;
  street?: string;
  latitude: number;
  longitude: number;
  updatedAt?: string;
}
```

## Database Setup

Run the migration in your Supabase SQL Editor:
```sql
-- See /migrations/add_location_to_profiles.sql
```

## Technical Details

### Technology Stack:
- **Geolocation**: Browser's navigator.geolocation API
- **Storage**: Supabase PostgreSQL
- **State Management**: React hooks
- **UI**: React + Tailwind CSS
- **Animation**: CSS keyframes

### Design Principles:
- Mobile-first approach
- Lightweight (no external map SDKs)
- Privacy-focused (coordinates stored but not shown publicly)
- One-time permission request
- Flat design with 4px border radius
- Orange (#FF6B35) color palette

### Privacy & Security:
- Exact coordinates are stored securely in the database
- Only city and area are shown to other users
- Coordinates are never exposed in API responses to other users
- Permission request is handled gracefully

## Future Enhancements (Not Implemented)
- Reverse geocoding to auto-fill city/area from coordinates
- Location-based listing filtering
- Distance calculation between users
- Location history
- Multiple saved locations

## Testing
1. Login to OldCycle
2. Click location indicator in header
3. Test auto-detect on mobile device
4. Test manual entry on desktop
5. Verify location persists across page refreshes
6. Check that location shows in header after setting

## Browser Support
- Modern browsers with geolocation support
- Fallback to manual entry if geolocation not available
- Permission handling works on Chrome, Firefox, Safari, Edge

## Notes
- Location is user-specific (stored per profile)
- Location is optional (users can skip setting it)
- No map rendering to keep the app lightweight
- No Google APIs or external map services used
