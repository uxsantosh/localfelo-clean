# Supabase Setup - Categories Table

## Quick Setup Guide

### Step 1: Add New Categories

Go to your Supabase project → SQL Editor → New Query, then run:

```sql
-- Add Real Estate and Jobs categories
INSERT INTO categories (id, name, slug)
VALUES 
  (13, 'Real Estate', 'real-estate'),
  (14, 'Jobs', 'jobs')
ON CONFLICT (id) DO NOTHING;
```

### Step 2: Verify Categories

Run this query to see all categories:

```sql
SELECT * FROM categories ORDER BY id;
```

You should see 14 categories total, including the new Real Estate and Jobs categories.

## Expected Result

Your `categories` table should have these rows:

| id | name | slug |
|----|------|------|
| 1 | Mobile Phones | mobile-phones |
| 2 | Cars & Bikes | vehicles |
| 3 | Computers & Laptops | computers-laptops |
| 4 | Furniture | furniture |
| 5 | Home & Living | home-living |
| 6 | Fashion | fashion |
| 7 | Kids & Baby Items | kids-baby |
| 8 | Pets | pets |
| 9 | Books & Education | books-education |
| 10 | Gaming | gaming |
| 11 | Tools & Equipment | tools-equipment |
| 12 | Kitchen & Appliances | kitchen-appliances |
| **13** | **Real Estate** | **real-estate** |
| **14** | **Jobs** | **jobs** |

## Important Notes

1. **Emojis are client-side**: The emojis (🏢, 💼, etc.) are added by the frontend code, not stored in the database
2. **IDs must match**: The IDs in the database must match what's in the frontend code
3. **Slugs are used for listings**: When creating/displaying listings, the slug is used to link categories

## Troubleshooting

### If categories don't show up:
1. Check browser console for errors
2. Verify Supabase connection is working
3. Ensure categories table has the correct data
4. Try refreshing the page

### If emojis are missing:
- Check `/services/categories.js` - emojis are mapped there
- Verify the slug in database matches the slug in emoji mapping

## Next Steps

After running the SQL:
1. ✅ Categories are automatically fetched by all screens
2. ✅ New categories appear in category pills on HomeScreen
3. ✅ Users can create listings in Real Estate and Jobs categories
4. ✅ Filtering works with new categories
