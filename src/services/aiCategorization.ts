// OldCycle AI Categorization Service
// Lightweight AI to detect help-type wishes and map to helper categories

import { HELPER_CATEGORIES } from '../constants/helperCategories';

/**
 * Analyze wish text to detect if it's a help request and map to helper category
 * This runs at wish creation time only
 */
export async function categorizeWish(title: string, description: string): Promise<{
  isHelpRequest: boolean;
  helperCategory: string | null;
  intentType: 'help' | 'buy' | 'rent' | 'deal' | null;
}> {
  const text = `${title} ${description}`.toLowerCase();

  // Keywords for help detection
  const helpKeywords = ['need help', 'looking for someone', 'need someone', 'can anyone', 'help me', 'help with'];
  const isHelpRequest = helpKeywords.some(keyword => text.includes(keyword));

  if (!isHelpRequest) {
    // Try to detect intent type for non-help wishes
    if (text.includes('buy') || text.includes('buying') || text.includes('purchase')) {
      return { isHelpRequest: false, helperCategory: null, intentType: 'buy' };
    }
    if (text.includes('rent') || text.includes('renting') || text.includes('lease')) {
      return { isHelpRequest: false, helperCategory: null, intentType: 'rent' };
    }
    if (text.includes('deal') || text.includes('exchange') || text.includes('trade')) {
      return { isHelpRequest: false, helperCategory: null, intentType: 'deal' };
    }
    return { isHelpRequest: false, helperCategory: null, intentType: null };
  }

  // Map to helper category based on keywords
  const categoryKeywords: Record<string, string[]> = {
    'delivery-pickup': ['deliver', 'pickup', 'pick up', 'drop', 'parcel', 'package', 'courier'],
    'cooking-cleaning': ['cook', 'cooking', 'clean', 'cleaning', 'wash', 'dishes', 'meal', 'food prep'],
    'moving-lifting': ['move', 'moving', 'lift', 'carry', 'heavy', 'furniture', 'relocation'],
    'tech-help': ['tech', 'computer', 'laptop', 'phone', 'wifi', 'internet', 'software', 'app', 'setup', 'install'],
    'office-errands': ['office', 'errand', 'document', 'paperwork', 'photocopy', 'print'],
    'personal-help': ['personal', 'accompany', 'shopping', 'assistance', 'support'],
    'repair-handyman': ['repair', 'fix', 'broken', 'handyman', 'plumbing', 'electrical', 'carpenter'],
    'tutoring-teaching': ['tutor', 'teach', 'learn', 'lesson', 'study', 'homework', 'education'],
  };

  // Find best matching category
  let bestMatch: string | null = null;
  let maxMatches = 0;

  for (const [slug, keywords] of Object.entries(categoryKeywords)) {
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = slug;
    }
  }

  return {
    isHelpRequest: true,
    helperCategory: bestMatch,
    intentType: 'help',
  };
}

/**
 * Get helper category name from slug
 */
export function getHelperCategoryName(slug: string | null): string | null {
  if (!slug) return null;
  const category = HELPER_CATEGORIES.find(c => c.slug === slug);
  return category ? category.name : null;
}
