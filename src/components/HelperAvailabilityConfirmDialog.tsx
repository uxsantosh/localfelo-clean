import React from 'react';
import { Activity, X } from 'lucide-react';

interface HelperAvailabilityConfirmDialogProps {
  isOpen: boolean;
  isActivating: boolean; // true = turning ON, false = turning OFF
  onConfirm: () => void;
  onCancel: () => void;
}

export function HelperAvailabilityConfirmDialog({
  isOpen,
  isActivating,
  onConfirm,
  onCancel,
}: HelperAvailabilityConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-black">
              {isActivating ? 'Go Available' : 'Turn Off'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isActivating ? (
            <>
              <p className="text-gray-700 mb-4">
                You'll get notified when tasks are posted near you.
              </p>
              <div className="bg-[#CDFF00]/20 border border-[#CDFF00] rounded-lg p-3">
                <p className="text-sm text-black">
                  <span className="font-bold">⚡ Quick alerts</span> help you respond first.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700 mb-4">
                Are you sure you want to turn off helper mode? You'll stop receiving task notifications and won't be visible to people looking for help.
              </p>
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                <p className="text-sm text-black">
                  💡 You can turn this back on anytime from the home screen.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-border">
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: '#f3f4f6',
              color: '#000',
              fontWeight: 'bold',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: isActivating ? '#CDFF00' : '#374151',
              color: isActivating ? '#000' : '#fff',
              fontWeight: 'bold',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isActivating ? '#b8e600' : '#1f2937'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isActivating ? '#CDFF00' : '#374151'}
          >
            {isActivating ? 'Go Available' : 'Turn Off'}
          </button>
        </div>
      </div>
    </div>
  );
}