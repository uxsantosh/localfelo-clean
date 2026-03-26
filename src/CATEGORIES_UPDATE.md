# Categories Update - Backend Integration

## Overview
Updated OldCycle to fetch categories dynamically from Supabase backend instead of using hardcoded constants. Added two new categories: **Real Estate** and **Jobs**.

## Changes Made

### 1. New Categories Added
- **Real Estate** 🏢 (ID: 13, slug: `real-estate`)
- **Jobs** 💼 (ID: 14, slug: `jobs`)

### 2. Services Updated
- **`/services/categories.js`**
  - Updated emoji mapping to include Real Estate (🏢) and Jobs (💼)
  - Updated fallback categories array with new categories

### 3. Constants Updated
- **`/constants/categories.ts`**
  - Added Real Estate and Jobs to the fallback constants
  - This serves as a backup if backend is unavailable

### 4. Screens Updated
All screens now fetch categories dynamically from backend:

- **`/screens/HomeScreen.tsx`**
  - Added `categories` state
  - Fetch categories on mount using `getAllCategories()`
  - Replaced all `CATEGORIES` references with `categories` state
  - Categories pills and filters now use dynamic data

- **`/screens/CreateListingScreen.tsx`**
  - Added `categories` state
  - Fetch categories on mount
  - Category selection grid now uses dynamic data

- **`/screens/EditListingScreen.tsx`**
  - Added `categories` state
  - Fetch categories on mount
  - Category dropdown now uses dynamic data

- **`/screens/ProfileScreen.tsx`**
  - Added `categories` state
  - Fetch categories on mount
  - Listing transformation uses dynamic categories
  - Added categories dependency to user listings useEffect

### 5. Database Migration
- **`/migrations/add_real_estate_jobs_categories.sql`**
  - SQL script to add new categories to Supabase
  - Idempotent design (safe to run multiple times)

## How to Apply

### Step 1: Run Database Migration
```sql
-- Copy and paste this in Supabase SQL Editor
INSERT INTO categories (id, name, slug)
VALUES 
  (13, 'Real Estate', 'real-estate'),
  (14, 'Jobs', 'jobs')
ON CONFLICT (id) DO NOTHING;
```

### Step 2: Deploy Frontend
The frontend changes are already complete and will automatically:
1. Fetch categories from Supabase on each screen load
2. Display new categories in all relevant UI elements
3. Fall back to hardcoded categories if backend fails

## Benefits

1. **Dynamic Categories**: Categories can be added/modified in database without code changes
2. **Consistent Emojis**: Emojis are managed client-side for consistent display
3. **Graceful Fallback**: If backend fails, app falls back to hardcoded categories
4. **Better UX**: New categories (Real Estate & Jobs) expand platform utility
5. **Scalable**: Easy to add more categories in the future

## Testing Checklist

- [ ] Run database migration in Supabase
- [ ] Verify new categories appear in HomeScreen category pills
- [ ] Test category filtering with new categories
- [ ] Create a listing in Real Estate category
- [ ] Create a listing in Jobs category
- [ ] Verify categories display correctly in listing cards
- [ ] Test edit listing with new categories
- [ ] Verify profile screen shows listings with new categories correctly

## Emoji Reference

| Category | Emoji | Slug |
|----------|-------|------|
| Mobile Phones | 📱 | mobile-phones |
| Cars & Bikes | 🚗 | vehicles |
| Computers & Laptops | 🖥️ | computers-laptops |
| Furniture | 🪑 | furniture |
| Home & Living | 🏠 | home-living |
| Fashion | 👗 | fashion |
| Kids & Baby Items | 🧒 | kids-baby |
| Pets | 🐶 | pets |
| Books & Education | 📚 | books-education |
| Gaming | 🎮 | gaming |
| Tools & Equipment | ⚙️ | tools-equipment |
| Kitchen & Appliances | 🍽️ | kitchen-appliances |
| **Real Estate** | **🏢** | **real-estate** |
| **Jobs** | **💼** | **jobs** |
