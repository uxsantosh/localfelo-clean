import React, { useState, useEffect } from 'react';
import { Activity, Bell, MapPin, AlertCircle, ArrowLeft, Clock, Map, List, Settings, Filter } from 'lucide-react';
import { HelperAvailabilityConfirmDialog } from '../components/HelperAvailabilityConfirmDialog';
import { RadarAnimation } from '../components/RadarAnimation';
import { MapView } from '../components/MapView';
import { TaskCard } from '../components/TaskCard';
import { getMatchingTasksForHelper, updateHelperLocation, MatchedTask } from '../services/helperTaskMatching';
import { toggleHelperAvailability } from '../services/helper';
import { Task } from '../types';
import { SERVICE_CATEGORIES } from '../services/serviceCategories';

interface HelperReadyModeScreenProps {
  onBack: () => void;
  onTaskClick: (task: Task) => void;
  onNavigate?: (screen: string) => void;
  userId: string;
  userLocation: { latitude: number; longitude: number } | null;
  onHelperStatusChange?: (isAvailable: boolean) => void;
}

type SortOption = 'match_score' | 'nearest' | 'newest';
type ViewMode = 'list' | 'map';

export function HelperReadyModeScreen({ 
  onBack, 
  onTaskClick,
  onNavigate,
  userId,
  userLocation,
  onHelperStatusChange
}: HelperReadyModeScreenProps) {
  const [tasks, setTasks] = useState<MatchedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('match_score');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    loadMatchingTasks();
    
    // Update helper location when available
    if (userLocation) {
      updateHelperLocation(userId, userLocation.latitude, userLocation.longitude);
    }
    
    // Refresh every 30 seconds
    const interval = setInterval(loadMatchingTasks, 30000);
    return () => clearInterval(interval);
  }, [userLocation, userId]);

  const loadMatchingTasks = async () => {
    try {
      setLoading(true);
      // Use new database-based matching
      const matchedTasks = await getMatchingTasksForHelper(userId, 100);
      
      // Filter out user's own tasks
      const availableTasks = matchedTasks.filter(task => task.userId !== userId);
      
      setTasks(availableTasks);
    } catch (error) {
      console.error('Error loading matching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableModeRequest = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    await toggleHelperAvailability(userId, false);
    onBack();
    if (onHelperStatusChange) onHelperStatusChange(false);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  const getSortedTasks = () => {
    let sorted = [...tasks];
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      sorted = sorted.filter(task => 
        task.detected_category && selectedCategories.includes(task.detected_category)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'match_score':
        return sorted.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      
      case 'nearest':
        return sorted.sort((a, b) => {
          const distA = a.distance_km ?? Infinity;
          const distB = b.distance_km ?? Infinity;
          return distA - distB;
        });
      
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      
      default:
        return sorted;
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
  };

  const sortedTasks = getSortedTasks();
  const hasActiveFilters = selectedCategories.length > 0;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E5E5E5]">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold">Helper Mode</h1>
          {onNavigate && (
            <button
              onClick={() => onNavigate('helper-preferences')}
              className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors"
              title="Set Preferences"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Status indicator with toggle button inline */}
        <div className="px-4 pb-3">
          <div className="bg-[#CDFF00] px-3 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-black">
                Available for tasks
              </span>
            </div>
            <button
              onClick={handleDisableModeRequest}
              className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              Turn Off
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
        </div>
      ) : tasks.length === 0 ? (
        // STATE B: No tasks available
        <RadarAnimation />
      ) : (
        // STATE A: Tasks available
        <div className="page-container">
          {/* Filters and View Toggle */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Sort filters */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
              <button
                onClick={() => setSortBy('match_score')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  sortBy === 'match_score'
                    ? 'bg-black text-white'
                    : 'bg-[#F5F5F5] text-black hover:bg-[#E5E5E5]'
                }`}
              >
                Best Match
              </button>
              <button
                onClick={() => setSortBy('nearest')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  sortBy === 'nearest'
                    ? 'bg-black text-white'
                    : 'bg-[#F5F5F5] text-black hover:bg-[#E5E5E5]'
                }`}
              >
                Nearest
              </button>
              <button
                onClick={() => setSortBy('newest')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  sortBy === 'newest'
                    ? 'bg-black text-white'
                    : 'bg-[#F5F5F5] text-black hover:bg-[#E5E5E5]'
                }`}
              >
                Newest
              </button>
            </div>

            {/* Map/List Toggle */}
            <div className="flex bg-[#F5F5F5] rounded-full p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-white/50'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-full transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-white/50'
                }`}
                aria-label="Map view"
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Task count */}
          <p className="text-xs text-[#666666] mb-3">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} nearby
          </p>

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-2">
              {sortedTasks.map((task) => {
                return (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="w-full bg-white border border-[#E5E5E5] p-3 hover:border-[#CDFF00] transition-colors text-left"
                  >
                    {/* Reward and distance */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1 text-black font-bold">
                        <span>₹{task.reward}</span>
                      </div>
                      {task.distance_km !== null && (
                        <div className="flex items-center gap-1 text-[#d97706] text-xs font-medium">
                          <MapPin className="w-3 h-3" />
                          <span>{task.distance_km.toFixed(1)} km</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-black text-sm mb-1 line-clamp-1">
                      {task.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[#666666] line-clamp-2 mb-1.5">
                      {task.description}
                    </p>

                    {/* Time */}
                    <div className="flex items-center gap-1 text-xs text-[#999999]">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeAgo(task.created_at)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Map View */}
          {viewMode === 'map' && (
            <div className="bg-white border border-[#E5E5E5] overflow-hidden" style={{ height: '500px' }}>
              <MapView
                markers={sortedTasks
                  .filter(task => task.latitude && task.longitude)
                  .map(task => ({
                    id: task.id,
                    latitude: task.latitude!,
                    longitude: task.longitude!,
                    title: task.title,
                    description: `₹${task.reward}`,
                    status: 'open'
                  }))}
                onMarkerClick={taskId => {
                  const task = tasks.find(t => t.id === taskId);
                  if (task) onTaskClick(task);
                }}
                userLocation={userLocation || undefined}
              />
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <HelperAvailabilityConfirmDialog
          isOpen={showConfirmDialog}
          isActivating={false}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}