import { MapPin, Briefcase } from 'lucide-react';
import { Professional } from '../services/professionals';

interface ProfessionalCardProps {
  professional: Professional;
  onViewDetails: () => void;
  onWhatsAppClick: () => void;
  showRole?: boolean; // NEW: Show role instead of category
}

export function ProfessionalCard({
  professional,
  onViewDetails,
  onWhatsAppClick,
  showRole = false,
}: ProfessionalCardProps) {
  // Show only first 3 services in preview
  const previewServices = professional.services?.slice(0, 3) || [];
  const hasMoreServices = (professional.services?.length || 0) > 3;

  return (
    <div 
      onClick={onViewDetails}
      className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-[#CDFF00]/30"
    >
      {/* Profile Image - Full Width Hero */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {professional.profile_image_url ? (
          <img
            src={professional.profile_image_url}
            alt={professional.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            👤
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Distance Badge - Top Right */}
        {professional.distance !== undefined && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-black shadow-lg">
            <MapPin className="w-3.5 h-3.5" />
            {professional.distance.toFixed(1)} km
          </div>
        )}
        
        {/* Name & Title - Bottom Left Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-white text-xl mb-1 truncate drop-shadow-lg">
            {professional.name}
          </h3>
          <p className="text-sm text-white/90 truncate drop-shadow-lg">{professional.title}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Role/Category Badge */}
        {showRole && professional.role_name ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#CDFF00]/20 rounded-full text-xs font-semibold mb-3">
            <Briefcase className="w-3.5 h-3.5 text-black" />
            <span className="text-black">{professional.role_name}</span>
          </div>
        ) : professional.category_name ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-semibold mb-3">
            <Briefcase className="w-3.5 h-3.5 text-gray-700" />
            <span className="text-gray-700">{professional.category_name}</span>
          </div>
        ) : null}

        {/* Services Preview */}
        {previewServices.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Services</div>
            <div className="space-y-2">
              {previewServices.map((service, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate flex-1">{service.service_name}</span>
                  {service.price && (
                    <span className="text-sm text-black font-bold ml-3 flex-shrink-0">
                      ₹{service.price}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {hasMoreServices && (
              <div className="text-xs text-gray-500 mt-2 font-medium">
                +{professional.services!.length - 3} more services
              </div>
            )}
          </div>
        )}

        {/* Location */}
        {professional.address && (
          <div className="flex items-start gap-2 text-xs text-gray-600 mb-4 bg-gray-50 rounded-lg p-2.5">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
            <span className="line-clamp-2 leading-relaxed">{professional.address}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="flex-1 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all active:scale-95"
          >
            View Profile
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWhatsAppClick();
            }}
            className="flex-1 px-4 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-semibold hover:bg-[#20BD5A] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span className="hidden sm:inline">Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}