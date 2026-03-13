// UPDATED TASK CATEGORIES - 22 Main Categories
// Based on comprehensive service categories for hyperlocal marketplace

export interface TaskCategoryData {
  id: string; // Category ID (slug format)
  name: string;
  emoji: string;
  description: string;
  subcategories: string[];
  keywords: string[];
  priority?: number; // 1 = High priority
}

export const TASK_CATEGORIES: Record<string, TaskCategoryData> = {
  'bring-something': {
    id: 'bring-something',
    name: 'Bring Something',
    emoji: '🎒',
    description: 'Fetch or bring an item from somewhere',
    priority: 1,
    subcategories: [
      'Medicine from pharmacy',
      'Gas cylinder',
      'Water cans',
      'Laptop / charger',
      'Documents / files',
      'Office supplies',
      'Keys / wallet',
      'Clothes / shoes',
      'Baby essentials',
      'Hardware items',
      'Tools from shop',
      'Parcel from shop',
      'Collect parcel from security',
      'Pick up from friend / family',
      'Pick up from office',
      'Bring forgotten item from home',
      'Bring item from apartment gate',
      'Emergency item pickup',
      'Other (not listed)',
    ],
    keywords: ['bring', 'fetch', 'get', 'pick up', 'collect', 'medicine', 'gas cylinder', 'water', 'laptop', 'charger', 'documents', 'keys', 'wallet', 'clothes', 'parcel', 'forgotten', 'emergency'],
  },
  'ride-transport': {
    id: 'ride-transport',
    name: 'Ride / Transport',
    emoji: '🚗',
    description: 'Short rides or driving help',
    priority: 1,
    subcategories: [
      'Bike ride',
      'Car ride',
      'Office drop',
      'Office pickup',
      'Airport drop',
      'Airport pickup',
      'Railway station drop',
      'Railway station pickup',
      'School drop',
      'School pickup',
      'Late night ride',
      'Emergency ride',
      'Outstation ride',
      'Driver for few hours',
      'Ride for errands',
      'Other (not listed)',
    ],
    keywords: ['ride', 'transport', 'drop', 'pickup', 'bike', 'car', 'office', 'airport', 'station', 'school', 'late night', 'emergency', 'outstation', 'driver', 'lift'],
  },
  'repair': {
    id: 'repair',
    name: 'Repair',
    emoji: '🔧',
    description: 'Fix or repair something',
    priority: 1,
    subcategories: [
      'Fan repair',
      'Switch repair',
      'Electrical wiring repair',
      'Plumbing repair',
      'Tap repair',
      'Drain blockage',
      'Laptop repair',
      'Mobile repair',
      'Printer repair',
      'AC repair',
      'Fridge repair',
      'Washing machine repair',
      'Microwave repair',
      'Water purifier repair',
      'Mixer repair',
      'Grinder repair',
      'TV repair',
      'Furniture repair',
      'Door repair',
      'Window repair',
      'Lock repair',
      'Other (not listed)',
    ],
    keywords: ['repair', 'fix', 'broken', 'fan', 'switch', 'electrical', 'plumbing', 'tap', 'drain', 'laptop', 'mobile', 'phone', 'printer', 'ac', 'fridge', 'washing machine', 'microwave', 'purifier', 'mixer', 'tv', 'furniture', 'door', 'window', 'lock'],
  },
  'delivery': {
    id: 'delivery',
    name: 'Delivery',
    emoji: '🚚',
    description: 'Deliver items from A to B',
    priority: 1,
    subcategories: [
      'Parcel delivery',
      'Document delivery',
      'Medicine delivery',
      'Courier pickup',
      'Gift delivery',
      'Office file delivery',
      'Shop pickup delivery',
      'Package delivery',
      'Same day delivery',
      'Express delivery',
      'Station pickup delivery',
      'Apartment gate pickup delivery',
      'Other (not listed)',
    ],
    keywords: ['delivery', 'deliver', 'parcel', 'document', 'medicine', 'courier', 'gift', 'office file', 'package', 'same day', 'express', 'pickup'],
  },
  'cleaning': {
    id: 'cleaning',
    name: 'Cleaning',
    emoji: '🧹',
    description: 'Cleaning homes, offices, or items',
    priority: 1,
    subcategories: [
      'House cleaning',
      'Room cleaning',
      'Kitchen cleaning',
      'Bathroom cleaning',
      'Deep cleaning',
      'Balcony cleaning',
      'Window cleaning',
      'Office cleaning',
      'Car cleaning',
      'Sofa cleaning',
      'Mattress cleaning',
      'Move-out cleaning',
      'Floor cleaning',
      'Dusting help',
      'Post-party cleaning',
      'Other (not listed)',
    ],
    keywords: ['cleaning', 'clean', 'house', 'room', 'kitchen', 'bathroom', 'deep clean', 'balcony', 'window', 'office', 'car', 'sofa', 'mattress', 'floor', 'dust', 'party'],
  },
  'cooking': {
    id: 'cooking',
    name: 'Cooking',
    emoji: '🍳',
    description: 'Cooking help or chefs',
    priority: 1,
    subcategories: [
      'Daily home cooking',
      'Chef for party',
      'Meal preparation',
      'Vegetarian cooking',
      'Non-veg cooking',
      'Diet cooking',
      'Baby food preparation',
      'Festival cooking',
      'Breakfast cooking',
      'Lunch cooking',
      'Dinner cooking',
      'Cooking assistant',
      'Cooking help for events',
      'Other (not listed)',
    ],
    keywords: ['cooking', 'cook', 'chef', 'meal prep', 'vegetarian', 'non-veg', 'diet', 'baby food', 'festival', 'breakfast', 'lunch', 'dinner', 'assistant', 'party', 'biryani', 'curry', 'food preparation'],
  },
  'moving-packing': {
    id: 'moving-packing',
    name: 'Moving & Packing',
    emoji: '📦',
    description: 'Moving homes or heavy items',
    priority: 1,
    subcategories: [
      'House shifting',
      'Office shifting',
      'Furniture moving',
      'Packing help',
      'Unpacking help',
      'Loading help',
      'Unloading help',
      'Heavy item lifting',
      'Appliance moving',
      'Bed shifting',
      'Cupboard shifting',
      'Local shifting help',
      'Moving boxes help',
      'Truck loading help',
      'Other (not listed)',
    ],
    keywords: ['moving', 'packing', 'shifting', 'house', 'office', 'furniture', 'pack', 'unpack', 'loading', 'unloading', 'heavy', 'appliance', 'bed', 'cupboard', 'boxes', 'truck'],
  },
  'teaching-learning': {
    id: 'teaching-learning',
    name: 'Teaching & Learning',
    emoji: '📚',
    description: 'Learning skills or tutoring',
    subcategories: [
      'Math tutoring',
      'Science tutoring',
      'Physics tutoring',
      'Chemistry tutoring',
      'Biology tutoring',
      'Coding lessons',
      'Spoken English',
      'IELTS coaching',
      'Language learning',
      'Public speaking training',
      'Excel training',
      'Guitar lessons',
      'Piano lessons',
      'Dance lessons',
      'Singing lessons',
      'Competitive exam preparation',
      'Other (not listed)',
    ],
    keywords: ['teaching', 'learning', 'tutoring', 'tutor', 'math', 'science', 'physics', 'chemistry', 'biology', 'coding', 'english', 'ielts', 'language', 'speaking', 'excel', 'guitar', 'piano', 'dance', 'singing', 'exam'],
  },
  'photography-videography': {
    id: 'photography-videography',
    name: 'Photography & Videography',
    emoji: '📷',
    description: 'Creative visual services',
    subcategories: [
      'Event photography',
      'Wedding photography',
      'Portrait photography',
      'Product photography',
      'Real estate photography',
      'Drone photography',
      'Event videography',
      'Wedding videography',
      'Corporate video shoot',
      'YouTube video shoot',
      'Social media reel shoot',
      'Video editing',
      'Photo editing',
      'Fashion photography',
      'Food photography',
      'Other (not listed)',
    ],
    keywords: ['photography', 'videography', 'photo', 'video', 'event', 'wedding', 'portrait', 'product', 'real estate', 'drone', 'corporate', 'youtube', 'reel', 'editing', 'fashion', 'food', 'camera', 'shoot'],
  },
  'accounting-tax': {
    id: 'accounting-tax',
    name: 'Accounting & Tax',
    emoji: '📊',
    description: 'Financial and compliance help',
    subcategories: [
      'Income tax filing',
      'GST filing',
      'Bookkeeping',
      'Financial statements',
      'Startup accounting',
      'Payroll management',
      'Business registration',
      'Tax consultation',
      'Audit help',
      'Investment advice',
      'Company compliance',
      'TDS filing',
      'Tax planning',
      'CA consultation',
      'Other (not listed)',
    ],
    keywords: ['accounting', 'tax', 'income tax', 'gst', 'bookkeeping', 'financial', 'startup', 'payroll', 'business', 'audit', 'investment', 'compliance', 'tds', 'ca', 'chartered accountant'],
  },
  'medical-help': {
    id: 'medical-help',
    name: 'Medical Help',
    emoji: '⚕️',
    description: 'Healthcare assistance',
    subcategories: [
      'Nurse assistance',
      'Patient care',
      'Home nurse',
      'Post surgery care',
      'Physiotherapy help',
      'Hospital visit support',
      'Medical attendant',
      'Injection help',
      'Doctor appointment assistance',
      'Health monitoring',
      'Medicine assistance',
      'Medical equipment setup',
      'Medical transport help',
      'Emergency medical help',
      'Other (not listed)',
    ],
    keywords: ['medical', 'nurse', 'patient care', 'home nurse', 'surgery', 'physiotherapy', 'hospital', 'attendant', 'injection', 'doctor', 'health', 'medicine', 'equipment', 'emergency', 'healthcare'],
  },
  'tech-help': {
    id: 'tech-help',
    name: 'Tech Help',
    emoji: '💻',
    description: 'Help with devices and internet',
    priority: 1,
    subcategories: [
      'Laptop repair',
      'Computer repair',
      'WiFi setup',
      'Router setup',
      'Printer setup',
      'Smart TV setup',
      'Software installation',
      'Data recovery',
      'Virus removal',
      'Phone data transfer',
      'Email setup',
      'Computer upgrade',
      'Internet troubleshooting',
      'Device setup',
      'Cloud storage setup',
      'Other (not listed)',
    ],
    keywords: ['tech', 'laptop', 'computer', 'wifi', 'router', 'printer', 'smart tv', 'software', 'data recovery', 'virus', 'phone', 'email', 'upgrade', 'internet', 'device', 'cloud', 'technology'],
  },
  'pet-care': {
    id: 'pet-care',
    name: 'Pet Care',
    emoji: '🐕',
    description: 'Help with pets',
    priority: 1,
    subcategories: [
      'Dog walking',
      'Pet sitting',
      'Pet feeding',
      'Pet grooming',
      'Vet visit help',
      'Pet bathing',
      'Pet training help',
      'Pet transport',
      'Pet boarding help',
      'Other (not listed)',
    ],
    keywords: ['pet', 'dog', 'cat', 'walking', 'sitting', 'feeding', 'grooming', 'vet', 'bathing', 'training', 'transport', 'boarding', 'puppy', 'kitten'],
  },
  'laundry': {
    id: 'laundry',
    name: 'Laundry',
    emoji: '🧺',
    description: 'Clothes washing and ironing',
    priority: 1,
    subcategories: [
      'Clothes washing',
      'Clothes ironing',
      'Dry cleaning pickup',
      'Laundry folding',
      'Steam ironing',
      'Blanket washing',
      'Curtain washing',
      'Laundry pickup and drop',
      'Other (not listed)',
    ],
    keywords: ['laundry', 'washing', 'ironing', 'clothes', 'dry cleaning', 'folding', 'steam', 'blanket', 'curtain', 'pickup', 'press'],
  },
  'home-services': {
    id: 'home-services',
    name: 'Home Services',
    emoji: '🏠',
    description: 'General home maintenance',
    subcategories: [
      'Painting',
      'Electrical installation',
      'Furniture assembly',
      'Curtain rod installation',
      'TV wall mount',
      'Gardening help',
      'Pest control',
      'Interior design consultation',
      'Home maintenance',
      'Other (not listed)',
    ],
    keywords: ['home services', 'painting', 'electrical', 'furniture assembly', 'curtain', 'tv mount', 'gardening', 'pest control', 'interior', 'maintenance', 'installation'],
  },
  'beauty-wellness': {
    id: 'beauty-wellness',
    name: 'Beauty & Wellness',
    emoji: '💄',
    description: 'Personal grooming and relaxation',
    subcategories: [
      'Haircut',
      'Hair styling',
      'Hair coloring',
      'Beard trimming',
      'Bridal makeup',
      'Party makeup',
      'Facial',
      'Threading',
      'Spa therapy',
      'Body massage',
      'Head massage',
      'Skin care',
      'Other (not listed)',
    ],
    keywords: ['beauty', 'wellness', 'haircut', 'hair styling', 'coloring', 'beard', 'makeup', 'bridal', 'facial', 'threading', 'spa', 'massage', 'skin care', 'salon', 'grooming'],
  },
  'event-help': {
    id: 'event-help',
    name: 'Event Help',
    emoji: '🎉',
    description: 'Event organization support',
    subcategories: [
      'Party planning',
      'Wedding planning',
      'Decoration help',
      'Event coordination',
      'Catering support',
      'DJ setup help',
      'Event photography coordination',
      'Venue setup help',
      'Other (not listed)',
    ],
    keywords: ['event', 'party', 'wedding', 'planning', 'decoration', 'coordination', 'catering', 'dj', 'venue', 'birthday', 'celebration'],
  },
  'professional-help': {
    id: 'professional-help',
    name: 'Professional Help',
    emoji: '💼',
    description: 'Consulting and expert help',
    subcategories: [
      'Legal advice',
      'Startup consulting',
      'Business consulting',
      'Career counseling',
      'Resume building',
      'Interview preparation',
      'Marketing consulting',
      'Financial planning',
      'Freelancing advice',
      'Other (not listed)',
    ],
    keywords: ['professional', 'legal', 'startup', 'business', 'career', 'counseling', 'resume', 'interview', 'marketing', 'financial planning', 'consulting', 'advice', 'freelance'],
  },
  'vehicle-help': {
    id: 'vehicle-help',
    name: 'Vehicle Help',
    emoji: '🚙',
    description: 'Help related to vehicles',
    subcategories: [
      'Bike repair',
      'Car repair',
      'Flat tyre help',
      'Fuel emergency help',
      'Vehicle washing',
      'Car jump start',
      'Battery replacement help',
      'Vehicle pickup or drop',
      'Other (not listed)',
    ],
    keywords: ['vehicle', 'bike', 'car', 'repair', 'tyre', 'flat', 'fuel', 'washing', 'jump start', 'battery', 'pickup', 'motorcycle', 'automobile'],
  },
  'document-help': {
    id: 'document-help',
    name: 'Document Help',
    emoji: '📄',
    description: 'Government and paperwork assistance',
    subcategories: [
      'Aadhaar update help',
      'PAN card help',
      'Passport help',
      'Driving license help',
      'Government form filling',
      'Online application help',
      'Certificate applications',
      'Document submission help',
      'Other (not listed)',
    ],
    keywords: ['document', 'aadhaar', 'pan', 'passport', 'license', 'driving', 'government', 'form', 'application', 'certificate', 'submission', 'paperwork'],
  },
  'partner-needed': {
    id: 'partner-needed',
    name: 'Partner Needed',
    emoji: '🤝',
    description: 'Someone to accompany or assist',
    priority: 1,
    subcategories: [
      'Gym partner',
      'Running partner',
      'Cycling partner',
      'Study partner',
      'Travel partner',
      'Shopping partner',
      'Event companion',
      'Conference companion',
      'Business discussion partner',
      'Other (not listed)',
    ],
    keywords: ['partner', 'companion', 'buddy', 'gym', 'running', 'cycling', 'study', 'travel', 'shopping', 'event', 'conference', 'business', 'workout', 'exercise'],
  },
  'other': {
    id: 'other',
    name: 'Other',
    emoji: '✨',
    description: 'For anything not listed',
    subcategories: [],
    keywords: ['other', 'miscellaneous', 'help', 'assistance', 'general', 'anything'],
  },
};

