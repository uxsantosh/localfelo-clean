# 🗺️ LocalFelo Tasks & Helper Mode - Complete Flow Diagram

## 📱 USER JOURNEY

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOME SCREEN                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  "Earn by helping nearby"                                │  │
│  │  [ Turn On ]  ← Click this button                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │  User logged   │
                  │      in?       │
                  └────────┬───────┘
                           │
         ┌─────────────────┴─────────────────┐
         │ NO                               YES│
         ▼                                    ▼
┌──────────────────┐              ┌────────────────────┐
│  LOGIN MODAL     │              │ Has helper         │
│  OPENS           │              │ preferences?       │
│                  │              └─────────┬──────────┘
│  User logs in    │                        │
└────────┬─────────┘              ┌─────────┴─────────┐
         │                        │ NO               YES│
         └───────────────┬────────┘                  │
                         ▼                           ▼
              ┌──────────────────────┐    ┌──────────────────────┐
              │ UNIFIED TASKS SCREEN │    │ UNIFIED TASKS SCREEN │
              │                      │    │                      │
              │ showCategoryModal:   │    │ Pre-loaded           │
              │     ✅ TRUE          │    │ categories + skills  │
              │                      │    │                      │
              │ Category modal       │    │ Tasks filtered by    │
              │ opens automatically  │    │ saved preferences    │
              └──────────┬───────────┘    └──────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  CATEGORY SELECTION  │
              │  MODAL               │
              │                      │
              │  📦 Carry/Move       │
              │  🚚 Deliver          │
              │  🔧 Fix Something    │
              │  💻 Tech Help        │
              │  ... (12 total)      │
              │                      │
              │  Distance: 1-100km   │
              │                      │
              │  [Clear] [Save]      │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  TASKS FILTERED      │
              │  BY SELECTIONS       │
              │                      │
              │  Helper Mode: ON 💚  │
              └──────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    ALTERNATIVE FLOW                             │
│                 (Tasks Tab Navigation)                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  User clicks     │
│  TASKS TAB       │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ UNIFIED TASKS SCREEN │
│                      │
│ showCategoryModal:   │
│     ❌ FALSE         │
│                      │
│ Shows ALL tasks      │
│ sorted by distance   │
│                      │
│ [Turn On] button     │
│ [Categories] filter  │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  User clicks         │
│  "Turn On" or        │
│  "Categories"        │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  CATEGORY SELECTION  │
│  MODAL OPENS         │
│  (same as above)     │
└──────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│              AUTO-ENABLE HELPER MODE FLOW                       │
│                (Click on any task)                              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  TASKS SCREEN        │
│                      │
│  ┌────────────────┐  │
│  │ 📦 Carry/Move  │  │
│  │ Help me move   │  │
│  │ furniture      │  │
│  │ ₹200 | 2.5km   │  │
│  └────────────────┘  │← User clicks this task
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  BACKGROUND:         │
│                      │
│  1. Get task's       │
│     categories       │
│     ['carry-move']   │
│                      │
│  2. Add to user's    │
│     helper prefs     │
│                      │
│  3. Set is_available │
│     = true           │
│                      │
│  4. Save to DB       │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  TASK DETAIL SCREEN  │
│                      │
│  ✅ Helper mode      │
│     now enabled!     │
│                      │
│  User can accept     │
│  this task           │
└──────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                   CATEGORY SELECTION UX                         │
│                 (Mobile-Optimized)                              │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│  Select Categories & Skills                    [X]        │ ← Sticky Header
├───────────────────────────────────────────────────────────┤
│  How far can you travel?                                  │
│  ┌────┬────┬────┬────┬────┬────┬────┐                   │
│  │ 1  │ 3  │ 5  │ 10 │ 25 │ 50 │100 │  ← Distance      │
│  │ km │ km │ km │ km │ km │ km │ km │    options       │
│  └────┴────┴────┴────┴────┴────┴────┘                   │
├───────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐     │
│  │  📦  Carry or Move Things              ✓    ⌄  │←─┐  │
│  │  Help lifting, shifting items                  │  │  │
│  │  2 sub-skills selected                         │  │  │
│  └─────────────────────────────────────────────────┘  │  │
│                 │                                     │  │
│                 ▼ (expanded)                          │  │
│  ┌─────────────────────────────────────────────────┐  │  │
│  │  Optional: Select specific sub-skills          │  │  │
│  │  ┌───────────────────────────────────────────┐ │  │  │
│  │  │  Carry luggage                       ✓    │ │  │  │
│  │  └───────────────────────────────────────────┘ │  │  │
│  │  ┌───────────────────────────────────────────┐ │  │  │
│  │  │  Help shifting items                 ✓    │ │  │  │
│  │  └───────────────────────────────────────────┘ │  │  │
│  │  ┌───────────────────────────────────────────┐ │  │  │
│  │  │  Move items inside house                  │ │  │  │
│  │  └───────────────────────────────────────────┘ │  │  │
│  └─────────────────────────────────────────────────┘  │  │
│                                                        │  │
│  ┌─────────────────────────────────────────────────┐  │  │
│  │  🔧  Fix Something                         ⌄  │←─┘  │
│  │  Small repairs or adjustments                  │  Large
│  └─────────────────────────────────────────────────┘  tap
│                                                     targets
│  ┌─────────────────────────────────────────────────┐  │
│  │  💻  Computer or Mobile Help               ⌄  │←─┘
│  │  Technology support tasks                      │
│  └─────────────────────────────────────────────────┘
│
│  ... (12 categories total, scrollable)
│
├───────────────────────────────────────────────────────────┤
│  [Clear All]           [Save & Apply (3)]                 │ ← Sticky Footer
└───────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                      TASKS SCREEN LAYOUT                        │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│  Available Tasks                                  🔔 👤   │
├───────────────────────────────────────────────────────────┤
│  [Helper ON 💚] [Categories ▼] [10km ▼] [Nearest ▼] [+ Post] │← Action Bar (Sticky)
├───────────────────────────────────────────────────────────┤
│  Active filters: 📦 Carry/Move  🔧 Fix  +2 sub-skills     │
│                                            Clear all       │
├───────────────────────────────────────────────────────────┤
│  145 tasks available                                      │
├───────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📦 Carry/Move  🚚 Deliver                          │  │
│  │ Help me shift furniture to 3rd floor              │  │
│  │ Need help moving a sofa, bed, and dining table... │  │
│  │ ₹500                            📍 2.3km    [OPEN] │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 🔧 Fix                                              │  │
│  │ Fix bathroom tap leak                              │  │
│  │ Tap is leaking from handle, need quick fix...     │  │
│  │ ₹150                            📍 0.8km    [OPEN] │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 💻 Tech Help                                        │  │
│  │ Help setting up new laptop                         │  │
│  │ Need help installing software and transferring... │  │
│  │ ₹300                            📍 3.5km    [OPEN] │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ... (more tasks)                                         │
└───────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE FLOW                                │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  User selects    │
│  categories in   │
│  modal           │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  UPSERT helper_preferences           │
│                                      │
│  {                                   │
│    user_id: "abc123",                │
│    selected_categories: [            │
│      "carry-move",                   │
│      "fix",                          │
│      "tech-help"                     │
│    ],                                │
│    selected_sub_skills: [            │
│      "Carry luggage",                │
│      "Help shifting items",          │
│      "Fix tap or water leak"         │
│    ],                                │
│    max_distance: 10,                 │
│    is_available: true,               │
│    onboarding_completed: true        │
│  }                                   │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  QUERY tasks with filters            │
│                                      │
│  SELECT t.*, tc.detected_categories  │
│  FROM tasks t                        │
│  LEFT JOIN task_classifications tc  │
│    ON tc.task_id = t.id             │
│  WHERE t.is_hidden = false           │
│    AND t.status IN ('open', null)   │
│    AND t.user_id != 'abc123'        │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  FILTER in JavaScript                │
│                                      │
│  // By categories                    │
│  task.detected_categories.some(cat   │
│    => selectedCategories.includes(   │
│         cat))                        │
│                                      │
│  // By sub-skills                    │
│  taskText.includes(                  │
│    subSkill.toLowerCase())           │
│                                      │
│  // By distance                      │
│  task.distance <= maxDistance        │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  SORT tasks                          │
│                                      │
│  By distance (default)               │
│  By newest                           │
│  By price (highest first)            │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  DISPLAY filtered & sorted tasks     │
└──────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                  KEY INTERACTIONS                               │
└─────────────────────────────────────────────────────────────────┘

