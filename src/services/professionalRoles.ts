// =====================================================
// ROLE-TO-SERVICE MAPPING GUIDELINES
// =====================================================
// After a user selects a role, show "Recommended Services" based on this mapping:

// =====================================================
// LOCKED PROFESSIONAL ROLES - 44 TOTAL
// =====================================================
// These are the fixed professional identity roles that can be selected
// Organized into 10 logical groups for better UX

export const LOCKED_PROFESSIONAL_ROLES = [
  {
    name: '⭐ Most Common',
    icon: '⭐',
    roles: [
      'Electrician',
      'Plumber',
      'Carpenter',
      'Driver',
      'Delivery Partner',
      'Cleaner',
      'Maid / House Help',
      'Cook / Chef',
    ],
  },
  {
    name: '🏠 Home & Maintenance',
    icon: '🏠',
    roles: [
      'Painter',
      'Gardener',
      'Pest Control Professional',
      'Mechanic',
      'Technician (General)',
      'Home Service Professional',
    ],
  },
  {
    name: '🎓 Education & Career',
    icon: '🎓',
    roles: [
      'Teacher / Tutor',
      'Coach / Trainer',
      'Mentor',
    ],
  },
  {
    name: '💼 Professional Services',
    icon: '💼',
    roles: [
      'CA / Accountant',
      'Lawyer',
      'Consultant',
    ],
  },
  {
    name: '💻 Creative & Freelance',
    icon: '💻',
    roles: [
      'Web Developer',
      'Graphic Designer',
      'Video Editor',
      'Content Writer',
      'Photographer',
      'Videographer',
      'Freelancer',
    ],
  },
  {
    name: '💄 Beauty & Wellness',
    icon: '💄',
    roles: [
      'Beautician',
      'Salon Professional',
      'Fitness Trainer',
      'Yoga Instructor',
    ],
  },
  {
    name: '⚕️ Healthcare',
    icon: '⚕️',
    roles: [
      'Doctor / Healthcare',
      'Nurse / Caretaker',
    ],
  },
  {
    name: '🎉 Events & Entertainment',
    icon: '🎉',
    roles: [
      'Event Planner',
      'DJ',
      'Musician',
      'Dancer',
      'Anchor / Host',
    ],
  },
  {
    name: '🧰 Support & Field Work',
    icon: '🧰',
    roles: [
      'Helper',
      'Errand Runner',
      'Moving & Packing Helper',
      'Event Helper',
      'Security Guard',
    ],
  },
  {
    name: '🐾 Others',
    icon: '🐾',
    roles: [
      'Pet Caretaker',
      'Laundry Service',
      'Tailor',
      'Barber',
      'Government & ID Services',
      'Partner / Companion',
    ],
  },
];

/**
 * Extract all valid role names from LOCKED_PROFESSIONAL_ROLES
 */
export const ALL_VALID_ROLE_NAMES = LOCKED_PROFESSIONAL_ROLES.flatMap(group => group.roles);

/**
 * Get the display order/priority for a role (lower number = higher priority)
 * Used for sorting roles in lists
 */
export function getRoleDisplayOrder(roleName: string): number {
  for (let i = 0; i < LOCKED_PROFESSIONAL_ROLES.length; i++) {
    const groupIndex = LOCKED_PROFESSIONAL_ROLES[i].roles.indexOf(roleName);
    if (groupIndex !== -1) {
      // Return a combined index: group position * 100 + position within group
      return i * 100 + groupIndex;
    }
  }
  return 9999; // Unknown roles go to the end
}

/**
 * Check if a role name is valid
 */
export function isValidRoleName(roleName: string): boolean {
  return ALL_VALID_ROLE_NAMES.includes(roleName);
}

/**
 * Get the group/category for a role
 */
export function getRoleGroup(roleName: string): string {
  for (const group of LOCKED_PROFESSIONAL_ROLES) {
    if (group.roles.includes(roleName)) {
      return group.name;
    }
  }
  return 'Other';
}

/**
 * Map Professional Role → Specific Subcategories (format: "category-id:subcategory-id")
 * When user selects a role, show ONLY these specific subcategories as recommended
 */
