# LocalFelo Category Systems & Cross-Module Matching Documentation

## Overview

LocalFelo uses **TWO DISTINCT category systems** to handle different types of content:

1. **PRODUCT_CATEGORIES** - For physical goods (Marketplace, Wishes, Shops)
2. **TASK_CATEGORIES** - For services (Tasks, Professionals)

This document explains how each module works, what categories they use, and how cross-module matching/notifications work.

---

## 📦 PRODUCT_CATEGORIES (Physical Goods)

**File:** `/services/productCategories.ts`

### Used By:
- ✅ **Marketplace (Buy&Sell)** - Individual items for sale
- ✅ **Wishes** - Product requests/requirements  
- ✅ **Shops** - Store catalogs with multiple products

### Structure:
```typescript
interface ProductCategory {
  id: string;           // e.g., "mobiles-accessories"
  name: string;         // e.g., "Mobiles & Accessories"
  emoji: string;        // e.g., "📱"
  subcategories: ProductSubcategory[];
}

interface ProductSubcategory {
  id: string;           // e.g., "smartphones"
  name: string;         // e.g., "Smartphones"
}
```

### Categories (18 Main Categories):
1. 📱 **Mobiles & Accessories**
2. 💻 **Laptops & Computers**
3. 📺 **Electronics & Gadgets**
4. 🏠 **Home Appliances**
5. 🛋️ **Furniture**
6. 🍳 **Home & Kitchen**
7. 👕 **Fashion & Clothing**
8. 💄 **Beauty & Personal Care**
9. 💪 **Health & Fitness**
10. 📚 **Books & Stationery**
11. 🎨 **Hobbies & Creative**
12. 🎮 **Toys & Games**
13. 🍼 **Baby & Kids**
14. 🐾 **Pets**
15. 🏃 **Sports & Outdoor**
16. 🚗 **Vehicles & Parts**
17. 🎸 **Musical Instruments**
18. 🏗️ **Tools & Construction**

Each category has 4-7 subcategories for more specific classification.

---

## 🛠️ TASK_CATEGORIES (Services)

**File:** `/services/taskCategories.ts`

### Used By:
- ✅ **Tasks** - Service requests (e.g., "Need plumber")
- ✅ **Professionals** - Service provider listings

### Structure:
```typescript
interface TaskCategory {
  id: string;           // e.g., "home-services"
  name: string;         // e.g., "Home Services"
  emoji: string;        // e.g., "🏠"
  subcategories: TaskSubcategory[];
}

interface TaskSubcategory {
  id: string;           // e.g., "plumbing"
  name: string;         // e.g., "Plumbing"
  keywords?: string[];  // e.g., ["plumber", "pipes", "leak"]
}
```

### Categories (15 Main Categories):
1. 🏠 **Home Services** (Plumbing, Electrical, Carpentry, etc.)
2. 🎨 **Creative & Design** (Graphic Design, Photography, Video, etc.)
3. 💻 **Tech & IT** (Web Development, Mobile Apps, IT Support, etc.)
4. 📚 **Education & Tutoring** (School Tutoring, Music, Language, etc.)
5. 💼 **Business & Consulting** (Marketing, Accounting, Legal, etc.)
6. ✍️ **Writing & Content** (Content Writing, Translation, Editing, etc.)
7. 🚚 **Logistics & Moving** (Moving, Delivery, Courier, etc.)
8. 🧹 **Cleaning & Maintenance** (House Cleaning, Commercial, Deep Cleaning, etc.)
9. 💪 **Health & Fitness** (Personal Training, Yoga, Diet, etc.)
10. 🎉 **Events & Entertainment** (Event Planning, Catering, Photography, etc.)
11. 💇 **Beauty & Wellness** (Salon, Spa, Makeup, etc.)
12. 🔧 **Automotive** (Car Repair, Bike Service, AC Repair, etc.)
13. 🌿 **Gardening & Landscaping** (Gardening, Lawn Care, Plant Care, etc.)
14. 🎓 **Professional Training** (Certifications, Workshops, Skill Dev, etc.)
15. 🛡️ **Security & Safety** (Security Guards, CCTV, Fire Safety, etc.)

Each category has 5-10 subcategories for specific service types.

---

## 🗄️ Database Schema

