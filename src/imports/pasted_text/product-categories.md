Update the product category system in LocalFelo for:

- Wish creation (Product type only)
- Marketplace listing
- Filters in these modules

IMPORTANT:
- DO NOT modify service categories (Tasks / Professionals)
- DO NOT break existing data or flows
- Extend current system safely

-------------------------------------

🎯 OBJECTIVE

Upgrade category system from:
- Single-level categories

To:
- Two-level categories:
  → Main Category
  → Subcategory

-------------------------------------

📦 FINAL PRODUCT CATEGORY STRUCTURE (USE EXACTLY THIS)

MOBILES & ACCESSORIES
- Smartphones
- Feature phones
- Mobile accessories
- Chargers & cables
- Earphones & headphones
- Smartwatches
- Mobile parts
- Other

LAPTOPS & COMPUTERS
- Laptops
- Desktops
- Accessories
- Printers & scanners
- Storage devices
- Networking devices
- Other

ELECTRONICS & GADGETS
- Televisions
- Speakers & audio
- Cameras
- Gaming consoles
- Smart devices
- Other

HOME APPLIANCES
- Refrigerators
- Washing machines
- Air conditioners
- Microwave ovens
- Water purifiers
- Kitchen appliances
- Geysers & heaters
- Other

FURNITURE
- Beds & mattresses
- Sofas & chairs
- Tables & desks
- Wardrobes & storage
- Office furniture
- Other

HOME & KITCHEN
- Cookware
- Home decor
- Lighting
- Curtains & furnishings
- Storage & organizers
- Other

FASHION & CLOTHING
- Men’s clothing
- Women’s clothing
- Kids clothing
- Footwear
- Bags & wallets
- Accessories
- Other

BEAUTY & PERSONAL CARE
- Skincare
- Hair care
- Makeup
- Grooming tools
- Perfumes
- Other

HEALTH & FITNESS
- Fitness equipment
- Gym accessories
- Supplements
- Medical devices
- Other

BOOKS & STATIONERY
- Academic books
- Exam preparation books
- Novels
- Stationery
- Other

SPORTS & OUTDOORS
- Sports equipment
- Outdoor gear
- Cycles
- Fitness gear
- Other

VEHICLES
- Cars
- Bikes & scooters
- Electric vehicles
- Accessories
- Spare parts
- Other

REAL ESTATE
- Flats for sale
- Houses for sale
- Plots / land
- Commercial property
- Other

RENTALS
- Electronics on rent
- Furniture on rent
- Vehicles on rent
- Event items
- Other

PET SUPPLIES
- Pet food
- Accessories
- Beds & cages
- Grooming products
- Other

BABY & KIDS
- Baby products
- Toys
- School supplies
- Other

INDUSTRIAL & BUSINESS
- Machinery
- Tools
- Shop supplies
- Office supplies
- Other

FOOD & GROCERY
- Fresh groceries
- Packaged food
- Homemade food
- Beverages
- Other

OTHER
- Other items

-------------------------------------

🎯 IMPLEMENTATION (VERY IMPORTANT)

1. DATABASE

- Add subcategory field:
  → subcategory_id (nullable)

- Existing data:
  → Keep category_id as-is
  → subcategory remains NULL

-------------------------------------

2. UI UPDATE (CREATION FLOW)

In:
- Wish creation (Product type)
- Marketplace listing

Flow:

STEP 1:
→ Select Main Category

STEP 2:
→ Select Subcategory (based on main category)

-------------------------------------

3. “OTHER” HANDLING

If user selects “Other”:

- Show input field:
  → “Enter item name”

- Save as:
  - product_name
  - category_id
  - subcategory = Other

-------------------------------------

4. FILTER UPDATE

Update filters to support:

- Main category filter
- Subcategory filter

-------------------------------------

5. SEARCH UPDATE

Search should match:

- Product name
- Category
- Subcategory

-------------------------------------

6. BACKWARD COMPATIBILITY

- Existing listings must still work
- If subcategory is NULL:
  → treat as category-level match

-------------------------------------

⚠️ DO NOT:

- Change service categories
- Mix product & service systems
- Break existing data

-------------------------------------

🎨 UX RULES

- Max 2 taps for selection
- Clean UI
- Mobile-first
- Clear selected state

-------------------------------------

🚀 GOAL

- Strong category system
- No confusion
- Better matching
- Future-ready for Shops module