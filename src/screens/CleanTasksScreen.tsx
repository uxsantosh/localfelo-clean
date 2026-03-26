import { useState, useEffect, useRef } from 'react';
import { Power, MapPin, ChevronDown, ChevronUp, Plus, X, Check, Search, List, Map } from 'lucide-react';
import { HELPER_TASK_CATEGORIES } from '../constants/helperCategories';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner@2.0.3';
import { calculateDistance } from '../utils/distance';
import { Header } from '../components/Header';
import { MapView } from '../components/MapView';
import { TaskCard } from '../components/TaskCard';

// ✅ CleanTasksScreen - Tasks with pagination and infinite scroll

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
  detected_category?: string;
  subcategory?: string;
  distance?: number;
  userName?: string;
  userPhone?: string;
  images?: string[];
  areaName?: string;
  cityName?: string;
  address?: string;
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
  const [allTasks, setAllTasks] = useState<Task[]>([]); // All tasks from current page
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]); // Filtered tasks to display
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
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const observerTarget = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 20;

  // Sync with parent's helper preferences
  useEffect(() => {
    if (helperPreferencesProp) {
      setHelperPreferences(helperPreferencesProp);
      setSelectedCategories(helperPreferencesProp.selected_categories || []);
      setSelectedSubSkills(helperPreferencesProp.selected_sub_skills || []);
      setMaxDistance(helperPreferencesProp.max_distance || 10);
    }
  }, [helperPreferencesProp]);

  // Load helper preferences on mount
  useEffect(() => {
    if (user?.id && !helperPreferencesProp) {
      loadHelperPreferences();
    }
  }, [user?.id]);

  // Load all tasks from database (once)
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setAllTasks([]);
    loadAllTasks(1, true);
  }, [user?.id]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore && viewMode === 'list') {
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
  }, [hasMore, loading, loadingMore, viewMode]);

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
  }, [allTasks, selectedCategories, selectedSubSkills, maxDistance, userCoordinates]);

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

  const loadAllTasks = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      console.log('🔄 Loading tasks page:', pageNum);

      let query = supabase
        .from('tasks')
        .select(`
          *,
          area:areas!tasks_area_id_fkey (
            name
          ),
          city:cities!tasks_city_id_fkey (
            name
          )
        `, { count: 'exact' })
        .eq('is_hidden', false)
        .in('status', ['open', 'accepted', 'in_progress'])
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE - 1);

      // Don't show user's own tasks
      if (user?.id) {
        query = query.neq('user_id', user.id);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      console.log(`✅ Loaded ${data?.length || 0} tasks from database (total: ${count})`);
      
      // Log sample task structure
      if (data && data.length > 0) {
        console.log('📋 Sample task:', {
          id: data[0].id,
          title: data[0].title,
          category_id: data[0].category_id,
          detected_category: data[0].detected_category,
          subcategory: data[0].subcategory,
        });
      }

      // Map to Task interface
      const tasks: Task[] = (data || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        price: task.price,
        latitude: task.latitude,
        longitude: task.longitude,
        created_at: task.created_at,
        user_id: task.user_id,
        status: task.status,
        detected_category: task.detected_category,
        subcategory: task.subcategory,
        images: task.images || [],
        areaName: task.area?.name,
        cityName: task.city?.name,
        address: task.address,
      }));

      if (isRefresh) {
        setAllTasks(tasks);
      } else {
        setAllTasks(prev => [...prev, ...tasks]);
      }

      setTotalCount(count || 0);
      setHasMore(data && data.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
      setAllTasks([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const applyFilters = () => {
    console.log('🔍 Applying filters...', {
      totalTasks: allTasks.length,
      selectedCategories,
      selectedSubSkills,
      maxDistance,
      hasUserCoordinates: !!userCoordinates,
    });

    let filtered = [...allTasks];

    // Calculate distances first
    if (userCoordinates) {
      filtered = filtered.map(task => ({
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

    // Apply category filter (using detected_category field)
    if (selectedCategories.length > 0) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(task => {
        // Match against detected_category (the specific service category)
        if (task.detected_category && selectedCategories.includes(task.detected_category)) {
          return true;
        }
        return false;
      });
      console.log(`  ✅ Category filter: ${beforeCount} → ${filtered.length} tasks`);
    }

    // Apply sub-skill filter (using subcategory field)
    if (selectedSubSkills.length > 0) {
      const beforeCount = filtered.length;
      
      // Extract sub-skill IDs from "categoryId:subSkillName" format
      // Need to convert subSkillName back to subSkillId by looking it up
      const subSkillIds: string[] = [];
      
      selectedSubSkills.forEach(skill => {
        const parts = skill.split(':');
        if (parts.length > 1) {
          const categoryId = parts[0];
          const subSkillName = parts[1];
          
          // Find the category and get the subcategory ID
          const category = HELPER_TASK_CATEGORIES.find(cat => cat.id === categoryId);
          if (category) {
            const subcategory = category.subcategories.find(sub => sub.name === subSkillName);
            if (subcategory) {
              subSkillIds.push(subcategory.id);
            }
          }
        }
      });

      filtered = filtered.filter(task => {
        // Match against subcategory field (which stores subcategory IDs)
        if (task.subcategory && subSkillIds.includes(task.subcategory)) {
          return true;
        }
        return false;
      });
      
      console.log(`  ✅ Sub-skill filter: ${beforeCount} → ${filtered.length} tasks (IDs: ${subSkillIds.join(', ')})`);
    }

    // Apply distance filter
    if (userCoordinates && maxDistance) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(task => 
        task.distance !== undefined && task.distance <= maxDistance
      );
      console.log(`  ✅ Distance filter (${maxDistance}km): ${beforeCount} → ${filtered.length} tasks`);
    }

    console.log(`✅ Final filtered tasks: ${filtered.length}`);
    setFilteredTasks(filtered);
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
      
      if (onHelperPreferencesUpdate) {
        onHelperPreferencesUpdate(updatedPreferences);
      }

      toast.success(newAvailability ? '✅ Helper mode ON' : '✅ Helper mode OFF');
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

    // If no categories selected, clear all filters
    if (selectedCategories.length === 0) {
      await clearAllFilters();
      setShowCategoryModal(false);
      return;
    }

    // Save categories
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
      
      if (onHelperPreferencesUpdate) {
        onHelperPreferencesUpdate(updatedPreferences);
      }

      toast.success('✅ Categories saved!');
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const toggleCategory = (categoryId: string) => {
    const isCurrentlySelected = selectedCategories.includes(categoryId);
    
    if (isCurrentlySelected) {
      // Deselecting: Remove category and its sub-skills
      setSelectedCategories(prev => prev.filter(c => c !== categoryId));
      setSelectedSubSkills(prev => 
        prev.filter(skill => !skill.startsWith(`${categoryId}:`))
      );
    } else {
      // Selecting: Add category and all its sub-skills
      setSelectedCategories(prev => [...prev, categoryId]);
      
      const category = HELPER_TASK_CATEGORIES.find(cat => cat.id === categoryId);
      if (category) {
        setSelectedSubSkills(prev => {
          const existingSkills = new Set(prev);
          category.subSkills.forEach(skill => {
            existingSkills.add(`${categoryId}:${skill}`);
          });
          return Array.from(existingSkills);
        });
      }
    }
  };

  const toggleSubSkill = (categoryId: string, subSkill: string) => {
    const scopedSubSkill = `${categoryId}:${subSkill}`;
    const isCurrentlySelected = selectedSubSkills.includes(scopedSubSkill);
    
    if (isCurrentlySelected) {
      // Deselecting a sub-skill
      const newSubSkills = selectedSubSkills.filter(s => s !== scopedSubSkill);
      setSelectedSubSkills(newSubSkills);
      
      // If no sub-skills remain for this category, deselect the main category
      const remainingSubSkillsForCategory = newSubSkills.filter(skill => 
        skill.startsWith(`${categoryId}:`)
      );
      
      if (remainingSubSkillsForCategory.length === 0) {
        setSelectedCategories(prev => prev.filter(c => c !== categoryId));
      }
    } else {
      // Selecting a sub-skill
      setSelectedSubSkills(prev => [...prev, scopedSubSkill]);
      
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
      } catch (error) {
        console.error('Error clearing filters:', error);
        toast.error('Failed to clear filters');
      }
    } else {
      toast.success('✅ All filters cleared');
    }
  };

  const handleTaskClick = (task: Task) => {
    onNavigate('task-detail', { taskId: task.id });
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadAllTasks(nextPage, false);
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

      {/* Helper Mode Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Toggle Switch */}
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

            {/* Helper Text */}
            <div className="flex-1">
              <h3 className="font-bold text-black mb-0.5">Helper Mode</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Get instant notifications for tasks matching your skills nearby
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[60px] z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-3">
            {/* Categories Button */}
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

            {/* Distance Button */}
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
            {loading ? 'Loading tasks...' : `${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'} available`}
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-16 text-center border-2 border-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#CDFF00] mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
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
                onClick={clearAllFilters}
                className="px-6 py-3 bg-[#CDFF00] text-black font-bold rounded-xl hover:bg-[#b8e600] transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'list' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => handleTaskClick(task)}
                  />
                ))}
                {hasMore && (
                  <div
                    ref={observerTarget}
                    className="w-full h-10 flex items-center justify-center text-gray-500 col-span-full"
                  >
                    {loadingMore ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-4 border-gray-200 border-t-[#CDFF00]"></div>
                    ) : (
                      <p className="text-sm">Scroll for more...</p>
                    )}
                  </div>
                )}
              </div>
            )}
            {viewMode === 'map' && (() => {
              const mapMarkers = filteredTasks
                .filter(task => task.latitude && task.longitude)
                .map(task => ({
                  id: task.id,
                  latitude: task.latitude,
                  longitude: task.longitude,
                  title: task.title,
                  price: task.price,
                  type: 'task' as const,
                  status: task.status,
                }));
              
              console.log('🗺️ [CleanTasksScreen] Map View - Total tasks:', filteredTasks.length);
              console.log('🗺️ [CleanTasksScreen] Tasks with coordinates:', mapMarkers.length);
              console.log('🗺️ [CleanTasksScreen] User coordinates:', userCoordinates);
              console.log('🗺️ [CleanTasksScreen] Sample markers:', mapMarkers.slice(0, 3));
              
              return (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden relative z-0" style={{ height: '500px' }}>
                  {mapMarkers.length === 0 && !userCoordinates ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center p-8">
                        <p className="text-lg font-semibold text-gray-700 mb-2">📍 No location data available</p>
                        <p className="text-sm text-gray-500">Tasks need location data to show on the map</p>
                      </div>
                    </div>
                  ) : (
                    <MapView
                      markers={mapMarkers}
                      onMarkerClick={(id) => {
                        onNavigate('task-detail', { taskId: id });
                      }}
                      userLocation={userCoordinates}
                    />
                  )}
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => {
          if (!isLoggedIn && onLoginRequired) {
            onLoginRequired();
            return;
          }
          onNavigate('create-smart-task');
        }}
        className="fixed bottom-24 right-6 w-16 h-16 bg-[#CDFF00] hover:bg-[#b8e600] rounded-full shadow-2xl flex items-center justify-center transition-all z-30 border-4 border-white"
      >
        <Plus className="w-8 h-8 text-black" strokeWidth={3} />
      </button>

      {/* Floating View Mode Toggle */}
      {filteredTasks.length > 0 && (
        <div className="fixed right-6 bottom-44 z-40 flex flex-col gap-2 shadow-2xl rounded-[4px] overflow-hidden">
          <button
            onClick={() => setViewMode('list')}
            className={`w-12 h-12 flex items-center justify-center transition-all ${
              viewMode === 'list'
                ? 'bg-black text-white'
                : 'bg-white text-black border-b border-gray-200'
            }`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`w-12 h-12 flex items-center justify-center transition-all ${
              viewMode === 'map'
                ? 'bg-black text-white'
                : 'bg-white text-black'
            }`}
            title="Map View"
          >
            <Map className="w-5 h-5" />
          </button>
        </div>
      )}

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
              {/* Search Box */}
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

              {/* Categories List */}
              <div className="p-3 space-y-2">
                {HELPER_TASK_CATEGORIES
                  .filter(category => {
                    if (!categorySearchQuery) return true;
                    const query = categorySearchQuery.toLowerCase().trim();
                    
                    const smartMatch = (text: string | undefined) => {
                      if (!text) return false; // ✅ FIX: Handle undefined/null values
                      const lowerText = text.toLowerCase();
                      const words = lowerText.split(/[\s,/\-()]+/).filter(w => w.length > 0);
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
                      skill.startsWith(`${category.id}:`)
                    ).length;
                    const isSelected = selectedCategories.includes(category.id);
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
                                const scopedSubSkill = `${category.id}:${subSkill}`;
                                const isSubSkillSelected = selectedSubSkills.includes(scopedSubSkill);
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
                className="flex-[2] py-4 bg-[#CDFF00] hover:bg-[#b8e600] text-black font-bold rounded-xl transition-colors shadow-lg"
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