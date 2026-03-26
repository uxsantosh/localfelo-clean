Redesign and fix the entire “Professionals” module in LocalFelo using a ROLE-BASED SYSTEM while keeping the existing backend categories and subcategories completely unchanged.

-------------------------------------

🚨 STRICT RULES (DO NOT BREAK)

- DO NOT modify existing category or subcategory tables
- DO NOT change Tasks, Wishes, Marketplace, Helper flows
- DO NOT change authentication or core architecture
- DO NOT remove or rename any existing categories/subcategories
- DO NOT break existing matching logic

ONLY:
- Replace Professionals UI
- Add Role layer (UI + mapping)
- Extend system without affecting current flows

-------------------------------------

🧠 CORE PRINCIPLE

Users think in:
→ ROLES (Electrician, Doctor, CA)

System works in:
→ SUBCATEGORIES (fan repair, GST filing)

Solution:
→ Introduce ROLE layer mapped to subcategories

-------------------------------------

🧩 ROLE SYSTEM (NEW)

Create a new lightweight system:

Role:
- name
- image (uploaded from admin)
- mapped_subcategories (array)

Example:

Electrician →
- fan repair
- switch repair
- electrical wiring repair

Plumber →
- tap repair
- drain blockage

Driver →
- bike ride
- car ride
- airport drop

CA →
- gst filing
- income tax filing

Doctor →
- consultation
- physiotherapy
- patient care

-------------------------------------

📦 DATABASE (ADD NEW TABLE ONLY)

Create new table:

roles
- id
- name
- image_url
- created_at

role_subcategories
- id
- role_id
- subcategory_id

DO NOT MODIFY existing tables

-------------------------------------

🛠 ADMIN PANEL (UPDATE)

Replace:
❌ Category Image Upload

With:
✅ Role Image Upload

Admin can:
- Create role
- Upload image for role
- Map subcategories to role

-------------------------------------

📱 SCREEN 1: PROFESSIONALS HOME (FIX)

REPLACE existing category grid completely

❌ REMOVE:
Task-based categories (Carry, Delivery, etc.)

✅ SHOW:
Role-based cards:

- Electrician
- Plumber
- Driver
- Delivery Partner
- Cleaner
- Cook / Chef
- Teacher
- Photographer
- CA / Accountant
- Lawyer
- Doctor
- Nurse / Caretaker
- Technician (Laptop/Mobile)
- Beautician
- Mechanic
- Event Planner
- Pet Caretaker
- Consultant
- Freelancer
- Other

Each card:
- Role image (admin uploaded)
- Role name

-------------------------------------

🔍 SEARCH (IMPORTANT)

Search must match:

- Role name
- Subcategories
- Services text

Return:
- Roles
- Professionals

-------------------------------------

📱 SCREEN 2: PROFESSIONAL CREATION (FIX)

❌ REMOVE:
Category selection UI

✅ NEW FLOW:

Step 1:
“What do you do?”
→ Select ROLE

Step 2:
Auto-map:
→ category_id
→ subcategory_ids

Step 3:
Add services (optional)

Step 4:
Upload images

-------------------------------------

📱 SCREEN 3: PROFESSIONAL LISTING

On role click:

→ Fetch professionals where:
subcategory ∈ role_subcategories

Sort:
- By distance (existing logic)

Filters:
- Subcategory
- Distance

Cards:
- Image
- Name
- Role (not category)
- Services
- WhatsApp CTA

-------------------------------------

📱 SCREEN 4: PROFESSIONAL DETAIL

- Show Role prominently
- Hide category terminology
- Show:
  - Images
  - Services
  - CTA

-------------------------------------

📱 PROFILE SECTION (NEW)

Add:

→ “Professional Profile”

If registered:
- Edit role
- Edit services
- Manage images

-------------------------------------

🔁 MATCHING LOGIC (EXTEND ONLY)

DO NOT change existing logic

When task is created:

- Match subcategory
- Notify:
  - Helpers
  - Professionals where subcategory matches role mapping

-------------------------------------

🌐 SEO (KEEP)

- /professionals/[role]/[city]
- /professional/[slug]

-------------------------------------

🎨 DESIGN RULES

- Never show raw categories to professionals
- Always show roles
- Clean, minimal, premium UI
- White + lemon green + black
- High spacing

-------------------------------------

🚀 FINAL GOAL

User:
“I need electrician”

System:
Maps → fan repair, wiring

Professional:
“I am electrician”

System:
Maps → repair subcategories

-------------------------------------

💣 FINAL RULE

Roles = UI layer  
Categories = backend logic  

DO NOT mix them
DO NOT expose categories in professionals UI

-------------------------------------