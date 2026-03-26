import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, SlidersHorizontal, Map as MapIcon } from 'lucide-react';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { MapView } from '../components/MapView';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { getProfessionalsByCategory, Professional } from '../services/professionals';
import { Header } from '../components/Header';

interface ProfessionalsListingScreenProps {
  categoryId: string;
  categoryName: string;
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
}

export function ProfessionalsListingScreen({
  categoryId,
  categoryName,
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
}: ProfessionalsListingScreenProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number | undefined>(undefined);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load professionals
  useEffect(() => {
    loadProfessionals();
  }, [categoryId, city, maxDistance]);

  const loadProfessionals = async () => {
    setLoading(true);
    try {
      const data = await getProfessionalsByCategory(categoryId, city, {
        userLat,
        userLng,
        maxDistance,
      });
      setProfessionals(data);
    } catch (error) {
      console.error('Error loading professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (professional: Professional) => {
    onNavigate('professional-detail', undefined, { professionalSlug: professional.slug });
  };

  const handleWhatsAppClick = (professional: Professional) => {
    const message = encodeURIComponent(
      `Hi ${professional.name}, I found you on LocalFelo. Are you available for ${categoryName}?`
    );
    window.open(`https://wa.me/${professional.whatsapp}?text=${message}`, '_blank');
  };

  const handleMapMarkerClick = (professional: Professional) => {
    handleViewDetails(professional);
  };

  const mapMarkers = professionals
    .filter((p) => p.latitude && p.longitude)
    .map((p) => ({
      id: p.id,
      latitude: p.latitude!,
      longitude: p.longitude!,
      title: p.name,
      description: p.title,
    }));

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
      
      {/* Sub-header with back button and map toggle */}
      <div className="bg-white border-b border-gray-200 sticky top-14 md:top-[calc(3.5rem)] z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full active:scale-95 transition-all"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg md:text-xl font-bold text-black">{categoryName}</h1>
              <p className="text-xs md:text-sm text-gray-600">{city}</p>
            </div>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showMap
                  ? 'bg-[#CDFF00] text-black'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{showMap ? 'List' : 'Map'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map View */}
      {showMap && mapMarkers.length > 0 && (
        <div className="h-[400px] border-b border-gray-200">
          <MapView
            markers={mapMarkers}
            userLocation={
              userLat && userLng
                ? { latitude: userLat, longitude: userLng }
                : undefined
            }
            onMarkerClick={(markerId) => {
              const prof = professionals.find((p) => p.id === markerId);
              if (prof) handleMapMarkerClick(prof);
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : professionals.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No professionals found"
            description="Try adjusting your filters or check back later"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professionals.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                onViewDetails={() => handleViewDetails(professional)}
                onWhatsAppClick={() => handleWhatsAppClick(professional)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}