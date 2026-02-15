import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MessageCircle, MessageSquare, Heart, MapPin, Clock, AlertCircle, Share2 } from 'lucide-react';
import { Header } from '../components/Header';
import { ShareButton } from '../components/ShareButton';
import { ImageCarousel } from '../components/ImageCarousel';
import { GoogleMapsButton } from '../components/GoogleMapsButton';
import { Listing } from '../types';
import { toast } from 'sonner';
import { formatUserName } from '../utils/formatUserName';
import { getProfileById } from '../services/profile';

interface ListingDetailScreenProps {
  listing: Listing;
  onBack: () => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
  onChatClick: (listing: Listing) => void;
  currentUserId?: string;
}

export function ListingDetailScreen({
  listing,
  onBack,
  isLoggedIn,
  onLoginRequired,
  onChatClick,
  currentUserId,
}: ListingDetailScreenProps) {
  const [sellerProfileExists, setSellerProfileExists] = useState<boolean>(true);
  const [profileCheckLoading, setProfileCheckLoading] = useState<boolean>(true);

  // Check if seller profile exists
  useEffect(() => {
    const checkSellerProfile = async () => {
      const sellerId = listing.userId || listing.owner_token;
      if (!sellerId) {
        // Silently handle listings without seller ID (orphaned data)
        setSellerProfileExists(false);
        setProfileCheckLoading(false);
        return;
      }

      try {
        const profile = await getProfileById(sellerId);
        if (profile) {
          setSellerProfileExists(true);
        } else {
          // Silently handle orphaned listings (seller profile deleted/doesn't exist)
          // This is expected for old listings where users deleted their accounts
          setSellerProfileExists(false);
        }
      } catch (error) {
        // Only log actual errors (network issues, etc.)
        console.error('❌ Error checking seller profile:', error);
        setSellerProfileExists(false);
      } finally {
        setProfileCheckLoading(false);
      }
    };

    checkSellerProfile();
  }, [listing.id, listing.userId, listing.owner_token]);

  const handleCallClick = () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    window.location.href = `tel:${listing.phone}`;
  };

  const handleWhatsAppClick = () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    const phone = listing.whatsapp || listing.phone;
    const message = encodeURIComponent(`Hi, I'm interested in your listing: ${listing.title}`);
    window.open(`https://wa.me/91${phone}?text=${message}`, '_blank');
  };

  const handleChatClick = () => {
    console.log('🔥 [ListingDetail] Chat button clicked!');
    
    if (!isLoggedIn) {
      console.log('⚠️ [ListingDetail] User not logged in - showing login modal');
      onLoginRequired();
      return;
    }
    
    console.log('✅ [ListingDetail] Calling onChatClick with listing:', listing.id);
    // Don't check sellerProfileExists here - let App.tsx handle it
    onChatClick(listing);
  };

  // Check if current user is the seller
  const isOwnListing = currentUserId && listing.userId === currentUserId;

  // Calculate number of buttons to show for dynamic grid
  const showWhatsApp = listing.hasWhatsapp;
  const showChat = !isOwnListing; // ✅ SIMPLIFIED: Always show chat button if not own listing
  const buttonCount = 1 + (showWhatsApp ? 1 : 0) + (showChat ? 1 : 0); // Always show Call
  const gridCols = buttonCount === 3 ? 'grid-cols-3' : buttonCount === 2 ? 'grid-cols-2' : 'grid-cols-1';

  // Debug logging for chat button visibility
  console.log('💬 [ListingDetail] Chat button visibility check:', {
    isOwnListing,
    sellerProfileExists,
    profileCheckLoading,
    showChat,
    currentUserId,
    listingUserId: listing.userId,
    listingOwnerToken: listing.owner_token,
    buttonCount,
    gridCols
  });

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0 overflow-x-hidden">
      {/* ✅ FIX: Make header sticky */}
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

          {/* Share Menu Dropdown (Desktop fallback) */}
          {/* This is handled by the ShareButton component */}
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
              <p className="text-primary m-0 font-bold text-[28px] leading-none">
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
              
              {/* Show Google Maps button if coordinates are available */}
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
                  <span>{formatUserName(listing.userName).charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <p className="text-heading m-0 font-semibold text-[16px]">{formatUserName(listing.userName)}</p>
                  <p className="text-xs text-muted m-0 mt-1 font-medium">
                    Posted by a local user near you
                  </p>
                  <p className="text-xs text-gray-500 m-0 mt-0.5">
                    {new Date(listing.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Buttons - Fixed at very bottom on mobile (no bottom nav on this screen), inline on desktop */}
      <div className="fixed lg:static bottom-0 left-0 right-0 bg-card border-t border-border p-3 safe-bottom z-40 lg:hidden shadow-lg">
        <div className={`max-w-lg mx-auto grid ${gridCols} gap-2`}>
          <button onClick={handleCallClick} className="flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-2.5 px-4 font-medium text-sm hover:bg-primary/90 transition-all active:scale-95">
            <Phone className="w-4 h-4" />
            <span>Call</span>
          </button>
          {listing.hasWhatsapp && (
            <button
              onClick={handleWhatsAppClick}
              className="flex items-center justify-center gap-2 bg-white text-primary border-2 border-primary rounded-xl py-2.5 px-4 font-medium text-sm hover:bg-primary/5 transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          )}
          {!isOwnListing && (
            <button
              onClick={handleChatClick}
              className="flex items-center justify-center gap-2 bg-white text-primary border-2 border-primary rounded-xl py-2.5 px-4 font-medium text-sm hover:bg-primary/5 transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop Contact Buttons */}
      <div className="hidden lg:block page-container">
        <div className={`grid ${gridCols} gap-4 max-w-2xl`}>
          <button onClick={handleCallClick} className="btn-primary flex items-center justify-center gap-2">
            <Phone className="w-5 h-5" />
            <span>Call</span>
          </button>
          {listing.hasWhatsapp && (
            <button
              onClick={handleWhatsAppClick}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </button>
          )}
          {!isOwnListing && (
            <button
              onClick={handleChatClick}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Chat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}