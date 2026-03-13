// =====================================================
// SERVICE CATEGORIES WITH SUBCATEGORIES
// Complete 46 categories with dynamic subcategories + "Other"
// =====================================================

export interface ServiceSubcategory {
  id: string;
  name: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  emoji: string;
  priority: number; // 1 = Bangalore Launch, 0 = Regular
  subcategories: ServiceSubcategory[];
}

// =====================================================
// ALL 46 SERVICE CATEGORIES WITH SUBCATEGORIES
// =====================================================
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  // ===== BANGALORE LAUNCH PRIORITIES (Top 15) =====
  {
    id: 'food-delivery',
    name: 'Bring Food',
    emoji: '🍱',
    priority: 1,
    subcategories: [
      { id: 'tiffin-delivery', name: 'Tiffin Delivery' },
      { id: 'home-to-office', name: 'Home to Office' },
      { id: 'restaurant-pickup', name: 'Restaurant Pickup' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    emoji: '🧹',
    priority: 1,
    subcategories: [
      { id: 'house-cleaning', name: 'House Cleaning' },
      { id: 'room-cleaning', name: 'Room Cleaning' },
      { id: 'deep-cleaning', name: 'Deep Cleaning' },
      { id: 'bathroom-cleaning', name: 'Bathroom Cleaning' },
      { id: 'kitchen-cleaning', name: 'Kitchen Cleaning' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'cooking',
    name: 'Cooking',
    emoji: '🍳',
    priority: 1,
    subcategories: [
      { id: 'home-cooking', name: 'Home Cooking' },
      { id: 'party-cooking', name: 'Party Cooking' },
      { id: 'meal-prep', name: 'Meal Prep' },
      { id: 'catering', name: 'Catering' },
      { id: 'baking', name: 'Baking' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'delivery',
    name: 'Delivery',
    emoji: '🚚',
    priority: 1,
    subcategories: [
      { id: 'package-delivery', name: 'Package Delivery' },
      { id: 'document-delivery', name: 'Document Delivery' },
      { id: 'parcel-pickup', name: 'Parcel Pickup' },
      { id: 'courier', name: 'Courier' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'drop-pickup',
    name: 'Drop Me / Pick Me',
    emoji: '🚗',
    priority: 1,
    subcategories: [
      { id: 'office-drop', name: 'Office Drop' },
      { id: 'airport-pickup', name: 'Airport Pickup' },
      { id: 'station-pickup', name: 'Station Pickup' },
      { id: 'metro-drop', name: 'Metro Drop' },
      { id: 'carpool', name: 'Carpool' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'errands',
    name: 'Errands',
    emoji: '🏃',
    priority: 1,
    subcategories: [
      { id: 'queue-standing', name: 'Queue Standing' },
      { id: 'document-submission', name: 'Document Submission' },
      { id: 'bank-work', name: 'Bank Work' },
      { id: 'post-office', name: 'Post Office' },
      { id: 'government-office', name: 'Government Office' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'fitness-partner',
    name: 'Fitness Partner',
    emoji: '🏋️',
    priority: 1,
    subcategories: [
      { id: 'gym-partner', name: 'Gym Partner' },
      { id: 'running-partner', name: 'Running Partner' },
      { id: 'yoga-partner', name: 'Yoga Partner' },
      { id: 'cycling-partner', name: 'Cycling Partner' },
      { id: 'workout-buddy', name: 'Workout Buddy' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'grocery-shopping',
    name: 'Grocery Shopping',
    emoji: '🛒',
    priority: 1,
    subcategories: [
      { id: 'supermarket', name: 'Supermarket Shopping' },
      { id: 'vegetable-market', name: 'Vegetable Market' },
      { id: 'fruit-shopping', name: 'Fruit Shopping' },
      { id: 'bulk-shopping', name: 'Bulk Shopping' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'laundry',
    name: 'Laundry',
    emoji: '🧺',
    priority: 1,
    subcategories: [
      { id: 'washing', name: 'Washing' },
      { id: 'ironing', name: 'Ironing' },
      { id: 'dry-clean-pickup', name: 'Dry Clean Pickup' },
      { id: 'folding', name: 'Folding' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'luggage-help',
    name: 'Luggage Help',
    emoji: '🧳',
    priority: 1,
    subcategories: [
      { id: 'airport-luggage', name: 'Airport Luggage' },
      { id: 'railway-luggage', name: 'Railway Station' },
      { id: 'metro-luggage', name: 'Metro Station' },
      { id: 'heavy-bags', name: 'Heavy Bags' },
      { id: 'loading-unloading', name: 'Loading/Unloading' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'mentorship',
    name: 'Mentorship',
    emoji: '🎯',
    priority: 1,
    subcategories: [
      { id: 'career-mentorship', name: 'Career Guidance' },
      { id: 'startup-mentorship', name: 'Startup Advice' },
      { id: 'skill-mentorship', name: 'Skill Mentoring' },
      { id: 'business-coaching', name: 'Business Coaching' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'moving-packing',
    name: 'Moving & Packing',
    emoji: '📦',
    priority: 1,
    subcategories: [
      { id: 'house-shifting', name: 'House Shifting' },
      { id: 'office-moving', name: 'Office Moving' },
      { id: 'packing-help', name: 'Packing Help' },
      { id: 'furniture-moving', name: 'Furniture Moving' },
      { id: 'unpacking', name: 'Unpacking' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'partner-needed',
    name: 'Partner Needed',
    emoji: '🤝',
    priority: 1,
    subcategories: [
      { id: 'sports-partner', name: 'Sports Partner' },
      { id: 'study-partner', name: 'Study Partner' },
      { id: 'work-partner', name: 'Work Partner' },
      { id: 'badminton', name: 'Badminton' },
      { id: 'tennis', name: 'Tennis' },
      { id: 'football', name: 'Football' },
      { id: 'cricket', name: 'Cricket' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'pet-care',
    name: 'Pet Care',
    emoji: '🐕',
    priority: 1,
    subcategories: [
      { id: 'dog-walking', name: 'Dog Walking' },
      { id: 'pet-sitting', name: 'Pet Sitting' },
      { id: 'pet-feeding', name: 'Pet Feeding' },
      { id: 'pet-grooming', name: 'Pet Grooming' },
      { id: 'vet-visit', name: 'Vet Visit Help' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'tech-help',
    name: 'Tech Help',
    emoji: '💻',
    priority: 1,
    subcategories: [
      { id: 'computer-repair', name: 'Computer Repair' },
      { id: 'laptop-repair', name: 'Laptop Repair' },
      { id: 'mobile-repair', name: 'Mobile Repair' },
      { id: 'software-help', name: 'Software Help' },
      { id: 'coding-help', name: 'Coding Help' },
      { id: 'wifi-setup', name: 'WiFi Setup' },
      { id: 'other', name: 'Other' },
    ],
  },

  // ===== REGULAR CATEGORIES (31 more) =====
  {
    id: 'ac-repair',
    name: 'AC & Appliance Repair',
    emoji: '❄️',
    priority: 0,
    subcategories: [
      { id: 'ac-service', name: 'AC Service' },
      { id: 'fridge-repair', name: 'Fridge Repair' },
      { id: 'washing-machine', name: 'Washing Machine' },
      { id: 'microwave', name: 'Microwave Repair' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'accounting',
    name: 'Accounting & Tax',
    emoji: '📊',
    priority: 0,
    subcategories: [
      { id: 'gst-filing', name: 'GST Filing' },
      { id: 'income-tax', name: 'Income Tax' },
      { id: 'bookkeeping', name: 'Bookkeeping' },
      { id: 'audit', name: 'Audit' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'astrology',
    name: 'Astrology & Vastu',
    emoji: '🔮',
    priority: 0,
    subcategories: [
      { id: 'horoscope', name: 'Horoscope' },
      { id: 'kundli', name: 'Kundli Matching' },
      { id: 'vastu', name: 'Vastu Consultation' },
      { id: 'numerology', name: 'Numerology' },
      { id: 'palmistry', name: 'Palmistry' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'babysitting',
    name: 'Babysitting',
    emoji: '👶',
    priority: 0,
    subcategories: [
      { id: 'infant-care', name: 'Infant Care' },
      { id: 'toddler-care', name: 'Toddler Care' },
      { id: 'daycare', name: 'Daycare' },
      { id: 'nanny', name: 'Nanny Service' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'beauty-makeup',
    name: 'Beauty & Makeup',
    emoji: '💄',
    priority: 0,
    subcategories: [
      { id: 'party-makeup', name: 'Party Makeup' },
      { id: 'bridal-makeup', name: 'Bridal Makeup' },
      { id: 'facial', name: 'Facial' },
      { id: 'mehndi', name: 'Mehndi' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'career-counseling',
    name: 'Career Counseling',
    emoji: '💼',
    priority: 0,
    subcategories: [
      { id: 'resume-help', name: 'Resume Help' },
      { id: 'interview-prep', name: 'Interview Prep' },
      { id: 'job-guidance', name: 'Job Guidance' },
      { id: 'career-switch', name: 'Career Switch' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    emoji: '🪚',
    priority: 0,
    subcategories: [
      { id: 'furniture-repair', name: 'Furniture Repair' },
      { id: 'door-repair', name: 'Door Repair' },
      { id: 'window-repair', name: 'Window Repair' },
      { id: 'cabinet-making', name: 'Cabinet Making' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing',
    emoji: '📱',
    priority: 0,
    subcategories: [
      { id: 'social-media', name: 'Social Media' },
      { id: 'seo', name: 'SEO' },
      { id: 'google-ads', name: 'Google Ads' },
      { id: 'facebook-ads', name: 'Facebook Ads' },
      { id: 'content-creation', name: 'Content Creation' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'elderly-care',
    name: 'Elderly Care',
    emoji: '👴',
    priority: 0,
    subcategories: [
      { id: 'senior-companion', name: 'Senior Companion' },
      { id: 'medical-assistance', name: 'Medical Assistance' },
      { id: 'daily-help', name: 'Daily Help' },
      { id: 'nursing', name: 'Nursing' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'electrical',
    name: 'Electrical',
    emoji: '⚡',
    priority: 0,
    subcategories: [
      { id: 'wiring', name: 'Wiring' },
      { id: 'switch-repair', name: 'Switch Repair' },
      { id: 'fan-repair', name: 'Fan Repair' },
      { id: 'light-fitting', name: 'Light Fitting' },
      { id: 'inverter', name: 'Inverter' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'event-planning',
    name: 'Event Planning',
    emoji: '🎉',
    priority: 0,
    subcategories: [
      { id: 'birthday-party', name: 'Birthday Party' },
      { id: 'wedding', name: 'Wedding' },
      { id: 'corporate-event', name: 'Corporate Event' },
      { id: 'decoration', name: 'Decoration' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'gardening',
    name: 'Gardening',
    emoji: '🪴',
    priority: 0,
    subcategories: [
      { id: 'lawn-mowing', name: 'Lawn Mowing' },
      { id: 'plant-care', name: 'Plant Care' },
      { id: 'landscaping', name: 'Landscaping' },
      { id: 'terrace-garden', name: 'Terrace Garden' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'graphic-design',
    name: 'Graphic Design',
    emoji: '🖌️',
    priority: 0,
    subcategories: [
      { id: 'logo-design', name: 'Logo Design' },
      { id: 'poster-design', name: 'Poster Design' },
      { id: 'video-editing', name: 'Video Editing' },
      { id: 'photo-editing', name: 'Photo Editing' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'installation',
    name: 'Installation',
    emoji: '🔨',
    priority: 0,
    subcategories: [
      { id: 'furniture-assembly', name: 'Furniture Assembly' },
      { id: 'tv-mount', name: 'TV Mount' },
      { id: 'curtain-rods', name: 'Curtain Rods' },
      { id: 'shelf-installation', name: 'Shelf Installation' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'interior-design',
    name: 'Interior Design',
    emoji: '🏠',
    priority: 0,
    subcategories: [
      { id: 'home-design', name: 'Home Design' },
      { id: 'modular-kitchen', name: 'Modular Kitchen' },
      { id: 'false-ceiling', name: 'False Ceiling' },
      { id: 'renovation', name: 'Renovation' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'language-learning',
    name: 'Language Learning',
    emoji: '🗣️',
    priority: 0,
    subcategories: [
      { id: 'english-speaking', name: 'English Speaking' },
      { id: 'ielts', name: 'IELTS' },
      { id: 'hindi', name: 'Hindi' },
      { id: 'kannada', name: 'Kannada' },
      { id: 'foreign-language', name: 'Foreign Language' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'legal-advice',
    name: 'Legal Advice',
    emoji: '⚖️',
    priority: 0,
    subcategories: [
      { id: 'property-law', name: 'Property Law' },
      { id: 'family-law', name: 'Family Law' },
      { id: 'contract', name: 'Contract' },
      { id: 'documentation', name: 'Documentation' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'locksmith',
    name: 'Locksmith',
    emoji: '🔑',
    priority: 0,
    subcategories: [
      { id: 'lock-repair', name: 'Lock Repair' },
      { id: 'emergency-unlock', name: 'Emergency Unlock' },
      { id: 'key-duplicate', name: 'Key Duplicate' },
      { id: 'door-lock', name: 'Door Lock' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'music-dance',
    name: 'Music & Dance',
    emoji: '🎵',
    priority: 0,
    subcategories: [
      { id: 'guitar', name: 'Guitar' },
      { id: 'piano', name: 'Piano' },
      { id: 'singing', name: 'Singing' },
      { id: 'dance', name: 'Dance' },
      { id: 'tabla', name: 'Tabla' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'nursing-care',
    name: 'Nursing & Healthcare',
    emoji: '⚕️',
    priority: 0,
    subcategories: [
      { id: 'nurse', name: 'Nurse' },
      { id: 'patient-care', name: 'Patient Care' },
      { id: 'injection', name: 'Injection' },
      { id: 'physiotherapy', name: 'Physiotherapy' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'painting',
    name: 'Painting',
    emoji: '🎨',
    priority: 0,
    subcategories: [
      { id: 'wall-painting', name: 'Wall Painting' },
      { id: 'room-painting', name: 'Room Painting' },
      { id: 'touch-up', name: 'Touch-up' },
      { id: 'texture', name: 'Texture' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    emoji: '🦟',
    priority: 0,
    subcategories: [
      { id: 'cockroach', name: 'Cockroach' },
      { id: 'termite', name: 'Termite' },
      { id: 'rat', name: 'Rat Control' },
      { id: 'fumigation', name: 'Fumigation' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'photography',
    name: 'Photography',
    emoji: '📷',
    priority: 0,
    subcategories: [
      { id: 'wedding', name: 'Wedding' },
      { id: 'event', name: 'Event' },
      { id: 'portrait', name: 'Portrait' },
      { id: 'product', name: 'Product' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    emoji: '🚰',
    priority: 0,
    subcategories: [
      { id: 'tap-repair', name: 'Tap Repair' },
      { id: 'pipe-leak', name: 'Pipe Leak' },
      { id: 'drain-cleaning', name: 'Drain Cleaning' },
      { id: 'geyser', name: 'Geyser' },
      { id: 'flush-repair', name: 'Flush Repair' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'religious-services',
    name: 'Religious Services',
    emoji: '🙏',
    priority: 0,
    subcategories: [
      { id: 'pandit', name: 'Pandit' },
      { id: 'puja', name: 'Puja' },
      { id: 'havan', name: 'Havan' },
      { id: 'ceremony', name: 'Ceremony' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'salon-home',
    name: 'Salon at Home',
    emoji: '💇',
    priority: 0,
    subcategories: [
      { id: 'haircut', name: 'Haircut' },
      { id: 'styling', name: 'Styling' },
      { id: 'shave', name: 'Shave' },
      { id: 'beard-trim', name: 'Beard Trim' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'skill-training',
    name: 'Skill Training',
    emoji: '🎓',
    priority: 0,
    subcategories: [
      { id: 'excel', name: 'Excel' },
      { id: 'powerpoint', name: 'PowerPoint' },
      { id: 'coding', name: 'Coding' },
      { id: 'certification', name: 'Certification' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'spa-massage',
    name: 'Spa & Massage',
    emoji: '💆',
    priority: 0,
    subcategories: [
      { id: 'body-massage', name: 'Body Massage' },
      { id: 'aromatherapy', name: 'Aromatherapy' },
      { id: 'spa', name: 'Spa' },
      { id: 'wellness', name: 'Wellness' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'tutoring',
    name: 'Tutoring',
    emoji: '📚',
    priority: 0,
    subcategories: [
      { id: 'maths', name: 'Maths' },
      { id: 'science', name: 'Science' },
      { id: 'english', name: 'English' },
      { id: 'exam-prep', name: 'Exam Prep' },
      { id: 'homework-help', name: 'Homework Help' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'videography',
    name: 'Videography',
    emoji: '🎥',
    priority: 0,
    subcategories: [
      { id: 'wedding', name: 'Wedding' },
      { id: 'event', name: 'Event' },
      { id: 'corporate', name: 'Corporate' },
      { id: 'drone', name: 'Drone' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'web-development',
    name: 'Web Development',
    emoji: '🌐',
    priority: 0,
    subcategories: [
      { id: 'website', name: 'Website' },
      { id: 'app-development', name: 'App Development' },
      { id: 'react', name: 'React' },
      { id: 'flutter', name: 'Flutter' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'other',
    name: 'Other',
    emoji: '✨',
    priority: 0,
    subcategories: [
      { id: 'other', name: 'Other' },
    ],
  },
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get all categories sorted by priority
 */
export function getAllServiceCategories(): ServiceCategory[] {
  return SERVICE_CATEGORIES.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority; // Priority 1 first
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get category by ID
 */
export function getServiceCategoryById(id: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find(cat => cat.id === id);
}

/**
 * Get subcategories for a category
 */
export function getSubcategoriesByCategoryId(categoryId: string): ServiceSubcategory[] {
  const category = getServiceCategoryById(categoryId);
  return category?.subcategories || [];
}

/**
 * Get Bangalore launch priority categories (priority = 1)
 */
export function getPriorityServiceCategories(): ServiceCategory[] {
  return SERVICE_CATEGORIES
    .filter(cat => cat.priority === 1)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get category emoji by ID
 */
export function getCategoryEmojiById(categoryId: string): string {
  const category = getServiceCategoryById(categoryId);
  return category?.emoji || '✨';
}

/**
 * Get category name by ID
 */
export function getCategoryNameById(categoryId: string): string {
  const category = getServiceCategoryById(categoryId);
  return category?.name || 'Other';
}

/**
 * Get subcategory name by category ID and subcategory ID
 */
export function getSubcategoryName(categoryId: string, subcategoryId: string): string {
  const category = getServiceCategoryById(categoryId);
  const subcategory = category?.subcategories.find(sub => sub.id === subcategoryId);
  return subcategory?.name || 'Other';
}
