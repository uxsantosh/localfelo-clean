// =====================================================
// PROFESSIONALS ROLE SCREEN - 2026 MODERN UI
// =====================================================
// Home screen for professionals - shows ROLES (not categories)

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { RoleCard } from '../components/RoleCard';
import { Header } from '../components/Header';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getAllRoles } from '../services/roles';
import type { Role } from '../services/roles';

interface ProfessionalsRoleScreenProps {
  onNavigate: (screen: string, params?: any) => void;
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

export function ProfessionalsRoleScreen({
  onNavigate,
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
}: ProfessionalsRoleScreenProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    const result = await getAllRoles();
    if (result.success && result.roles) {
      setRoles(result.roles);
    }
    setLoading(false);
  };

  const handleRoleClick = (role: Role) => {
    if (!globalLocationCity) {
      onLocationClick?.();
      return;
    }
    onNavigate('professionals-listing-role', {
      roleId: role.id,
      roleName: role.name,
      city: globalLocationCity,
    });
  };

  const handleRegisterClick = () => {
    // No need to check login here - navigateToScreen in App.tsx handles it
    onNavigate('register-professional-role');
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white via-white to-[#CDFF00]/5 pt-6 pb-4">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
              Find Local Professionals
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Connect with verified professionals in your area
            </p>
          </div>

          {/* Register Button (Above Search) */}
          <div className="mb-3">
            <button
              onClick={handleRegisterClick}
              className="w-full md:w-auto md:mx-auto md:flex items-center justify-center gap-2 px-6 py-3 bg-black text-[#CDFF00] rounded-xl font-semibold hover:bg-gray-900 transition-all hover:scale-105 duration-300 shadow-lg flex"
            >
              <Plus className="w-5 h-5" />
              Register as Professional
            </button>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for electrician, plumber, driver..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border-0 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#CDFF00] text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 xl:px-12 py-4 md:py-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : filteredRoles.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onClick={() => handleRoleClick(role)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">No matching professions found</p>
          </div>
        )}
      </div>
    </div>
  );
}