# 🌱 OldCycle Database Seed Instructions

This will populate your database with **realistic listings** featuring real marketplace-style images and data.

## 📋 What It Creates

- **1 listing per category** in the first 3 cities
- **Real product images** downloaded from Unsplash (marketplace-style photos)
- **Realistic Indian marketplace data**:
  - Proper pricing in ₹
  - Real descriptions like OLX/Facebook Marketplace
  - Category-appropriate content

## 🚀 Quick Start

### Option 1: Using Node.js (Recommended)

1. **Install dependencies**:
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Configure your Supabase credentials** in `seed-listings.js`:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

3. **Run the script**:
   ```bash
   node seed-listings.js
   ```

4. **Wait for completion** (takes 5-10 minutes):
   - Downloads images from Unsplash
   - Uploads to your Supabase Storage
   - Creates listings with proper references

### Option 2: Manual SQL (Faster but No Images)

If you just want data without images, here's a quick SQL script:

```sql
-- Insert sample listings (update category_id, area_id, city_id based on your data)
-- First, get your IDs:
SELECT id, name FROM categories ORDER BY name;
SELECT id, name FROM cities ORDER BY name;
SELECT id, name FROM areas ORDER BY name;

-- Example: Create listings (replace IDs with yours)
INSERT INTO listings (title, description, price, category_id, area_id, city_id, owner_token, status)
VALUES 
  ('iPhone 12 128GB Blue', 'Used iPhone 12 in excellent condition. No scratches, battery health 89%.', 32000, 1, 1, 1, 'SEED_TOKEN', 'active'),
  ('Samsung Galaxy M32', 'Lightly used Samsung Galaxy M32, bought 8 months ago. All accessories included.', 11500, 1, 2, 1, 'SEED_TOKEN', 'active'),
  ('Dell Laptop i5 8th Gen', 'Dell Inspiron 15 laptop in good working condition. i5 8th gen, 8GB RAM.', 28000, 2, 1, 1, 'SEED_TOKEN', 'active');

-- Add image URLs (use placeholder or your own hosted images)
INSERT INTO listing_images (listing_id, image_url, display_order)
VALUES 
  (1, 'https://via.placeholder.com/800x600/4A90E2/ffffff?text=iPhone+12', 0),
  (2, 'https://via.placeholder.com/800x600/E24A4A/ffffff?text=Samsung+M32', 0),
  (3, 'https://via.placeholder.com/800x600/4AE290/ffffff?text=Dell+Laptop', 0);
```

## 📊 Sample Data Included

The script includes realistic data for:
- ✅ **Mobiles** - iPhones, Samsung, etc.
- ✅ **Electronics** - Laptops, headphones, etc.
- ✅ **Vehicles** - Bikes, scooters
- ✅ **Furniture** - Beds, sofas
- ✅ **Fashion** - Shoes, clothing
- ✅ **Books** - Textbooks, novels
- ✅ **Home** - Appliances, kitchen items
- ✅ **Pets** - Puppies
- ✅ **Sports** - Cricket kits, gym equipment
- ✅ **Real Estate** - Flats, shops for rent
- ✅ **Jobs** - Delivery, sales positions

## 🖼️ About Images

The script uses **Unsplash images** which are:
- ✅ High-quality professional photos
- ✅ Free to use (Unsplash License)
- ✅ Marketplace-appropriate
- ✅ Optimized (800px width)

**Note**: While these are professional photos, they look realistic enough for a demo/launch. For production, encourage real users to post real listings.

## ⚙️ Customization

### Change Number of Listings per Category
In `seed-listings.js`, modify line ~263:
```javascript
const citiesToUse = cities.slice(0, 3); // Change 3 to more cities
```

### Add More Sample Data
Add new items to the `SAMPLE_LISTINGS` object (line ~17):
```javascript
'Mobiles': [
  {
    title: 'Your Product Title',
    description: 'Your description',
    price: 15000,
    images: ['https://url-to-image.jpg']
  }
]
```

### Use Your Own Images
Replace Unsplash URLs with your own image URLs in the `SAMPLE_LISTINGS` object.

## 🔧 Troubleshooting

### Error: "No categories found"
Run this SQL first:
```sql
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM cities;
SELECT COUNT(*) FROM areas;
```
Make sure you have data in these tables.

### Error: "Failed to upload image"
Check your Supabase Storage bucket:
1. Go to Supabase Dashboard → Storage
2. Make sure `listing-images` bucket exists
3. Make sure bucket is **public**

### Error: "No owner_token"
The script needs at least one profile. Create one first:
```sql
INSERT INTO profiles (email, name, owner_token, client_token)
VALUES ('seed@oldcycle.com', 'Seed User', 'SEED_OWNER_TOKEN_123', 'SEED_CLIENT_123');
```

## 📁 File Structure

After running:
```
Supabase Storage
└── listing-images/
    └── seed/
        ├── mobiles_1_1_123456_0.jpg
        ├── mobiles_1_1_123456_1.jpg
        ├── electronics_1_2_123457_0.jpg
        └── ... (all seeded images)
```

## 🎯 Expected Results

After completion:
- **~36 listings** created (12 categories × 3 cities)
- **~50-70 images** uploaded to Storage
- **Ready to browse** in your OldCycle app!

## 🚨 Important Notes

1. **Run only once** - Running multiple times will create duplicates
2. **Images take time** - Downloading and uploading ~70 images takes 5-10 minutes
3. **Check Storage quota** - Make sure you have enough space in Supabase Storage
4. **Owner token** - All listings will have the same owner (seed user)

## 🧹 Cleanup (Optional)

To remove all seeded data:
```sql
-- Delete seeded listings (update owner_token if different)
DELETE FROM listing_images 
WHERE listing_id IN (
  SELECT id FROM listings WHERE owner_token = 'SEED_OWNER_TOKEN_123'
);

DELETE FROM listings 
WHERE owner_token = 'SEED_OWNER_TOKEN_123';
```

To remove seeded images from Storage:
1. Go to Supabase Dashboard → Storage
2. Navigate to `listing-images/seed/`
3. Delete the folder

---

**Questions?** Check the script comments or modify the `SAMPLE_LISTINGS` object to suit your needs!
