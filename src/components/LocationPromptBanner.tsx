import { MapPin, X } from 'lucide-react';
import { useState } from 'react';

interface LocationPromptBannerProps {
  onSetLocation: () => void;
}

export function LocationPromptBanner({ onSetLocation }: LocationPromptBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#CDFF00] to-[#b8e600] border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-black text-white p-2 rounded-full">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Set Your Location</h3>
              <p className="text-xs text-body">Get personalized results near you</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onSetLocation}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              Set Location
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-2 text-black hover:bg-black/10 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}