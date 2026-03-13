# 🎯 LocalFelo - Complete Project Context & Architecture

**Last Updated:** February 16, 2026  
**Status:** Production-ready MVP with recent routing fixes

---

## 📱 **Project Overview**

**LocalFelo** is India's fastest hyperlocal marketplace platform connecting people within local communities through three core features:

1. **Marketplace** - Traditional buy/sell classified ads (like OLX)
2. **Wishes** - Reverse marketplace where users post what they're looking for
3. **Tasks** - Gig economy platform for real-world jobs and services

**Tagline:** "Everything you need, nearby"

### **Business Model**
- ✅ **Mediator-only** - NO payments, NO delivery, NO financial involvement
- ✅ **100% free** - Zero commission model
- ✅ **Chat-only** - All communication through in-app messaging
- ✅ **Hyperlocal focus** - City → Area → Sub-Area filtering

---

## 🎨 **Branding & Design System**

### **Critical Color Rules (ACCESSIBILITY)**
```css
✅ CORRECT:
- bg-black text-[#CDFF00]           ← Bright green on black (high contrast)
- bg-white text-black                ← Black on white (readable)
- bg-[#CDFF00] text-black            ← Black on bright green (readable)
- border-[#CDFF00]                   ← Accent borders only

❌ NEVER DO THIS:
- bg-white text-[#CDFF00]            ← Unreadable! Low contrast!
- bg-[#CDFF00] text-[#CDFF00]        ← Invisible! Same color!
- text-[#CDFF00] on any light bg     ← Violates WCAG AA
```

### **Design Principles**
- **Flat Design:** NO shadows, NO gradients on cards/UI backgrounds
- **White Background:** Main background is white (not grey)
- **Moderate Corners:** `rounded-md` (NOT `rounded-xl` or `rounded-2xl`)
- **High Contrast:** All text must be black or white only
- **Bright Green:** `#CDFF00` only for backgrounds, borders, accents

### **Color Palette**
```
Primary:     #CDFF00  (Bright Green/Lemon Green)
Text:        #000000  (Black) or #FFFFFF (White)
Background:  #FFFFFF  (White cards/main)
Borders:     #E5E7EB  (Light grey)
Muted Text:  #6B7280  (Grey)
```

---

## 🗂️ **Database Architecture**

### **Main Tables (Supabase PostgreSQL)**

#### **1. Users & Authentication**
```sql
profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  phone TEXT,
  display_name TEXT,
  client_token TEXT UNIQUE,        -- OldCycle auth token
  owner_token TEXT UNIQUE,         -- Content ownership token
  city TEXT,
  area TEXT,
  subarea TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  address TEXT,                    -- Full address from Geoapify
  location_updated_at TIMESTAMP,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)
```

#### **2. Location System (3-Level Hierarchy)**
```sql
cities (
  id TEXT PRIMARY KEY,
  name TEXT,
  slug TEXT,
  latitude NUMERIC,
  longitude NUMERIC
)

areas (
  id TEXT PRIMARY KEY,
  city_id TEXT REFERENCES cities,
  name TEXT,
  slug TEXT,
  latitude NUMERIC,
  longitude NUMERIC
)

sub_areas (
  id TEXT PRIMARY KEY,
  area_id TEXT REFERENCES areas,
  name TEXT,
  slug TEXT,
  latitude NUMERIC,
  longitude NUMERIC
)
```

**Coverage:**
- 8 Cities (Bangalore, Hyderabad, Chennai, Mumbai, Pune, Kolkata, Visakhapatnam, Mysore)
- 40+ Areas
- 120+ Sub-areas with GPS coordinates

#### **3. Core Content Tables**
```sql
listings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  title TEXT,
  description TEXT,
  price NUMERIC,
  category TEXT,
  condition TEXT,
  images TEXT[],
  city TEXT,
  area TEXT,
  subarea TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)

wishes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  title TEXT,
  description TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  category TEXT,
  urgency TEXT,                    -- low, medium, high, urgent
  city TEXT,
  area TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)

tasks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  title TEXT,
  description TEXT,
  budget NUMERIC,
  category TEXT,
  timeline TEXT,
  city TEXT,
  area TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  address TEXT,
  status TEXT,                     -- open, in_progress, completed, cancelled
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)
```