### Marketplace (Buy&Sell) - `listings` table
```sql
category_slug TEXT  -- e.g., "mobiles-accessories" (from PRODUCT_CATEGORIES.id)
```
- Stores only main category slug
- No subcategory_id field yet (future enhancement)
- Uses PRODUCT_CATEGORIES for UI selection

### Wishes - `wishes` table
```sql
category_ids TEXT[]  -- Array of category IDs ["mobiles-accessories", "laptops-computers"]
subcategory_ids TEXT[]  -- Array of subcategory IDs ["smartphones", "laptops"]
```
- Multi-select categories + subcategories
- Uses PRODUCT_CATEGORIES
- Matching: When a new marketplace listing is created, check if its category matches ANY wish category

### Shops - `shops` table
```sql
category_ids TEXT[]  -- Array of category IDs
subcategory_ids TEXT[]  -- Array of subcategory IDs
```
- Multi-select categories + subcategories
- Uses PRODUCT_CATEGORIES
- Shops can sell products from multiple categories

### Tasks - `tasks` table
```sql
detected_category TEXT  -- e.g., "home-services" (AI-detected from TASK_CATEGORIES)
detected_subcategory TEXT  -- e.g., "plumbing" (AI-detected)
```
- Uses TASK_CATEGORIES
- AI auto-detects category from description using OpenAI
- Matching: When a new professional registers, check if their skills match any task category

### Professionals - `professionals` table
```sql
service_categories TEXT[]  -- Array of category IDs from TASK_CATEGORIES
```
- Multi-select from TASK_CATEGORIES
- Professionals can offer services from multiple categories

---

## 🔔 Cross-Module Notification Matching

### 1. Wishes ↔ Marketplace (Buy&Sell)
**Scenario:** User posts a Wish for "iPhone 13". When someone posts a marketplace listing for "iPhone 13", wish creator gets notified.

**Matching Logic:**
```typescript
// In /services/notifications.ts - sendWishMatchNotifications()
- New marketplace listing created with category "mobiles-accessories"
- Find all wishes WHERE:
  - "mobiles-accessories" IN wish.category_ids
  - wish.location matches listing.location (within 50km)
  - wish.is_active = true
- Send notification to wish creators
```

**Database Fields Used:**
- `listings.category_slug` (single main category)
- `wishes.category_ids` (array of main categories)
- `wishes.subcategory_ids` (array of subcategories) - *not yet used for matching*

**Current Implementation:**
- ✅ Main category matching works
- ⚠️ Subcategory matching not implemented yet
- ⚠️ Location-based matching implemented

### 2. Tasks ↔ Professionals
**Scenario:** User posts a Task for "Need plumber". When a plumber registers as a Professional, task creator gets notified.

**Matching Logic:**
```typescript
// In /services/professionalNotifications.ts - sendTaskMatchNotifications()
- New professional created with service_categories ["home-services"]
- Find all tasks WHERE:
  - detected_category = "home-services"
  - detected_subcategory IN professional's subcategories
  - task.location matches professional.location (within 50km)
  - task.status = 'open'
- Send notification to task creators
```

**Database Fields Used:**
- `tasks.detected_category` (AI-detected from description)
- `tasks.detected_subcategory` (AI-detected)
- `professionals.service_categories` (selected by professional)

**Current Implementation:**
- ✅ Category + subcategory matching works
- ✅ Location-based matching implemented
- ✅ AI auto-categorization working

### 3. Wishes ↔ Shops (Future)
**Scenario:** User posts a Wish for "iPhone accessories". When a shop updates its catalog to include phone accessories, wish creator gets notified.

**Matching Logic:**
```typescript
// NOT YET IMPLEMENTED
- Shop updates catalog with categories ["mobiles-accessories"]
- Find all wishes WHERE:
  - "mobiles-accessories" IN wish.category_ids
  - wish.location matches shop.location (within 50km)
- Send notification to wish creators
```

**Status:** 🚧 Not yet implemented - planned for future release

---

## 📋 Module Details

### 1. Marketplace (Buy&Sell)

**Purpose:** Individual users sell second-hand or new items

**Category System:** PRODUCT_CATEGORIES (single selection)

