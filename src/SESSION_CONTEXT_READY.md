# 🎯 LocalFelo - Session Context Ready

**Date:** March 15, 2026  
**Status:** ✅ Fully briefed and ready to continue

---

## 📱 PROJECT OVERVIEW

**LocalFelo** is India's first wish-based hyperlocal marketplace platform with 3 core features:

### **The Three Pillars:**
1. **Buy & Sell (Marketplace)** - Traditional classified ads like OLX
2. **Wishes** - Reverse marketplace where users post what they need
3. **Tasks** - Gig economy platform for local jobs and services

### **Business Model:**
- ✅ 100% FREE - No commissions, no payments
- ✅ Mediator-only - NO financial involvement whatsoever
- ✅ Chat-only - Direct P2P communication
- ✅ Hyperlocal - City → Area → Sub-Area (3-level location system)

---

## 🎨 CRITICAL DESIGN RULES

### **Accessibility Requirements (NON-NEGOTIABLE):**
```css
✅ ALLOWED:
- bg-black text-[#CDFF00]           ← High contrast (WCAG AAA)
- bg-white text-black                ← Readable
- bg-[#CDFF00] text-black            ← Readable
- border-[#CDFF00]                   ← Accent only

❌ FORBIDDEN:
- bg-white text-[#CDFF00]            ← Low contrast! Unreadable!
- bg-[#CDFF00] text-[#CDFF00]        ← Same color! Invisible!
- text-[#CDFF00] on any light bg     ← WCAG violation!
```

