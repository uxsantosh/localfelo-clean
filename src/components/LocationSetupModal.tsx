// =====================================================
// Location Setup Modal - 3-Level Selection
// City → Area → Sub-Area (Road Level)
// =====================================================

import { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { City } from '../types';

interface LocationSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  cities: City[];
  onSetLocation: (data: {
    city: string;
    area: string;
    subArea?: string;
    isGPS: boolean;
  }) => void;
  // NEW: Current location for pre-population
  currentLocation?: {
    cityId?: string;
    areaId?: string;
    subAreaId?: string;
  };
  // NEW: Is this mandatory (first time) or optional (change location)
  isMandatory?: boolean;
}

export function LocationSetupModal({
  isOpen,
  onClose,
  cities,
  onSetLocation,
  currentLocation,
  isMandatory = false,
}: LocationSetupModalProps) {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedSubArea, setSelectedSubArea] = useState('');

  // Pre-populate with current location when modal opens
  useEffect(() => {
    if (isOpen && currentLocation && cities.length > 0) {
      console.log('🔄 [LocationSetupModal] Pre-populating with current location:', currentLocation);
      console.log('🔄 [LocationSetupModal] Available cities:', cities.length);
      
      // Set city first
      if (currentLocation.cityId) {
        setSelectedCity(currentLocation.cityId);
        console.log('🔄 [LocationSetupModal] Set city to:', currentLocation.cityId);
      }
      
      // Then set area (after city is set)
      if (currentLocation.areaId) {
        setSelectedArea(currentLocation.areaId);
        console.log('🔄 [LocationSetupModal] Set area to:', currentLocation.areaId);
      }
      
      // Finally set sub-area (after area is set)
      if (currentLocation.subAreaId) {
        setSelectedSubArea(currentLocation.subAreaId);
        console.log('🔄 [LocationSetupModal] Set sub-area to:', currentLocation.subAreaId);
      }
    } else if (isOpen && !currentLocation) {
      // Modal opened without current location (first time) - reset selections
      console.log('🔄 [LocationSetupModal] No current location, resetting selections');
      setSelectedCity('');
      setSelectedArea('');
      setSelectedSubArea('');
    }
  }, [isOpen, currentLocation, cities.length]);

  // Get areas for selected city
  const selectedCityData = cities.find(c => c.id === selectedCity);
  const areas = selectedCityData?.areas || [];
  
  // Get sub-areas for selected area
  const selectedAreaData = areas.find(a => a.id === selectedArea);
  const subAreas = selectedAreaData?.sub_areas || [];

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('🗺️ [LocationSetupModal] Modal opened');
      console.log('🗺️ [LocationSetupModal] Is Mandatory:', isMandatory);
      console.log('🗺️ [LocationSetupModal] Current Location:', currentLocation);
      console.log('🗺️ [LocationSetupModal] Total cities:', cities.length);
      console.log('🗺️ [LocationSetupModal] Selected City ID:', selectedCity);
      console.log('🗺️ [LocationSetupModal] Available Areas:', areas.length);
      console.log('🗺️ [LocationSetupModal] Selected Area ID:', selectedArea);
      console.log('🗺️ [LocationSetupModal] Available Sub-Areas:', subAreas.length);
    }
  }, [isOpen, selectedCity, selectedArea, cities.length, areas.length, subAreas.length]);

  const handleSubmit = () => {
    console.log('🚀 [LocationSetupModal] Submit clicked');
    console.log('🚀 [LocationSetupModal] City:', selectedCity);
    console.log('🚀 [LocationSetupModal] Area:', selectedArea);
    console.log('🚀 [LocationSetupModal] Sub-Area:', selectedSubArea);
    
    if (selectedCity && selectedArea) {
      console.log('✅ [LocationSetupModal] Validation passed, calling onSetLocation');
      onSetLocation({
        city: selectedCity,
        area: selectedArea,
        subArea: selectedSubArea || undefined,
        isGPS: false,
      });
    } else {
      console.log('❌ [LocationSetupModal] Validation failed');
      if (!selectedCity) console.log('  - Missing city');
      if (!selectedArea) console.log('  - Missing area');
    }
  };

  // City and Area are required, Sub-Area is optional
  const canSubmit = selectedCity && selectedArea;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold m-0">
                {currentLocation?.cityId ? 'Update Your Location' : 'Set Your Location'}
              </h2>
            </div>
            {/* Show close button only if NOT mandatory */}
            {!isMandatory && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-xs text-muted mt-1">
            {isMandatory ? 'We will show you nearby items' : 'We will show you nearby items'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* 3-Level Dropdown Selection */}
          <div className="space-y-4">
            {/* Level 1: City */}
            <div>
              <label className="block text-sm font-medium mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  console.log('🌆 [LocationSetupModal] City changed to:', e.target.value);
                  setSelectedCity(e.target.value);
                  setSelectedArea('');
                  setSelectedSubArea('');
                }}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:border-primary bg-white"
              >
                <option value="">Select City</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level 2: Area (shows when city is selected) */}
            {selectedCity && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium mb-2">
                  Area <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => {
                    console.log('📍 [LocationSetupModal] Area changed to:', e.target.value);
                    setSelectedArea(e.target.value);
                    setSelectedSubArea('');
                  }}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:border-primary bg-white"
                >
                  <option value="">Select Area</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
                {areas.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ No areas available for this city
                  </p>
                )}
              </div>
            )}

            {/* Level 3: Sub-Area (shows when area is selected AND has sub-areas) */}
            {selectedArea && subAreas.length > 0 && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium mb-2">
                  Sub-Area / Road{' '}
                  <span className="text-xs text-muted font-normal">(Optional)</span>
                </label>
                <select
                  value={selectedSubArea}
                  onChange={(e) => {
                    console.log('🛣️ [LocationSetupModal] Sub-Area changed to:', e.target.value);
                    setSelectedSubArea(e.target.value);
                  }}
                  className="w-full p-3 border border-primary rounded-lg focus:outline-none focus:border-primary bg-[#f8f9fa]"
                >
                  <option value="">General Area (No Specific Sub-Area)</option>
                  {subAreas.map((subArea: any) => (
                    <option key={subArea.id} value={subArea.id}>
                      {subArea.name}
                      {subArea.landmark && ` (${subArea.landmark})`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {canSubmit ? 'Continue' : 'Select City and Area'}
          </button>
          
          {/* Validation feedback */}
          {!canSubmit && (
            <p className="text-xs text-red-500 mt-2 text-center m-0">
              {!selectedCity && '⚠️ Please select a city'}
              {selectedCity && !selectedArea && '⚠️ Please select an area'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}