export const ROLE_TO_SUBCATEGORIES: Record<string, string[]> = {
  // ⭐ Most Common
  'Electrician': [
    'repair:ac-repair',
    'repair:fan-repair',
    'repair:switch-repair',
    'repair:wiring-repair',
    'repair:inverter-repair',
    'installation:light-installation',
  ],
  
  'Plumber': [
    'plumbing:tap-repair',
    'plumbing:pipe-leakage',
    'plumbing:drain-blockage',
    'plumbing:water-tank-cleaning',
    'plumbing:bathroom-fitting',
  ],
  
  'Carpenter': [
    'carpentry:furniture-assembly',
    'carpentry:door-repair',
    'carpentry:furniture-repair',
    'home-services:curtain-installation',
    'home-services:handyman-services',
  ],
  
  'Driver': [
    'driver-rides:driver-hours',
    'driver-rides:personal-driver',
    'driver-rides:airport-pickup',
    'driver-rides:airport-drop',
    'driver-rides:outstation-driver',
    'driver-rides:night-driver',
  ],
  
  'Delivery Partner': [
    'delivery-pickup:parcel-delivery',
    'delivery-pickup:grocery-pickup',
    'delivery-pickup:medicine-pickup',
    'delivery-pickup:food-pickup',
    'delivery-pickup:document-pickup',
    'delivery-pickup:water-delivery',
  ],
  
  'Cleaner': [
    'cleaning:house-cleaning',
    'cleaning:deep-cleaning',
    'cleaning:kitchen-cleaning',
    'cleaning:bathroom-cleaning',
    'cleaning:sofa-cleaning',
    'cleaning:office-cleaning',
  ],
  
  'Maid / House Help': [
    'cleaning:house-cleaning',
    'cleaning:kitchen-cleaning',
    'cooking:meal-preparation',
    'care-support:home-assistance',
    'care-support:elderly-care',
  ],
  
  'Cook / Chef': [
    'cooking:home-cooking',
    'cooking:personal-cook',
    'cooking:event-cooking',
    'cooking:meal-preparation',
    'events:catering-support',
  ],

  // 🏠 Home & Maintenance
  'Painter': [
    'home-services:painting',
  ],
  
  'Gardener': [
    'home-services:gardening',
  ],
  
  'Pest Control Professional': [
    'home-services:pest-control',
  ],
  
  'Mechanic': [
    'repair:car-repair',
    'repair:bike-repair',
  ],
  
  'Technician (General)': [
    'repair:ac-repair',
    'repair:fridge-repair',
    'repair:washing-machine-repair',
    'repair:tv-repair',
    'repair:microwave-repair',
    'repair:laptop-repair',
  ],
  
  'Home Service Professional': [
    'home-services:painting',
    'home-services:pest-control',
    'home-services:furniture-assembly',
    'home-services:curtain-installation',
    'home-services:gardening',
    'home-services:handyman-services',
  ],

  // 🎓 Education & Career
  'Teacher / Tutor': [
    'teaching:math-tuition',
    'teaching:science-tuition',
    'teaching:physics-tuition',
    'teaching:chemistry-tuition',
    'teaching:biology-tuition',
    'teaching:accounts-tuition',
  ],
  
  'Coach / Trainer': [
    'coaching-training:interview-prep',
    'coaching-training:communication-skills',
    'coaching-training:public-speaking',
    'coaching-training:leadership-training',
  ],
  
  'Mentor': [
    'mentorship:career-guidance',
    'mentorship:tech-mentorship',
    'mentorship:startup-mentorship',
    'mentorship:freelancing-guidance',
    'mentorship:portfolio-review',
    'mentorship:job-switching',
  ],

  // 💼 Professional Services
  'CA / Accountant': [
    'ca-finance:gst-registration',
    'ca-finance:gst-filing',
    'ca-finance:income-tax-filing',
    'ca-finance:accounting',
    'ca-finance:bookkeeping',
    'ca-finance:audit',
  ],
  
  'Lawyer': [
    'legal:legal-advice',
    'legal:property-legal',
    'legal:criminal-lawyer',
    'legal:civil-lawyer',
    'legal:divorce-lawyer',
    'legal:agreement-drafting',
  ],
  
  'Consultant': [
    'ca-finance:business-registration',
    'ca-finance:financial-planning',
    'ca-finance:investment-advice',
    'mentorship:startup-mentorship',
    'mentorship:career-guidance',
  ],

  // 💻 Creative & Freelance
  'Web Developer': [
    'software-dev:website-dev',
    'software-dev:app-dev',
    'software-dev:frontend-dev',
    'software-dev:backend-dev',
    'software-dev:fullstack-dev',
    'software-dev:api-integration',
  ],
  
  'Graphic Designer': [
    'design-creative:graphic-design',
    'design-creative:logo-design',
    'design-creative:branding',
    'design-creative:social-media-design',
    'design-creative:presentation-design',
    'design-creative:portfolio-design',
  ],
  
  'Video Editor': [
    'design-creative:video-editing',
    'design-creative:reel-editing',
    'design-creative:motion-graphics',
    'design-creative:animation',
  ],
  
  'Content Writer': [
    'design-creative:content-writing',
    'design-creative:copywriting',
    'design-creative:blog-writing',
  ],
  
  'Photographer': [
    'photography-video:event-photography',
    'photography-video:wedding-photography',
    'photography-video:product-photography',
    'photography-video:portrait-photography',
    'photography-video:drone-shoot',
  ],
  
  'Videographer': [
    'photography-video:video-shoot',
    'photography-video:video-editing',
    'photography-video:drone-shoot',
  ],
  
  'Freelancer': [
    'design-creative:graphic-design',
    'design-creative:content-writing',
    'design-creative:video-editing',
    'software-dev:website-dev',
    'design-creative:social-media-design',
    'design-creative:branding',
  ],

  // 💄 Beauty & Wellness
  'Beautician': [
    'beauty-wellness:haircut',
    'beauty-wellness:makeup',
    'beauty-wellness:facial',
    'beauty-wellness:skin-care',
    'beauty-wellness:bridal-makeup',
  ],
  
  'Salon Professional': [
    'beauty-wellness:hair-styling',
    'beauty-wellness:haircut',
    'beauty-wellness:makeup',
    'beauty-wellness:facial',
    'beauty-wellness:spa',
  ],
  
  'Fitness Trainer': [
    'fitness-training:personal-training',
    'fitness-training:gym-training',
    'fitness-training:weight-loss',
  ],
  
  'Yoga Instructor': [
    'fitness-training:yoga-training',
    'fitness-training:meditation',
  ],

  // ⚕️ Healthcare
  'Doctor / Healthcare': [
    'healthcare:doctor-consultation',
  ],
  
  'Nurse / Caretaker': [
    'healthcare:nursing-care',
    'healthcare:patient-care',
    'healthcare:elderly-care',
    'healthcare:home-nurse',
  ],

  // 🎉 Events & Entertainment
  'Event Planner': [
    'events:event-planning',
    'events:decoration',
    'events:catering-support',
  ],
  
  'DJ': [
    'events:dj-service',
  ],
  
  'Musician': [
    'events:music-performance',
  ],
  
  'Dancer': [
    'events:dance-performance',
    'teaching:dance-classes',
  ],
  
  'Anchor / Host': [
    'events:anchoring',
  ],

  // 🧰 Support & Field Work
  'Helper': [
    'quick-help:carry-luggage',
    'quick-help:carry-boxes',
    'quick-help:help-shifting',
    'quick-help:loading-unloading',
    'quick-help:small-errands',
  ],
  
  'Errand Runner': [
    'quick-help:bring-groceries',
    'quick-help:bring-medicines',
    'quick-help:pickup-parcel',
    'quick-help:wait-line',
    'delivery-pickup:parcel-delivery',
  ],
  
  'Moving & Packing Helper': [
    'shifting-moving:house-shifting',
    'shifting-moving:packing-help',
    'shifting-moving:loading-unloading',
    'shifting-moving:furniture-moving',
  ],
  
  'Event Helper': [
    'quick-help:loading-unloading',
    'events:catering-support',
  ],
  
  'Security Guard': [
    'care-support:home-assistance',
  ],

  // 🐾 Others
  'Pet Caretaker': [
    'pet-care:pet-grooming',
    'pet-care:pet-walking',
    'pet-care:pet-sitting',
    'pet-care:pet-training',
  ],
  
  'Laundry Service': [
    'laundry:laundry-service',
  ],
  
  'Tailor': [
    'tailoring:clothing-stitching',
    'tailoring:alteration',
  ],
  
  'Barber': [
    'beauty-wellness:haircut',
  ],
  
  'Government & ID Services': [
    'govt-id:aadhaar-update',
    'govt-id:pan-card-help',
    'govt-id:passport-help',
    'govt-id:driving-license-help',
  ],
  
  'Partner / Companion': [
    'partner-companion:study-partner',
    'partner-companion:gym-partner',
    'partner-companion:travel-partner',
  ],
};

