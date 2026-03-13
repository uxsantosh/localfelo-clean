# Updated Files for Distance Display

## All files updated to show distance with prominent lemon badge

### 1. /screens/TaskDetailScreen.tsx
### 2. /screens/WishDetailScreen.tsx  
### 3. /screens/ListingDetailScreen.tsx

---

## Instructions

Find and replace the following sections in each file:

### TaskDetailScreen.tsx (Line ~468-472)

**Replace this:**
```tsx
                {task.distance !== undefined && task.distance !== null && (
                  <p className="font-extrabold mt-2" style={{ color: '#CDFF00', fontSize: '14px' }}>
                    ~{task.distance.toFixed(1)} km away
                  </p>
                )}
```

**With this:**
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

### WishDetailScreen.tsx (Line ~283-287)

**Replace this:**
```tsx
                {wish.distance !== undefined && wish.distance !== null && (
                  <p className="font-extrabold mt-2" style={{ color: '#CDFF00', fontSize: '14px' }}>
                    ~{wish.distance.toFixed(1)} km away
                  </p>
                )}
```

**With this:**
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

### ListingDetailScreen.tsx (Line ~118-122)

**Replace this:**
```tsx
                  {listing.distance !== undefined && listing.distance !== null && (
                    <span className="font-extrabold mt-2 block" style={{ color: '#CDFF00', fontSize: '14px' }}>
                      ~{listing.distance.toFixed(1)} km away
                    </span>
                  )}
```

**With this:**
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

## Summary

These changes make the distance display:
- ✅ More prominent with lemon background badge
- ✅ Consistent across all cards and detail screens
- ✅ Clearly visible with "from you" text
- ✅ Professional badge design matching the app theme
