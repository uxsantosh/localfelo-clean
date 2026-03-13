# 🎯 LocalFelo - Complete Project Knowledge Base

## 📱 **What is LocalFelo?**

**LocalFelo** is India's fastest hyperlocal marketplace platform - a complete ecosystem connecting people within local communities.

### **Core Philosophy:**
- **Mediator-only platform** - NO payments, NO delivery, NO financial involvement
- Users connect directly via chat
- Zero commission model
- Hyperlocal focus (city → area → sub-area)

### **Tagline:**
**"Everything you need, nearby"**

---

## 🎨 **Branding & Design System**

### **Colors:**
- **Primary:** Lemon Green `#CDFF00`
- **Secondary:** Black `#000000`
- **Background:** White `#FFFFFF` (cards), Light Grey `#F5F5F5` (main)
- **Text:** Black or White ONLY (NEVER lime green text for accessibility)

### **Design Rules:**
✅ **Flat Design** - NO shadows, NO gradients on cards/UI
✅ **Reduced Corners** - `rounded-md` (NOT `rounded-xl` or `rounded-2xl`)
✅ **Accessibility** - Lime green ONLY on dark backgrounds or as borders/accents
✅ **High Contrast** - All text must be readable (WCAG AA compliant)

### **Color Usage:**
```css
✅ GOOD:
- bg-black text-[#CDFF00]     ← Lime green on black
- bg-white text-black          ← Black on white
- bg-[#CDFF00] text-black      ← Black on lime green
- border-[#CDFF00]             ← Accent borders

❌ BAD:
- bg-white text-[#CDFF00]      ← Unreadable!
- text-[#CDFF00] on light bg   ← Low contrast
```

---

## 🚀 **Three Core Features**

### **1. Marketplace (Buy/Sell)**
- Traditional classified ads
- Categories: Electronics, Fashion, Furniture, Vehicles, etc.
- Users post listings with images, price, location
- Direct chat between buyer and seller

### **2. Wishes (Reverse Marketplace)**
- Users post what they're LOOKING FOR
- Sellers find buyers instead of vice versa
- Fields: Title, Description, Budget Range, Urgency
- Perfect for: "Looking for iPhone under ₹20k"

### **3. Tasks (Gig Economy)**
- Real-world jobs/services
- Categories: Moving help, Tutoring, Repairs, Design, etc.
- Fields: Title, Description, Budget, Timeline
- Examples: "Need help moving furniture", "Looking for home tutor"

---

## 🗺️ **Location System**

### **3-Level Hierarchy:**
1. **City** (8 cities): Bangalore, Hyderabad, Chennai, Mumbai, Pune, Kolkata, Visakhapatnam, Mysore
2. **Area** (40+ areas): Koramangala, Whitefield, HSR Layout, BTM Layout, etc.
3. **Sub-Area** (120+ sub-areas): BTM 1st Stage, BTM 2nd Stage, Koramangala 4th Block, etc.

### **How it Works:**
- User selects City → Area → Sub-Area during onboarding
- All content filtered by user's location
- Distance calculated using Haversine formula
- Distance badges show: "1.2 km away", "3.5 km away", etc.

### **Database Structure:**
```sql
cities (id, name, slug)
areas (id, city_id, name, slug, latitude, longitude)
sub_areas (id, area_id, name, slug, latitude, longitude)
profiles (city, area, subarea) -- User location
```

---

## 👤 **Authentication System**

### **Login Methods:**
1. **Email** (passwordless via magic link)
2. **Phone** (10-digit mobile number)
3. **Google OAuth** (optional)

### **Flow:**
1. User enters email/phone
2. System checks if user exists
3. **New User:** Auto-created profile, welcome toast
4. **Existing User:** Login immediately
5. Location setup modal (if first time)

### **No Passwords Required!**
- Simple, fast onboarding
- Stored in localStorage as `oldcycle_client_token`
- Persistent sessions

---

## 💬 **Chat System**

### **Features:**
- Real-time messaging (Supabase Realtime)
- Unread count badges
- Typing indicators
- Message timestamps
- Auto-scroll to latest

### **How it Works:**
1. User clicks "Chat" on any listing/wish/task
2. Conversation auto-created (or existing one opened)
3. Messages stored in `messages` table
4. Unread counts updated via triggers
5. Real-time updates via `conversations:*` channel

