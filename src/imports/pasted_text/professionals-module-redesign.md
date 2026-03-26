Fix and redesign the newly created “Professionals” module in LocalFelo.

IMPORTANT (DO NOT BREAK):
- DO NOT change any existing flows, architecture, or logic
- KEEP header, navigation, and layout consistent with existing app
- KEEP same design system (spacing, typography, colors, components)
- ONLY FIX and EXTEND Professionals module properly

-------------------------------------

🚨 CURRENT ISSUES TO FIX:

- Missing header
- Missing top navigation (Home, Tasks Nearby, Wishes Nearby, Buy & Sell)
- Missing bottom navigation in mobile
- No navigation back
- Cards are not clickable
- Poor UI hierarchy
- No search functionality
- Wrong CTA (“Register” instead of “Register as Professional”)

-------------------------------------

✅ GLOBAL LAYOUT (VERY IMPORTANT)

ALL Professionals screens MUST include:

1. HEADER (same as existing app)
- Logo
- Location selector
- Search icon / profile / notifications

2. TOP NAVIGATION (web)
- Home
- Tasks Nearby
- Wishes Nearby
- Buy & Sell
- ADD: Professionals (active state)

3. BOTTOM NAVIGATION (mobile – redesigned)

-------------------------------------

📱 MOBILE NAVIGATION (NEW DESIGN – VERY IMPORTANT)

Redesign bottom navigation as:

LEFT SIDE:
- Home
- Chat
- Active selected tab (dynamic)

RIGHT SIDE:
- Expandable floating menu (4 options):
  - Tasks
  - Wishes
  - Buy & Sell
  - Professionals

Behavior:
- Default: collapsed
- Shows animated rotating text:
  → Tasks → Wishes → Buy & Sell → Professionals
- On click:
  → expands upward (smooth animation)
  → shows all 4 options
- Selected item moves to LEFT side as active tab

Design:
- Sleek, minimal, modern
- Smooth animation
- Rounded container
- Subtle shadow
- Lemon green highlight

-------------------------------------

📱 PROFESSIONALS CATEGORY PAGE (FIX)

- Add proper header + navigation
- Add SEARCH BAR at top

Search behavior:
- Matches keyword with:
  - Category
  - Subcategory
  - Services
- Show:
  - Relevant categories
  - Relevant professionals

Grid:
- Category cards with images (admin-uploaded)
- Clean spacing
- Clickable

Top Right Button:
→ “Register as Professional”

-------------------------------------

📱 CATEGORY CLICK BEHAVIOR

On click of any category:

→ Navigate to:
  /professionals/[category]/[city]

(MUST be separate page for SEO)

-------------------------------------

📱 PROFESSIONALS LISTING PAGE (FIX)

- Add header + nav
- Add back navigation

Show:
- Professionals list/grid
- Sorted by distance (reuse existing logic)
- Filters:
  - Subcategory
  - Distance

Each card:
- Image
- Name
- Title (CA, Lawyer, etc.)
- Short services
- CTA: Chat on WhatsApp

- Add MAP VIEW toggle (reuse existing tasks/wishes map)

-------------------------------------

📱 PROFESSIONAL DETAIL PAGE (FIX)

- Fully navigable page (not modal)

Sections:
1. Header with back
2. Profile image/logo
3. Name + title
4. Category
5. Image gallery (max 5)
6. Services list
7. CTA: Chat on WhatsApp

-------------------------------------

📱 PROFESSIONAL PROFILE MANAGEMENT (NEW)

Inside Profile section:

Add:
→ “Professional Profile”

If user is registered:
- Show:
  - Edit profile
  - Edit services
  - Manage images

If not:
- Show CTA:
  → “Register as Professional”

-------------------------------------

📱 REGISTER FLOW (FIX)

- Rename button:
  ❌ Register
  ✅ Register as Professional

Form:
- Name
- Title
- Category
- Subcategory
- Services (repeatable)
- Upload images

-------------------------------------

🔍 SEARCH SYSTEM (IMPORTANT)

Search input should:
- Match:
  - Categories
  - Subcategories
  - Services (text)
- Show mixed results:
  - Categories
  - Professionals

-------------------------------------

⚡ INTERACTIONS

- All cards MUST be clickable
- Smooth transitions
- Maintain consistency with app behavior

-------------------------------------

🌐 SEO REQUIREMENT

ALL pages must be separate:
- /professionals
- /professionals/[category]/[city]
- /professional/[slug]

NOT single-page rendering

-------------------------------------

🎨 DESIGN STYLE

- Premium
- Minimal
- Clean spacing
- White + lemon green + black
- No clutter
- High usability

-------------------------------------

🚀 FINAL NOTE

This is NOT a new app.

This is an EXTENSION of existing system.

Everything must feel:
→ consistent
→ connected
→ seamless

Fix all UX issues and redesign professionally.