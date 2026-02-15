// OldCycle Helper Categories
// These match TASK_CATEGORIES for consistent helper-task matching

export const HELPER_CATEGORIES = [
  { id: 1, name: 'Delivery / Pickup', slug: 'delivery-pickup', emoji: '📦' },
  { id: 2, name: 'Cooking / Cleaning', slug: 'cooking-cleaning', emoji: '🍳' },
  { id: 3, name: 'Moving / Lifting', slug: 'moving-lifting', emoji: '📦' },
  { id: 4, name: 'Tech Help', slug: 'tech-help', emoji: '💻' },
  { id: 5, name: 'Office Errands', slug: 'office-errands', emoji: '📋' },
  { id: 6, name: 'Personal Help', slug: 'personal-help', emoji: '🤝' },
  { id: 7, name: 'Repair / Handyman', slug: 'repair-handyman', emoji: '🔧' },
  { id: 8, name: 'Tutoring / Teaching', slug: 'tutoring-teaching', emoji: '📚' },
] as const;

export type HelperCategory = typeof HELPER_CATEGORIES[number];
