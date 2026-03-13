# Content Moderation & Smart Matching System

## Overview
Comprehensive solution for handling edge cases in the AI-powered task matching system: spelling corrections, profanity filtering, uncategorized tasks, and smart helper visibility.

---

## 1. Content Moderation (`/services/contentModeration.ts`)

### Features

#### A. Profanity Filter
- **Comprehensive bad words list** including:
  - English profanity
  - Hindi/Hinglish transliterated profanity
  - Kannada/Telugu profanity
  - Tamil profanity
  - Scam/fraud keywords
  - Sexual content keywords
  
- **Smart detection** using word boundaries to avoid false positives
- **Real-time validation** during task/skill creation

#### B. Spelling Correction
- **Auto-correction map** for common typos:
  - `delivry` → `delivery`
  - `repiar` → `repair`
  - `clening` → `cleaning`
  - 40+ common misspellings

- **Fuzzy matching** using Levenshtein distance algorithm
- **String similarity** calculation (0-100% match)
- **Automatic text normalization** before saving to database

#### C. Validation Functions

```typescript
// Validate skill name
validateSkillName(skillName: string): {
  isValid: boolean;
  sanitized: string;
  errors: string[];
}

// Validate task content
validateTaskContent(title: string, description: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Check for profanity
containsProfanity(text: string): boolean

// Calculate string similarity
stringSimilarity(str1: string, str2: string): number // 0-100

// Find closest match from list
findClosestMatch(input: string, options: string[], threshold: number): {
  match: string | null;
  similarity: number;
}
```

---

## 2. Enhanced AI Categorization (`/services/aiCategorization.ts`)

### New Function: `categorizeTaskSkill()`

Returns:
```typescript
{
  category: string | null;        // Category slug or null if uncategorized
  confidence: number;             // 0-100 confidence score
  isUncategorized: boolean;       // true if confidence < threshold
}
```

### How It Works

1. **Text normalization** - Auto-corrects spelling using `normalizeText()`
2. **Keyword matching** - Matches against 14 official categories with 150+ keywords
3. **Fuzzy matching** - Handles typos using similarity algorithm
4. **Confidence scoring** - Calculates match percentage
5. **Threshold check** - If confidence < 60%, marks as uncategorized

### Categories & Keywords

Each category has 10-15 keywords including variations:

- **Delivery-Pickup**: deliver, delivery, pickup, courier, parcel, shipping...
- **Tech-Help**: tech, computer, laptop, wifi, software, coding, android...
- **Cooking-Cleaning**: cook, clean, maid, housekeeping, laundry...
- **Repair-Handyman**: repair, fix, plumber, electrician, carpenter...
- And 10 more categories

---

## 3. Smart Custom Skills (`/services/customSkills.ts`)

### Enhanced `addCustomSkill()`

```typescript
addCustomSkill(userId: string, skillName: string): Promise<{
  success: boolean;
  error?: string;
  suggestion?: string;
}>
```

**Features:**
- ✅ Profanity check
- ✅ Length validation (2-50 characters)
- ✅ Auto spelling correction
- ✅ Duplicate detection (case-insensitive)
- ✅ Fuzzy matching to prevent similar skills (85% threshold)
- ✅ Suggestions for similar existing skills

**Example:**
```typescript
// User types: "elctrician"
// System corrects to: "electrician"
// Checks if user already has "electrician"
// Suggests existing skill if too similar (e.g., "electrical work")
```

---

## 4. Helper Preferences for Uncategorized Tasks

### Database Migration (`/migrations/add_uncategorized_task_preferences.sql`)

**New columns in `helper_preferences`:**

```sql
-- Whether to show uncategorized tasks (default: true)
show_uncategorized_tasks BOOLEAN DEFAULT true

-- Whether to show ALL tasks regardless of category (default: false)
show_all_tasks BOOLEAN DEFAULT false

-- Minimum AI confidence to show task (default: 60%)
min_confidence_threshold INTEGER DEFAULT 60
```

