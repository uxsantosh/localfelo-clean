# 📋 PRODUCT CATEGORIES - PENDING TASKS

## ✅ COMPLETED
- ✅ Database migration run successfully
- ✅ `product_categories` table created (19 main + 115 subcategories)
- ✅ `wishes` table updated with `subcategory_id` and `product_name`
- ✅ Service layer created (`/services/productCategories.ts`)
- ✅ UI component created (`/components/ProductCategorySelector.tsx`)

---

## 🚧 PENDING WORK

### 1️⃣ UPDATE WISHES SERVICE
**File**: `/services/wishes.ts`

#### A. Update CreateWishData interface
```typescript
interface CreateWishData {
  // ... existing fields
  subcategoryId?: string;  // NEW
  productName?: string;    // NEW
}
```

#### B. Update createWish function
```typescript
const { data, error } = await supabase
  .from('wishes')
  .insert({
    // ... existing fields
    subcategory_id: wishData.subcategoryId || null,  // NEW
    product_name: wishData.productName || null,      // NEW
  })
```

#### C. Update editWish function
```typescript
const { error } = await supabase
  .from('wishes')
  .update({
    // ... existing fields
    subcategory_id: wishData.subcategoryId || null,  // NEW
    product_name: wishData.productName || null,      // NEW
  })
```

---

### 2️⃣ UPDATE CREATE WISH SCREEN
**File**: `/screens/CreateWishScreen.tsx`

#### A. Add state for product categories (ALREADY DONE ✅)
```typescript
const [productCategoryId, setProductCategoryId] = useState<string>('');
const [productSubcategoryId, setProductSubcategoryId] = useState<string>('');
const [productName, setProductName] = useState<string>('');
const [wishIntent, setWishIntent] = useState<'help' | 'buy' | 'rent' | 'deal' | null>(null);
```

#### B. Add ProductCategorySelector UI (AFTER wish text input)
```typescript
{/* Product Category Selector - Show for buy/rent/deal wishes */}
{wishIntent && ['buy', 'rent', 'deal'].includes(wishIntent) && (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2">Product Category</label>
    <ProductCategorySelector
      selectedCategoryId={productCategoryId}
      selectedSubcategoryId={productSubcategoryId}
      productName={productName}
      onSelect={handleProductCategorySelect}
      className="w-full"
    />
  </div>
)}
```

#### C. Update handleSubmit to include product categories
```typescript
const result = await createWish({
  // ... existing fields
  categoryId: productCategoryId || undefined,
  subcategoryId: productSubcategoryId || undefined,
  productName: productName || undefined,
});
```

---

### 3️⃣ UPDATE WISHES FILTER
**File**: `/screens/WishesScreen.tsx` (or wherever filters are)

#### A. Add state for subcategory filter
```typescript
const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
const [subcategories, setSubcategories] = useState<ProductSubcategory[]>([]);
```

#### B. Load subcategories when main category selected
```typescript
useEffect(() => {
  if (selectedMainCategory) {
    getProductSubcategories(selectedMainCategory).then(setSubcategories);
  } else {
    setSubcategories([]);
    setSelectedSubcategory('');
  }
}, [selectedMainCategory]);
```

#### C. Add subcategory filter UI
```typescript
{/* Subcategory Filter - Show when main category selected */}
{selectedMainCategory && subcategories.length > 0 && (
  <select
    value={selectedSubcategory}
    onChange={(e) => setSelectedSubcategory(e.target.value)}
    className="px-3 py-2 border-2 border-black rounded-lg"
  >
    <option value="">All Subcategories</option>
    {subcategories.map(sub => (
      <option key={sub.id} value={sub.id}>
        {sub.emoji} {sub.name}
      </option>
    ))}
  </select>
)}
```

#### D. Update filter query
```typescript
let query = supabase.from('wishes').select('*');

// Filter by main category
if (selectedMainCategory) {
  query = query.eq('category_id', selectedMainCategory);
}

// Filter by subcategory
if (selectedSubcategory) {
  query = query.eq('subcategory_id', selectedSubcategory);
}
```

---

### 4️⃣ UPDATE WISH DISPLAY/PILLS
**File**: `/components/WishCard.tsx` or wherever wishes are displayed

#### A. Add category path display
```typescript
import { getProductCategoryPath } from '../services/productCategories';

// In component:
const [categoryPath, setCategoryPath] = useState('');

useEffect(() => {
  if (wish.categoryId) {
    getProductCategoryPath(wish.categoryId, wish.subcategoryId)
      .then(path => setCategoryPath(path));
  }
}, [wish.categoryId, wish.subcategoryId]);
```

#### B. Display category pill
```typescript
{/* Category Pill */}
{categoryPath && (
  <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#CDFF00] border border-black rounded text-xs font-medium">
    {categoryPath}
    {wish.productName && ` • ${wish.productName}`}
  </div>
)}
```

