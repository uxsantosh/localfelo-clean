
Implement final critical fixes in LocalFelo to improve matching accuracy, Shops activation, and notification quality.

IMPORTANT:
- DO NOT change existing category systems
- DO NOT break current matching logic
- ONLY enhance behavior and enforce rules
- Maintain backward compatibility

-------------------------------------

🎯 OBJECTIVE

- Ensure precise matching
- Activate Shops supply
- Improve notification quality
- Make system production-ready

-------------------------------------

🚨 PROBLEM SUMMARY (READ FIRST)

Current issues:

1. Subcategory is optional → weak matching
2. Shops are not receiving notifications → no supply activation
3. Notifications can become spam → users will ignore
4. Matching radius too large (50km) → irrelevant results

These reduce user trust and break the core experience.

-------------------------------------

📦 STEP 1: MAKE SUBCATEGORY MANDATORY (WISH UI)

APPLIES TO:
- Wish creation (ONLY product type)

-------------------------------------

IMPLEMENT:

IF user selects:
→ "Looking to buy"

THEN:

- Show category selector
- Show subcategory selector

-------------------------------------

RULES:

- Subcategory is REQUIRED
- Disable submit button until subcategory selected
- Show validation:
  → "Please select a specific item"

-------------------------------------

BACKWARD COMPATIBILITY:

- Old wishes without subcategory still valid
- Only enforce for NEW wishes

-------------------------------------

📦 STEP 2: IMPLEMENT WISH → SHOPS MATCHING

CURRENT ISSUE:
- Shops are not part of matching system

-------------------------------------

IMPLEMENT:

WHEN a new Wish (product) is created:

MATCH shops WHERE:

- shop.category_ids overlaps wish.category_ids
AND
- shop.subcategory_ids overlaps wish.subcategory_ids
AND
- within matching radius

-------------------------------------

ACTION:

- Send notification to matched shop owners

-------------------------------------

NOTIFICATION TEXT:

"You have a customer looking for {subcategory} near you"

-------------------------------------

-------------------------------------

📦 STEP 3: NOTIFICATION CONTROL (ANTI-SPAM)

CURRENT ISSUE:
- Users may receive repeated or excessive notifications

-------------------------------------

IMPLEMENT:

1. DUPLICATE PREVENTION

- Do NOT send same notification:
  → for same wish + same listing/shop
  → within short time window (e.g. 30 mins)

-------------------------------------

2. RATE LIMIT

- Limit notifications per user:
  → max 10 per hour (configurable)

-------------------------------------

3. GROUPING (OPTIONAL SIMPLE VERSION)

- If multiple matches occur:
  → combine into one notification:
  "3 new matches found near you"

-------------------------------------

-------------------------------------

📦 STEP 4: REDUCE MATCHING RADIUS

CURRENT ISSUE:
- Radius = 50km (too large for urban use)

-------------------------------------

UPDATE:

DEFAULT RADIUS:
→ 5km (primary)

OPTIONAL:
→ extend to 10km if needed

-------------------------------------

IMPLEMENT:

- Replace hardcoded 50km with configurable radius
- Use:
  → 5km default
  → fallback 10km max

-------------------------------------

-------------------------------------

📦 STEP 5: VALIDATION

Ensure:

- New wishes ALWAYS have subcategory
- Shops receive notifications
- No duplicate notifications
- Nearby matches only (not far away)

-------------------------------------

⚠️ DO NOT

- Do not reintroduce location-only matching
- Do not remove subcategory logic
- Do not mix service categories

-------------------------------------

🚀 FINAL GOAL

- Highly relevant matches
- Active Shops ecosystem
- Clean notification experience
- Strong user trust

-------------------------------------

💣 FINAL NOTE

This step directly affects user trust and retention.
Incorrect notifications = users leave.