#### **4. Communication System**
```sql
conversations (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES listings,
  wish_id UUID REFERENCES wishes,
  task_id UUID REFERENCES tasks,
  buyer_id UUID REFERENCES profiles,
  seller_id UUID REFERENCES profiles,
  unread_count_buyer INTEGER DEFAULT 0,
  unread_count_seller INTEGER DEFAULT 0,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP
)

messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations,
  sender_id UUID REFERENCES profiles,
  receiver_id UUID REFERENCES profiles,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)

notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  type TEXT,                       -- chat, wish_response, task_accepted, broadcast
  title TEXT,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)
```

---

## 🛠️ **Tech Stack**

### **Frontend**
```json
{
  "framework": "React 18 with TypeScript",
  "styling": "Tailwind CSS 4.0",
  "build": "Vite",
  "routing": "Client-side (custom)",
  "icons": "lucide-react",
  "animations": "motion/react (formerly Framer Motion)",
  "notifications": "sonner@2.0.3",
  "forms": "react-hook-form@7.55.0"
}
```

### **Backend**
```json
{
  "database": "Supabase (PostgreSQL)",
  "auth": "Supabase Auth (Email, Phone, Google OAuth)",
  "realtime": "Supabase Realtime (WebSocket)",
  "storage": "Supabase Storage (images)",
  "api": "Geoapify Autocomplete API (location search)"
}
```

### **Deployment**
```json
{
  "platform": "Vercel",
  "config": "vercel.json with SPA rewrites",
  "pwa": "vite-plugin-pwa@0.17.4"
}
```

---

## 📂 **Project Structure**

### **Key Directories**
```
/screens/                    # Main app screens (24 files)
/components/                 # Reusable UI components
  /admin/                    # Admin panel components
  /ui/                       # shadcn/ui components
  /figma/                    # Protected Figma components
/services/                   # API & business logic
/hooks/                      # Custom React hooks
/utils/                      # Utility functions
/constants/                  # Categories, cities data
/styles/                     # Global CSS & tokens
/migrations/                 # SQL migrations
/public/                     # Static assets
```

### **Main Screens**
```
NewHomeScreen.tsx            # Home with 3 action buttons + feeds
MarketplaceScreen.tsx        # Browse marketplace (NO pagination yet!)
WishesScreen.tsx             # Browse wishes (NO pagination yet!)
TasksScreen.tsx              # Browse tasks (NO pagination yet!)
ChatScreen.tsx               # Real-time messaging
ProfileScreen.tsx            # User profile management
PhoneAuthScreen.tsx          # Login/signup
CreateListingScreen.tsx      # Post marketplace ad
CreateWishScreen.tsx         # Post wish
CreateTaskScreen.tsx         # Post task
ListingDetailScreen.tsx      # View listing details
WishDetailScreen.tsx         # View wish details
TaskDetailScreen.tsx         # View task details
AdminScreen.tsx              # Admin panel (7 tabs)
NotificationsScreen.tsx      # Notifications panel
```

### **Core Services**
```javascript
/services/auth.ts            # Authentication (Email, Phone, Google)
/services/chat.ts            # Real-time chat functionality
/services/listings.js        # Marketplace CRUD operations
/services/wishes.ts          # Wishes CRUD operations
/services/tasks.ts           # Tasks CRUD operations
/services/locations.ts       # 3-level location data
/services/geocoding.ts       # Geoapify integration (replaced Nominatim)
/services/notifications.ts   # Notification system
/services/categories.ts      # Categories management
```

---

## 🔥 **Recent Changes & Current Status**

### ✅ **Just Completed (Latest Session)**

#### 1. **Direct URL Routing Fix** ✅
**Problem:** Opening `/marketplace`, `/tasks`, `/wishes` directly showed 404 or home screen

**Solution:**
- Fixed App.tsx initialization to read URL path on load
- Set currentScreen based on window.location.pathname
- Added special handling for routes with IDs (e.g., `/listing/abc123`)
- Works correctly with Vercel's vercel.json SPA rewrites

**Files Modified:**
- `/App.tsx` - Added URL path initialization

#### 2. **Home Screen Updates** ✅
**Changes:**
- Removed emoji from "Tasks near you, complete and earn 💰" → "Tasks near you, complete and earn"
- Reduced heading size on mobile: `text-[17px]` → `text-[15px]`
- Reduced vertical spacing: `mb-8` → `mb-6`, `py-6` → `py-5`
- Better mobile layout (no breaking View All button)

