import React, { useState } from 'react';
import { X } from 'lucide-react';
import { HELPER_CATEGORIES } from '../constants/helperCategories';

interface HelperPreferencesBottomSheetProps {
  onClose: () => void;
  onSave: (preferences: string[]) => void;
}

export function HelperPreferencesBottomSheet({ onClose, onSave }: HelperPreferencesBottomSheetProps) {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const handleTogglePreference = (slug: string) => {
    setSelectedPreferences(prev =>
      prev.includes(slug)
        ? prev.filter(p => p !== slug)
        : [...prev, slug]
    );
  };

  const handleSave = () => {
    onSave(selectedPreferences);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[16px] p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">What kind of help do you want to do?</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-6">
          Select one or more categories. We'll show you only relevant tasks and help requests.
        </p>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {HELPER_CATEGORIES.map((category) => (
            <button
              key={category.slug}
              onClick={() => handleTogglePreference(category.slug)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedPreferences.includes(category.slug)
                  ? 'bg-black text-white font-bold'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{category.emoji}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-[4px] bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={selectedPreferences.length === 0}
            className="flex-1 px-4 py-3 rounded-[4px] bg-black text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
          >
            Save {selectedPreferences.length > 0 && `(${selectedPreferences.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}