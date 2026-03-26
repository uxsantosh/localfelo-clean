# LocalFelo Category Matching Reference

## Overview
This document maps how categories are used across different modules for the matching and notification engine.

---

## Category System Architecture

### 1. Product Categories (Shops, Marketplace, Wishes - Product Type)
**Source**: `/services/productCategories.ts`
**Usage**: Shops module, Buy&Sell module, Wishes module (product type)

#### Structure:
```typescript
{
  id: string,              // e.g., "mobiles-accessories"
  name: string,            // e.g., "Mobiles & Accessories"
  emoji: string,           // e.g., "📱"
  subcategories: [{
    id: string,            // e.g., "smartphones"
    name: string           // e.g., "Smartphones"
  }]
}
```

#### Database Storage:
```sql
-- Shops store categories in shop_categories table
shop_categories (
  id UUID,
  shop_id UUID,
  category_id TEXT,        -- Main category ID
  subcategory_id TEXT      -- Subcategory ID (nullable)
)

-- Products can have user-created categories for internal organization
shop_products (
  category VARCHAR(100)    -- User-created category like "Dals", "Rice"
)
```

---

## Matching Flows

### Flow 1: WISH (Product Type) → SHOPS + MARKETPLACE

**When**: User creates wish type "Looking to buy"

**Matching Logic**:
```javascript
// User creates wish
{
  type: "product",
  category_id: "mobiles-accessories",
  subcategory_id: "smartphones",
  location: { lat: 28.6139, lng: 77.2090 }
}

// Match with shops
SELECT s.* FROM shops s
JOIN shop_categories sc ON s.id = sc.shop_id
WHERE sc.category_id = 'mobiles-accessories'
  AND sc.subcategory_id = 'smartphones'
  AND calculate_distance(s.latitude, s.longitude, 28.6139, 77.2090) <= 10

// Match with marketplace listings
SELECT m.* FROM marketplace_listings m
WHERE m.category_id = 'mobiles-accessories'
  AND (m.subcategory_id = 'smartphones' OR m.subcategory_id IS NULL)
```

**Notifications Sent To**:
- Shop owners with matching category/subcategory
- Marketplace sellers with matching category

**Notification Content**:
```
"Someone is looking for a Mobile Phone near you"
[View Details] button
```

---

### Flow 2: MARKETPLACE LISTING → WISH SEEKERS

**When**: User posts item for sale

**Matching Logic**:
```javascript
// User posts listing
{
  type: "sell",
  category_id: "mobiles-accessories",
  subcategory_id: "smartphones",
  title: "iPhone 14 Pro"
}

// Match with active wishes
SELECT w.* FROM wishes w
WHERE w.type = 'product'
  AND w.category_id = 'mobiles-accessories'
  AND (w.subcategory_id = 'smartphones' OR w.subcategory_id IS NULL)
  AND w.status = 'active'
```

**Notifications Sent To**:
- Users with active wishes matching the category

**Notification Content**:
```
"iPhone 14 Pro is now available near you"
[View Listing] button
```

---

### Flow 3: SHOP REGISTRATION → WISH SEEKERS

**When**: New shop registers with specific categories

**Matching Logic**:
```javascript
// Shop registers
{
  shop_name: "Ram Mobile Shop",
  categories: [
    { category_id: "mobiles-accessories", subcategory_id: "smartphones" },
    { category_id: "mobiles-accessories", subcategory_id: "mobile-parts" }
  ]
}

// Match with active wishes
SELECT w.* FROM wishes w
WHERE w.type = 'product'
  AND w.category_id = 'mobiles-accessories'
  AND w.subcategory_id IN ('smartphones', 'mobile-parts')
  AND w.status = 'active'
  AND calculate_distance(w.latitude, w.longitude, shop.latitude, shop.longitude) <= 10
```

**Notifications Sent To**:
- Users with wishes matching shop categories
- Within 10km radius

**Notification Content**:
```
"Ram Mobile Shop now sells Mobile Phones near you"
[View Shop] button
```

---

## Complete Category List (19 Categories)

### 1. 📱 Mobiles & Accessories
```javascript
{
  id: "mobiles-accessories",
  subcategories: [
    "smartphones",
    "feature-phones",
    "chargers-cables",
    "earphones-headphones",
    "smartwatches",
    "mobile-parts",
    "mobile-other"
  ]
}
```

### 2. 💻 Laptops & Computers
```javascript
{
  id: "laptops-computers",
  subcategories: [
    "laptops",
    "desktops",
    "computer-accessories",
    "printers-scanners",
    "storage-devices",
    "networking-devices",
    "computer-other"
  ]
}
```

