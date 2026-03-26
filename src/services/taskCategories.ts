// =====================================================
// LOCALFELO TASK CATEGORIES - COMPLETE 2026 VERSION
// =====================================================
// All 27 main categories with comprehensive subcategories
// Aligned with professional services for consistency

export interface TaskSubcategory {
  id: string;
  name: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  emoji: string;
  priority: 0 | 1; // 1 = High priority (shown first), 0 = Normal
  subcategories: TaskSubcategory[];
}

export const TASK_CATEGORIES: TaskCategory[] = [
  {
    id: 'quick-help',
    name: 'Quick Help',
    emoji: '⚡',
    priority: 1,
    subcategories: [
      { id: 'carry-luggage', name: 'Carry luggage' },
      { id: 'carry-bags', name: 'Carry bags' },
      { id: 'carry-boxes', name: 'Carry boxes' },
      { id: 'carry-heavy', name: 'Carry heavy items' },
      { id: 'help-shifting', name: 'Help with shifting' },
      { id: 'help-packing', name: 'Help with packing' },
      { id: 'loading-unloading', name: 'Help with loading / unloading' },
      { id: 'bring-medicine', name: 'Bring medicine' },
      { id: 'bring-groceries', name: 'Bring groceries' },
      { id: 'bring-gas', name: 'Bring gas cylinder' },
      { id: 'bring-water', name: 'Bring water cans' },
      { id: 'bring-documents', name: 'Bring documents' },
      { id: 'pickup-parcel', name: 'Pick up parcel' },
      { id: 'pickup-shop', name: 'Pick up from shop' },
      { id: 'pickup-friend', name: 'Pick up from friend / office' },
      { id: 'emergency-pickup', name: 'Emergency item pickup' },
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
      { id: 'washing-machine', name: 'Washing machine repair' },
      { id: 'tv-repair', name: 'TV repair' },
      { id: 'microwave-repair', name: 'Microwave repair' },
      { id: 'purifier-repair', name: 'Water purifier repair' },
      { id: 'laptop-repair', name: 'Laptop repair' },
      { id: 'mobile-repair', name: 'Mobile repair' },
      { id: 'printer-repair', name: 'Printer repair' },
      { id: 'fan-repair', name: 'Fan repair' },
      { id: 'switch-repair', name: 'Switch repair' },
      { id: 'wiring-repair', name: 'Wiring repair' },
      { id: 'inverter-repair', name: 'Inverter repair' },
      { id: 'tap-repair', name: 'Tap repair' },
      { id: 'pipe-leakage', name: 'Pipe leakage fix' },
      { id: 'drain-blockage', name: 'Drain blockage' },
      { id: 'door-repair', name: 'Door repair' },
      { id: 'lock-repair', name: 'Lock repair' },
      { id: 'furniture-repair', name: 'Furniture repair' },
      { id: 'car-repair', name: 'Car repair' },
      { id: 'bike-repair', name: 'Bike repair' },
      { id: 'battery-jump', name: 'Battery jump start' },
      { id: 'flat-tyre', name: 'Flat tyre help' },
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
      { id: 'washing-machine', name: 'Washing machine installation' },
      { id: 'fan-installation', name: 'Fan installation' },
      { id: 'light-installation', name: 'Light installation' },
      { id: 'switchboard', name: 'Switchboard installation' },
      { id: 'furniture-assembly', name: 'Furniture assembly' },
      { id: 'appliance', name: 'Appliance installation' },
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
      { id: 'car-ride', name: 'Car ride' },
      { id: 'bike-ride', name: 'Bike ride' },
      { id: 'airport-drop', name: 'Airport drop' },
      { id: 'airport-pickup', name: 'Airport pickup' },
      { id: 'outstation', name: 'Outstation driver' },
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
      { id: 'courier-pickup', name: 'Courier pickup' },
      { id: 'food-pickup', name: 'Food pickup' },
      { id: 'document-pickup', name: 'Document pickup' },
      { id: 'water-delivery', name: 'Water can delivery' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'utilities',
    name: 'Utilities',
    emoji: '💧',
    priority: 1,
    subcategories: [
      { id: 'water-tanker', name: 'Water tanker booking' },
      { id: 'borewell', name: 'Borewell service help' },
      { id: 'inverter-service', name: 'Inverter service' },
      { id: 'battery-service', name: 'Battery service' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'stay-living',
    name: 'Stay & Living',
    emoji: '🏠',
    priority: 1,
    subcategories: [
      { id: 'girls-pg', name: 'Girls PG' },
      { id: 'gents-pg', name: 'Gents PG' },
      { id: 'co-living', name: 'Co-living' },
      { id: 'room-sharing', name: 'Room sharing' },
      { id: 'flatmate', name: 'Flatmate needed' },
      { id: 'short-stay', name: 'Short stay' },
      { id: 'hostel', name: 'Hostel stay' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'rent-property',
    name: 'Rent & Property',
    emoji: '🏢',
    priority: 1,
    subcategories: [
      { id: 'house-rent', name: 'House for rent' },
      { id: 'flat-rent', name: 'Flat for rent' },
      { id: 'commercial-rent', name: 'Commercial property rent' },
      { id: 'shop-rent', name: 'Shop for rent' },
      { id: 'office-rent', name: 'Office space rent' },
      { id: 'property-buy', name: 'Property buying' },
      { id: 'property-sell', name: 'Property selling' },
      { id: 'real-estate', name: 'Real estate agent' },
      { id: 'rental-agreement', name: 'Rental agreement help' },
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
      { id: 'frontend', name: 'Frontend development' },
      { id: 'backend', name: 'Backend development' },
      { id: 'fullstack', name: 'Full stack development' },
      { id: 'java', name: 'Java development' },
      { id: 'python', name: 'Python development' },
      { id: 'javascript', name: 'JavaScript development' },
      { id: 'typescript', name: 'TypeScript development' },
      { id: 'c-cpp', name: 'C / C++ development' },
      { id: 'csharp', name: 'C# / .NET development' },
      { id: 'go', name: 'Go development' },
      { id: 'rust', name: 'Rust development' },
      { id: 'react', name: 'React development' },
      { id: 'angular', name: 'Angular development' },
      { id: 'vue', name: 'Vue development' },
      { id: 'nodejs', name: 'Node.js development' },
      { id: 'django', name: 'Django development' },
      { id: 'springboot', name: 'Spring Boot development' },
      { id: 'api-integration', name: 'API integration' },
      { id: 'bug-fixing', name: 'Bug fixing' },
      { id: 'automation', name: 'Automation scripts' },
      { id: 'ai-ml', name: 'AI / ML development' },
      { id: 'data-science', name: 'Data science help' },
      { id: 'cloud', name: 'Cloud (AWS / Azure / GCP)' },
      { id: 'devops', name: 'DevOps support' },
      { id: 'cybersecurity', name: 'Cybersecurity help' },
      { id: 'blockchain', name: 'Blockchain development' },
      { id: 'game-dev', name: 'Game development' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'design-creative',
    name: 'Design & Creative',
    emoji: '🎨',
    priority: 0,
    subcategories: [
      { id: 'ui-ux', name: 'UI/UX design' },
      { id: 'figma', name: 'Figma design' },
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
      { id: 'social-media', name: 'Social media design' },
      { id: 'presentation', name: 'Presentation design' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'teaching',
    name: 'Teaching',
    emoji: '📚',
    priority: 0,
    subcategories: [
      { id: 'math', name: 'Math tuition' },
      { id: 'science', name: 'Science tuition' },
      { id: 'physics', name: 'Physics' },
      { id: 'chemistry', name: 'Chemistry' },
      { id: 'biology', name: 'Biology' },
      { id: 'commerce', name: 'Commerce' },
      { id: 'accounts', name: 'Accounts' },
      { id: 'economics', name: 'Economics' },
      { id: 'coding-classes', name: 'Coding classes' },
      { id: 'language', name: 'Language learning' },
      { id: 'spoken-english', name: 'Spoken English' },
      { id: 'public-speaking', name: 'Public speaking' },
      { id: 'music', name: 'Music classes' },
      { id: 'dance', name: 'Dance classes' },
      { id: 'art', name: 'Art classes' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'coaching-training',
    name: 'Coaching & Training',
    emoji: '🎯',
    priority: 0,
    subcategories: [
      { id: 'interview-prep', name: 'Interview preparation' },
      { id: 'resume-building', name: 'Resume building' },
      { id: 'mock-interviews', name: 'Mock interviews' },
      { id: 'placement', name: 'Placement training' },
      { id: 'java-coaching', name: 'Java coaching' },
      { id: 'python-coaching', name: 'Python coaching' },
      { id: 'fullstack-training', name: 'Full stack training' },
      { id: 'data-science', name: 'Data science training' },
      { id: 'ai-ml', name: 'AI / ML training' },
      { id: 'cybersecurity', name: 'Cybersecurity training' },
      { id: 'cloud-cert', name: 'Cloud certification training' },
      { id: 'devops', name: 'DevOps training' },
      { id: 'startup-coaching', name: 'Startup coaching' },
      { id: 'freelancing', name: 'Freelancing training' },
      { id: 'entrepreneurship', name: 'Entrepreneurship coaching' },
      { id: 'communication', name: 'Communication skills' },
      { id: 'public-speaking', name: 'Public speaking coaching' },
      { id: 'leadership', name: 'Leadership training' },
      { id: 'confidence', name: 'Confidence building' },
      { id: 'personal-training', name: 'Personal training' },
      { id: 'weight-loss', name: 'Weight loss coaching' },
      { id: 'yoga', name: 'Yoga training' },
      { id: 'gym', name: 'Gym training' },
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
      { id: 'freelancing', name: 'Freelancing guidance' },
      { id: 'portfolio-review', name: 'Portfolio review' },
      { id: 'job-switching', name: 'Job switching guidance' },
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
      { id: 'property-lawyer', name: 'Property lawyer' },
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
      { id: 'income-tax', name: 'Income tax filing' },
      { id: 'accounting', name: 'Accounting' },
      { id: 'bookkeeping', name: 'Bookkeeping' },
      { id: 'audit', name: 'Audit' },
      { id: 'business-reg', name: 'Business registration' },
      { id: 'financial-planning', name: 'Financial planning' },
      { id: 'investment', name: 'Investment advice' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'business-career',
    name: 'Business & Career Services',
    emoji: '💼',
    priority: 0,
    subcategories: [
      { id: 'resume-building', name: 'Resume building' },
      { id: 'resume-review', name: 'Resume review' },
      { id: 'interview-prep', name: 'Interview preparation' },
      { id: 'career-consulting', name: 'Career consulting' },
      { id: 'business-consulting', name: 'Business consulting' },
      { id: 'startup-consulting', name: 'Startup consulting' },
      { id: 'marketing-consulting', name: 'Marketing consulting' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'govt-id',
    name: 'Government & ID Services',
    emoji: '🆔',
    priority: 0,
    subcategories: [
      { id: 'aadhaar', name: 'Aadhaar update' },
      { id: 'pan-card', name: 'PAN card help' },
      { id: 'passport', name: 'Passport help' },
      { id: 'driving-license', name: 'Driving license help' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'photography-video',
    name: 'Photography & Video',
    emoji: '📷',
    priority: 0,
    subcategories: [
      { id: 'event-photo', name: 'Event photography' },
      { id: 'wedding-photo', name: 'Wedding photography' },
      { id: 'portrait', name: 'Portrait photography' },
      { id: 'product-photo', name: 'Product photography' },
      { id: 'video-shoot', name: 'Video shoot' },
      { id: 'video-editing', name: 'Video editing' },
      { id: 'drone-shoot', name: 'Drone shoot' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'events',
    name: 'Events',
    emoji: '🎉',
    priority: 0,
    subcategories: [
      { id: 'event-planning', name: 'Event planning' },
      { id: 'decoration', name: 'Decoration' },
      { id: 'dj', name: 'DJ' },
      { id: 'anchor', name: 'Anchor / host' },
      { id: 'catering', name: 'Catering support' },
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
      { id: 'water-tank', name: 'Water tank cleaning' },
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
      { id: 'chef-events', name: 'Chef for events' },
      { id: 'meal-prep', name: 'Meal preparation' },
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
      { id: 'packing', name: 'Packing help' },
      { id: 'loading-unloading', name: 'Loading / unloading' },
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
      { id: 'patient-care', name: 'Patient caretaker' },
      { id: 'home-nurse', name: 'Home nurse' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'home-services',
    name: 'Home Services',
    emoji: '🏡',
    priority: 0,
    subcategories: [
      { id: 'painting', name: 'Painting' },
      { id: 'pest-control', name: 'Pest control' },
      { id: 'furniture-assembly', name: 'Furniture assembly' },
      { id: 'tv-installation', name: 'TV installation' },
      { id: 'curtain-install', name: 'Curtain installation' },
      { id: 'gardening', name: 'Gardening' },
      { id: 'handyman', name: 'Handyman services' },
      { id: 'other', name: 'Other' },
    ],
  },
  {
    id: 'vehicle-care',
    name: 'Vehicle Care',
    emoji: '🚙',
    priority: 0,
    subcategories: [
      { id: 'car-wash', name: 'Car wash' },
      { id: 'bike-wash', name: 'Bike wash' },
      { id: 'vehicle-detailing', name: 'Vehicle detailing' },
      { id: 'other', name: 'Other' },
    ],
  },
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get all task categories
 */
export function getAllTaskCategories(): TaskCategory[] {
  return TASK_CATEGORIES;
}

/**
 * Get a category by ID
 */
export function getTaskCategoryById(categoryId: string): TaskCategory | undefined {
  return TASK_CATEGORIES.find(cat => cat.id === categoryId);
}

/**
 * Get subcategories for a specific category
 */
export function getTaskSubcategoriesByCategoryId(categoryId: string): TaskSubcategory[] {
  const category = TASK_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.subcategories || [];
}

/**
 * Get category emoji by ID
 */
export function getTaskCategoryEmojiById(categoryId: string): string {
  const category = TASK_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.emoji || '✨';
}

/**
 * Get category name by ID
 */
export function getTaskCategoryNameById(categoryId: string): string {
  const category = TASK_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.name || 'Other';
}

/**
 * Get subcategory name
 */
export function getTaskSubcategoryName(categoryId: string, subcategoryId: string): string {
  const category = TASK_CATEGORIES.find(cat => cat.id === categoryId);
  const subcategory = category?.subcategories.find(sub => sub.id === subcategoryId);
  return subcategory?.name || 'Other';
}

/**
 * Get priority categories (for quick access)
 */
export function getPriorityTaskCategories(): TaskCategory[] {
  return TASK_CATEGORIES.filter(cat => cat.priority === 1);
}

/**
 * Search categories by name or emoji
 */
export function searchTaskCategories(query: string): TaskCategory[] {
  const lowerQuery = query.toLowerCase();
  return TASK_CATEGORIES.filter(
    cat =>
      cat.name.toLowerCase().includes(lowerQuery) ||
      cat.emoji.includes(lowerQuery) ||
      cat.subcategories.some(sub => sub.name.toLowerCase().includes(lowerQuery))
  );
}