### **Database Tables:**
```sql
conversations (id, listing_id, wish_id, task_id, buyer_id, seller_id, unread_count_buyer, unread_count_seller)
messages (id, conversation_id, sender_id, receiver_id, message, timestamp, is_read)
```

---

## 🔔 **Notifications System**

### **Types:**
1. **Chat Messages** - New message received
2. **Wish Responses** - Someone replied to your wish
3. **Task Applications** - Someone applied to your task
4. **System Announcements** - Admin broadcasts

### **Features:**
- Real-time updates
- Unread count badge on bell icon
- In-app notification panel
- Toast notifications
- Mark as read functionality

---

## 📊 **Admin Panel**

### **Access:**
- Only users with `is_admin = true` in `profiles` table
- Accessible via burger menu → "Admin Panel"

### **Features:**
1. **Users Management** - View, edit, delete users
2. **Listings Management** - Moderate marketplace ads
3. **Wishes Management** - Moderate wishes
4. **Tasks Management** - Moderate tasks
5. **Reports Management** - Handle user reports
6. **Site Settings** - Configure banners, promos, announcements
7. **Broadcast** - Send notifications to all users

---

## 🗂️ **File Structure**

### **Key Files:**
```
/App.tsx                          # Main app router
/screens/NewHomeScreen.tsx        # Homepage (3 action buttons + feeds)
/screens/MarketplaceScreen.tsx    # Browse marketplace listings
/screens/WishesScreen.tsx         # Browse wishes
/screens/TasksScreen.tsx          # Browse tasks
/screens/ChatScreen.tsx           # Chat interface
/screens/ProfileScreen.tsx        # User profile
/screens/AuthScreen.tsx           # Login/register
/components/Header.tsx            # Top navigation
/components/BottomNavigation.tsx  # Mobile bottom nav
/components/LocationSetupModal.tsx # 3-level location picker
/components/IntroModal.tsx        # First-time user guide
/services/auth.ts                 # Authentication logic
/services/chat.ts                 # Chat functionality
/services/listings.js             # Marketplace CRUD
/services/wishes.ts               # Wishes CRUD
/services/tasks.ts                # Tasks CRUD
/services/locations.ts            # Location data
/styles/globals.css               # Global styles + color tokens
/constants/categories.ts          # Marketplace categories
/constants/wishCategories.ts      # Wish categories
/constants/taskCategories.ts      # Task categories
```

---

## 🎯 **Recent Changes (Last Session)**

### **✅ Completed:**
1. **Branding Update:**
   - Changed "OldCycle" → "LocalFelo" throughout UI
   - Updated tagline to "Everything you need, nearby"
   - Fixed white text on green backgrounds → black text

2. **Flat Design Implementation:**
   - Reduced border radius from `rounded-xl` → `rounded-md`
   - Removed shadows from cards
   - Changed background from `#f8f9fa` → `#FFFFFF`

3. **Content Updates:**
   - AuthScreen: "Welcome to LocalFelo", "Everything you need, nearby"
   - AboutPage: Updated mission, features to include Wishes & Tasks
   - Header: Shows "LocalFelo" as default title

4. **Accessibility Fixes:**
   - Fixed all green-on-white text issues
   - All text now black or white only
   - Green used only for backgrounds, borders, accents

### **📝 Known Issues:**
- Some documentation still references "OldCycle" (legacy)
- localStorage keys still use `oldcycle_*` prefix (for backward compatibility)
- Some border radius inconsistencies may remain in admin panels

---

## 🛠️ **Tech Stack**

### **Frontend:**
- **React 18** (TypeScript)
- **Tailwind CSS 4.0** (utility-first styling)
- **Vite** (build tool)
- **Lucide Icons** (icon library)
- **React Router** (client-side routing)
- **Motion/React** (animations)

### **Backend:**
- **Supabase** (PostgreSQL database)
- **Supabase Auth** (passwordless authentication)
- **Supabase Realtime** (WebSocket for chat/notifications)
- **Supabase Storage** (image uploads)

### **Key Libraries:**
```json
{
  "react": "^18.2.0",
  "react-toastify": "toast notifications",
  "motion/react": "animations",
  "lucide-react": "icons",
  "recharts": "charts (admin)"
}
```