**Files Modified:**
- `/screens/NewHomeScreen.tsx`
- `/components/HorizontalScroll.tsx`

### ✅ **Previously Completed**

#### **Footer Redesign with Stunning Animations**
- Beautiful "How It Works" section (bright green background)
- Black ending banner: "🇮🇳 India's First Wish-Based Hyperlocal Platform"
- Social links integration
- SEO-optimized content
- Flat design, no shadows

#### **Complete Database Migration**
- Added `latitude`, `longitude`, `address` fields to all 3 tables (listings, wishes, tasks)
- Replaced Nominatim with **Geoapify Autocomplete API**
- Accurate location search with better address data
- Distance calculation using Haversine formula

#### **Location System Overhaul**
- 3-level hierarchy: City → Area → Sub-Area
- 120+ sub-areas with GPS coordinates
- Location modal before login (guest support)
- Distance badges: "1.2 km away"
- Geoapify integration for better accuracy

---

## ⚠️ **Known Issues & To-Do**

### 🔴 **CRITICAL: Pagination NOT Implemented**

**Problem:**
- MarketplaceScreen.tsx loads ALL listings (limit: 1000)
- TasksScreen.tsx loads ALL tasks (limit: 1000)
- WishesScreen.tsx loads ALL wishes (limit: 1000)
- NOT SCALABLE for production!

**Evidence:**
- UI pagination components exist: `/components/ui/pagination.tsx`
- But main screens don't use them
- Need to implement proper pagination with page state

**Solution Needed:**
```typescript
// Example structure needed
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 20;

// Fetch with pagination
const { data, count } = await fetchListings({
  limit: itemsPerPage,
  offset: (currentPage - 1) * itemsPerPage
});

// Render pagination component
<Pagination 
  currentPage={currentPage}
  totalPages={Math.ceil(count / itemsPerPage)}
  onPageChange={setCurrentPage}
/>
```

### 🟡 **Other Issues**

1. **localStorage Keys** - Still use `oldcycle_*` prefix (backward compatibility)
2. **Documentation** - Some docs reference "OldCycle" (legacy)
3. **PWA Icons** - Need `/public/pwa-192x192.png` and `/public/pwa-512x512.png`
4. **Admin Panel** - Some border radius inconsistencies

---

## 🎯 **User Flows**

### **New User Onboarding**
```
1. Open app → NewHomeScreen (3 action buttons)
2. Click any button → IntroModal appears
3. Click "Login" → PhoneAuthScreen
4. Enter email/phone → Auto-login
5. LocationSetupModal → Select City → Area → Sub-Area
6. ✅ Start browsing/posting!
```

### **Posting Content**
```
MARKETPLACE:
1. Click "Sell Something" → CreateListingScreen
2. Fill: Title, Description, Price, Category
3. Upload images (drag & drop)
4. Location auto-filled from profile
5. Submit → Listing goes live
6. Buyers can chat directly

WISHES:
1. Click "Post a Wish" → CreateWishScreen
2. Fill: Title, Description, Budget Range
3. Select urgency: low/medium/high/urgent
4. Submit → Wish visible to nearby users
5. Sellers/helpers can contact

TASKS:
1. Click "Post a Task" → CreateTaskScreen
2. Fill: Title, Description, Budget, Timeline
3. Submit → Task visible to helpers
4. Helpers can apply/chat
```

### **Chat Flow**
```
1. User clicks "Chat" on any listing/wish/task
2. System creates/opens conversation
3. Real-time messaging (Supabase Realtime)
4. Unread count badges update automatically
5. Notifications sent to receiver
6. Both parties can see chat history
```

---

## 🔐 **Authentication System**

### **Methods Available**
1. **Email** - Passwordless (magic link from Supabase)
2. **Phone** - 10-digit mobile number
3. **Google OAuth** - One-click login

### **Storage Pattern**
```javascript
// Client token (main auth)
localStorage.getItem('oldcycle_client_token')

// User data
const user = JSON.parse(localStorage.getItem('oldcycle_user'))

// Location data
const location = JSON.parse(localStorage.getItem('current_location'))

// Guest location (before login)
localStorage.getItem('localfelo_guest_location')
```

