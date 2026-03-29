// =====================================================
// PROFESSIONALS LISTING BY ROLE SCREEN - FIXED (UI INTACT)
// =====================================================

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
  onShowAuthModal?: () => void;
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
  onShowAuthModal,
}: ProfessionalsListingRoleScreenProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [role, setRole] = useState<RoleWithSubcategories | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number | undefined>(undefined);
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState<string | undefined>();

  // 🔥 FIX: ensure we always have a valid role name
  const [finalRoleName, setFinalRoleName] = useState<string>(roleName || '');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load role details (and fix roleName if missing)
  useEffect(() => {
    const loadRoleDetails = async () => {
      const result = await getRoleById(roleId);
      if (result.success && result.role) {
        setRole(result.role);

        // 🔥 IMPORTANT FIX
        if (!roleName || roleName.trim() === '') {
          setFinalRoleName(result.role.name);
        } else {
          setFinalRoleName(roleName);
        }
      }
    };

    loadRoleDetails();
  }, [roleId, roleName]);

  // Load professionals
  useEffect(() => {
    if (!finalRoleName) return; // 🔥 wait until roleName is ready
    loadProfessionals();
  }, [finalRoleName, city, maxDistance, selectedSubcategoryFilter]);

  const loadProfessionals = async () => {
    setLoading(true);
    try {
      const result = await getProfessionalsByRole(finalRoleName, city);

      if (result.success && result.professionals) {
        let filtered = result.professionals;

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

          filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));

          if (maxDistance) {
            filtered = filtered.filter(prof => prof.distance && prof.distance <= maxDistance);
          }
        }

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
    const R = 6371;
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
    if (!isLoggedIn) {
      toast.error('Please login to contact professionals');
      if (onShowAuthModal) onShowAuthModal();
      return;
    }

    const message = encodeURIComponent(
      `Hi ${professional.name}, I found you on LocalFelo. Are you available for ${finalRoleName} services?`
    );

    window.open(`https://wa.me/${professional.whatsapp}?text=${message}`, '_blank');
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <LoadingSpinner />
        ) : professionals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                onViewDetails={() => handleViewDetails(professional)}
                onWhatsAppClick={() => handleWhatsAppClick(professional)}
                showRole={true}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={MapPin}
            title="No professionals found"
            message={`No ${finalRoleName.toLowerCase()}s available in ${city}`}
          />
        )}
      </div>
    </div>
  );
}