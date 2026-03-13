import React, { useState, useEffect } from 'react';
import { HELPER_TASK_CATEGORIES, DISTANCE_OPTIONS } from '../constants/helperCategories';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { calculateDistance } from '../utils/distance';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { MapView } from '../components/MapView';
import { ArrowLeft, Power, PowerOff, Sparkles, ChevronDown, MapPin, X, Check, List, Map } from 'lucide-react';

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
  poster_name?: string;
  poster_phone?: string;
}

interface HelperPreferences {
  selected_categories: string[];
  selected_sub_skills: string[];
  max_distance: number;
  is_available: boolean;
}

interface NewTasksScreenProps {
  userId: string;
  userCoordinates: { latitude: number; longitude: number } | null;
  onBack: () => void;
  onTaskClick: (taskId: string) => void;
  onHelperModeToggle?: () => void;
}

export function NewTasksScreen({
  userId,
  userCoordinates,
  onBack,
  onTaskClick,
  onHelperModeToggle
}: NewTasksScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [helperPreferences, setHelperPreferences] = useState<HelperPreferences | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showHelperSettings, setShowHelperSettings] = useState(false);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [sortBy, setSortBy] = useState<'distance' | 'newest' | 'price'>('distance');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Load helper preferences on mount
  useEffect(() => {
    loadHelperPreferences();
  }, [userId]);

  // Load tasks when filters change
  useEffect(() => {
    loadTasks();
  }, [userCoordinates, selectedCategories, maxDistance, sortBy]);

  const loadHelperPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('helper_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading helper preferences:', error);
        return;
      }

      if (data) {
        setHelperPreferences(data);
        // Pre-select categories from helper preferences
        setSelectedCategories(data.selected_categories || []);
        setMaxDistance(data.max_distance || 10);
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
          )
        `)
        .eq('is_hidden', false)
        .or('status.is.null,status.eq.open')
        .neq('user_id', userId);

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
        detected_categories: task.task_classifications?.[0]?.detected_categories || [],
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

      // Filter by selected categories
      if (selectedCategories.length > 0) {
        processedTasks = processedTasks.filter(task => 
          task.detected_categories?.some(cat => selectedCategories.includes(cat))
        );
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
    if (!helperPreferences) {
      // Open helper mode setup
      if (onHelperModeToggle) onHelperModeToggle();
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
        .eq('user_id', userId);

      if (error) throw error;

      setHelperPreferences({
        ...helperPreferences,
        is_available: newAvailability
      });

      toast.success(newAvailability ? 'Helper mode ON' : 'Helper mode OFF');
    } catch (error) {
      console.error('Error toggling helper mode:', error);
      toast.error('Failed to toggle helper mode');
    }
  };

  const updateHelperCategories = async () => {
    try {
      const { error } = await supabase
        .from('helper_preferences')
        .upsert({
          user_id: userId,
          selected_categories: selectedCategories,
          selected_sub_skills: helperPreferences?.selected_sub_skills || [],
          max_distance: maxDistance,
          is_available: helperPreferences?.is_available || false,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('✅ Categories updated!');
      setShowHelperSettings(false);
      loadHelperPreferences();
    } catch (error) {
      console.error('Error updating categories:', error);
      toast.error('Failed to update categories');
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-black">Available Tasks</h1>
              <p className="text-xs text-gray-600">
                {tasks.length} tasks • Sorted by {sortBy}
              </p>
            </div>
          </div>

          {/* Helper Mode Toggle */}
          <button
            onClick={toggleHelperMode}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
              helperPreferences?.is_available
                ? 'bg-[#CDFF00] text-black border-2 border-black'
                : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
            }`}
          >
            {helperPreferences?.is_available ? (
              <>
                <Power className="w-4 h-4" />
                <span className="text-sm">ON</span>
              </>
            ) : (
              <>
                <PowerOff className="w-4 h-4" />
                <span className="text-sm">OFF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[57px] z-20">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Categories Filter */}
            <button
              onClick={() => setShowHelperSettings(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span className="text-black font-medium">
                {selectedCategories.length > 0 
                  ? `${selectedCategories.length} categories`
                  : 'All categories'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {/* Distance Filter */}
            {userCoordinates && (
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                <MapPin className="w-4 h-4 text-black" />
                <span className="text-black font-medium">
                  {maxDistance} km
                </span>
              </button>
            )}

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-black border-none focus:ring-2 focus:ring-[#CDFF00]"
            >
              <option value="distance">Nearest</option>
              <option value="newest">Newest</option>
              <option value="price">Highest Pay</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3 pb-20">
        {loading ? (
          <SkeletonLoader count={4} />
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-bold text-black mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">
              {selectedCategories.length > 0
                ? 'Try adjusting your category filters'
                : 'No tasks available in your area right now'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'list' && (
              tasks.map((task) => {
                const categories = HELPER_TASK_CATEGORIES.filter(cat =>
                  task.detected_categories?.includes(cat.id)
                );

                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task.id)}
                    className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#CDFF00] transition-all cursor-pointer"
                  >
                    {/* Title */}
                    <h3 className="font-bold text-black text-lg mb-2.5 leading-snug">{task.title}</h3>
                    
                    {/* Description - 2 lines max with ellipsis and proper spacing */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed" style={{ minHeight: '2.5rem' }}>
                      {task.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      {/* Price */}
                      <div className="text-2xl font-bold text-black">
                        ₹{task.price}
                      </div>

                      {/* Distance */}
                      {task.distance !== undefined && (
                        <div className="flex items-center gap-1 text-gray-600">
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
              })
            )}
            {viewMode === 'map' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden relative z-0" style={{ height: '500px' }}>
                <MapView
                  markers={tasks
                    .filter(task => task.latitude && task.longitude)
                    .map(task => ({
                      id: task.id,
                      latitude: task.latitude,
                      longitude: task.longitude,
                      title: task.title,
                      price: task.price,
                      type: 'task' as const,
                      status: task.status,
                    }))}
                  onMarkerClick={(id) => {
                    onTaskClick(id);
                  }}
                  userLocation={userCoordinates}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating View Mode Toggle - Rapido Style */}
      {tasks.length > 0 && (
        <div className="fixed right-4 bottom-24 sm:bottom-6 z-40 flex flex-col gap-2 shadow-2xl rounded-[4px] overflow-hidden">
          <button
            onClick={() => setViewMode('list')}
            className={`w-12 h-12 flex items-center justify-center transition-all ${
              viewMode === 'list'
                ? 'bg-black text-white'
                : 'bg-white text-foreground border-b border-border'
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
                : 'bg-white text-foreground'
            }`}
            title="Map View"
          >
            <Map className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Helper Settings Modal */}
      {showHelperSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-xl max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-black">Select Categories</h2>
              <button
                onClick={() => setShowHelperSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Categories */}
            <div className="p-4 space-y-3">
              {HELPER_TASK_CATEGORIES.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'border-[#CDFF00] bg-[#CDFF00]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl">{category.emoji}</div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-black">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-[#CDFF00] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-black" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-4 flex gap-3">
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setShowHelperSettings(false);
                }}
                className="flex-1 py-3 bg-gray-100 text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={updateHelperCategories}
                disabled={selectedCategories.length === 0}
                className="flex-2 py-3 bg-[#CDFF00] text-black font-bold rounded-lg hover:bg-[#b8e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-8"
              >
                Apply ({selectedCategories.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Distance Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-black">Distance Filter</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {DISTANCE_OPTIONS.map((distance) => (
                <button
                  key={distance}
                  onClick={() => {
                    setMaxDistance(distance);
                    setShowFilters(false);
                  }}
                  className={`py-4 rounded-lg font-bold transition-all ${
                    maxDistance === distance
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
      )}
    </div>
  );
}