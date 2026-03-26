# DISTANCE DISPLAY UPDATE - ALL SCREENS

## Issue
User wants distance displayed more prominently and separately on all cards and detail screens.

## Current Status
Distance IS already implemented on ALL screens - just needs to be more prominent!

---

## ✅ ALREADY WORKING - Just Make More Prominent

### Cards (Already have prominent distance badges):
1. **TaskCard.tsx** ✅ Lines 88-97 - Has lemon badge with distance
2. **WishCard.tsx** ✅ Lines 78-87 - Has lemon badge with distance  
3. **ListingCard.tsx** ✅ Lines 123-132 - Has lemon badge with distance

### Detail Screens (Need to update for prominence):
4. **TaskDetailScreen.tsx** - Line 468-472 - Has distance but not prominent
5. **WishDetailScreen.tsx** - Line 283-287 - Has distance but not prominent
6. **ListingDetailScreen.tsx** - Line 118-122 - Has distance but not prominent

---

## REQUIRED UPDATES

### Update 1: TaskDetailScreen.tsx (Line 468-472)
**FIND:**
```tsx
                {task.distance !== undefined && task.distance !== null && (
                  <p className="font-extrabold mt-2" style={{ color: '#CDFF00', fontSize: '14px' }}>
                    ~{task.distance.toFixed(1)} km away
                  </p>
                )}
```

**REPLACE WITH:**
```tsx
                {task.distance !== undefined && task.distance !== null && (
                  <div className="mt-3">
                    <span 
                      className="inline-block px-3 py-1.5 rounded-md text-[13px] font-extrabold" 
                      style={{ backgroundColor: '#CDFF00', color: '#000000' }}
                    >
                      📍 {task.distance.toFixed(1)} km away from you
                    </span>
                  </div>
                )}
```

---

### Update 2: WishDetailScreen.tsx (Line 283-287)
**FIND:**
```tsx
                {wish.distance !== undefined && wish.distance !== null && (
                  <p className="font-extrabold mt-2" style={{ color: '#CDFF00', fontSize: '14px' }}>
                    ~{wish.distance.toFixed(1)} km away
                  </p>
                )}
```

**REPLACE WITH:**
```tsx
                {wish.distance !== undefined && wish.distance !== null && (
                  <div className="mt-3">
                    <span 
                      className="inline-block px-3 py-1.5 rounded-md text-[13px] font-extrabold" 
                      style={{ backgroundColor: '#CDFF00', color: '#000000' }}
                    >
                      📍 {wish.distance.toFixed(1)} km away from you
                    </span>
                  </div>
                )}
```

---

### Update 3: ListingDetailScreen.tsx (Line 118-122)
**FIND:**
```tsx
                  {listing.distance !== undefined && listing.distance !== null && (
                    <span className="font-extrabold mt-2 block" style={{ color: '#CDFF00', fontSize: '14px' }}>
                      ~{listing.distance.toFixed(1)} km away
                    </span>
                  )}
```

**REPLACE WITH:**
```tsx
                  {listing.distance !== undefined && listing.distance !== null && (
                    <div className="mt-3">
                      <span 
                        className="inline-block px-3 py-1.5 rounded-md text-[13px] font-extrabold" 
                        style={{ backgroundColor: '#CDFF00', color: '#000000' }}
                      >
                        📍 {listing.distance.toFixed(1)} km away from you
                      </span>
                    </div>
                  )}
```

---

## SUMMARY OF CHANGES

### Before (Current):
- Detail screens show distance as plain text with lemon color
- Format: `~2.3 km away` in lemon text
- Not very visible or prominent

### After (New):
- Detail screens show distance in same badge format as cards
- Lemon background badge (#CDFF00) with black text
- Format: `📍 2.3 km away from you` in badge
- Consistent with card design
- More prominent and visible

---

## FILES TO UPDATE

1. `/screens/TaskDetailScreen.tsx` - Line 468-472
2. `/screens/WishDetailScreen.tsx` - Line 283-287  
3. `/screens/ListingDetailScreen.tsx` - Line 118-122

**Note:** Card components (TaskCard, WishCard, ListingCard) are already perfect - no changes needed!

---

## TESTING AFTER UPDATES

1. Set your location (e.g., Bangalore → BTM 2nd Stage)
2. Browse tasks - check TaskCard shows distance badge ✅
3. Click task - check TaskDetailScreen shows same badge ✅
4. Browse wishes - check WishCard shows distance badge ✅
5. Click wish - check WishDetailScreen shows same badge ✅
6. Browse marketplace - check ListingCard shows distance badge ✅
7. Click listing - check ListingDetailScreen shows same badge ✅

All distances should now be consistent with lemon badge format!