### Helper Visibility Logic

```
IF helper has show_all_tasks = true:
  ✅ Show ALL tasks within distance radius
  
ELSE IF task is categorized (confidence >= 60%):
  IF helper's categories include task category OR helper has matching custom skill:
    ✅ Show task
    
ELSE IF task is uncategorized (confidence < 60%):
  IF helper has show_uncategorized_tasks = true:
    ✅ Show task with lower priority
```

---

## 5. Smart Matching Algorithm

### Priority Levels

1. **High Priority (95%)**: Category match + custom skill match
2. **Medium Priority (80%)**: Category match only
3. **Low Priority (70%)**: Custom skill match only
4. **Uncategorized (50%)**: No category, shown to opted-in helpers
5. **No Match (0%)**: Not shown

### Example Scenarios

#### Scenario 1: Perfect Match
```
Task: "Need help fixing laptop wifi issue"
AI Categorizes: "tech-help" (confidence: 95%)

Helper Profile:
- Categories: ["tech-help", "repair-handyman"]
- Custom Skills: ["wifi setup", "laptop repair"]

Result: ✅ SHOWN (High Priority - 95%)
Reason: Category + custom skill match
```

#### Scenario 2: Typo Correction
```
Task: "Need dlvry from bus station" (typo)
AI Corrects to: "Need delivery from bus station"
AI Categorizes: "delivery-pickup" (confidence: 90%)

Helper Profile:
- Categories: ["delivery-pickup"]

Result: ✅ SHOWN (Medium Priority - 80%)
Reason: Category match after auto-correction
```

#### Scenario 3: Profanity Blocked
```
Task: "Need f***ing help with plumbing"

Validation: ❌ REJECTED
Error: "Task title contains inappropriate language"
User must rephrase before posting
```

#### Scenario 4: Uncategorized Task
```
Task: "Need help organizing my stamp collection"
AI Categorizes: null (confidence: 35% - too low)

Helper 1:
- show_uncategorized_tasks: true
- show_all_tasks: false
Result: ✅ SHOWN (Low Priority - 50%)

Helper 2:
- show_uncategorized_tasks: false
- show_all_tasks: false
Result: ❌ NOT SHOWN

Helper 3:
- show_all_tasks: true
Result: ✅ SHOWN (All tasks mode)
```

---

## 6. UI/UX Updates

### Task Creation Screen (`/screens/CreateSmartTaskScreen.tsx`)

**Real-time validation:**
- ✅ Profanity check as user types
- ✅ Show errors in red
- ✅ Show warnings in orange
- ✅ Auto-correct spelling before submission
- ✅ Block submission if errors exist

**Visual feedback:**
```typescript
{contentErrors.length > 0 && (
  <div className="text-sm text-red-500 mt-2">
    {contentErrors.map((error, index) => (
      <p key={index}>{error}</p>
    ))}
  </div>
)}

{contentWarnings.length > 0 && (
  <div className="text-sm text-orange-500 mt-2">
    {contentWarnings.map((warning, index) => (
      <p key={index}>{warning}</p>
    ))}
  </div>
)}
```

---

## 7. Admin Dashboard

### Popular Skills Analytics

Admin can see most popular custom skills to promote to official categories:

```typescript
getPopularCustomSkills(limit: 50): Promise<Array<{
  skill: string;
  count: number;
}>>
```

**Example output:**
```
1. "bike mechanic" - 127 helpers
2. "dog walking" - 89 helpers
3. "balloon decoration" - 56 helpers
4. "fruit cutting" - 43 helpers
...
```

Admin can then promote "bike mechanic" to an official category like "Vehicle Repair" or create a new category "Pet Care" based on "dog walking" popularity.

---

## 8. Implementation Checklist

### Backend (Supabase)
- [x] Run migration: `/migrations/add_uncategorized_task_preferences.sql`
- [ ] Update RLS policies if needed for new columns
- [ ] Test queries with new preference columns

