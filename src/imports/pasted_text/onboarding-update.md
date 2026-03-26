Fix the Professional onboarding and mapping system in LocalFelo.

IMPORTANT:
- DO NOT change existing categories or subcategories
- DO NOT change database structure
- ONLY update onboarding UX and mapping logic

-------------------------------------

🧠 CORE LOGIC

- Roles are UI entry points
- Subcategories are used for matching
- Professionals MUST select subcategories

-------------------------------------

🎯 IMPLEMENT THIS FLOW

STEP 1: ROLE SELECTION

Show list of roles:
Electrician, Plumber, Driver, Delivery Partner, Cleaner, Cook / Chef, Teacher / Tutor, Photographer, CA / Accountant, Lawyer, Doctor / Healthcare, Nurse / Caretaker, Technician (IT), Beautician, Mechanic, Event Planner, Pet Caretaker, Consultant, Freelancer, Moving & Packing Helper, Laundry Service, Home Service Professional, Government & ID Services, Partner / Companion, Other

-------------------------------------

STEP 2: SERVICE SELECTION (MANDATORY)

After selecting role:

Show:
→ “Select services you offer”

UI behavior:

1. Show “Recommended services” based on selected role
2. Allow multi-select
3. Include search bar
4. Include “Show all services” option

-------------------------------------

📌 ROLE → SERVICE MAPPING (USE THIS)

Electrician → AC repair, Fan repair, Wiring repair, Switch repair, Inverter repair, Installation services

Plumber → Tap repair, Pipe leakage fix, Drain blockage

Driver → Driver for few hours, Airport pickup/drop, Outstation driver

Delivery Partner → Parcel delivery, Grocery pickup, Medicine pickup, Food pickup

Cleaner → House cleaning, Deep cleaning, Kitchen cleaning, Bathroom cleaning

Cook → Home cooking, Personal cook, Event cooking

Teacher → Tuition, Coding classes, Language learning

Photographer → Event photography, Wedding photography, Product photography

CA → GST filing, Income tax filing, Accounting

Lawyer → Legal advice, Property lawyer, Agreements

Doctor → Consultation

Nurse → Patient care, Elderly care

Technician → Laptop repair, Mobile repair, Software help

Beautician → Haircut, Makeup, Facial

Mechanic → Car repair, Bike repair

Event Planner → Event planning, Decoration

Pet Caretaker → Grooming, Walking

Consultant → Business consulting, Career consulting

Freelancer → Design, Writing, Video editing

Moving Helper → Shifting, Packing, Loading

Laundry → Laundry, Ironing

Home Services → Painting, Pest control, Installation

Government Services → Aadhaar, PAN, Passport

-------------------------------------

⚠️ IMPORTANT RULES

- User MUST select at least 1 service
- Allow selecting services outside recommended list
- Save selected subcategories in database
- Matching must use subcategories only

-------------------------------------

🎨 UX REQUIREMENTS

- Clean, minimal UI
- Show selected count
- Use chips/tags for selected services
- Fast selection (no friction)

-------------------------------------

🚀 GOAL

Make onboarding:
- Fast
- Clear
- Accurate for matching