import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Sparkles, X, Search, TrendingUp, Heart, Briefcase, Package } from 'lucide-react';
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
        const allWishes = await getWishes();
        const filteredWishes = allWishes.filter(w => 
          w.title.toLowerCase().includes(query) ||
          w.description?.toLowerCase().includes(query)
        ).slice(0, 5);

        // Search tasks
        const allTasks = await getTasks(undefined, undefined, undefined);
        const filteredTasks = allTasks.filter(t => 
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
          <p className="text-sm text-gray-600 mb-4">Search across marketplace, wishes, and tasks</p>
          
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
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin w-8 h-8 border-2 border-[#CDFF00] border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
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
                          <p className="text-sm font-medium text-[#CDFF00] mt-1">Budget: ₹{wish.budget}</p>
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
                    {searchResults.tasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => {
                          onNavigate('task-detail', { taskId: task.id });
                          onClose();
                        }}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-[#CDFF00] hover:bg-gray-50 transition-all"
                      >
                        <p className="font-semibold">{task.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                        {task.budget && (
                          <p className="text-sm font-medium text-[#CDFF00] mt-1">Budget: ₹{task.budget}</p>
                        )}
                      </button>
                    ))}
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