### **Auth Flow**
```
1. User enters email/phone
2. Check if profile exists in Supabase
3. If new user → Create profile with auto-generated tokens
4. If existing → Login immediately
5. Sync Supabase session with localStorage
6. Redirect to home with location modal
```

---

## 📊 **Admin Panel Features**

**Access:** Set `is_admin = true` in profiles table

### **7 Admin Tabs**
1. **Users Management** - View, edit, delete users
2. **Listings Management** - Moderate marketplace ads
3. **Wishes Management** - Moderate wishes
4. **Tasks Management** - Moderate tasks, update status
5. **Reports Management** - Handle user reports
6. **Site Settings** - Banner customization, app download links
7. **Broadcast** - Send notifications to all users

**Navigation:** Burger menu → "Admin Panel"

---

## 🎨 **Design Tokens (globals.css)**

```css
/* Color Tokens */
--color-primary: #CDFF00;           /* Bright Green */
--color-heading: #000000;           /* Black */
--color-body: #374151;              /* Dark Grey */
--color-muted: #6B7280;             /* Medium Grey */
--color-border: #E5E7EB;            /* Light Grey */
--color-background: #FFFFFF;        /* White */

/* Typography Tokens */
--font-sans: 'Inter', system-ui, sans-serif;

/* Spacing Tokens */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

---

## 🚀 **Development Commands**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

---

## 📱 **Mobile Optimization**

### **Responsive Breakpoints**
```css
sm:   640px   /* Small tablets */
md:   768px   /* Tablets */
lg:   1024px  /* Laptops */
xl:   1280px  /* Desktops */
2xl:  1536px  /* Large screens */
```

### **Mobile-First Features**
- Bottom navigation bar
- Swipeable cards
- Touch-optimized buttons (min 44px)
- Responsive images
- Mobile menu sheet
- PWA install prompts

---

## 🔍 **SEO & Marketing**

### **Key Landing Pages**
```
/                # Home (NewHomeScreen)
/marketplace     # Browse marketplace
/wishes          # Browse wishes
/tasks           # Browse tasks
/about           # About LocalFelo
/contact         # Contact page
/safety          # Safety guidelines
/terms           # Terms of service
/privacy         # Privacy policy
```

### **Meta Tags (index.html)**
```html
<title>LocalFelo - Get Help Nearby | Tasks, Wishes & Marketplace</title>
<meta name="description" content="India's first wish-based hyperlocal platform..." />
<meta property="og:title" content="LocalFelo" />
<meta property="og:type" content="website" />
```

---

## 🐛 **Debugging Tools**

### **Console Helpers**
```javascript
// Test notification
await window.testNotification()

// View PWA analytics
console.table(JSON.parse(localStorage.getItem('pwa_analytics')))

// Check push notification status
console.log(window.pushStatus)

// View current location
console.log(JSON.parse(localStorage.getItem('current_location')))

// Test toast notifications
window.testToast()
```

---

## 🎉 **Project Health Status**

**Overall:** ✅ Production-ready MVP

| Feature | Status | Notes |
|---------|--------|-------|
| Core Platform | ✅ 100% | All 3 features working |
| Location System | ✅ 100% | Geoapify integrated |
| Chat System | ✅ 100% | Real-time working |
| Notifications | ✅ 100% | All types functional |
| Admin Panel | ✅ 100% | 7 tabs complete |
| PWA Setup | ⏳ 95% | Icons needed |
| **Pagination** | ❌ 0% | **CRITICAL: Not implemented!** |
| SEO | ✅ 90% | Good meta tags |
| Mobile UX | ✅ 95% | Responsive design |
| Routing | ✅ 100% | Direct URLs fixed |

---

## 📞 **Quick Reference**

**Project:** LocalFelo  
**Type:** Hyperlocal Marketplace PWA  
**Target:** Indian users (8 cities)  
**Database:** Supabase PostgreSQL  
**Hosting:** Vercel  
**Status:** Production MVP (needs pagination!)  

**Next Priority:** 
1. 🔴 Implement pagination on MarketplaceScreen, TasksScreen, WishesScreen
2. 🟡 Add PWA icons
3. 🟢 Mobile testing

---

**✅ Project context review complete! Ready to continue development.**
