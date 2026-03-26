import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Briefcase, Share2, Navigation, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ImageCarousel } from '../components/ImageCarousel';
import { getProfessionalBySlug, Professional } from '../services/professionals';
import { TopNavigation } from '../components/TopNavigation';
import { Header } from '../components/Header';
import { toast } from 'sonner';
import { getCurrentUser } from '../services/auth';
import { LocationMap } from '../components/LocationMap';
import { VerificationModal } from '../components/VerificationModal';
import { supabase } from '../lib/supabaseClient';

interface ProfessionalDetailScreenProps {
  slug: string;
  onBack: () => void;
  onNavigate?: (screen: string, params?: any) => void;
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

export function ProfessionalDetailScreen({
  slug,
  onBack,
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
  onShowAuthModal,  // ✅ ADD: Callback to show auth modal
}: ProfessionalDetailScreenProps) {
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>('unverified');
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load professional data
  useEffect(() => {
    loadProfessional();
  }, [slug]);

  const loadProfessional = async () => {
    setLoading(true);
    try {
      const data = await getProfessionalBySlug(slug);
      setProfessional(data);
      if (isLoggedIn) {
        const currentUser = await getCurrentUser();
        setIsOwnProfile(currentUser?.id === data.user_id);
      }
      // Verification status feature removed - table doesn't exist yet
    } catch (error) {
      console.error('Error loading professional:', error);
      toast.error('Failed to load professional details');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!professional) return;

    // ✅ Require login before allowing WhatsApp contact
    if (!isLoggedIn) {
      toast.error('Please login to contact professionals');
      if (onShowAuthModal) {
        onShowAuthModal();
      }
      return;
    }

    const message = encodeURIComponent(
      `Hi ${professional.name}, I found you on LocalFelo regarding ${professional.role_name || professional.category_name || 'your services'}. Are you available?`
    );
    window.open(`https://wa.me/${professional.whatsapp}?text=${message}`, '_blank');
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/professional/${slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: professional?.name || 'Professional',
          text: `Check out ${professional?.name} on LocalFelo`,
          url,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleNavigate = () => {
    if (!professional?.latitude || !professional?.longitude) {
      toast.error('Location not available');
      return;
    }

    // Open Google Maps for navigation
    // On mobile, this will open the Google Maps app if installed
    // On desktop, this will open Google Maps in the browser
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${professional.latitude},${professional.longitude}`;
    window.open(googleMapsUrl, '_blank');
  };
  
  // Prepare gallery images - EXCLUDE profile image from carousel
  // Extract image URLs from image objects
  const galleryImages = professional && professional.images 
    ? professional.images.map((img: any) => typeof img === 'string' ? img : img.image_url).filter(Boolean)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Professional not found</h2>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-black text-[#CDFF00] rounded-lg hover:bg-gray-900 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32 md:pb-8">
      {/* Main Header - Mobile Only (shows logo, location, search) - STICKY */}
      <div className="md:hidden sticky top-0 z-40 bg-white">
        <Header
          currentScreen="professionals"
          onNavigate={onNavigate ? (screen: any) => onNavigate(screen) : undefined}
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
      </div>

      {/* Top Navigation - Web Only - STICKY */}
      <div className="hidden md:block sticky top-0 z-40 bg-white">
        {onNavigate && (
          <TopNavigation currentScreen="professionals" onNavigate={(screen) => onNavigate(screen)} />
        )}
      </div>

      {/* Sticky Header with Back, Name, and Share - STICKY below header */}
      <div className="bg-white border-b border-gray-200 sticky top-14 md:top-[3.5rem] z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBack();
              }}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full active:scale-95 transition-all"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
            <div className="flex-1 flex items-center gap-3 min-w-0">
              {/* Small Profile Image */}
              <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gray-100 overflow-hidden">
                {professional.profile_image_url ? (
                  <img
                    src={professional.profile_image_url}
                    alt={professional.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm">
                    👤
                  </div>
                )}
              </div>
              {/* Name */}
              <h1 className="text-base md:text-lg font-bold text-black truncate">{professional.name}</h1>
            </div>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-full active:scale-95 transition-all flex-shrink-0"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header - Larger version with full details */}
        <div className="flex gap-4 mb-6">
          {/* Profile Image */}
          <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
            {professional.profile_image_url ? (
              <img
                src={professional.profile_image_url}
                alt={professional.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                👤
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-black mb-1">
              {professional.name}
            </h2>
            <p className="text-sm md:text-base text-gray-700 mb-2">{professional.title}</p>

            {/* Role/Category Badge - Show role preferentially */}
            {professional.role_name ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#CDFF00]/20 rounded-md text-sm">
                <Briefcase className="w-4 h-4 text-gray-700" />
                <span className="text-gray-900 font-medium">{professional.role_name}</span>
              </div>
            ) : professional.category_name ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-md text-sm">
                <Briefcase className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">{professional.category_name}</span>
              </div>
            ) : null}

            {/* Location */}
            {professional.address && (
              <div className="flex items-start gap-1.5 mt-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{professional.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Image Gallery */}
        {galleryImages.length > 0 && (
          <div className="mb-6">
            <ImageCarousel images={galleryImages} title={professional.name} />
          </div>
        )}

        {/* Services */}
        {professional.services && professional.services.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-black mb-3">Services Offered</h2>
            <div className="bg-white border border-gray-200 rounded-md divide-y divide-gray-200">
              {professional.services.map((service, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <span className="text-black">{service.service_name}</span>
                  {service.price && (
                    <span className="text-black font-semibold">₹{service.price}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {professional.description && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-black mb-3">About</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {professional.description}
            </p>
          </div>
        )}

        {/* Location Map */}
        {professional.latitude && professional.longitude && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-black">Location</h2>
              <button
                onClick={handleNavigate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#CDFF00] text-black rounded-md font-medium hover:bg-[#B8E600] transition-colors text-sm"
              >
                <Navigation className="w-4 h-4" />
                Navigate
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: '300px' }}>
              <LocationMap
                center={{ lat: professional.latitude, lng: professional.longitude }}
                onLocationChange={() => {}}
                allowPinDrag={false}
                browseMode={false}
              />
            </div>
            {professional.address && (
              <p className="mt-3 text-sm text-gray-600 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{professional.address}</span>
              </p>
            )}
          </div>
        )}

        {/* Verification Status */}
        {verificationStatus !== 'unverified' && (
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-500">Verification Status:</span>
              {verificationStatus === 'approved' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : verificationStatus === 'pending' ? (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              ) : verificationStatus === 'rejected' ? (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              ) : null}
              <span className="text-sm text-gray-500">
                {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
              </span>
            </div>
            {verificationMessage && (
              <p className="mt-2 text-sm text-gray-500">
                {verificationMessage}
              </p>
            )}
          </div>
        )}

        {/* CTA Button - Fixed at Bottom */}
        <div className="fixed bottom-16 md:bottom-4 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
          <div className="max-w-4xl mx-auto">
            {isOwnProfile ? (
              <button
                onClick={() => onNavigate?.('edit-professional', { slug })}
                className="w-full px-6 py-4 bg-[#CDFF00] text-black rounded-md font-semibold hover:bg-[#B8E600] transition-colors flex items-center justify-center gap-2 text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleWhatsAppClick}
                className="w-full px-6 py-4 bg-[#25D366] text-white rounded-md font-semibold hover:bg-[#20BD5A] transition-colors flex items-center justify-center gap-2 text-base"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Chat on WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}