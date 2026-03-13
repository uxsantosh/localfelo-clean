# 🗺️ LocalFelo Hybrid Location System - Visual Flow Diagrams

## 📍 **SYSTEM ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────────┐
│                     LocalFelo Location System                    │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────────┐
        │      LocationSelector Component         │
        │  (User-facing modal with 3 options)    │
        └────────────────────────────────────────┘
                 │              │              │
    ┌────────────┴──────┐      │      ┌───────┴────────┐
    ▼                   ▼      ▼      ▼                ▼
┌──────────┐     ┌──────────┐  ┌──────────┐  ┌──────────────┐
│ Auto-    │     │ Location │  │   Map    │  │   Database   │
│ Detect   │────▶│ Search   │─▶│ Adjust   │─▶│   Storage    │
│ (GPS)    │     │ (API)    │  │ (Drag)   │  │ (Supabase)   │
└──────────┘     └──────────┘  └──────────┘  └──────────────┘
     │                 │              │              │
     ▼                 ▼              ▼              ▼
  Browser         Nominatim       Leaflet      latitude,
  Geolocation     OSM API         Map          longitude,
  API                                          city, area
```

---

## 🚀 **USER FLOW - AUTO-DETECT**

```
┌─────────────────────────────────────────────────────────────────┐
│                   USER CLICKS "USE CURRENT LOCATION"             │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│            Browser Requests GPS Permission                       │
│  "Allow LocalFelo to access your location?"                     │
└─────────────────────────────────────────────────────────────────┘
                    │                          │
            ✅ ALLOW                    ❌ DENY
                    │                          │
                    ▼                          ▼
     ┌──────────────────────────┐   ┌──────────────────────────┐
     │  Get GPS Coordinates     │   │  Show Search Box         │
     │  (12.9352°N, 77.6245°E)  │   │  "Search for location"   │
     └──────────────────────────┘   └──────────────────────────┘
                    │
                    ▼
     ┌──────────────────────────────────────┐
     │  Reverse Geocode via Nominatim       │
     │  Coordinates → Address               │
     │  Result: "Koramangala, Bangalore"    │
     └──────────────────────────────────────┘
                    │
                    ▼
     ┌──────────────────────────────────────┐
     │  Show on Interactive Map              │
     │  ┌────────────────────────────┐      │
     │  │    📍 Draggable Pin        │      │
     │  │   "Drag to adjust"         │      │
     │  │                            │      │
     │  │   [Koramangala]            │      │
     │  │   Bangalore, Karnataka     │      │
     │  └────────────────────────────┘      │
     └──────────────────────────────────────┘
                    │
                    ▼
     ┌──────────────────────────────────────┐
     │  User Confirms or Adjusts             │
     │  [Change]   [✅ Confirm Location]     │
     └──────────────────────────────────────┘
                    │
                    ▼
     ┌──────────────────────────────────────┐
     │  Save to Database/localStorage        │
     │  - latitude: 12.9352                  │
     │  - longitude: 77.6245                 │
     │  - city: "Bangalore"                  │
     │  - area: "Koramangala"                │
     └──────────────────────────────────────┘
                    │
                    ▼
     ┌──────────────────────────────────────┐
     │  ✅ SUCCESS!                          │
     │  "Location set! 📍"                   │
     │  User can now browse with distances   │
     └──────────────────────────────────────┘
