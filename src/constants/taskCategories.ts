// OldCycle Task Categories - Action-Based
// These represent specific tasks that need to be done

export const TASK_CATEGORIES = [
  { id: 'delivery-pickup', name: 'Delivery / Pickup', slug: 'delivery-pickup', emoji: '📦' },
  { id: 'moving-lifting', name: 'Moving / Lifting', slug: 'moving-lifting', emoji: '🏋️' },
  { id: 'repairs', name: 'Repairs', slug: 'repairs', emoji: '🔧' },
  { id: 'cleaning', name: 'Cleaning', slug: 'cleaning', emoji: '🧹' },
  { id: 'tech-help', name: 'Tech help', slug: 'tech-help', emoji: '💻' },
  { id: 'office-errands', name: 'Office errands', slug: 'office-errands', emoji: '📋' },
  { id: 'personal-help', name: 'Personal help', slug: 'personal-help', emoji: '🤝' },
] as const;

export type TaskCategory = typeof TASK_CATEGORIES[number];
