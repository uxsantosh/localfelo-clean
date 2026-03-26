import React, { useState, useEffect } from 'react';
import { Search, X, ShoppingBag, Heart, Briefcase, Sparkles, Package } from 'lucide-react';
import { Modal } from './Modal';
import { LocalFeloLoader } from './LocalFeloLoader';
import { Listing, Wish, Task } from '../types';
import { getListings } from '../services/listings';
import { getWishes } from '../services/wishes';
import { getTasks } from '../services/tasks';
import { getAllCategories } from '../services/categories';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string, data?: any) => void;
  userCoordinates?: { latitude: number; longitude: number } | null;
}

export function GlobalSearchModal({ isOpen, onClose, onNavigate, userCoordinates }: GlobalSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    listings: Listing[];
    wishes: Wish[];
    tasks: Task[];
  }>({
    listings: [],
    wishes: [],
    tasks: []
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getAllCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Perform search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ listings: [], wishes: [], tasks: [] });
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const query = searchQuery.toLowerCase();

        // Find matching categories for the search query
        const matchingCategories = categories.filter(cat => 
          cat.name.toLowerCase().includes(query) || 
          cat.slug.toLowerCase().includes(query)
        ).map(cat => cat.id);

        // Search listings
        const allListings = await getListings({
          limit: 1000,
          userLat: userCoordinates?.latitude,
          userLon: userCoordinates?.longitude
        });
        
        const filteredListings = (allListings.data || allListings).filter((l: any) => {
          const textMatch = l.title.toLowerCase().includes(query) ||
                           l.description.toLowerCase().includes(query);
          const categoryMatch = l.categoryName?.toLowerCase().includes(query);
          const belongsToMatchingCategory = matchingCategories.includes(String(l.categoryId));
          return textMatch || categoryMatch || belongsToMatchingCategory;
        });

        // Sort by distance if available
        if (userCoordinates) {
          filteredListings.sort((a, b) => {
            if (a.distance !== undefined && b.distance === undefined) return -1;
            if (a.distance === undefined && b.distance !== undefined) return 1;
            if (a.distance === undefined && b.distance === undefined) return 0;
            return a.distance - b.distance;
          });
        }

        // Search wishes
        const wishesResult = await getWishes();
        const filteredWishes = (wishesResult.wishes || []).filter(w => 
          w.title.toLowerCase().includes(query) ||
          w.description?.toLowerCase().includes(query)
        ).slice(0, 5);

        // Search tasks
        const tasksResult = await getTasks(undefined, undefined, undefined);
        const filteredTasks = (tasksResult.tasks || []).filter(t => 
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
        ).slice(0, 5);

        setSearchResults({
          listings: filteredListings.slice(0, 10),
          wishes: filteredWishes,
          tasks: filteredTasks
        });
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, categories, userCoordinates]);

  const totalResults = searchResults.listings.length + searchResults.wishes.length + searchResults.tasks.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="max-w-3xl mx-auto">
        {/* Header with Search */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-[#CDFF00]" />
            <h2 className="text-2xl font-bold">Smart Search</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">Search across buy&sell, wishes, and tasks</p>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Try 'phone', 'furniture', 'cleaning'..."
              className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent text-base"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <LocalFeloLoader size="md" text="Searching..." />
            </div>
          ) : searchQuery.trim() === '' ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Start typing to search...</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No results found for "{searchQuery}"</p>
              <p className="text-sm mt-1">Try different keywords</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Listings */}
              {searchResults.listings.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-gray-600" />
                    <h3 className="font-bold text-sm text-gray-700">MARKETPLACE ({searchResults.listings.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {searchResults.listings.map(listing => (
                      <button
                        key={listing.id}
                        onClick={() => {
                          onNavigate('listing', listing);
                          onClose();
                        }}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-[#CDFF00] hover:bg-gray-50 transition-all"
                      >
                        <div className="flex gap-3">
                          {listing.imageUrl && (
                            <img src={listing.imageUrl} alt={listing.title} className="w-16 h-16 object-cover rounded" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{listing.title}</p>
                            <p className="text-sm text-gray-600 truncate">{listing.categoryName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-bold text-white bg-black px-2 py-0.5 rounded text-sm">₹{listing.price}</span>
                              {listing.distance !== undefined && (
                                <span className="text-xs text-gray-500">{listing.distance.toFixed(1)} km away</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Wishes */}
              {searchResults.wishes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 text-gray-600" />
                    <h3 className="font-bold text-sm text-gray-700">WISHES ({searchResults.wishes.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {searchResults.wishes.map(wish => (
                      <button
                        key={wish.id}
                        onClick={() => {
                          onNavigate('wish-detail', { wishId: wish.id });
                          onClose();
                        }}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-[#CDFF00] hover:bg-gray-50 transition-all"
                      >
                        <p className="font-semibold">{wish.title}</p>
                        {wish.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{wish.description}</p>
                        )}
                        {wish.budget && (
                          <p className="text-sm font-bold text-black mt-1">Budget: ₹{wish.budget}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {searchResults.tasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-4 h-4 text-gray-600" />
                    <h3 className="font-bold text-sm text-gray-700">TASKS ({searchResults.tasks.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {searchResults.tasks.map(task => {
                      const hasImage = task.images && task.images.length > 0;
                      
                      return (
                        <button
                          key={task.id}
                          onClick={() => {
                            onNavigate('task-detail', { taskId: task.id });
                            onClose();
                          }}
                          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-[#CDFF00] hover:bg-gray-50 transition-all"
                        >
                          <div className="flex gap-3">
                            {/* Thumbnail - Always show (image or logo placeholder) */}
                            <div 
                              className="shrink-0 rounded overflow-hidden flex items-center justify-center"
                              style={{ 
                                width: '70px', 
                                height: '70px',
                                backgroundColor: hasImage ? '#f3f4f6' : '#f9fafb'
                              }}
                            >
                              {hasImage ? (
                                <img
                                  src={task.images![0]}
                                  alt={task.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg 
                                  width="36" 
                                  height="36" 
                                  viewBox="0 0 512 512" 
                                  fill="none" 
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ opacity: 0.15 }}
                                >
                                  <path d="M277.733 260.882L422.578 392.385L374.81 445L228.989 312.609L105.72 443.426L54 394.69L213.792 225.115H79.8604V154.05H378.403L277.733 260.882ZM458.997 229.461L410.066 280.999L339.476 213.979L388.404 162.44L458.997 229.461ZM411.179 48C437.167 48.0002 458.235 69.0681 458.235 95.0566C458.235 121.045 437.167 142.113 411.179 142.113C385.19 142.113 364.121 121.045 364.121 95.0566C364.121 69.068 385.19 48 411.179 48Z" fill="currentColor"/>
                                </svg>
                              )}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold line-clamp-1">{task.title}</p>
                              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{task.description}</p>
                              {task.budget && (
                                <p className="text-sm font-bold text-black mt-1">Budget: ₹{task.budget}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}