import { supabase } from '../lib/supabaseClient';
import { 
  validateSkillName, 
  stringSimilarity, 
  findClosestMatch,
  normalizeText 
} from './contentModeration';

/**
 * Custom Skills System
 * Allows helpers to add ANY skill, and system learns from usage patterns
 */

// Save custom skill for a helper
export async function addCustomSkill(userId: string, skillName: string): Promise<{
  success: boolean;
  error?: string;
  suggestion?: string;
}> {
  // Validate skill name (profanity check, length, etc.)
  const validation = validateSkillName(skillName);
  
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors.join('. '),
    };
  }
  
  const normalizedSkill = validation.sanitized;
  
  // Check if skill already exists (case-insensitive)
  const existing = await getHelperCustomSkills(userId);
  const exactMatch = existing.find(s => s.toLowerCase() === normalizedSkill.toLowerCase());
  
  if (exactMatch) {
    return {
      success: false,
      error: 'You already have this skill added',
    };
  }
  
  // Check for very similar skills (fuzzy matching)
  const similarMatch = findClosestMatch(normalizedSkill, existing, 85);
  if (similarMatch.match) {
    return {
      success: false,
      error: `Very similar to your existing skill: "${similarMatch.match}"`,
      suggestion: similarMatch.match,
    };
  }

  try {
    const { error } = await supabase
      .from('helper_custom_skills')
      .insert({
        user_id: userId,
        skill_name: normalizedSkill,
        created_at: new Date().toISOString(),
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error adding custom skill:', error);
    return {
      success: false,
      error: 'Failed to add skill. Please try again.',
    };
  }
}

// Get all custom skills for a helper
export async function getHelperCustomSkills(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('helper_custom_skills')
      .select('skill_name')
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map(s => s.skill_name) || [];
  } catch (error) {
    console.error('Error fetching custom skills:', error);
    return [];
  }
}

// Remove custom skill
export async function removeCustomSkill(userId: string, skillName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('helper_custom_skills')
      .delete()
      .eq('user_id', userId)
      .eq('skill_name', skillName.toLowerCase());

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing custom skill:', error);
    return false;
  }
}

// Match task to custom skills using intelligent keyword matching
export function matchTaskToCustomSkills(taskTitle: string, taskDescription: string, customSkills: string[]): boolean {
  const fullText = `${taskTitle} ${taskDescription}`.toLowerCase();
  
  for (const skill of customSkills) {
    const skillWords = skill.toLowerCase().split(' ');
    
    // Check if any skill word appears in task text
    for (const word of skillWords) {
      if (word.length >= 3 && fullText.includes(word)) {
        return true;
      }
    }
  }
  
  return false;
}

// Record when a helper responds to a task (training data)
export async function recordHelperTaskInteraction(
  userId: string,
  taskId: string,
  taskTitle: string,
  taskCategory: string,
  helperSkills: string[],
  actionType: 'view' | 'message' | 'accept'
): Promise<void> {
  try {
    await supabase
      .from('skill_training_data')
      .insert({
        user_id: userId,
        task_id: taskId,
        task_title: taskTitle,
        task_category: taskCategory,
        helper_skills: helperSkills,
        action_type: actionType,
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Error recording training data:', error);
  }
}

// Get popular custom skills (for admin to promote to official categories)
export async function getPopularCustomSkills(limit: number = 50): Promise<Array<{ skill: string; count: number }>> {
  try {
    const { data, error } = await supabase
      .from('helper_custom_skills')
      .select('skill_name');

    if (error) throw error;

    // Count occurrences
    const skillCounts: Record<string, number> = {};
    data?.forEach(row => {
      const skill = row.skill_name;
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });

    // Sort by count
    const sorted = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sorted;
  } catch (error) {
    console.error('Error fetching popular skills:', error);
    return [];
  }
}

// Get skill suggestions based on partial input (autocomplete)
export async function getSkillSuggestions(query: string, limit: number = 10): Promise<string[]> {
  if (!query || query.length < 2) return [];

  try {
    const { data, error } = await supabase
      .from('helper_custom_skills')
      .select('skill_name')
      .ilike('skill_name', `%${query}%`)
      .limit(limit);

    if (error) throw error;

    // Remove duplicates and return
    const unique = [...new Set(data?.map(s => s.skill_name) || [])];
    return unique;
  } catch (error) {
    console.error('Error fetching skill suggestions:', error);
    return [];
  }
}

// Enhanced matching: combines official categories + custom skills
export interface EnhancedMatchResult {
  matches: boolean;
  matchType: 'category' | 'custom_skill' | 'both' | 'none';
  confidence: number; // 0-100
  matchedSkills: string[];
}

export function enhancedTaskMatch(
  taskTitle: string,
  taskCategory: string,
  helperCategories: string[],
  helperCustomSkills: string[]
): EnhancedMatchResult {
  let matches = false;
  let matchType: 'category' | 'custom_skill' | 'both' | 'none' = 'none';
  let confidence = 0;
  const matchedSkills: string[] = [];

  // Check category match
  const categoryMatch = helperCategories.includes(taskCategory) || helperCategories.includes('All Categories');
  
  // Check custom skill match
  const customSkillMatch = matchTaskToCustomSkills(taskTitle, '', helperCustomSkills);

  if (categoryMatch && customSkillMatch) {
    matches = true;
    matchType = 'both';
    confidence = 95;
    matchedSkills.push(taskCategory);
    // Add matched custom skills
    helperCustomSkills.forEach(skill => {
      if (taskTitle.toLowerCase().includes(skill.toLowerCase())) {
        matchedSkills.push(skill);
      }
    });
  } else if (categoryMatch) {
    matches = true;
    matchType = 'category';
    confidence = 80;
    matchedSkills.push(taskCategory);
  } else if (customSkillMatch) {
    matches = true;
    matchType = 'custom_skill';
    confidence = 70;
    // Add matched custom skills
    helperCustomSkills.forEach(skill => {
      if (taskTitle.toLowerCase().includes(skill.toLowerCase())) {
        matchedSkills.push(skill);
      }
    });
  }

  return { matches, matchType, confidence, matchedSkills };
}