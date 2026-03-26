# 🏗️ LocalFelo System Architecture: Wishes, Tasks & Professionals

## 📊 Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USERS & AUTHENTICATION                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ user_id (UUID)
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   LISTINGS   │         │    WISHES    │         │    TASKS     │
│  (Buy&Sell)  │         │  (Want Ads)  │         │  (Quick Jobs)│
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (UUID)    │         │ id (UUID)    │         │ id (UUID)    │
│ user_id      │         │ user_id      │         │ user_id      │
│ title        │         │ title        │         │ title        │
│ price        │         │ budget_min   │         │ price        │
│ category_id  │         │ budget_max   │         │ is_negotiable│
│ images[]     │         │              │         │              │
│ city_id      │         │ ┌──────────┐ │         │ ┌──────────┐ │
│ area_id      │         │ │ NEW! ✨  │ │         │ │ NEW! ✨  │ │
│ status       │         │ ├──────────┤ │         │ ├──────────┤ │
└──────────────┘         │ │ role_id  │ │         │ │ role_id  │ │
                         │ │subcats[] │ │         │ │subcats[] │ │
                         │ └──────────┘ │         │ └──────────┘ │
                         │ category_id* │         │ category_id* │
                         │ city_id      │         │ city_id      │
                         │ area_id      │         │ area_id      │
                         │ status       │         │ status       │
                         └──────────────┘         └──────────────┘
                                  │                         │
                                  └────────┬────────────────┘
                                           │
                                           │ role_id (UUID)
                                           │
                                           ▼
                                  ┌──────────────┐
                                  │    ROLES     │
                                  │ (Simplified) │
                                  ├──────────────┤
                                  │ id (UUID)    │
                                  │ name         │
                                  │  "Electrician│
                                  │  "Plumber"   │
                                  │  "Carpenter" │
                                  │ image_url    │
                                  │ display_order│
                                  └──────────────┘
                                           │
                                           │ Maps to ▼
                                           │
                                  ┌────────────────────┐
                                  │ ROLE_SUBCATEGORIES │
                                  │   (Mapping Layer)  │
                                  ├────────────────────┤
                                  │ role_id (UUID)     │
                                  │ category_id (TEXT) │◄─┐
                                  │ subcategory_id     │  │
                                  └────────────────────┘  │
                                           │              │
                                           │ Maps to      │
                                           ▼              │
                                  ┌──────────────────┐   │
                                  │ CATEGORIES (25+) │   │
                                  │ (Backend System) │   │
                                  ├──────────────────┤   │
                                  │ id (TEXT)        │───┘
                                  │ name             │
                                  │ subcategories[]  │
                                  │  - Wiring        │
                                  │  - Switch Repair │
                                  │  - MCB Install   │
                                  └──────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      PROFESSIONALS MODULE                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ user_id (UUID)
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  PROFESSIONALS   │
                         ├──────────────────┤
                         │ id (UUID)        │
                         │ user_id          │
                         │ name             │
                         │ title            │
                         │ role_id (UUID)   │◄──── Links to ROLES
                         │ category_id      │
                         │ subcategory_id   │
                         │ subcategory_ids[]│
                         │ city             │
                         │ area             │
                         │ whatsapp         │
                         └──────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      NOTIFICATIONS SYSTEM                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ user_id (UUID)
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  NOTIFICATIONS   │
                         ├──────────────────┤
                         │ id (UUID)        │
                         │ user_id          │
                         │ title            │
                         │ message          │
                         │ type             │
                         │                  │
                         │ ┌──────────────┐ │
                         │ │  ROUTING ✨  │ │
                         │ ├──────────────┤ │
                         │ │ related_type │ │◄─── "wish" | "task" | "listing" | "professional"
                         │ │ related_id   │ │◄─── UUID of the item
                         │ │ action_label │ │◄─── "View Wish" | "Accept Task"
                         │ └──────────────┘ │
                         │                  │
                         │ is_read          │
                         │ created_at       │
                         └──────────────────┘

