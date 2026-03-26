# 🏪 SHOPS MODULE - IMPLEMENTATION GUIDE

## ✅ COMPLETED COMPONENTS

### **1. Database Service (`/services/shops.ts`)**
Complete CRUD operations for shops:
- ✅ `createShop()` - Register new shop with categories
- ✅ `getAllShops()` - List all shops with filters (category, distance)
- ✅ `getShopById()` - Get shop details with products
- ✅ `getUserShops()` - Get current user's shops
- ✅ `updateShop()` - Update shop details
- ✅ `addProduct()` - Add products to shop
- ✅ `updateProduct()` - Update product details
- ✅ `deleteProduct()` - Delete product
- ✅ `getShopsByCategory()` - SEO category pages
- ✅ Distance calculation helper

### **2. UI Components**

#### **ShopCard (`/components/ShopCard.tsx`)**
Creative shop-style card design:
- ✅ Roof/canopy design at top (#CDFF00)
- ✅ Door animation on hover (shimmer effect)
- ✅ Shop logo/placeholder display
- ✅ Address with distance
- ✅ Category tags
- ✅ Responsive mobile tap animation

#### **ShopsScreen (`/screens/ShopsScreen.tsx`)**
Main listing page:
- ✅ All shops grid display
- ✅ Category & subcategory filters
- ✅ Distance sorting
- ✅ Location-based display
- ✅ Register Shop CTA button
- ✅ Empty state with CTA
- ✅ Login required check

#### **ShopDetailsScreen (`/screens/ShopDetailsScreen.tsx`)**
Individual shop page:
- ✅ Shop header with logo & gallery
- ✅ Address and location display
- ✅ Category badges
- ✅ Products grid
- ✅ Chat button (login required)
- ✅ WhatsApp button (login required)
- ✅ Image gallery with selection
- ✅ SEO-friendly URL structure

#### **RegisterShopScreen (`/screens/RegisterShopScreen.tsx`)**
Multi-step registration flow:
- ✅ Step 1: Shop Name
- ✅ Step 2: Categories (multi-select)
- ✅ Step 3: Location (address, lat/lng)
- ✅ Step 4: Products (add multiple)
- ✅ Optional: Logo upload
- ✅ Optional: WhatsApp number
- ✅ Product form (name, price, 2 images max)
- ✅ Progress indicator
- ✅ Validation at each step

### **3. Navigation Integration**

#### **Header Component (`/components/Header.tsx`)**
- ✅ Added `shops` to navigation type definition
- ✅ Added "Shops" tab in desktop secondary nav
- ✅ Added `Store` icon import
- ✅ Updated `isMainScreen` check to include 'shops'

---

## 📋 REMAINING INTEGRATION TASKS

### **1. Add to App.tsx Routing**

Add these to your App.tsx:

```typescript
// Import screens (add to imports section)
import { ShopsScreen } from './screens/ShopsScreen';
import { ShopDetailsScreen } from './screens/ShopDetailsScreen';
import { RegisterShopScreen } from './screens/RegisterShopScreen';

// Add to Screen type (line ~88)
type Screen = 
  | 'home' 
  | 'marketplace'
  // ... existing screens ...
  | 'shops'
  | 'shop-details'
  | 'register-shop'
  | 'edit-shop';

// Add to getScreenFromPath function (line ~127)
function getScreenFromPath(path: string): Screen {
  if (path === '/') return 'home';
  if (path.startsWith('/listing/')) return 'listing';
  // ... existing paths ...
  if (path.startsWith('/shop/')) return 'shop-details';
  if (path.startsWith('/edit-shop/')) return 'edit-shop';
  
  const screenMap: Record<string, Screen> = {
    // ... existing mappings ...
    '/shops': 'shops',
    '/register-shop': 'register-shop',
  };
  
  return screenMap[path] || 'home';
}

// Add to screen rendering section (inside renderScreen function)
case 'shops':
  return (
    <ShopsScreen 
      onNavigate={handleNavigation}
    />
  );

case 'shop-details':
  return (
    <ShopDetailsScreen
      onNavigate={handleNavigation}
      shopId={navigationData?.shopId || ''}
      slug={navigationData?.slug}
    />
  );

case 'register-shop':
  return (
    <RegisterShopScreen
      onNavigate={handleNavigation}
    />
  );
```

### **2. Add to Mobile Menu (MobileMenuSheet.tsx)**

Find the menu items section and add:

```typescript
<button
  onClick={() => {
    onNavigate('shops');
    onClose();
  }}
  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors rounded-lg"
>
  <Store className="w-5 h-5 text-gray-700" />
  <span className="font-medium text-black">Shops</span>
</button>
```

### **3. Database Tables (Supabase)**

Create these tables in your Supabase database:

```sql
-- Shops table
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  logo_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  whatsapp_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shop categories (many-to-many)
CREATE TABLE shop_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  subcategory_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shop_id, category_id, subcategory_id)
);

-- Shop products
CREATE TABLE shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_shops_user_id ON shops(user_id);
CREATE INDEX idx_shops_is_active ON shops(is_active);
CREATE INDEX idx_shops_location ON shops USING gist(ll_to_earth(latitude, longitude));
CREATE INDEX idx_shop_categories_shop_id ON shop_categories(shop_id);
CREATE INDEX idx_shop_categories_category_id ON shop_categories(category_id);
CREATE INDEX idx_shop_products_shop_id ON shop_products(shop_id);
CREATE INDEX idx_shop_products_is_active ON shop_products(is_active);
```

### **4. RLS Policies**

```sql
-- Shops - Public read, owner write
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active shops"
  ON shops FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create shops"
  ON shops FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shops"
  ON shops FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Shop categories - Follow shop permissions
ALTER TABLE shop_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view shop categories"
  ON shop_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_categories.shop_id 
      AND shops.is_active = true
    )
  );

CREATE POLICY "Shop owners can manage categories"
  ON shop_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_categories.shop_id 
      AND shops.user_id = auth.uid()
    )
  );

-- Shop products - Follow shop permissions
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active products"
  ON shop_products FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_products.shop_id 
      AND shops.is_active = true
    )
  );

CREATE POLICY "Shop owners can manage products"
  ON shop_products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_products.shop_id 
      AND shops.user_id = auth.uid()
    )
  );
```

---

## 🎯 SEO IMPLEMENTATION

### **Category Pages**

Create dynamic routes for SEO:

```typescript
// Add to getScreenFromPath
if (path.startsWith('/shops/')) {
  const categorySlug = path.replace('/shops/', '');
  return 'shops-category';
}

// Create ShopsCategoryScreen component
export function ShopsCategoryScreen({ 
  categoryId, 
  onNavigate 
}: ShopsCategoryScreenProps) {
  const [shops, setShops] = useState<ShopWithCategories[]>([]);
  
  useEffect(() => {
    loadShopsByCategory(categoryId);
    
    // SEO
    const category = PRODUCT_CATEGORIES.find(c => c.id === categoryId);
    updateSEO({
      title: `${category?.name} Shops Near You - LocalFelo`,
      description: `Find local ${category?.name} shops and businesses in your area`,
      canonical: `https://localfelo.com/shops/${categoryId}`
    });
  }, [categoryId]);
  
  // ... rest of implementation
}
```

### **Shop Details SEO**

```typescript
// In ShopDetailsScreen, add SEO meta
useEffect(() => {
  if (shop) {
    updateSEO({
      title: `${shop.shop_name} - LocalFelo`,
      description: `${shop.shop_name} at ${shop.address}. Browse products and contact directly.`,
      canonical: `https://localfelo.com/shop/${slug}-${shopId}`
    });
  }
}, [shop]);
```

---

## 📱 MOBILE MENU INTEGRATION

Add to the animated bottom popup (look for existing Tasks, Wishes, etc.):

```typescript
{
  id: 'shops',
  icon: Store,
  label: 'Shops',
  description: 'Local businesses',
  onClick: () => handleNavigation('shops')
}
```

---

## 🔄 WISH MATCHING INTEGRATION

### **Update Wish Matching Logic**

In your wish matching service, add shops to notifications:

```typescript
// When a new Wish is created with product type
async function notifyMatchingShops(wish: Wish) {
  // Get shops that match the category
  const { shops } = await getAllShops({
    category_id: wish.category_id,
    subcategory_id: wish.subcategory_id,
  });
  
  // Send notifications to shop owners
  for (const shop of shops) {
    await createNotification({
      user_id: shop.user_id,
      type: 'wish_match',
      title: 'New Wish matches your shop!',
      message: `Someone is looking for ${wish.title}`,
      link: `/wish-detail/${wish.id}`,
      metadata: { wish_id: wish.id, shop_id: shop.id }
    });
  }
}
```

---

## 🎨 DESIGN NOTES

### **Shop Card Animation**

The ShopCard component features:
1. **Roof design** - Green gradient canopy with decorative dots
2. **Hover effect** - Shimmer animation across image
3. **Door accent** - Bottom green line appears on hover
4. **Shadow lift** - Card elevates with shadow

### **Color Scheme**
- Primary: `#CDFF00` (bright green)
- Secondary: `#B8E600` (darker green)
- Text: Black on white
- Accents: Gray for secondary information