/**
 * Categorize a task based on title/description
 * Returns the category ID (slug format) for database storage
 */
export function categorizeTask(title: string): string {
  const lowerTitle = title.toLowerCase().trim();
  
  // Require minimum length for accurate detection
  if (lowerTitle.length < 10) {
    return 'other';
  }
  
  // Count words - need at least 3 words for context
  const wordCount = lowerTitle.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 3) {
    return 'other';
  }

  let bestMatch = { categoryId: 'other', score: 0, keywordLength: 0 };
  
  // Set minimum threshold
  const MINIMUM_CONFIDENCE_SCORE = 5;

  for (const [categoryKey, categoryData] of Object.entries(TASK_CATEGORIES)) {
    let score = 0;
    let longestKeywordMatch = 0;

    // Boost priority categories
    const priorityBoost = categoryData.priority === 1 ? 2 : 0;

    // Check each keyword
    for (const keyword of categoryData.keywords) {
      // Exact word boundary match (highest score)
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(lowerTitle)) {
        const keywordScore = 5 + priorityBoost + Math.floor(keyword.length / 2);
        score += keywordScore;
        
        if (keyword.length > longestKeywordMatch) {
          longestKeywordMatch = keyword.length;
        }
      }
      // Partial match (lower score) - only for longer keywords
      else if (keyword.length > 5 && lowerTitle.includes(keyword.toLowerCase())) {
        score += 2 + priorityBoost;
        if (keyword.length > longestKeywordMatch) {
          longestKeywordMatch = keyword.length;
        }
      }
    }

    // Update best match
    if (score > bestMatch.score || (score === bestMatch.score && longestKeywordMatch > bestMatch.keywordLength)) {
      bestMatch = { categoryId: categoryData.id, score, keywordLength: longestKeywordMatch };
    }
  }

  // Only return category if confidence is high enough
  if (bestMatch.score < MINIMUM_CONFIDENCE_SCORE) {
    return 'other';
  }

  return bestMatch.categoryId;
}

