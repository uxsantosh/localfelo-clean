import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { City } from '../types';
import { SelectField } from './SelectField';
import { X } from 'lucide-react';

interface MarketplaceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  cities: City[];
  selectedCategory: string;
  selectedCity: string;
  selectedArea: string[];
  minPrice: number | undefined;
  maxPrice: number | undefined;
  maxDistance: number | undefined;
  onCategoryChange: (categoryId: string) => void;
  onCityChange: (cityId: string) => void;
  onAreaChange: (areaIds: string[]) => void;
  onPriceChange: (min: number | undefined, max: number | undefined) => void;
  onDistanceChange: (distance: number | undefined) => void;
  onApply: () => void;
  onClear: () => void;
  hasCoordinates: boolean;
}

export function MarketplaceFilterModal({
  isOpen,
  onClose,
  categories,
  cities,
  selectedCategory,
  selectedCity,
  selectedArea,
  minPrice,
  maxPrice,
  maxDistance,
  onCategoryChange,
  onCityChange,
  onAreaChange,
  onPriceChange,
  onDistanceChange,
  onApply,
  onClear,
  hasCoordinates
}: MarketplaceFilterModalProps) {
  const [tempCategory, setTempCategory] = useState(selectedCategory);
  const [tempCity, setTempCity] = useState(selectedCity);
  const [tempArea, setTempArea] = useState(selectedArea);
  const [tempMinPrice, setTempMinPrice] = useState<number | undefined>(minPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState<number | undefined>(maxPrice);
  const [tempMaxDistance, setTempMaxDistance] = useState<number | undefined>(maxDistance);

  const selectedCityObj = cities.find(c => c.id === tempCity);
  const availableAreas = selectedCityObj?.areas || [];

  // Sync with external state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempCategory(selectedCategory);
      setTempCity(selectedCity);
      setTempArea(selectedArea);
      setTempMinPrice(minPrice);
      setTempMaxPrice(maxPrice);
      setTempMaxDistance(maxDistance);
    }
  }, [isOpen, selectedCategory, selectedCity, selectedArea, minPrice, maxPrice, maxDistance]);

  const handleApply = () => {
    onCategoryChange(tempCategory);
    onCityChange(tempCity);
    onAreaChange(tempArea);
    onPriceChange(tempMinPrice, tempMaxPrice);
    onDistanceChange(tempMaxDistance);
    onApply();
    onClose();
  };

  const handleClear = () => {
    setTempCategory('');
    setTempCity('');
    setTempArea([]);
    setTempMinPrice(undefined);
    setTempMaxPrice(undefined);
    setTempMaxDistance(undefined);
    onClear();
  };

  const activeFilterCount = [
    tempCategory,
    tempCity,
    ...tempArea,
    tempMinPrice,
    tempMaxPrice,
    tempMaxDistance
  ].filter(Boolean).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter Listings">
      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-semibold mb-2">Category</label>
          <SelectField
            value={tempCategory}
            onChange={setTempCategory}
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map(cat => ({
                value: cat.id,
                label: `${cat.emoji} ${cat.name}`
              }))
            ]}
            placeholder="Select category"
          />
        </div>

        {/* Distance Filter - Only show if user has coordinates */}
        {hasCoordinates && (
          <div>
            <label className="block text-sm font-semibold mb-2">
              Maximum Distance
              {tempMaxDistance && <span className="text-gray-500 font-normal ml-2">({tempMaxDistance} km)</span>}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={tempMaxDistance || 50}
              onChange={(e) => setTempMaxDistance(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#CDFF00]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 km</span>
              <span>50 km</span>
            </div>
            {tempMaxDistance && (
              <button
                onClick={() => setTempMaxDistance(undefined)}
                className="text-xs text-gray-600 hover:text-black underline mt-1"
              >
                Remove distance filter
              </button>
            )}
          </div>
        )}

        {/* City Filter */}
        <div>
          <label className="block text-sm font-semibold mb-2">City</label>
          <SelectField
            value={tempCity}
            onChange={(cityId) => {
              setTempCity(cityId);
              setTempArea([]); // Clear area selection when city changes
            }}
            options={[
              { value: '', label: 'All Cities' },
              ...cities.map(city => ({
                value: city.id,
                label: city.name
              }))
            ]}
            placeholder="Select city"
          />
        </div>

        {/* Area Filter - Only show if city is selected */}
        {tempCity && availableAreas.length > 0 && (
          <div>
            <label className="block text-sm font-semibold mb-2">
              Areas ({tempArea.length} selected)
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
              {availableAreas.map(area => (
                <label
                  key={area.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={tempArea.includes(area.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTempArea([...tempArea, area.id]);
                      } else {
                        setTempArea(tempArea.filter(id => id !== area.id));
                      }
                    }}
                    className="w-4 h-4 accent-[#CDFF00]"
                  />
                  <span className="text-sm">{area.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-semibold mb-2">Price Range</label>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <input
                type="number"
                value={tempMinPrice || ''}
                onChange={(e) => setTempMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Min price"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
              />
            </div>
            <span className="text-gray-400">—</span>
            <div className="flex-1">
              <input
                type="number"
                value={tempMaxPrice || ''}
                onChange={(e) => setTempMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Max price"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
          >
            Clear All {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2.5 bg-[#CDFF00] text-black rounded-lg hover:bg-[#b8e600] font-bold transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </Modal>
  );
}