### **Typography**
- Font: Inter (system default)
- Shop name: Bold, 16px
- Address: Regular, 12px
- Distance: Medium, 12px, green color

---

## ✅ TESTING CHECKLIST

### **Functionality**
- [ ] Register shop flow works end-to-end
- [ ] Products can be added/edited/deleted
- [ ] Shop details page displays correctly
- [ ] Category filtering works
- [ ] Distance calculation is accurate
- [ ] Location-based sorting works
- [ ] Images upload successfully
- [ ] WhatsApp link opens correctly
- [ ] Chat integration works
- [ ] Login requirement enforced

### **UI/UX**
- [ ] Shop cards display properly on all screen sizes
- [ ] Hover animations work smoothly
- [ ] Mobile tap feedback is responsive
- [ ] Empty states are helpful
- [ ] Loading states show correctly
- [ ] Error messages are clear
- [ ] Navigation flows logically

### **SEO**
- [ ] Meta tags render correctly
- [ ] Category pages are indexable
- [ ] Shop detail URLs are clean
- [ ] Canonical URLs are set
- [ ] H1/H2 tags are semantic

---

## 🚀 DEPLOYMENT STEPS

1. **Database Setup**
   - Run table creation scripts
   - Apply RLS policies
   - Test with sample data

2. **Code Integration**
   - Add imports to App.tsx
   - Add routing logic
   - Add mobile menu item
   - Test navigation