```

---

## 🔍 **USER FLOW - SEARCH**

```
┌─────────────────────────────────────────────────────────────────┐
│              USER TYPES IN SEARCH BOX                            │
│              "Kormangala Bangalore"                              │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    (Debounce 600ms)
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│           Call Nominatim Search API                              │
│  https://nominatim.openstreetmap.org/search                     │
│  ?q=Kormangala%20Bangalore&countrycodes=in                      │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              Show Results (Top 8)                                │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ 📍 Koramangala                                       │        │
│  │    5th Block, Koramangala, Bangalore, Karnataka     │        │
│  ├─────────────────────────────────────────────────────┤        │
│  │ 📍 Koramangala 1st Block                            │        │
│  │    Koramangala, Bangalore, Karnataka                │        │
│  ├─────────────────────────────────────────────────────┤        │
│  │ 📍 Koramangala 6th Block                            │        │
│  │    Koramangala, Bangalore, Karnataka                │        │
│  └─────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    USER SELECTS ONE
                                 │
                                 ▼
     ┌──────────────────────────────────────┐
     │  Get Coordinates for Selection        │
     │  lat: 12.9352, lng: 77.6245          │
     └──────────────────────────────────────┘
                    │
                    ▼
     ┌──────────────────────────────────────┐
     │  Show on Map (same as auto-detect)    │
     │  User can drag to adjust              │
     └──────────────────────────────────────┘
                    │
                    ▼
              (Continue as above)
```

---

## 📊 **DISTANCE CALCULATION FLOW**

```
┌─────────────────────────────────────────────────────────────────┐
│              USER BROWSES TASKS/WISHES/LISTINGS                  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│         Get User's Current Location from State                   │
│         userLat: 12.9352, userLng: 77.6245                      │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│         For Each Item (Task/Wish/Listing):                       │
│                                                                   │
│  1. Get item coordinates (itemLat, itemLng)                      │
│  2. Calculate distance using Haversine formula                   │
│     distance = calculateDistance(                                │
│       userLat, userLng, itemLat, itemLng                        │
│     )                                                            │
│  3. Format for display: formatDistance(distance)                 │
│     Examples: "850m", "2.5km", "15km"                           │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│         Display on Card                                          │
│  ┌─────────────────────────────────────────┐                    │
│  │  🛠️ Fix my laptop                       │                    │
│  │  ₹500 • 2.5km away • Koramangala      │                    │
│  │  Posted 2 hours ago                    │                    │
│  └─────────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│         Sort by Distance (Nearest First)                         │
│  1. Item A - 0.5km                                              │
│  2. Item B - 1.2km                                              │
│  3. Item C - 2.5km                                              │
│  4. Item D - 5.0km                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 **DATA FLOW DIAGRAM**

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────┐          │
│  │  LocationSelector Component                       │          │
│  │  ┌──────────────┐  ┌──────────────┐             │          │
│  │  │ Auto-Detect  │  │    Search    │             │          │
│  │  │    Button    │  │   Textbox    │             │          │
│  │  └──────┬───────┘  └──────┬───────┘             │          │
│  │         │                  │                      │          │
│  │         └────────┬─────────┘                      │          │
│  │                  │                                │          │
│  │                  ▼                                │          │
│  │         ┌────────────────┐                        │          │
│  │         │   MapView      │                        │          │
│  │         │  (Leaflet)     │                        │          │
│  │         │  Draggable Pin │                        │          │
│  │         └────────┬───────┘                        │          │
│  │                  │                                │          │
│  │                  ▼                                │          │
│  │         ┌────────────────┐                        │          │
│  │         │  useLocation   │                        │          │
│  │         │     Hook       │                        │          │
│  │         └────────┬───────┘                        │          │
│  └──────────────────┼────────────────────────────────┘          │
│                     │                                            │
└─────────────────────┼────────────────────────────────────────────┘
                      │
                      │ Save Location
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Guest User:                    Logged-In User:                  │
│  ┌─────────────────┐           ┌──────────────────┐            │
│  │  localStorage   │           │  Supabase DB     │            │
│  │  - latitude     │           │  profiles table: │            │
│  │  - longitude    │           │  - latitude      │            │
│  │  - city         │           │  - longitude     │            │
│  │  - area         │           │  - city          │            │
│  └─────────────────┘           │  - area          │            │
│                                 │  - city_id       │            │
│                                 │  - area_id       │            │
│                                 └──────────────────┘            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                      │
                      │ Read Location
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USAGE IN APP                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Header     │  │  TasksScreen │  │MarketplaceScr│         │
│  │   Shows:     │  │  Calculates: │  │  Calculates: │         │
│  │"Koramangala" │  │  Distances   │  │  Distances   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  WishesScr   │  │  Task/Wish   │  │   Create     │         │
│  │  Calculates: │  │   Cards      │  │   Screens    │         │
│  │  Distances   │  │  Show: "2km" │  │Use Location  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🌐 **EXTERNAL API FLOW**

