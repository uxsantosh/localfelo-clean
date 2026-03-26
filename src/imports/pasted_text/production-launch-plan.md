
Finalize LocalFelo system for production launch.

IMPORTANT:
- DO NOT redesign UI
- DO NOT change category systems
- DO NOT break existing logic
- ONLY complete integrations, enforce rules, and stabilize system

-------------------------------------

🎯 OBJECTIVE

- Complete notification system (in-app + WhatsApp)
- Ensure accurate matching
- Prevent spam and bad UX
- Activate full demand-supply loop
- Make system production-ready

-------------------------------------

🧠 CORE PRINCIPLES (DO NOT VIOLATE)

1. Matching MUST use:
   - category_id
   - subcategory_id
   - location (5km)

2. No AI guessing
3. No category-only matching (except old data fallback)
4. Notifications must be relevant and controlled

-------------------------------------

📦 STEP 1: ENFORCE SUBCATEGORY (WISH UI)

- For "Looking to buy":
  → subcategory is MANDATORY
- Disable submit until selected
- Old data fallback allowed

-------------------------------------

📦 STEP 2: COMPLETE MATCHING FLOWS

IMPLEMENT ALL:

-------------------------------------

A. TASK → PROFESSIONALS

- Match:
  → subcategory_id
  → within 5km

-------------------------------------

B. WISH (PRODUCT) → MARKETPLACE

1. NEW LISTINGS:
- listing.category_slug IN wish.category_ids
- listing.subcategory_id IN wish.subcategory_ids

2. EXISTING LISTINGS (IMPORTANT):
- Immediately fetch and show results after wish creation

-------------------------------------

C. WISH (PRODUCT) → SHOPS

- shop.category_ids overlaps wish.category_ids
- shop.subcategory_ids overlaps wish.subcategory_ids
- within 5km

-------------------------------------

-------------------------------------

📦 STEP 3: NOTIFICATION SYSTEM (FINAL)

REPLACE ALL OLD NOTIFICATION CALLS WITH:

sendNotification({
  userId,
  type,
  title,
  message,
  data,
  channels: ['in_app', 'whatsapp']
})

-------------------------------------

APPLY TO:

- tasks.ts
- wishes.ts
- listings.js
- chat.ts
- professionals.ts

-------------------------------------

-------------------------------------

📦 STEP 4: WHATSAPP SYSTEM (FINAL)

-------------------------------------

A. ENABLE PROVIDER-AGNOSTIC SYSTEM

- Use environment variables:

VITE_WHATSAPP_PROVIDER
VITE_WHATSAPP_API_URL
VITE_WHATSAPP_API_KEY

-------------------------------------

B. WHATSAPP TRIGGERS

Send WhatsApp for:

1. Task created → Professionals
2. Wish created → Shops
3. Match found → Users
4. Chat message → Users
5. Response received → Users

-------------------------------------

C. TEMPLATE RULE

- Use template system only
- No hardcoded messages

-------------------------------------

D. FAIL-SAFE

- If WhatsApp fails → continue in-app
- Never block main flow

-------------------------------------

-------------------------------------

📦 STEP 5: MINIMAL USER CONTROL (IMPORTANT)

DO NOT add settings page.

-------------------------------------

IMPLEMENT:

1. Append to every WhatsApp message:

"Reply STOP to disable WhatsApp updates"

-------------------------------------

2. Incoming message handler:

IF message contains:
- STOP
- STOP ALL
- UNSUBSCRIBE

THEN:
- Set user.whatsapp_enabled = false

-------------------------------------

3. Before sending WhatsApp:

IF user.whatsapp_enabled === false
→ skip WhatsApp

-------------------------------------

DEFAULT:
- whatsapp_enabled = true

-------------------------------------

-------------------------------------

📦 STEP 6: NOTIFICATION CONTROL (ANTI-SPAM)

-------------------------------------

A. RATE LIMIT

- Max 10 notifications per user per hour

-------------------------------------

B. DUPLICATE PREVENTION

- Same notification not sent within 30 minutes

-------------------------------------

C. GROUPING

- Combine multiple matches:
  → "🎯 {count} new matches found near you"

-------------------------------------

-------------------------------------

📦 STEP 7: MATCH PRIORITY

Sort matches by:

1. Distance (nearest first)
2. Latest activity

-------------------------------------

-------------------------------------

📦 STEP 8: MATCHING RADIUS

- Default: 5km
- Max: 10km

-------------------------------------

-------------------------------------

📦 STEP 9: VALIDATION

Ensure:

- No new data without subcategory
- No irrelevant matches
- No spam notifications

-------------------------------------

-------------------------------------

📦 STEP 10: LOGGING

Log:

- Notifications sent
- WhatsApp success/failure
- Rate limit skips
- Duplicate skips
- Matching results

-------------------------------------

-------------------------------------

📦 STEP 11: CONSISTENCY CHECK

Ensure:

PRODUCT FLOW:
- Wishes (product)
- Shops
- Marketplace

Use:
→ product categories

-------------------------------------

SERVICE FLOW:
- Tasks
- Professionals

Use:
→ service categories

-------------------------------------

DO NOT MIX

-------------------------------------

-------------------------------------

🚀 FINAL GOAL

- Accurate matching
- Real-time supply activation
- Clean notification experience
- WhatsApp-driven engagement
- Production-ready marketplace

-------------------------------------

💣 FINAL NOTE

This system must:

- Send only relevant notifications
- Never spam users
- Never break if WhatsApp fails

This is the final system for launch.
