# 📊 Quick Reference: Price vs Budget in OldCycle

## Data Structure

| Feature | Field Name | Type | Display |
|---------|-----------|------|---------|
| **Tasks** | `price` | NUMERIC | ₹1,500 |
| **Tasks** | `is_negotiable` | BOOLEAN | "Negotiable" |
| **Wishes** | `budget_min` | NUMERIC | ₹500+ |
| **Wishes** | `budget_max` | NUMERIC | Up to ₹2,000 |
| **Wishes** | Both fields | NUMERIC | ₹500 - ₹2,000 |
| **Listings** | `price` | NUMERIC | ₹3,000 |

## Files Changed

1. ✅ `/services/tasks.ts` - Removed budgetMin/budgetMax
2. ✅ `/components/TaskCard.tsx` - Price-only display logic
3. ✅ `/types/index.ts` - Updated Task interface

## SQL Migration

📄 `/ADD_MISSING_COLUMNS_TASKS_WISHES.sql`

Run this in Supabase SQL Editor to add:
- `status`, `latitude`, `longitude` to tasks
- `status`, `urgency`, `latitude`, `longitude` to wishes

## Quick Fix for "Price not specified"

```sql
-- Check current prices
SELECT id, title, price, is_negotiable FROM tasks LIMIT 5;

-- Set default price
UPDATE tasks SET price = 1000 WHERE price IS NULL OR price = 0;

-- OR mark as negotiable
UPDATE tasks SET is_negotiable = true WHERE price IS NULL OR price = 0;
```

## That's It!

Simple fix: Tasks have PRICE only, Wishes have BUDGET RANGE.