/**
 * Get specific subcategory IDs for a role
 * Returns array of "category-id:subcategory-id" strings
 */
export function getSubcategoriesForRole(roleName: string): string[] {
  return ROLE_TO_SUBCATEGORIES[roleName] || [];
}

// DEPRECATED - Use ROLE_TO_SUBCATEGORIES instead
export const ROLE_TO_SERVICE_CATEGORIES: Record<string, string[]> = {
  // Keep for backward compatibility but recommend using ROLE_TO_SUBCATEGORIES
  'Electrician': ['repair', 'installation'],
  'Plumber': ['repair'],
  'Carpenter': ['repair', 'installation', 'home-services'],
  'Driver': ['driver-rides', 'delivery-pickup'],
  'Delivery Partner': ['driver-rides', 'delivery-pickup'],
  'Cleaner': ['cleaning'],
  'Maid / House Help': ['cleaning', 'cooking', 'care-support'],
  'Cook / Chef': ['cooking'],

  // 🏠 Home & Maintenance
  'Painter': ['home-services'],
  'Gardener': ['home-services'],
  'Pest Control Professional': ['home-services'],
  'Mechanic': ['repair'],
  'Technician (General)': ['repair', 'installation'],
  'Home Service Professional': ['repair', 'installation', 'home-services'],

  // 🎓 Education & Career
  'Teacher / Tutor': ['teaching'],
  'Coach / Trainer': ['coaching-training'],
  'Mentor': ['mentorship'],

  // 💼 Professional Services
  'CA / Accountant': ['ca-finance'],
  'Lawyer': ['legal'],
  'Consultant': ['mentorship', 'coaching-training'],

  // 💻 Creative & Freelance
  'Web Developer': ['software-dev'],
  'Graphic Designer': ['design-creative'],
  'Video Editor': ['design-creative', 'photography-video'],
  'Content Writer': ['design-creative'],
  'Photographer': ['photography-video'],
  'Videographer': ['photography-video'],
  'Freelancer': ['software-dev', 'design-creative'],

  // 💄 Beauty & Wellness
  'Beautician': ['beauty-wellness'],
  'Salon Professional': ['beauty-wellness'],
  'Fitness Trainer': ['coaching-training'],
  'Yoga Instructor': ['coaching-training'],

  // ⚕️ Healthcare
  'Doctor / Healthcare': ['healthcare'],
  'Nurse / Caretaker': ['healthcare', 'care-support'],

  // 🎉 Events & Entertainment
  'Event Planner': ['events'],
  'DJ': ['events'],
  'Musician': ['events'],
  'Dancer': ['events'],
  'Anchor / Host': ['events'],

  // 🐾 Others
  'Pet Caretaker': ['pet-care'],
  'Laundry Service': ['cleaning'],
  'Tailor': ['home-services'],
  'Barber': ['beauty-wellness'],
  'Government & ID Services': ['govt-id'],
  'Security Guard': ['care-support'],
  'Partner / Companion': ['quick-help'],
  'Helper': ['quick-help'],
  'Errand Runner': ['quick-help'],
  'Moving & Packing Helper': ['quick-help'],
  'Event Helper': ['quick-help'],
  'Other': ['quick-help'],
};

