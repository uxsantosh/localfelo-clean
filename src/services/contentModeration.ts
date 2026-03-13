/**
 * Content Moderation Service
 * Handles profanity filtering, spelling corrections, and content validation
 */

// Comprehensive profanity and inappropriate words list (Indian context)
const BAD_WORDS = [
  // English profanity
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'crap', 'dick', 
  'pussy', 'cock', 'cunt', 'whore', 'slut', 'piss', 'ass', 'hell',
  // Hindi/Hinglish profanity (transliterated)
  'chutiya', 'madarchod', 'bhenchod', 'behenchod', 'gaandu', 'gandu', 
  'bhosdike', 'lodu', 'chodu', 'harami', 'kamina', 'kutta', 'kutti',
  'saala', 'sala', 'randi', 'chakka', 'hijra',
  // Kannada/Telugu profanity (transliterated)
  'gulti', 'thevdya', 'thevdiya', 'konte', 'magane', 'boli',
  // Tamil profanity (transliterated)
  'punda', 'oombu', 'otha', 'poda', 'podi', 'naaye',
  // Scams/fraud keywords
  'scam', 'fraud', 'cheat', 'fake', 'illegal', 'stolen', 'drugs', 
  'weed', 'cocaine', 'heroin', 'cannabis', 'marijuana',
  // Sexual content
  'sex', 'porn', 'nude', 'naked', 'escort', 'massage',
];

// Common spelling mistakes to corrections map
const SPELLING_CORRECTIONS: Record<string, string> = {
  // Common typos
  'delivry': 'delivery',
  'delievery': 'delivery',
  'dlvry': 'delivery',
  'pckup': 'pickup',
  'pikup': 'pickup',
  'repiar': 'repair',
  'repar': 'repair',
  'clening': 'cleaning',
  'clenning': 'cleaning',
  'cleanning': 'cleaning',
  'electrisian': 'electrician',
  'elektrician': 'electrician',
  'plumer': 'plumber',
  'plumbr': 'plumber',
  'carpnter': 'carpenter',
  'carpentr': 'carpenter',
  'tuter': 'tutor',
  'tutur': 'tutor',
  'teching': 'teaching',
  'teachng': 'teaching',
  'movng': 'moving',
  'movingg': 'moving',
  'liftng': 'lifting',
  'cookng': 'cooking',
  'cookin': 'cooking',
  'technicl': 'technical',
  'tecnical': 'technical',
  'oficce': 'office',
  'offce': 'office',
  'docment': 'document',
  'documnt': 'document',
  'helpng': 'helping',
  'helpin': 'helping',
  'assitance': 'assistance',
  'asistance': 'assistance',
  'shoping': 'shopping',
  'shoppin': 'shopping',
};

/**
 * Check if text contains profanity or inappropriate content
 */
export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  return BAD_WORDS.some(word => {
    // Check for exact word match (with word boundaries)
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}

/**
 * Get profanity check result with details
 */
export function checkContent(text: string): {
  isClean: boolean;
  foundWords: string[];
  message: string;
} {
  const lowerText = text.toLowerCase();
  const foundWords: string[] = [];
  
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerText)) {
      foundWords.push(word);
    }
  });
  
  const isClean = foundWords.length === 0;
  const message = isClean 
    ? 'Content is appropriate' 
    : 'Content contains inappropriate language. Please use professional language.';
  
  return { isClean, foundWords, message };
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching and spelling correction
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity percentage between two strings
 */
export function stringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  const similarity = (longer.length - distance) / longer.length;
  
  return similarity * 100; // Return as percentage
}

/**
 * Normalize and correct spelling in text
 */
