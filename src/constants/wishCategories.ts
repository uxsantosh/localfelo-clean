// OldCycle Wish Categories - Intent-Based
// These are NOT product categories - they represent user intent

export const WISH_CATEGORIES = [
  { id: 'buy-something', name: 'Buy something', slug: 'buy-something', emoji: '🛒' },
  { id: 'rent-something', name: 'Rent something', slug: 'rent-something', emoji: '🔑' },
  { id: 'find-used', name: 'Find used item', slug: 'find-used', emoji: '♻️' },
  { id: 'find-service', name: 'Find service', slug: 'find-service', emoji: '🔧' },
  { id: 'find-help', name: 'Find help', slug: 'find-help', emoji: '🤝' },
  { id: 'find-deal', name: 'Find deal', slug: 'find-deal', emoji: '💰' },
  { id: 'other', name: 'Other', slug: 'other', emoji: '📦' },
] as const;

export type WishCategory = typeof WISH_CATEGORIES[number];
