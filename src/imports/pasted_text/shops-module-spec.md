
Create a new module called “Shops” in LocalFelo.

IMPORTANT:
- DO NOT modify existing modules (Tasks, Wishes, Marketplace, Professionals)
- DO NOT change existing logic or database
- ONLY extend the system
- Reuse existing product category system
- Ensure full backward compatibility

-------------------------------------

🎯 WHY WE ARE ADDING SHOPS (BUSINESS PURPOSE)

LocalFelo currently has:
- Tasks → service demand
- Professionals → service supply
- Marketplace → product listings (unstructured)
- Wishes → user intent (uncontrolled)

PROBLEM:
- No structured system for local businesses (shops)
- No proper supply for product-based needs
- Wishes (product) are not fulfilled efficiently

SOLUTION:

Shops module will:
- Allow local shops/businesses to register
- List their products
- Get leads from Wishes
- Increase supply on platform
- Improve local discovery

GOAL:
- Convert LocalFelo into a **local demand-supply ecosystem**
- Enable businesses to get leads without ads
- Enable users to find products nearby instantly

-------------------------------------

🧠 CORE LOGIC

- Professionals → services
- Shops → products

- Tasks → match with professionals
- Wishes:
  - Service → professionals
  - Product → shops + marketplace

-------------------------------------

📦 CATEGORY SYSTEM (VERY IMPORTANT)

USE ONLY EXISTING PRODUCT CATEGORIES:

- Mobiles & Accessories
- Electronics
- Furniture
- Vehicles
- Real Estate
- Rentals
- Fashion
- etc.

DO NOT create new category system

-------------------------------------

📱 NAVIGATION

WEB:
- Add “Shops” tab in top navigation
- Position: next to “Professionals”

MOBILE:
- Add “Shops” in animated bottom popup menu
- Keep existing animation behavior

-------------------------------------

🧩 MODULE STRUCTURE

1. Shops Listing Page
2. Category Pages (SEO)
3. Shop Details Page
4. Register Shop Flow
5. Shop Profile Management

-------------------------------------

📄 1. SHOPS LISTING PAGE

- Show nearby shops
- Grid layout

CARD INCLUDES:
- Shop name
- Category
- Distance
- Thumbnail image

FILTERS:
- Main category
- Subcategory

SORT:
- Distance (default)

-------------------------------------

🎨 SHOP CARD UI (IMPORTANT)

- Card should visually resemble a small shop/store
- Add:
  - Roof/canopy style top
  - Small “door” element

INTERACTION:

Desktop:
- Door opens on hover

Mobile:
- Subtle tap animation

RULES:
- Do NOT disturb text readability
- Keep animation lightweight

-------------------------------------

📄 2. CATEGORY PAGES (SEO CRITICAL)

Create separate pages:

/shops
/shops/mobiles
/shops/furniture

Each page must:
- Be indexable
- Have unique title + meta description
- Show relevant shops

-------------------------------------

📄 3. SHOP DETAILS PAGE

URL:
→ /shops/{shop-name}-{id}

INCLUDES:

- Shop name (H1)
- Address (mandatory)
- Location (lat/lng)
- Categories (main + subcategory)
- Shop images (logo + gallery)

PRODUCT LIST:

Each product:
- Image (max 2)
- Name
- Price

CTA:
- Chat (login required)
- WhatsApp (login required)

-------------------------------------

📄 4. REGISTER SHOP FLOW

STEP 1:
- Shop name

STEP 2:
- Select categories (main + subcategory)
- Multi-select allowed

STEP 3:
- Address (mandatory)
- Location (manual lat/lng as per system)

STEP 4:
- Add products

PRODUCT FORM:
- Product name
- Price
- Max 2 images

-------------------------------------

📄 5. SHOP PROFILE MANAGEMENT

Inside user profile:

- Edit shop details
- Manage products
- Update categories

-------------------------------------

🔗 MATCHING LOGIC

When user creates a Wish (Product type):

Match based on:
- category_id
- subcategory_id

Notify:
- Shops
- Marketplace listings

-------------------------------------

🔍 SEO REQUIREMENTS (VERY IMPORTANT)

- Create separate pages (NOT single-page only)
- Use clean URLs
- Add meta title + description
- Use semantic HTML (H1, H2)
- Ensure crawlable content

-------------------------------------

💬 CONTACT LOGIC

- User must login
- Then allow:
  - WhatsApp
  - In-app chat

-------------------------------------

⚠️ RULES

- No cart
- No payment system
- No inventory tracking
- Keep simple (lead generation only)

-------------------------------------

🎨 DESIGN GUIDELINES

- Follow existing branding:
  - White + lemon green + black
  - Inter font

- 2026 UI style:
  - Clean layout
  - Soft shadows
  - Smooth animations
  - Rounded corners (balanced)

-------------------------------------

🚀 FINAL GOAL

- Increase product supply
- Improve wish fulfillment
- Enable local businesses to get leads
- Build SEO-driven growth
- Keep system simple and scalable
