import { useState, useEffect, useRef } from 'react';
import { Power, MapPin, ChevronDown, ChevronUp, Plus, X, Check, Search } from 'lucide-react';
import { HELPER_TASK_CATEGORIES } from '../constants/helperCategories';
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

interface CleanTasksScreenProps {
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
  helperPreferences?: HelperPreferences | null;
  onHelperPreferencesUpdate?: (preferences: HelperPreferences) => void;
}

const DISTANCE_OPTIONS = [1, 3, 5, 10, 25, 50, 100];

export function CleanTasksScreen({
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
  showCategorySelectionOnMount = false,
  helperPreferences: helperPreferencesProp,
  onHelperPreferencesUpdate
}: CleanTasksScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [helperPreferences, setHelperPreferences] = useState<HelperPreferences | null>(helperPreferencesProp || null);
  
  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(showCategorySelectionOnMount);
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubSkills, setSelectedSubSkills] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Intersection observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 50; // Load 50 at a time for better filtering results

  // Sync with parent's helper preferences
  useEffect(() => {
    if (helperPreferencesProp) {
      setHelperPreferences(helperPreferencesProp);
      setSelectedCategories(helperPreferencesProp.selected_categories || []);
      setSelectedSubSkills(helperPreferencesProp.selected_sub_skills || []);
      setMaxDistance(helperPreferencesProp.max_distance || 10);
    }
  }, [helperPreferencesProp]);

  useEffect(() => {
    if (user?.id && !helperPreferencesProp) {
      loadHelperPreferences();
    }
  }, [user?.id, helperPreferencesProp]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setTasks([]);
    loadTasks(1, true);
  }, [userCoordinates, selectedCategories, selectedSubSkills, maxDistance]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore]);

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
        setSelectedCategories(data.selected_categories || []);
        setSelectedSubSkills(data.selected_sub_skills || []);
        setMaxDistance(data.max_distance || 10);
      }
    } catch (error) {
      console.error('Error loading helper preferences:', error);
    }
  };

  const loadTasks = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      console.log(`🔄 [CleanTasksScreen] Loading page ${pageNum} (${ITEMS_PER_PAGE} items per page)`);

      // Step 1: Get total count first
      let countQuery = supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('is_hidden', false)
        .or('status.is.null,status.eq.open');

      if (user?.id) {
        countQuery = countQuery.neq('user_id', user.id);
      }

      const { count } = await countQuery;
      setTotalCount(count || 0);
      console.log(`📊 [CleanTasksScreen] Total tasks in database: ${count || 0}`);

      // Step 2: Build paginated query
      let query = supabase
        .from('tasks')
        .select(`
          *,
          task_classifications (
            detected_categories
          )
        `)
        .eq('is_hidden', false)
        .or('status.is.null,status.eq.open');

      if (user?.id) {
        query = query.neq('user_id', user.id);
      }

      // Step 3: Add pagination (load ITEMS_PER_PAGE at a time)
      const offset = (pageNum - 1) * ITEMS_PER_PAGE;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      const { data: tasksData, error } = await query;
      if (error) throw error;

      console.log(`✅ [CleanTasksScreen] Loaded ${tasksData?.length || 0} tasks from page ${pageNum}`);

      // Step 4: Process tasks (map, calculate distance, apply filters)
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
        detected_categories: task.task_classifications?.[0]?.detected_categories || [],
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

      // Filter by categories (client-side because of task_classifications join)
      if (selectedCategories.length > 0) {
        processedTasks = processedTasks.filter(task => 
          task.detected_categories?.some(cat => selectedCategories.includes(cat))
        );
        console.log(`🎯 [CleanTasksScreen] Filtered by categories: ${processedTasks.length} tasks match`);
      }

      // Filter by sub-skills (client-side text search)
      // Exclude "Other" from sub-skill filtering - it's just a fallback option
      if (selectedSubSkills.length > 0) {
        const nonOtherSubSkills = selectedSubSkills.filter(skill => skill.toLowerCase() !== 'other');
        
        if (nonOtherSubSkills.length > 0) {
          processedTasks = processedTasks.filter(task => {
            const taskText = `${task.title} ${task.description}`.toLowerCase();
            return nonOtherSubSkills.some(skill =>
              taskText.includes(skill.toLowerCase())
            );
          });
          console.log(`🎯 [CleanTasksScreen] Filtered by sub-skills: ${processedTasks.length} tasks match`);
        }
      }

      // Filter by distance (client-side because distance is calculated)
      if (userCoordinates && maxDistance) {
        processedTasks = processedTasks.filter(task => 
          task.distance !== undefined && task.distance <= maxDistance
        );
        console.log(`🎯 [CleanTasksScreen] Filtered by distance (${maxDistance}km): ${processedTasks.length} tasks match`);
      }

      // Step 5: Append or replace tasks
      if (isRefresh || pageNum === 1) {
        setTasks(processedTasks);
      } else {
        setTasks(prev => {
          // Remove duplicates by id
          const existingIds = new Set(prev.map(t => t.id));
          const newTasks = processedTasks.filter(t => !existingIds.has(t.id));
          return [...prev, ...newTasks];
        });
      }

      // Step 6: Determine if there are more pages
      const currentTotal = (isRefresh || pageNum === 1) ? processedTasks.length : tasks.length + processedTasks.length;
      setHasMore((tasksData?.length || 0) === ITEMS_PER_PAGE && currentTotal < (count || 0));
      
      console.log(`📄 [CleanTasksScreen] Page ${pageNum} complete. Showing ${currentTotal} tasks. More pages: ${hasMore}`);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadTasks(nextPage, false);
      console.log(`⬇️ [CleanTasksScreen] Loading more... Page ${nextPage}`);
    }
  };

  const toggleHelperMode = async () => {
    if (!user) {
      if (onLoginRequired) onLoginRequired();
      return;
    }

    if (!helperPreferences || selectedCategories.length === 0) {
      setShowCategoryModal(true);
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

      const updatedPreferences = {
        ...helperPreferences,
        is_available: newAvailability
      };
      
      setHelperPreferences(updatedPreferences);
      
      // Notify parent component
      if (onHelperPreferencesUpdate) {
        onHelperPreferencesUpdate(updatedPreferences);
      }

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
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      const updatedPreferences = {
        selected_categories: selectedCategories,
        selected_sub_skills: selectedSubSkills,
        max_distance: maxDistance,
        is_available: true,
      };
      
      setHelperPreferences(updatedPreferences);
      
      // Notify parent component
      if (onHelperPreferencesUpdate) {
        onHelperPreferencesUpdate(updatedPreferences);
      }

      toast.success('✅ Categories saved!');
      setShowCategoryModal(false);
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

  const toggleExpandCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleTaskClick = (task: Task) => {
    onNavigate('task-detail', { taskId: task.id });
  };

  return (
    <div className="min-h-screen bg-white pb-20">
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

      {/* Helper Mode Section - POSITION from wireframe, DESIGN is beautiful */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Toggle Switch - Beautiful iOS style */}
            <button
              onClick={toggleHelperMode}
              className={`relative flex-shrink-0 w-14 h-8 rounded-full transition-all shadow-inner ${
                helperPreferences?.is_available
                  ? 'bg-[#CDFF00]'
                  : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all flex items-center justify-center ${
                helperPreferences?.is_available ? 'left-7' : 'left-1'
              }`}>
                <Power className={`w-3.5 h-3.5 ${
                  helperPreferences?.is_available ? 'text-[#CDFF00]' : 'text-gray-400'
                }`} />
              </div>
            </button>

            {/* Helper Text - Clean and informative */}
            <div className="flex-1">
              <h3 className="font-bold text-black mb-0.5">Helper Mode</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Get instant notifications for tasks matching your skills nearby
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar - POSITION from wireframe, DESIGN is polished */}
      <div className="bg-white border-b border-gray-200 sticky top-[60px] z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-3">
            {/* Categories Button - Clean with count badge */}
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex-1 flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 rounded-xl transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-black text-sm">Categories</span>
                {selectedCategories.length > 0 && (
                  <span className="px-2 py-0.5 bg-[#CDFF00] text-black text-xs font-bold rounded-full">
                    {selectedCategories.length}
                  </span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />
            </button>

            {/* Distance Button - Clean and minimal */}
            <button
              onClick={() => setShowDistanceModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 rounded-xl transition-all min-w-[100px]"
            >
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="font-bold text-black text-sm">{maxDistance}km</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-600">
            {loading ? 'Loading tasks...' : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} available`}
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-16 text-center border-2 border-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#CDFF00] mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-gray-100">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-black mb-2">No tasks found</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              {selectedCategories.length > 0
                ? 'No tasks match your filters. Try adjusting categories or increasing distance.'
                : 'No tasks available in your area right now. Check back soon!'}
            </p>
            {selectedCategories.length > 0 && (
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedSubSkills([]);
                }}
                className="px-6 py-3 bg-[#CDFF00] text-black font-bold rounded-xl hover:bg-[#b8e600] transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {tasks.map((task) => {
              const categories = HELPER_TASK_CATEGORIES.filter(cat =>
                task.detected_categories?.includes(cat.id)
              );

              return (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="bg-white rounded-2xl p-4 md:p-4 border-2 border-gray-200 hover:border-[#CDFF00] hover:shadow-lg transition-all cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {categories.length > 0 ? (
                        categories.map(cat => (
                          <span
                            key={cat.id}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700"
                          >
                            <span className="text-sm">{cat.emoji}</span>
                            <span className="hidden sm:inline">{cat.name}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">General Task</span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg flex-shrink-0 ml-2">
                      OPEN
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-black text-base md:text-lg mb-1.5 leading-tight">
                    {task.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-2">
                    {task.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                    <div className="text-xl md:text-2xl font-bold text-black">₹{task.price}</div>
                    {task.distance !== undefined && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {task.distance < 1
                            ? `${Math.round(task.distance * 1000)}m away`
                            : `${task.distance.toFixed(1)}km away`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Infinite Scroll Observer Target & Loading More Indicator */}
        {hasMore && !loading && (
          <div ref={observerTarget} className="py-8 text-center">
            {loadingMore && (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#CDFF00]"></div>
                <p className="text-sm font-medium text-gray-600">Loading more tasks...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Add Button - POSITION from wireframe, DESIGN is beautiful */}
      <button
        onClick={() => {
          if (!isLoggedIn && onLoginRequired) {
            onLoginRequired();
            return;
          }
          onNavigate('create-task');
        }}
        className="fixed bottom-24 right-6 w-16 h-16 bg-[#CDFF00] hover:bg-[#b8e600] rounded-full shadow-2xl flex items-center justify-center transition-all z-30 border-4 border-white"
      >
        <Plus className="w-8 h-8 text-black" strokeWidth={3} />
      </button>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b-2 border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-black">Select Categories</h2>
                <p className="text-sm text-gray-600 mt-1">Choose what tasks you want to see</p>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-black" />
              </button>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto">
              {/* Search Box - STICKY */}
              <div className="sticky top-0 bg-white z-10 p-4 pb-3 border-b border-gray-100">
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

              {/* Categories List - Compact */}
              <div className="p-3 space-y-2">
                {HELPER_TASK_CATEGORIES
                  .filter(category => {
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
                  })
                  .map((category) => {
                    const selectedSubSkillCount = selectedSubSkills.filter(skill => 
                      category.subSkills.includes(skill)
                    ).length;
                    // ✅ FIX: Show as selected if main category is selected OR if any sub-skills are selected
                    const isSelected = selectedCategories.includes(category.id) || selectedSubSkillCount > 0;
                    const isExpanded = expandedCategories.includes(category.id);

                    return (
                      <div key={category.id} className="bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-100">
                        {/* Category Card */}
                        <div
                          onClick={() => toggleExpandCategory(category.id)}
                          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          {/* Checkbox */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategory(category.id);
                            }}
                            className="flex-shrink-0"
                          >
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#CDFF00] border-black'
                                : 'bg-white border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-4 h-4 text-black" strokeWidth={3} />}
                            </div>
                          </div>

                          {/* Emoji */}
                          <div className="text-3xl flex-shrink-0">{category.emoji}</div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-black text-base mb-0.5">{category.name}</h3>
                            <p className="text-xs text-gray-600">{category.description}</p>
                            {selectedSubSkillCount > 0 && (
                              <p className="text-xs font-bold text-black mt-1 inline-block px-2 py-0.5 bg-[#FFFACD] rounded">
                                {selectedSubSkillCount} specific {selectedSubSkillCount === 1 ? 'skill' : 'skills'} selected
                              </p>
                            )}
                          </div>

                          {/* Expand Icon */}
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                        </div>

                        {/* Sub-skills */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 bg-white border-t-2 border-gray-100">
                            <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                              Specific Skills (Optional)
                            </p>
                            <div className="space-y-2">
                              {category.subSkills.map((subSkill) => {
                                const isSubSkillSelected = selectedSubSkills.includes(subSkill);
                                return (
                                  <div
                                    key={subSkill}
                                    onClick={() => toggleSubSkill(category.id, subSkill)}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                      isSubSkillSelected
                                        ? 'bg-[#FFFACD] border-2 border-[#CDFF00]'
                                        : 'bg-white border-2 border-gray-200 hover:bg-gray-50'
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
            </div>

            {/* Footer */}
            <div className="p-5 border-t-2 border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedSubSkills([]);
                }}
                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-xl transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={saveHelperPreferences}
                disabled={selectedCategories.length === 0}
                className="flex-[2] py-4 bg-[#CDFF00] hover:bg-[#b8e600] text-black font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Apply {selectedCategories.length > 0 && `(${selectedCategories.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Distance Modal */}
      {showDistanceModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-black">Maximum Distance</h2>
              <button
                onClick={() => setShowDistanceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
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
                    loadTasks();
                  }}
                  className={`py-4 rounded-xl font-bold transition-all ${
                    maxDistance === distance
                      ? 'bg-[#CDFF00] text-black border-2 border-black shadow-lg'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
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