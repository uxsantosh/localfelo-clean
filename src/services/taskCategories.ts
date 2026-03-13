// BANGALORE-FIRST TASK CATEGORIES - 40+ Categories
// Prioritized for young professionals, IT workers, bachelors in Bangalore

export interface TaskCategoryData {
  id: string; // NEW: Category ID (slug format)
  name: string;
  emoji: string;
  description: string;
  keywords: string[];
  priority?: number; // 1 = Launch priority for Bangalore
}

export const TASK_CATEGORIES: Record<string, TaskCategoryData> = {
  // ===== BANGALORE LAUNCH PRIORITIES (Top 15) =====
  
  'delivery': {
    id: 'delivery',
    name: 'Delivery',
    emoji: '🚚',
    description: 'Pick up, deliver, bring something from A to B',
    priority: 1,
    keywords: ['delivery', 'deliver', 'pickup', 'pick up', 'bring', 'get', 'fetch', 'collect', 'courier', 'parcel', 'package', 'send', 'take', 'drop off'],
  },
  'food-delivery': {
    id: 'food-delivery',
    name: 'Bring Food',
    emoji: '🍱',
    description: 'Bring food from home to office, tiffin delivery',
    priority: 1,
    // 🚨 CRITICAL: VERY SPECIFIC - only when bringing/delivering food FROM place TO place
    keywords: ['bring food', 'tiffin', 'dabba', 'home food to office', 'office lunch delivery', 'bring from home', 'tiffin service', 'lunch box', 'bring my lunch', 'get food from', 'fetch food'],
  },
  'luggage-help': {
    id: 'luggage-help',
    name: 'Luggage Help',
    emoji: '🧳',
    description: 'Carry luggage, bags, heavy items, loading help',
    priority: 1,
    keywords: ['luggage', 'bag', 'bags', 'carry', 'suitcase', 'heavy', 'load', 'unload', 'airport', 'railway', 'metro', 'station', 'travel'],
  },
  'drop-pickup': {
    id: 'drop-pickup',
    name: 'Drop Me / Pick Me',
    emoji: '🚗',
    description: 'Drop to office, pick from station, short rides',
    priority: 1,
    keywords: ['drop', 'pickup', 'pick me', 'drop me', 'ride', 'lift', 'carpool', 'office', 'station', 'airport', 'metro', 'bus stop', 'take me'],
  },
  'tech-help': {
    id: 'tech-help',
    name: 'Tech Help',
    emoji: '💻',
    description: 'Computer, laptop, mobile, software, coding help',
    priority: 1,
    keywords: ['computer', 'laptop', 'mobile', 'phone', 'tech', 'software', 'hardware', 'coding', 'programming', 'code', 'bug', 'repair', 'install', 'setup', 'wifi', 'internet'],
  },
  'partner-needed': {
    id: 'partner-needed',
    name: 'Partner Needed',
    emoji: '🤝',
    description: 'Gym buddy, sports partner, work partner, study mate',
    priority: 1,
    keywords: ['partner', 'buddy', 'mate', 'companion', 'friend', 'gym partner', 'workout partner', 'badminton partner', 'tennis partner', 'football', 'cricket', 'study partner', 'work partner', 'co-founder', 'teammate'],
  },
  'mentorship': {
    id: 'mentorship',
    name: 'Mentorship',
    emoji: '🎯',
    description: 'Career guidance, startup advice, skill mentoring',
    priority: 1,
    keywords: ['mentor', 'mentorship', 'guidance', 'advice', 'career', 'startup', 'business', 'coach', 'coaching', 'consultation', 'help with', 'learn from'],
  },
  'errands': {
    id: 'errands',
    name: 'Errands',
    emoji: '🏃',
    description: 'Queue standing, document work, bank, post office',
    priority: 1,
    keywords: ['errand', 'queue', 'standing', 'waiting', 'line', 'document', 'submission', 'collection', 'bank', 'post office', 'government', 'aadhar', 'passport', 'visa'],
  },
  'cleaning': {
    id: 'cleaning',
    name: 'Cleaning',
    emoji: '🧹',
    description: 'House cleaning, room cleaning, deep cleaning',
    priority: 1,
    keywords: ['clean', 'cleaning', 'sanitize', 'wash', 'mop', 'sweep', 'vacuum', 'dust', 'bathroom', 'kitchen', 'room', 'house', 'deep clean'],
  },
  'cooking': {
    id: 'cooking',
    name: 'Cooking',
    emoji: '🍳',
    description: 'Home cooking, chef for party, meal prep',
    priority: 1,
    // 🚨 CRITICAL: Include ALL cooking-related keywords including dishes
    keywords: ['cook', 'cooking', 'chef', 'prepare food', 'meal prep', 'recipe', 'cuisine', 'party cooking', 'bulk cooking', 'catering', 'biryani', 'curry', 'dish', 'kitchen', 'bake', 'baking', 'prepare meal', 'food preparation', 'cooking help', 'need cook', 'hire cook'],
  },
  'laundry': {
    id: 'laundry',
    name: 'Laundry',
    emoji: '🧺',
    description: 'Washing, ironing, dry cleaning pickup',
    priority: 1,
    keywords: ['laundry', 'wash', 'washing', 'iron', 'ironing', 'press', 'dry clean', 'clothes', 'stain'],
  },
  'grocery-shopping': {
    id: 'grocery-shopping',
    name: 'Grocery Shopping',
    emoji: '🛒',
    description: 'Buy groceries, shopping help, market trip',
    priority: 1,
    keywords: ['grocery', 'groceries', 'shopping', 'market', 'supermarket', 'vegetables', 'fruits', 'buy', 'purchase', 'big bazaar', 'reliance', 'dmart'],
  },
  'pet-care': {
    id: 'pet-care',
    name: 'Pet Care',
    emoji: '🐕',
    description: 'Dog walking, pet sitting, feeding, grooming',
    priority: 1,
    keywords: ['pet', 'dog', 'cat', 'puppy', 'pet sitting', 'dog walking', 'pet care', 'feeding', 'grooming', 'veterinary', 'vet'],
  },
  'fitness-partner': {
    id: 'fitness-partner',
    name: 'Fitness Partner',
    emoji: '🏋️',
    description: 'Gym buddy, running partner, yoga companion',
    priority: 1,
    keywords: ['gym', 'fitness', 'workout', 'exercise', 'running', 'jogging', 'yoga', 'gym partner', 'running partner', 'cycling', 'trainer'],
  },
  'moving-packing': {
    id: 'moving-packing',
    name: 'Moving & Packing',
    emoji: '📦',
    description: 'House shifting, office moving, packers help',
    priority: 1,
    keywords: ['moving', 'shifting', 'packing', 'packers', 'movers', 'relocation', 'transport', 'furniture', 'shift'],
  },

  // ===== HOME SERVICES =====
  'plumbing': {
    id: 'plumbing',
    name: 'Plumbing',
    emoji: '🚰',
    description: 'Tap repairs, pipe leaks, drainage issues',
    keywords: ['plumber', 'plumbing', 'tap', 'leak', 'pipe', 'drain', 'water', 'flush', 'bathroom', 'sink', 'clog', 'geyser'],
  },
  'electrical': {
    id: 'electrical',
    name: 'Electrical',
    emoji: '⚡',
    description: 'Wiring, switches, fan repair, inverter',
    keywords: ['electrician', 'electrical', 'wiring', 'switch', 'fan', 'light', 'bulb', 'power', 'inverter', 'mcb', 'socket'],
  },
  'carpentry': {
    id: 'carpentry',
    name: 'Carpentry',
    emoji: '🪚',
    description: 'Furniture repair, woodwork, doors, windows',
    keywords: ['carpenter', 'carpentry', 'wood', 'furniture', 'door', 'window', 'shelf', 'cabinet', 'repair', 'hinge', 'lock'],
  },
  'painting': {
    id: 'painting',
    name: 'Painting',
    emoji: '🎨',
    description: 'Wall painting, room painting, touch-ups',
    keywords: ['paint', 'painting', 'wall', 'color', 'room', 'whitewash', 'texture', 'putty'],
  },
  'ac-repair': {
    id: 'ac-repair',
    name: 'AC & Appliance Repair',
    emoji: '❄️',
    description: 'AC service, fridge, washing machine repair',
    keywords: ['ac', 'air conditioner', 'fridge', 'refrigerator', 'washing machine', 'microwave', 'oven', 'service', 'repair', 'gas', 'appliance'],
  },
  'installation': {
    id: 'installation',
    name: 'Installation',
    emoji: '🔨',
    description: 'Furniture assembly, TV mount, curtain rods',
    keywords: ['install', 'installation', 'assemble', 'assembly', 'furniture', 'tv', 'mount', 'shelf', 'curtain', 'setup'],
  },

  // ===== PERSONAL CARE & WELLNESS =====
  'salon-home': {
    id: 'salon-home',
    name: 'Salon at Home',
    emoji: '💇',
    description: 'Haircut, styling, grooming at home',
    keywords: ['haircut', 'hair', 'salon', 'barber', 'styling', 'shave', 'beard', 'trim', 'grooming'],
  },
  'beauty-makeup': {
    id: 'beauty-makeup',
    name: 'Beauty & Makeup',
    emoji: '💄',
    description: 'Makeup, facial, bridal, beauty services',
    keywords: ['makeup', 'beauty', 'facial', 'bridal', 'wedding', 'cosmetics', 'makeover', 'mehndi', 'henna'],
  },
  'spa-massage': {
    id: 'spa-massage',
    name: 'Spa & Massage',
    emoji: '💆',
    description: 'Massage, spa, wellness treatments',
    keywords: ['spa', 'massage', 'therapy', 'wellness', 'relaxation', 'body massage', 'aromatherapy'],
  },

  // ===== HEALTH & CARE =====
  'nursing-care': {
    id: 'nursing-care',
    name: 'Nursing & Healthcare',
    emoji: '⚕️',
    description: 'Nurse, patient care, injections, medical help',
    keywords: ['nurse', 'nursing', 'healthcare', 'patient', 'injection', 'dressing', 'medical', 'caretaker', 'physiotherapy'],
  },
  'elderly-care': {
    id: 'elderly-care',
    name: 'Elderly Care',
    emoji: '👴',
    description: 'Senior care, companionship, assistance',
    keywords: ['elderly', 'senior', 'old age', 'caretaker', 'companion', 'assistance', 'grandparent'],
  },
  'babysitting': {
    id: 'babysitting',
    name: 'Babysitting',
    emoji: '👶',
    description: 'Childcare, babysitting, nanny services',
    keywords: ['babysit', 'babysitting', 'nanny', 'childcare', 'baby', 'toddler', 'infant', 'daycare', 'child'],
  },

  // ===== EDUCATION & LEARNING =====
  'tutoring': {
    id: 'tutoring',
    name: 'Tutoring',
    emoji: '📚',
    description: 'Subject tutoring, exam prep, homework help',
    keywords: ['tutor', 'tutoring', 'teaching', 'study', 'homework', 'exam', 'preparation', 'coaching', 'subject', 'maths', 'science', 'english'],
  },
  'language-learning': {
    id: 'language-learning',
    name: 'Language Learning',
    emoji: '🗣️',
    description: 'English speaking, IELTS, foreign languages',
    keywords: ['language', 'english', 'speaking', 'conversation', 'ielts', 'toefl', 'foreign language', 'fluency'],
  },
  'skill-training': {
    id: 'skill-training',
    name: 'Skill Training',
    emoji: '🎓',
    description: 'Excel, coding, professional skills',
    keywords: ['skill', 'training', 'course', 'excel', 'powerpoint', 'certification', 'workshop', 'learning'],
  },
  'music-dance': {
    id: 'music-dance',
    name: 'Music & Dance',
    emoji: '🎵',
    description: 'Music lessons, dance classes, instruments',
    keywords: ['music', 'dance', 'singing', 'guitar', 'piano', 'tabla', 'classical', 'instrument'],
  },

  // ===== TECHNOLOGY & CREATIVE =====
  'web-development': {
    id: 'web-development',
    name: 'Web Development',
    emoji: '🌐',
    description: 'Website, app development, coding projects',
    keywords: ['website', 'web', 'app', 'development', 'coding', 'programming', 'developer', 'html', 'css', 'javascript', 'react', 'flutter'],
  },
  'graphic-design': {
    id: 'graphic-design',
    name: 'Graphic Design',
    emoji: '🖌️',
    description: 'Logo, poster, video editing, design work',
    keywords: ['graphic', 'design', 'logo', 'poster', 'banner', 'photoshop', 'illustrator', 'video editing', 'canva'],
  },
  'digital-marketing': {
    id: 'digital-marketing',
    name: 'Digital Marketing',
    emoji: '📱',
    description: 'Social media, ads, SEO, content creation',
    keywords: ['digital marketing', 'social media', 'seo', 'ads', 'facebook', 'instagram', 'google ads', 'content', 'marketing'],
  },

  // ===== PROFESSIONAL SERVICES =====
  'legal-advice': {
    id: 'legal-advice',
    name: 'Legal Advice',
    emoji: '⚖️',
    description: 'Lawyer, legal consultation, documentation',
    keywords: ['lawyer', 'legal', 'advocate', 'court', 'case', 'documentation', 'consultation', 'agreement', 'contract'],
  },
  'accounting': {
    id: 'accounting',
    name: 'Accounting & Tax',
    emoji: '📊',
    description: 'CA, GST, income tax, accounting help',
    keywords: ['ca', 'accountant', 'accounting', 'tax', 'gst', 'income tax', 'filing', 'audit', 'tally'],
  },
  'career-counseling': {
    id: 'career-counseling',
    name: 'Career Counseling',
    emoji: '💼',
    description: 'Resume, interview prep, job guidance',
    keywords: ['career', 'counseling', 'guidance', 'resume', 'cv', 'interview', 'job', 'placement'],
  },

  // ===== EVENTS & ENTERTAINMENT =====
  'photography': {
    id: 'photography',
    name: 'Photography',
    emoji: '📷',
    description: 'Event, wedding, portrait photography',
    keywords: ['photo', 'photography', 'photographer', 'camera', 'shoot', 'wedding', 'event', 'portrait', 'candid'],
  },
  'videography': {
    id: 'videography',
    name: 'Videography',
    emoji: '🎥',
    description: 'Video shoot, editing, cinematography',
    keywords: ['video', 'videography', 'cinematography', 'shoot', 'editing', 'film', 'drone'],
  },
  'event-planning': {
    id: 'event-planning',
    name: 'Event Planning',
    emoji: '🎉',
    description: 'Party, wedding planning, coordination',
    keywords: ['event', 'party', 'planning', 'decoration', 'birthday', 'wedding', 'celebration', 'organizer'],
  },

  // ===== HOME & LIFESTYLE =====
  'gardening': {
    id: 'gardening',
    name: 'Gardening',
    emoji: '🪴',
    description: 'Gardening, plant care, landscaping',
    keywords: ['garden', 'gardening', 'plant', 'lawn', 'landscape', 'watering', 'trimming', 'terrace garden'],
  },
  'pest-control': {
    id: 'pest-control',
    name: 'Pest Control',
    emoji: '🦟',
    description: 'Pest control, fumigation, termite treatment',
    keywords: ['pest', 'cockroach', 'rat', 'termite', 'fumigation', 'spray', 'mosquito'],
  },
  'interior-design': {
    id: 'interior-design',
    name: 'Interior Design',
    emoji: '🏠',
    description: 'Interior design, home decor, renovation',
    keywords: ['interior', 'design', 'renovation', 'modular kitchen', 'false ceiling', 'home decor'],
  },

  // ===== SPECIALIZED SERVICES =====
  'astrology': {
    id: 'astrology',
    name: 'Astrology & Vastu',
    emoji: '🔮',
    description: 'Astrology, horoscope, vastu consultation',
    keywords: ['astrology', 'astrologer', 'horoscope', 'kundli', 'vastu', 'numerology', 'palmistry'],
  },
  'religious-services': {
    id: 'religious-services',
    name: 'Religious Services',
    emoji: '🙏',
    description: 'Pandit, puja, religious ceremonies',
    keywords: ['pandit', 'priest', 'puja', 'pooja', 'ceremony', 'havan', 'religious', 'ritual'],
  },
  'locksmith': {
    id: 'locksmith',
    name: 'Locksmith',
    emoji: '🔑',
    description: 'Lock repair, emergency unlock, key duplicate',
    keywords: ['locksmith', 'lock', 'key', 'unlock', 'duplicate', 'repair', 'emergency', 'door'],
  },

  // ===== CATCH-ALL =====
  'other': {
    id: 'other',
    name: 'Other',
    emoji: '✨',
    description: 'Other tasks not listed above',
    keywords: ['other', 'miscellaneous', 'help', 'assistance', 'general', 'anything'],
  },
};

