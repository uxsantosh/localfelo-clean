Fix and clearly separate category systems in LocalFelo.

IMPORTANT:
- DO NOT mix service and product categories
- DO NOT merge category systems
- Ensure correct mapping for notifications and matching

-------------------------------------

🎯 OBJECTIVE

- Maintain TWO separate category systems:
  1. Service Categories
  2. Product Categories

-------------------------------------

🧠 CATEGORY SYSTEMS

1. SERVICE CATEGORIES

Used in:
- Tasks
- Professionals
- Wishes (when user selects “Need help”)

Examples:
- Repair
- Driver & Rides
- Delivery & Pickup
- Cleaning

-------------------------------------

2. PRODUCT CATEGORIES

Used in:
- Wishes (when user selects “Looking to buy”)
- Shops
- Marketplace

Examples:
- Mobiles & Accessories
- Laptops & Computers
- Furniture
- Electronics

-------------------------------------

📱 WISH CREATION FLOW (CRITICAL)

STEP 1:
Ask user:

“What are you looking for?”

Options:
- Need help (Service)
- Looking to buy (Product)

-------------------------------------

IF USER SELECTS “SERVICE”:

- Show SERVICE categories (same as Tasks)
- DO NOT show product categories

-------------------------------------

IF USER SELECTS “PRODUCT”:

- Show PRODUCT categories
- DO NOT show service categories

-------------------------------------

🎯 UI PRIORITY (SERVICE)

For service selection:

Show top 4 categories first:

1. Repair
2. Driver & Rides
3. Delivery & Pickup
4. Cleaning

Then show remaining categories below

-------------------------------------

🔔 MATCHING LOGIC

Service type:
- Match with Professionals using subcategories

Product type:
- Match with Shops and Marketplace using product categories

-------------------------------------

⚠️ IMPORTANT RULES

- NEVER show both category types together
- NEVER mix product categories into service system
- NEVER use roles for matching
- Always match using category + subcategory

-------------------------------------

🎨 UX GUIDELINES

- Clear separation
- Minimal confusion
- Fast selection (1–2 taps)
- Mobile-first design

-------------------------------------

🚀 GOAL

- Correct category usage
- Accurate matching
- Clean UX
- No confusion for users