**Selection UI:** `MarketplaceCategorySelector` component
- User selects ONE main category + ONE subcategory
- Example: "Mobiles & Accessories" → "Smartphones"

**Database Storage:**
```javascript
listings.category_slug = "mobiles-accessories"  // Main category ID
// Subcategory stored in future enhancement
```

**Filtering:**
- Category pills on MarketplaceScreen
- Filter modal with category dropdown

**Notification Trigger:**
- When new listing posted → check matching wishes → notify wish creators

---

### 2. Wishes

**Purpose:** Users post requirements/requests for products they want to buy

**Category System:** PRODUCT_CATEGORIES (multi-selection)

**Selection UI:** `ProductCategorySelector` component
- User selects MULTIPLE categories + subcategories
- Example: User wants "Mobile phones OR Laptops" → selects both

**Database Storage:**
```javascript
wishes.category_ids = ["mobiles-accessories", "laptops-computers"]
wishes.subcategory_ids = ["smartphones", "laptops"]
```

**Filtering:**
- Multi-select category chips
- Expandable subcategory dropdowns

**Notification Trigger:**
- When new marketplace listing posted → check if category matches wish → notify wish creator
- When new shop registers → check if shop categories match wish → notify wish creator (future)

---

### 3. Shops

**Purpose:** Business owners register stores with product catalogs

**Category System:** PRODUCT_CATEGORIES (multi-selection)

**Selection UI:** `ProductCategorySelector` component
- Shop selects MULTIPLE categories they sell in
- Example: Electronics shop sells "Mobiles", "Laptops", "Gadgets"

**Database Storage:**
```javascript
shops.category_ids = ["mobiles-accessories", "laptops-computers", "electronics-gadgets"]
shops.subcategory_ids = ["smartphones", "laptops", "speakers-audio"]
```

**Filtering:**
- Multi-select category filter
- Search by category name

**Notification Trigger:**
- When shop updates catalog → check matching wishes → notify wish creators (future)

---

### 4. Tasks

**Purpose:** Users post service requests (e.g., "Need plumber", "Need photographer")

**Category System:** TASK_CATEGORIES (AI auto-detection)

**Selection UI:** None (AI auto-detects)
- User writes description: "Need plumber to fix kitchen sink leak"
- AI detects category: "home-services" → "plumbing"

**Database Storage:**
```javascript
tasks.detected_category = "home-services"
tasks.detected_subcategory = "plumbing"
```

**AI Categorization:**
```typescript
// In /services/aiCategorization.ts
- OpenAI API analyzes task description
- Matches against TASK_CATEGORIES keywords
- Returns best matching category + subcategory
```

**Filtering:**
- Filter by detected category
- Filter by skills/subcategories

**Notification Trigger:**
- When new professional registers → check if skills match task → notify task creator
- When professional updates skills → check matching tasks → notify task creators

---

### 5. Professionals

**Purpose:** Service providers register to offer services

**Category System:** TASK_CATEGORIES (multi-selection)

**Selection UI:** Multi-select dropdown with chips
- Professional selects service categories they offer
- Example: Handyman selects "Plumbing", "Electrical", "Carpentry"

**Database Storage:**
```javascript
professionals.service_categories = ["plumbing", "electrical-work", "carpentry"]
```

**Filtering:**
- Filter by service category
- Search by skills

**Notification Trigger:**
- When professional registers → check matching open tasks → notify task creators
- When professional updates skills → check matching tasks → notify task creators

---

## 🎯 Category ID Format & Mapping

### PRODUCT_CATEGORIES
```
Main Category ID: "mobiles-accessories" (kebab-case)
Subcategory ID: "smartphones" (kebab-case)

Full path: "mobiles-accessories:smartphones"
```

### TASK_CATEGORIES
```
Main Category ID: "home-services" (kebab-case)
Subcategory ID: "plumbing" (kebab-case)

Full path: "home-services:plumbing"
```

### Database → UI Mapping
```typescript
// Marketplace
listing.category_slug = "mobiles-accessories"
→ Find in PRODUCT_CATEGORIES by id
→ Display: 📱 Mobiles & Accessories

// Wishes
wish.category_ids = ["mobiles-accessories"]
→ Map each ID to PRODUCT_CATEGORIES
→ Display: 📱 Mobiles & Accessories

// Tasks
task.detected_category = "home-services"
→ Find in TASK_CATEGORIES by id
→ Display: 🏠 Home Services

// Professionals
professional.service_categories = ["plumbing"]
→ Find parent category in TASK_CATEGORIES
→ Display: 🏠 Home Services → Plumbing
```

