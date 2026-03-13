// =====================================================
// Job Suggestions Service - Smart keyword matching
// =====================================================

import { supabase } from '../lib/supabaseClient';

// Job intent types (internal classification)
export type JobIntent = 
  | 'bring_buy'
  | 'pickup_drop'
  | 'fix_install'
  | 'clean_work'
  | 'move_carry'
  | 'personal_help'
  | 'vehicle_help'
  | 'teaching_skill'
  | 'event_help'
  | 'other';

// Effort levels
export type EffortLevel = 'easy' | 'medium' | 'hard';

// Job suggestion interface
export interface JobSuggestion {
  id: string;
  title: string;
  intent: JobIntent;
  effortLevel: EffortLevel;
  keywords: string[];
  typicalBudgetMin: number;
  typicalBudgetMax: number;
  popularity: number;
}

// Built-in synonyms for common words
const SYNONYMS_MAP: Record<string, string[]> = {
  // Bring/Get/Deliver
  'bring': ['get', 'deliver', 'fetch', 'pickup', 'buy', 'purchase'],
  'get': ['bring', 'deliver', 'fetch', 'pickup', 'buy'],
  'deliver': ['bring', 'get', 'drop', 'send'],
  'pickup': ['collect', 'get', 'bring', 'fetch'],
  
  // Fix/Repair
  'fix': ['repair', 'mend', 'restore', 'service'],
  'repair': ['fix', 'mend', 'restore', 'service'],
  
  // Clean
  'clean': ['wash', 'scrub', 'sanitize', 'tidy'],
  'wash': ['clean', 'scrub'],
  
  // Move/Shift
  'move': ['shift', 'transport', 'carry', 'relocate'],
  'shift': ['move', 'transport', 'carry', 'relocate'],
  'carry': ['move', 'shift', 'transport', 'lift'],
  
  // Items
  'gas cylinder': ['lpg', 'gas', 'cylinder', 'gas bottle'],
  'lpg': ['gas cylinder', 'gas', 'cylinder'],
  'parcel': ['package', 'courier', 'delivery'],
  'package': ['parcel', 'courier', 'delivery'],
  'groceries': ['vegetables', 'veggies', 'sabzi', 'fruits', 'shopping'],
  'medicine': ['medical', 'pharmacy', 'drugs'],
};

