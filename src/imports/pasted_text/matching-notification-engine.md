
Create the Matching and Notification Engine for LocalFelo.

IMPORTANT:
- DO NOT change UI structure
- DO NOT change category systems
- USE existing category + subcategory system
- Matching must be deterministic (no guessing / AI inference)

-------------------------------------

🎯 OBJECTIVE

- Automatically match demand with supply
- Trigger real-time notifications
- Ensure accurate and relevant connections

-------------------------------------

🧠 CORE RULE

MATCH ONLY USING:

- category_id
- subcategory_id

DO NOT use:
- role
- keywords
- AI guessing

-------------------------------------

📦 MATCHING FLOWS

-------------------------------------

1. TASK → PROFESSIONALS

When a Task is created:

- Identify:
  - category_id
  - subcategory_id
  - location (lat/lng)

Match:

- Professionals who have:
  - same subcategory_id
  - within radius (configurable, e.g. 5–10 km)

-------------------------------------

2. WISH (SERVICE TYPE) → PROFESSIONALS

When Wish type = “Need help”

Match exactly same as Tasks:

- category_id
- subcategory_id
- location

-------------------------------------

3. WISH (PRODUCT TYPE) → SHOPS + MARKETPLACE

When Wish type = “Looking to buy”

Match:

- Shops with:
  - same category_id
  - same subcategory_id

- Marketplace listings with:
  - same category_id
  - similar keywords (optional)

-------------------------------------

📍 LOCATION LOGIC

- Use stored lat/lng (manual selection)
- Calculate distance
- Filter by radius

-------------------------------------

🔔 NOTIFICATION SYSTEM

-------------------------------------

WHEN MATCH FOUND:

Trigger:

1. In-app notification
2. Optional: WhatsApp (future)
3. Store notification log

-------------------------------------

📌 NOTIFICATION CONTENT

For Professionals:

“You have a new task for AC repair near you”

For Shops:

“Someone is looking for a mobile phone near you”

-------------------------------------

📌 NOTIFICATION RULES

- Send ONLY to matched users
- Avoid spam:
  - Limit duplicate notifications
  - Debounce similar requests

-------------------------------------

⚡ PERFORMANCE RULES

- Matching should be fast
- Use indexed queries
- Avoid scanning full database

-------------------------------------

📊 PRIORITIZATION

Sort matches by:

1. Distance
2. Recent activity
3. Availability (future)

-------------------------------------

📄 FALLBACK LOGIC

If no match:

- Show:
  → “No exact match found”
- Suggest nearby categories
- Allow manual browsing

-------------------------------------

📈 TRACKING (IMPORTANT)

Track:

- Number of matches per task
- Notification sent count
- Response rate
- Most requested subcategories

-------------------------------------

🔗 DATA STRUCTURE

Ensure:

- Professionals table:
  - category_id[]
  - subcategory_id[]

- Shops table:
  - category_id[]
  - subcategory_id[]

-------------------------------------

🎨 UX BEHAVIOR

- Show “Matched professionals” instantly after task creation
- Show “Nearby shops” after product wish

-------------------------------------

⚠️ DO NOT

- Use roles for matching
- Mix product & service categories
- Show irrelevant results

-------------------------------------

🚀 GOAL

- Fast and accurate matching
- High response rate
- Real marketplace behavior
- Strong user trust
