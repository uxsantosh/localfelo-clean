// OldCycle AI Categorization Service
// Lightweight AI to detect help-type wishes and map to helper categories

import { HELPER_CATEGORIES } from '../constants/helperCategories';
import { normalizeText, stringSimilarity, findClosestMatch } from './contentModeration';

// Minimum confidence threshold to assign a category
const CONFIDENCE_THRESHOLD = 60; // 60% similarity required

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
    'delivery-pickup': [
      'deliver', 'delivery', 'pickup', 'pick up', 'drop', 'parcel', 'package', 
      'courier', 'shipping', 'transport', 'fetch', 'bring', 'send', 'collection'
    ],
    'cooking-cleaning': [
      'cook', 'cooking', 'clean', 'cleaning', 'wash', 'dishes', 'meal', 
      'food prep', 'kitchen', 'chef', 'maid', 'housekeeping', 'sweeping', 
      'mopping', 'dusting', 'laundry', 'ironing'
    ],
    'moving-lifting': [
      'move', 'moving', 'lift', 'lifting', 'carry', 'carrying', 'heavy', 
      'furniture', 'relocation', 'packing', 'loading', 'unloading', 'shift'
    ],
    'tech-help': [
      'tech', 'technology', 'computer', 'laptop', 'phone', 'mobile', 'wifi', 
      'internet', 'software', 'app', 'application', 'setup', 'install', 
      'troubleshoot', 'IT', 'coding', 'programming', 'website', 'printer', 
      'scanner', 'gadget', 'device', 'android', 'ios', 'windows'
    ],
    'office-errands': [
      'office', 'errand', 'document', 'paperwork', 'photocopy', 'print', 
      'printing', 'scanning', 'file', 'typing', 'data entry', 'admin', 
      'administrative', 'notary', 'submission'
    ],
    'personal-help': [
      'personal', 'accompany', 'shopping', 'assistance', 'support', 'companion', 
      'escort', 'help', 'assist', 'groceries', 'queue', 'waiting', 'standby'
    ],
    'repair-handyman': [
      'repair', 'fix', 'fixing', 'broken', 'handyman', 'plumbing', 'plumber', 
      'electrical', 'electrician', 'carpenter', 'carpentry', 'painting', 
      'maintenance', 'installation', 'drilling', 'welding', 'leakage'
    ],
    'tutoring-teaching': [
      'tutor', 'tutoring', 'teach', 'teaching', 'learn', 'learning', 'lesson', 
      'study', 'homework', 'education', 'training', 'coaching', 'class', 
      'subject', 'maths', 'science', 'english', 'language'
    ],
    'gardening-plant-care': [
      'garden', 'gardening', 'plant', 'plants', 'watering', 'trimming', 
      'pruning', 'lawn', 'landscaping', 'flowers', 'trees', 'soil', 'compost'
    ],
    'pet-care': [
      'pet', 'pets', 'dog', 'cat', 'animal', 'walking', 'feeding', 'grooming', 
      'veterinary', 'vet', 'puppy', 'kitten', 'petcare'
    ],
    'event-assistance': [
      'event', 'party', 'function', 'wedding', 'birthday', 'celebration', 
      'organize', 'organizing', 'decoration', 'setup', 'catering', 'serving'
    ],
    'beauty-grooming': [
      'beauty', 'grooming', 'haircut', 'salon', 'makeup', 'spa', 'facial', 
      'manicure', 'pedicure', 'massage', 'styling', 'hair', 'skin'
    ],
    'driving-vehicle': [
      'drive', 'driving', 'driver', 'car', 'vehicle', 'bike', 'auto', 
      'transport', 'chauffeur', 'ride', 'trip', 'travel'
    ],
    'photography-videography': [
      'photo', 'photography', 'photographer', 'video', 'videography', 
      'camera', 'shoot', 'shooting', 'editing', 'pictures', 'recording'
    ],
  };

  let bestCategory: string | null = null;
  let maxScore = 0;

  // Score each category
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let categoryScore = 0;
    let matchedKeywords = 0;

    for (const keyword of keywords) {
      // Exact match gets highest score
      if (text.includes(keyword)) {
        categoryScore += 100;
        matchedKeywords++;
      } else {
        // Fuzzy match for typos
        const words = text.split(' ');
        for (const word of words) {
          const similarity = stringSimilarity(word, keyword);
          if (similarity >= 80) { // High similarity threshold for individual words
            categoryScore += similarity;
            matchedKeywords++;
          }
        }
      }
    }

    // Average score per keyword
    const avgScore = matchedKeywords > 0 ? categoryScore / matchedKeywords : 0;

    if (avgScore > maxScore) {
      maxScore = avgScore;
      bestCategory = category;
    }
  }

  // Normalize confidence to 0-100 scale
  const confidence = Math.min(maxScore, 100);
  const isUncategorized = confidence < CONFIDENCE_THRESHOLD || bestCategory === null;

  return {
    isHelpRequest: true,
    helperCategory: isUncategorized ? null : bestCategory,
    intentType: 'help',
  };
}

