import { useState, useEffect } from 'react';
import { 
  Plus, MapPin, X, Check, ChevronDown, Search, Sliders, Loader2
} from 'lucide-react';
import { HELPER_TASK_CATEGORIES, DISTANCE_OPTIONS } from '../constants/helperCategories';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { calculateDistance } from '../utils/distance';
import { Header } from '../components/Header';
import { TaskCard } from '../components/TaskCard';
import { Task as TaskType } from '../types';

interface HelperPreferences {
  selected_categories: string[];
  selected_sub_skills: string[];
  max_distance: number;
  is_available: boolean;
}

interface UnifiedTasksScreenProps {
  user: any;
  onNavigate: (screen: string, data?: any) => void;
  isLoggedIn?: boolean;
  userDisplayName?: string;
  onMenuClick?: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
  userCoordinates: { latitude: number; longitude: number } | null;
  onLoginRequired?: () => void;
  globalLocationArea?: string;
  globalLocationCity?: string;
  onLocationClick?: () => void;
  onGlobalSearchClick?: () => void;
  unreadCount?: number;
  showCategorySelectionOnMount?: boolean;
}

export function UnifiedTasksScreen({
  user,
  onNavigate,
  isLoggedIn,
  userDisplayName,
  onMenuClick,
  notificationCount,
  onNotificationClick,
  userCoordinates,
  onLoginRequired,
  globalLocationArea,
  globalLocationCity,
  onLocationClick,
  onGlobalSearchClick,
  unreadCount,
  showCategorySelectionOnMount = false
}: UnifiedTasksScreenProps) {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [helperPreferences, setHelperPreferences] = useState<HelperPreferences | null>(null);
  
  // Modals
  const [showFilterModal, setShowFilterModal] = useState(showCategorySelectionOnMount);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubSkills, setSelectedSubSkills] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [sortBy, setSortBy] = useState<'distance' | 'newest' | 'price'>('distance');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Load helper preferences on mount
  useEffect(() => {
    if (user?.id) {
      loadHelperPreferences();
    }
  }, [user?.id]);

  // Load tasks when filters change
  useEffect(() => {
    loadTasks();
  }, [userCoordinates, selectedCategories, selectedSubSkills, maxDistance, sortBy]);

  const loadHelperPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('helper_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading helper preferences:', error);
        return;
      }

      if (data) {
        setHelperPreferences(data);
        setMaxDistance(data.max_distance || 10);
      } else {
        setHelperPreferences(null);
        setSelectedCategories([]);
        setSelectedSubSkills([]);
        setMaxDistance(10);
      }
    } catch (error) {
      console.error('Error loading helper preferences:', error);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          task_classifications (
            detected_categories
          ),
          profiles!tasks_user_id_fkey (
            name,
            phone,
            avatar
          ),
          area:areas!tasks_area_id_fkey (
            name
          ),
          city:cities!tasks_city_id_fkey (
            name
          )
        `)
        .eq('is_hidden', false)
        .not('status', 'in', '(completed,closed)');

      if (user?.id) {
        query = query.neq('user_id', user.id);
      }

      const { data: tasksData, error } = await query;

      if (error) throw error;

      let processedTasks: TaskType[] = (tasksData || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        price: task.price,
        isNegotiable: task.is_negotiable,
        latitude: task.latitude,
        longitude: task.longitude,
        created_at: task.created_at,
        user_id: task.user_id,
        status: task.status,
        detected_categories: task.task_classifications?.detected_categories || [],
        userName: task.profiles?.name,
        userPhone: task.profiles?.phone,
        userAvatar: task.profiles?.avatar,
        images: task.images || [],
        areaName: task.area?.name,
        cityName: task.city?.name,
        address: task.address,
      }));

      // Calculate distances
      if (userCoordinates) {
        processedTasks = processedTasks.map(task => ({
          ...task,
          distance: task.latitude && task.longitude
            ? calculateDistance(
                userCoordinates.latitude,
                userCoordinates.longitude,
                task.latitude,
                task.longitude
              )
            : undefined
        }));
      }

      // Filter by categories
      if (selectedCategories.length > 0) {
        processedTasks = processedTasks.filter(task => {
          const matchesCategory = task.detected_categories?.some(cat => 
            selectedCategories.includes(cat)
          );
          
          if (selectedSubSkills.length > 0 && matchesCategory) {
            const nonOtherSubSkills = selectedSubSkills.filter(skill => skill.toLowerCase() !== 'other');
            
            if (nonOtherSubSkills.length > 0) {
              const taskText = `${task.title} ${task.description}`.toLowerCase();
              const matchesSubSkill = nonOtherSubSkills.some(subSkill =>
                taskText.includes(subSkill.toLowerCase())
              );
              return matchesSubSkill;
            }
          }
          
          return matchesCategory;
        });
      }

      // Filter by distance
      if (userCoordinates && maxDistance) {
        processedTasks = processedTasks.filter(task => 
          task.distance !== undefined && task.distance <= maxDistance
        );
      }

      // Sort tasks
      processedTasks.sort((a, b) => {
        if (sortBy === 'distance') {
          if (!a.distance) return 1;
          if (!b.distance) return -1;
          return a.distance - b.distance;
        } else if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (sortBy === 'price') {
          return (b.price || 0) - (a.price || 0);
        }
        return 0;
      });

      setTasks(processedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const toggleHelperMode = async () => {
    if (!user) {
      if (onLoginRequired) onLoginRequired();
      return;
    }

    if (!helperPreferences) {
      setShowFilterModal(true);
      return;
    }

    try {
      const newAvailability = !helperPreferences.is_available;
      const { error } = await supabase
        .from('helper_preferences')
        .update({ 
          is_available: newAvailability,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setHelperPreferences({
        ...helperPreferences,
        is_available: newAvailability
      });

      toast.success(newAvailability ? '✅ Helper mode ON' : '⚪ Helper mode OFF');
    } catch (error) {
      console.error('Error toggling helper mode:', error);
      toast.error('Failed to toggle helper mode');
    }
  };

  const applyFilters = async () => {
    if (!user) {
      // For non-logged-in users, just apply filters locally
      setShowFilterModal(false);
      await loadTasks();
      toast.success('✅ Filters applied');
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    try {
      const { error } = await supabase
        .from('helper_preferences')
        .upsert({
          user_id: user.id,
          selected_categories: selectedCategories,
          selected_sub_skills: selectedSubSkills,
          max_distance: maxDistance,
          is_available: true,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('✅ Filters saved & applied!');
      setShowFilterModal(false);
      await loadHelperPreferences();
      await loadTasks();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        // Remove category and all its sub-skills
        const category = HELPER_TASK_CATEGORIES.find(cat => cat.id === categoryId);
        if (category) {
          setSelectedSubSkills(prevSkills => 
            prevSkills.filter(skill => !category.subSkills.includes(skill))
          );
        }
        return prev.filter(c => c !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const toggleSubSkill = (categoryId: string, subSkill: string) => {
    setSelectedSubSkills(prev => {
      if (prev.includes(subSkill)) {
        const newSubSkills = prev.filter(s => s !== subSkill);
        
        // Check if category has any remaining sub-skills
        const category = HELPER_TASK_CATEGORIES.find(cat => cat.id === categoryId);
        if (category) {
          const remainingSubSkills = newSubSkills.filter(skill => 
            category.subSkills.includes(skill)
          );
          
          // If no sub-skills remain, uncheck the category
          if (remainingSubSkills.length === 0 && selectedCategories.includes(categoryId)) {
            setSelectedCategories(prevCats => prevCats.filter(c => c !== categoryId));
          }
        }
        
        return newSubSkills;
      } else {
        // Add sub-skill and ensure category is selected
        if (!selectedCategories.includes(categoryId)) {
          setSelectedCategories(prevCats => [...prevCats, categoryId]);
        }
        return [...prev, subSkill];
      }
    });
  };

  const clearAllFilters = async () => {
    setSelectedCategories([]);
    setSelectedSubSkills([]);
    setHelperPreferences(null);
    
    if (user?.id) {
      try {
        await supabase
          .from('helper_preferences')
          .delete()
          .eq('user_id', user.id);

        toast.success('✅ All filters cleared');
        setShowFilterModal(false);
        await loadTasks();
      } catch (error) {
        console.error('Error clearing filters:', error);
        toast.error('Failed to clear filters');
      }
    } else {
      toast.success('✅ All filters cleared');
      setShowFilterModal(false);
      await loadTasks();
    }
  };

  const handleTaskClick = (task: TaskType) => {
    onNavigate('task-detail', { taskId: task.id });
  };

  const getSelectedSkillsInCategory = (categoryId: string) => {
    const category = HELPER_TASK_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return 0;
    return selectedSubSkills.filter(skill => category.subSkills.includes(skill)).length;
  };

  const filteredCategories = HELPER_TASK_CATEGORIES.filter(category => {
    if (!categorySearchQuery) return true;
    const query = categorySearchQuery.toLowerCase().trim();
    
    const smartMatch = (text: string) => {
      const lowerText = text.toLowerCase();
      const words = lowerText.split(/[\s,/\-()]+/).filter(w => w.length > 0);
      return words.some(word => word.startsWith(query));
    };
    
    return (
      smartMatch(category.name) ||
      smartMatch(category.description) ||
      category.subSkills.some(skill => smartMatch(skill))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <Header
        title="Available Tasks"
        currentScreen="tasks"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn || false}
        userDisplayName={userDisplayName}
        onMenuClick={onMenuClick}
        unreadCount={unreadCount}
        showGlobalLocation={true}
        globalLocationArea={globalLocationArea}
        globalLocationCity={globalLocationCity}
        onLocationClick={onLocationClick}
        notificationCount={notificationCount}
        onNotificationClick={onNotificationClick}
        onGlobalSearchClick={onGlobalSearchClick}
      />

      {/* Toolbar */}
      <div className="bg-white border-b-2 border-gray-200 sticky top-[60px] z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Main Actions Row */}
          <div className="flex items-center justify-between gap-3">
            {/* Left Side - Helper Toggle + Filters */}
            <div className="flex items-center gap-2">
              {/* Helper Mode Toggle */}
              <button
                onClick={toggleHelperMode}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  helperPreferences?.is_available
                    ? 'bg-[#CDFF00] text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {helperPreferences?.is_available ? 'Helper ON' : 'Turn On Helper'}
                </span>
                <span className="sm:hidden">Helper</span>
              </button>

              {/* Filters Button */}
              <button
                onClick={() => {
                  if (helperPreferences) {
                    setSelectedCategories(helperPreferences.selected_categories || []);
                    setSelectedSubSkills(helperPreferences.selected_sub_skills || []);
                    setMaxDistance(helperPreferences.max_distance || 10);
                  }
                  setShowFilterModal(true);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  selectedCategories.length > 0
                    ? 'bg-[#CDFF00] text-black border-2 border-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {selectedCategories.length > 0 && (
                  <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {selectedCategories.length}
                  </span>
                )}
              </button>

              {/* Distance Badge */}
              {userCoordinates && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-lg text-sm">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700 font-medium">{maxDistance}km</span>
                </div>
              )}
            </div>

            {/* Right Side - Sort + Post */}
            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-[#CDFF00] cursor-pointer"
              >
                <option value="distance">Nearest</option>
                <option value="newest">Newest</option>
                <option value="price">Highest ₹</option>
              </select>

              {/* Post Task */}
              <button
                onClick={() => {
                  if (!isLoggedIn && onLoginRequired) {
                    onLoginRequired();
                    return;
                  }
                  onNavigate('create-task');
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#CDFF00] hover:bg-[#b8e600] text-black font-bold rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Post Task</span>
                <span className="sm:hidden">Post</span>
              </button>
            </div>
          </div>

          {/* Active Filters Pills */}
          {selectedCategories.length > 0 && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {selectedCategories.slice(0, 3).map(catId => {
                const cat = HELPER_TASK_CATEGORIES.find(c => c.id === catId);
                return cat ? (
                  <span
                    key={catId}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#CDFF00] rounded-full text-xs font-bold text-black"
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </span>
                ) : null;
              })}
              {selectedCategories.length > 3 && (
                <span className="text-xs text-gray-600 font-medium">
                  +{selectedCategories.length - 3} more
                </span>
              )}
              {selectedSubSkills.length > 0 && (
                <span className="text-xs text-gray-600 font-medium">
                  • {selectedSubSkills.length} sub-skills
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading tasks...
              </span>
            ) : (
              <>
                <span className="font-bold text-black">{tasks.length}</span> tasks found
              </>
            )}
          </p>
          {!userCoordinates && (
            <button
              onClick={onLocationClick}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              📍 Set location for distance
            </button>
          )}
        </div>

        {/* Tasks List or Empty State */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Loader2 className="animate-spin h-12 w-12 text-[#CDFF00] mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-black mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {selectedCategories.length > 0
                ? 'No tasks match your filters. Try adjusting categories or increase distance.'
                : 'No tasks available in your area right now. Check back later!'}
            </p>
            {selectedCategories.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-[#CDFF00] text-black font-bold rounded-lg hover:bg-[#b8e600] transition-all"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => handleTaskClick(task)}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b-2 border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-black">Task Filters</h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  Select categories, skills, and distance preferences
                </p>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Distance Selection */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <label className="block text-sm font-bold text-black mb-3">
                Maximum Distance
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {DISTANCE_OPTIONS.map((distance) => (
                  <button
                    key={distance}
                    onClick={() => setMaxDistance(distance)}
                    className={`py-2.5 px-3 rounded-lg font-bold text-sm transition-all ${
                      maxDistance === distance
                        ? 'bg-[#CDFF00] text-black border-2 border-black scale-105'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {distance}km
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-3 bg-white border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories or skills..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg focus:border-[#CDFF00] focus:ring-2 focus:ring-[#CDFF00]/20 outline-none text-black placeholder-gray-400"
                />
                {categorySearchQuery && (
                  <button
                    onClick={() => setCategorySearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories List - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-3">
                {filteredCategories.map((category) => {
                  const selectedSubSkillCount = getSelectedSkillsInCategory(category.id);
                  const isCategorySelected = selectedCategories.includes(category.id);
                  const isExpanded = expandedCategory === category.id;

                  return (
                    <div
                      key={category.id}
                      className={`border-2 rounded-xl overflow-hidden transition-all ${
                        isCategorySelected ? 'border-[#CDFF00] bg-[#CDFF00]/5' : 'border-gray-200 bg-white'
                      }`}
                    >
                      {/* Category Header with Checkbox */}
                      <div className="p-4 flex items-start gap-3">
                        {/* Checkbox */}
                        <label className="flex items-center cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={isCategorySelected}
                            onChange={() => toggleCategory(category.id)}
                            className="w-5 h-5 rounded border-2 border-gray-400 text-[#CDFF00] focus:ring-2 focus:ring-[#CDFF00] cursor-pointer"
                          />
                        </label>

                        {/* Category Info */}
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => toggleCategory(category.id)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{category.emoji}</span>
                            <h3 className="text-base font-bold text-black">{category.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600">{category.description}</p>
                          {selectedSubSkillCount > 0 && (
                            <div className="mt-2 inline-block">
                              <span className="text-xs font-bold text-black px-2 py-1 bg-[#FFFACD] rounded">
                                ✓ {selectedSubSkillCount} specific {selectedSubSkillCount === 1 ? 'skill' : 'skills'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Expand Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCategory(isExpanded ? null : category.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronDown
                            className={`w-5 h-5 text-gray-600 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Sub-skills - Expandable */}
                      {isExpanded && (
                        <div className="border-t-2 border-gray-200 bg-gray-50 px-4 py-3">
                          <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
                            Specific Sub-Skills (Optional)
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {category.subSkills.map((subSkill) => {
                              const isSubSkillSelected = selectedSubSkills.includes(subSkill);
                              return (
                                <label
                                  key={subSkill}
                                  className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all ${
                                    isSubSkillSelected
                                      ? 'bg-[#FFFACD] border-2 border-[#CDFF00]'
                                      : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSubSkillSelected}
                                    onChange={() => toggleSubSkill(category.id, subSkill)}
                                    className="w-4 h-4 rounded border-2 border-gray-400 text-[#CDFF00] focus:ring-2 focus:ring-[#CDFF00] cursor-pointer"
                                  />
                                  <span className={`text-sm ${isSubSkillSelected ? 'font-bold text-black' : 'text-gray-700'}`}>
                                    {subSkill}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">No categories found matching "{categorySearchQuery}"</p>
                </div>
              )}
            </div>

            {/* Modal Footer - Actions */}
            <div className="px-6 py-4 border-t-2 border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-all"
              >
                Clear All
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  disabled={selectedCategories.length === 0}
                  className="px-8 py-2.5 bg-[#CDFF00] text-black font-bold rounded-lg hover:bg-[#b8e600] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Apply Filters ({selectedCategories.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
