Design and extend an existing mobile-first + web hybrid product called “LocalFelo”.

IMPORTANT RULES (DO NOT BREAK):
- DO NOT change any existing workflows, logic, architecture, or database schema
- DO NOT modify Tasks, Wishes, Marketplace, or Helper flows
- DO NOT change authentication (login/register)
- ONLY ADD a new module called “Professionals”
- Use same design system, spacing, components, and patterns
- Keep everything minimal, fast, and scalable

-------------------------------------

🎯 OBJECTIVE:
Add a new “Professionals” module to enable businesses and skilled individuals to:
- Create profiles
- List services
- Get discovered
- Receive leads (via WhatsApp for now)

This must be:
- SEO-friendly (separate pages with unique URLs)
- Mobile-first
- Lightweight (no heavy forms or complexity)

-------------------------------------

🧭 NAVIGATION UPDATE:

Add a new tab:
→ “Professionals”

Position:
Home | Tasks | Wishes | Marketplace | Professionals

-------------------------------------

📱 SCREEN 1: PROFESSIONALS CATEGORY PAGE

- Grid layout (2 columns mobile, 4 desktop)
- Cards with:
  - Image thumbnail (admin-uploaded)
  - Category name

Use EXISTING categories:
- Accounting & Tax
- Medical Help
- Document Help
- Teaching & Learning
- Tech Help
- Beauty & Wellness
- Home Services
- etc.

TOP RIGHT BUTTON:
→ “Register as Professional”

-------------------------------------

📱 SCREEN 2: PROFESSIONALS LISTING PAGE

URL format:
→ /professionals/[category]/[city]

Features:
- List/grid of professionals
- Sorted by distance (use existing location logic)
- Filters:
  - Subcategory
  - Distance
  - Availability (future-ready UI)

Each card includes:
- Profile image (thumbnail)
- Name
- Professional title (e.g., CA, Lawyer, Doctor)
- Category/subcategory
- Short service preview
- CTA: “Chat on WhatsApp”

Also include:
- Map view toggle (reuse existing map UI from tasks/wishes)

-------------------------------------

📱 SCREEN 3: PROFESSIONAL DETAIL PAGE

URL format:
→ /professional/[slug]

Must be SEO-friendly and indexable

Sections:

1. Header
- Logo/profile image
- Name
- Professional title
- Category tag

2. Image Gallery
- Max 3–5 images
- Scrollable

3. Services
- List of services with optional pricing

4. Description (optional)

5. CTA:
→ “Chat on WhatsApp”

Pre-filled message:
"Hi, I found you on LocalFelo regarding [service]. Are you available?"

-------------------------------------

📱 SCREEN 4: REGISTER AS PROFESSIONAL

Form (simple, low friction):

- Name / Business name
- Professional title (free text)
- Select category (existing categories)
- Select subcategory
- Add services (repeatable fields):
  - Service name (free text)
  - Price (optional)
- Upload:
  - Profile image (required)
  - Gallery images (max 5)
- Location (same logic as app)

NO complex fields (no experience, certifications, etc.)

-------------------------------------

📱 SCREEN 5: ADMIN PANEL (SIMPLE)

Admin can:
- Upload category images (for category cards)
- Approve/reject professionals (optional UI)
- View list of professionals

-------------------------------------

🧠 MATCHING & INTEGRATION (IMPORTANT):

- DO NOT create separate logic
- Use existing category + subcategory system
- Professionals must also be notified for:
  - Tasks
  - Wishes

Matching logic (MVP):
- Category match
- Subcategory match

-------------------------------------

⚡ INTERACTION MODEL:

- NO request-approval delay
- NO phone number display

Use:
→ WhatsApp click (existing system)

-------------------------------------

🌐 SEO REQUIREMENTS:

Create separate pages (NOT SPA-only):

- /professionals/[category]/[city]
- /professional/[slug]

Each page must:
- Be indexable
- Have unique metadata
- Load fast
- Be shareable

-------------------------------------

🎨 DESIGN STYLE:

- White background
- Lemon green accent
- Black typography
- Inter font
- Minimal, high spacing
- Clean cards
- No clutter

-------------------------------------

🧩 DATABASE (SUPABASE) — ADD ONLY NEW TABLES

Do NOT modify existing tables.

Create:

1. professionals
- id (uuid)
- user_id (uuid)
- name
- title
- category_id
- subcategory_id
- description
- location_lat
- location_lng
- city
- profile_image_url
- created_at

2. professional_services
- id
- professional_id
- service_name
- price

3. professional_images
- id
- professional_id
- image_url

4. professional_categories_images
- id
- category_id
- image_url

-------------------------------------

🧾 PROVIDE SQL QUERIES (SUPABASE):

At the end, generate SQL queries for all above tables.

-------------------------------------

🚀 FINAL NOTE:

This is NOT a directory system.

This is:
→ A demand-driven + discovery-enabled professional layer

Keep it:
- Fast
- Simple
- Scalable

DO NOT overbuild.