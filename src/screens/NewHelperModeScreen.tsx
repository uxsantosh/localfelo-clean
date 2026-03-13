import { supabase } from '../lib/supabaseClient';
import { ALL_SKILLS, SKILL_PERSONAS, getPopularSkills, PersonaType } from '../constants/allSkills';
import { toast } from 'sonner';

interface NewHelperModeScreenProps {
  userId: string;
  onSave: (preferences: {
    selectedSkills: string[];
    distance: number;
    minBudget: number;
  }) => void;
  onBack: () => void;
  currentPreferences?: {
    selectedSkills: string[];
    distance: number;
    minBudget: number;
  } | null;
}

export function NewHelperModeScreen({
  userId,
  onSave,
  onBack,
  currentPreferences,
}: NewHelperModeScreenProps) {
  console.log('🎯 NewHelperModeScreen MOUNTED! userId:', userId);
  console.log('📊 Total skills available:', ALL_SKILLS.length);
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    currentPreferences?.selectedSkills || []
  );
  const [distance, setDistance] = useState(currentPreferences?.distance || 15);
  const [minBudget, setMinBudget] = useState(currentPreferences?.minBudget || 100);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const popularSkills = getPopularSkills();
  const displaySkills = showAllSkills ? ALL_SKILLS : popularSkills;

  const handleSelectPersona = (personaKey: PersonaType) => {
    const persona = SKILL_PERSONAS[personaKey];
    // Toggle all skills in this persona
    const personaSkills = persona.skills;
    const allSelected = personaSkills.every(skill => selectedSkills.includes(skill));
    
    if (allSelected) {
      // Deselect all
      setSelectedSkills(prev => prev.filter(s => !personaSkills.includes(s)));
      toast.info(`Deselected ${persona.name} skills`);
    } else {
      // Select all
      setSelectedSkills(prev => {
        const newSkills = [...prev];
        personaSkills.forEach(skill => {
          if (!newSkills.includes(skill)) {
            newSkills.push(skill);
          }
        });
        return newSkills;
      });
      toast.success(`Selected ${persona.name} skills!`);
    }
  };

  const toggleSkill = (slug: string) => {
    setSelectedSkills(prev => 
      prev.includes(slug) 
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    );
  };

  const selectAllSkills = () => {
    if (selectedSkills.length === ALL_SKILLS.length) {
      setSelectedSkills([]);
      toast.info('Cleared all skills');
    } else {
      setSelectedSkills(ALL_SKILLS.map(s => s.slug));
      toast.success(`Selected all ${ALL_SKILLS.length} skills!`);
    }
  };

  const handleSaveAndContinue = async () => {
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }

    setIsSaving(true);

    try {
      // Save to database
      const { error } = await supabase
        .from('helper_preferences')
        .upsert({
          user_id: userId,
          selected_categories: selectedSkills,
          preferred_intents: selectedSkills, // Backward compat
          max_distance: distance,
          min_budget: minBudget,
          show_all_tasks: false,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Enable helper mode in profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          helper_mode: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      toast.success('🎉 Helper mode activated!');
      
      onSave({
        selectedSkills,
        distance,
        minBudget,
      });
    } catch (error) {
      console.error('Error saving helper preferences:', error);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#CDFF00] sticky top-0 z-20 shadow-md">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onBack}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Helper Mode</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
          <p className="text-sm text-gray-700">
            Select your skills to start earning money
          </p>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Quick persona selectors */}
        <div className="bg-white p-4 border-b border-gray-200">
          <h3 className="text-xs font-bold mb-3 text-gray-600 tracking-wide">
            QUICK SELECT FOR:
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(SKILL_PERSONAS) as PersonaType[]).map((personaKey) => {
              const persona = SKILL_PERSONAS[personaKey];
              const personaSkills = persona.skills;
              const allSelected = personaSkills.every(skill => selectedSkills.includes(skill));
              
              return (
                <button
                  key={personaKey}
                  onClick={() => handleSelectPersona(personaKey)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    allSelected
                      ? 'border-[#CDFF00] bg-[#CDFF00]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: allSelected ? `${persona.color}40` : undefined }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl mb-1">{persona.emoji}</div>
                      <div className="text-sm font-semibold">{persona.name}</div>
                    </div>
                    {allSelected && (
                      <div className="w-6 h-6 bg-[#CDFF00] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {persona.skills.length} skills
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* All skills grid */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Individual Skills</h3>
            <button
              onClick={() => setShowAllSkills(!showAllSkills)}
              className="text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              {showAllSkills ? 'Show Popular' : `Show All (${ALL_SKILLS.length})`}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {displaySkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill.slug);
              return (
                <button
                  key={skill.slug}
                  onClick={() => toggleSkill(skill.slug)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-[#CDFF00] bg-[#CDFF00]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{skill.emoji}</div>
                  <div className="text-sm font-semibold line-clamp-1">
                    {skill.name}
                  </div>
                  {isSelected && (
                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {!showAllSkills && (
            <p className="text-xs text-center text-gray-500 mt-4">
              Showing {popularSkills.length} popular skills · 
              <button
                onClick={() => setShowAllSkills(true)}
                className="ml-1 text-blue-600 font-medium"
              >
                View all {ALL_SKILLS.length}
              </button>
            </p>
          )}
        </div>

        {/* Distance & Budget settings */}
        <div className="bg-white border-t border-gray-200 p-4 space-y-6">
          <div>
            <label className="text-sm font-semibold mb-3 block flex items-center justify-between">
              <span>Maximum Distance</span>
              <span className="text-blue-600 text-base">{distance} km</span>
            </label>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#CDFF00]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 km (nearby)</span>
              <span>50 km (anywhere)</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-3 block flex items-center justify-between">
              <span>Minimum Budget</span>
              <span className="text-blue-600 text-base">₹{minBudget}</span>
            </label>
            <input 
              type="range" 
              min="50" 
              max="5000" 
              step="50"
              value={minBudget}
              onChange={(e) => setMinBudget(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#CDFF00]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₹50 (any task)</span>
              <span>₹5000 (high-paying)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action bar - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-3 shadow-lg">
        <div className="text-center">
          {selectedSkills.length === 0 ? (
            <p className="text-sm text-gray-500">
              Select at least one skill to continue
            </p>
          ) : (
            <div className="space-y-1">
              <p className="font-semibold text-lg">
                ✓ {selectedSkills.length} skill{selectedSkills.length > 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-gray-600">
                Within {distance} km · Min ₹{minBudget}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={selectAllSkills}
            className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            {selectedSkills.length === ALL_SKILLS.length ? 'Clear All' : `Select All (${ALL_SKILLS.length})`}
          </button>
          <button
            onClick={handleSaveAndContinue}
            disabled={selectedSkills.length === 0 || isSaving}
            className="flex-[2] py-3 bg-[#CDFF00] rounded-lg font-bold hover:bg-[#CDFF00]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              'Saving...'
            ) : (
              <>
                Show Me Tasks
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-center text-gray-500">
          💡 You can change these preferences anytime
        </p>
      </div>
    </div>
  );
}