/**
 * Categorize a task/skill into one of the 14 official helper categories
 * Returns category slug and confidence score (0-100)
 */
export async function categorizeTaskSkill(text: string): Promise<{
  category: string | null;
  confidence: number;
  isUncategorized: boolean;
}> {
  // Normalize text first (spelling correction)
  const { corrected } = normalizeText(text);
  const lowerText = corrected.toLowerCase();

  // Enhanced category keywords with more variations
  const categoryKeywords: Record<string, string[]> = {
    'delivery-pickup': [
      'deliver', 'delivery', 'pickup', 'pick up', 'drop', 'parcel', 'package', 
      'courier', 'shipping', 'transport', 'fetch', 'bring', 'send', 'collection'
    ],
    'cooking-cleaning': [
      'cook', 'cooking', 'clean', 'cleaning', 'wash', 'dishes', 'meal', 
      'food prep', 'kitchen', 'chef', 'maid', 'housekeeping', 'sweeping', 
      'mopping', 'dusting', 'laundry', 'ironing'
    ],
    'moving-lifting': [
      'move', 'moving', 'lift', 'lifting', 'carry', 'carrying', 'heavy', 
      'furniture', 'relocation', 'packing', 'loading', 'unloading', 'shift'
    ],
    'tech-help': [
      'tech', 'technology', 'computer', 'laptop', 'phone', 'mobile', 'wifi', 
      'internet', 'software', 'app', 'application', 'setup', 'install', 
      'troubleshoot', 'IT', 'coding', 'programming', 'website', 'printer', 
      'scanner', 'gadget', 'device', 'android', 'ios', 'windows'
    ],
    'office-errands': [
      'office', 'errand', 'document', 'paperwork', 'photocopy', 'print', 
      'printing', 'scanning', 'file', 'typing', 'data entry', 'admin', 
      'administrative', 'notary', 'submission'
    ],
    'personal-help': [
      'personal', 'accompany', 'shopping', 'assistance', 'support', 'companion', 
      'escort', 'help', 'assist', 'groceries', 'queue', 'waiting', 'standby'
    ],
    'repair-handyman': [
      'repair', 'fix', 'fixing', 'broken', 'handyman', 'plumbing', 'plumber', 
      'electrical', 'electrician', 'carpenter', 'carpentry', 'painting', 
      'maintenance', 'installation', 'drilling', 'welding', 'leakage'
    ],
    'tutoring-teaching': [
      'tutor', 'tutoring', 'teach', 'teaching', 'learn', 'learning', 'lesson', 
      'study', 'homework', 'education', 'training', 'coaching', 'class', 
      'subject', 'maths', 'science', 'english', 'language'
    ],
    'gardening-plant-care': [
      'garden', 'gardening', 'plant', 'plants', 'watering', 'trimming', 
      'pruning', 'lawn', 'landscaping', 'flowers', 'trees', 'soil', 'compost'
    ],
    'pet-care': [
      'pet', 'pets', 'dog', 'cat', 'animal', 'walking', 'feeding', 'grooming', 
      'veterinary', 'vet', 'puppy', 'kitten', 'petcare'
    ],
    'event-assistance': [
      'event', 'party', 'function', 'wedding', 'birthday', 'celebration', 
      'organize', 'organizing', 'decoration', 'setup', 'catering', 'serving'
    ],
    'beauty-grooming': [
      'beauty', 'grooming', 'haircut', 'salon', 'makeup', 'spa', 'facial', 
      'manicure', 'pedicure', 'massage', 'styling', 'hair', 'skin'
    ],
    'driving-vehicle': [
      'drive', 'driving', 'driver', 'car', 'vehicle', 'bike', 'auto', 
      'transport', 'chauffeur', 'ride', 'trip', 'travel'
    ],
    'photography-videography': [
      'photo', 'photography', 'photographer', 'video', 'videography', 
      'camera', 'shoot', 'shooting', 'editing', 'pictures', 'recording'
    ],
  };

  let bestCategory: string | null = null;
  let maxScore = 0;

  // Score each category
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let categoryScore = 0;
    let matchedKeywords = 0;

    for (const keyword of keywords) {
      // Exact match gets highest score
      if (lowerText.includes(keyword)) {
        categoryScore += 100;
        matchedKeywords++;
      } else {
        // Fuzzy match for typos
        const words = lowerText.split(' ');
        for (const word of words) {
          const similarity = stringSimilarity(word, keyword);
          if (similarity >= 80) { // High similarity threshold for individual words
            categoryScore += similarity;
            matchedKeywords++;
          }
        }
      }
    }

    // Average score per keyword
    const avgScore = matchedKeywords > 0 ? categoryScore / matchedKeywords : 0;

    if (avgScore > maxScore) {
      maxScore = avgScore;
      bestCategory = category;
    }
  }

  // Normalize confidence to 0-100 scale
  const confidence = Math.min(maxScore, 100);
  const isUncategorized = confidence < CONFIDENCE_THRESHOLD || bestCategory === null;

  return {
    category: isUncategorized ? null : bestCategory,
    confidence: Math.round(confidence),
    isUncategorized,
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