/**
 * Get service category IDs for a role
 * Returns the category IDs that should show all their subcategories as recommended
 */
export function getServiceCategoriesForRole(roleName: string): string[] {
  return ROLE_TO_SERVICE_CATEGORIES[roleName] || [];
}

// DEPRECATED - Keeping for backward compatibility but should use category-based mapping
export const ROLE_TO_RECOMMENDED_SERVICES: Record<string, string[]> = {
  // Most Common
  'Electrician': ['electrical-work', 'electrical-repair', 'wiring-installation'],
  'Plumber': ['plumbing-repair', 'pipe-installation', 'water-heater-service'],
  'Carpenter': ['furniture-repair', 'carpentry', 'custom-furniture'],
  'Driver': ['car-driver', 'bike-rider', 'delivery-driver'],
  'Delivery Partner': ['car-driver', 'bike-rider', 'delivery-driver'],
  'Cleaner': ['home-cleaning', 'office-cleaning', 'deep-cleaning'],
  'Maid / House Help': ['house-cleaning', 'utensil-washing', 'floor-mopping'],
  'Cook / Chef': ['home-cooking', 'tiffin-service', 'party-cooking'],

  // Home & Maintenance
  'Painter': ['wall-painting', 'interior-painting', 'exterior-painting'],
  'Gardener': ['garden-maintenance', 'plant-care', 'lawn-mowing'],
  'Pest Control Professional': ['pest-control', 'termite-control', 'rodent-control'],
  'Mechanic': ['car-repair', 'bike-repair', 'vehicle-servicing'],
  'Technician (General)': ['appliance-repair', 'ac-repair', 'tv-repair'],
  'Home Service Professional': ['handyman-services', 'general-repair', 'maintenance'],

  // Education & Career
  'Teacher / Tutor': ['academic-tutoring', 'subject-teaching', 'home-tuition'],
  'Coach / Trainer': ['skill-training', 'career-coaching', 'language-training'],
  'Mentor': ['career-mentorship', 'business-mentorship', 'life-coaching'],

  // Professional Services
  'CA / Accountant': ['accounting', 'tax-filing', 'gst-services'],
  'Lawyer': ['legal-consultation', 'document-drafting', 'court-representation'],
  'Consultant': ['business-consulting', 'strategy-consulting', 'financial-consulting'],

  // Creative & Freelance
  'Web Developer': ['website-development', 'web-design', 'app-development'],
  'Graphic Designer': ['logo-design', 'branding', 'graphic-design'],
  'Video Editor': ['video-editing', 'motion-graphics', 'video-production'],
  'Content Writer': ['content-writing', 'copywriting', 'blog-writing'],
  'Photographer': ['event-photography', 'product-photography', 'portrait-photography'],
  'Videographer': ['event-videography', 'commercial-videography', 'wedding-videography'],
  'Freelancer': ['freelance-services', 'project-work', 'remote-work'],

  // Beauty & Wellness
  'Beautician': ['makeup', 'facial', 'beauty-services'],
  'Salon Professional': ['hair-cutting', 'hair-styling', 'salon-services'],
  'Fitness Trainer': ['personal-training', 'gym-training', 'fitness-coaching'],
  'Yoga Instructor': ['yoga-classes', 'meditation', 'yoga-therapy'],

  // Healthcare
  'Doctor / Healthcare': ['medical-consultation', 'health-checkup', 'home-visit'],
  'Nurse / Caretaker': ['patient-care', 'elder-care', 'nursing-services'],

  // Events & Entertainment
  'Event Planner': ['event-planning', 'wedding-planning', 'party-planning'],
  'DJ': ['dj-services', 'music-mixing', 'event-music'],
  'Musician': ['live-music', 'instrument-playing', 'music-performance'],
  'Dancer': ['dance-performance', 'choreography', 'dance-teaching'],
  'Anchor / Host': ['event-hosting', 'mc-services', 'anchoring'],

  // Others
  'Pet Caretaker': ['pet-care', 'dog-walking', 'pet-sitting'],
  'Laundry Service': ['laundry', 'dry-cleaning', 'ironing'],
  'Tailor': ['stitching', 'alterations', 'tailoring'],
  'Barber': ['hair-cutting', 'shaving', 'grooming'],
  'Government & ID Services': ['govt-services', 'id-card-services', 'document-services'],
  'Security Guard': ['security-services', 'guard-duty', 'watchman'],
  'Partner / Companion': ['other-services', 'miscellaneous'],
  'Helper': ['other-services', 'miscellaneous'],
  'Errand Runner': ['other-services', 'miscellaneous'],
  'Moving & Packing Helper': ['other-services', 'miscellaneous'],
  'Event Helper': ['other-services', 'miscellaneous'],
  'Other': ['other-services', 'miscellaneous'],
};

