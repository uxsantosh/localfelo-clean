import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, IndianRupee, Phone, ChevronRight, Tag, X, Search, ArrowRight } from 'lucide-react';
import { getAllServiceCategories, getSubcategoriesByCategoryId, getCategoryEmojiById, getCategoryNameById, getSubcategoryName } from '../services/serviceCategories';
import { notifyMatchingHelpers } from '../services/helperPreferences';
import { supabase } from '../lib/supabaseClient';
import { getTaskCategories, type Category } from '../services/categories';
import { getCitiesWithAreas } from '../services/locations';
import { validateTaskContent, normalizeText } from '../services/contentModeration';
import { toast } from 'sonner@2.0.3';

interface CreateSmartTaskScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  userDisplayName: string;
  userId: string;
  globalLocation: { 
    latitude: number; 
    longitude: number; 
    address: string;
    area?: string;
    city?: string;
  } | null;
  initialQuery?: string;
  selectedCategory?: string;
  onLocationClick?: () => void;
  editMode?: boolean;
  taskId?: string;
  task?: any;
}

export function CreateSmartTaskScreen({
  onBack,
  onSuccess,
  userDisplayName,
  userId,
  globalLocation,
  initialQuery,
  selectedCategory,
  onLocationClick,
  editMode,
  taskId,
  task,
}: CreateSmartTaskScreenProps) {
  const [step, setStep] = useState(initialQuery && initialQuery.trim().length >= 10 ? 2 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentErrors, setContentErrors] = useState<string[]>([]);
  const [contentWarnings, setContentWarnings] = useState<string[]>([]);

  // Form data
  const [taskInput, setTaskInput] = useState(initialQuery || '');
  const [budget, setBudget] = useState<number>(0);
  const [contactNumber, setContactNumber] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  
  // ✅ NEW: Category + Subcategory selection (MANUAL ONLY)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [expandedCategoryId, setExpandedCategoryId] = useState<string>(''); // Track which category is expanded
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Quick budget amounts
  const quickBudgets = [20, 30, 50, 100, 200, 500];

  // Task categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [defaultCityId, setDefaultCityId] = useState<string>('');
  const [defaultAreaId, setDefaultAreaId] = useState<string>('');

  const allServiceCategories = getAllServiceCategories();

  useEffect(() => {
    const fetchData = async () => {
      const categories = await getTaskCategories();
      setCategories(categories);

      const cities = await getCitiesWithAreas();
      if (cities.length > 0) {
        setDefaultCityId(cities[0].id);
        if (cities[0].areas && cities[0].areas.length > 0) {
          setDefaultAreaId(cities[0].areas[0].id);
        }
      }
    };

    fetchData();
  }, []);

  // Pre-fill form when editing
  useEffect(() => {
    if (editMode && task) {
      console.log('📝 [CreateSmartTaskScreen] Pre-filling edit mode with task:', task);
      
      setTaskInput(task.title || '');
      setBudget(task.price || 0);
      setContactNumber(task.phone || task.whatsapp || '');
      setFullAddress(task.address || '');
      setSelectedCategoryId(task.detected_category || '');
      setSelectedSubcategoryId(task.subcategory || '');
      
      setStep(4);
    }
  }, [editMode, task]);

  // Pre-fill selected category from Home screen
  useEffect(() => {
    if (selectedCategory) {
      console.log('✅ [CreateSmartTaskScreen] Pre-filling category from Home:', selectedCategory);
      setSelectedCategoryId(selectedCategory);
    }
  }, [selectedCategory]);

  const handleTaskInputChange = (value: string) => {
    setTaskInput(value);
    
    if (value.trim().length > 10) {
      const validation = validateTaskContent(value, '');
      setContentErrors(validation.errors);
      setContentWarnings(validation.warnings);
    } else {
      setContentErrors([]);
      setContentWarnings([]);
    }
  };

  const handleContinueFromStep1 = () => {
    const validation = validateTaskContent(taskInput, '');
    
    if (!validation.isValid) {
      setContentErrors(validation.errors);
      alert(validation.errors.join('\n'));
      return;
    }
    
    if (validation.warnings.length > 0) {
      setContentWarnings(validation.warnings);
    }
    
    setStep(2); // Go to category selection
  };

  const handleCategorySelected = (categoryId: string) => {
    if (expandedCategoryId === categoryId) {
      // If already expanded, collapse it
      setExpandedCategoryId('');
    } else {
      // Expand this category to show subcategories
      setExpandedCategoryId(categoryId);
      setSelectedCategoryId(categoryId);
      setSelectedSubcategoryId(''); // Reset subcategory when changing category
    }
  };

  const handleSubcategorySelected = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
    setStep(3); // Go to budget selection
  };

  const handleSubmit = async () => {
    if (!taskInput.trim()) return;
    if (!globalLocation) return;
    if (!selectedCategoryId) {
      alert('Please select a category');
      return;
    }
    if (!selectedSubcategoryId) {
      alert('Please select a subcategory');
      return;
    }
    if (categories.length === 0) {
      alert('Categories not loaded. Please try again.');
      return;
    }

    const validation = validateTaskContent(taskInput, '');
    if (!validation.isValid) {
      alert('Please fix content issues:\n' + validation.errors.join('\n'));
      setStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const normalized = normalizeText(taskInput.trim());
      const finalTaskText = normalized.corrected;

      const categoryId = categories[0]?.id || 'default';

      const taskData = {
        title: finalTaskText,
        description: '',
        category_id: categoryId,
        detected_category: selectedCategoryId,
        subcategory: selectedSubcategoryId,
        city_id: defaultCityId,
        area_id: defaultAreaId,
        price: budget,
        is_negotiable: false,
        phone: contactNumber || '',
        has_whatsapp: !!contactNumber,
        whatsapp: contactNumber || '',
        address: fullAddress.trim() || null,
        latitude: globalLocation.latitude,
        longitude: globalLocation.longitude,
        status: 'open',
        is_hidden: false,
      };

      if (editMode && taskId) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', taskId)
          .eq('user_id', userId);

        if (error) throw error;

        console.log('✅ Task updated successfully');
        toast.success('Task updated successfully!');
        onSuccess();
      } else {
        const { data: newTask, error } = await supabase
          .from('tasks')
          .insert({
            user_id: userId,
            ...taskData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          if (error.message && error.message.includes('task_classifications')) {
            console.warn('Task classifications RLS error (non-critical):', error);
            const { data: fetchedTask } = await supabase
              .from('tasks')
              .select()
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            
            if (fetchedTask) {
              console.log('Task created successfully despite classification error');
              toast.success('Task posted successfully!');
              onSuccess();
              return;
            }
          }
          throw error;
        }

        if (newTask) {
          notifyMatchingHelpers(newTask.id, {
            title: finalTaskText,
            category: selectedCategoryId,
            latitude: globalLocation.latitude,
            longitude: globalLocation.longitude,
            budget: budget,
          }).catch(err => console.error('Failed to notify helpers:', err));
        }

        toast.success('Task posted successfully!');
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert(`Failed to ${editMode ? 'update' : 'create'} task. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">{editMode ? 'Edit Task' : 'Post a Task'}</h1>
          <div className="w-9" />
        </div>

        <div className="flex px-4 pb-3">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full mx-1 transition-colors ${
                s <= step ? 'bg-[#CDFF00]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-1 leading-tight">What do you need help with?</h2>
              <p className="text-gray-600 text-sm leading-snug">
                Describe your task in your own words. Be as detailed as possible.
              </p>
            </div>

            <div className="relative">
              <textarea
                value={taskInput}
                onChange={(e) => handleTaskInputChange(e.target.value)}
                placeholder="E.g., Need help with luggage from bus stop, Bring food from home to office, Looking for a plumber to fix leaking tap..."
                className="w-full p-4 pb-14 border-2 border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-[#CDFF00] focus:border-[#CDFF00] text-base"
                rows={6}
                maxLength={500}
                autoFocus
              />

              {/* Character count and Continue button - INSIDE textarea at bottom */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-white/80 backdrop-blur-sm py-2 px-2 rounded-lg">
                <span className="text-xs text-gray-500 font-medium">
                  {taskInput.length}/500
                </span>
                
                {/* Small Continue button - always visible, changes color based on state */}
                <button
                  type="button"
                  onClick={handleContinueFromStep1}
                  disabled={taskInput.trim().length < 10}
                  className={`px-5 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                    taskInput.trim().length >= 10
                      ? 'bg-[#CDFF00] text-black hover:bg-[#CDFF00]/90 shadow-md'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                  }`}
                  title={taskInput.trim().length < 10 ? 'Please enter at least 10 characters' : 'Continue to next step'}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {contentErrors.length > 0 && (
              <div className="text-sm text-red-500">
                {contentErrors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}

            {contentWarnings.length > 0 && (
              <div className="text-sm text-orange-500">
                {contentWarnings.map((warning, index) => (
                  <p key={index}>{warning}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-5 h-5 text-[#CDFF00]" />
                <h2 className="text-xl font-bold">Select Category</h2>
              </div>
              <p className="text-gray-600 text-sm">
                Choose the main category for your task
              </p>
            </div>

            {selectedCategoryId && selectedSubcategoryId && (
              <div className="p-4 bg-[#CDFF00]/10 rounded-lg border border-[#CDFF00]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCategoryEmojiById(selectedCategoryId)}</span>
                  <div>
                    <p className="font-semibold">{getCategoryNameById(selectedCategoryId)}</p>
                    <p className="text-sm text-gray-600">
                      {getSubcategoryName(selectedCategoryId, selectedSubcategoryId)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategoryId('');
                    setSelectedSubcategoryId('');
                    setExpandedCategoryId('');
                  }}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:border-[#CDFF00] focus:ring-2 focus:ring-[#CDFF00]/20 outline-none text-black placeholder-gray-400"
              />
              {categorySearchQuery && (
                <button
                  onClick={() => setCategorySearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {allServiceCategories.filter(cat => {
                if (!categorySearchQuery) return true;
                const query = categorySearchQuery.toLowerCase().trim();
                const subcategories = getSubcategoriesByCategoryId(cat.id);
                
                // Helper function: Match only if a WORD STARTS with the query
                const smartMatch = (text: string) => {
                  const lowerText = text.toLowerCase();
                  // Split by spaces, commas, slashes, and other separators
                  const words = lowerText.split(/[\s,/\-()]+/).filter(w => w.length > 0);
                  // Check if ANY word starts with the query
                  return words.some(word => word.startsWith(query));
                };
                
                return (
                  smartMatch(cat.name) ||
                  smartMatch(cat.emoji) ||
                  subcategories.some(sub => smartMatch(sub.name))
                );
              }).map((cat) => {
                const isExpanded = expandedCategoryId === cat.id;
                const isSelected = selectedCategoryId === cat.id;
                const subcategories = getSubcategoriesByCategoryId(cat.id);
                
                return (
                  <div key={cat.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Category Header - Yellow background when selected */}
                    <button
                      onClick={() => handleCategorySelected(cat.id)}
                      className={`w-full p-4 text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#CDFF00]'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.emoji}</span>
                        <span className="font-bold text-black">{cat.name}</span>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-black transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Subcategories (expandable) - White background */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-white">
                        {subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleSubcategorySelected(sub.id)}
                            className={`w-full px-6 py-3 text-left transition-all border-b border-gray-100 last:border-b-0 ${
                              selectedSubcategoryId === sub.id
                                ? 'bg-gray-100 text-black font-semibold'
                                : 'bg-white hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-lg border-2 border-gray-300 font-bold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="w-5 h-5 text-[#CDFF00]" />
                <h2 className="text-xl font-bold">What's your budget?</h2>
              </div>
              <p className="text-gray-600 text-sm">
                Set a budget to attract the right helpers
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Selected Category:</p>
              <p className="font-semibold">
                {getCategoryEmojiById(selectedCategoryId)} {getCategoryNameById(selectedCategoryId)}
                {selectedSubcategoryId && ` • ${getSubcategoryName(selectedCategoryId, selectedSubcategoryId)}`}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {quickBudgets.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBudget(amount)}
                  className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                    budget === amount
                      ? 'border-[#CDFF00] bg-[#CDFF00]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Or enter custom amount
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={budget || ''}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 rounded-lg border-2 border-gray-300 font-bold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={budget <= 0}
                className="flex-1 bg-[#CDFF00] text-black py-4 rounded-lg font-bold hover:bg-[#CDFF00]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-5 h-5 text-[#CDFF00]" />
                <h2 className="text-xl font-bold">Contact details</h2>
              </div>
              <p className="text-gray-600 text-sm">
                How should helpers contact you?
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+91-XXXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Helpers can also message you in-app
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Location
              </label>
              <button
                type="button"
                onClick={() => {
                  toast.info('Opening location picker...');
                  if (onLocationClick) {
                    onLocationClick();
                  }
                }}
                className="w-full p-4 bg-white border border-gray-300 rounded-lg hover:border-[#CDFF00] transition-colors text-left"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-[#CDFF00] mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">
                      {globalLocation?.area || globalLocation?.city
                        ? `${globalLocation.area || globalLocation.city}, ${globalLocation.city}`
                        : 'Set Location'}
                    </p>
                    {globalLocation?.address && (
                      <p className="text-xs text-gray-500 mt-1">{globalLocation.address}</p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Full Address (Optional)
              </label>
              <textarea
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="Building name, floor, street details...
E.g., Flat #101, Green Apartment, Main Road
Near City Hospital"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Add door-level details if needed
              </p>
            </div>

            <div className="p-4 bg-[#CDFF00]/10 rounded-lg border border-[#CDFF00]/20 space-y-2">
              <p className="text-sm font-semibold text-gray-700">Task Summary</p>
              <p className="text-sm text-gray-600">{taskInput}</p>
              <p className="text-sm">
                <span className="font-semibold">Category:</span> {getCategoryEmojiById(selectedCategoryId)} {getCategoryNameById(selectedCategoryId)}
                {selectedSubcategoryId && ` • ${getSubcategoryName(selectedCategoryId, selectedSubcategoryId)}`}
              </p>
              <p className="text-sm font-bold">Budget: ₹{budget}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-4 rounded-lg border-2 border-gray-300 font-bold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-[#CDFF00] text-black py-4 rounded-lg font-bold hover:bg-[#CDFF00]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting 
                  ? (editMode ? 'Updating...' : 'Posting...') 
                  : (editMode ? 'Update Task' : 'Post Task')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}