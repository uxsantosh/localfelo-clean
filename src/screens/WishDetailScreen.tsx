import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, MessageSquare, MapPin, Clock, Phone, AlertCircle, IndianRupee, ExternalLink, Edit3, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
import { ShareButton } from '../components/ShareButton';
import { GoogleMapsButton } from '../components/GoogleMapsButton';
import { MapView } from '../components/MapView';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Wish } from '../types';
import { toast } from 'sonner';
import { formatUserName } from '../utils/formatUserName';
import { getProfileById } from '../services/profile';
import { getWishById, cancelWish } from '../services/wishes';
import { getWishCategories } from '../services/categories';
import { getOrCreateConversation } from '../services/chat';

interface WishDetailScreenProps {
  wishId: string;
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
  currentUserId?: string;
  showGlobalLocation?: boolean;
  globalLocationArea?: string;
  globalLocationCity?: string;
  onLocationClick?: () => void;
  onMenuClick?: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
  userCoordinates?: { latitude: number; longitude: number } | null;
}

export function WishDetailScreen({
  wishId,
  onBack,
  onNavigate,
  isLoggedIn,
  onLoginRequired,
  currentUserId,
  showGlobalLocation,
  globalLocationArea,
  globalLocationCity,
  onLocationClick,
  onMenuClick,
  notificationCount,
  onNotificationClick,
  userCoordinates,
}: WishDetailScreenProps) {
  const [wish, setWish] = useState<Wish | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [wishOwnerProfileExists, setWishOwnerProfileExists] = useState<boolean>(true);
  const [profileCheckLoading, setProfileCheckLoading] = useState<boolean>(true);

  // Fetch wish data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [wishData, categoriesData] = await Promise.all([
          getWishById(
            wishId,
            userCoordinates?.latitude,
            userCoordinates?.longitude
          ),
          getWishCategories()
        ]);

        setWish(wishData);
        setCategories(categoriesData);

        // Check if wish owner profile exists
        if (wishData) {
          const ownerId = wishData.userId || wishData.owner_token;
          if (!ownerId) {
            // Wish has no owner ID - this is fine for anonymous wishes
            setWishOwnerProfileExists(false);
          } else {
            try {
              const profile = await getProfileById(ownerId);
              if (profile) {
                setWishOwnerProfileExists(true);
              } else {
                // Profile not found - user may have been deleted or wish is anonymous
                setWishOwnerProfileExists(false);
              }
            } catch (error) {
              console.error('❌ Error checking wish owner profile:', error);
              setWishOwnerProfileExists(false);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load wish:', error);
        toast.error('Failed to load wish details');
      } finally {
        setLoading(false);
        setProfileCheckLoading(false);
      }
    };

    loadData();
  }, [wishId, userCoordinates]);

  const handleOpenChat = async () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }

    if (!wish) return;

    try {
      const { conversation, error } = await getOrCreateConversation(
        wish.id, // ✅ FIX: Use plain UUID (not prefixed)
        wish.title,
        undefined, // No image for wishes
        wish.budgetMax || wish.budgetMin || 0,
        wish.userId,
        wish.userName,
        wish.userAvatar,
        'wish' // ✅ NEW: Pass listing type
      );

      if (error) {
        toast.error(error);
        return;
      }

      if (conversation) {
        onNavigate('chat', { conversationId: conversation.id });
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error('Failed to open chat');
    }
  };

  const openInMaps = () => {
    if (!wish?.latitude || !wish?.longitude) {
      toast.error('Location not available');
      return;
    }

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${wish.latitude},${wish.longitude}`;
    window.open(mapsUrl, '_blank');
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'asap': return 'ASAP';
      case 'today': return 'Today';
      case 'flexible': return 'Flexible';
      default: return urgency;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'asap': return 'bg-red-100 text-red-700';
      case 'today': return 'bg-[#CDFF00] text-black';
      case 'flexible': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          title="Wish Details" 
          showBack 
          onBack={onBack}
          currentScreen="wish-detail"
          onNavigate={onNavigate}
          isLoggedIn={isLoggedIn}
          showGlobalLocation={showGlobalLocation}
          globalLocationArea={globalLocationArea}
          globalLocationCity={globalLocationCity}
          onLocationClick={onLocationClick}
          onMenuClick={onMenuClick}
          notificationCount={notificationCount}
          onNotificationClick={onNotificationClick}
        />
        <div className="page-container py-4">
          <SkeletonLoader count={1} />
        </div>
      </div>
    );
  }

  if (!wish) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          title="Wish Details" 
          showBack 
          onBack={onBack}
          currentScreen="wish-detail"
          onNavigate={onNavigate}
          isLoggedIn={isLoggedIn}
          showGlobalLocation={showGlobalLocation}
          globalLocationArea={globalLocationArea}
          globalLocationCity={globalLocationCity}
          onLocationClick={onLocationClick}
          onMenuClick={onMenuClick}
          notificationCount={notificationCount}
          onNotificationClick={onNotificationClick}
        />
        <div className="page-container py-8 text-center">
          <p className="text-muted">Wish not found</p>
        </div>
      </div>
    );
  }

  // ✅ REMOVED: No longer block the entire page if owner profile doesn't exist
  // The wish details will still show, but chat/contact features may be disabled

  const category = categories.find(c => String(c.id) === String(wish.categoryId)) || categories[0];
  const isCreator = currentUserId === wish.userId;
  const isAcceptor = currentUserId === wish.acceptedBy;
  const isInvolved = isCreator || isAcceptor;
  const isAccepted = wish.status === 'accepted' || wish.status === 'in_progress' || wish.status === 'completed';

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* ✅ FIX: Make header sticky */}
      <div className="sticky top-0 z-40">
        <Header 
          title="Wish Details" 
          showBack 
          onBack={onBack}
          currentScreen="wish-detail"
          onNavigate={onNavigate}
          isLoggedIn={isLoggedIn}
          showGlobalLocation={showGlobalLocation}
          globalLocationArea={globalLocationArea}
          globalLocationCity={globalLocationCity}
          onLocationClick={onLocationClick}
          onMenuClick={onMenuClick}
          notificationCount={notificationCount}
          onNotificationClick={onNotificationClick}
        />
      </div>

      <div className="page-container py-4 space-y-4">
        {/* Status & Category */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{category?.emoji}</span>
            <span className="text-sm text-muted">{category?.name}</span>
          </div>
          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Open
          </span>
        </div>

        {/* Title */}
        <h1 className="text-heading text-2xl">{wish.title}</h1>

        {/* Budget & Urgency */}
        <div className="flex items-center gap-3 flex-wrap">
          {wish.budgetMin || wish.budgetMax ? (
            <div className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-lg">
              <IndianRupee className="w-5 h-5" />
              <span className="font-bold">
                {wish.budgetMin && wish.budgetMax
                  ? `₹${wish.budgetMin.toLocaleString('en-IN')} - ₹${wish.budgetMax.toLocaleString('en-IN')}`
                  : wish.budgetMin
                  ? `From ₹${wish.budgetMin.toLocaleString('en-IN')}`
                  : `Up to ₹${wish.budgetMax?.toLocaleString('en-IN')}`}
              </span>
            </div>
          ) : null}
          <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${getUrgencyColor(wish.urgency)}`}>
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{getUrgencyText(wish.urgency)}</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded border border-border p-4">
          <h3 className="text-sm font-semibold mb-2 text-muted">What they're looking for</h3>
          <p className="text-body whitespace-pre-wrap">{wish.description}</p>
        </div>

        {/* Map View Toggle */}
        {wish.latitude && wish.longitude && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowMap(false)}
              className={`px-4 py-2 rounded-[4px] transition-colors ${
                !showMap
                  ? 'bg-black text-white'
                  : 'bg-white border border-border text-foreground hover:border-primary'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setShowMap(true)}
              className={`px-4 py-2 rounded-[4px] transition-colors ${
                showMap
                  ? 'bg-black text-white'
                  : 'bg-white border border-border text-foreground hover:border-primary'
              }`}
            >
              Map View
            </button>
          </div>
        )}

        {/* Location - Details or Map */}
        {!showMap ? (
          <div className="bg-white rounded border border-border p-4">
            <h3 className="text-sm font-semibold mb-2 text-muted">Location</h3>
            <div className="flex items-start gap-2 text-body">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{wish.areaName}</p>
                <p className="text-sm text-muted">{wish.cityName}</p>
                {wish.distance !== undefined && wish.distance !== null && (
                  <p className="font-extrabold mt-2" style={{ backgroundColor: '#CDFF00', color: '#000000', fontSize: '14px', display: 'inline-block', padding: '4px 8px', borderRadius: '6px' }}>
                    ~{wish.distance.toFixed(1)} km away
                  </p>
                )}
                
                {/* Full Address */}
                {wish.address && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200" style={{ borderRadius: '8px' }}>
                    <p className="text-[12px] text-gray-500 mb-1" style={{ fontWeight: '600' }}>Full Address</p>
                    <p className="text-[14px] text-black whitespace-pre-wrap" style={{ fontWeight: '500' }}>
                      {wish.address}
                    </p>
                  </div>
                )}
                
                {wish.latitude && wish.longitude && (
                  <button
                    onClick={openInMaps}
                    className="mt-2 flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open in Google Maps
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: '400px' }}>
            <MapView
              markers={[{
                id: wish.id,
                latitude: wish.latitude!,
                longitude: wish.longitude!,
                title: wish.title,
                price: wish.budgetMax || wish.budgetMin,
                type: 'wish' as const,
                categoryEmoji: category?.emoji,
                status: wish.status,
              }]}
              onMarkerClick={() => {}}
              centerLat={wish.latitude}
              centerLng={wish.longitude}
            />
          </div>
        )}

        {/* Posted By */}
        <div className="bg-white rounded border border-border p-4">
          <h3 className="text-sm font-semibold mb-2 text-muted">Posted by</h3>
          <div className="flex items-center gap-3">
            {wish.userAvatar ? (
              <img src={wish.userAvatar} alt={wish.userName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">{wish.userName?.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-heading">{wish.userName}</p>
              <p className="text-sm text-muted">
                {new Date(wish.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer (For non-creators viewing open wish) */}
        {!isCreator && isLoggedIn && wishOwnerProfileExists && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-700">
              💡 <strong>LocalFelo is a connector platform.</strong> Chat safely. Share personal details only if you're comfortable. Payments and details are handled directly between users.
            </p>
          </div>
        )}

        {/* Notice when profile doesn't exist */}
        {!isCreator && !wishOwnerProfileExists && !profileCheckLoading && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-700">
              ℹ️ This wish was posted by a user whose account is no longer active. You cannot chat with them.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isCreator && wishOwnerProfileExists && !profileCheckLoading && (
        <div className="fixed bottom-16 md:bottom-12 left-0 right-0 bg-white border-t border-border p-4 sm:p-6 z-40 safe-bottom">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleOpenChat}
              className="w-full px-6 py-3.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Chat with Wisher
            </button>
          </div>
        </div>
      )}

      {/* Cancel Button for Creator */}
      {isCreator && wish.status !== 'completed' && wish.status !== 'fulfilled' && (
        <div className="fixed bottom-16 md:bottom-12 left-0 right-0 bg-white border-t border-border p-4 sm:p-6 z-40 safe-bottom">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button
              onClick={() => onNavigate('create-wish', { editMode: true, wishId: wish.id, wish: wish })}
              className="flex-1 px-6 py-3.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <Edit3 className="w-5 h-5" />
              Edit Wish
            </button>
            <button
              onClick={async () => {
                if (!confirm('Are you sure you want to delete this wish?')) return;
                const result = await cancelWish(wish.id);
                if (result.success) {
                  toast.success('Wish deleted successfully');
                  onBack();
                } else {
                  toast.error(result.error || 'Failed to delete wish');
                }
              }}
              className="px-6 py-3.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}