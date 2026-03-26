// =====================================================
// SHOP CARD COMPONENT - SHOP STOREFRONT DESIGN
// =====================================================
// Modern 2026 shop card with red & white striped awning

import { MapPin, Store } from 'lucide-react';
import { useState } from 'react';
import type { ShopWithCategories } from '../services/shops';

interface ShopCardProps {
  shop: ShopWithCategories;
  onClick: () => void;
}

export function ShopCard({ shop, onClick }: ShopCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get unique categories (remove duplicates by category_id)
  const uniqueCategories = shop.categories.reduce((acc, cat) => {
    if (!acc.find(c => c.category_id === cat.category_id)) {
      acc.push(cat);
    }
    return acc;
  }, [] as typeof shop.categories);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-xl hover:shadow-2xl transition-all duration-300 text-left overflow-hidden w-full border border-gray-100 hover:border-[#CDFF00]/50 hover:-translate-y-1"
    >
      {/* Shop Roof - Red & White Striped Awning */}
      <div className="relative h-8 overflow-hidden">
        {/* Striped Pattern */}
        <div 
          className="absolute inset-0 flex"
          style={{
            background: 'repeating-linear-gradient(90deg, #EF4444 0px, #EF4444 20px, white 20px, white 40px)'
          }}
        />
        
        {/* 3D Awning Effect - Bottom Shadow */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-b from-black/15 to-transparent" />
        
        {/* Awning Scalloped Edge */}
        <svg 
          className="absolute bottom-0 left-0 w-full h-3" 
          viewBox="0 0 400 20" 
          preserveAspectRatio="none"
          style={{ transform: 'translateY(50%)' }}
        >
          <path
            d="M0,0 Q10,20 20,0 T40,0 T60,0 T80,0 T100,0 T120,0 T140,0 T160,0 T180,0 T200,0 T220,0 T240,0 T260,0 T280,0 T300,0 T320,0 T340,0 T360,0 T380,0 T400,0 L400,20 L0,20 Z"
            fill="#DC2626"
          />
        </svg>
      </div>

      {/* Shop Body - Compact 2026 Design */}
      <div className="p-3">
        {/* Shop Image (16:9 ratio) with Logo Overlay */}
        <div className="relative w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg mb-2.5 overflow-hidden flex items-center justify-center border border-gray-100">
          {shop.shop_images && shop.shop_images.length > 0 ? (
            <img
              src={shop.shop_images[0]}
              alt={shop.shop_name}
              className="w-full h-full object-cover"
            />
          ) : shop.shop_image_url ? (
            <img
              src={shop.shop_image_url}
              alt={shop.shop_name}
              className="w-full h-full object-cover"
            />
          ) : shop.logo_url ? (
            <div className="flex items-center justify-center w-full h-full bg-white p-4">
              <img
                src={shop.logo_url}
                alt={shop.shop_name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <Store className="w-10 h-10 text-gray-300" />
              <p className="text-xs text-gray-400 font-medium">No image</p>
            </div>
          )}
          
          {/* Small Logo Badge (top-right corner) - show only if we have shop image and logo */}
          {((shop.shop_images && shop.shop_images.length > 0) || shop.shop_image_url) && shop.logo_url && (
            <div className="absolute top-2 right-2 w-10 h-10 bg-white rounded-lg shadow-md overflow-hidden border border-white">
              <img
                src={shop.logo_url}
                alt={`${shop.shop_name} logo`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Shine Effect on Hover */}
          <div 
            className={`absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 transition-all duration-700 ${
              isHovered ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            }`}
          />
        </div>

        {/* Shop Name */}
        <h3 className="font-bold text-black text-sm leading-tight mb-1.5 line-clamp-1 group-hover:text-black transition-colors">
          {shop.shop_name}
        </h3>

        {/* Address with Distance */}
        <div className="flex items-start gap-1.5 mb-2">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600 line-clamp-1 leading-tight">
              {shop.address}
            </p>
            {shop.distance_km !== undefined && (
              <p className="text-xs font-semibold mt-0.5" style={{ color: '#7C3AED' }}>
                {shop.distance_km} km away
              </p>
            )}
          </div>
        </div>

        {/* Categories - Show unique categories only */}
        {uniqueCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {uniqueCategories.slice(0, 2).map((cat, idx) => (
              <span
                key={`${cat.category_id}-${idx}`}
                className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium"
              >
                {cat.subcategory_name || cat.category_id.split('-').join(' ')}
              </span>
            ))}
            {uniqueCategories.length > 2 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                +{uniqueCategories.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Accent Glow on Hover */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#CDFF00] to-transparent transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </button>
  );
}