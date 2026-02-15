import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { TaskCard } from '../components/TaskCard';
import { ActiveTaskCard } from '../components/ActiveTaskCard';
import { EmptyState } from '../components/EmptyState';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { SelectField } from '../components/SelectField';
import { MapView } from '../components/MapView';
import { Modal } from '../components/Modal';
import { AppFooter } from '../components/AppFooter';
import { Plus, Filter, MapPin, List, Map, Briefcase, User as UserIcon, Edit2, Trash2, Search, X, SlidersHorizontal, Sparkles } from 'lucide-react';
import { getAllTasks, getUserActiveTasks, getUserTasks } from '../services/tasks';
import { getTaskCategories, Category } from '../services/categories';
import { useLocation } from '../hooks/useLocation';
import { getOrCreateConversation } from '../services/chat';
import { toast } from 'sonner';
import { calculateDistance, formatDistance } from '../services/geocoding';

interface TasksScreenProps {
  user: User | null;
  onNavigate: (screen: string, data?: any) => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
  unreadCount?: number;
  cities: City[];
  showGlobalLocation?: boolean;
  globalLocationArea?: string;
  globalLocationCity?: string;
  onLocationClick?: () => void;
  onMenuClick?: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
  userCoordinates?: { latitude: number; longitude: number } | null;
  onLoginRequired?: () => void;
  onContactClick?: () => void;
  socialLinks?: { instagram?: string; facebook?: string; linkedin?: string };
}