* category_id = Backward compatibility field (kept for existing data)
```

---

## 🔄 User Flow: Creating a Wish

```
USER CREATES WISH: "Need an electrician for wiring work"
│
├─ 1️⃣ User Interface (Frontend)
│   │
│   ├─ CreateWishScreen.tsx
│   │   ├─ Show role picker: "What type of service?"
│   │   │   └─ Options: Electrician ⚡, Plumber 🔧, Carpenter 🪚, etc.
│   │   │
│   │   ├─ User selects: "Electrician ⚡"
│   │   │
│   │   ├─ Show service selector: "Which services do you need?"
│   │   │   ├─ [x] Wiring Installation
│   │   │   ├─ [x] Switch Repair
│   │   │   ├─ [ ] MCB Installation
│   │   │   └─ [ ] + Add Custom Service
│   │   │
│   │   └─ User fills: Title, Description, Budget, Location
│   │
├─ 2️⃣ Service Layer (Frontend)
│   │
│   ├─ services/wishes.ts
│   │   └─ createWish({
│   │       title: "Need electrician for wiring",
│   │       description: "2 rooms need wiring",
│   │       role_id: "uuid-of-electrician-role",
│   │       subcategory_ids: ["wiring-install", "switch-repair"],
│   │       category_id: 206, // "Find Help" - kept for backward compat
│   │       budget_min: 2000,
│   │       budget_max: 5000,
│   │       city_id: "bangalore",
│   │       area_id: "koramangala"
│   │     })
│   │
├─ 3️⃣ Database (Supabase)
│   │
│   ├─ INSERT INTO wishes
│   │   ├─ role_id: uuid-of-electrician-role
│   │   ├─ subcategory_ids: ["wiring-install", "switch-repair"]
│   │   ├─ category_id: 206
│   │   └─ [all other fields]
│   │
├─ 4️⃣ Professional Matching (Backend)
│   │
│   ├─ Query professionals matching:
│   │   SELECT * FROM professionals
│   │   WHERE role_id = 'uuid-of-electrician-role'
│   │     AND city = 'bangalore'
│   │     AND area = 'koramangala'
│   │     AND subcategory_ids && ARRAY['wiring-install', 'switch-repair']
│   │     AND is_active = true
│   │
│   ├─ Found: 5 matching electricians
│   │
├─ 5️⃣ Notify Professionals (Backend)
│   │
│   └─ FOR EACH matching professional:
│       INSERT INTO notifications (
│         user_id: professional.user_id,
│         title: "New Wish Matches Your Services! 🎯",
│         message: "Someone in Koramangala needs wiring work",
│         type: "professional_new_wish",
│         related_type: "wish",
│         related_id: wish.id,
│         action_url: "/wishes/[wish-id]",
│         action_label: "View Wish"
│       )
│
└─ 6️⃣ Professional Receives Notification
    │
    ├─ Push notification on phone: "New Wish Matches Your Services! 🎯"
    ├─ In-app notification badge: (5 unread)
    └─ Click → Routes to /wishes/[wish-id]
```

---

## 🔄 Professional Matching Logic

```
WISH CREATED:
  role_id: electrician-uuid
  subcategory_ids: ["wiring-install", "switch-repair"]
  city: bangalore
  area: koramangala

         ↓

QUERY PROFESSIONALS:
  ┌────────────────────────────────────────────┐
  │ SELECT * FROM professionals                │
  │ WHERE role_id = 'electrician-uuid'         │ ← Same role
  │   AND city = 'bangalore'                   │ ← Same city
  │   AND (area = 'koramangala' OR area IS NULL)│ ← Same area or citywide
  │   AND subcategory_ids && ['wiring-install',│ ← Has ANY matching service
  │                            'switch-repair'] │
  │   AND is_active = true                     │ ← Active professionals only
  └────────────────────────────────────────────┘

         ↓

RESULTS:
  Professional 1: ✅ Electrician | Bangalore | Koramangala | [wiring, switch, mcb]
  Professional 2: ✅ Electrician | Bangalore | Citywide    | [wiring, fan, light]
  Professional 3: ❌ Electrician | Mumbai    | Andheri     | [wiring, switch]  (Wrong city)
  Professional 4: ❌ Plumber     | Bangalore | Koramangala | [tap, sink]        (Wrong role)

         ↓

NOTIFY:
  ✅ Send notification to Professional 1
  ✅ Send notification to Professional 2
  ❌ No notification to Professional 3
  ❌ No notification to Professional 4
```

---

## 📱 Notification Routing System

```
NOTIFICATION CREATED:
  user_id: professional-user-id
  type: "professional_new_wish"
  related_type: "wish"           ← Module identifier
  related_id: "wish-uuid-123"    ← Item identifier
  action_url: "/wishes/wish-uuid-123"
  action_label: "View Wish"

         ↓

