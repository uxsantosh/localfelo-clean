
Update the PRODUCT CATEGORY system in LocalFelo.

CRITICAL:
- DO NOT modify service categories (Tasks / Professionals)
- DO NOT change any existing service logic
- Apply changes ONLY to:
  → Wishes (Product flow)
  → Shops module
  → Marketplace

-------------------------------------

🎯 OBJECTIVE

- Replace incomplete product categories with full system
- Ensure accurate matching for Shops and Wishes
- Improve filtering, search, and SEO

-------------------------------------

🧠 SCOPE (VERY IMPORTANT)

APPLY ONLY TO:

1. Wish creation (ONLY when user selects “Looking to buy”)
2. Shops module (creation + listing + filters)
3. Marketplace (creation + listing + filters)

DO NOT APPLY TO:

- Tasks
- Professionals
- Service categories

-------------------------------------

📦 CATEGORY SYSTEM (USE EXACTLY THIS)

[PASTE FULL PRODUCT CATEGORY LIST HERE — DO NOT MODIFY]

-------------------------------------

📱 WISH CREATION FLOW (UPDATE)

STEP 1:
Ask:
→ “What are you looking for?”

Options:
- Need help (Service)
- Looking to buy (Product)

-------------------------------------

IF “PRODUCT” SELECTED:

- Show PRODUCT categories ONLY
- Hide service categories completely

-------------------------------------

🛒 SHOPS CREATION FLOW

- Use same PRODUCT categories
- Allow multi-select categories
- Store:
  → category_id
  → subcategory_id

-------------------------------------

🛍️ MARKETPLACE FLOW

- Use same PRODUCT categories
- Add subcategory selection step

-------------------------------------

🔍 FILTER SYSTEM (UPDATE)

Apply to:
- Shops listing
- Marketplace listing
- Wishes (product view)

Filters must include:

- Main category
- Subcategory

-------------------------------------

🔎 SEARCH SYSTEM

Search should match:

- Product name
- Subcategory
- Category

-------------------------------------

🔗 MATCHING LOGIC

When Wish (Product type) is created:

Match using:
- category_id
- subcategory_id

Notify:
- Shops
- Marketplace listings

-------------------------------------

🌐 SEO REQUIREMENTS

For Shops module:

Create indexable pages:

- /shops
- /shops/{category}
- /shops/{shop-name}

Ensure:

- Meta title
- Meta description
- Clean URLs
- Crawlable content

-------------------------------------

⚠️ IMPORTANT RULES

- REMOVE “Services” category from product categories
- DO NOT mix service and product categories
- DO NOT simplify category list
- DO NOT create new category system

-------------------------------------

📊 DATA STRUCTURE

Ensure:

- category_id (required)
- subcategory_id (required for new entries)
- old data remains compatible (subcategory nullable)

-------------------------------------

🎨 UX RULES

- Show categories clearly
- Max 2-step selection (main → sub)
- Mobile-first design
- Avoid overwhelming UI

-------------------------------------

🚀 GOAL

- Complete product coverage
- Strong matching system
- Better discoverability
- SEO-ready architecture
- No impact on service modules