---

## 📱 **User Flows**

### **New User Journey:**
1. Open app → See NewHomeScreen (3 action buttons)
2. Click any action → Intro Modal appears
3. Choose "Login" → Enter email/phone
4. Auto-login → Location Setup Modal
5. Select City → Area → Sub-Area
6. ✅ Onboarding complete!

### **Posting a Listing:**
1. Click "Sell Something" on home
2. Fill form: Title, Description, Price, Category, Images
3. Location auto-populated from profile
4. Submit → Listing goes live immediately
5. Chat notifications when buyers message

### **Finding a Product:**
1. Click "Marketplace" in bottom nav
2. Browse by category or search
3. See distance badges ("2.3 km away")
4. Click listing → View details
5. Click "Chat" → Start conversation

---

## 🔐 **Security & Privacy**

### **Data Protection:**
- No payment processing (zero financial data stored)
- No delivery tracking (users handle logistics)
- Chat messages encrypted in transit
- User phone/email never publicly visible
- RLS (Row Level Security) on all tables

### **User Safety:**
- Report system for inappropriate content
- Admin moderation tools
- Safety guidelines page
- Terms of Service + Privacy Policy
- Block user functionality

---

## 📈 **Performance Optimizations**

1. **Image Loading:**
   - Lazy loading with `ImageWithFallback` component
   - Unsplash integration for placeholders
   - Compression before upload

2. **Data Fetching:**
   - Pagination (10-20 items per page)
   - Distance-based sorting (nearest first)
   - Filters applied on backend

3. **Real-time:**
   - Selective channel subscriptions
   - Unsubscribe on component unmount
   - Debounced typing indicators

---

## 🎓 **Key Concepts**

### **Hyperlocal:**
Everything is filtered by user's city/area. No cross-city transactions by default.

### **Mediator-Only:**
LocalFelo NEVER touches money or goods. We only connect people.

### **Zero Commission:**
100% free platform. No listing fees, no transaction fees.

### **Chat-First:**
All communication happens in-app. No phone numbers shared publicly.

### **Mobile-First:**
UI optimized for mobile devices (responsive design).

---

## 🐛 **Common Issues & Fixes**

### **"No listings showing"**
→ Check if user has set location (City/Area/Sub-Area)

### **"Chat not working"**
→ Verify Supabase Realtime is enabled on `conversations` and `messages` tables

### **"Distance badges missing"**
→ Ensure `areas` and `sub_areas` have latitude/longitude coordinates

### **"Login not persisting"**
→ Check localStorage for `oldcycle_client_token`

### **"Green text unreadable"**
→ NEVER use `text-[#CDFF00]` on light backgrounds! Always use `text-black`

---

## 📚 **Next Steps / Future Features**

### **Planned:**
- [ ] Image compression on upload
- [ ] Advanced search filters
- [ ] User ratings/reviews
- [ ] Push notifications (FCM)
- [ ] Email notifications
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Desktop web app optimization

### **Under Consideration:**
- [ ] Payment integration (escrow)
- [ ] Delivery partner integration
- [ ] Business accounts
- [ ] Promoted listings
- [ ] Video uploads

---

## 🎉 **Success Metrics**

### **Current Status:**
✅ All core features functional  
✅ 3-level location system working  
✅ Real-time chat operational  
✅ Notifications system active  
✅ Admin panel complete  
✅ Branding consistent (LocalFelo)  
✅ Accessibility compliant  

### **User Experience:**
- **Fast:** Login in <3 seconds
- **Simple:** No complex forms
- **Local:** Everything within 5-10 km
- **Free:** Zero fees forever
- **Safe:** Moderation + reporting tools

---

## 📞 **Contact & Support**

**Project Name:** LocalFelo  
**Type:** Hyperlocal Marketplace Platform  
**Target:** Indian users in 8+ cities  
**Status:** Production-ready MVP  

**Legal Pages:**
- `/about` - About LocalFelo
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy
- `/safety` - Safety Guidelines
- `/contact` - Contact information

---

## 🔄 **Last Updated:**
December 28, 2024

**Current Version:** LocalFelo v1.0  
**Database:** Supabase (PostgreSQL)  
**Deployment:** Vite production build  
**Environment:** Web (Mobile-optimized)

---

**Ready to continue development! 🚀**
