// =====================================================
// Admin - Wishes Management Tab
// View all wishes, delete inappropriate ones, filter by city/category
// =====================================================

import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Calendar, Trash2, Search, Filter as FilterIcon, X, ChevronDown, User } from 'lucide-react';
import { Wish } from '../../types';
import { getWishes } from '../../services/wishes';
import { deleteWish } from '../../services/wishes';
import { toast } from 'sonner';
import { City } from '../../types';
import { WishCard } from '../WishCard';
import { SelectField } from '../SelectField';
import { EmptyState } from '../EmptyState';
import { SkeletonLoader } from '../SkeletonLoader';
import { Sparkles } from 'lucide-react';
import { WISH_CATEGORIES } from '../../constants/wishCategories';

interface WishesManagementTabProps {
  cities: City[];
}

export function WishesManagementTab({ cities }: WishesManagementTabProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCityData = cities.find(c => c.id === selectedCity);

  // Load wishes with filters
  const loadWishes = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (selectedCity) filters.cityId = selectedCity;
      if (selectedArea) filters.areaId = selectedArea;
      if (selectedCategory) filters.categoryId = selectedCategory;
      if (searchQuery.trim()) filters.searchQuery = searchQuery.trim();

      const data = await getWishes(filters);
      setWishes(data);
    } catch (error) {
      console.error('Failed to load wishes:', error);
      toast.error('Failed to load wishes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishes();
  }, [selectedCity, selectedArea, selectedCategory, searchQuery]);

  const handleDelete = async (wishId: string) => {
    if (!confirm('Are you sure you want to delete this wish? This action cannot be undone.')) {
      return;
    }

    setDeleting(wishId);
    try {
      const result = await deleteWish(wishId);
      if (result.success) {
        toast.success('Wish deleted successfully');
        setWishes(wishes.filter(w => w.id !== wishId));
      } else {
        toast.error(result.error || 'Failed to delete wish');
      }
    } catch (error) {
      console.error('Failed to delete wish:', error);
      toast.error('Failed to delete wish');
    } finally {
      setDeleting(null);
    }
  };

  const clearFilters = () => {
    setSelectedCity('');
    setSelectedArea('');
    setSelectedCategory('');
    setSearchQuery('');
  };

  const activeFilterCount = [selectedCity, selectedArea, selectedCategory, searchQuery].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Wishes Management</span>
          </h2>
          <p className="text-sm text-muted">View and manage all wishes</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search wishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-[4px] text-sm focus:outline-none focus:border-primary"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-muted hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-[4px] p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Filters</h3>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:underline"
            >
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SelectField
            label="Category"
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value)}
          >
            <option value="">All Categories</option>
            {WISH_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.name}
              </option>
            ))}
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
              onChange={(value) => setSelectedArea(value)}
            >
              <option value="">All Areas</option>
              {selectedCityData.areas?.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </SelectField>
          )}
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="bg-card border border-border rounded-[4px] p-3">
          <p className="text-sm text-muted">
            Showing {wishes.length} {wishes.length === 1 ? 'wish' : 'wishes'}
            {activeFilterCount > 0 && ` with ${activeFilterCount} ${activeFilterCount === 1 ? 'filter' : 'filters'} applied`}
          </p>
        </div>
      )}

      {/* Wishes List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          <SkeletonLoader count={6} />
        </div>
      ) : wishes.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No wishes found"
          description={activeFilterCount > 0 
            ? "Try adjusting your filters to see more results" 
            : "No wishes have been posted yet"}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {wishes.map(wish => (
            <div key={wish.id} className="relative">
              <WishCard 
                wish={wish} 
                onClick={() => {}} 
              />
              
              {/* Admin Actions */}
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => handleDelete(wish.id)}
                  disabled={deleting === wish.id}
                  className="p-2 bg-red-500/10 text-red-600 rounded-[4px] hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  title="Delete wish"
                >
                  {deleting === wish.id ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}