# ✅ SINGLE SOURCE OF TRUTH - SERVICE CATEGORIES

## 🎯 SYSTEM ARCHITECTURE

LocalFelo now has **ONE authoritative source** for all service categories and subcategories:

**File:** `/services/serviceCategories.ts`

This file contains **ALL** main categories and subcategories used across:
- ✅ **Tasks** module
- ✅ **Professionals** module (recommended services)
- ✅ **Wishes** module

---

## 📊 COMPLETE CATEGORY LIST (24 Categories)

### **Priority Categories (10)** - Shown first
1. ⚡ **Quick Help** (14 subcategories)
2. 🔧 **Repair** (16 subcategories)
3. 🔨 **Installation** (9 subcategories)
4. 🚗 **Driver & Rides** (7 subcategories)
5. 📦 **Delivery & Pickup** (7 subcategories)
6. 🧹 **Cleaning** (9 subcategories)
7. 🍳 **Cooking** (5 subcategories)
8. 🚚 **Shifting & Moving** (5 subcategories)
9. 🏡 **Home Services** (8 subcategories)
10. 🐕 **Pet Care** (5 subcategories)

### **Regular Categories (14)**
11. 📚 **Teaching** (14 subcategories)
12. 🎯 **Coaching & Training** (15 subcategories)
13. 🌟 **Mentorship** (7 subcategories)
14. 💻 **Software & Development** (20 subcategories)
15. 🎨 **Design & Creative** (16 subcategories)
16. 📷 **Photography & Video** (8 subcategories)
17. 💅 **Beauty & Wellness** (9 subcategories)
18. ⚕️ **Healthcare** (6 subcategories)
19. ⚖️ **Legal** (9 subcategories)
20. 💰 **CA & Finance** (10 subcategories)
21. 🎉 **Events & Entertainment** (8 subcategories)
22. ❤️ **Care & Support** (4 subcategories)
23. 🆔 **Government & ID Services** (5 subcategories)
24. 🤝 **Partner / Companion** (4 subcategories)

**TOTAL:** 24 categories, 220+ subcategories

---

## 🔗 HOW PROFESSIONAL ROLES USE THESE CATEGORIES

### **Mapping System:**
Each professional role maps to 1-4 service categories in `/services/professionalRoles.ts`:

```typescript
export const ROLE_TO_SERVICE_CATEGORIES = {
  'Electrician': ['repair', 'installation'],
  'Web Developer': ['software-dev'],
  'Teacher / Tutor': ['teaching'],
  // ... 44 roles total
};
```

### **Registration Flow:**
1. User selects role: **"Electrician"**
2. System looks up mapping: `['repair', 'installation']`
3. System loads ALL subcategories from those categories
4. User sees **25 services** automatically:
   - AC repair, Fridge repair, Washing machine repair... (16 from repair)
   - AC installation, TV installation... (9 from installation)

---

## 📋 DETAILED CATEGORY BREAKDOWN

### ⚡ **QUICK HELP** (14 subcategories)
```
- Carry luggage
- Carry boxes
- Carry heavy items
- Help with shifting
- Help with packing
- Loading / unloading help
- Bring groceries
- Bring medicines
- Bring gas cylinder
- Bring water cans
- Pick up parcel
- Wait in line
- Small errands help
- Other
```

### 🔧 **REPAIR** (16 subcategories)
```
- AC repair
- Fridge repair
- Washing machine repair
- TV repair
- Microwave repair
- Water purifier repair
- Fan repair
- Switch repair
- Wiring repair
- Inverter repair
- Laptop repair
- Mobile repair
- Printer repair
- Car repair
- Bike repair
- Other
```

### 🔨 **INSTALLATION** (9 subcategories)
```
- AC installation
- TV installation
- Washing machine installation
- Fan installation
- Light installation
- Switchboard installation
- Furniture assembly
- Appliance installation
- Other
```

### 🚗 **DRIVER & RIDES** (7 subcategories)
```
- Driver for few hours
- Personal driver
- Airport pickup
- Airport drop
- Outstation driver
- Night driver
- Other
```

### 📦 **DELIVERY & PICKUP** (7 subcategories)
```
- Parcel delivery
- Grocery pickup
- Medicine pickup
- Food pickup
- Document pickup
- Water can delivery
- Other
```

### 🧹 **CLEANING** (9 subcategories)
```
- House cleaning
- Deep cleaning
- Kitchen cleaning
- Bathroom cleaning
- Sofa cleaning
- Mattress cleaning
- Office cleaning
- Shop cleaning
- Other
```

### 🍳 **COOKING** (5 subcategories)
```
- Home cooking
- Personal cook
- Event cooking
- Meal preparation
- Other
```

### 🚚 **SHIFTING & MOVING** (5 subcategories)
```
- House shifting
- Furniture moving
- Packing help
- Loading / unloading
- Other
```

### 🏡 **HOME SERVICES** (8 subcategories)
```
- Painting
- Pest control
- Furniture assembly
- TV installation
- Curtain installation
- Gardening
- Handyman services
- Other
```

### 📚 **TEACHING** (14 subcategories)
```
- Math tuition
- Science tuition
- Physics tuition
- Chemistry tuition
- Biology tuition
- Commerce tuition
- Accounts tuition
- Coding classes
- Language learning
- Spoken English
- Music classes
- Dance classes
- Art classes
- Other
```

### 🎯 **COACHING & TRAINING** (15 subcategories)
```
- Java training
- Python training
- Full stack training
- Data science training
- AI / ML training
- Cloud training
- DevOps training
- Cybersecurity training
- Interview preparation
- Resume building
- Mock interviews
- Communication skills
- Public speaking
- Leadership training
- Other
```