/**
 * Get recommended service IDs for a role (DEPRECATED - use getServiceCategoriesForRole instead)
 */
export function getRecommendedServicesForRole(roleName: string): string[] {
  return ROLE_TO_RECOMMENDED_SERVICES[roleName] || [];
}

// =====================================================
// TASKS & WISHES → ROLE MAPPING
// =====================================================

/**
 * Map Task Category → Professional Roles
 * When a task is posted, these roles will be notified/matched
 */
export const TASK_CATEGORY_TO_ROLES: Record<string, string[]> = {
  // Home Services
  'home-services': ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Home Service Professional'],
  'repair': ['Electrician', 'Plumber', 'Carpenter', 'Technician (General)', 'Mechanic'],
  'installation': ['Electrician', 'Carpenter', 'Technician (General)'],
  'cleaning': ['Cleaner', 'Maid / House Help', 'Pest Control Professional'],
  'pest-control': ['Pest Control Professional'],
  'painting': ['Painter'],
  'construction': ['Carpenter', 'Home Service Professional'],
  
  // Delivery & Transport
  'delivery': ['Driver', 'Delivery Partner'],
  'delivery-pickup': ['Driver', 'Delivery Partner'],
  'driver-rides': ['Driver', 'Delivery Partner'],
  
  // Cooking & Food
  'cooking': ['Cook / Chef'],
  'cooking-cleaning': ['Cook / Chef', 'Cleaner'],
  
  // Education & Learning
  'tutoring': ['Teacher / Tutor'],
  'teaching-learning': ['Teacher / Tutor', 'Coach / Trainer'],
  'mentorship': ['Mentor', 'Teacher / Tutor'],
  
  // Tech Support
  'tech-support': ['Technician (General)', 'Web Developer'],
  'tech-help': ['Technician (General)', 'Web Developer'],
  
  // Professional Services
  'professional-help': ['Consultant', 'Lawyer', 'CA / Accountant'],
  'accounting-tax': ['CA / Accountant'],
  'legal': ['Lawyer'],
  
  // Creative Services
  'photography-videography': ['Photographer', 'Videographer'],
  'photography-video': ['Photographer', 'Videographer'],
  'design': ['Graphic Designer', 'Web Developer'],
  
  // Beauty & Wellness
  'beauty-wellness': ['Beautician', 'Salon Professional'],
  'fitness': ['Fitness Trainer', 'Yoga Instructor'],
  
  // Events
  'event-help': ['Event Planner', 'DJ', 'Musician', 'Dancer', 'Anchor / Host'],
  'events-entertainment': ['Event Planner', 'DJ', 'Musician', 'Dancer', 'Anchor / Host'],
  
  // Moving & Packing
  'moving-packing': ['Home Service Professional'],
  
  // Pet Care
  'pet-care': ['Pet Caretaker'],
  
  // General Help - These should go to Tasks module, not Professionals
  // Map to closest professional equivalents
  'quick-help': ['Home Service Professional'],
  'office-errands': ['Other'],
  'personal-help': ['Other'],
  
  // Medical
  'medical-help': ['Doctor / Healthcare', 'Nurse / Caretaker'],
  
  // Others
  'laundry': ['Laundry Service'],
  'gardening': ['Gardener'],
  'security': ['Security Guard'],
  'government-services': ['Government & ID Services'],
  'document-help': ['Government & ID Services'],
  'partner-needed': ['Other'],
  'other': ['Other'],
};