// Default job suggestions (these will be seeded in database)
const DEFAULT_SUGGESTIONS: Omit<JobSuggestion, 'id' | 'popularity'>[] = [
  // Bring/Buy
  { title: 'Bring Groceries', intent: 'bring_buy', effortLevel: 'easy', keywords: ['bring', 'groceries', 'vegetables', 'shopping', 'sabzi'], typicalBudgetMin: 50, typicalBudgetMax: 200 },
  { title: 'Bring Gas Cylinder', intent: 'bring_buy', effortLevel: 'medium', keywords: ['bring', 'gas', 'cylinder', 'lpg'], typicalBudgetMin: 100, typicalBudgetMax: 300 },
  { title: 'Bring Medicine', intent: 'bring_buy', effortLevel: 'easy', keywords: ['bring', 'medicine', 'pharmacy', 'medical'], typicalBudgetMin: 50, typicalBudgetMax: 150 },
  { title: 'Buy & Bring Items', intent: 'bring_buy', effortLevel: 'easy', keywords: ['buy', 'bring', 'items', 'shopping'], typicalBudgetMin: 50, typicalBudgetMax: 200 },
  
  // Pickup/Drop
  { title: 'Pickup Parcel', intent: 'pickup_drop', effortLevel: 'easy', keywords: ['pickup', 'parcel', 'package', 'courier'], typicalBudgetMin: 50, typicalBudgetMax: 200 },
  { title: 'Drop Parcel', intent: 'pickup_drop', effortLevel: 'easy', keywords: ['drop', 'parcel', 'package', 'delivery'], typicalBudgetMin: 50, typicalBudgetMax: 200 },
  { title: 'Airport Pickup', intent: 'pickup_drop', effortLevel: 'medium', keywords: ['airport', 'pickup', 'drop'], typicalBudgetMin: 200, typicalBudgetMax: 1000 },
  { title: 'Station Pickup', intent: 'pickup_drop', effortLevel: 'medium', keywords: ['station', 'railway', 'pickup', 'drop'], typicalBudgetMin: 100, typicalBudgetMax: 500 },
  
  // Fix/Install
  { title: 'Fix Fan', intent: 'fix_install', effortLevel: 'medium', keywords: ['fix', 'fan', 'repair', 'ceiling'], typicalBudgetMin: 100, typicalBudgetMax: 500 },
  { title: 'Fix Tap', intent: 'fix_install', effortLevel: 'medium', keywords: ['fix', 'tap', 'faucet', 'leak', 'plumbing'], typicalBudgetMin: 150, typicalBudgetMax: 800 },
  { title: 'Fix Light', intent: 'fix_install', effortLevel: 'easy', keywords: ['fix', 'light', 'bulb', 'tube', 'electrical'], typicalBudgetMin: 100, typicalBudgetMax: 500 },
  { title: 'Fix Water Pipe', intent: 'fix_install', effortLevel: 'hard', keywords: ['fix', 'pipe', 'water', 'leak', 'plumbing'], typicalBudgetMin: 200, typicalBudgetMax: 1500 },
  { title: 'Install AC', intent: 'fix_install', effortLevel: 'hard', keywords: ['install', 'ac', 'air conditioner'], typicalBudgetMin: 300, typicalBudgetMax: 1500 },
  { title: 'Fix AC', intent: 'fix_install', effortLevel: 'hard', keywords: ['fix', 'ac', 'air conditioner', 'repair', 'service'], typicalBudgetMin: 300, typicalBudgetMax: 2000 },
  { title: 'Fix WiFi', intent: 'fix_install', effortLevel: 'medium', keywords: ['fix', 'wifi', 'internet', 'router', 'network'], typicalBudgetMin: 150, typicalBudgetMax: 800 },
  { title: 'Install TV', intent: 'fix_install', effortLevel: 'medium', keywords: ['install', 'tv', 'television', 'mount'], typicalBudgetMin: 200, typicalBudgetMax: 1000 },
  
  // Clean/Work
  { title: 'Clean House', intent: 'clean_work', effortLevel: 'medium', keywords: ['clean', 'house', 'home', 'room'], typicalBudgetMin: 300, typicalBudgetMax: 1500 },
  { title: 'Clean Kitchen', intent: 'clean_work', effortLevel: 'medium', keywords: ['clean', 'kitchen'], typicalBudgetMin: 200, typicalBudgetMax: 800 },
  { title: 'Clean Bathroom', intent: 'clean_work', effortLevel: 'medium', keywords: ['clean', 'bathroom', 'toilet'], typicalBudgetMin: 200, typicalBudgetMax: 800 },
  { title: 'Clean Balcony', intent: 'clean_work', effortLevel: 'easy', keywords: ['clean', 'balcony', 'terrace'], typicalBudgetMin: 100, typicalBudgetMax: 500 },
  { title: 'Wash Car', intent: 'clean_work', effortLevel: 'easy', keywords: ['wash', 'car', 'vehicle'], typicalBudgetMin: 100, typicalBudgetMax: 400 },
  { title: 'Wash Bike', intent: 'clean_work', effortLevel: 'easy', keywords: ['wash', 'bike', 'motorcycle', 'scooter'], typicalBudgetMin: 50, typicalBudgetMax: 200 },
  
  // Move/Carry
  { title: 'Move Furniture', intent: 'move_carry', effortLevel: 'hard', keywords: ['move', 'furniture', 'shift', 'carry'], typicalBudgetMin: 300, typicalBudgetMax: 2000 },
  { title: 'Shift Luggage', intent: 'move_carry', effortLevel: 'medium', keywords: ['shift', 'luggage', 'bags', 'carry'], typicalBudgetMin: 100, typicalBudgetMax: 500 },
  { title: 'Move Bed', intent: 'move_carry', effortLevel: 'hard', keywords: ['move', 'bed', 'shift'], typicalBudgetMin: 200, typicalBudgetMax: 1000 },
  { title: 'Shift House', intent: 'move_carry', effortLevel: 'hard', keywords: ['shift', 'house', 'home', 'moving', 'relocation'], typicalBudgetMin: 1000, typicalBudgetMax: 10000 },
  
  // Personal Help
  { title: 'Stand in Queue', intent: 'personal_help', effortLevel: 'easy', keywords: ['stand', 'queue', 'line', 'wait'], typicalBudgetMin: 100, typicalBudgetMax: 500 },
  { title: 'Submit Documents', intent: 'personal_help', effortLevel: 'easy', keywords: ['submit', 'documents', 'papers', 'office'], typicalBudgetMin: 100, typicalBudgetMax: 400 },
  { title: 'Photocopy Help', intent: 'personal_help', effortLevel: 'easy', keywords: ['photocopy', 'xerox', 'copy'], typicalBudgetMin: 50, typicalBudgetMax: 200 },
  { title: 'Need Driver', intent: 'personal_help', effortLevel: 'medium', keywords: ['driver', 'drive', 'car'], typicalBudgetMin: 200, typicalBudgetMax: 1000 },
  
  // Vehicle Help
  { title: 'Need Tempo', intent: 'vehicle_help', effortLevel: 'medium', keywords: ['tempo', 'truck', 'vehicle'], typicalBudgetMin: 500, typicalBudgetMax: 3000 },
  { title: 'Need Auto', intent: 'vehicle_help', effortLevel: 'easy', keywords: ['auto', 'rickshaw'], typicalBudgetMin: 50, typicalBudgetMax: 500 },
  { title: 'Bike Rental', intent: 'vehicle_help', effortLevel: 'easy', keywords: ['bike', 'rental', 'rent'], typicalBudgetMin: 200, typicalBudgetMax: 800 },
  
  // Teaching/Skill
  { title: 'Teach Excel', intent: 'teaching_skill', effortLevel: 'easy', keywords: ['teach', 'excel', 'spreadsheet'], typicalBudgetMin: 200, typicalBudgetMax: 1000 },
  { title: 'Computer Help', intent: 'teaching_skill', effortLevel: 'easy', keywords: ['computer', 'help', 'laptop', 'software'], typicalBudgetMin: 150, typicalBudgetMax: 800 },
  { title: 'Home Tuition', intent: 'teaching_skill', effortLevel: 'easy', keywords: ['tuition', 'teach', 'study', 'homework'], typicalBudgetMin: 300, typicalBudgetMax: 1500 },
  
  // Event Help
  { title: 'Photography', intent: 'event_help', effortLevel: 'medium', keywords: ['photography', 'photo', 'camera'], typicalBudgetMin: 500, typicalBudgetMax: 5000 },
  { title: 'Event Help', intent: 'event_help', effortLevel: 'medium', keywords: ['event', 'party', 'function'], typicalBudgetMin: 300, typicalBudgetMax: 3000 },
  { title: 'Decoration', intent: 'event_help', effortLevel: 'medium', keywords: ['decoration', 'decor', 'birthday'], typicalBudgetMin: 500, typicalBudgetMax: 5000 },
];

