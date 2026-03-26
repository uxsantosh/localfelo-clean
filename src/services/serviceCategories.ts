// =====================================================
// LOCALFELO SERVICE CATEGORIES - SINGLE SOURCE OF TRUTH
// =====================================================
// ALL service categories with subcategories
// Used by Tasks, Professionals, and Wishes modules
// ⚠️ DO NOT MODIFY - This is the authoritative list

export interface ServiceSubcategory {
  id: string;
  name: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  emoji: string;
  priority: 0 | 1; // 1 = High priority (shown first), 0 = Normal
  subcategories: ServiceSubcategory[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'quick-help',
    name: 'Quick Help',
    emoji: '⚡',
    priority: 1,
    subcategories: [
      { id: 'carry-luggage', name: 'Carry luggage' },
      { id: 'carry-boxes', name: 'Carry boxes' },
      { id: 'carry-heavy', name: 'Carry heavy items' },
      { id: 'help-shifting', name: 'Help with shifting' },
      { id: 'help-packing', name: 'Help with packing' },
      { id: 'loading-unloading', name: 'Loading / unloading help' },
      { id: 'bring-groceries', name: 'Bring groceries' },
      { id: 'bring-medicines', name: 'Bring medicines' },
      { id: 'bring-gas', name: 'Bring gas cylinder' },
      { id: 'bring-water', name: 'Bring water cans' },
      { id: 'pickup-parcel', name: 'Pick up parcel' },
      { id: 'wait-line', name: 'Wait in line' },
      { id: 'small-errands', name: 'Small errands help' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'repair',
    name: 'Repair',
    emoji: '🔧',
    priority: 1,
    subcategories: [
      { id: 'ac-repair', name: 'AC repair' },
      { id: 'fridge-repair', name: 'Fridge repair' },
      { id: 'washing-machine-repair', name: 'Washing machine repair' },
      { id: 'tv-repair', name: 'TV repair' },
      { id: 'microwave-repair', name: 'Microwave repair' },
      { id: 'water-purifier-repair', name: 'Water purifier repair' },
      { id: 'fan-repair', name: 'Fan repair' },
      { id: 'switch-repair', name: 'Switch repair' },
      { id: 'wiring-repair', name: 'Wiring repair' },
      { id: 'inverter-repair', name: 'Inverter repair' },
      { id: 'laptop-repair', name: 'Laptop repair' },
      { id: 'mobile-repair', name: 'Mobile repair' },
      { id: 'printer-repair', name: 'Printer repair' },
      { id: 'car-repair', name: 'Car repair' },
      { id: 'bike-repair', name: 'Bike repair' },
      { id: 'battery-jump', name: 'Battery jump start' },
      { id: 'puncture-repair', name: 'Puncture repair' },
      { id: 'oil-change', name: 'Oil change' },
      { id: 'other', name: 'Other' },
    ],
  },
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
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    emoji: '🪚',
    priority: 1,
    subcategories: [
      { id: 'furniture-repair', name: 'Furniture repair' },
      { id: 'door-repair', name: 'Door repair' },
      { id: 'cabinet-work', name: 'Cabinet work' },
      { id: 'custom-furniture', name: 'Custom furniture' },
      { id: 'wood-polishing', name: 'Wood polishing' },
      { id: 'furniture-assembly', name: 'Furniture assembly' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'installation',
    name: 'Installation',
    emoji: '🔨',
    priority: 1,
    subcategories: [
      { id: 'ac-installation', name: 'AC installation' },
      { id: 'tv-installation', name: 'TV installation' },
      { id: 'washing-machine-installation', name: 'Washing machine installation' },
      { id: 'fan-installation', name: 'Fan installation' },
      { id: 'light-installation', name: 'Light installation' },
      { id: 'switchboard-installation', name: 'Switchboard installation' },
      { id: 'furniture-assembly', name: 'Furniture assembly' },
      { id: 'appliance-installation', name: 'Appliance installation' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'driver-rides',
    name: 'Driver & Rides',
    emoji: '🚗',
    priority: 1,
    subcategories: [
      { id: 'driver-hours', name: 'Driver for few hours' },
      { id: 'personal-driver', name: 'Personal driver' },
      { id: 'airport-pickup', name: 'Airport pickup' },
      { id: 'airport-drop', name: 'Airport drop' },
      { id: 'outstation-driver', name: 'Outstation driver' },
      { id: 'night-driver', name: 'Night driver' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'delivery-pickup',
    name: 'Delivery & Pickup',
    emoji: '📦',
    priority: 1,
    subcategories: [
      { id: 'parcel-delivery', name: 'Parcel delivery' },
      { id: 'grocery-pickup', name: 'Grocery pickup' },
      { id: 'medicine-pickup', name: 'Medicine pickup' },
      { id: 'food-pickup', name: 'Food pickup' },
      { id: 'document-pickup', name: 'Document pickup' },
      { id: 'water-delivery', name: 'Water can delivery' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    emoji: '🧹',
    priority: 1,
    subcategories: [
      { id: 'house-cleaning', name: 'House cleaning' },
      { id: 'deep-cleaning', name: 'Deep cleaning' },
      { id: 'kitchen-cleaning', name: 'Kitchen cleaning' },
      { id: 'bathroom-cleaning', name: 'Bathroom cleaning' },
      { id: 'sofa-cleaning', name: 'Sofa cleaning' },
      { id: 'mattress-cleaning', name: 'Mattress cleaning' },
      { id: 'office-cleaning', name: 'Office cleaning' },
      { id: 'shop-cleaning', name: 'Shop cleaning' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'cooking',
    name: 'Cooking',
    emoji: '🍳',
    priority: 1,
    subcategories: [
      { id: 'home-cooking', name: 'Home cooking' },
      { id: 'personal-cook', name: 'Personal cook' },
      { id: 'event-cooking', name: 'Event cooking' },
      { id: 'meal-preparation', name: 'Meal preparation' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'shifting-moving',
    name: 'Shifting & Moving',
    emoji: '🚚',
    priority: 1,
    subcategories: [
      { id: 'house-shifting', name: 'House shifting' },
      { id: 'furniture-moving', name: 'Furniture moving' },
      { id: 'packing-help', name: 'Packing help' },
      { id: 'loading-unloading', name: 'Loading / unloading' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'home-services',
    name: 'Home Services',
    emoji: '🏡',
    priority: 1,
    subcategories: [
      { id: 'painting', name: 'Painting' },
      { id: 'pest-control', name: 'Pest control' },
      { id: 'furniture-assembly', name: 'Furniture assembly' },
      { id: 'tv-installation', name: 'TV installation' },
      { id: 'curtain-installation', name: 'Curtain installation' },
      { id: 'gardening', name: 'Gardening' },
      { id: 'handyman-services', name: 'Handyman services' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'teaching',
    name: 'Teaching',
    emoji: '📚',
    priority: 0,
    subcategories: [
      { id: 'math-tuition', name: 'Math tuition' },
      { id: 'science-tuition', name: 'Science tuition' },
      { id: 'physics-tuition', name: 'Physics tuition' },
      { id: 'chemistry-tuition', name: 'Chemistry tuition' },
      { id: 'biology-tuition', name: 'Biology tuition' },
      { id: 'commerce-tuition', name: 'Commerce tuition' },
      { id: 'accounts-tuition', name: 'Accounts tuition' },
      { id: 'coding-classes', name: 'Coding classes' },
      { id: 'language-learning', name: 'Language learning' },
      { id: 'spoken-english', name: 'Spoken English' },
      { id: 'music-classes', name: 'Music classes' },
      { id: 'dance-classes', name: 'Dance classes' },
      { id: 'art-classes', name: 'Art classes' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'coaching-training',
    name: 'Coaching & Training',
    emoji: '🎯',
    priority: 0,
    subcategories: [
      { id: 'java-training', name: 'Java training' },
      { id: 'python-training', name: 'Python training' },
      { id: 'fullstack-training', name: 'Full stack training' },
      { id: 'data-science-training', name: 'Data science training' },
      { id: 'ai-ml-training', name: 'AI / ML training' },
      { id: 'cloud-training', name: 'Cloud training' },
      { id: 'devops-training', name: 'DevOps training' },
      { id: 'cybersecurity-training', name: 'Cybersecurity training' },
      { id: 'interview-prep', name: 'Interview preparation' },
      { id: 'resume-building', name: 'Resume building' },
      { id: 'mock-interviews', name: 'Mock interviews' },
      { id: 'communication-skills', name: 'Communication skills' },
      { id: 'public-speaking', name: 'Public speaking' },
      { id: 'leadership-training', name: 'Leadership training' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'mentorship',
    name: 'Mentorship',
    emoji: '🌟',
    priority: 0,
    subcategories: [
      { id: 'career-guidance', name: 'Career guidance' },
      { id: 'tech-mentorship', name: 'Tech mentorship' },
      { id: 'startup-mentorship', name: 'Startup mentorship' },
      { id: 'freelancing-guidance', name: 'Freelancing guidance' },
      { id: 'portfolio-review', name: 'Portfolio review' },
      { id: 'job-switching', name: 'Job switching guidance' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'software-dev',
    name: 'Software & Development',
    emoji: '💻',
    priority: 0,
    subcategories: [
      { id: 'website-dev', name: 'Website development' },
      { id: 'app-dev', name: 'App development' },
      { id: 'frontend-dev', name: 'Frontend development' },
      { id: 'backend-dev', name: 'Backend development' },
      { id: 'fullstack-dev', name: 'Full stack development' },
      { id: 'java-dev', name: 'Java development' },
      { id: 'python-dev', name: 'Python development' },
      { id: 'javascript-dev', name: 'JavaScript development' },
      { id: 'react-dev', name: 'React development' },
      { id: 'angular-dev', name: 'Angular development' },
      { id: 'nodejs-dev', name: 'Node.js development' },
      { id: 'api-integration', name: 'API integration' },
      { id: 'bug-fixing', name: 'Bug fixing' },
      { id: 'automation', name: 'Automation scripts' },
      { id: 'ai-ml-dev', name: 'AI / ML development' },
      { id: 'data-science', name: 'Data science' },
      { id: 'cloud-services', name: 'Cloud services' },
      { id: 'devops', name: 'DevOps' },
      { id: 'cybersecurity', name: 'Cybersecurity' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'design-creative',
    name: 'Design & Creative',
    emoji: '🎨',
    priority: 0,
    subcategories: [
      { id: 'ui-ux-design', name: 'UI/UX design' },
      { id: 'graphic-design', name: 'Graphic design' },
      { id: 'logo-design', name: 'Logo design' },
      { id: 'branding', name: 'Branding' },
      { id: 'video-editing', name: 'Video editing' },
      { id: 'reel-editing', name: 'Reel editing' },
      { id: 'motion-graphics', name: 'Motion graphics' },
      { id: 'animation', name: 'Animation' },
      { id: 'content-writing', name: 'Content writing' },
      { id: 'copywriting', name: 'Copywriting' },
      { id: 'blog-writing', name: 'Blog writing' },
      { id: 'resume-design', name: 'Resume design' },
      { id: 'portfolio-design', name: 'Portfolio design' },
      { id: 'social-media-design', name: 'Social media design' },
      { id: 'presentation-design', name: 'Presentation design' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'photography-video',
    name: 'Photography & Video',
    emoji: '📷',
    priority: 0,
    subcategories: [
      { id: 'event-photography', name: 'Event photography' },
      { id: 'wedding-photography', name: 'Wedding photography' },
      { id: 'product-photography', name: 'Product photography' },
      { id: 'portrait-photography', name: 'Portrait photography' },
      { id: 'video-shoot', name: 'Video shoot' },
      { id: 'video-editing', name: 'Video editing' },
      { id: 'drone-shoot', name: 'Drone shoot' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'beauty-wellness',
    name: 'Beauty & Wellness',
    emoji: '💅',
    priority: 0,
    subcategories: [
      { id: 'haircut', name: 'Haircut' },
      { id: 'hair-styling', name: 'Hair styling' },
      { id: 'makeup', name: 'Makeup' },
      { id: 'bridal-makeup', name: 'Bridal makeup' },
      { id: 'facial', name: 'Facial' },
      { id: 'massage', name: 'Massage' },
      { id: 'spa', name: 'Spa' },
      { id: 'skin-care', name: 'Skin care' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'fitness-training',
    name: 'Fitness & Training',
    emoji: '💪',
    priority: 0,
    subcategories: [
      { id: 'personal-training', name: 'Personal training' },
      { id: 'gym-training', name: 'Gym training' },
      { id: 'weight-loss', name: 'Weight loss coaching' },
      { id: 'yoga-training', name: 'Yoga training' },
      { id: 'meditation', name: 'Meditation guidance' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'tailoring',
    name: 'Tailoring & Clothing',
    emoji: '🧵',
    priority: 0,
    subcategories: [
      { id: 'clothing-stitching', name: 'Clothing stitching' },
      { id: 'alteration', name: 'Alteration' },
      { id: 'blouse-stitching', name: 'Blouse stitching' },
      { id: 'uniform-stitching', name: 'Uniform stitching' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'laundry',
    name: 'Laundry',
    emoji: '👕',
    priority: 0,
    subcategories: [
      { id: 'laundry-service', name: 'Laundry' },
      { id: 'dry-cleaning', name: 'Dry cleaning' },
      { id: 'ironing', name: 'Ironing' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    emoji: '⚕️',
    priority: 0,
    subcategories: [
      { id: 'doctor-consultation', name: 'Doctor consultation' },
      { id: 'nursing-care', name: 'Nursing care' },
      { id: 'patient-care', name: 'Patient care' },
      { id: 'elderly-care', name: 'Elderly care' },
      { id: 'home-nurse', name: 'Home nurse' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'legal',
    name: 'Legal',
    emoji: '⚖️',
    priority: 0,
    subcategories: [
      { id: 'legal-advice', name: 'Legal advice' },
      { id: 'property-legal', name: 'Property legal help' },
      { id: 'criminal-lawyer', name: 'Criminal lawyer' },
      { id: 'civil-lawyer', name: 'Civil lawyer' },
      { id: 'divorce-lawyer', name: 'Divorce lawyer' },
      { id: 'corporate-lawyer', name: 'Corporate lawyer' },
      { id: 'agreement-drafting', name: 'Agreement drafting' },
      { id: 'documentation', name: 'Documentation' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'ca-finance',
    name: 'CA & Finance',
    emoji: '💰',
    priority: 0,
    subcategories: [
      { id: 'gst-registration', name: 'GST registration' },
      { id: 'gst-filing', name: 'GST filing' },
      { id: 'income-tax-filing', name: 'Income tax filing' },
      { id: 'accounting', name: 'Accounting' },
      { id: 'bookkeeping', name: 'Bookkeeping' },
      { id: 'audit', name: 'Audit' },
      { id: 'business-registration', name: 'Business registration' },
      { id: 'financial-planning', name: 'Financial planning' },
      { id: 'investment-advice', name: 'Investment advice' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'events',
    name: 'Events & Entertainment',
    emoji: '🎉',
    priority: 0,
    subcategories: [
      { id: 'event-planning', name: 'Event planning' },
      { id: 'decoration', name: 'Decoration' },
      { id: 'dj-service', name: 'DJ service' },
      { id: 'music-performance', name: 'Music performance' },
      { id: 'dance-performance', name: 'Dance performance' },
      { id: 'anchoring', name: 'Anchoring' },
      { id: 'catering-support', name: 'Catering support' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'pet-care',
    name: 'Pet Care',
    emoji: '🐕',
    priority: 1,
    subcategories: [
      { id: 'pet-grooming', name: 'Pet grooming' },
      { id: 'pet-walking', name: 'Pet walking' },
      { id: 'pet-sitting', name: 'Pet sitting' },
      { id: 'pet-training', name: 'Pet training' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'care-support',
    name: 'Care & Support',
    emoji: '❤️',
    priority: 0,
    subcategories: [
      { id: 'elderly-care', name: 'Elderly care' },
      { id: 'patient-caretaker', name: 'Patient caretaker' },
      { id: 'home-assistance', name: 'Home assistance' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'govt-id',
    name: 'Government & ID Services',
    emoji: '🆔',
    priority: 0,
    subcategories: [
      { id: 'aadhaar-update', name: 'Aadhaar update' },
      { id: 'pan-card-help', name: 'PAN card help' },
      { id: 'passport-help', name: 'Passport help' },
      { id: 'driving-license-help', name: 'Driving license help' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'partner-companion',
    name: 'Partner / Companion',
    emoji: '🤝',
    priority: 0,
    subcategories: [
      { id: 'study-partner', name: 'Study partner' },
      { id: 'gym-partner', name: 'Gym partner' },
      { id: 'travel-partner', name: 'Travel partner' },
      { id: 'other', name: 'Other' },
    ],
  },
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

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
 * Get priority categories (for quick access / helper mode)
 */
export function getPriorityCategories(): ServiceCategory[] {
  return SERVICE_CATEGORIES.filter(cat => cat.priority === 1);
}

/**
 * Search categories by name or emoji
 */
export function searchCategories(query: string): ServiceCategory[] {
  const lowerQuery = query.toLowerCase();
  return SERVICE_CATEGORIES.filter(
    cat =>
      cat.name.toLowerCase().includes(lowerQuery) ||
      cat.emoji.includes(lowerQuery) ||
      cat.subcategories.some(sub => sub.name.toLowerCase().includes(lowerQuery))
  );
}