import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, MapPin, IndianRupee, CheckCircle2, Sparkles, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllServiceCategories, getSubcategoriesByCategoryId, getCategoryEmojiById, getCategoryNameById } from '../services/serviceCategories';
import { getHelperPreferences, saveHelperPreferences, HelperPreferences } from '../services/helperPreferences';
import { getHelperCustomSkills, addCustomSkill, removeCustomSkill, getSkillSuggestions } from '../services/customSkills';
import { toast } from 'sonner@2.0.3';

interface HelperPreferencesScreenProps {
  onBack: () => void;
  userId: string;
  onSave: () => void;
}

export function HelperPreferencesScreen({
  onBack,
  userId,
  onSave,
}: HelperPreferencesScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Preferences state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // Category IDs
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]); // Subcategory IDs
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null); // For expanding subcategories
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState(10); // km
  const [minBudget, setMinBudget] = useState<number | null>(null);
  const [maxBudget, setMaxBudget] = useState<number | null>(null);
  const [notifyNewTasks, setNotifyNewTasks] = useState(true);

  const allServiceCategories = getAllServiceCategories();

  // Load existing preferences
  useEffect(() => {
    loadPreferences();
  }, [userId]);

  // Load skill suggestions as user types
  useEffect(() => {
    if (customSkillInput.length >= 2) {
      loadSkillSuggestions();
    } else {
      setSkillSuggestions([]);
    }
  }, [customSkillInput]);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const prefs = await getHelperPreferences(userId);
      if (prefs) {
        setSelectedCategories(prefs.selected_categories || []);
        setSelectedSubcategories(prefs.selected_subcategories || []);
        setMaxDistance(prefs.max_distance || 10); // ✅ FIXED: Changed from max_distance_km
        setMinBudget(prefs.min_budget);
        setMaxBudget(prefs.max_budget);
      }

      // Load custom skills
      const custom = await getHelperCustomSkills(userId);
      setCustomSkills(custom);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSkillSuggestions = async () => {
    try {
      const suggestions = await getSkillSuggestions(customSkillInput);
      const filtered = suggestions.filter(s => !customSkills.includes(s));
      setSkillSuggestions(filtered);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleAddCustomSkill = async (skillName?: string) => {
    const skill = skillName || customSkillInput.trim();
    if (!skill || customSkills.includes(skill.toLowerCase())) return;

    const success = await addCustomSkill(userId, skill);
    if (success) {
      setCustomSkills(prev => [...prev, skill.toLowerCase()]);
      setCustomSkillInput('');
      setSkillSuggestions([]);
      toast.success('Custom skill added!');
    }
  };

  const handleRemoveCustomSkill = async (skill: string) => {
    const success = await removeCustomSkill(userId, skill);
    if (success) {
      setCustomSkills(prev => prev.filter(s => s !== skill));
      toast.success('Custom skill removed');
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      // Deselect category and all its subcategories
      setSelectedCategories(prev => prev.filter(c => c !== categoryId));
      
      // Remove subcategories of this category
      const subcatsToRemove = getSubcategoriesByCategoryId(categoryId).map(sub => sub.id);
      setSelectedSubcategories(prev => prev.filter(sub => !subcatsToRemove.includes(sub)));
    } else {
      // Select category
      setSelectedCategories(prev => [...prev, categoryId]);
    }
  };

  const toggleSubcategory = (categoryId: string, subcategoryId: string) => {
    if (selectedSubcategories.includes(subcategoryId)) {
      // Deselect subcategory
      setSelectedSubcategories(prev => prev.filter(s => s !== subcategoryId));
    } else {
      // Select subcategory (and ensure parent category is selected)
      if (!selectedCategories.includes(categoryId)) {
        setSelectedCategories(prev => [...prev, categoryId]);
      }
      setSelectedSubcategories(prev => [...prev, subcategoryId]);
    }
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    toast.info('All categories cleared');
  };

  const handleSave = async () => {
    // ✅ Validation: Must select at least one category
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    setIsSaving(true);
    try {
      const success = await saveHelperPreferences(userId, {
        selected_categories: selectedCategories,
        selected_subcategories: selectedSubcategories,
        max_distance: maxDistance, // ✅ FIXED: Changed from max_distance_km
        min_budget: minBudget,
        max_budget: maxBudget,
      });

      if (success) {
        toast.success('Preferences saved successfully!');
        onSave();
      } else {
        toast.error('Failed to save preferences. Please try again.');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className=\"min-h-screen bg-white flex items-center justify-center\">
        <div className=\"text-center\">
          <div className=\"w-8 h-8 border-4 border-[#CDFF00] border-t-transparent rounded-full animate-spin mx-auto mb-2\" />
          <p className=\"text-sm text-gray-600\">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-white pb-24\">
      {/* Header */}
      <div className=\"sticky top-0 z-10 bg-white border-b border-gray-200\">
        <div className=\"flex items-center justify-between px-4 py-3\">
          <button
            onClick={onBack}
            className=\"p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors\"
          >
            <ArrowLeft className=\"w-5 h-5\" />
          </button>
          <h1 className=\"font-bold text-lg\">Helper Preferences</h1>
          <div className=\"w-9\" />
        </div>
      </div>

      {/* Content */}
      <div className=\"px-4 py-6 max-w-2xl mx-auto space-y-8\">
        {/* AI Info Banner */}
        <div className=\"p-4 bg-[#CDFF00]/10 rounded-lg border border-[#CDFF00]/20\">
          <div className=\"flex items-start gap-3\">
            <Sparkles className=\"w-5 h-5 text-[#CDFF00] mt-0.5\" />
            <div>
              <p className=\"text-sm font-semibold mb-1\">Smart Matching</p>
              <p className=\"text-xs text-gray-600\">
                Set your preferences and we'll show you only relevant tasks. You'll also get notified when new matching tasks are posted!
              </p>
            </div>
          </div>
        </div>

        {/* Categories Selection */}
        <div>
          <div className=\"flex items-center justify-between mb-3\">
            <div className=\"flex items-center gap-2\">
              <CheckCircle2 className=\"w-5 h-5 text-[#CDFF00]\" />
              <h2 className=\"font-bold text-lg\">What can you help with?</h2>
            </div>
            {selectedCategories.length > 0 && (
              <button
                onClick={clearAllCategories}
                className=\"text-sm text-red-500 hover:text-red-600 font-medium\"
              >
                Clear All
              </button>
            )}
          </div>
          <p className=\"text-sm text-gray-600 mb-4\">
            Select categories and subcategories you're interested in
          </p>

          {/* ✅ FIX: Black text + light yellow bg for category count */}
          {selectedCategories.length > 0 && (
            <div className=\"mb-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg inline-block\">
              <p className=\"text-sm font-semibold text-black\">
                ✓ {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
                {selectedSubcategories.length > 0 && ` • ${selectedSubcategories.length} subcategories`}
              </p>
            </div>
          )}
          
          {/* Category List with Expandable Subcategories */}
          <div className=\"space-y-3\">
            {allServiceCategories.map((category) => {
              const isCategorySelected = selectedCategories.includes(category.id);
              const subcategories = getSubcategoriesByCategoryId(category.id);
              const isExpanded = expandedCategory === category.id;
              const selectedSubcatsCount = subcategories.filter(sub => 
                selectedSubcategories.includes(sub.id)
              ).length;

              return (
                <div
                  key={category.id}
                  className={`border-2 rounded-lg transition-all ${
                    isCategorySelected
                      ? 'border-[#CDFF00] bg-[#CDFF00]/5'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Category Header */}
                  <div className=\"flex items-center justify-between p-3\">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className=\"flex items-center gap-3 flex-1\"
                    >
                      <span className=\"text-2xl\">{category.emoji}</span>
                      <div className=\"text-left\">
                        <p className=\"font-semibold text-sm\">{category.name}</p>
                        {isCategorySelected && selectedSubcatsCount > 0 && (
                          <p className=\"text-xs text-gray-600\">
                            {selectedSubcatsCount} subcategory selected
                          </p>
                        )}
                      </div>
                    </button>

                    {/* Expand/Collapse Button */}
                    {isCategorySelected && (
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                        className=\"p-2 hover:bg-gray-100 rounded-full transition-colors\"
                      >
                        {isExpanded ? (
                          <ChevronUp className=\"w-5 h-5 text-gray-600\" />
                        ) : (
                          <ChevronDown className=\"w-5 h-5 text-gray-600\" />
                        )}
                      </button>
                    )}

                    {/* Selected Indicator */}
                    {isCategorySelected && (
                      <CheckCircle2 className=\"w-5 h-5 text-[#CDFF00]\" />
                    )}
                  </div>

                  {/* Subcategories (Expandable) */}
                  {isCategorySelected && isExpanded && subcategories.length > 0 && (
                    <div className=\"border-t border-gray-200 p-3 bg-gray-50\">
                      <p className=\"text-xs font-semibold text-gray-600 mb-2\">Subcategories:</p>
                      <div className=\"space-y-1\">
                        {subcategories.map((subcat) => {
                          const isSubcatSelected = selectedSubcategories.includes(subcat.id);
                          return (
                            <button
                              key={subcat.id}
                              onClick={() => toggleSubcategory(category.id, subcat.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                isSubcatSelected
                                  ? 'bg-[#CDFF00]/20 text-black font-medium'
                                  : 'bg-white text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {isSubcatSelected && <CheckCircle2 className=\"w-4 h-4 inline mr-1 text-[#CDFF00]\" />}
                              {subcat.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Skills */}
        <div>
          <div className=\"flex items-center gap-2 mb-3\">
            <CheckCircle2 className=\"w-5 h-5 text-[#CDFF00]\" />
            <h2 className=\"font-bold text-lg\">Custom Skills</h2>
          </div>
          <p className=\"text-sm text-gray-600 mb-4\">
            Add skills not listed above
          </p>

          <div className=\"relative mb-4\">
            <input
              type=\"text\"
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customSkillInput.trim()) {
                  handleAddCustomSkill();
                }
              }}
              placeholder=\"E.g., aquarium maintenance, drone photography\"
              className=\"w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent\"
            />
            <Plus
              className=\"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer hover:text-[#CDFF00] transition-colors\"
              onClick={() => handleAddCustomSkill()}
            />

            {/* Autocomplete suggestions */}
            {skillSuggestions.length > 0 && (
              <div className=\"absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto\">
                {skillSuggestions.map(suggestion => (
                  <div
                    key={suggestion}
                    className=\"px-4 py-2 cursor-pointer hover:bg-[#CDFF00]/10 transition-colors text-sm\"
                    onClick={() => handleAddCustomSkill(suggestion)}
                  >
                    <span className=\"font-medium\">{suggestion}</span>
                    <span className=\"text-xs text-gray-500 ml-2\">
                      (used by others)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {customSkills.length > 0 && (
            <div>
              <p className=\"text-sm font-semibold mb-2 text-gray-700\">Your Custom Skills</p>
              <div className=\"flex flex-wrap gap-2\">
                {customSkills.map(skill => (
                  <div
                    key={skill}
                    className=\"px-4 py-2 rounded-full text-sm font-medium bg-[#CDFF00]/20 text-black border-2 border-[#CDFF00] flex items-center gap-2\"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveCustomSkill(skill)}
                      className=\"hover:bg-black/10 rounded-full p-0.5 transition-colors\"
                    >
                      <X className=\"w-4 h-4\" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Distance Range */}
        <div>
          <div className=\"flex items-center gap-2 mb-3\">
            <MapPin className=\"w-5 h-5 text-[#CDFF00]\" />
            <h2 className=\"font-bold text-lg\">Maximum Distance</h2>
          </div>
          <p className=\"text-sm text-gray-600 mb-4\">
            How far are you willing to travel?
          </p>

          <div className=\"space-y-4\">
            <div className=\"flex items-center justify-between\">
              <span className=\"text-2xl font-bold\">{maxDistance} km</span>
              <span className=\"text-sm text-gray-500\">
                {maxDistance < 5 ? 'Very close' : maxDistance < 15 ? 'Nearby' : maxDistance < 30 ? 'Moderate' : 'Far'}
              </span>
            </div>
            
            <input
              type=\"range\"
              min=\"1\"
              max=\"50\"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className=\"w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#CDFF00]\"
            />

            <div className=\"flex justify-between text-xs text-gray-500\">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>
        </div>

        {/* Budget Range */}
        <div>
          <div className=\"flex items-center gap-2 mb-3\">
            <IndianRupee className=\"w-5 h-5 text-[#CDFF00]\" />
            <h2 className=\"font-bold text-lg\">Budget Range</h2>
          </div>
          <p className=\"text-sm text-gray-600 mb-4\">
            Set your minimum and maximum budget preferences
          </p>

          <div className=\"grid grid-cols-2 gap-4\">
            <div>
              <label className=\"block text-sm font-semibold mb-2 text-gray-700\">
                Minimum Budget
              </label>
              <div className=\"relative\">
                <IndianRupee className=\"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400\" />
                <input
                  type=\"number\"
                  value={minBudget || ''}
                  onChange={(e) => setMinBudget(e.target.value ? Number(e.target.value) : null)}
                  placeholder=\"0\"
                  className=\"w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent\"
                />
              </div>
            </div>

            <div>
              <label className=\"block text-sm font-semibold mb-2 text-gray-700\">
                Maximum Budget
              </label>
              <div className=\"relative\">
                <IndianRupee className=\"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400\" />
                <input
                  type=\"number\"
                  value={maxBudget || ''}
                  onChange={(e) => setMaxBudget(e.target.value ? Number(e.target.value) : null)}
                  placeholder=\"No limit\"
                  className=\"w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent\"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <div className=\"flex items-center gap-2 mb-3\">
            <Bell className=\"w-5 h-5 text-[#CDFF00]\" />
            <h2 className=\"font-bold text-lg\">Notifications</h2>
          </div>
          <p className=\"text-sm text-gray-600 mb-4\">
            Get notified about new matching tasks
          </p>

          <button
            onClick={() => setNotifyNewTasks(!notifyNewTasks)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              notifyNewTasks
                ? 'border-[#CDFF00] bg-[#CDFF00]/10'
                : 'border-gray-200'
            }`}
          >
            <div className=\"flex items-center justify-between\">
              <div>
                <p className=\"font-semibold\">Notify me about new tasks</p>
                <p className=\"text-xs text-gray-600 mt-1\">
                  Receive notifications when tasks matching your preferences are posted
                </p>
              </div>
              {notifyNewTasks && <CheckCircle2 className=\"w-5 h-5 text-[#CDFF00]\" />}
            </div>
          </button>
        </div>
      </div>

      {/* ✅ FIX: Apply button ALWAYS enabled at bottom */}
      <div className=\"fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg\">
        <div className=\"max-w-2xl mx-auto\">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className=\"w-full bg-[#CDFF00] text-black py-4 rounded-lg font-bold hover:bg-[#CDFF00]/90 disabled:opacity-50 transition-all\"
          >
            {isSaving ? 'Saving...' : 'Apply Preferences'}
          </button>
          <p className=\"text-xs text-center text-gray-500 mt-2\">
            Updates will take effect immediately
          </p>
        </div>
      </div>
    </div>
  );
}