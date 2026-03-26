# 🔧 TROUBLESHOOTING GUIDE - Hybrid Location System

## 🆘 **COMMON ISSUES & SOLUTIONS**

---

## 1️⃣ **"Location is not being detected"**

### **Symptoms:**
- User clicks "Use Current Location"
- Nothing happens or error shows
- Loading spinner forever

### **Possible Causes & Solutions:**

#### **A. Permission Denied**
```
Error: "User denied the request for Geolocation"
```

**Solution:**
1. Check browser permissions: Settings → Site Settings → Location
2. Ensure site has location permission
3. System will automatically fallback to search - users can type location
4. This is expected behavior - not a bug!

#### **B. HTTPS Required**
```
Error: "Geolocation API only available in secure contexts"
```

**Solution:**
1. GPS requires HTTPS (secure connection)
2. Use `https://` not `http://`
3. Or test on `localhost` (allowed for development)

#### **C. Slow GPS**
```
GPS taking too long (>15 seconds)
```

**Solution:**
1. Timeout is set to 15 seconds
2. If timeout, search fallback appears
3. User can search manually
4. Normal on some devices/locations

#### **D. Browser Doesn't Support GPS**
```
Error: "navigator.geolocation is not available"
```

**Solution:**
1. Old browsers might not support it
2. Search fallback works automatically
3. Update browser or use search

---

## 2️⃣ **"Search is not returning results"**

### **Symptoms:**
- User types in search box
- No results appear
- Or "No locations found" message

### **Possible Causes & Solutions:**

#### **A. No Internet Connection**
```
Error: "Failed to fetch" or network error
```

**Solution:**
1. Nominatim requires internet
2. Check internet connection
3. Retry when online

#### **B. Nominatim API Rate Limit**
```
Error: 429 or rate limit message
```

**Solution:**
1. System already has 1 req/sec limit
2. Wait 1 second and retry
3. Rare - only if multiple searches rapidly

#### **C. Query Too Short**
```
User types only 1-2 characters
```

**Solution:**
1. Search requires minimum 3 characters
2. Tell user to type more: "Search for area, street, city..."
3. This is by design to avoid too many API calls

#### **D. Typos or Invalid Location**
```
User types "Kormangala" (typo) instead of "Koramangala"
```

**Solution:**
1. Nominatim is forgiving but not perfect
2. Try different spellings
3. Try adding city name: "Koramangala Bangalore"
4. Try nearby landmarks

---

## 3️⃣ **"Map is not loading"**

### **Symptoms:**
- Gray box instead of map
- Map tiles not appearing
- Console errors about Leaflet

### **Possible Causes & Solutions:**

#### **A. Internet Connection**
```
Map tiles fail to load
```

**Solution:**
1. Leaflet loads tiles from OpenStreetMap CDN
2. Check internet connection
3. Check firewall/proxy isn't blocking

#### **B. Leaflet Script Not Loaded**
```
Error: "L is not defined"
```

**Solution:**
1. Leaflet loads dynamically from CDN
2. Check console for script loading errors
3. Verify CDN is accessible
4. Code retries automatically

#### **C. CSS Not Loaded**
```
Map appears but looks broken
```

**Solution:**
1. Leaflet CSS loads dynamically
2. Check console for CSS loading errors
3. Refresh page - should fix it

---

## 4️⃣ **"Distance shows as undefined or NaN"**

### **Symptoms:**
- Cards show "undefined km" or "NaN km"
- Distance not displaying

### **Possible Causes & Solutions:**

#### **A. User Location Not Set**
```
globalLocation is null or missing coordinates
```

**Solution:**
1. This is normal for new users
2. Ask user to set location first
3. Show message: "Set your location to see distances"
4. Or hide distance until location is set

#### **B. Item Missing Coordinates**
```
Item has no latitude/longitude in database
```

**Solution:**
1. Check if item.latitude and item.longitude exist
2. Old items might not have coordinates
3. Show "Distance unavailable" instead of undefined
4. Update old items to have coordinates

#### **C. Invalid Coordinates**
```
Latitude/longitude are invalid (e.g., "null", "0", "undefined")
```

**Solution:**
1. Validate coordinates before calculation
2. Check if latitude is between -90 and 90
3. Check if longitude is between -180 and 180
4. Skip calculation if invalid

**Code Fix:**
```typescript
// In your card components
const distance = (
  userLat && 
  userLng && 
  item.latitude && 
  item.longitude &&
  !isNaN(userLat) &&
  !isNaN(userLng) &&
  !isNaN(item.latitude) &&
  !isNaN(item.longitude)
) ? calculateDistance(userLat, userLng, item.latitude, item.longitude) : null;

// Display
{distance !== null ? `${formatDistance(distance)} away` : 'Distance unavailable'}
```

