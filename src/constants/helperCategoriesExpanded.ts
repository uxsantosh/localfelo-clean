// LocalFelo Comprehensive Helper Categories
// 34 categories covering all Indian gig economy tasks

export const HELPER_CATEGORIES_EXPANDED = [
  // HOME SERVICES (8 categories)
  { id: 1, name: 'House Cleaning', slug: 'cleaning', emoji: '🧹', group: 'home', keywords: ['clean', 'sweep', 'mop', 'dust', 'sanitize'] },
  { id: 2, name: 'Cooking / Tiffin', slug: 'cooking', emoji: '🍳', group: 'home', keywords: ['cook', 'food', 'tiffin', 'meal', 'dabba'] },
  { id: 3, name: 'Plumbing', slug: 'plumbing', emoji: '🚰', group: 'home', keywords: ['plumber', 'pipe', 'tap', 'leak', 'water'] },
  { id: 4, name: 'Electrician', slug: 'electrician', emoji: '⚡', group: 'home', keywords: ['electric', 'wiring', 'light', 'fan', 'switch'] },
  { id: 5, name: 'Appliance Repair', slug: 'appliance-repair', emoji: '🔧', group: 'home', keywords: ['repair', 'fix', 'fridge', 'ac', 'washing machine'] },
  { id: 6, name: 'Painting', slug: 'painting', emoji: '🎨', group: 'home', keywords: ['paint', 'whitewash', 'color', 'wall'] },
  { id: 7, name: 'Gardening', slug: 'gardening', emoji: '🪴', group: 'home', keywords: ['garden', 'plant', 'lawn', 'tree', 'landscaping'] },
  { id: 8, name: 'Laundry / Ironing', slug: 'laundry', emoji: '🧺', group: 'home', keywords: ['laundry', 'iron', 'wash', 'clothes', 'dry clean'] },
  
  // DELIVERY & TRANSPORT (5 categories)
  { id: 9, name: 'Delivery / Pickup', slug: 'delivery', emoji: '📦', group: 'transport', keywords: ['deliver', 'pickup', 'drop', 'courier', 'parcel'] },
  { id: 10, name: 'Driving / Drop', slug: 'driving', emoji: '🚗', group: 'transport', keywords: ['drive', 'driver', 'drop', 'car', 'bike'] },
  { id: 11, name: 'Quick Errands', slug: 'errands', emoji: '🏃', group: 'transport', keywords: ['errand', 'quick', 'urgent', 'run', 'fetch'] },
  { id: 12, name: 'Moving / Shifting', slug: 'moving', emoji: '📦', group: 'transport', keywords: ['move', 'shift', 'relocate', 'transfer', 'packers'] },
  { id: 13, name: 'Grocery Shopping', slug: 'shopping', emoji: '🛒', group: 'transport', keywords: ['grocery', 'shopping', 'vegetable', 'market', 'buy'] },
  
  // PERSONAL CARE (4 categories)
  { id: 14, name: 'Salon at Home', slug: 'salon', emoji: '💇', group: 'care', keywords: ['salon', 'haircut', 'beauty', 'makeup', 'spa'] },
  { id: 15, name: 'Pet Care', slug: 'pet-care', emoji: '🐕', group: 'care', keywords: ['pet', 'dog', 'cat', 'walk', 'animal'] },
  { id: 16, name: 'Babysitting', slug: 'babysitting', emoji: '👶', group: 'care', keywords: ['baby', 'child', 'kid', 'nanny', 'daycare'] },
  { id: 17, name: 'Elderly Care', slug: 'elderly-care', emoji: '👵', group: 'care', keywords: ['elderly', 'senior', 'old', 'care', 'nurse'] },
  
  // TECH & OFFICE (4 categories)
  { id: 18, name: 'Computer Repair', slug: 'computer-repair', emoji: '💻', group: 'tech', keywords: ['computer', 'laptop', 'pc', 'software', 'install'] },
  { id: 19, name: 'Mobile Repair', slug: 'mobile-repair', emoji: '📱', group: 'tech', keywords: ['mobile', 'phone', 'smartphone', 'screen', 'battery'] },
  { id: 20, name: 'Data Entry', slug: 'data-entry', emoji: '📋', group: 'tech', keywords: ['data', 'entry', 'typing', 'excel', 'word'] },
  { id: 21, name: 'Tutoring', slug: 'tutoring', emoji: '🎓', group: 'tech', keywords: ['tutor', 'teach', 'study', 'homework', 'class'] },
  
  // EVENTS & DECORATION (4 categories)
  { id: 22, name: 'Event Decoration', slug: 'decoration', emoji: '🎈', group: 'events', keywords: ['decor', 'decoration', 'party', 'balloon', 'event'] },
  { id: 23, name: 'Photography', slug: 'photography', emoji: '📸', group: 'events', keywords: ['photo', 'camera', 'shoot', 'video', 'picture'] },
  { id: 24, name: 'Catering', slug: 'catering', emoji: '🍽️', group: 'events', keywords: ['cater', 'food', 'party', 'event', 'serve'] },
  { id: 25, name: 'DJ / Sound', slug: 'dj', emoji: '🎶', group: 'events', keywords: ['dj', 'music', 'sound', 'speaker', 'audio'] },
  
  // CONSTRUCTION & LABOR (3 categories)
  { id: 26, name: 'Construction', slug: 'construction', emoji: '👷', group: 'construction', keywords: ['construction', 'build', 'labor', 'worker', 'site'] },
  { id: 27, name: 'Carpentry', slug: 'carpentry', emoji: '🪵', group: 'construction', keywords: ['carpenter', 'wood', 'furniture', 'door', 'window'] },
  { id: 28, name: 'Masonry', slug: 'masonry', emoji: '🧱', group: 'construction', keywords: ['mason', 'brick', 'cement', 'tile', 'stone'] },
  
  // MISCELLANEOUS (6 categories)
  { id: 29, name: 'Form Filling', slug: 'forms', emoji: '✍️', group: 'misc', keywords: ['form', 'document', 'paper', 'application', 'fill'] },
  { id: 30, name: 'Office Errands', slug: 'office-errands', emoji: '💼', group: 'misc', keywords: ['office', 'work', 'business', 'admin', 'task'] },
  { id: 31, name: 'Custom Task', slug: 'custom', emoji: '🎯', group: 'misc', keywords: ['custom', 'other', 'any', 'miscellaneous', 'help'] },
  { id: 32, name: 'Verification', slug: 'verification', emoji: '🔍', group: 'misc', keywords: ['verify', 'check', 'investigate', 'confirm', 'validate'] },
  { id: 33, name: 'Loading / Unloading', slug: 'loading', emoji: '🚚', group: 'misc', keywords: ['load', 'unload', 'carry', 'lift', 'move'] },
  { id: 34, name: 'Security / Bouncer', slug: 'security', emoji: '🎪', group: 'misc', keywords: ['security', 'guard', 'bouncer', 'watchman', 'protect'] },
] as const;

