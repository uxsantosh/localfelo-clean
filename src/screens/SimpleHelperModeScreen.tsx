import { HELPER_TASK_CATEGORIES, DISTANCE_OPTIONS } from '../constants/helperCategories';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

interface SimpleHelperModeScreenProps {
  userId: string;
  onSave: (preferences: {
    selectedCategories: string[];
    selectedSubSkills: string[];
    distance: number;
  }) => void;
  onBack: () => void;
  currentPreferences?: {
    selectedCategories: string[];
    selectedSubSkills: string[];
    distance: number;
  } | null;
}

export function SimpleHelperModeScreen({
  userId,
  onSave,
  onBack,
  currentPreferences,
}: SimpleHelperModeScreenProps) {
  console.log('🎯 SimpleHelperModeScreen MOUNTED!');
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentPreferences?.selectedCategories || []
  );
  const [selectedSubSkills, setSelectedSubSkills] = useState<string[]>(
    currentPreferences?.selectedSubSkills || []
  );
  const [selectedDistance, setSelectedDistance] = useState(
    currentPreferences?.distance || 5
  );
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Toggle main category
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      // Remove category and all its sub-skills
      setSelectedCategories(prev => prev.filter(c => c !== categoryId));
      const category = HELPER_TASK_CATEGORIES.find(c => c.id === categoryId);
      if (category) {
        setSelectedSubSkills(prev =>
          prev.filter(skill => !category.subSkills.includes(skill))
        );
      }
    } else {
      // Add category
      setSelectedCategories(prev => [...prev, categoryId]);
    }
  };

  // Toggle sub-skill
  const toggleSubSkill = (categoryId: string, subSkill: string) => {
    // First ensure category is selected
    if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories(prev => [...prev, categoryId]);
    }

    // Toggle sub-skill
    if (selectedSubSkills.includes(subSkill)) {
      setSelectedSubSkills(prev => prev.filter(s => s !== subSkill));
    } else {
      setSelectedSubSkills(prev => [...prev, subSkill]);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one task category');
      return;
    }

    setIsSaving(true);

    try {
      // Save to database
      const { error } = await supabase
        .from('helper_preferences')
        .upsert({
          user_id: userId,
          selected_categories: selectedCategories,
          selected_sub_skills: selectedSubSkills,
          max_distance: selectedDistance,
          is_available: true,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('✅ Helper preferences saved!');
      
      // Call parent callback
      onSave({
        selectedCategories,
        selectedSubSkills,
        distance: selectedDistance,
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  // Count selected skills in category
  const getSelectedSkillsInCategory = (categoryId: string) => {
    const category = HELPER_TASK_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return 0;
    return selectedSubSkills.filter(skill => category.subSkills.includes(skill)).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#CDFF00] px-4 py-4 sticky top-0 z-10 border-b-2 border-black">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-black">Helper Mode</h1>
            <p className="text-sm text-black/80">
              {selectedCategories.length} categories selected
            </p>
          </div>
          <button
            onClick={onBack}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-black" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Title Section */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-black mb-2">
            What tasks can you help with?
          </h2>
          <p className="text-gray-600">
            Choose the tasks you are comfortable doing.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          {HELPER_TASK_CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            const isExpanded = expandedCategory === category.id;
            const selectedSubSkillCount = getSelectedSkillsInCategory(category.id);

            return (
              <div
                key={category.id}
                className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
                  isSelected ? 'border-[#CDFF00]' : 'border-gray-200'
                }`}
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="text-3xl">{category.emoji}</div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-black">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                    {selectedSubSkillCount > 0 && (
                      <p className="text-xs text-[#CDFF00] font-semibold mt-1">
                        {selectedSubSkillCount} sub-skills selected
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <div className="w-6 h-6 bg-[#CDFF00] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-black" />
                      </div>
                    )}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCategory(isExpanded ? null : category.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Sub-skills (Expandable) */}
                {isExpanded && (
                  <div className="border-t-2 border-gray-100 p-4 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 mb-3">
                      OPTIONAL: Select specific sub-skills
                    </p>
                    <div className="space-y-2">
                      {category.subSkills.map((subSkill) => {
                        const isSubSkillSelected = selectedSubSkills.includes(subSkill);
                        return (
                          <button
                            key={subSkill}
                            onClick={() => toggleSubSkill(category.id, subSkill)}
                            className={`w-full px-4 py-3 rounded-lg text-left flex items-center justify-between transition-all ${
                              isSubSkillSelected
                                ? 'bg-[#CDFF00] text-black font-semibold'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className="text-sm">{subSkill}</span>
                            {isSubSkillSelected && (
                              <Check className="w-4 h-4 text-black" />
                            )}
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

        {/* Distance Selection */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="font-bold text-black mb-4">How far can you travel?</h3>
          <div className="grid grid-cols-4 gap-3">
            {DISTANCE_OPTIONS.map((distance) => (
              <button
                key={distance}
                onClick={() => setSelectedDistance(distance)}
                className={`py-4 rounded-lg font-bold transition-all ${
                  selectedDistance === distance
                    ? 'bg-[#CDFF00] text-black border-2 border-black'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                {distance} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 z-20">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-4 bg-gray-100 text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={selectedCategories.length === 0 || isSaving}
            className="flex-2 py-4 bg-[#CDFF00] text-black font-bold rounded-lg hover:bg-[#CDFF00]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-8"
          >
            {isSaving ? 'Saving...' : 'Show Me Tasks'}
          </button>
        </div>
      </div>
    </div>
  );
}