---

## 🚀 Future Enhancements

### 1. Marketplace Subcategory Storage
**Current:** Only stores main category slug
**Planned:** Add `subcategory_id` field to listings table
```sql
ALTER TABLE listings ADD COLUMN subcategory_id TEXT;
```
**Benefit:** Better matching with wishes (e.g., wish for "smartphones" matches listings in "smartphones" subcategory)

### 2. Shops → Wishes Notifications
**Current:** Not implemented
**Planned:** When shop updates catalog, notify matching wish creators
**Implementation:**
```typescript
// In /services/shops.ts - updateShop()
- Get newly added categories
- Find wishes matching these categories
- Send notifications to wish creators
```

### 3. Smart Category Suggestions
**Current:** Users manually select categories
**Planned:** AI suggests categories based on title/description
**Implementation:**
```typescript
// Use OpenAI to analyze listing/wish description
- Input: "Selling iPhone 13 Pro Max 256GB"
- Output: "mobiles-accessories" → "smartphones"
```

### 4. Cross-Category Matching
**Current:** Exact category match only
**Planned:** Related category matching
**Example:**
- Wish: "Gaming laptop"
- Matches: Listings in "Laptops" AND "Gaming consoles"

---

## 📊 Category Statistics

### PRODUCT_CATEGORIES
- **Total Main Categories:** 18
- **Total Subcategories:** ~90
- **Average Subcategories per Category:** 5

### TASK_CATEGORIES
- **Total Main Categories:** 15
- **Total Subcategories:** ~75
- **Average Subcategories per Category:** 5
- **Subcategories with Keywords:** ~60 (80%)

---

## 🔧 Technical Implementation

### Category Selector Components

**ProductCategorySelector** (`/components/ProductCategorySelector.tsx`)
- Used by: Wishes, Shops
- Multi-select with checkboxes
- Expandable subcategories
- Auto-selection logic (select parent = select all children)

**MarketplaceCategorySelector** (`/components/MarketplaceCategorySelector.tsx`)
- Used by: Marketplace (Buy&Sell)
- Single-select with radio buttons
- Expandable subcategories
- Closes modal on selection

### AI Categorization Flow
```typescript
// 1. User creates task with description
createTask({ description: "Need plumber for bathroom sink" })

// 2. AI categorization triggered
const { category, subcategory } = await categorizeTask(description)

// 3. Store in database
task.detected_category = "home-services"
task.detected_subcategory = "plumbing"

// 4. Notification matching
const professionals = await findMatchingProfessionals(task)
await sendNotifications(professionals, task)
```

---

## 📝 Notes

- **CRITICAL:** Never mix PRODUCT_CATEGORIES with TASK_CATEGORIES
- **CRITICAL:** Always validate category IDs against the correct category system
- **Performance:** Category data is loaded once and cached (static imports)
- **Backward Compatibility:** Old marketplace listings using database categories still work via fallback logic
- **RLS Policies:** Uses x-client-token authentication, NOT Supabase Auth

---

## 🐛 Common Issues & Solutions

### Issue 1: Category not showing in filters
**Cause:** Category ID mismatch between database and PRODUCT_CATEGORIES
**Solution:** Ensure database uses kebab-case IDs matching PRODUCT_CATEGORIES

### Issue 2: Notifications not sent for matching listings
**Cause:** Category slug vs category ID mismatch
**Solution:** Use category.id (not category.slug) for matching

### Issue 3: AI categorization returns wrong category
**Cause:** Missing or poor keywords in TASK_CATEGORIES
**Solution:** Add more relevant keywords to subcategory definitions

---

## 📞 Contact

For questions about category systems or cross-module matching, refer to:
- `/services/productCategories.ts` - Product category definitions
- `/services/taskCategories.ts` - Task/service category definitions
- `/services/notifications.ts` - Wish-Marketplace matching logic
- `/services/professionalNotifications.ts` - Task-Professional matching logic

