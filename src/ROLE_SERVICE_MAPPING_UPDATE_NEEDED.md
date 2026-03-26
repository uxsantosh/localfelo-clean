# ⚠️ ROLE → SERVICE MAPPING UPDATE REQUIRED

## 🎯 PROBLEM IDENTIFIED

The user's service mappings contain **CUSTOM, ROLE-SPECIFIC** services that don't exist in the main service categories file (`/services/serviceCategories.ts`).

For example:

### **Plumber** (User's Specification):
```
- Tap repair
- Pipe leakage fix
- Drain blockage
- Water tank cleaning
- Bathroom fitting installation
- Other
```

### **Current System** (serviceCategories.ts):
```
REPAIR category contains:
- AC repair
- Fridge repair
- Washing machine repair
- TV repair
- etc.

❌ Does NOT contain plumbing-specific services
```

---

## 📊 MAPPING ANALYSIS

### **Roles with CUSTOM Services** (Not in Main Categories):

1. **Plumber**
   - Tap repair ❌
   - Pipe leakage fix ❌
   - Drain blockage ❌
   - Water tank cleaning ❌
   - Bathroom fitting installation ❌

2. **Carpenter**
   - Door repair ❌
   - Furniture repair ❌

3. **Delivery Partner**
   - New role entirely ✨

4. **Helper**
   - New role entirely ✨

5. **Errand Runner**
   - New role entirely ✨

6. **Moving & Packing Helper**
   - New role entirely ✨

7. **Event Helper**
   - New role entirely ✨

8. **Partner / Companion**
   - Now has services ✨

9. **Beautician**
   - Lists "Haircut" (generally salon service)

10. **Fitness Trainer / Yoga Instructor**
   - Custom fitness/yoga services ❌

---

## 🔧 SOLUTION OPTIONS

### **Option 1: Add Custom Services to Main Categories** (RECOMMENDED)
Add role-specific subcategories to existing categories:

```typescript
{
  id: 'plumbing',
  name: 'Plumbing',
  emoji: '🚰',
  priority: 1,
  subcategories: [
    { id: 'tap-repair', name: 'Tap repair' },
    { id: 'pipe-leakage', name: 'Pipe leakage fix' },
    { id: 'drain-blockage', name: 'Drain blockage' },
    { id: 'water-tank-cleaning', name: 'Water tank cleaning' },
    { id: 'bathroom-fitting', name: 'Bathroom fitting installation' },
  ],
},
```

### **Option 2: Use Custom Service Input**
Allow professionals to add custom services during registration (already exists in the system).

### **Option 3: Create Role-Specific Service Lists**
Store services as simple strings instead of `category:subcategory` format.

---

## 📋 NEW ROLES ADDED (5 Total)

| # | Role | Group | Total Roles Now |
|---|------|-------|-----------------|
| 1 | **Delivery Partner** | ⭐ Most Common | 48 |
| 2 | **Helper** | 🧰 Support & Field Work | 49 |
| 3 | **Errand Runner** | 🧰 Support & Field Work | 50 |
| 4 | **Moving & Packing Helper** | 🧰 Support & Field Work | 51 |
| 5 | **Event Helper** | 🧰 Support & Field Work | 52 |

**Previous Total:** 44 roles (removed: Business Consultant)  
**New Total:** 49 roles  

---

## ✅ UPDATED GROUP STRUCTURE

### **New Group: 🧰 Support & Field Work**
```
- Helper
- Errand Runner
- Moving & Packing Helper
- Event Helper
- Security Guard
```

### **Others Group Updated:**
```
- Pet Caretaker
- Laundry Service
- Tailor
- Barber
- Government & ID Services
- Partner / Companion  ← Now has services
```

---

## 🎯 RECOMMENDED APPROACH

### **Phase 1: Update Roles** ✅ DONE
- Added 5 new roles
- Created new group "Support & Field Work"
- Updated LOCKED_PROFESSIONAL_ROLES
- Total: 49 roles

### **Phase 2: Service Mapping** (NEEDS DECISION)
Choose one:

**A) Expand Main Categories** (Best for accurate matching)
- Add plumbing, carpentry, fitness, yoga, tailoring, etc. as categories
- Map roles to these specific categories
- Tasks can match accurately

**B) Use Custom Services Only** (Simpler but less accurate)
- Professionals manually add services during registration
- Relies on text search for matching
- Less structured

**C) Hybrid Approach** (RECOMMENDED)
- Keep general categories for most roles
- Allow custom services for special cases
- Best of both worlds

---

## 📝 ACTION NEEDED

**User must decide:**
1. Should we add new service categories (plumbing, carpentry, fitness, etc.)?
2. Or use custom services for role-specific tasks?
3. Or keep current system and let professionals add custom services?

**Current Status:**
- ✅ 49 roles defined
- ✅ Groups organized
- ⚠️ Service mappings use old category system
- ⚠️ Some services don't exist in categories

---

**Awaiting user decision on how to handle custom services...**
