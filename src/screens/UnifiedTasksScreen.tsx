import { useState, useEffect } from 'react';
import { 
  Plus, MapPin, Settings, Power, PowerOff, Loader2, X, Check, ChevronDown, Search 
} from 'lucide-react';
import { HELPER_TASK_CATEGORIES, DISTANCE_OPTIONS } from '../constants/helperCategories';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { calculateDistance } from '../utils/distance';
import { Header } from '../components/Header';

interface Task {
  id: string;
  title: string;
  description: string;
  price: number;
  latitude: number;
  longitude: number;
  created_at: string;
  user_id: string;
  status?: string;
  detected_categories?: string[];
  distance?: number;
  userName?: string;
  userPhone?: string;
}

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
  showCategorySelectionOnMount?: boolean; // TRUE when coming from "Turn On" button
}

const DISTANCE_OPTIONS = [1, 3, 5, 10, 25, 50, 100];

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [helperPreferences, setHelperPreferences] = useState<HelperPreferences | null>(null);
  
  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(showCategorySelectionOnMount);
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  
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
      console.log('🔵 LOADING HELPER PREFERENCES for user:', user.id);
      
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
        console.log('🔵 Found helper preferences:', data);
        setHelperPreferences(data);
        // Pre-select categories from helper preferences
        setSelectedCategories(data.selected_categories || []);
        setSelectedSubSkills(data.selected_sub_skills || []);
        setMaxDistance(data.max_distance || 10);
      } else {
        // No data found - clear everything
        console.log('🔵 No helper preferences found - clearing all state');
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
      // Query tasks with classifications
      let query = supabase
        .from('tasks')
        .select(`
          *,
          task_classifications (
            detected_categories
          ),
          profiles!tasks_user_id_fkey (
            name,
            phone
          )
        `)
        .eq('is_hidden', false)
        .or('status.is.null,status.eq.open');

      // Don't show user's own tasks
      if (user?.id) {
        query = query.neq('user_id', user.id);
      }

      const { data: tasksData, error } = await query;

      if (error) throw error;

      let processedTasks: Task[] = (tasksData || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        price: task.price,
        latitude: task.latitude,
        longitude: task.longitude,
        created_at: task.created_at,
        user_id: task.user_id,
        status: task.status,
        detected_categories: task.detected_category ? [task.detected_category] : [], // ✅ FIX: Use detected_category field directly, make it an array
        userName: task.profiles?.name,
        userPhone: task.profiles?.phone,
      }));

      // Calculate distances if user coordinates available
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

      // Filter by selected categories AND sub-skills
      if (selectedCategories.length > 0) {
        processedTasks = processedTasks.filter(task => {
          // Check if task matches selected categories
          const matchesCategory = task.detected_categories?.some(cat => 
            selectedCategories.includes(cat)
          );
          
          // If sub-skills are selected, check task description/title
          // Exclude "Other" from sub-skill filtering - it's just a fallback option
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

      // Filter by max distance
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
      // Show category selection
      setShowCategoryModal(true);
      return;
    }

    // Toggle availability
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

  const saveHelperPreferences = async () => {
    if (!user) {
      if (onLoginRequired) onLoginRequired();
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

      toast.success('✅ Helper preferences saved!');
      setShowCategoryModal(false);
      loadHelperPreferences();
      loadTasks();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const toggleCategory = (categoryId: string) => {
    const isCurrentlySelected = selectedCategories.includes(categoryId);
    
    if (isCurrentlySelected) {
      // Deselecting main category: Remove it AND all its sub-skills
      setSelectedCategories(prev => prev.filter(c => c !== categoryId));
      
      // Find and remove all sub-skills belonging to this category
      const category = HELPER_TASK_CATEGORIES.find(cat => cat.id === categoryId);
      if (category) {
        setSelectedSubSkills(prev => 
          prev.filter(skill => !category.subSkills.includes(skill))
        );
      }
    } else {
      // Selecting main category: Just add it
      setSelectedCategories(prev => [...prev, categoryId]);
    }
  };

  const toggleSubSkill = (categoryId: string, subSkill: string) => {
    const isCurrentlySelected = selectedSubSkills.includes(subSkill);
    
    if (isCurrentlySelected) {
      // Deselecting a sub-skill
      const newSubSkills = selectedSubSkills.filter(s => s !== subSkill);
      setSelectedSubSkills(newSubSkills);
      
      // Check if this category has any remaining sub-skills selected
      const category = HELPER_TASK_CATEGORIES.find(cat => cat.id === categoryId);
      if (category) {
        const remainingSubSkillsForCategory = newSubSkills.filter(skill => 
          category.subSkills.includes(skill)
        );
        
        // If no sub-skills remain for this category, deselect the main category
        if (remainingSubSkillsForCategory.length === 0) {
          setSelectedCategories(prev => prev.filter(c => c !== categoryId));
        }
      }
    } else {
      // Selecting a sub-skill: Add it and ensure main category is selected
      setSelectedSubSkills(prev => [...prev, subSkill]);
      
      if (!selectedCategories.includes(categoryId)) {
        setSelectedCategories(prev => [...prev, categoryId]);
      }
    }
  };

  const clearAllFilters = async () => {
    console.log('🔴 CLEAR ALL FILTERS CALLED');
    
    // Clear UI state immediately
    setSelectedCategories([]);
    setSelectedSubSkills([]);
    setHelperPreferences(null);
    
    // If user is logged in, also clear backend preferences
    if (user?.id) {
      try {
        console.log('🔴 Deleting from database for user:', user.id);
        
        // Delete the existing record
        const { data: deleteData, error: deleteError } = await supabase
          .from('helper_preferences')
          .delete()
          .eq('user_id', user.id)
          .select(); // Add select to see what was deleted

        console.log('🔴 Delete result:', { deleteData, deleteError });

        if (deleteError) {
          console.error('❌ Delete error:', deleteError);
          toast.error('Failed to clear filters: ' + deleteError.message);
          return;
        }

        console.log('✅ Database cleared successfully');
        toast.success('✅ All filters cleared');

        // Close the modal if it's open
        setShowCategoryModal(false);
        
        // Reload tasks to show all tasks
        await loadTasks();
      } catch (error) {
        console.error('❌ Error clearing filters:', error);
        toast.error('Failed to clear filters');
      }
    } else {
      // For non-logged-in users, just reload tasks
      toast.success('✅ All filters cleared');
      setShowCategoryModal(false);
      await loadTasks();
    }
  };

  const handleTaskClick = async (task: Task) => {
    // Navigate to task detail
    onNavigate('task-detail', { taskId: task.id });
  };

  const getSelectedSkillsInCategory = (categoryId: string) => {
    const category = HELPER_TASK_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return 0;
    return selectedSubSkills.filter(skill => category.subSkills.includes(skill)).length;
  };

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

      {/* Action Bar - Sticky */}
      <div className="bg-white border-b-2 border-gray-200 sticky top-[60px] z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Helper Mode Toggle + Filters */}
            <div className="flex items-center gap-2 flex-1">
              {/* Helper Mode Toggle */}
              <button
                onClick={toggleHelperMode}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                  helperPreferences?.is_available
                    ? 'bg-[#CDFF00] text-black border-2 border-black'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:border-gray-400'
                }`}
              >
                {helperPreferences?.is_available ? (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>Helper ON</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>Turn On</span>
                  </>
                )}
              </button>

              {/* Category Filter Button */}
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                <MapPin className="w-4 h-4 text-black" />
                <span className="text-black hidden sm:inline">
                  {selectedCategories.length > 0 
                    ? `${selectedCategories.length} categories`
                    : 'Categories'}
                </span>
                {selectedCategories.length > 0 && (
                  <span className="sm:hidden bg-[#CDFF00] text-black text-xs px-2 py-0.5 rounded-full font-bold">
                    {selectedCategories.length}
                  </span>
                )}
              </button>

              {/* Distance Filter */}
              {userCoordinates && (
                <button
                  onClick={() => setShowDistanceModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <MapPin className="w-4 h-4 text-black" />
                  <span className="text-black">{maxDistance}km</span>
                </button>
              )}
            </div>

            {/* Right: Sort + Post Task */}
            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-black border-none focus:ring-2 focus:ring-[#CDFF00] cursor-pointer"
              >
                <option value="distance">Nearest</option>
                <option value="newest">Newest</option>
                <option value="price">Highest ₹</option>
              </select>

              {/* Post Task Button */}
              <button
                onClick={() => {
                  if (!isLoggedIn && onLoginRequired) {
                    onLoginRequired();
                    return;
                  }
                  onNavigate('create-task');
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#CDFF00] hover:bg-[#b8e600] text-black font-bold rounded-lg transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Post</span>
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategories.length > 0 || selectedSubSkills.length > 0) && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-600 font-medium">Active filters:</span>
              {selectedCategories.map(catId => {
                const cat = HELPER_TASK_CATEGORIES.find(c => c.id === catId);
                return cat ? (
                  <span
                    key={catId}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#CDFF00] rounded-full text-xs font-bold text-black"
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </span>
                ) : null;
              })}
              {selectedSubSkills.length > 0 && (
                <span className="text-xs text-gray-600">
                  +{selectedSubSkills.length} sub-skills
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-600 hover:underline font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${tasks.length} tasks available`}
          </p>
          {!userCoordinates && (
            <button
              onClick={onLocationClick}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Set location to see distances
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <MapPin className="animate-spin h-12 w-12 text-[#CDFF00] mx-auto mb-4" />
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-bold text-black mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">
              {selectedCategories.length > 0
                ? 'Try adjusting your category filters or increase distance'
                : 'No tasks available in your area right now'}
            </p>
            {selectedCategories.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-[#CDFF00] text-black font-bold rounded-lg hover:bg-[#b8e600] transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tasks.map((task) => {
              const categories = HELPER_TASK_CATEGORIES.filter(cat =>
                task.detected_categories?.includes(cat.id)
              );

              return (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#CDFF00] hover:shadow-lg transition-all cursor-pointer"
                >
                  {/* Categories Tags */}
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {categories.map(cat => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700"
                        >
                          <span>{cat.emoji}</span>
                          <span className="hidden sm:inline">{cat.name}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title & Description */}
                  <h3 className="font-bold text-black text-base mb-2 line-clamp-2">
                    {task.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {task.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      {/* Price */}
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-bold text-black">
                          ₹{task.price}
                        </span>
                      </div>

                      {/* Distance */}
                      {task.distance !== undefined && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">
                            {task.distance < 1
                              ? `${Math.round(task.distance * 1000)}m`
                              : `${task.distance.toFixed(1)}km`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                      OPEN
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Header - Sticky */}
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-4 flex items-center justify-between z-10">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-black">Select Categories & Skills</h2>
                <p className="text-xs text-gray-600 mt-1">
                  Choose categories and specific sub-skills you can help with
                </p>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Distance Selection - Above categories */}
            <div className="p-4 border-b-2 border-gray-200 bg-gray-50">
              <h3 className="font-bold text-black mb-3 text-sm">How far can you travel?</h3>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {DISTANCE_OPTIONS.map((distance) => (
                  <button
                    key={distance}
                    onClick={() => setMaxDistance(distance)}
                    className={`py-3 rounded-lg font-bold text-sm transition-all ${
                      maxDistance === distance
                        ? 'bg-[#CDFF00] text-black border-2 border-black'
                        : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {distance}km
                  </button>
                ))}
              </div>
            </div>

            {/* Search - STICKY at top */}
            <div className="p-3 pb-2.5 border-b border-gray-100 bg-white sticky top-[72px] z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#CDFF00] focus:ring-2 focus:ring-[#CDFF00]/20 outline-none text-black placeholder-gray-400"
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
            </div>

            {/* Categories - Scrollable - Compact */}
            <div className="p-3 space-y-2 flex-1 overflow-y-auto">
              {HELPER_TASK_CATEGORIES.filter(category => {
                if (!categorySearchQuery) return true;
                const query = categorySearchQuery.toLowerCase().trim();
                
                // Helper function: Match only if a WORD STARTS with the query
                const smartMatch = (text: string) => {
                  const lowerText = text.toLowerCase();
                  // Split by spaces, commas, slashes, and other separators
                  const words = lowerText.split(/[\s,/\-()]+/).filter(w => w.length > 0);
                  // Check if ANY word starts with the query
                  return words.some(word => word.startsWith(query));
                };
                
                return (
                  smartMatch(category.name) ||
                  smartMatch(category.description) ||
                  category.subSkills.some(skill => smartMatch(skill))
                );
              }).map((category) => {
                const selectedSubSkillCount = getSelectedSkillsInCategory(category.id);
                // ✅ FIX: Show as selected if main category is selected OR if any sub-skills are selected
                const isSelected = selectedCategories.includes(category.id) || selectedSubSkillCount > 0;
                const isExpanded = expandedCategory === category.id;

                return (
                  <div
                    key={category.id}
                    className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
                      isSelected ? 'border-[#CDFF00]' : 'border-gray-200'
                    }`}
                  >
                    {/* Category Header - Large tap target */}
                    <div className="flex items-center gap-3 p-4">
                      {/* Checkbox Area - Large tap target */}
                      <div
                        onClick={() => toggleCategory(category.id)}
                        className="flex items-center gap-3 flex-1 cursor-pointer min-h-[60px]"
                      >
                        <div className="text-3xl">{category.emoji}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-black text-base">{category.name}</h3>
                          <p className="text-sm text-gray-600">{category.description}</p>
                          {selectedSubSkillCount > 0 && (
                            <p className="text-xs font-bold text-black mt-1 inline-block px-2 py-0.5 bg-[#FFFACD] rounded">
                              {selectedSubSkillCount} specific {selectedSubSkillCount === 1 ? 'skill' : 'skills'} selected
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="w-7 h-7 bg-[#CDFF00] rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-5 h-5 text-black" />
                          </div>
                        )}
                      </div>

                      {/* Expand Button - Large tap target */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCategory(isExpanded ? null : category.id);
                        }}
                        className="p-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <ChevronDown
                          className={`w-6 h-6 text-gray-600 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* Sub-skills (Expandable) */}
                    {isExpanded && (
                      <div className="border-t-2 border-gray-100 p-4 bg-gray-50">
                        <p className="text-xs font-bold text-gray-500 mb-3 uppercase">
                          Optional: Select specific sub-skills
                        </p>
                        <div className="space-y-2">
                          {category.subSkills.map((subSkill) => {
                            const isSubSkillSelected = selectedSubSkills.includes(subSkill);
                            return (
                              <div
                                key={subSkill}
                                onClick={() => toggleSubSkill(category.id, subSkill)}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                  isSubSkillSelected
                                    ? 'bg-[#FFFACD] border-2 border-[#CDFF00]'
                                    : 'bg-white border-2 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  isSubSkillSelected
                                    ? 'bg-[#CDFF00] border-black'
                                    : 'bg-white border-gray-300'
                                }`}>
                                  {isSubSkillSelected && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
                                </div>
                                <span className={`text-sm ${isSubSkillSelected ? 'font-bold text-black' : 'text-gray-700'}`}>
                                  {subSkill}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer - Sticky */}
            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-4 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-3 bg-gray-100 text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={saveHelperPreferences}
                disabled={selectedCategories.length === 0}
                className="flex-[2] py-3 bg-[#CDFF00] text-black font-bold rounded-lg hover:bg-[#b8e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {helperPreferences ? 'Update & Apply' : 'Save & Apply'} ({selectedCategories.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Distance Filter Modal */}
      {showDistanceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full sm:max-w-md rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-black">Distance Filter</h2>
              <button
                onClick={() => setShowDistanceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {DISTANCE_OPTIONS.map((distance) => (
                <button
                  key={distance}
                  onClick={() => {
                    setMaxDistance(distance);
                    setShowDistanceModal(false);
                  }}
                  className={`py-4 rounded-lg font-bold transition-all ${
                    maxDistance === distance
                      ? 'bg-[#CDFF00] text-black border-2 border-black'
                      : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {distance}km
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}