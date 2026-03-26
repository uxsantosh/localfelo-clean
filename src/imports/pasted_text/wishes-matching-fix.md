
Fix the Wishes system to support accurate matching.

THIS IS A CRITICAL PRODUCT FIX.

-------------------------------------

🚨 CURRENT PROBLEM (READ CAREFULLY)

Right now, Wishes → Marketplace matching is based ONLY on location (50km radius).

This means:
- If a user wants "iPhone"
- They receive notifications for ANY product nearby:
  → fridge
  → sofa
  → bike
  → unrelated items

-------------------------------------

❌ WHY THIS IS WRONG

- Notifications become irrelevant
- Users lose trust
- Users ignore notifications
- Matching system fails
- Entire marketplace becomes ineffective

-------------------------------------

🧠 ROOT CAUSE

The Wishes table is still using OLD structure:

- category_id (single value)
- No subcategory support

Meanwhile:
- Marketplace uses category + subcategory
- Shops use category + subcategory

👉 So matching is inconsistent

-------------------------------------

🎯 OBJECTIVE

- Upgrade Wishes to use category + subcategory
- Enable precise matching
- Remove location-only matching

-------------------------------------

📦 STEP 1: DATABASE UPDATE

Add new fields to wishes table:

- category_ids TEXT[]
- subcategory_ids TEXT[]

DO NOT remove old field yet:
- category_id (keep for backward compatibility)

-------------------------------------

📦 STEP 2: WISH CREATION FLOW

Update UI:

STEP 1:
Ask:
→ Need help (Service)
→ Looking to buy (Product)

-------------------------------------

IF USER SELECTS "PRODUCT":

- Show PRODUCT categories (existing system)
- Require:
  → Main category
  → Subcategory (MANDATORY)

Store:

- category_ids[]
- subcategory_ids[]

-------------------------------------

📦 STEP 3: MATCHING LOGIC (CRITICAL)

REPLACE current logic:

❌ DO NOT use location-only matching

-------------------------------------

USE:

IF subcategory_ids exists:

MATCH ONLY IF:
- listing.category_slug IN wish.category_ids
AND
- listing.subcategory_id IN wish.subcategory_ids

-------------------------------------

📦 STEP 4: FALLBACK (OLD DATA ONLY)

IF old wish (no subcategory_ids):

- Match using category only

-------------------------------------

📦 STEP 5: SHOPS MATCHING

After migration:

WHEN wish is created:

MATCH shops:

- shop.category_ids overlaps wish.category_ids
AND
- shop.subcategory_ids overlaps wish.subcategory_ids
AND
- within radius

-------------------------------------

📦 STEP 6: REMOVE WRONG BEHAVIOR

REMOVE:

- Location-only notifications
- Generic "New listing near you" notifications

-------------------------------------

📦 STEP 7: VALIDATION

Ensure:

- All new wishes have subcategory_ids
- No new wish without subcategory
- Matching uses structured data only

-------------------------------------

⚠️ IMPORTANT RULES

- DO NOT guess categories
- DO NOT mix service and product categories
- DO NOT skip subcategory
- DO NOT generate fallback suggestions

-------------------------------------

🚀 FINAL GOAL

- Accurate notifications
- High relevance
- Strong marketplace matching
- Better user trust

-------------------------------------

💣 FINAL NOTE

Matching is the core of this product.
If matching is wrong, everything fails.

This fix is mandatory.
