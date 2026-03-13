// =====================================================
// SERVICE CATEGORIES WITH SUBCATEGORIES
// Updated 24 main categories for helper preferences
// =====================================================

export interface ServiceSubcategory {
  id: string;
  name: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  emoji: string;
  priority: number; // 1 = High priority, 0 = Regular
  subcategories: ServiceSubcategory[];
}

// =====================================================
// ALL 24 SERVICE CATEGORIES WITH SUBCATEGORIES
// =====================================================
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'bring-something',
    name: 'Bring Something',
    emoji: '🎒',
    priority: 1,
    subcategories: [
      { id: 'medicine-pharmacy', name: 'Medicine from pharmacy' },
      { id: 'gas-cylinder', name: 'Gas cylinder' },
      { id: 'water-cans', name: 'Water cans' },
      { id: 'laptop-charger', name: 'Laptop / charger' },
      { id: 'documents-files', name: 'Documents / files' },
      { id: 'office-supplies', name: 'Office supplies' },
      { id: 'keys-wallet', name: 'Keys / wallet' },
      { id: 'clothes-shoes', name: 'Clothes / shoes' },
      { id: 'baby-essentials', name: 'Baby essentials' },
      { id: 'hardware-items', name: 'Hardware items' },
      { id: 'tools-shop', name: 'Tools from shop' },
      { id: 'parcel-shop', name: 'Parcel from shop' },
      { id: 'parcel-security', name: 'Collect parcel from security' },
      { id: 'pickup-friend', name: 'Pick up from friend / family' },
      { id: 'pickup-office', name: 'Pick up from office' },
      { id: 'forgotten-home', name: 'Bring forgotten item from home' },
      { id: 'apartment-gate', name: 'Bring item from apartment gate' },
      { id: 'emergency-pickup', name: 'Emergency item pickup' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'ride-transport',
    name: 'Ride / Transport',
    emoji: '🚗',
    priority: 1,
    subcategories: [
      { id: 'bike-ride', name: 'Bike ride' },
      { id: 'car-ride', name: 'Car ride' },
      { id: 'office-drop', name: 'Office drop' },
      { id: 'office-pickup', name: 'Office pickup' },
      { id: 'airport-drop', name: 'Airport drop' },
      { id: 'airport-pickup', name: 'Airport pickup' },
      { id: 'station-drop', name: 'Railway station drop' },
      { id: 'station-pickup', name: 'Railway station pickup' },
      { id: 'school-drop', name: 'School drop' },
      { id: 'school-pickup', name: 'School pickup' },
      { id: 'late-night', name: 'Late night ride' },
      { id: 'emergency-ride', name: 'Emergency ride' },
      { id: 'outstation', name: 'Outstation ride' },
      { id: 'driver-hours', name: 'Driver for few hours' },
      { id: 'errands-ride', name: 'Ride for errands' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'repair',
    name: 'Repair',
    emoji: '🔧',
    priority: 1,
    subcategories: [
      { id: 'fan-repair', name: 'Fan repair' },
      { id: 'switch-repair', name: 'Switch repair' },
      { id: 'electrical-wiring', name: 'Electrical wiring repair' },
      { id: 'plumbing-repair', name: 'Plumbing repair' },
      { id: 'tap-repair', name: 'Tap repair' },
      { id: 'drain-blockage', name: 'Drain blockage' },
      { id: 'laptop-repair', name: 'Laptop repair' },
      { id: 'mobile-repair', name: 'Mobile repair' },
      { id: 'printer-repair', name: 'Printer repair' },
      { id: 'ac-repair', name: 'AC repair' },
      { id: 'fridge-repair', name: 'Fridge repair' },
      { id: 'washing-machine', name: 'Washing machine repair' },
      { id: 'microwave-repair', name: 'Microwave repair' },
      { id: 'purifier-repair', name: 'Water purifier repair' },
      { id: 'mixer-repair', name: 'Mixer repair' },
      { id: 'grinder-repair', name: 'Grinder repair' },
      { id: 'tv-repair', name: 'TV repair' },
      { id: 'furniture-repair', name: 'Furniture repair' },
      { id: 'door-repair', name: 'Door repair' },
      { id: 'window-repair', name: 'Window repair' },
      { id: 'lock-repair', name: 'Lock repair' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'delivery',
    name: 'Delivery',
    emoji: '🚚',
    priority: 1,
    subcategories: [
      { id: 'parcel-delivery', name: 'Parcel delivery' },
      { id: 'document-delivery', name: 'Document delivery' },
      { id: 'medicine-delivery', name: 'Medicine delivery' },
      { id: 'courier-pickup', name: 'Courier pickup' },
      { id: 'gift-delivery', name: 'Gift delivery' },
      { id: 'office-file', name: 'Office file delivery' },
      { id: 'shop-pickup', name: 'Shop pickup delivery' },
      { id: 'package-delivery', name: 'Package delivery' },
      { id: 'same-day', name: 'Same day delivery' },
      { id: 'express-delivery', name: 'Express delivery' },
      { id: 'station-pickup', name: 'Station pickup delivery' },
      { id: 'gate-pickup', name: 'Apartment gate pickup delivery' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    emoji: '🧹',
    priority: 1,
    subcategories: [
      { id: 'house-cleaning', name: 'House cleaning' },
      { id: 'room-cleaning', name: 'Room cleaning' },
      { id: 'kitchen-cleaning', name: 'Kitchen cleaning' },
      { id: 'bathroom-cleaning', name: 'Bathroom cleaning' },
      { id: 'deep-cleaning', name: 'Deep cleaning' },
      { id: 'balcony-cleaning', name: 'Balcony cleaning' },
      { id: 'window-cleaning', name: 'Window cleaning' },
      { id: 'office-cleaning', name: 'Office cleaning' },
      { id: 'car-cleaning', name: 'Car cleaning' },
      { id: 'sofa-cleaning', name: 'Sofa cleaning' },
      { id: 'mattress-cleaning', name: 'Mattress cleaning' },
      { id: 'moveout-cleaning', name: 'Move-out cleaning' },
      { id: 'floor-cleaning', name: 'Floor cleaning' },
      { id: 'dusting', name: 'Dusting help' },
      { id: 'party-cleaning', name: 'Post-party cleaning' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'cooking',
    name: 'Cooking',
    emoji: '🍳',
    priority: 1,
    subcategories: [
      { id: 'daily-cooking', name: 'Daily home cooking' },
      { id: 'party-chef', name: 'Chef for party' },
      { id: 'meal-prep', name: 'Meal preparation' },
      { id: 'vegetarian', name: 'Vegetarian cooking' },
      { id: 'nonveg', name: 'Non-veg cooking' },
      { id: 'diet-cooking', name: 'Diet cooking' },
      { id: 'baby-food', name: 'Baby food preparation' },
      { id: 'festival', name: 'Festival cooking' },
      { id: 'breakfast', name: 'Breakfast cooking' },
      { id: 'lunch', name: 'Lunch cooking' },
      { id: 'dinner', name: 'Dinner cooking' },
      { id: 'assistant', name: 'Cooking assistant' },
      { id: 'events', name: 'Cooking help for events' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'moving-packing',
    name: 'Moving & Packing',
    emoji: '📦',
    priority: 1,
    subcategories: [
      { id: 'house-shifting', name: 'House shifting' },
      { id: 'office-shifting', name: 'Office shifting' },
      { id: 'furniture-moving', name: 'Furniture moving' },
      { id: 'packing', name: 'Packing help' },
      { id: 'unpacking', name: 'Unpacking help' },
      { id: 'loading', name: 'Loading help' },
      { id: 'unloading', name: 'Unloading help' },
      { id: 'heavy-lifting', name: 'Heavy item lifting' },
      { id: 'appliance', name: 'Appliance moving' },
      { id: 'bed-shifting', name: 'Bed shifting' },
      { id: 'cupboard', name: 'Cupboard shifting' },
      { id: 'local-shifting', name: 'Local shifting help' },
      { id: 'boxes', name: 'Moving boxes help' },
      { id: 'truck-loading', name: 'Truck loading help' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'stay-accommodation',
    name: 'Stay & Accommodation',
    emoji: '🏨',
    priority: 1,
    subcategories: [
      { id: 'short-stay', name: 'Find short stay' },
      { id: 'pg-hostel', name: 'Find PG / hostel' },
      { id: 'student-accommodation', name: 'Find student accommodation' },
      { id: 'ladies-stay', name: 'Find ladies stay' },
      { id: 'guest-house', name: 'Find guest house / hotel' },
      { id: 'room-flat-rent', name: 'Find room or flat for rent' },
      { id: 'flatmate-sharing', name: 'Find flatmate / room sharing' },
      { id: 'offer-homestay', name: 'Offer home stay / room stay' },
      { id: 'arrange-stay', name: 'Help arrange stay' },
      { id: 'emergency-stay', name: 'Emergency place to stay' },
      { id: 'other', name: 'Other stay help' },
    ],
  },
  {
    id: 'mentorship',
    name: 'Mentorship',
    emoji: '🎯',
    priority: 1,
    subcategories: [
      { id: 'software-dev', name: 'Software development mentorship' },
      { id: 'software-testing', name: 'Software testing mentorship' },
      { id: 'ui-ux', name: 'UI / UX design mentorship' },
      { id: 'graphic-design', name: 'Graphic design mentorship' },
      { id: 'product-management', name: 'Product management mentorship' },
      { id: 'data-science', name: 'Data science mentorship' },
      { id: 'ai-ml', name: 'AI / machine learning mentorship' },
      { id: 'digital-marketing', name: 'Digital marketing mentorship' },
      { id: 'startup', name: 'Startup mentorship' },
      { id: 'freelancing', name: 'Freelancing mentorship' },
      { id: 'career-switching', name: 'Career switching guidance' },
      { id: 'resume-portfolio', name: 'Resume / portfolio review' },
      { id: 'interview-prep', name: 'Interview preparation mentoring' },
      { id: 'leadership', name: 'Leadership / management mentoring' },
      { id: 'student-guidance', name: 'Student career guidance' },
      { id: 'other', name: 'Other mentorship' },
    ],
  },
  {
    id: 'teaching-learning',
    name: 'Teaching & Learning',
    emoji: '📚',
    priority: 0,
    subcategories: [
      { id: 'math', name: 'Math tutoring' },
      { id: 'science', name: 'Science tutoring' },
      { id: 'physics', name: 'Physics tutoring' },
      { id: 'chemistry', name: 'Chemistry tutoring' },
      { id: 'biology', name: 'Biology tutoring' },
      { id: 'coding', name: 'Coding lessons' },
      { id: 'spoken-english', name: 'Spoken English' },
      { id: 'ielts', name: 'IELTS coaching' },
      { id: 'language', name: 'Language learning' },
      { id: 'public-speaking', name: 'Public speaking training' },
      { id: 'excel', name: 'Excel training' },
      { id: 'guitar', name: 'Guitar lessons' },
      { id: 'piano', name: 'Piano lessons' },
      { id: 'dance', name: 'Dance lessons' },
      { id: 'singing', name: 'Singing lessons' },
      { id: 'exam-prep', name: 'Competitive exam preparation' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'photography-videography',
    name: 'Photography & Videography',
    emoji: '📷',
    priority: 0,
    subcategories: [
      { id: 'event-photo', name: 'Event photography' },
      { id: 'wedding-photo', name: 'Wedding photography' },
      { id: 'portrait', name: 'Portrait photography' },
      { id: 'product', name: 'Product photography' },
      { id: 'real-estate', name: 'Real estate photography' },
      { id: 'drone', name: 'Drone photography' },
      { id: 'event-video', name: 'Event videography' },
      { id: 'wedding-video', name: 'Wedding videography' },
      { id: 'corporate-video', name: 'Corporate video shoot' },
      { id: 'youtube', name: 'YouTube video shoot' },
      { id: 'reel', name: 'Social media reel shoot' },
      { id: 'video-edit', name: 'Video editing' },
      { id: 'photo-edit', name: 'Photo editing' },
      { id: 'fashion', name: 'Fashion photography' },
      { id: 'food-photo', name: 'Food photography' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'accounting-tax',
    name: 'Accounting & Tax',
    emoji: '📊',
    priority: 0,
    subcategories: [
      { id: 'income-tax', name: 'Income tax filing' },
      { id: 'gst', name: 'GST filing' },
      { id: 'bookkeeping', name: 'Bookkeeping' },
      { id: 'financial', name: 'Financial statements' },
      { id: 'startup', name: 'Startup accounting' },
      { id: 'payroll', name: 'Payroll management' },
      { id: 'registration', name: 'Business registration' },
      { id: 'tax-consult', name: 'Tax consultation' },
      { id: 'audit', name: 'Audit help' },
      { id: 'investment', name: 'Investment advice' },
      { id: 'compliance', name: 'Company compliance' },
      { id: 'tds', name: 'TDS filing' },
      { id: 'tax-planning', name: 'Tax planning' },
      { id: 'ca-consult', name: 'CA consultation' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'medical-help',
    name: 'Medical Help',
    emoji: '⚕️',
    priority: 0,
    subcategories: [
      { id: 'nurse', name: 'Nurse assistance' },
      { id: 'patient-care', name: 'Patient care' },
      { id: 'home-nurse', name: 'Home nurse' },
      { id: 'post-surgery', name: 'Post surgery care' },
      { id: 'physiotherapy', name: 'Physiotherapy help' },
      { id: 'hospital-support', name: 'Hospital visit support' },
      { id: 'attendant', name: 'Medical attendant' },
      { id: 'injection', name: 'Injection help' },
      { id: 'appointment', name: 'Doctor appointment assistance' },
      { id: 'monitoring', name: 'Health monitoring' },
      { id: 'medicine', name: 'Medicine assistance' },
      { id: 'equipment', name: 'Medical equipment setup' },
      { id: 'transport', name: 'Medical transport help' },
      { id: 'emergency', name: 'Emergency medical help' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'tech-help',
    name: 'Tech Help',
    emoji: '💻',
    priority: 1,
    subcategories: [
      { id: 'laptop', name: 'Laptop repair' },
      { id: 'computer', name: 'Computer repair' },
      { id: 'wifi', name: 'WiFi setup' },
      { id: 'router', name: 'Router setup' },
      { id: 'printer', name: 'Printer setup' },
      { id: 'smart-tv', name: 'Smart TV setup' },
      { id: 'software', name: 'Software installation' },
      { id: 'data-recovery', name: 'Data recovery' },
      { id: 'virus', name: 'Virus removal' },
      { id: 'data-transfer', name: 'Phone data transfer' },
      { id: 'email', name: 'Email setup' },
      { id: 'upgrade', name: 'Computer upgrade' },
      { id: 'internet', name: 'Internet troubleshooting' },
      { id: 'device-setup', name: 'Device setup' },
      { id: 'cloud', name: 'Cloud storage setup' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'pet-care',
    name: 'Pet Care',
    emoji: '🐕',
    priority: 1,
    subcategories: [
      { id: 'walking', name: 'Dog walking' },
      { id: 'sitting', name: 'Pet sitting' },
      { id: 'feeding', name: 'Pet feeding' },
      { id: 'grooming', name: 'Pet grooming' },
      { id: 'vet', name: 'Vet visit help' },
      { id: 'bathing', name: 'Pet bathing' },
      { id: 'training', name: 'Pet training help' },
      { id: 'transport', name: 'Pet transport' },
      { id: 'boarding', name: 'Pet boarding help' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'laundry',
    name: 'Laundry',
    emoji: '🧺',
    priority: 1,
    subcategories: [
      { id: 'washing', name: 'Clothes washing' },
      { id: 'ironing', name: 'Clothes ironing' },
      { id: 'dry-cleaning', name: 'Dry cleaning pickup' },
      { id: 'folding', name: 'Laundry folding' },
      { id: 'steam', name: 'Steam ironing' },
      { id: 'blanket', name: 'Blanket washing' },
      { id: 'curtain', name: 'Curtain washing' },
      { id: 'pickup-drop', name: 'Laundry pickup and drop' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'home-services',
    name: 'Home Services',
    emoji: '🏠',
    priority: 0,
    subcategories: [
      { id: 'painting', name: 'Painting' },
      { id: 'electrical', name: 'Electrical installation' },
      { id: 'furniture-assembly', name: 'Furniture assembly' },
      { id: 'curtain-rod', name: 'Curtain rod installation' },
      { id: 'tv-mount', name: 'TV wall mount' },
      { id: 'gardening', name: 'Gardening help' },
      { id: 'pest-control', name: 'Pest control' },
      { id: 'interior', name: 'Interior design consultation' },
      { id: 'maintenance', name: 'Home maintenance' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'beauty-wellness',
    name: 'Beauty & Wellness',
    emoji: '💄',
    priority: 0,
    subcategories: [
      { id: 'haircut', name: 'Haircut' },
      { id: 'styling', name: 'Hair styling' },
      { id: 'coloring', name: 'Hair coloring' },
      { id: 'beard', name: 'Beard trimming' },
      { id: 'bridal', name: 'Bridal makeup' },
      { id: 'party-makeup', name: 'Party makeup' },
      { id: 'facial', name: 'Facial' },
      { id: 'threading', name: 'Threading' },
      { id: 'spa', name: 'Spa therapy' },
      { id: 'body-massage', name: 'Body massage' },
      { id: 'head-massage', name: 'Head massage' },
      { id: 'skin-care', name: 'Skin care' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'event-help',
    name: 'Event Help',
    emoji: '🎉',
    priority: 0,
    subcategories: [
      { id: 'party', name: 'Party planning' },
      { id: 'wedding', name: 'Wedding planning' },
      { id: 'decoration', name: 'Decoration help' },
      { id: 'coordination', name: 'Event coordination' },
      { id: 'catering', name: 'Catering support' },
      { id: 'dj', name: 'DJ setup help' },
      { id: 'photo-coord', name: 'Event photography coordination' },
      { id: 'venue', name: 'Venue setup help' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'professional-help',
    name: 'Professional Help',
    emoji: '💼',
    priority: 0,
    subcategories: [
      { id: 'legal', name: 'Legal advice' },
      { id: 'startup', name: 'Startup consulting' },
      { id: 'business', name: 'Business consulting' },
      { id: 'career', name: 'Career counseling' },
      { id: 'resume', name: 'Resume building' },
      { id: 'interview', name: 'Interview preparation' },
      { id: 'marketing', name: 'Marketing consulting' },
      { id: 'financial', name: 'Financial planning' },
      { id: 'freelance', name: 'Freelancing advice' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'vehicle-help',
    name: 'Vehicle Help',
    emoji: '🚙',
    priority: 0,
    subcategories: [
      { id: 'bike-repair', name: 'Bike repair' },
      { id: 'car-repair', name: 'Car repair' },
      { id: 'flat-tyre', name: 'Flat tyre help' },
      { id: 'fuel', name: 'Fuel emergency help' },
      { id: 'washing', name: 'Vehicle washing' },
      { id: 'jump-start', name: 'Car jump start' },
      { id: 'battery', name: 'Battery replacement help' },
      { id: 'pickup-drop', name: 'Vehicle pickup or drop' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'document-help',
    name: 'Document Help',
    emoji: '📄',
    priority: 0,
    subcategories: [
      { id: 'aadhaar', name: 'Aadhaar update help' },
      { id: 'pan', name: 'PAN card help' },
      { id: 'passport', name: 'Passport help' },
      { id: 'license', name: 'Driving license help' },
      { id: 'govt-form', name: 'Government form filling' },
      { id: 'online-app', name: 'Online application help' },
      { id: 'certificate', name: 'Certificate applications' },
      { id: 'submission', name: 'Document submission help' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'partner-needed',
    name: 'Partner Needed',
    emoji: '🤝',
    priority: 1,
    subcategories: [
      { id: 'gym', name: 'Gym partner' },
      { id: 'running', name: 'Running partner' },
      { id: 'cycling', name: 'Cycling partner' },
      { id: 'study', name: 'Study partner' },
      { id: 'travel', name: 'Travel partner' },
      { id: 'shopping', name: 'Shopping partner' },
      { id: 'event', name: 'Event companion' },
      { id: 'conference', name: 'Conference companion' },
      { id: 'business', name: 'Business discussion partner' },
      { id: 'other', name: 'Other (not listed)' },
    ],
  },
  {
    id: 'other',
    name: 'Other',
    emoji: '✨',
    priority: 0,
    subcategories: [],
  },
];

/**
 * Get all service categories
 */
export function getAllServiceCategories(): ServiceCategory[] {
  return SERVICE_CATEGORIES;
}

/**
 * Get a category by ID
 */
export function getCategoryById(categoryId: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find(cat => cat.id === categoryId);
}

/**
 * Get subcategories for a specific category
 */
export function getSubcategoriesByCategoryId(categoryId: string): ServiceSubcategory[] {
  const category = SERVICE_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.subcategories || [];
}

/**
 * Get category emoji by ID
 */
export function getCategoryEmojiById(categoryId: string): string {
  const category = SERVICE_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.emoji || '✨';
}

/**
 * Get category name by ID
 */
export function getCategoryNameById(categoryId: string): string {
  const category = SERVICE_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.name || 'Other';
}

/**
 * Get subcategory name
 */
export function getSubcategoryName(categoryId: string, subcategoryId: string): string {
  const category = SERVICE_CATEGORIES.find(cat => cat.id === categoryId);
  const subcategory = category?.subcategories.find(sub => sub.id === subcategoryId);
  return subcategory?.name || 'Other';
}

/**
 * Get priority categories (for helper mode)
 */
export function getPriorityCategories(): ServiceCategory[] {
  return SERVICE_CATEGORIES.filter(cat => cat.priority === 1);
}