export function TasksScreen({
  user,
  onNavigate,
  isLoggedIn,
  isAdmin,
  userDisplayName,
  unreadCount,
  cities,
  showGlobalLocation,
  globalLocationArea,
  globalLocationCity,
  onLocationClick,
  onMenuClick,
  notificationCount,
  onNotificationClick,
  userCoordinates,
  onLoginRequired,
  onContactClick,
  socialLinks,
}: TasksScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [loadingMyTasks, setLoadingMyTasks] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(''); // Changed from 'open' to '' to show all statuses by default
  const [distanceFilter, setDistanceFilter] = useState<string>(''); // Distance filter: '1', '5', '10', '25', ''

  const { location } = useLocation(user?.id || null);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getTaskCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // Load tasks
  useEffect(() => {
    loadTasks();
    if (isLoggedIn && user?.id) {
      loadActiveTasks();
    }
  }, [userCoordinates, selectedCategory, selectedCity, selectedArea, selectedStatus, isLoggedIn, user?.id, globalLocationCity, globalLocationArea, distanceFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // Determine which city and area to use
      // Only apply manual filters if user explicitly selects them
      // DO NOT auto-filter by global location - show ALL tasks everywhere
      let effectiveCityId = selectedCity;
      let effectiveAreaId = selectedArea;
      
      const filters: any = {
        categoryId: selectedCategory?.toString() || undefined,
        cityId: effectiveCityId || undefined,
        areaId: effectiveAreaId || undefined,
        status: selectedStatus || undefined,
      };
      
      console.log('🔍 [TasksScreen] Loading tasks from ALL cities with filters:', {
        ...filters,
        note: 'Showing all tasks everywhere, sorted by distance (nearest first)'
      });
      
      // Pass user coordinates for distance sorting
      if (userCoordinates) {
        filters.userLat = userCoordinates.latitude;
        filters.userLon = userCoordinates.longitude;
        console.log('✅ [TasksScreen] User coordinates AVAILABLE:', userCoordinates);
      } else {
        console.log('ℹ️ [TasksScreen] User coordinates NOT SET - distance will not show. Set location to see distances.');
      }
      
      const data = await getAllTasks(filters);
      
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveTasks = async () => {
    try {
      const data = await getUserActiveTasks(user?.id || '');
      setActiveTasks(data);
    } catch (error) {
      console.error('Failed to load active tasks:', error);
    }
  };

  const loadMyTasks = async () => {
    try {
      setLoadingMyTasks(true);
      const data = await getUserTasks(user?.id || '');
      setMyTasks(data);
    } catch (error) {
      console.error('Failed to load my tasks:', error);
    } finally {
      setLoadingMyTasks(false);
    }
  };

  const selectedCityData = cities.find(c => c.id === selectedCity);

  const handleNavigate = (task: Task) => {
    if (task.latitude && task.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header
        title="Tasks"
        currentScreen="tasks"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn || false}
        isAdmin={isAdmin || false}
        userDisplayName={userDisplayName}
        unreadCount={unreadCount}
        showGlobalLocation={showGlobalLocation}
        globalLocationArea={globalLocationArea}
        globalLocationCity={globalLocationCity}
        onLocationClick={onLocationClick}
        onMenuClick={onMenuClick}
        notificationCount={notificationCount}
        onNotificationClick={onNotificationClick}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Hero Banner */}
        <div className="bg-white border border-gray-200 p-4 sm:p-6 mb-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#CDFF00' }}>
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                </div>
                <h1 className="text-lg sm:text-xl m-0" style={{ fontWeight: '700' }}>
                  Available Tasks Near You
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 m-0">
                Accept tasks from people nearby and earn by helping them
              </p>
            </div>
            
            {/* Right: Action Button */}
            <button
              onClick={() => {
                if (!isLoggedIn && onLoginRequired) {
                  onLoginRequired();
                  return;
                }
                onNavigate('create-task');
              }}
              className="btn-primary flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 shrink-0"
              style={{ borderRadius: '6px', width: 'auto', minWidth: 'fit-content' }}
            >
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap text-sm sm:text-base">Post Task</span>
            </button>
          </div>
        </div>

        {/* Search and Filters in one row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Smart search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-[6px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded-full p-1 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-black" />
              </button>
            )}
          </div>
          
          {/* My Tasks Button - Only show when logged in */}
          {isLoggedIn && user && (
            <button
              onClick={() => {
                setShowMyTasks(true);
                loadMyTasks();
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-[6px] shrink-0 hover:bg-gray-50 transition-colors text-sm"
            >
              <UserIcon className="w-4 h-4 text-black" />
              <span className="text-black whitespace-nowrap">My Tasks</span>
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-[6px] shrink-0 hover:bg-gray-50 transition-colors text-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-black" />
            <span className="hidden sm:inline text-black whitespace-nowrap">Filters</span>
            {(selectedCategory || selectedCity || selectedArea || selectedStatus || distanceFilter) && (
              <span className="bg-primary text-black text-xs px-1.5 py-0.5 rounded-full font-bold">
                {[selectedCategory, selectedCity, selectedArea, selectedStatus, distanceFilter].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Categories - Compact */}
        <div className="mb-3">
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? 'bg-black text-white font-medium'
                  : 'bg-white text-gray-600 hover:text-black hover:bg-gray-50 border border-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-black text-white font-medium'
                    : 'bg-white text-gray-600 hover:text-black hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-[6px] p-4 mb-3 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Filters</h4>
              {(selectedCategory || selectedCity || selectedArea || selectedStatus || distanceFilter) && (
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedCity('');
                    setSelectedArea('');
                    setSelectedStatus('');
                    setDistanceFilter('');
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SelectField
                label="Distance"
                value={distanceFilter}
                onChange={setDistanceFilter}
              >
                <option value="">Any Distance</option>
                <option value="1">Within 1 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
              </SelectField>

              <SelectField
                label="City"
                value={selectedCity}
                onChange={(value) => {
                  setSelectedCity(value);
                  setSelectedArea('');
                }}
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </SelectField>

              {selectedCityData && (
                <SelectField
                  label="Area"
                  value={selectedArea}
                  onChange={setSelectedArea}
                >
                  <option value="">All Areas</option>
                  {selectedCityData.areas?.map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </SelectField>
              )}

              <SelectField
                label="Status"
                value={selectedStatus}
                onChange={setSelectedStatus}
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </SelectField>
            </div>
          </div>
        )}

        {/* Active Tasks Section */}
        {isLoggedIn && activeTasks.length > 0 && (
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>🔥</span>
              <span>Your Active Tasks</span>
              <span className="bg-[#CDFF00] text-black text-xs px-1.5 py-0.5 rounded-full font-bold">
                {activeTasks.length}
              </span>
            </h3>
            <div className="space-y-1">
              {activeTasks.map((task) => (
                <ActiveTaskCard
                  key={task.id}
                  task={task}
                  onClick={() => {
                    // Navigate to task detail screen
                    onNavigate('task-detail', { taskId: task.id });
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tasks List */}
        {viewMode === 'list' && (
          <>
            {loading ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CDFF00] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="bg-white rounded-xl p-8">
                <EmptyState
                  type="no-results"
                  message={
                    selectedCategory || selectedCity || selectedArea
                      ? 'No tasks found with current filters. Try adjusting your search.'
                      : user
                      ? 'No tasks from other users yet. Tasks you create won\'t appear here.'
                      : 'No tasks available yet. Be the first to post one!'
                  }
                  action={
                    isLoggedIn ? (
                      <button
                        onClick={() => onNavigate('create-task')}
                        className="px-6 py-3 bg-[#CDFF00] text-black font-bold rounded-[4px] hover:bg-[#b8e600] transition-colors"
                      >
                        Post a Task
                      </button>
                    ) : undefined
                  }
                />
                {user && tasks.length === 0 && !selectedCategory && !selectedCity && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-[4px] text-sm text-blue-900">
                    <p className="font-medium mb-1">💡 Tip:</p>
                    <p>This view only shows tasks from other users. To see your own tasks, go to Profile → My Tasks.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onNavigate('task-detail', { taskId: task.id })}
                    currentUserId={user?.id}
                    onChatClick={
                      isLoggedIn && user?.id !== task.userId
                        ? async () => {
                            const { conversation, error } = await getOrCreateConversation(
                              task.id,
                              task.title,
                              undefined,
                              task.price || task.budgetMax || task.budgetMin,
                              task.userId,
                              task.userName,
                              task.userAvatar,
                              'task' // ✅ NEW: Pass listing type
                            );
                            if (error) {
                              toast.error(error);
                              return;
                            }
                            if (conversation) {
                              onNavigate('chat', { conversationId: conversation.id });
                            }
                          }
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Tasks Map */}
        {viewMode === 'map' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden relative z-0" style={{ height: '500px' }}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CDFF00]"></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex items-center justify-center h-full p-8">
                <EmptyState
                  type="no-results"
                  message="No tasks to show on map"
                />
              </div>
            ) : (
              <MapView
                markers={tasks
                  .filter(task => task.latitude && task.longitude)
                  .map(task => ({
                    id: task.id,
                    latitude: task.latitude!,
                    longitude: task.longitude!,
                    title: task.title,
                    price: task.price,
                    type: 'task' as const,
                    categoryEmoji: categories.find(c => String(c.id) === String(task.categoryId))?.emoji,
                    status: task.status,
                  }))}
                onMarkerClick={(id) => {
                  onNavigate('task-detail', { taskId: id });
                }}
                userLocation={userCoordinates}
              />
            )}
          </div>
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

          {/* Map View Toggle */}
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

      {/* My Tasks Modal */}
      <Modal
        isOpen={showMyTasks}
        onClose={() => setShowMyTasks(false)}
        title="My Tasks"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          {loadingMyTasks ? (
            <div className="space-y-3 p-4">
              <SkeletonLoader count={3} />
            </div>
          ) : myTasks.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Briefcase}
                title="No tasks yet"
                description="You haven't created any tasks yet. Post a task to get help from your local community!"
                action={
                  <button
                    onClick={() => {
                      setShowMyTasks(false);
                      onNavigate('create-task');
                    }}
                    className="btn-primary px-6 py-3 rounded-xl"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Post a Task
                  </button>
                }
              />
            </div>
          ) : (
            <>
              {/* Section: Active Tasks (accepted, in_progress) */}
              {myTasks.filter(t => ['accepted', 'in_progress'].includes(t.status || '')).length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 px-4 py-2 bg-gray-50 sticky top-0 z-10">
                    Active Tasks ({myTasks.filter(t => ['accepted', 'in_progress'].includes(t.status || '')).length})
                  </h3>
                  <div className="space-y-2 p-2">
                    {myTasks
                      .filter(t => ['accepted', 'in_progress'].includes(t.status || ''))
                      .map((task) => (
                        <div key={task.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => {
                                setShowMyTasks(false);
                                onNavigate('task-detail', { taskId: task.id });
                              }}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{task.title}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  task.status === 'accepted' ? 'bg-blue-50 text-blue-700' : 
                                  task.status === 'in_progress' ? 'bg-[#CDFF00] text-black' :
                                  'bg-gray-50 text-gray-700'
                                }`}>
                                  {task.status === 'in_progress' ? 'In Progress' : task.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                              {task.price && (
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: '#CDFF00' }}>
                                  <span className="text-xs font-bold text-black">Earn ₹{task.price.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => {
                                  setShowMyTasks(false);
                                  onNavigate('create-task', { editMode: true, taskId: task.id, task });
                                }}
                                className="px-3 py-1.5 text-xs border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setShowMyTasks(false);
                                  onNavigate('task-detail', { taskId: task.id });
                                }}
                                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Section: Open Tasks */}
              {myTasks.filter(t => t.status === 'open').length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 px-4 py-2 bg-gray-50 sticky top-0 z-10">
                    Open Tasks ({myTasks.filter(t => t.status === 'open').length})
                  </h3>
                  <div className="space-y-2 p-2">
                    {myTasks
                      .filter(t => t.status === 'open')
                      .map((task) => (
                        <div key={task.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => {
                                setShowMyTasks(false);
                                onNavigate('task-detail', { taskId: task.id });
                              }}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{task.title}</h3>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#CDFF00] text-black">
                                  Open
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                              {task.price && (
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: '#CDFF00' }}>
                                  <span className="text-xs font-bold text-black">Earn ₹{task.price.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => {
                                  setShowMyTasks(false);
                                  onNavigate('create-task', { editMode: true, taskId: task.id, task });
                                }}
                                className="px-3 py-1.5 text-xs border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setShowMyTasks(false);
                                  onNavigate('task-detail', { taskId: task.id });
                                }}
                                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Section: Completed Tasks */}
              {myTasks.filter(t => t.status === 'completed').length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 px-4 py-2 bg-gray-50 sticky top-0 z-10">
                    Completed Tasks ({myTasks.filter(t => t.status === 'completed').length})
                  </h3>
                  <div className="space-y-2 p-2">
                    {myTasks
                      .filter(t => t.status === 'completed')
                      .map((task) => (
                        <div key={task.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => {
                                setShowMyTasks(false);
                                onNavigate('task-detail', { taskId: task.id });
                              }}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{task.title}</h3>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-black">
                                  Completed
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                              {task.price && (
                                <p className="text-sm font-medium text-primary">Earn ₹{task.price.toLocaleString('en-IN')}</p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => {
                                  setShowMyTasks(false);
                                  onNavigate('task-detail', { taskId: task.id });
                                }}
                                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Screen Footer */}
      <AppFooter 
        onNavigate={onNavigate}
        onContactClick={onContactClick || (() => {})}
        socialLinks={socialLinks}
      />
    </div>
  );
}