### 🌟 **MENTORSHIP** (7 subcategories)
```
- Career guidance
- Tech mentorship
- Startup mentorship
- Freelancing guidance
- Portfolio review
- Job switching guidance
- Other
```

### 💻 **SOFTWARE & DEVELOPMENT** (20 subcategories)
```
- Website development
- App development
- Frontend development
- Backend development
- Full stack development
- Java development
- Python development
- JavaScript development
- React development
- Angular development
- Node.js development
- API integration
- Bug fixing
- Automation scripts
- AI / ML development
- Data science
- Cloud services
- DevOps
- Cybersecurity
- Other
```

### 🎨 **DESIGN & CREATIVE** (16 subcategories)
```
- UI/UX design
- Graphic design
- Logo design
- Branding
- Video editing
- Reel editing
- Motion graphics
- Animation
- Content writing
- Copywriting
- Blog writing
- Resume design
- Portfolio design
- Social media design
- Presentation design
- Other
```

### 📷 **PHOTOGRAPHY & VIDEO** (8 subcategories)
```
- Event photography
- Wedding photography
- Product photography
- Portrait photography
- Video shoot
- Video editing
- Drone shoot
- Other
```

### 💅 **BEAUTY & WELLNESS** (9 subcategories)
```
- Haircut
- Hair styling
- Makeup
- Bridal makeup
- Facial
- Massage
- Spa
- Skin care
- Other
```

### ⚕️ **HEALTHCARE** (6 subcategories)
```
- Doctor consultation
- Nursing care
- Patient care
- Elderly care
- Home nurse
- Other
```

### ⚖️ **LEGAL** (9 subcategories)
```
- Legal advice
- Property legal help
- Criminal lawyer
- Civil lawyer
- Divorce lawyer
- Corporate lawyer
- Agreement drafting
- Documentation
- Other
```

### 💰 **CA & FINANCE** (10 subcategories)
```
- GST registration
- GST filing
- Income tax filing
- Accounting
- Bookkeeping
- Audit
- Business registration
- Financial planning
- Investment advice
- Other
```

### 🎉 **EVENTS & ENTERTAINMENT** (8 subcategories)
```
- Event planning
- Decoration
- DJ service
- Music performance
- Dance performance
- Anchoring
- Catering support
- Other
```

### 🐕 **PET CARE** (5 subcategories)
```
- Pet grooming
- Pet walking
- Pet sitting
- Pet training
- Other
```

### ❤️ **CARE & SUPPORT** (4 subcategories)
```
- Elderly care
- Patient caretaker
- Home assistance
- Other
```

### 🆔 **GOVERNMENT & ID SERVICES** (5 subcategories)
```
- Aadhaar update
- PAN card help
- Passport help
- Driving license help
- Other
```

### 🤝 **PARTNER / COMPANION** (4 subcategories)
```
- Study partner
- Gym partner
- Travel partner
- Other
```

---

## 🎯 ROLE → CATEGORY EXAMPLES

### **Electrician** → `repair` + `installation` = 25 services
- AC repair, Fridge repair, Fan repair, Wiring repair...
- AC installation, Fan installation, Light installation...

### **Web Developer** → `software-dev` = 20 services
- Website dev, App dev, Frontend, Backend, React, Node.js...

### **Teacher / Tutor** → `teaching` = 14 services
- Math, Science, Physics, Coding, Language, Music, Dance...

### **Beautician** → `beauty-wellness` = 9 services
- Haircut, Makeup, Facial, Spa, Skin care...

### **Freelancer** → `software-dev` + `design-creative` = 36 services
- ALL software development services + ALL design services

---

## ✅ BENEFITS

1. **Single Source of Truth** - One file (`serviceCategories.ts`) for all categories
2. **No Duplication** - Same categories used by Tasks, Professionals, Wishes
3. **Easy Maintenance** - Add one subcategory → all roles using that category get it
4. **Complete Coverage** - 220+ subcategories cover all real-world use cases
5. **Automatic Updates** - Roles automatically show new subcategories when added

---

## 🚀 USAGE GUIDE

### **For Tasks Module:**
```typescript
import { SERVICE_CATEGORIES } from '../services/serviceCategories';
// Show all categories for task creation
```

### **For Professionals Registration:**
```typescript
import { getServiceCategoriesForRole } from '../services/professionalRoles';
import { SERVICE_CATEGORIES } from '../services/serviceCategories';

// Get categories for selected role
const categoryIds = getServiceCategoriesForRole('Electrician');
// Returns: ['repair', 'installation']

// Load ALL subcategories from those categories
categoryIds.forEach(catId => {
  const category = SERVICE_CATEGORIES.find(c => c.id === catId);
  // Show category.subcategories to user
});
```

### **For Wishes Module:**
```typescript
import { SERVICE_CATEGORIES } from '../services/serviceCategories';
// If user selects "Need help", show service categories
// If user selects "Looking to buy", show product categories
```

---

## 📊 STATISTICS

- **Total Categories:** 24
- **Total Subcategories:** 220+
- **Priority Categories:** 10 (shown first)
- **Regular Categories:** 14
- **Professional Roles:** 44
- **Average Services per Role:** 8-25

---

## ⚠️ IMPORTANT RULES

1. **DO NOT** create duplicate categories
2. **DO NOT** use hardcoded service lists
3. **ALWAYS** use subcategories from `serviceCategories.ts`
4. **NEVER** mix product and service categories
5. **ALWAYS** map roles to categories, not individual services

---

**STATUS:** ✅ LOCKED AND PRODUCTION-READY

**Last Updated:** 2026-03-22