USER CLICKS NOTIFICATION:

  Frontend checks: notification.related_type
  
  ┌─────────────────────────────────┐
  │ switch (related_type) {         │
  │   case "wish":                  │ ← Matches!
  │     navigate(`/wishes/${id}`);  │
  │   case "task":                  │
  │     navigate(`/tasks/${id}`);   │
  │   case "listing":               │
  │     navigate(`/listing/${id}`); │
  │   case "professional":          │
  │     navigate(`/professionals/${id}`);
  │ }                               │
  └─────────────────────────────────┘

         ↓

USER LANDS ON: /wishes/wish-uuid-123
  - Shows wish details
  - Professional can chat or accept
  - Marks notification as read
```

---

## 🗂️ Category System Comparison

### Before Migration (Separate Systems)

```
LISTINGS:     category_id (101-117) → "Mobile Phones", "Furniture", etc.
WISHES:       category_id (201-210) → "Want to Buy", "Find Help", etc.
TASKS:        category_id (301-309) → "Delivery", "Repairs", etc.
PROFESSIONALS: category_id (TEXT) + subcategory_id (TEXT) → Complex system

❌ No unified system
❌ Different UX for each module
❌ Hard to match professionals with wishes/tasks
```

### After Migration (Unified System)

```
LISTINGS:     category_id (101-117) → Still uses simple categories ✅
WISHES:       role_id (UUID) + subcategory_ids[] → Matches professionals ✅
TASKS:        role_id (UUID) + subcategory_ids[] → Matches professionals ✅
PROFESSIONALS: role_id (UUID) + subcategory_ids[] → Same system ✅

✅ Unified role system for services
✅ Same UX across wishes, tasks, professionals
✅ Easy to match professionals with wishes/tasks
✅ Backward compatible with old category_id
```

---

## 📊 Data Flow Example

### Creating a Wish with Role

```sql
-- 1. Frontend sends
{
  title: "Need electrician",
  role_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",  -- Electrician role
  subcategory_ids: ["wiring", "switch-repair"],
  category_id: 206,  -- "Find Help" (backward compat)
  budget_max: 5000
}

-- 2. Database stores
INSERT INTO wishes (
  id,
  user_id,
  title,
  role_id,                                          -- NEW ✨
  subcategory_ids,                                  -- NEW ✨
  category_id,                                      -- KEPT for backward compat
  budget_max,
  created_at
) VALUES (
  'abc-123',
  'user-uuid',
  'Need electrician',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',          -- Role UUID
  ARRAY['wiring', 'switch-repair'],                -- Services array
  206,                                              -- Old category
  5000,
  NOW()
);

-- 3. Query role details
SELECT 
  w.*,
  r.name as role_name,
  r.image_url as role_image
FROM wishes w
LEFT JOIN roles r ON r.id = w.role_id
WHERE w.id = 'abc-123';

-- Returns:
-- title: "Need electrician"
-- role_id: f47ac10b-58cc-4372-a567-0e02b2c3d479
-- role_name: "Electrician"  ← From roles table
-- role_image: "https://.../electrician.png"
-- subcategory_ids: ["wiring", "switch-repair"]
-- category_id: 206  ← Still available for backward compat
```

---

## 🎯 Summary

### Key Relationships

1. **Wishes/Tasks** → `role_id` → **Roles** (Simplified view)
2. **Roles** → `role_subcategories` → **Categories** (Backend mapping)
3. **Professionals** → `role_id` + `subcategory_ids` (Same fields as Wishes/Tasks)
4. **Notifications** → `related_type` + `related_id` (Module routing)

### Benefits

✅ **Unified UX**: Same role picker across Wishes, Tasks, Professionals
✅ **Smart Matching**: Professionals auto-matched with relevant wishes/tasks
✅ **Clean UI**: Users see "Electrician", not "Home Services → Electrical → Wiring"
✅ **Backend Power**: Still uses 25+ categories for analytics and filtering
✅ **Backward Compatible**: Old data works with category_id field
✅ **Scalable**: Easy to add new roles and services without changing schema

---

This architecture creates a seamless experience where:
- Users create wishes/tasks using simple roles
- Professionals register with the same roles
- System automatically matches them
- Everyone gets notified via unified notification system
