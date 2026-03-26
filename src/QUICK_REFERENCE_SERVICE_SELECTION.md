# Service Selection - Quick Reference Card

## 🎯 For Developers

### Component Location
```
/screens/RegisterProfessionalRoleScreen.tsx
Step 2: Service Selection (Lines ~400-600)
```

### Key State Variables
```typescript
const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
// Format: ["repair:tap-repair", "repair:drain-blockage"]

const [customServices, setCustomServices] = useState<CustomService[]>([]);
// Format: [{ name: "Service", category_id: "repair", price: 500 }]

const [showAllServices, setShowAllServices] = useState(false);
// Toggle between recommended and all services

const [showCustomServiceInput, setShowCustomServiceInput] = useState(false);
// Toggle custom service input form
```

---

## 🎨 UI Structure

```
┌─ Header (sticky)
│  - Back button
│  - Title: "Select services you offer"
│  - Count: "X selected" or "Select at least 1"
│
├─ Search Bar
│  - Icon + Input field
│  - Real-time filtering
│
├─ Selected Chips (if any selected)
│  - Removable tags
│  - Bright green background
│
├─ Recommended Services (default view)
│  - 3-8 services from ROLE_SERVICE_MAPPING
│  - Checkbox interface
│  - "Recommended" label
│
├─ View All Button
│  - Expands to show all categories
│  - "View all services ↓"
│
├─ All Services (when expanded)
│  - "Back to recommended ↑"
│  - Grouped by category
│  - All 290+ subcategories
│
├─ Custom Service Input
│  - Collapsible form
│  - Name + Price fields
│  - Auto-category detection
│
└─ Continue Button (fixed bottom)
   - Disabled if no selection
   - Shows count when enabled
```

---

## 🔧 Key Functions

### Toggle Service Selection
```typescript
const toggleSubcategory = (fullId: string) => {
  setSelectedSubcategories(prev =>
    prev.includes(fullId)
      ? prev.filter(id => id !== fullId)
      : [...prev, fullId]
  );
};
```

### Remove from Chip
```typescript
const removeSelectedService = (fullId: string) => {
  setSelectedSubcategories(prev => prev.filter(id => id !== fullId));
};
```

### Get Service Name
```typescript
const getServiceName = (fullId: string) => {
  const [catId, subId] = fullId.split(':');
  const category = allServicesGrouped.find(c => c.id === catId);
  const subcategory = category?.subcategories.find(s => s.id === subId);
  return subcategory?.name || fullId;
};
```

### Smart Category Detection
```typescript
const detectCategory = () => {
  const name = customServiceName.toLowerCase();
  if (name.includes('repair') || name.includes('fix')) return 'repair';
  if (name.includes('clean')) return 'cleaning';
  if (name.includes('install')) return 'installation';
  // ... more keywords
  return 'professional-help'; // Fallback
};
```

---

## 📊 Data Flow

### Input
```typescript
selectedRole: Role
// Contains: id, name, subcategories[]
```

### Process
```typescript
recommendedServices = ROLE_SERVICE_MAPPING[selectedRole.name]
// ["repair:tap-repair", "repair:drain-blockage"]

User selects → selectedSubcategories updated
User adds custom → customServices updated
```

### Output
```typescript
professionalData = {
  subcategory_ids: ["tap-repair", "drain-blockage"],
  services: [
    { service_name: "Custom Service", price: 500 }
  ]
}
```

---

## 🎨 Styling Classes

### Selected Service
```css
bg-[#CDFF00] border-[#CDFF00] shadow-sm
```

### Unselected Service
```css
bg-white border-gray-200 hover:border-[#CDFF00]
```

### Chip
```css
inline-flex items-center gap-1.5 px-3 py-1.5 
bg-[#CDFF00] rounded-full text-sm font-medium
```

### Continue Button (Enabled)
```css
bg-[#CDFF00] text-black hover:bg-[#B8E600]
```

### Continue Button (Disabled)
```css
opacity-50 cursor-not-allowed
```

---

## 🔍 Role → Service Mappings

### Quick Examples
```typescript
ROLE_SERVICE_MAPPING = {
  'Electrician': [
    'repair:ac-repair',
    'repair:fan-repair',
    'repair:wiring-repair',
    'installation:ac-installation',
    // ...
  ],
  'Plumber': [
    'repair:tap-repair',
    'repair:pipe-leakage',
    'repair:drain-blockage'
  ],
  'Driver': [
    'driver-rides:driver-hours',
    'driver-rides:airport-pickup',
    'driver-rides:outstation'
  ]
  // ... 24 total roles
}
```

---

## ✅ Validation Rules

1. **Minimum Selection**: At least 1 service (standard OR custom)
2. **Custom Service Name**: Required if adding custom
3. **Custom Service Price**: Optional, number only
4. **Button State**: Disabled if `totalSelected === 0`

```typescript
const totalSelected = selectedSubcategories.length + customServices.length;
const isValid = totalSelected > 0;
```

---

## 🐛 Common Issues & Solutions

### Issue: Chips not showing
**Solution**: Check that `totalSelected > 0`

### Issue: Search not working
**Solution**: Verify `filteredServices` memo updates

### Issue: Custom category not detected
**Solution**: Add keyword to `detectCategory()` function

### Issue: Button stays disabled
**Solution**: Check `totalSelected` calculation

---

## 🧪 Testing Checklist

```bash
# Standard flow
✓ Select role → See recommended → Select 2-3 → Continue

# Search flow
✓ Enter search → Results filter → Select → Continue

# View all flow
✓ Click "View all" → Browse categories → Select → Continue

# Custom flow
✓ Click "Add custom" → Enter details → Auto-detect → Continue

# Edge cases
✓ Search with no results → Empty state
✓ Remove all selections → Button disabled
✓ Very long service name → Truncates in chip
```

---

## 📱 Responsive Breakpoints

```css
Mobile: < 768px
  - Full width
  - Sticky bottom button
  - Single column

Tablet/Desktop: ≥ 768px
  - Same layout (mobile-first works well)
  - Hover states enabled
```

---

## 🎯 Performance Tips

1. Use `useMemo` for filtered services
2. Use `useMemo` for recommended services
3. Debounce search input (if needed)
4. Virtual scrolling for large lists (future)

---

## 📚 Related Files

- `/services/serviceCategories.ts` - All 27 categories
- `/services/roles.ts` - Role management
- `/services/professionals.ts` - Create professional
- `/constants/` - Category constants

---

## 🔗 Quick Links

- Role Mapping: Line ~21-48
- Service Selection UI: Line ~400-600
- Custom Service Logic: Line ~550-600
- Category Detection: Line ~565-575

---

**Last Updated**: March 22, 2026  
**Maintained By**: LocalFelo Dev Team
