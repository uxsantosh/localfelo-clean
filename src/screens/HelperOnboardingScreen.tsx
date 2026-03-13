import { HELPER_TASK_CATEGORIES, DISTANCE_OPTIONS } from '../constants/helperCategories';
import { addCustomSkill } from '../services/customSkills';
import { toast } from 'sonner';

interface HelperOnboardingScreenProps {
  onComplete: () => void;
  onBack: () => void;
  initialData: {
    userId: string;
    selectedCategories: string[];
    customSkills: string[];
    distance: number;
    minBudget: number;
    notifyUrgent: boolean;
    showUncategorized: boolean;
    isSubmitting: boolean;
  };
}

export function HelperOnboardingScreen({ onComplete, onBack, initialData }: HelperOnboardingScreenProps) {
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData.selectedCategories);
  const [customSkills, setCustomSkills] = useState<string[]>(initialData.customSkills);
  const [skillInput, setSkillInput] = useState('');
  const [distance, setDistance] = useState(initialData.distance);
  const [minBudget, setMinBudget] = useState(initialData.minBudget);
  const [notifyUrgent, setNotifyUrgent] = useState(initialData.notifyUrgent);
  const [showUncategorized, setShowUncategorized] = useState(initialData.showUncategorized);
  const [isSubmitting, setIsSubmitting] = useState(initialData.isSubmitting);

  // Popular skills based on area (placeholder - can be fetched from database)
  const popularSkills = [
    'Tiffin Delivery',
    'Dog Walking',
    'Balloon Decoration',
    'Bike Mechanic',
    'Fruit Cutting',
    'Phone Repair',
  ];

  const handleCategoryToggle = (categorySlug: string) => {
    if (categorySlug === 'all') {
      // Toggle "All Categories"
      if (selectedCategories.includes('all')) {
        setSelectedCategories([]);
      } else {
        setSelectedCategories(['all']);
      }
    } else {
      // Remove "all" if selecting specific category
      const withoutAll = selectedCategories.filter(c => c !== 'all');
      
      if (withoutAll.includes(categorySlug)) {
        setSelectedCategories(withoutAll.filter(c => c !== categorySlug));
      } else {
        setSelectedCategories([...withoutAll, categorySlug]);
      }
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !customSkills.includes(skillInput.trim())) {
      setCustomSkills([...customSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setCustomSkills(customSkills.filter(s => s !== skill));
  };

  const handleFinish = async () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine if "show all tasks" mode
      const showAllTasks = selectedCategories.includes('all');
      
      // Convert category slugs to array (or keep as 'all')
      const skillsArray = showAllTasks ? ['all'] : selectedCategories;

      // Update or insert helper preferences
      // Using both column names for backward compatibility
      const { error: prefsError } = await supabase
        .from('helper_preferences')
        .upsert({
          user_id: initialData.userId,
          selected_categories: skillsArray,  // New column
          preferred_intents: skillsArray,    // Old column (backward compatibility)
          max_distance: distance,
          min_budget: minBudget,
          show_all_tasks: showAllTasks,
          show_uncategorized_tasks: showUncategorized,
          notify_urgent_tasks: notifyUrgent,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (prefsError) throw prefsError;

      // Save custom skills
      for (const skill of customSkills) {
        await addCustomSkill(initialData.userId, skill);
      }

      // Enable helper mode in profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          helper_mode: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', initialData.userId);

      if (profileError) throw profileError;

      toast.success('🎉 You\'re all set! Start browsing tasks now.');
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canContinueStep1 = selectedCategories.length >= 1;
  const progressPercent = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={step === 1 ? onBack : () => setStep(step - 1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-lg">Setup Helper Profile</h1>
            <p className="text-xs text-gray-500">Step {step} of 3</p>
          </div>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-1 bg-[#CDFF00] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Step 1: Categories */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#CDFF00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-2">What can you help with?</h2>
              <p className="text-gray-600">
                Select categories to receive relevant task notifications
              </p>
            </div>

            {/* Select All option */}
            <div
              onClick={() => handleCategoryToggle('all')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedCategories.includes('all')
                  ? 'border-[#CDFF00] bg-[#CDFF00]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">✨ Show Me Everything</h3>
                  <p className="text-sm text-gray-600">
                    Get all tasks within your distance (maximum opportunities)
                  </p>
                </div>
                {selectedCategories.includes('all') && (
                  <CheckCircle className="w-6 h-6 text-black flex-shrink-0" />
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or select specific categories</span>
              </div>
            </div>

            {/* Category grid */}
            <div className="grid grid-cols-2 gap-3">
              {HELPER_TASK_CATEGORIES.map((category) => (
                <div
                  key={category.slug}
                  onClick={() => handleCategoryToggle(category.slug)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCategories.includes(category.slug)
                      ? 'border-[#CDFF00] bg-[#CDFF00]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{category.emoji}</div>
                    <h3 className="font-semibold text-sm">{category.name}</h3>
                    {selectedCategories.includes(category.slug) && (
                      <CheckCircle className="w-5 h-5 text-black mx-auto mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Minimum selection indicator */}
            {selectedCategories.length > 0 && !selectedCategories.includes('all') && (
              <div className="text-center text-sm text-gray-600">
                ✅ {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'} selected
              </div>
            )}

            {/* Continue button */}
            <button
              onClick={() => setStep(2)}
              disabled={!canContinueStep1}
              className="w-full bg-[#CDFF00] text-black py-4 rounded-lg font-bold hover:bg-[#CDFF00]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>

            {!canContinueStep1 && (
              <p className="text-xs text-gray-500 text-center">
                Select at least one category to continue
              </p>
            )}
          </div>
        )}

        {/* Step 2: Custom Skills */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#CDFF00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Add your special skills</h2>
              <p className="text-gray-600">
                Optional - but helps you get 3x more relevant matches!
              </p>
            </div>

            {/* Skill input */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Add custom skill
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="e.g., Tiffin Delivery, Dog Walking"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Popular skills */}
            <div>
              <p className="text-sm font-semibold mb-2 text-gray-700">
                Popular skills in your area:
              </p>
              <div className="flex flex-wrap gap-2">
                {popularSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => {
                      if (!customSkills.includes(skill)) {
                        setCustomSkills([...customSkills, skill]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm border transition-all ${
                      customSkills.includes(skill)
                        ? 'border-[#CDFF00] bg-[#CDFF00]/10 text-black'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {skill} {customSkills.includes(skill) && '✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* Added skills */}
            {customSkills.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 text-gray-700">
                  Your skills ({customSkills.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {customSkills.map((skill) => (
                    <div
                      key={skill}
                      className="px-3 py-1 bg-[#CDFF00] text-black rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                💡 <strong>Pro tip:</strong> Helpers with custom skills get matched to more tasks 
                and receive 3x more task notifications!
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-lg border-2 border-gray-300 font-bold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-[#CDFF00] text-black py-4 rounded-lg font-bold hover:bg-[#CDFF00]/90 transition-all flex items-center justify-center gap-2"
              >
                {customSkills.length > 0 ? 'Continue' : 'Skip for now'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Availability & Preferences */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#CDFF00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Set your preferences</h2>
              <p className="text-gray-600">
                Configure how you want to receive task notifications
              </p>
            </div>

            {/* Distance slider */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Maximum distance: {distance} km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>

            {/* Min budget */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Minimum task budget
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={minBudget}
                  onChange={(e) => setMinBudget(Number(e.target.value))}
                  min="0"
                  step="50"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Only show tasks with budget above this amount
              </p>
            </div>

            {/* Notification preferences */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">Notifications:</p>
              
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <span className="text-sm">Notify me for urgent tasks</span>
                <input
                  type="checkbox"
                  checked={notifyUrgent}
                  onChange={(e) => setNotifyUrgent(e.target.checked)}
                  className="w-5 h-5 text-[#CDFF00] rounded focus:ring-[#CDFF00]"
                />
              </label>

              {!selectedCategories.includes('all') && (
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <span className="text-sm">Show uncategorized tasks</span>
                  <input
                    type="checkbox"
                    checked={showUncategorized}
                    onChange={(e) => setShowUncategorized(e.target.checked)}
                    className="w-5 h-5 text-[#CDFF00] rounded focus:ring-[#CDFF00]"
                  />
                </label>
              )}
            </div>

            {/* Summary */}
            <div className="bg-[#CDFF00]/10 border border-[#CDFF00]/20 rounded-lg p-4">
              <p className="text-sm font-semibold mb-2">Your Setup:</p>
              <div className="space-y-1 text-sm text-gray-700">
                <p>📍 Within {distance} km of your location</p>
                <p>💰 Minimum budget: ₹{minBudget}</p>
                {selectedCategories.includes('all') ? (
                  <p>✨ Showing all categories</p>
                ) : (
                  <p>📂 {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'}</p>
                )}
                {customSkills.length > 0 && (
                  <p>⚡ {customSkills.length} custom skill{customSkills.length === 1 ? '' : 's'}</p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 rounded-lg border-2 border-gray-300 font-bold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="flex-1 bg-[#CDFF00] text-black py-4 rounded-lg font-bold hover:bg-[#CDFF00]/90 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Setting up...' : 'Start Earning! 🎉'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}