/**
 * Categorize a task based on title/description
 * Returns the category ID (slug format) for database storage
 */
export function categorizeTask(title: string): string {
  const lowerTitle = title.toLowerCase().trim();
  
  // 🚨 CRITICAL: Require minimum length for accurate detection
  // Don't detect on vague phrases like "need help"
  if (lowerTitle.length < 12) {
    return 'other'; // Wait for more context
  }
  
  // 🚨 CRITICAL: Count words - need at least 4 words for context
  const wordCount = lowerTitle.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 4) {
    return 'other'; // Wait for more details
  }

  let bestMatch = { categoryId: 'other', score: 0, keywordLength: 0 };
  
  // 🚨 CRITICAL: Set minimum threshold - only detect if score is high enough
  const MINIMUM_CONFIDENCE_SCORE = 5; // Require at least one exact keyword match

  for (const [categoryKey, categoryData] of Object.entries(TASK_CATEGORIES)) {
    let score = 0;
    let longestKeywordMatch = 0;

    // Boost priority categories for Bangalore launch
    const priorityBoost = categoryData.priority === 1 ? 1 : 0;

    // Check each keyword
    for (const keyword of categoryData.keywords) {
      // Exact word boundary match (highest score)
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(lowerTitle)) {
        // 🚨 CRITICAL FIX: Longer keywords = higher score
        const keywordScore = 5 + priorityBoost + Math.floor(keyword.length / 2);
        score += keywordScore;
        
        // Track longest keyword for tie-breaking
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

  // 🚨 CRITICAL: Only return category if confidence is high enough
  if (bestMatch.score < MINIMUM_CONFIDENCE_SCORE) {
    return 'other'; // Not confident enough
  }

  return bestMatch.categoryId; // ✅ NOW RETURNS ID, NOT NAME
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
export function getAllTaskCategories(): Array<{ id: string; name: string; emoji: string; description: string; priority?: number }> {
  return Object.values(TASK_CATEGORIES)
    .map(cat => ({
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      description: cat.description,
      priority: cat.priority,
    }))
    .sort((a, b) => {
      // Priority categories first
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return 0;
    });
}

/**
 * Get priority categories for Bangalore launch
 */
export function getPriorityCategories(): Array<{ id: string; name: string; emoji: string; description: string }> {
  return Object.values(TASK_CATEGORIES)
    .filter(cat => cat.priority === 1)
    .map(cat => ({
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      description: cat.description,
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