### 3. 📺 Electronics & Gadgets
```javascript
{
  id: "electronics-gadgets",
  subcategories: [
    "televisions",
    "speakers-audio",
    "cameras",
    "gaming-consoles",
    "smart-devices",
    "electronics-other"
  ]
}
```

### 4. 🏠 Home Appliances
```javascript
{
  id: "home-appliances",
  subcategories: [
    "refrigerators",
    "washing-machines",
    "air-conditioners",
    "microwave-ovens",
    "water-purifiers",
    "kitchen-appliances",
    "geysers-heaters",
    "appliances-other"
  ]
}
```

### 5. 🛋️ Furniture
```javascript
{
  id: "furniture",
  subcategories: [
    "beds-mattresses",
    "sofas-chairs",
    "tables-desks",
    "wardrobes-storage",
    "office-furniture",
    "furniture-other"
  ]
}
```

### 6. 🍳 Home & Kitchen
```javascript
{
  id: "home-kitchen",
  subcategories: [
    "cookware",
    "home-decor",
    "lighting",
    "curtains-furnishings",
    "storage-organizers",
    "home-kitchen-other"
  ]
}
```

### 7. 👕 Fashion & Clothing
```javascript
{
  id: "fashion-clothing",
  subcategories: [
    "mens-clothing",
    "womens-clothing",
    "kids-clothing",
    "footwear",
    "bags-wallets",
    "fashion-accessories",
    "fashion-other"
  ]
}
```

### 8. 💄 Beauty & Personal Care
```javascript
{
  id: "beauty-personal-care",
  subcategories: [
    "skincare",
    "hair-care",
    "makeup",
    "grooming-tools",
    "perfumes",
    "beauty-other"
  ]
}
```

### 9. 💪 Health & Fitness
```javascript
{
  id: "health-fitness",
  subcategories: [
    "fitness-equipment",
    "gym-accessories",
    "supplements",
    "medical-devices",
    "health-other"
  ]
}
```

### 10. 📚 Books & Stationery
```javascript
{
  id: "books-stationery",
  subcategories: [
    "academic-books",
    "exam-prep-books",
    "novels",
    "stationery",
    "books-other"
  ]
}
```

### 11. ⚽ Sports & Outdoors
```javascript
{
  id: "sports-outdoors",
  subcategories: [
    "sports-equipment",
    "outdoor-gear",
    "cycles",
    "fitness-gear",
    "sports-other"
  ]
}
```

### 12. 🚗 Vehicles
```javascript
{
  id: "vehicles",
  subcategories: [
    "cars",
    "bikes-scooters",
    "electric-vehicles",
    "vehicle-accessories",
    "spare-parts",
    "vehicles-other"
  ]
}
```

### 13. 🏘️ Real Estate
```javascript
{
  id: "real-estate",
  subcategories: [
    "flats-for-sale",
    "houses-for-sale",
    "plots-land",
    "commercial-property",
    "real-estate-other"
  ]
}
```

### 14. 🔄 Rentals
```javascript
{
  id: "rentals",
  subcategories: [
    "electronics-on-rent",
    "furniture-on-rent",
    "vehicles-on-rent",
    "event-items",
    "rentals-other"
  ]
}
```

### 15. 🐾 Pet Supplies
```javascript
{
  id: "pet-supplies",
  subcategories: [
    "pet-food",
    "pet-accessories",
    "beds-cages",
    "grooming-products",
    "pet-other"
  ]
}
```

### 16. 👶 Baby & Kids
```javascript
{
  id: "baby-kids",
  subcategories: [
    "baby-products",
    "toys",
    "school-supplies",
    "baby-kids-other"
  ]
}
```

### 17. 🏭 Industrial & Business
```javascript
{
  id: "industrial-business",
  subcategories: [
    "machinery",
    "tools",
    "shop-supplies",
    "office-supplies",
    "industrial-other"
  ]
}
```

### 18. 🛒 Food & Grocery
```javascript
{
  id: "food-grocery",
  subcategories: [
    "fresh-groceries",
    "packaged-food",
    "homemade-food",
    "beverages",
    "food-other"
  ]
}
```

### 19. 📦 Other
```javascript
{
  id: "other",
  subcategories: [
    "other-items"
  ]
}
```

---

## Matching Rules Summary

### ✅ MUST Use:
- `category_id` - Main category identifier
- `subcategory_id` - Specific subcategory identifier
- `location` (lat/lng) - For proximity matching

