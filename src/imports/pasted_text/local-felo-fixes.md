
Fix critical matching and data structure issues in LocalFelo.

IMPORTANT:
- DO NOT change UI
- DO NOT modify category systems
- ONLY fix data structure and matching logic
- Maintain backward compatibility

-------------------------------------

🎯 OBJECTIVE

- Enable precise matching
- Remove irrelevant notifications
- Activate Shops module
- Improve system accuracy

-------------------------------------

🧠 CORE RULE

Matching MUST use:

- category_id
- subcategory_id

-------------------------------------

📦 FIX 1: MARKETPLACE

1. Add field:
- subcategory_id TEXT

2. Update creation flow:
- User must select subcategory

3. Update filters:
- Add subcategory filtering

-------------------------------------

📦 FIX 2: WISH ↔ MARKETPLACE MATCHING

Replace logic:

OLD:
- Match using category only

NEW:
- Match ONLY if:
  listing.category_slug IN wish.category_ids
  AND
  listing.subcategory_id IN wish.subcategory_ids

-------------------------------------

FALLBACK:
- If subcategory is NULL → match category only

-------------------------------------

📦 FIX 3: PROFESSIONALS

1. Add:
- subcategory_ids TEXT[]

2. Update registration:
- Store selected subcategories

3. Update matching:
- Use subcategory_id

-------------------------------------

📦 FIX 4: TASK MATCHING

Ensure:

task.detected_subcategory = professional.subcategory_ids

-------------------------------------

📦 FIX 5: WISH → SHOPS MATCHING

IMPLEMENT:

WHEN Wish created (product type):

MATCH:
- shop.category_ids contains wish.category_id
AND
- shop.subcategory_ids contains wish.subcategory_id
AND
- within radius

SEND notification to shop owners

-------------------------------------

📦 FIX 6: INDEXING

Ensure performance:

-------------------------------------

🧾 SQL

ALTER TABLE listings ADD COLUMN IF NOT EXISTS subcategory_id TEXT;

ALTER TABLE professionals ADD COLUMN IF NOT EXISTS subcategory_ids TEXT[];

CREATE INDEX IF NOT EXISTS idx_listings_subcategory ON listings(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_wishes_subcategories ON wishes USING GIN(subcategory_ids);
CREATE INDEX IF NOT EXISTS idx_shops_subcategories ON shops USING GIN(subcategory_ids);
CREATE INDEX IF NOT EXISTS idx_professionals_subcategories ON professionals USING GIN(subcategory_ids);

-------------------------------------

🚀 GOAL

- Accurate matching
- No irrelevant notifications
- Fully working Shops system
- Scalable marketplace