/**
 * Map Wish Category → Professional Roles
 * When a wish is posted for services, these roles will be matched
 */
export const WISH_CATEGORY_TO_ROLES: Record<string, string[]> = {
  // Service-related wishes
  'find-help': ['Home Service Professional', 'Cleaner', 'Maid / House Help'],
  'find-service': ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Home Service Professional'],
  'need-tech-help': ['Technician (General)', 'Web Developer'],
  'find-mentor': ['Mentor', 'Teacher / Tutor', 'Coach / Trainer'],
  'find-professional': ['Consultant', 'Lawyer', 'CA / Accountant'],
  
  // Product wishes (less relevant for professionals, but included for completeness)
  'buy-something': ['Other'],
  'rent-something': ['Other'],
  'find-used': ['Other'],
  'find-deal': ['Other'],
  'other': ['Other'],
};

/**
 * Get matching roles for a task category
 */
export function getRolesForTaskCategory(taskCategorySlug: string): string[] {
  return TASK_CATEGORY_TO_ROLES[taskCategorySlug] || [];
}

/**
 * Get matching roles for a wish category
 */
export function getRolesForWishCategory(wishCategorySlug: string): string[] {
  return WISH_CATEGORY_TO_ROLES[wishCategorySlug] || [];
}

/**
 * Check if a role matches a task category
 */
export function doesRoleMatchTaskCategory(roleName: string, taskCategorySlug: string): boolean {
  const matchingRoles = TASK_CATEGORY_TO_ROLES[taskCategorySlug] || [];
  return matchingRoles.includes(roleName);
}

/**
 * Check if a role matches a wish category
 */
export function doesRoleMatchWishCategory(roleName: string, wishCategorySlug: string): boolean {
  const matchingRoles = WISH_CATEGORY_TO_ROLES[wishCategorySlug] || [];
  return matchingRoles.includes(roleName);
}