/**
 * Expand search query with synonyms
 */
function expandWithSynonyms(query: string): string[] {
  const words = query.toLowerCase().split(/\s+/);
  const expanded = new Set(words);
  
  words.forEach(word => {
    // Check if word has synonyms
    Object.entries(SYNONYMS_MAP).forEach(([key, synonyms]) => {
      if (key.includes(word) || word.includes(key)) {
        expanded.add(key);
        synonyms.forEach(syn => expanded.add(syn));
      }
      
      synonyms.forEach(syn => {
        if (syn.includes(word) || word.includes(syn)) {
          expanded.add(key);
          expanded.add(syn);
        }
      });
    });
  });
  
  return Array.from(expanded);
}

/**
 * Search job suggestions based on user input
 */
export async function searchJobSuggestions(query: string, limit: number = 5): Promise<JobSuggestion[]> {
  if (!query || query.trim().length === 0) {
    // Return popular suggestions if no query
    return getPopularSuggestions(limit);
  }
  
  try {
    // Expand query with synonyms
    const expandedTerms = expandWithSynonyms(query);
    
    // Search in database
    const { data, error } = await supabase
      .from('job_suggestions')
      .select('*')
      .order('popularity', { ascending: false })
      .limit(50); // Get more to filter locally
    
    if (error) {
      console.error('[JobSuggestions] Error fetching:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Score each suggestion
    const scored = data.map(suggestion => {
      let score = 0;
      const keywords = suggestion.keywords || [];
      const title = suggestion.title.toLowerCase();
      
      // Check if any expanded term matches keywords or title
      expandedTerms.forEach(term => {
        // Match in title (higher weight)
        if (title.includes(term)) {
          score += 10;
        }
        
        // Match in keywords
        keywords.forEach((keyword: string) => {
          if (keyword.toLowerCase().includes(term)) {
            score += 5;
          }
        });
      });
      
      // Boost popular suggestions
      score += (suggestion.popularity || 0) * 0.1;
      
      return { ...suggestion, score };
    });
    
    // Filter out zero scores and sort by score
    const filtered = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    return filtered;
  } catch (error) {
    console.error('[JobSuggestions] Search error:', error);
    return [];
  }
}

/**
 * Get popular job suggestions
 */
export async function getPopularSuggestions(limit: number = 10): Promise<JobSuggestion[]> {
  try {
    const { data, error } = await supabase
      .from('job_suggestions')
      .select('*')
      .order('popularity', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[JobSuggestions] Error fetching popular:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('[JobSuggestions] Error:', error);
    return [];
  }
}

/**
 * Increment popularity of a suggestion when used
 */
export async function incrementSuggestionPopularity(suggestionId: string): Promise<void> {
  try {
    await supabase.rpc('increment_job_suggestion_popularity', { suggestion_id: suggestionId });
  } catch (error) {
    console.error('[JobSuggestions] Error incrementing popularity:', error);
  }
}

/**
 * Track custom job (for learning system)
 */
export async function trackCustomJob(title: string, intent: JobIntent, effortLevel: EffortLevel): Promise<void> {
  try {
    // Check if similar job exists
    const { data: existing } = await supabase
      .from('job_suggestions')
      .select('id, popularity')
      .ilike('title', `%${title}%`)
      .single();
    
    if (existing) {
      // Increment existing
      await incrementSuggestionPopularity(existing.id);
    } else {
      // Create new suggestion
      const { error } = await supabase
        .from('job_suggestions')
        .insert({
          title,
          intent,
          effort_level: effortLevel,
          keywords: title.toLowerCase().split(/\s+/),
          typical_budget_min: 100,
          typical_budget_max: 500,
          popularity: 1,
        });
      
      if (error) {
        console.error('[JobSuggestions] Error creating suggestion:', error);
      }
    }
  } catch (error) {
    console.error('[JobSuggestions] Error tracking custom job:', error);
  }
}

/**
 * Detect intent from job description
 */
export function detectIntent(description: string): JobIntent {
  const lower = description.toLowerCase();
  
  // Bring/Buy
  if (/\b(bring|get|buy|purchase|deliver|fetch)\b/.test(lower)) {
    return 'bring_buy';
  }
  
  // Pickup/Drop
  if (/\b(pickup|drop|collect|deliver|send)\b/.test(lower)) {
    return 'pickup_drop';
  }
  
  // Fix/Install
  if (/\b(fix|repair|install|service|mend)\b/.test(lower)) {
    return 'fix_install';
  }
  
  // Clean
  if (/\b(clean|wash|scrub|sanitize|tidy)\b/.test(lower)) {
    return 'clean_work';
  }
  
  // Move/Carry
  if (/\b(move|shift|carry|transport|relocate)\b/.test(lower)) {
    return 'move_carry';
  }
  
  // Teaching
  if (/\b(teach|tuition|learn|study|training)\b/.test(lower)) {
    return 'teaching_skill';
  }
  
  // Vehicle
  if (/\b(tempo|auto|driver|bike|car|vehicle)\b/.test(lower)) {
    return 'vehicle_help';
  }
  
  // Event
  if (/\b(event|party|photography|decoration)\b/.test(lower)) {
    return 'event_help';
  }
  
  // Personal
  if (/\b(queue|document|help|assist)\b/.test(lower)) {
    return 'personal_help';
  }
  
  return 'other';
}

/**
 * Detect effort level from description
 */
export function detectEffortLevel(description: string): EffortLevel {
  const lower = description.toLowerCase();
  
  // Hard work keywords
  if (/\b(shift|house|furniture|heavy|install|ac|pipe)\b/.test(lower)) {
    return 'hard';
  }
  
  // Medium work keywords
  if (/\b(fix|repair|clean|move)\b/.test(lower)) {
    return 'medium';
  }
  
  // Default to easy
  return 'easy';
}

/**
 * Get default suggestions (for seeding)
 */
export function getDefaultSuggestions() {
  return DEFAULT_SUGGESTIONS;
}