export function normalizeText(text: string): {
  corrected: string;
  corrections: Array<{ original: string; corrected: string }>;
} {
  let corrected = text.toLowerCase().trim();
  const corrections: Array<{ original: string; corrected: string }> = [];
  
  // Replace multiple spaces with single space
  corrected = corrected.replace(/\s+/g, ' ');
  
  // Apply known spelling corrections
  const words = corrected.split(' ');
  const correctedWords = words.map(word => {
    const cleanWord = word.replace(/[^\w]/g, ''); // Remove punctuation for matching
    
    if (SPELLING_CORRECTIONS[cleanWord]) {
      corrections.push({
        original: word,
        corrected: SPELLING_CORRECTIONS[cleanWord]
      });
      return SPELLING_CORRECTIONS[cleanWord];
    }
    
    return word;
  });
  
  corrected = correctedWords.join(' ');
  
  return { corrected, corrections };
}

/**
 * Find closest matching skill from a list using fuzzy matching
 * Returns the best match if similarity is above threshold
 */
export function findClosestMatch(
  input: string, 
  options: string[], 
  threshold: number = 70
): { match: string | null; similarity: number } {
  let bestMatch: string | null = null;
  let bestSimilarity = 0;
  
  const normalizedInput = input.toLowerCase().trim();
  
  for (const option of options) {
    const similarity = stringSimilarity(normalizedInput, option.toLowerCase());
    
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = option;
    }
  }
  
  // Only return match if it meets threshold
  if (bestSimilarity >= threshold) {
    return { match: bestMatch, similarity: bestSimilarity };
  }
  
  return { match: null, similarity: bestSimilarity };
}

/**
 * Validate and sanitize skill name
 */
export function validateSkillName(skillName: string): {
  isValid: boolean;
  sanitized: string;
  errors: string[];
} {
  const errors: string[] = [];
  let sanitized = skillName.trim();
  
  // Check length
  if (sanitized.length < 2) {
    errors.push('Skill name must be at least 2 characters');
  }
  
  if (sanitized.length > 50) {
    errors.push('Skill name must be less than 50 characters');
    sanitized = sanitized.substring(0, 50);
  }
  
  // Check for profanity
  const contentCheck = checkContent(sanitized);
  if (!contentCheck.isClean) {
    errors.push(contentCheck.message);
  }
  
  // Check for only special characters
  if (/^[^a-zA-Z0-9]+$/.test(sanitized)) {
    errors.push('Skill name must contain letters or numbers');
  }
  
  // Normalize
  const normalized = normalizeText(sanitized);
  sanitized = normalized.corrected;
  
  const isValid = errors.length === 0;
  
  return { isValid, sanitized, errors };
}

/**
 * Validate task title and description
 */
export function validateTaskContent(title: string, description: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check title
  if (title.trim().length < 5) {
    errors.push('Task title must be at least 5 characters');
  }
  
  if (title.trim().length > 100) {
    errors.push('Task title must be less than 100 characters');
  }
  
  // Check description
  if (description && description.trim().length > 1000) {
    errors.push('Task description must be less than 1000 characters');
  }
  
  // Check for profanity in title
  const titleCheck = checkContent(title);
  if (!titleCheck.isClean) {
    errors.push('Task title contains inappropriate language');
  }
  
  // Check for profanity in description
  if (description) {
    const descCheck = checkContent(description);
    if (!descCheck.isClean) {
      errors.push('Task description contains inappropriate language');
    }
  }
  
  // Check for potential scam keywords
  const scamKeywords = ['guarantee', 'free money', 'quick money', 'easy money', 'bitcoin', 'investment'];
  const fullText = `${title} ${description}`.toLowerCase();
  
  scamKeywords.forEach(keyword => {
    if (fullText.includes(keyword)) {
      warnings.push(`Your content includes "${keyword}" which may be flagged as suspicious`);
    }
  });
  
  const isValid = errors.length === 0;
  
  return { isValid, errors, warnings };
}

/**
 * Get spelling suggestions for a word
 */
export function getSpellingSuggestions(word: string, dictionary: string[]): string[] {
  const suggestions: Array<{ word: string; similarity: number }> = [];
  
  dictionary.forEach(dictWord => {
    const similarity = stringSimilarity(word, dictWord);
    if (similarity >= 60) { // Lower threshold for suggestions
      suggestions.push({ word: dictWord, similarity });
    }
  });
  
  // Sort by similarity and return top 5
  return suggestions
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5)
    .map(s => s.word);
}