/**
 * Get emoji for a category (by ID or name)
 */
export function getCategoryEmoji(categoryIdOrName: string): string {
  // Try by ID first
  const categoryById = TASK_CATEGORIES[categoryIdOrName];
  if (categoryById) return categoryById.emoji;
  
  // Fallback: try by name
  const categoryByName = Object.values(TASK_CATEGORIES).find(c => c.name === categoryIdOrName);
  return categoryByName?.emoji || '✨';
}

/**
 * Get all categories as array (priority categories first)
 */
export function getAllTaskCategories(): Array<{ id: string; name: string; emoji: string; description: string; subcategories: string[]; priority?: number }> {
  return Object.values(TASK_CATEGORIES)
    .map(cat => ({
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      description: cat.description,
      subcategories: cat.subcategories,
      priority: cat.priority,
    }))
    .sort((a, b) => {
      // Priority categories first
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return a.name.localeCompare(b.name);
    });
}

/**
 * Get priority categories
 */
export function getPriorityCategories(): Array<{ id: string; name: string; emoji: string; description: string; subcategories: string[] }> {
  return Object.values(TASK_CATEGORIES)
    .filter(cat => cat.priority === 1)
    .map(cat => ({
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      description: cat.description,
      subcategories: cat.subcategories,
    }));
}

/**
 * Get category data by ID
 */
export function getCategoryById(id: string): TaskCategoryData | undefined {
  return TASK_CATEGORIES[id];
}

/**
 * Get category data by name (backward compatibility)
 */
export function getCategoryByName(name: string): TaskCategoryData | undefined {
  return Object.values(TASK_CATEGORIES).find(c => c.name === name);
}

/**
 * Convert category name to ID (for migration/compatibility)
 */
export function getCategoryIdFromName(name: string): string {
  const category = Object.values(TASK_CATEGORIES).find(c => c.name === name);
  return category?.id || 'other';
}

/**
 * Get subcategories for a category
 */
export function getSubcategories(categoryId: string): string[] {
  const category = TASK_CATEGORIES[categoryId];
  return category?.subcategories || [];
}
