import React, { useState, useEffect } from 'react';
import { MapPin, MessageCircle, Edit3, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
import { ShareButton } from '../components/ShareButton';
import { ImageCarousel } from '../components/ImageCarousel';
import { GoogleMapsButton } from '../components/GoogleMapsButton';
import { Listing } from '../types';
import { toast } from 'sonner';
import { getProfileById } from '../services/profile';

interface ListingDetailScreenProps {
  listing: Listing;
  onBack: () => void;
  onNavigate?: (screen: string, data?: any) => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
  onChatClick: (listing: Listing) => void;
  onDelete?: (listingId: string) => void;
  currentUserId?: string;
}

export function ListingDetailScreen({
  listing,
  onBack,
  onNavigate,
  isLoggedIn,
  onLoginRequired,
  onChatClick,
  onDelete,
  currentUserId,
}: ListingDetailScreenProps) {
  const [sellerProfileExists, setSellerProfileExists] = useState<boolean>(true);
  const [profileCheckLoading, setProfileCheckLoading] = useState<boolean>(true);

  // Check if seller profile exists
  useEffect(() => {
    const checkSellerProfile = async () => {
      const sellerId = listing.userId || listing.owner_token;
      if (!sellerId) {
        setSellerProfileExists(false);
        setProfileCheckLoading(false);
        return;
      }

      try {
        const profile = await getProfileById(sellerId);
        setSellerProfileExists(!!profile);
      } catch (error) {
        console.error('❌ Error checking seller profile:', error);
        setSellerProfileExists(false);
      } finally {
        setProfileCheckLoading(false);
      }
    };

    checkSellerProfile();
  }, [listing.id, listing.userId, listing.owner_token]);

  const handleChatClick = () => {
    console.log('🔥 [ListingDetail] Chat button clicked!');
    
    if (!isLoggedIn) {
      console.log('⚠️ [ListingDetail] User not logged in - showing login modal');
      onLoginRequired();
      return;
    }
    
    console.log('✅ [ListingDetail] Calling onChatClick with listing:', listing.id);
    onChatClick(listing);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) {
      return;
    }

    try {
      if (onDelete) {
        await onDelete(listing.id);
        toast.success('Listing deleted successfully');
        onBack();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete listing');
    }
  };

  const isOwnListing = currentUserId && listing.userId === currentUserId;

  console.log('🎯 [ListingDetail] Button Logic:', {
    isOwnListing,
    sellerProfileExists,
    profileCheckLoading,
    currentUserId,
    listingUserId: listing.userId
  });

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0 overflow-x-hidden">
      <div className="sticky top-0 z-40">
        <Header title="Listing Details" showBack onBack={onBack} />
      </div>

      <div className="page-container pb-4 lg:pb-8">
        {/* Share Button - Floating */}
        <div className="relative">
          <ShareButton
            listing={listing}
            className="absolute right-0 top-2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all active:scale-95 border border-border"
            aria-label="Share listing"
          />
        </div>

        <div className="listing-detail-layout">
          {/* Left Column: Image Carousel */}
          <div className="w-full overflow-hidden">
            <ImageCarousel
              images={listing.images}
              categoryEmoji={listing.categoryEmoji}
              title={listing.title}
            />
          </div>

          {/* Right Column: Listing Details */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div className="pb-6 border-b border-border">
              <h1 className="text-heading mb-3 font-bold text-[26px] leading-tight">{listing.title}</h1>
              <p className="text-black m-0 font-bold text-[28px] leading-none">
                ₹{listing.price?.toLocaleString('en-IN') || '0'}
              </p>
            </div>

            {/* Category */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-input rounded-xl">
                <span className="text-xl">{listing.categoryEmoji}</span>
                <span className="text-sm text-body font-semibold">{listing.categoryName}</span>
              </span>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-border">
              <h3 className="text-heading mb-3 font-semibold text-[17px]">Description</h3>
              <p className="text-body whitespace-pre-wrap leading-relaxed">{listing.description}</p>
            </div>

            {/* Location */}
            <div className="pb-6 border-b border-border">
              <h3 className="text-heading mb-3 font-semibold text-[17px]">Location</h3>
              <div className="flex items-center gap-2 text-body mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <span className="font-medium block">
                    {listing.areaName}, {listing.cityName}
                  </span>
                  {listing.distance !== undefined && listing.distance !== null && (
                    <span className="font-extrabold mt-2 block" style={{ backgroundColor: '#CDFF00', color: '#000000', fontSize: '14px', display: 'inline-block', padding: '4px 8px', borderRadius: '6px' }}>
                      ~{listing.distance.toFixed(1)} km away
                    </span>
                  )}
                </div>
              </div>
              
              {/* Full Address */}
              {listing.address && (
                <div className="mb-3 p-3 bg-gray-50 border border-gray-200" style={{ borderRadius: '8px' }}>
                  <p className="text-[12px] text-gray-500 mb-1" style={{ fontWeight: '600' }}>Full Address</p>
                  <p className="text-[14px] text-black whitespace-pre-wrap" style={{ fontWeight: '500' }}>
                    {listing.address}
                  </p>
                </div>
              )}
              
              {/* Google Maps button */}
              {listing.latitude && listing.longitude && (
                <GoogleMapsButton
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                  label="Get Directions"
                  size="sm"
                />
              )}
            </div>

            {/* Seller Info */}
            <div>
              <h3 className="text-heading mb-4 font-semibold text-[17px]">Seller Information</h3>
              <div className="card flex items-center gap-4">
                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 font-bold text-[20px]">
                  <span>{listing.userName?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <p className="text-heading m-0 font-semibold text-[16px]">{listing.userName}</p>
                  <p className="text-xs text-gray-500 m-0 mt-0.5">
                    {new Date(listing.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Safety Disclaimer (For non-owners) */}
            {!isOwnListing && isLoggedIn && sellerProfileExists && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-700">
                  💡 <strong>LocalFelo is a connector platform.</strong> Chat safely. Share personal details only if you're comfortable. Payments and details are handled directly between users.
                </p>
              </div>
            )}

            {/* Notice when profile doesn't exist */}
            {!isOwnListing && !sellerProfileExists && !profileCheckLoading && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs text-orange-700">
                  ℹ️ This listing was posted by a user whose account is no longer active. You cannot chat with them.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== ACTION BUTTONS ==================== */}

      {/* OWNER: Edit + Delete buttons */}
      {isOwnListing && onNavigate && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-40 safe-bottom">
          <div className="max-w-4xl mx-auto flex gap-3">
            <button
              onClick={() => onNavigate('create-listing', { editMode: true, listingId: listing.id, listing: listing })}
              className="flex-1 px-6 py-3.5 bg-primary text-black rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <Edit3 className="w-5 h-5 text-black" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-3.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* NON-OWNER: Chat button only (Mobile) */}
      {!isOwnListing && sellerProfileExists && !profileCheckLoading && (
        <div className="fixed lg:hidden bottom-0 left-0 right-0 bg-white border-t border-border p-3 safe-bottom z-40">
          <div className="max-w-lg mx-auto">
            {isLoggedIn ? (
              <button
                onClick={handleChatClick}
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

      {/* NON-OWNER: Chat button only (Desktop) */}
      {!isOwnListing && sellerProfileExists && !profileCheckLoading && (
        <div className="hidden lg:block page-container">
          <div className="max-w-2xl">
            {isLoggedIn ? (
              <button
                onClick={handleChatClick}
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
    </div>
  );
}