```
┌─────────────────────────────────────────────────────────────────┐
│                  LocalFelo Frontend                              │
└─────────────────────────────────────────────────────────────────┘
                      │
                      │ API Calls
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              Browser Geolocation API                             │
│  navigator.geolocation.getCurrentPosition()                      │
│  ✅ Free, Native, No limits                                      │
└─────────────────────────────────────────────────────────────────┘
                      │
                      │ Returns: lat, lng
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│         Nominatim OpenStreetMap API                              │
│  https://nominatim.openstreetmap.org                            │
│                                                                   │
│  Endpoints Used:                                                 │
│  1. /reverse - GPS → Address                                    │
│  2. /search - Search Query → Coordinates                        │
│                                                                   │
│  Rate Limit: 1 request/second                                   │
│  ✅ Free, No API key, Worldwide coverage                         │
└─────────────────────────────────────────────────────────────────┘
                      │
                      │ Returns: address, lat, lng
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              Leaflet / OpenStreetMap Tiles                       │
│  https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png           │
│  ✅ Free, Cached by browser                                      │
└─────────────────────────────────────────────────────────────────┘
                      │
                      │ Returns: Map tiles
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              Display to User                                     │
│  Beautiful interactive map with precise location                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 **PRIVACY & DATA FLOW**

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER'S EXACT LOCATION                         │
│              (12.935242°N, 77.624571°E)                         │
└─────────────────────────────────────────────────────────────────┘
                      │
                      │ What's Stored?
                      ▼
        ┌─────────────────────────────────┐
        │    Database / localStorage      │
        │  ✅ latitude: 12.9352          │
        │  ✅ longitude: 77.6246         │
        │  ✅ city: "Bangalore"          │
        │  ✅ area: "Koramangala"        │
        └─────────────────────────────────┘
                      │
                      │ What's Shared Publicly?
                      ▼
        ┌─────────────────────────────────┐
        │    Visible to Other Users       │
        │  ✅ City & Area Only            │
        │     "Koramangala, Bangalore"   │
        │  ✅ Distance (calculated)       │
        │     "2.5km away"               │
        │  ❌ Exact coordinates - HIDDEN │
        │  ❌ Street address - HIDDEN    │
        └─────────────────────────────────┘
                      │
                      │ Used For?
                      ▼
        ┌─────────────────────────────────┐
        │    Internal Calculations        │
        │  ✅ Distance sorting            │
        │  ✅ Nearby item filtering       │
        │  ✅ Map display (user only)     │
        │  ❌ NO tracking                 │
        │  ❌ NO real-time updates        │
        └─────────────────────────────────┘
```

---

## ⚡ **PERFORMANCE FLOW**

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER ACTION                                   │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              "Use Current Location"                              │
│              Time: 0ms                                           │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼ ~1000ms
┌─────────────────────────────────────────────────────────────────┐
│              GPS Permission + Coordinates                        │
│              Time: 1000ms (1 second)                            │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼ ~1000ms (rate limited)
┌─────────────────────────────────────────────────────────────────┐
│              Reverse Geocode API Call                            │
│              Time: 2000ms (2 seconds total)                     │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼ ~500ms
┌─────────────────────────────────────────────────────────────────┐
│              Load Map Tiles                                      │
│              Time: 2500ms (2.5 seconds total)                   │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼ Instant
┌─────────────────────────────────────────────────────────────────┐
│              Display Result                                      │
│              Total Time: ~3 seconds ⚡                           │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼ Instant (<1ms per item)
┌─────────────────────────────────────────────────────────────────┐
│              Calculate Distances for All Items                   │
│              100 items = ~50ms                                  │
│              1000 items = ~500ms                                │
└─────────────────────────────────────────────────────────────────┘
```

---

**This visual guide shows how the hybrid location system works from every angle! 🎯**
