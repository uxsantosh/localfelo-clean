# Professional Onboarding Visual Flow

## 📱 Complete User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                    STEP 1: SELECT ROLE                      │
│                                                             │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                       │
│  │  ⚡ │  │ 🔧  │  │ 🚗  │  │ 📦  │                       │
│  │Elec │  │Plum │  │Driv │  │Deli │  ... (24 roles)       │
│  │tric │  │ber  │  │er   │  │very │                       │
│  └─────┘  └─────┘  └─────┘  └─────┘                       │
│                                                             │
│  [Search for your profession...]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    User clicks "Electrician"
                           ↓
┌─────────────────────────────────────────────────────────────┐
│            STEP 2: SELECT SERVICES (MANDATORY) ⭐           │
│                                                             │
│  Select services you offer                                 │
│  0 selected • Select at least 1                            │
│                                                             │
│  [🔍 Search services...]                                   │
│  [Show all services →]                                     │
│                                                             │
│  🔧 Repair                                                 │
│  ┌─────────────────────────────────────────────┐           │
│  │ ☐  AC repair                  Recommended   │           │
│  │ ☐  Fan repair                 Recommended   │           │
│  │ ☐  Wiring repair               Recommended   │           │
│  │ ☐  Switch repair               Recommended   │           │
│  │ ☐  Inverter repair             Recommended   │           │
│  └─────────────────────────────────────────────┘           │
│                                                             │
│  🔨 Installation                                           │
│  ┌─────────────────────────────────────────────┐           │
│  │ ☐  AC installation            Recommended   │           │
│  │ ☐  Fan installation           Recommended   │           │
│  │ ☐  Light installation         Recommended   │           │
│  └─────────────────────────────────────────────┘           │
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │  Continue (0 selected)       [DISABLED]     │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                           ↓
                 User selects: AC repair, Fan repair, Wiring repair
                           ↓
┌─────────────────────────────────────────────────────────────┐
│            STEP 2: SELECT SERVICES (UPDATED)                │
│                                                             │
│  Select services you offer                                 │
│  3 selected                                                │
│                                                             │
│  ┌───────────────────────────────────────────┐             │
│  │ 3 services selected                       │ ← Indicator │
│  └───────────────────────────────────────────┘             │
│                                                             │
│  🔧 Repair                                                 │
│  ┌─────────────────────────────────────────────┐           │
│  │ ☑  AC repair                  Recommended   │ ← Selected│
│  │ ☑  Fan repair                 Recommended   │ ← Selected│
│  │ ☑  Wiring repair               Recommended   │ ← Selected│
│  │ ☐  Switch repair               Recommended   │           │
│  │ ☐  Inverter repair             Recommended   │           │
│  └─────────────────────────────────────────────┘           │
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │  Continue (3 selected)        [ENABLED]     │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    User clicks "Continue"
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              STEP 3: PROFILE DETAILS                        │
│                                                             │
│  Register as Electrician                                   │
│  Step 3: Your Details                                      │
│                                                             │
│  Your Name / Business Name *                               │
│  [________________________]                                │
│                                                             │
│  Professional Title *                                       │
│  [Certified Electrician___]                                │
│                                                             │
│  WhatsApp Number *                                          │
│  [9876543210_______________]                               │
│                                                             │
│  About You (Optional)                                       │
│  [________________________]                                │
│  [________________________]                                │
│                                                             │
│  Location *                                                 │
│  [Bangalore, Karnataka    📍]                              │
│                                                             │
│  Profile Photo (Optional)                                   │
│  [Upload Photo]                                            │
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │  Next: Add Service Prices & Photos          │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    User fills details and clicks "Next"
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         STEP 4: SERVICE PRICES & PHOTOS                     │
│                                                             │
│  Register as Electrician                                   │
│  Step 4: Service Prices & Photos                           │
│                                                             │
│  Service Prices (Optional)                                 │
│  Add pricing for your services                             │
│                                                             │
│  [AC Installation______] [₹500__] [×]                      │
│  [Fan Repair___________] [₹200__] [×]                      │
│  [+ Add Service Price]                                     │
│                                                             │
│  Work Photos (Optional)                                     │
│  ┌────┐ ┌────┐ ┌────┐                                      │
│  │📷 │ │📷 │ │ +  │                                      │
│  └────┘ └────┘ └────┘                                      │
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │  ✓ Create Professional Profile              │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    Profile Created! ✅
```

---

## 🎯 Key Flow Features

### Step 1: Role Selection
- **24 professional roles** displayed as cards
- **Search functionality** to quickly find roles
- **Visual icons** for each role type
- **One-click selection**

### Step 2: Service Selection ⭐ (NEW)
**Recommended Services First:**
- Shows 3-8 recommended services based on role
- Clearly marked as "Recommended"
- Fast selection without scrolling

**Show All Services:**
- Toggle to see all ~290 services
- Organized by category (Repair, Installation, etc.)
- Search across all services

**Multi-Select:**
- Checkbox interface
- Visual feedback (bright green when selected)
- Selected count indicator

**Validation:**
- Must select at least 1 service
- Continue button disabled until selection
- Error message if trying to proceed without selection

### Step 3: Profile Details
- Standard professional information
- Auto-fills title with role name
- Location selector integration
- Optional profile photo

### Step 4: Service Prices & Photos
- Optional pricing for services
- Optional work gallery (up to 5 photos)
- Final submission

---

## 📊 Data Saved to Database

```javascript
{
  role_id: "uuid-electrician",
  category_id: "repair",                    // First selected category
  subcategory_id: "ac-repair",              // First selected subcategory
  subcategory_ids: [                         // ALL selected subcategories (for matching)
    "ac-repair",
    "fan-repair", 
    "wiring-repair"
  ],
  name: "John Electrical Services",
  title: "Certified Electrician",
  whatsapp: "9876543210",
  city: "Bangalore",
  area: "Koramangala",
  // ... other fields
}
```

---

## 🔄 Matching Logic

When a task is posted:
```
Task: "Need AC repair" → subcategory_id = "ac-repair"
    ↓
Query professionals WHERE "ac-repair" IN subcategory_ids
    ↓
Returns: All professionals who selected AC repair as one of their services
```

---

## ✨ UX Benefits

1. **Faster Onboarding**: Users see only relevant services first
2. **Better Matching**: Users explicitly select what they offer
3. **Accurate Profiles**: No confusion about capabilities
4. **Flexible**: Can still select from all 290+ services if needed
5. **Clear Progress**: 4 distinct steps with clear purpose

---

## 🎨 Visual Highlights

- ✅ Selected services have bright green (#CDFF00) background
- ✅ Unselected services have white background
- ✅ Checkmark icon appears when selected
- ✅ "Recommended" badge on suggested services
- ✅ Fixed bottom button shows selection count
- ✅ Sticky header with back navigation

---

**Last Updated**: March 22, 2026
