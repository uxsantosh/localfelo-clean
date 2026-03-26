// =====================================================
// PROFESSIONALS LISTING BY ROLE SCREEN - 2026 MODERN UI
// =====================================================
// Shows professionals filtered by role with distance filters and map view

import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, SlidersHorizontal, Map as MapIcon, List } from 'lucide-react';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { MapView } from '../components/MapView';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { getProfessionalsByRole, getRoleById } from '../services/roles';
import { Header } from '../components/Header';
import type { Professional } from '../services/professionals';
import type { RoleWithSubcategories } from '../services/roles';
import { toast } from 'react-toastify';

interface ProfessionalsListingRoleScreenProps {
  roleId: string;
  roleName: string;
  city: string;
  userLat?: number;
  userLng?: number;
  onNavigate: (screen: string, params?: any) => void;
  onBack: () => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
  unreadCount?: number;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onLocationClick?: () => void;
  onMenuClick?: () => void;
  onGlobalSearchClick?: () => void;
  showGlobalLocation?: boolean;
  globalLocationArea?: string;
  globalLocationCity?: string;
  onShowAuthModal?: () => void;  // ✅ ADD: Callback to show auth modal
}

export function ProfessionalsListingRoleScreen({
  roleId,
  roleName,
  city,
  userLat,
  userLng,
  onNavigate,
  onBack,
  isLoggedIn,
  isAdmin,
  userDisplayName,
  unreadCount,
  notificationCount,
  onNotificationClick,
  onLocationClick,
  onMenuClick,
  onGlobalSearchClick,
  showGlobalLocation,
  globalLocationArea,
  globalLocationCity,
  onShowAuthModal,  // ✅ ADD: Callback to show auth modal
}: ProfessionalsListingRoleScreenProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [role, setRole] = useState<RoleWithSubcategories | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number | undefined>(undefined);
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState<string | undefined>();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load role details
  useEffect(() => {
    loadRoleDetails();
  }, [roleId]);

  // Load professionals
  useEffect(() => {
    loadProfessionals();
  }, [roleId, city, maxDistance, selectedSubcategoryFilter]);

  const loadRoleDetails = async () => {
    const result = await getRoleById(roleId);
    if (result.success && result.role) {
      setRole(result.role);
    }
  };

  const loadProfessionals = async () => {
    setLoading(true);
    try {
      const result = await getProfessionalsByRole(roleId, city, 100);
      if (result.success && result.professionals) {
        let filtered = result.professionals;

        // Calculate distances if user location available
        if (userLat && userLng) {
          filtered = filtered.map(prof => {
            if (prof.latitude && prof.longitude) {
              const distance = calculateDistance(
                userLat,
                userLng,
                prof.latitude,
                prof.longitude
              );
              return { ...prof, distance };
            }
            return prof;
          });

          // Sort by distance
          filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));

          // Filter by max distance
          if (maxDistance) {
            filtered = filtered.filter(prof => prof.distance && prof.distance <= maxDistance);
          }
        }

        // Filter by subcategory if selected
        if (selectedSubcategoryFilter) {
          filtered = filtered.filter(prof =>
            prof.subcategory_ids?.includes(selectedSubcategoryFilter)
          );
        }

        setProfessionals(filtered);
      }
    } catch (error) {
      console.error('Error loading professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleViewDetails = (professional: Professional) => {
    onNavigate('professional-detail', undefined, { professionalSlug: professional.slug });
  };

  const handleWhatsAppClick = (professional: Professional) => {
    // ✅ Require login before allowing WhatsApp contact
    if (!isLoggedIn) {
      toast.error('Please login to contact professionals');
      if (onShowAuthModal) {
        onShowAuthModal();
      }
      return;
    }

    const message = encodeURIComponent(
      `Hi ${professional.name}, I found you on LocalFelo. Are you available for ${roleName} services?`
    );
    window.open(`https://wa.me/${professional.whatsapp}?text=${message}`, '_blank');
  };

  const handleMapMarkerClick = (id: string) => {
    const professional = professionals.find(p => p.id === id);
    if (professional) {
      handleViewDetails(professional);
    }
  };

  const mapMarkers = professionals
    .filter(p => p.latitude && p.longitude)
    .map(p => ({
      id: p.id,
      latitude: p.latitude!,
      longitude: p.longitude!,
      title: p.name,
      type: 'listing' as const,
    }));

  const distanceOptions = [
    { value: undefined, label: 'Any Distance' },
    { value: 5, label: 'Within 5 km' },
    { value: 10, label: 'Within 10 km' },
    { value: 25, label: 'Within 25 km' },
    { value: 50, label: 'Within 50 km' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <Header
        currentScreen="professionals"
        onNavigate={(screen) => onNavigate(screen)}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
        unreadCount={unreadCount}
        notificationCount={notificationCount}
        onNotificationClick={onNotificationClick}
        onLocationClick={onLocationClick}
        onMenuClick={onMenuClick}
        onGlobalSearchClick={onGlobalSearchClick}
        showGlobalLocation={showGlobalLocation}
        globalLocationArea={globalLocationArea}
        globalLocationCity={globalLocationCity}
      />

      {/* Subheader */}
      <div className="sticky top-14 md:top-14 z-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="font-bold text-black">{roleName}</h1>
                <p className="text-xs text-gray-600">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {globalLocationArea && `${globalLocationArea}, `}{city}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <SlidersHorizontal className="w-5 h-5 text-gray-700" />
                {(maxDistance || selectedSubcategoryFilter) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#CDFF00] rounded-full" />
                )}
              </button>
              {professionals.some(p => p.latitude && p.longitude) && (
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`p-2 rounded-lg transition-colors ${
                    showMap ? 'bg-[#CDFF00] text-black' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <MapIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-4">
            <div className="max-w-7xl mx-auto space-y-3">
              {/* Distance Filter */}
              {userLat && userLng && (
                <div>
                  <label className="block text-xs font-semibold text-black mb-1">
                    Distance
                  </label>
                  <select
                    value={maxDistance || ''}
                    onChange={(e) => setMaxDistance(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                  >
                    {distanceOptions.map((opt) => (
                      <option key={opt.label} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Subcategory Filter */}
              {role && role.subcategories && role.subcategories.length > 1 && (
                <div>
                  <label className="block text-xs font-semibold text-black mb-1">
                    Service Type
                  </label>
                  <select
                    value={selectedSubcategoryFilter || ''}
                    onChange={(e) => setSelectedSubcategoryFilter(e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                  >
                    <option value="">All Services</option>
                    {role.subcategories.map((sub) => (
                      <option key={sub.subcategory_id} value={sub.subcategory_id}>
                        {sub.subcategory_id}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Clear Filters */}
              {(maxDistance || selectedSubcategoryFilter) && (
                <button
                  onClick={() => {
                    setMaxDistance(undefined);
                    setSelectedSubcategoryFilter(undefined);
                  }}
                  className="text-sm text-black hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : showMap && mapMarkers.length > 0 ? (
          <div className="space-y-4">
            {/* Map Info Bar */}
            <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#CDFF00]/20 rounded-full flex items-center justify-center">
                  <MapIcon className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">
                    {mapMarkers.length} {mapMarkers.length === 1 ? 'professional' : 'professionals'} on map
                  </p>
                  <p className="text-xs text-gray-600">Tap any marker to view details</p>
                </div>
              </div>
              <button
                onClick={() => setShowMap(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-black transition-colors"
              >
                <List className="w-4 h-4 inline mr-1.5" />
                List View
              </button>
            </div>

            {/* Map Container */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100" style={{ height: '600px' }}>
              <MapView
                markers={mapMarkers}
                onMarkerClick={handleMapMarkerClick}
                userLocation={userLat && userLng ? { latitude: userLat, longitude: userLng } : undefined}
              />
            </div>
          </div>
        ) : professionals.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {professionals.length} {professionals.length === 1 ? 'professional' : 'professionals'} found
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onViewDetails={() => handleViewDetails(professional)}
                  onWhatsAppClick={() => handleWhatsAppClick(professional)}
                  showRole={true} // Show role instead of category
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={MapPin}
            title="No professionals found"
            message={`No ${roleName.toLowerCase()}s available in ${city} yet. Check back soon!`}
          />
        )}
      </div>
    </div>
  );
}