### Frontend
- [x] Add content moderation service
- [x] Update AI categorization with confidence scores
- [x] Enhance custom skills with validation
- [x] Update task creation screen with real-time validation
- [ ] Update helper preferences screen to show new options
- [ ] Update task matching logic to use new preferences
- [ ] Add admin analytics for popular skills

### Testing
- [ ] Test profanity filter with various bad words
- [ ] Test spelling correction with common typos
- [ ] Test uncategorized task visibility
- [ ] Test helper preferences toggling
- [ ] Test edge cases (empty strings, special characters, etc.)

---

## 9. Common Questions & Answers

### Q: What if user enters wrong spellings?
**A:** The system auto-corrects common typos using the spelling correction map and fuzzy matching. The corrected text is saved to the database.

### Q: What if user enters bad words?
**A:** The profanity filter blocks task/skill creation with clear error messages. The user must rephrase to continue.

### Q: What if no category matches the description?
**A:** The AI returns `isUncategorized: true` when confidence < 60%. The task is shown to helpers who have enabled `show_uncategorized_tasks` or `show_all_tasks`.

### Q: Which helpers see uncategorized tasks?
**A:** 
1. Helpers with `show_all_tasks = true` (see ALL tasks)
2. Helpers with `show_uncategorized_tasks = true` (opt-in to see uncategorized)
3. Tasks appear at lower priority in the helper's feed

### Q: Can helpers add unlimited skills?
**A:** Yes, but with validation:
- No profanity
- 2-50 characters
- No exact duplicates
- Warning if too similar to existing skill
- Auto spell-correction

---

## 10. Future Enhancements

### Machine Learning Integration
- Collect training data from `skill_training_data` table
- Build ML model to improve categorization accuracy
- Learn from helper interactions (accepts, messages, views)
- Auto-suggest skills based on successful matches

### Advanced Filtering
- Location-based skill popularity (e.g., "tiffin delivery" popular in Mumbai)
- Time-based patterns (e.g., "school pickup" during term time)
- Language detection for multilingual support

### Gamification
- Badge for helpers who add popular skills early
- Reputation boost for accurate skill tags
- "Skill Pioneer" badge for first to add a skill that becomes popular

---

## 11. Technical Details

### Levenshtein Distance Algorithm
Calculates minimum edits (insertions, deletions, substitutions) needed to transform one string to another.

```
Example:
"repiar" → "repair"
Distance: 2 (swap 'i' and 'a', move 'r')
Similarity: (6 - 2) / 6 × 100 = 67%
```

### Fuzzy Matching Thresholds
- **85%+** - Too similar, suggest existing skill
- **70-84%** - Show as suggestion in autocomplete
- **60-69%** - Possible match for categorization
- **<60%** - Uncategorized

---

## 12. Performance Considerations

### Database Indexes
```sql
-- Fast lookup for helper preferences
CREATE INDEX idx_helper_preferences_show_all 
ON helper_preferences(user_id, show_all_tasks) 
WHERE show_all_tasks = true;

-- Fast lookup for uncategorized task opt-ins
CREATE INDEX idx_helper_preferences_uncategorized 
ON helper_preferences(user_id, show_uncategorized_tasks) 
WHERE show_uncategorized_tasks = true;
```

### Caching Strategy
- Cache popular skills list (updates hourly)
- Cache category keywords (static data)
- Cache user's custom skills (invalidate on add/remove)

---

## Summary

This comprehensive system handles all edge cases:

✅ **Spelling errors** → Auto-corrected using fuzzy matching  
✅ **Profanity** → Blocked with clear error messages  
✅ **Uncategorized tasks** → Shown to opted-in helpers  
✅ **Helper visibility** → Smart preferences with confidence thresholds  

The system ensures:
- Professional content only
- Accurate matching even with typos
- Fair visibility for all tasks
- Helper control over what they see
- Scalable learning from user behavior
