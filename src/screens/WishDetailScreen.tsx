import React, { useState, useEffect } from 'react';
import { MapPin, Clock, IndianRupee, MessageCircle, Edit3, Trash2, ExternalLink } from 'lucide-react';
import { Header } from '../components/Header';
import { getCurrentUserSync } from '../services/auth';
import { LocalFeloLoader } from '../components/LocalFeloLoader';
import { Wish } from '../types';
import { toast } from 'sonner';
import { getProfileById } from '../services/profile';
import { getWishById, cancelWish } from '../services/wishes';
import { getWishCategories } from '../services/categories';
import { MapView } from '../components/MapView';
import { getOrCreateConversation } from '../services/chat';
import { ContactChoiceModal } from '../components/ContactChoiceModal';

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
  const [showContactChoiceModal, setShowContactChoiceModal] = useState(false);
  const currentUser = getCurrentUserSync();

  // Load wish data
  const loadWishData = async () => {
    try {
      setLoading(true);
      console.log('🔄 [WishDetail] Loading wish data...');
      
      const [wishData, categoriesData] = await Promise.all([
        getWishById(
          wishId,
          userCoordinates?.latitude,
          userCoordinates?.longitude
        ),
        getWishCategories()
      ]);

      console.log('✅ [WishDetail] Wish loaded:', {
        id: wishData.id,
        userId: wishData.userId,
        currentUserId: currentUser?.id
      });

      setWish(wishData);
      setCategories(categoriesData);

      // Check if wish owner profile exists
      if (wishData) {
        const ownerId = wishData.userId || wishData.owner_token;
        if (!ownerId) {
          setWishOwnerProfileExists(false);
        } else {
          try {
            const profile = await getProfileById(ownerId);
            setWishOwnerProfileExists(!!profile);
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

  // Initial load
  useEffect(() => {
    loadWishData();
  }, [wishId]);

  // Reload when screen becomes visible (coming back from chat)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && wish) {
        console.log('📱 [WishDetail] Screen became visible - reloading wish');
        loadWishData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [wish?.id]);

  const handleOpenChat = async () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }

    if (!wish) return;

    try {
      const { conversation, error } = await getOrCreateConversation(
        wish.id,
        wish.title,
        undefined,
        wish.budgetMax || wish.budgetMin || 0,
        wish.userId,
        wish.userName,
        wish.userAvatar,
        'wish'
      );

      if (error || !conversation) {
        if (error && error.includes('cannot chat with yourself')) {
          toast.error('You cannot chat about your own wish.');
        } else if (error && error.includes('profile could not be found')) {
          toast.error('This wish is no longer available for chat.');
        } else {
          toast.error(error || 'Failed to open chat');
        }
        return;
      }

      console.log('✅ [WishDetail] Opening chat:', conversation.id);
      await new Promise(resolve => setTimeout(resolve, 100));
      onNavigate('chat', { conversationId: conversation.id });
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error('Failed to open chat');
    }
  };

  const handleCreatorDelete = async () => {
    if (!wish) return;
    
    if (!confirm('Are you sure you want to permanently delete this wish? This cannot be undone.')) {
      return;
    }

    try {
      const result = await cancelWish(wish.id);
      
      if (result.success) {
        toast.success('Wish deleted successfully');
        onBack();
      } else {
        toast.error(result.error || 'Failed to delete wish');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete wish');
    }
  };

  //NEW: Show contact choice modal
  const handleChatButtonClick = () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    setShowContactChoiceModal(true);
  };

  // NEW: Open WhatsApp with prefilled message
  const handleWhatsApp = () => {
    if (!wish || !currentUser) return;
    
    setShowContactChoiceModal(false);
    
    // Get creator's phone number
    const creatorPhone = wish.phone || wish.whatsapp;
    
    if (!creatorPhone) {
      toast.error('Wish creator phone number not available');
      return;
    }
    
    // Remove any non-digit characters from phone number
    const cleanPhone = creatorPhone.replace(/\D/g, '');
    
    // Format: +91 for India
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    
    // Pre-filled message
    const userName = currentUser.name || 'Someone';
    const message = encodeURIComponent(
      `Hi, I am ${userName} and I'm interested in your wish: "${wish.title}"`
    );
    
    // WhatsApp deep link (works on mobile and web)
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  // NEW: Continue with in-app chat
  const handleInAppChat = () => {
    setShowContactChoiceModal(false);
    handleOpenChat();
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
      case 'asap': return 'bg-red-100 text-red-800';
      case 'today': return 'bg-[#CDFF00] text-black';
      case 'flexible': return 'bg-blue-50 text-blue-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isCreator = currentUser?.id === wish?.userId;

  console.log('🎯 [WishDetail] Button Logic:', {
    currentUserId: currentUser?.id,
    wishUserId: wish?.userId,
    isCreator,
    isLoggedIn
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          title="Wish Details"
          currentScreen="wishes"
          showBack 
          onBack={onBack} 
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
          <LocalFeloLoader size="lg" text="Loading wish..." />
        </div>
      </div>
    );
  }

  if (!wish) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          title="Wish Details"
          currentScreen="wishes"
          showBack 
          onBack={onBack} 
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

  const category = categories.find(c => c.slug === wish.categoryName?.toLowerCase()) || categories[6];

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-40">
        <Header 
          title="Wish Details"
          currentScreen="wishes"
          showBack 
          onBack={onBack} 
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

      <div className="page-container py-3 space-y-3">
        {/* Category Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-2xl">{category?.emoji || '💭'}</span>
          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Wish
          </span>
        </div>

        {/* Title & Key Info */}
        <div className="space-y-2">
          <h1 className="text-lg font-bold text-black leading-tight">{wish.title}</h1>
          
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {(wish.budgetMin || wish.budgetMax) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#CDFF00] text-black font-bold rounded">
                <IndianRupee className="w-3.5 h-3.5" />
                {wish.budgetMin && wish.budgetMax
                  ? wish.budgetMin === wish.budgetMax
                    ? `${wish.budgetMin.toLocaleString('en-IN')}`
                    : `${wish.budgetMin.toLocaleString('en-IN')} - ${wish.budgetMax.toLocaleString('en-IN')}`
                  : wish.budgetMin
                  ? `From ${wish.budgetMin.toLocaleString('en-IN')}`
                  : `Up to ${wish.budgetMax?.toLocaleString('en-IN')}`}
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded ${getUrgencyColor(wish.urgency)}`}>
              <Clock className="w-3.5 h-3.5" />
              {getUrgencyText(wish.urgency)}
            </span>
            {wish.distance !== undefined && wish.distance !== null && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded">
                <MapPin className="w-3.5 h-3.5" />
                {wish.distance.toFixed(1)} km
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {wish.description && (
          <div className="bg-gray-50 rounded-lg p-4 my-4 border-l-4 border-[#CDFF00]">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{wish.description}</p>
          </div>
        )}

        {/* Map Toggle */}
        {wish.latitude && wish.longitude && (
          <div className="inline-flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setShowMap(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                !showMap ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setShowMap(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                showMap ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Map
            </button>
          </div>
        )}

        {/* Location Details */}
        {!showMap && (wish.address || (wish.latitude && wish.longitude)) && (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black">{wish.areaName}</p>
                <p className="text-xs text-gray-500">{wish.cityName}</p>
              </div>
            </div>
            
            {wish.address && (
              <div className="pl-6">
                <p className="text-xs text-gray-600 leading-relaxed">{wish.address}</p>
              </div>
            )}
            
            {wish.latitude && wish.longitude && (
              <div className="pl-6">
                <button
                  onClick={openInMaps}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  Directions
                </button>
              </div>
            )}
          </div>
        )}

        {/* Map View */}
        {showMap && wish.latitude && wish.longitude && (
          <div className="rounded-lg overflow-hidden border border-gray-200 h-[400px]">
            <MapView
              markers={[{
                id: wish.id,
                latitude: wish.latitude,
                longitude: wish.longitude,
                title: wish.title,
                price: wish.budgetMax || wish.budgetMin,
                type: 'wish',
                categoryEmoji: category?.emoji,
                status: 'open'
              }]}
              onMarkerClick={() => {}}
              centerLat={wish.latitude}
              centerLng={wish.longitude}
              userLocation={userCoordinates}
            />
          </div>
        )}

        {/* Posted By */}
        <div className="bg-white rounded border border-gray-200 p-4">
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
              <p className="text-xs text-gray-500">
                {new Date(wish.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer (For non-creators) */}
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

      {/* ==================== ACTION BUTTONS ==================== */}

      {/* CREATOR: Edit + Delete */}
      {isCreator && (
        <div className="fixed bottom-16 md:bottom-12 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
          <div className="max-w-4xl mx-auto flex gap-3">
            <button
              onClick={() => onNavigate('create-wish', { editMode: true, wishId: wish.id, wish: wish })}
              className="flex-1 px-6 py-3.5 bg-primary text-black rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <Edit3 className="w-5 h-5 text-black" />
              Edit
            </button>
            <button
              onClick={handleCreatorDelete}
              className="px-6 py-3.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* NON-CREATOR: Chat button only */}
      {!isCreator && wishOwnerProfileExists && !profileCheckLoading && (
        <div className="fixed bottom-16 md:bottom-12 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
          <div className="max-w-4xl mx-auto">
            {isLoggedIn ? (
              <button
                onClick={handleChatButtonClick}
                className="w-full px-6 py-3.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 text-white" />
                Chat
              </button>
            ) : (
              <button
                onClick={onLoginRequired}
                className="w-full px-6 py-3.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Login to Chat
              </button>
            )}
          </div>
        </div>
      )}

      {/* Contact Choice Modal */}
      {showContactChoiceModal && (
        <ContactChoiceModal
          isOpen={showContactChoiceModal}
          onClose={() => setShowContactChoiceModal(false)}
          onWhatsApp={handleWhatsApp}
          onInAppChat={handleInAppChat}
          contactPersonName={wish.userName}
          itemType="wish"
        />
      )}
    </div>
  );
}