---

### 5️⃣ UPDATE MARKETPLACE LISTING SERVICE
**File**: `/services/marketplace.ts` (if it exists)

Same updates as wishes service:
- Add `subcategoryId` and `productName` to CreateListingData interface
- Update `createListing` to save these fields
- Update `editListing` to save these fields

---

### 6️⃣ UPDATE CREATE LISTING SCREEN
**File**: `/screens/CreateListingScreen.tsx` (if it exists)

Same updates as CreateWishScreen:
- Add ProductCategorySelector
- Save subcategory_id and product_name
- No need for intent detection (all marketplace items are products)

---

### 7️⃣ UPDATE MARKETPLACE FILTER
**File**: `/screens/MarketplaceScreen.tsx` (if it exists)

Same updates as WishesScreen:
- Add subcategory filter
- Update query to filter by subcategory

---

### 8️⃣ UPDATE MARKETPLACE DISPLAY
**File**: `/components/ListingCard.tsx` (if it exists)

Same updates as WishCard:
- Show category path
- Show product_name if available

---

### 9️⃣ UPDATE SEARCH QUERIES

#### Wishes Search
```typescript
const { data } = await supabase
  .from('wishes')
  .select('*')
  .or(`
    title.ilike.%${query}%,
    description.ilike.%${query}%,
    product_name.ilike.%${query}%
  `);
```

#### Marketplace Search
```typescript
const { data } = await supabase
  .from('marketplace_listings')
  .select('*')
  .or(`
    title.ilike.%${query}%,
    description.ilike.%${query}%,
    product_name.ilike.%${query}%
  `);
```

---

## 🎯 PRIORITY ORDER

### HIGH PRIORITY (Do First)
1. ✅ Update wishes service (`/services/wishes.ts`) - **CRITICAL**
2. ✅ Update CreateWishScreen - **USER-FACING**
3. ✅ Update wish display/pills - **USER-FACING**

### MEDIUM PRIORITY
4. ✅ Update wishes filter - **UX IMPROVEMENT**
5. ✅ Update search queries - **UX IMPROVEMENT**

### LOW PRIORITY (When marketplace exists)
6. ⏳ Update marketplace service
7. ⏳ Update CreateListingScreen
8. ⏳ Update marketplace filter
9. ⏳ Update marketplace display

---

## 📝 TESTING CHECKLIST

After each update, test:

### Wish Creation
- [ ] Type "looking for iPhone" → intent detected as "buy"
- [ ] ProductCategorySelector appears
- [ ] Select "Mobiles & Accessories" → subcategories load
- [ ] Select "Smartphones" → wish created
- [ ] Check database: `subcategory_id` saved correctly
- [ ] Select "Other" → custom name input appears
- [ ] Enter custom name → `product_name` saved

### Wish Display
- [ ] Wish card shows "📱 Mobiles & Accessories > Smartphones"
- [ ] "Other" items show custom product_name
- [ ] Old wishes (without subcategory) still display

### Wish Filtering
- [ ] Filter by main category → shows correct wishes
- [ ] Filter by subcategory → narrows results
- [ ] Clear filters → shows all wishes
- [ ] Filters work with old data

### Search
- [ ] Search "smartphone" → finds wishes with that subcategory
- [ ] Search custom product_name → finds wishes
- [ ] Search still works for old wishes

---

## 🚀 QUICK START

Start with **wishes only**, then add marketplace later:

```bash
# 1. Update wishes service
# Edit: /services/wishes.ts
# Add: subcategoryId, productName to interface and functions

# 2. Update CreateWishScreen  
# Edit: /screens/CreateWishScreen.tsx
# Add: ProductCategorySelector component

# 3. Update wish display
# Edit: /components/WishCard.tsx or similar
# Add: Category path display

# 4. Update filters
# Edit: /screens/WishesScreen.tsx
# Add: Subcategory filter dropdown

# 5. Test everything!
```

---

## 📁 FILES TO EDIT

### MUST EDIT (Wishes)
- [ ] `/services/wishes.ts` - Add subcategory fields
- [ ] `/screens/CreateWishScreen.tsx` - Add ProductCategorySelector
- [ ] `/components/WishCard.tsx` - Show category path
- [ ] `/screens/WishesScreen.tsx` - Add subcategory filter

### OPTIONAL (Marketplace - when ready)
- [ ] `/services/marketplace.ts` - Add subcategory fields
- [ ] `/screens/CreateListingScreen.tsx` - Add ProductCategorySelector
- [ ] `/components/ListingCard.tsx` - Show category path
- [ ] `/screens/MarketplaceScreen.tsx` - Add subcategory filter

---

Ready to start implementing? Let's do it! 🚀