### ❌ DO NOT Use:
- `role` - Not used for matching
- `keywords` - Not used for deterministic matching
- AI guessing - Matching must be exact

### Location Logic:
```javascript
// Calculate distance
function calculateDistance(lat1, lng1, lat2, lng2) {
  // Haversine formula
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Default radius: 5-10 km
const DEFAULT_MATCHING_RADIUS = 10; // km
```

---

## Database Indexes for Performance

```sql
-- Shops module
CREATE INDEX idx_shop_categories_category ON shop_categories(category_id);
CREATE INDEX idx_shop_categories_subcategory ON shop_categories(subcategory_id);
CREATE INDEX idx_shop_categories_combined ON shop_categories(category_id, subcategory_id);

-- Marketplace module  
CREATE INDEX idx_marketplace_category ON marketplace_listings(category_id);
CREATE INDEX idx_marketplace_subcategory ON marketplace_listings(subcategory_id);

-- Wishes module
CREATE INDEX idx_wishes_category ON wishes(category_id);
CREATE INDEX idx_wishes_subcategory ON wishes(subcategory_id);
CREATE INDEX idx_wishes_status ON wishes(status) WHERE status = 'active';

-- Location-based indexes
CREATE INDEX idx_shops_location ON shops USING GIST (ll_to_earth(latitude, longitude));
CREATE INDEX idx_wishes_location ON wishes USING GIST (ll_to_earth(latitude, longitude));
```

---

## Notification Tracking Schema

```sql
CREATE TABLE notification_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type VARCHAR(50) NOT NULL, -- 'wish', 'listing', 'shop'
  source_id UUID NOT NULL,
  target_type VARCHAR(50) NOT NULL, -- 'shop', 'professional', 'user'
  target_id UUID NOT NULL,
  category_id TEXT NOT NULL,
  subcategory_id TEXT,
  distance_km NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMP
);

CREATE INDEX idx_notification_matches_source ON notification_matches(source_type, source_id);
CREATE INDEX idx_notification_matches_target ON notification_matches(target_type, target_id);
CREATE INDEX idx_notification_matches_pending ON notification_matches(notification_sent) WHERE notification_sent = false;
```

---

## Example Implementation (Pseudo-code)

```javascript
// When user creates a wish for a product
async function onWishCreated(wish) {
  // Match with shops
  const matchingShops = await db.query(`
    SELECT s.*, 
           calculate_distance(s.latitude, s.longitude, $1, $2) as distance
    FROM shops s
    JOIN shop_categories sc ON s.id = sc.shop_id
    WHERE sc.category_id = $3
      AND (sc.subcategory_id = $4 OR $4 IS NULL)
      AND s.is_active = true
      AND calculate_distance(s.latitude, s.longitude, $1, $2) <= $5
    ORDER BY distance ASC
  `, [wish.latitude, wish.longitude, wish.category_id, wish.subcategory_id, 10]);

  // Send notifications
  for (const shop of matchingShops) {
    await sendNotification({
      user_id: shop.user_id,
      type: 'wish_match',
      title: 'New product request near you',
      message: `Someone is looking for ${wish.category_name} near you`,
      data: { wish_id: wish.id, shop_id: shop.id }
    });
  }

  // Match with marketplace listings
  const matchingListings = await db.query(`
    SELECT m.* FROM marketplace_listings m
    WHERE m.category_id = $1
      AND (m.subcategory_id = $2 OR $2 IS NULL)
      AND m.status = 'active'
  `, [wish.category_id, wish.subcategory_id]);

  // Send notifications to wish creator
  if (matchingListings.length > 0) {
    await sendNotification({
      user_id: wish.user_id,
      type: 'listing_match',
      title: 'Products available',
      message: `Found ${matchingListings.length} ${wish.category_name} listings`,
      data: { wish_id: wish.id, listings: matchingListings.map(l => l.id) }
    });
  }
}
```

---

## Testing Checklist

- [ ] Create wish → Receive notifications from matching shops
- [ ] Post listing → Wish creators receive notifications
- [ ] Register shop → Wish creators receive notifications
- [ ] Verify category matching works with subcategories
- [ ] Verify location radius filtering (5-10 km)
- [ ] Test with NULL subcategories (should match parent category)
- [ ] Verify no duplicate notifications
- [ ] Test notification debouncing
- [ ] Verify distance calculation accuracy

---

**Last Updated**: March 23, 2026  
**Status**: Production Ready  
**Version**: 1.0.0
