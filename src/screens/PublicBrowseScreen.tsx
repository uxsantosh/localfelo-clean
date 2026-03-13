import React, { useState, useEffect } from 'react';
import { Filter, MapPin, Search, X, List, Map as MapIcon } from 'lucide-react';
import { TaskCard } from '../components/TaskCard';
import { WishCard } from '../components/WishCard';
import { ListingCard } from '../components/ListingCard';
import { MapView } from '../components/MapView';
import { getAllPublicTasks } from '../services/helperTaskMatching';
import { getWishes } from '../services/wishes';
import { getListings } from '../services/listings';
import { SERVICE_CATEGORIES } from '../services/serviceCategories';
import { Task } from '../types';
import { calculateDistance } from '../utils/distance';

interface PublicBrowseScreenProps {
  userLocation: { latitude: number; longitude: number } | null;
  onTaskClick?: (task: Task) => void;
  onWishClick?: (wish: any) => void;
  onListingClick?: (listing: any) => void;
  onNavigate?: (screen: string, params?: any) => void;
}

type ContentType = 'tasks' | 'wishes' | 'marketplace';
type ViewMode = 'list' | 'map';

export function PublicBrowseScreen({
  userLocation,
  onTaskClick,
  onWishClick,
  onListingClick,
  onNavigate
}: PublicBrowseScreenProps) {
  const [activeTab, setActiveTab] = useState<ContentType>('tasks');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [wishes, setWishes] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  
  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(50); // km
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContent();
  }, [activeTab, selectedCategories, maxDistance, userLocation]);

  const loadContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tasks') {
        const tasksData = await getAllPublicTasks({
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
          maxDistance: userLocation ? maxDistance : undefined,
          userLat: userLocation?.latitude,
          userLon: userLocation?.longitude,
          limit: 100
        });
        setTasks(tasksData);
      } else if (activeTab === 'wishes') {
        const wishesData = await getWishes({
          limit: 100
        });
        setWishes(filterByDistanceAndCategory(wishesData.wishes || [], 'wishes'));
      } else if (activeTab === 'marketplace') {
        const listingsData = await getListings({
          limit: 100
        });
        setListings(filterByDistanceAndCategory(listingsData.listings || [], 'marketplace'));
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByDistanceAndCategory = (items: any[], type: string) => {
    let filtered = items;

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => {
        const itemCategory = item.category || item.detected_category;
        return selectedCategories.includes(itemCategory);
      });
    }

    // Filter by distance
    if (userLocation && maxDistance) {
      filtered = filtered.filter(item => {
        if (!item.latitude || !item.longitude) return false;
        
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          item.latitude,
          item.longitude
        );
        
        return distance <= maxDistance;
      });
    }

    // Sort by recency (newest first)
    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return filtered;
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
    setMaxDistance(50);
    setSearchQuery('');
  };

  const getFilteredContent = () => {
    let content: any[] = [];
    
    if (activeTab === 'tasks') content = tasks;
    else if (activeTab === 'wishes') content = wishes;
    else if (activeTab === 'marketplace') content = listings;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      content = content.filter(item => 
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    return content;
  };

  const filteredContent = getFilteredContent();
  const hasActiveFilters = selectedCategories.length > 0 || searchQuery.trim() !== '';

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E5E5E5]">
        <div className="px-4 py-3">
          <h1 className="font-bold text-xl mb-3">Browse LocalFelo</h1>
          
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#CDFF00]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-[#737373]" />
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-[#CDFF00] text-black'
                  : 'bg-[#F5F5F5] text-[#737373]'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('wishes')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'wishes'
                  ? 'bg-[#CDFF00] text-black'
                  : 'bg-[#F5F5F5] text-[#737373]'
              }`}
            >
              Wishes
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'marketplace'
                  ? 'bg-[#CDFF00] text-black'
                  : 'bg-[#F5F5F5] text-[#737373]'
              }`}
            >
              Market
            </button>
          </div>

          {/* Filter & View Mode Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                hasActiveFilters
                  ? 'bg-[#CDFF00] border-[#CDFF00] text-black'
                  : 'bg-white border-[#E5E5E5] text-[#737373]'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                {hasActiveFilters ? `Filters (${selectedCategories.length})` : 'Filters'}
              </span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-[#737373] underline"
              >
                Clear all
              </button>
            )}

            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-[#CDFF00]' : 'bg-[#F5F5F5]'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'map' ? 'bg-[#CDFF00]' : 'bg-[#F5F5F5]'
                }`}
              >
                <MapIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="px-4 py-4 bg-[#F5F5F5] border-t border-[#E5E5E5]">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_CATEGORIES.slice(0, 10).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryToggle(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategories.includes(cat.id)
                        ? 'bg-[#CDFF00] text-black border border-[#CDFF00]'
                        : 'bg-white text-[#737373] border border-[#E5E5E5]'
                    }`}
                  >
                    {cat.emoji} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {userLocation && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Distance: {maxDistance} km
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-[#CDFF00] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#737373] mt-4">Loading...</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredContent.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#737373]">No {activeTab} found</p>
              </div>
            ) : (
              filteredContent.map(item => {
                if (activeTab === 'tasks') {
                  return (
                    <TaskCard
                      key={item.id}
                      task={item}
                      onClick={() => onTaskClick?.(item)}
                      userLocation={userLocation}
                    />
                  );
                } else if (activeTab === 'wishes') {
                  return (
                    <WishCard
                      key={item.id}
                      wish={item}
                      onClick={() => onWishClick?.(item)}
                      userLocation={userLocation}
                    />
                  );
                } else {
                  return (
                    <ListingCard
                      key={item.id}
                      listing={item}
                      onClick={() => onListingClick?.(item)}
                      userLocation={userLocation}
                    />
                  );
                }
              })
            )}
          </div>
        ) : (
          <MapView
            items={filteredContent}
            userLocation={userLocation}
            onItemClick={(item) => {
              if (activeTab === 'tasks') onTaskClick?.(item);
              else if (activeTab === 'wishes') onWishClick?.(item);
              else onListingClick?.(item);
            }}
          />
        )}
      </div>
    </div>
  );
}