1. TAP CATEGORY CARD
   ┌────────────────────────────┐
   │  Entire card is tappable   │ ← 60px+ height
   │  No need to hit checkbox   │
   └────────────────────────────┘

2. EXPAND/COLLAPSE
   ┌────┐
   │ ⌄ │ ← 48px × 48px tap target
   └────┘

3. SELECT SUB-SKILL
   ┌──────────────────────────────────┐
   │  Full-width button (48px height) │ ← Easy to tap
   └──────────────────────────────────┘

4. CLICK TASK
   ┌──────────────────────────────────┐
   │  Entire task card is tappable    │
   │  Auto-enables helper mode        │
   │  Navigates to detail             │
   └──────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                             │
└─────────────────────────────────────────────────────────────────┘

App.tsx
  ├── currentScreen: 'home' | 'tasks' | ...
  ├── helperIsAvailable: boolean
  ├── user: User | null
  └── globalLocation: { lat, lng, area, city }

UnifiedTasksScreen
  ├── tasks: Task[]
  ├── loading: boolean
  ├── helperPreferences: HelperPreferences | null
  ├── showCategoryModal: boolean
  ├── showDistanceModal: boolean
  ├── selectedCategories: string[]
  ├── selectedSubSkills: string[]
  ├── maxDistance: number
  ├── sortBy: 'distance' | 'newest' | 'price'
  └── expandedCategory: string | null

Database (helper_preferences)
  ├── user_id: UUID
  ├── selected_categories: string[]
  ├── selected_sub_skills: string[]
  ├── max_distance: number
  ├── is_available: boolean
  └── onboarding_completed: boolean


┌─────────────────────────────────────────────────────────────────┐
│                      SUCCESS INDICATORS                         │
└─────────────────────────────────────────────────────────────────┘

✅ User can click "Turn On" without being logged in
   → Login modal appears
   → After login, continues to category selection

✅ User can browse tasks without filters
   → All tasks visible, sorted by distance

✅ User can select categories easily on mobile
   → Large tap targets (60px+)
   → No small arrows to hit

✅ User can select sub-skills
   → Full-width buttons (48px height)
   → Clear visual feedback

✅ Distance extends to 100km
   → 7 options: 1, 3, 5, 10, 25, 50, 100

✅ Pricing supports ₹10+
   → No minimum constraint

✅ Clicking task auto-enables helper mode
   → Categories added to preferences
   → is_available set to true
   → User gets future updates

✅ ONE unified screen for all flows
   → No confusion between screens
   → Consistent UX
```

---

## 🎉 YOU'RE ALL SET!

The unified tasks screen is now the **heart of LocalFelo**. It handles:
- Regular task browsing
- Helper mode activation
- Category & sub-skill selection
- Auto-enabling helper mode
- Login requirement
- Mobile-first UX

**Happy helping! 💚**