### **Design System:**
- **Color:** Bright Green #CDFF00, Black #000000, White #FFFFFF
- **Style:** Flat design (NO shadows, NO gradients on cards/backgrounds)
- **Corners:** `rounded-md` only (NOT rounded-xl or rounded-2xl)
- **Background:** White (#FFFFFF) - NOT grey
- **Text:** Black or white ONLY - bright green only for backgrounds/borders

---

## 🗂️ DATABASE SCHEMA (Supabase PostgreSQL)

### **Core Tables:**

#### **1. profiles** (Users)
```sql
- id UUID PRIMARY KEY
- email TEXT
- phone TEXT  
- display_name TEXT
- client_token TEXT UNIQUE         -- Auth token
- owner_token TEXT UNIQUE          -- Content ownership
- city TEXT, area TEXT, subarea TEXT
- latitude NUMERIC, longitude NUMERIC, address TEXT
- avatar_url TEXT                  -- Profile photo
- gender TEXT                      -- male/female/other
- is_admin BOOLEAN
- created_at TIMESTAMP
```

#### **2. listings** (Marketplace)
```sql
- id UUID PRIMARY KEY
- user_id UUID REFERENCES profiles
- title TEXT, description TEXT, price NUMERIC
- category TEXT, condition TEXT
- images TEXT[]                    -- Array of image URLs
- city TEXT, area TEXT, subarea TEXT
- latitude NUMERIC, longitude NUMERIC, address TEXT
- is_active BOOLEAN DEFAULT true
- created_at TIMESTAMP
```

#### **3. wishes** (Reverse Marketplace)
```sql
- id UUID PRIMARY KEY
- user_id UUID REFERENCES profiles
- title TEXT, description TEXT
- budget_min NUMERIC, budget_max NUMERIC
- category TEXT
- urgency TEXT                     -- low/medium/high/urgent
- city TEXT, area TEXT
- latitude NUMERIC, longitude NUMERIC, address TEXT
- status TEXT                      -- open/accepted/completed
- is_active BOOLEAN DEFAULT true
- created_at TIMESTAMP
```

#### **4. tasks** (Gig Economy)
```sql
- id UUID PRIMARY KEY
- user_id UUID REFERENCES profiles
- title TEXT, description TEXT, budget NUMERIC
- category TEXT, timeline TEXT
- city TEXT, area TEXT
- latitude NUMERIC, longitude NUMERIC, address TEXT
- status TEXT                      -- open/in_progress/completed/cancelled
- is_active BOOLEAN DEFAULT true
- created_at TIMESTAMP
```

#### **5. conversations & messages** (Chat System)
```sql
conversations:
- id UUID PRIMARY KEY
- listing_id/wish_id/task_id UUID  -- Link to content
- buyer_id UUID, seller_id UUID
- unread_count_buyer INT, unread_count_seller INT
- last_message_at TIMESTAMP

messages:
- id UUID PRIMARY KEY
- conversation_id UUID REFERENCES conversations
- sender_id UUID, receiver_id UUID
- message TEXT
- is_read BOOLEAN DEFAULT false
- created_at TIMESTAMP
```

#### **6. notifications**
```sql
- id UUID PRIMARY KEY
- user_id UUID REFERENCES profiles
- type TEXT                        -- chat/wish_response/task_accepted/broadcast
- title TEXT, message TEXT, link TEXT
- is_read BOOLEAN DEFAULT false
- created_at TIMESTAMP
```

### **Location System (3-Level Hierarchy):**
```
cities (8 cities)
  ├── areas (40+ areas)
      └── sub_areas (120+ sub-areas with GPS coordinates)
```

**Coverage:** Bangalore, Hyderabad, Chennai, Mumbai, Pune, Kolkata, Visakhapatnam, Mysore

---

## 🛠️ TECH STACK

### **Frontend:**
- React 18 + TypeScript
- Tailwind CSS 4.0
- Vite (build tool)
- BrowserRouter (client-side routing - custom implementation)
- lucide-react (icons)
- motion/react (animations)
- sonner@2.0.3 (notifications)
- react-hook-form@7.55.0 (forms)

### **Backend:**
- Supabase PostgreSQL (database)
- Supabase Auth (email, phone, Google OAuth)
- Supabase Realtime (WebSocket chat)
- Supabase Storage (image uploads)
- Geoapify Autocomplete API (location search)

### **Deployment:**
- Netlify/Vercel (hosting)
- `/public/_redirects` - SPA routing configuration
- `/public/_headers` - Cache headers

---

## 📂 PROJECT STRUCTURE

```
/screens/                   # 24 main screens
  ├── NewHomeScreen.tsx              # Home page with 3 action buttons
  ├── MarketplaceScreen.tsx          # Browse marketplace
  ├── WishesScreen.tsx               # Browse wishes
  ├── CleanTasksScreen.tsx           # Browse tasks (current version)
  ├── ChatScreen.tsx                 # Real-time messaging
  ├── ProfileScreen.tsx              # User profile
  ├── PhoneAuthScreen.tsx            # Login/signup
  ├── CreateListingScreen.tsx        # Post marketplace ad
  ├── CreateWishScreen.tsx           # Post wish
  ├── CreateJobScreen.tsx            # Post task
  ├── ListingDetailScreen.tsx        # View listing
  ├── WishDetailScreen.tsx           # View wish
  ├── TaskDetailScreen.tsx           # View task
  ├── AdminScreen.tsx                # Admin panel (7 tabs)
  ├── NotificationsScreen.tsx        # Notifications
  └── [14 more screens...]

/components/                # Reusable UI components
  ├── /admin/              # Admin panel components (11 tabs)
  ├── /ui/                 # shadcn/ui components
  └── [80+ components]

/services/                  # Business logic & API
  ├── auth.ts              # Authentication
  ├── listings.js          # Marketplace CRUD
  ├── wishes.ts            # Wishes CRUD
  ├── tasks.ts             # Tasks CRUD
  ├── chat.ts              # Real-time chat
  ├── locations.ts         # 3-level location data
  ├── geocoding.ts         # Geoapify integration
  ├── notifications.ts     # Notification system
  └── [20+ services]

/constants/                 # Static data
  ├── categories.ts        # Marketplace categories
  ├── wishCategories.ts    # Wish categories
  ├── taskCategories.ts    # Task categories
  └── cities.ts            # City/area data

/hooks/                     # Custom React hooks
  ├── useLocation.ts       # Location management
  ├── useNotifications.ts  # Notifications
  └── usePushNotifications.ts

/utils/                     # Utility functions
  ├── distance.ts          # Haversine distance calculation
  ├── confetti.ts          # Celebration animations
  └── [10+ utils]

/public/                    # Static assets
  ├── _redirects           # SPA routing (plain text!)
  ├── _headers             # Cache headers (plain text!)
  ├── favicon.svg
  ├── robots.txt
  ├── sitemap.xml
  └── version.json
```

---

## 🔥 RECENT UPDATES

### ✅ **Just Fixed (Latest Session):**

#### 1. **Critical URL Routing Bug** 🚨
**Problem:** Direct URLs like `/marketplace`, `/tasks`, `/wishes` showed 404 or redirected to home

**Root Cause:**
- `_redirects` and `_headers` were in SUBDIRECTORIES as `.tsx` files
- Should be plain text files in `/public` root

**Fix Applied:**
- ✅ Deleted `/public/_redirects/main.tsx`
- ✅ Deleted `/public/_headers/main.tsx`
- ✅ Created `/public/_redirects` (plain text)
- ✅ Created `/public/_headers` (plain text)

**Result:** All direct URLs now work correctly!

#### 2. **TaskDetailScreen Missing Imports**
- ✅ Added missing React imports (useState, useEffect)
- ✅ Added Header component import
- ✅ Added all lucide-react icons

#### 3. **How It Works Page Consistency**
- ✅ All number badges now have black background with white text
- ✅ Consistent across all sections and tabs

---

## ⚠️ KNOWN ISSUES & TO-DO

### 🔴 **CRITICAL: NO PAGINATION!**

**Problem:**
- MarketplaceScreen loads ALL listings (limit: 1000)
- TasksScreen loads ALL tasks (limit: 1000)  
- WishesScreen loads ALL wishes (limit: 1000)
- NOT SCALABLE for production!

**Impact:** App will crash with large datasets

**Status:** ❌ Not implemented yet (UI components exist, but not used)

### 🟡 **Minor Issues:**
1. localStorage keys still use `oldcycle_*` prefix (backward compatibility)
2. Some docs reference "OldCycle" (legacy name)
3. PWA icons needed: `/public/pwa-192x192.png`, `/public/pwa-512x512.png`

---

## 🎯 USER FLOWS

### **New User Onboarding:**
```
1. Open app → NewHomeScreen (3 action buttons)
2. Click any button → IntroModal appears
3. Click "Login" → PhoneAuthScreen
4. Enter email/phone → Auto-login (no password)
5. LocationSetupModal → Select City → Area → Sub-Area
6. ✅ Start browsing/posting!
```

### **Posting Content:**
```
MARKETPLACE:
1. "Sell Something" → CreateListingScreen
2. Fill: Title, Description, Price, Category, Images
3. Location auto-filled from profile
4. Submit → Live immediately
5. Buyers can chat directly

WISHES:
1. "Post a Wish" → CreateWishScreen
2. Fill: Title, Description, Budget Range, Urgency
3. Submit → Visible to nearby sellers

TASKS:
1. "Post a Task" → CreateJobScreen
2. Fill: Title, Description, Budget, Timeline
3. Submit → Visible to helpers
```

### **Chat System:**
```
1. Click "Chat" on any listing/wish/task
2. System creates/opens conversation
3. Real-time messaging (Supabase Realtime)
4. Unread badges update automatically
5. Notifications sent to receiver
```

---

## 🔐 AUTHENTICATION

### **Methods:**
1. **Email** - Passwordless magic link
2. **Phone** - 10-digit mobile number
3. **Google OAuth** - One-click login

### **Storage:**
```javascript
// Main auth token
localStorage.getItem('oldcycle_client_token')

// User data
JSON.parse(localStorage.getItem('oldcycle_user'))

// Location
JSON.parse(localStorage.getItem('current_location'))

// Guest location (before login)
localStorage.getItem('localfelo_guest_location')
```

---

## 📊 ADMIN PANEL

**Access:** Set `is_admin = true` in profiles table

### **7 Admin Tabs:**
1. Users Management - View, edit, delete users
2. Listings Management - Moderate marketplace ads
3. Wishes Management - Moderate wishes
4. Tasks Management - Moderate tasks, update status
5. Reports Management - Handle user reports
6. Site Settings - Banner customization, app settings
7. Broadcast - Send notifications to all users

**Navigation:** Burger menu → "Admin Panel"

---

## 🚀 DEVELOPMENT COMMANDS

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔍 KEY FEATURES

### **Location System:**
- ✅ 3-level hierarchy: City → Area → Sub-Area
- ✅ 120+ sub-areas with GPS coordinates
- ✅ Geoapify Autocomplete API integration
- ✅ Distance calculation (Haversine formula)
- ✅ "X km away" badges on all content

### **Content Moderation:**
- ✅ AI-powered NSFW detection
- ✅ Bad word filtering (real-time)
- ✅ Manual category selection (required)
- ✅ Image compression (automatic)

### **Chat System:**
- ✅ Real-time WebSocket messaging
- ✅ Unread count badges
- ✅ Conversation linking to listings/wishes/tasks
- ✅ Message notifications

### **Rating System:**
- ✅ Dual rating (creator rates helper, helper rates creator)
- ✅ 5-star scale
- ✅ Optional feedback text
- ✅ Average rating display

---

## 📱 ROUTING CONFIGURATION

### **App.tsx:**
- Uses `BrowserRouter` from `react-router`
- Custom `getScreenFromPath()` function
- State-based screen switching
- URL sync on mount and path changes

### **Public Routes:**
```
/                    → NewHomeScreen
/marketplace         → MarketplaceScreen
/tasks               → CleanTasksScreen
/wishes              → WishesScreen
/create              → CreateListingScreen
/create-task         → CreateJobScreen
/create-wish         → CreateWishScreen
/profile             → ProfileScreen
/chat                → ChatScreen
/notifications       → NotificationsScreen
/about               → AboutLocalFeloPage
/how-it-works        → HowItWorksPage
/terms               → TermsPage
/privacy             → PrivacyPage
/safety              → SafetyPage
/faq                 → FAQPage
/prohibited          → ProhibitedItemsPage
/admin               → AdminScreen (if admin)
/listing/:id         → ListingDetailScreen
/task-detail?id=xxx  → TaskDetailScreen
/wish-detail?id=xxx  → WishDetailScreen
```

---

## 🎉 PROJECT STATUS

**Overall:** ✅ Production-ready MVP (except pagination)

| Feature | Status | Notes |
|---------|--------|-------|
| Core Platform | ✅ 100% | All 3 features working |
| Location System | ✅ 100% | Geoapify integrated |
| Chat System | ✅ 100% | Real-time working |
| Notifications | ✅ 100% | All types functional |
| Admin Panel | ✅ 100% | 7 tabs complete |
| URL Routing | ✅ 100% | **JUST FIXED!** |
| PWA Setup | ⏳ 95% | Icons needed |
| **Pagination** | ❌ 0% | **CRITICAL!** |
| SEO | ✅ 90% | Good meta tags |
| Mobile UX | ✅ 95% | Responsive |

---

## 📞 QUICK REFERENCE

**Project Name:** LocalFelo  
**Type:** Hyperlocal Marketplace PWA  
**Target Market:** India (8 cities initially)  
**Database:** Supabase PostgreSQL  
**Hosting:** Netlify/Vercel  
**Current Version:** MVP (ready for launch except pagination)

**Founder:** Santosh Kumar K  
**Tagline:** "Everything you need, nearby"  
**Slogan:** "🇮🇳 India's First Wish-Based Hyperlocal Platform"

---

## 🎯 NEXT PRIORITIES

1. 🔴 **URGENT:** Implement pagination on all 3 main screens
2. 🟡 Add PWA icons (192x192, 512x512)
3. 🟢 Mobile device testing
4. 🟢 Performance optimization
5. 🟢 SEO improvements

---

## ✅ SESSION READY!

I'm now fully briefed on:
- ✅ Complete project architecture
- ✅ Database schema and relationships
- ✅ All 3 core features (Buy&Sell, Wishes, Tasks)
- ✅ Design system and accessibility rules
- ✅ Recent routing fix
- ✅ Known issues and priorities
- ✅ Business logic and user flows

**Ready to continue development!** 🚀

What would you like to work on next?