export const CATEGORY_GROUPS = {
  home: { name: 'Home Services', icon: '🏠', color: '#FFE4B5' },
  transport: { name: 'Delivery & Transport', icon: '🚗', color: '#E0F2FE' },
  care: { name: 'Personal Care', icon: '💝', color: '#FCE7F3' },
  tech: { name: 'Tech & Office', icon: '💻', color: '#DBEAFE' },
  events: { name: 'Events & Decoration', icon: '🎉', color: '#FEF3C7' },
  construction: { name: 'Construction & Labor', icon: '🏗️', color: '#FED7AA' },
  misc: { name: 'Miscellaneous', icon: '⭐', color: '#E0E7FF' },
} as const;

export type HelperCategoryExpanded = typeof HELPER_CATEGORIES_EXPANDED[number];
export type CategoryGroup = keyof typeof CATEGORY_GROUPS;

// Helper function to get popular categories (for quick access)
export const POPULAR_CATEGORIES = [
  'delivery',
  'cleaning',
  'cooking',
  'plumbing',
  'electrician',
  'driving',
  'tutoring',
  'mobile-repair',
] as const;

// Get categories by group
export function getCategoriesByGroup(group: CategoryGroup) {
  return HELPER_CATEGORIES_EXPANDED.filter(cat => cat.group === group);
}

// Search categories by keyword
export function searchCategories(query: string): typeof HELPER_CATEGORIES_EXPANDED[number][] {
  const lowerQuery = query.toLowerCase().trim();
  
  return HELPER_CATEGORIES_EXPANDED.filter(cat => 
    cat.name.toLowerCase().includes(lowerQuery) ||
    cat.keywords.some(keyword => keyword.includes(lowerQuery))
  );
}