3. **SEO Setup**
   - Add category routes
   - Configure meta tags
   - Submit sitemap

4. **Testing**
   - Test registration flow
   - Test product management
   - Test filtering
   - Test on mobile devices

5. **Launch**
   - Enable for limited users
   - Monitor for issues
   - Collect feedback
   - Iterate

---

## 📊 METRICS TO TRACK

1. **Shop Registration**
   - Number of shops registered
   - Registration completion rate
   - Time to complete registration

2. **User Engagement**
   - Shop profile views
   - Product views
   - Chat initiations from shops
   - WhatsApp click-through rate

3. **Matching Success**
   - Wishes matched to shops
   - Conversion rate (view → contact)
   - Response time from shops

4. **SEO Performance**
   - Organic traffic to category pages
   - Organic traffic to shop pages
   - Search rankings for local shop keywords

---

## 🎯 FUTURE ENHANCEMENTS

### **Phase 2 Features**
- [ ] Shop verification badge
- [ ] Shop ratings & reviews
- [ ] Operating hours display
- [ ] Shop photos carousel
- [ ] Product search within shop
- [ ] Shop analytics dashboard
- [ ] Bulk product upload
- [ ] Shop categories management

### **Phase 3 Features**
- [ ] Promoted shops (paid)
- [ ] Shop performance insights
- [ ] Advanced filtering (open now, rating, etc.)
- [ ] Shop to shop messaging
- [ ] Product comparison
- [ ] Wishlist for products

---

## 📞 SUPPORT

For implementation questions:
- Check existing component patterns
- Follow LocalFelo design system
- Ensure backward compatibility
- Test on mobile first

---

## ✨ SUMMARY

The Shops module is **90% complete**. Remaining tasks:

1. ✅ **DONE**: Services, components, screens
2. ⏳ **PENDING**: App.tsx routing integration
3. ⏳ **PENDING**: Mobile menu addition
4. ⏳ **PENDING**: Database setup
5. ⏳ **PENDING**: Wish matching integration

**Estimated time to complete**: 2-3 hours

**Priority order**:
1. Database tables & RLS
2. App.tsx routing
3. Mobile menu
4. Testing
5. Wish matching
6. SEO optimization

