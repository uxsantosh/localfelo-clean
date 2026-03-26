
Complete final improvements in LocalFelo matching and notification system.

IMPORTANT:
- DO NOT change existing matching logic (already correct)
- DO NOT modify category systems
- DO NOT break working flows
- ONLY enhance notification quality and completeness

-------------------------------------

🎯 OBJECTIVE

- Prevent notification spam
- Improve match relevance
- Activate existing supply instantly
- Make system production-ready

-------------------------------------

🧠 CURRENT STATE

System already has:
- Category + Subcategory matching
- Location-based filtering (5km)
- Shops matching
- Duplicate prevention (30 min)

Remaining issues:
- No rate limit
- Wish does not match existing listings immediately
- No prioritization of results

-------------------------------------

📦 FIX 1: RATE LIMIT (ANTI-SPAM)

IMPLEMENT:

Limit notifications per user:

- Max 10 notifications per user per hour

-------------------------------------

LOGIC:

Before sending notification:

1. Count notifications sent to user in last 60 minutes
2. IF count >= 10:
   → DO NOT send new notification
   → Skip silently

-------------------------------------

-------------------------------------

📦 FIX 2: WISH → MARKETPLACE (EXISTING LISTINGS)

CURRENT ISSUE:

- Wish only matches NEW listings
- Existing listings are ignored

-------------------------------------

IMPLEMENT:

WHEN a new Wish is created:

IMMEDIATELY:

1. Fetch listings WHERE:

- listing.category_slug IN wish.category_ids
AND
- listing.subcategory_id IN wish.subcategory_ids
AND
- within 5km radius

-------------------------------------

2. Sort listings by:

- distance ASC
- created_at DESC

-------------------------------------

3. Notify user:

IF results found:

- Show notification:
  → "🎯 Found {count} matching items near you"

-------------------------------------

4. (OPTIONAL UX)

- Open results screen with matched listings

-------------------------------------

-------------------------------------

📦 FIX 3: NOTIFICATION PRIORITY

CURRENT ISSUE:

- All matches treated equally

-------------------------------------

IMPLEMENT PRIORITY ORDER:

Sort matches before sending notifications:

1. Distance (nearest first)
2. Recent activity (latest listings first)

-------------------------------------

APPLY TO:

- Listing → Wish notifications
- Wish → Shops notifications
- Wish → Marketplace results

-------------------------------------

-------------------------------------

📦 FIX 4: NOTIFICATION GROUPING (BASIC)

IF multiple matches found:

Instead of sending multiple notifications:

SEND:

- "🎯 {count} new matches found near you"

-------------------------------------

-------------------------------------

📦 FIX 5: LOGGING (FOR DEBUGGING)

Add logs:

- When notification skipped due to rate limit
- When grouped notification sent
- When existing listings matched

-------------------------------------

-------------------------------------

📦 FIX 6: CONFIGURABLE SETTINGS

Define constants:

- MAX_NOTIFICATIONS_PER_HOUR = 10
- MATCHING_RADIUS_KM = 5
- DUPLICATE_WINDOW_MINUTES = 30

-------------------------------------

-------------------------------------

⚠️ DO NOT

- Do NOT change matching logic
- Do NOT remove subcategory requirement
- Do NOT increase radius
- Do NOT send irrelevant notifications

-------------------------------------

🚀 FINAL GOAL

- High-quality notifications
- No spam
- Instant supply activation
- Strong user trust
- Production-ready marketplace

-------------------------------------

💣 FINAL NOTE

Matching + Notifications = Core product.

If notifications are wrong:
→ Users leave.

If notifications are accurate:
→ Product grows naturally.