---

## 5️⃣ **"Draggable pin is not working"**

### **Symptoms:**
- Pin appears but doesn't drag
- Pin drags but position doesn't update

### **Possible Causes & Solutions:**

#### **A. Map Not Fully Loaded**
```
Trying to drag before map initializes
```

**Solution:**
1. Wait for map to fully load
2. Look for "Loading map..." message to disappear
3. Usually takes 1-2 seconds

#### **B. Conflicting Touch Events**
```
On mobile, drag might not work
```

**Solution:**
1. Ensure no other elements capturing touch
2. Leaflet handles mobile touch automatically
3. Try on different device

---

## 6️⃣ **"Location saves but doesn't persist"**

### **Symptoms:**
- User sets location
- Refreshes page
- Location is gone

### **Possible Causes & Solutions:**

#### **A. Guest User - localStorage Cleared**
```
Browser cleared cache/cookies
```

**Solution:**
1. This is expected - localStorage can be cleared
2. Ask user to set location again
3. Or ask user to create account (saves to DB)

#### **B. Logged-In User - Database Save Failed**
```
Supabase update failed
```

**Solution:**
1. Check browser console for errors
2. Check Supabase connection
3. Check user has permission to update profile
4. Verify latitude/longitude columns exist in profiles table

#### **C. Login/Logout Transition**
```
User was guest, then logged in
```

**Solution:**
1. Code should migrate localStorage to DB on login
2. Check useLocation hook is handling this
3. Verify updateLocation is called after login

---

## 7️⃣ **"Nominatim API is not responding"**

### **Symptoms:**
- Requests timeout
- "Failed to fetch" errors
- No results from search or reverse geocode

### **Possible Causes & Solutions:**

#### **A. Nominatim Server Down**
```
Rare but possible
```

**Solution:**
1. Check status: https://status.openstreetmap.org/
2. Wait and retry
3. Use cached location if available
4. Allow manual entry as fallback

#### **B. Rate Limit Exceeded**
```
Too many requests
```

**Solution:**
1. Code already implements 1 req/sec limit
2. Wait 1 second between requests
3. Increase debounce time in LocationSearch if needed

#### **C. Blocked by Firewall**
```
Corporate network blocking OSM
```

**Solution:**
1. Check if openstreetmap.org is accessible
2. Try from different network
3. Check browser network tab for blocked requests

---

## 8️⃣ **"Performance Issues"**

### **Symptoms:**
- Slow location detection
- Lag when browsing items
- High CPU usage

### **Possible Causes & Solutions:**

#### **A. Too Many Distance Calculations**
```
Calculating distance for 1000+ items
```

**Solution:**
1. Optimize: Only calculate for visible items
2. Use pagination (show 20-50 items at a time)
3. Debounce scroll events
4. Consider server-side distance calculation for large datasets

**Optimization Code:**
```typescript
// Instead of calculating for all items:
const itemsWithDistance = allItems.map(item => ({
  ...item,
  distance: calculateDistance(userLat, userLng, item.latitude, item.longitude)
}));

// Only calculate for visible items:
const visibleItems = allItems.slice(0, 50);
const itemsWithDistance = visibleItems.map(item => ({
  ...item,
  distance: calculateDistance(userLat, userLng, item.latitude, item.longitude)
}));
```

#### **B. Map Rendering Too Many Markers**
```
1000+ markers on map
```

**Solution:**
1. Use marker clustering
2. Only show nearby items on map
3. Lazy load markers as user pans/zooms

#### **C. Reverse Geocoding Taking Too Long**
```
Waiting 5+ seconds for address
```

**Solution:**
1. Normal first time (API call)
2. Cache results locally
3. Show coordinates while waiting for address
4. Nominatim can be slow sometimes - not your fault!

---

## 9️⃣ **"Location is inaccurate"**

### **Symptoms:**
- GPS puts user in wrong location
- Distance calculations seem off

### **Possible Causes & Solutions:**

#### **A. IP-Based Geolocation (Desktop)**
```
Desktop browsers use IP location (less accurate)
```

**Solution:**
1. This is normal on desktop
2. Accuracy: ±1-5km (vs ±10m on mobile)
3. User can search for precise location
4. Or drag pin to adjust

#### **B. GPS Signal Weak (Mobile)**
```
Indoor, basement, tall buildings
```

**Solution:**
1. GPS works best outdoors
2. Ask user to try outside
3. Or use search instead
4. Or allow manual adjustment with drag

