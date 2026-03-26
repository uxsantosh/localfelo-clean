Fix and enhance the “Select services you offer” screen in LocalFelo Professional onboarding.

IMPORTANT:
- DO NOT change existing categories or subcategories
- DO NOT change database structure
- ONLY improve UI, UX, and service selection logic

-------------------------------------

🧠 CORE PRINCIPLE

- Roles = entry point
- Services (subcategories) = matching engine
- Service selection is MANDATORY

-------------------------------------

🎯 FINAL UI STRUCTURE

1. TOP SECTION

- Search bar (Search services…)
- Selected count text:
  “0 selected • Select at least 1”

-------------------------------------

2. SECTION: RECOMMENDED FOR YOU (PRIMARY)

- Title: “Recommended for you”
- Show 3–8 services based on selected role
- Multi-select checkboxes
- Tag each as “Recommended”

Example (Plumber):
- Tap repair
- Pipe leakage fix
- Drain blockage

-------------------------------------

3. ACTION: VIEW ALL SERVICES

- Place BELOW recommended section
- Label: “View all services →”
- Secondary visual priority (not dominant)

On click:
→ Expand or open full category + subcategory list
→ Same structure as task creation categories

-------------------------------------

4. FULL SERVICES VIEW

- Group by main categories
- Show subcategories as selectable items
- Include search functionality
- Allow multi-select

-------------------------------------

5. ADD CUSTOM SERVICE (IMPORTANT)

Add button at bottom:

👉 “+ Add your service”

On click:
- Open input field
- User enters service name
- Optional: price field

-------------------------------------

🧠 CUSTOM SERVICE LOGIC

- DO NOT ask user to select category
- Automatically map to closest main category
- Store:
  - service_name (text)
  - category_id
  - is_custom = true

- Matching:
  → Custom services use category-level matching

-------------------------------------

6. SELECTION FEEDBACK (IMPORTANT UX)

- Show selected services as removable chips
  Example:
  [ Tap repair ✕ ] [ Drain blockage ✕ ]

- Update count dynamically:
  “2 services selected”

-------------------------------------

7. CTA BUTTON

- Sticky bottom button:
  “Continue”

- Disabled until at least 1 service selected

-------------------------------------

🎨 DESIGN GUIDELINES

- Clean, minimal UI
- Clear hierarchy:
  Recommended > View all > Full list
- Fast interaction (no friction)
- Mobile-first design

-------------------------------------

⚠️ IMPORTANT RULES

- User MUST select at least 1 service
- Allow selecting beyond recommended
- Allow unlimited selections
- Do NOT overwhelm user initially

-------------------------------------

🚀 FINAL GOAL

- Fast onboarding (under 10 seconds)
- Accurate service selection
- No confusion
- Flexible for all types of professionals