#### **C. Cached Old Location**
```
Browser using old GPS data
```

**Solution:**
1. Code uses `maximumAge: 0` to get fresh location
2. User can manually adjust with pin
3. Refresh page to get new location

---

## 🔟 **"Mobile-Specific Issues"**

### **Symptoms:**
- Works on desktop but not mobile
- Touch events not working
- Layout issues

### **Possible Causes & Solutions:**

#### **A. iOS Safari Restrictions**
```
iOS Safari has stricter GPS permissions
```

**Solution:**
1. Ensure HTTPS (required on iOS)
2. User must tap button (can't auto-detect on page load)
3. System settings → Safari → Location Services → On

#### **B. Android Chrome Issues**
```
Android prompts but GPS doesn't work
```

**Solution:**
1. Check Android system settings → Location → On
2. Check Chrome has location permission
3. Try clearing Chrome cache

#### **C. Mobile Layout**
```
Modal doesn't fit screen
```

**Solution:**
1. LocationSelector is designed for mobile
2. Should auto-fit with `max-h-[95vh]`
3. Check no conflicting CSS
4. Test on actual device (not just DevTools)

---

## 🎯 **DEBUGGING CHECKLIST**

When something goes wrong, check in this order:

### **1. Browser Console**
```
1. Open DevTools (F12)
2. Check Console tab
3. Look for red errors
4. Note error messages
```

### **2. Network Tab**
```
1. Open DevTools → Network tab
2. Filter by "nominatim"
3. Check if requests are going through
4. Check response status (200 = good, 429 = rate limit, 500 = server error)
```

### **3. Permissions**
```
1. Browser settings → Site settings → Location
2. Ensure "Allow" for your site
3. Try incognito mode (fresh permissions)
```

### **4. Internet Connection**
```
1. Check if other sites load
2. Check if API requests in Network tab succeed
3. Try from different network
```

### **5. Database**
```
1. Open Supabase dashboard
2. Check profiles table
3. Verify latitude/longitude columns exist
4. Check user's row has coordinates
```

### **6. Code**
```
1. Check useLocation hook is called
2. Verify globalLocation is not null
3. Check calculateDistance is imported
4. Verify coordinates are numbers, not strings
```

---

## 📊 **DIAGNOSTIC QUERIES**

Run these in browser console for debugging:

### **Check User Location:**
```javascript
// In browser console
const location = JSON.parse(localStorage.getItem('localfelo_guest_location'));
console.log('User location:', location);
```

### **Test Distance Calculation:**
```javascript
// Import in console (if available)
const distance = calculateDistance(12.9352, 77.6245, 12.9716, 77.5946);
console.log('Distance:', distance, 'km');
// Should output: ~2.5 km
```

### **Check Nominatim API:**
```javascript
// Test reverse geocode
fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=12.9352&lon=77.6245')
  .then(r => r.json())
  .then(d => console.log('Address:', d.display_name));
```

### **Test GPS:**
```javascript
// Test browser geolocation
navigator.geolocation.getCurrentPosition(
  pos => console.log('GPS:', pos.coords),
  err => console.error('GPS Error:', err)
);
```

---

## 🆘 **STILL HAVING ISSUES?**

### **Check Documentation:**
1. `/QUICK_START.md` - Basic usage
2. `/INTEGRATION_COMPLETE.md` - Detailed guide
3. `/VISUAL_FLOW_DIAGRAMS.md` - Visual explanations

### **Common Solutions:**
- 90% of issues = Permissions or HTTPS
- 5% of issues = Internet connection
- 5% of issues = Actual bugs

### **When to Worry:**
- ❌ If HTTPS and permissions are correct
- ❌ If internet works for other sites
- ❌ If error persists across devices/browsers
- ✅ Then it might be a code issue

### **Not an Issue:**
- ✅ User denies permission (fallback works)
- ✅ Search returns no results for typos (user error)
- ✅ GPS slow indoors (hardware limitation)
- ✅ Desktop less accurate than mobile (IP vs GPS)

---

## 📞 **GETTING HELP:**

If you're truly stuck:

1. **Gather Information:**
   - What were you trying to do?
   - What happened instead?
   - What error messages (exact text)?
   - Browser console logs?
   - Network tab screenshots?

2. **Try These First:**
   - Refresh page
   - Clear cache
   - Try incognito mode
   - Try different browser
   - Try different device

3. **Still Stuck?**
   - Check all sections above
   - Review documentation
   - Post in community with details

---

**Remember: 99% of location issues are permissions, HTTPS, or internet connectivity - not code bugs! 🎯**
