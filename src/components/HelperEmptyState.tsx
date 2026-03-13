import { Bell, Tag, MapPin, IndianRupee } from 'lucide-react';

interface HelperEmptyStateProps {
  hasCategories: boolean;
  hasLocation: boolean;
  onSetupHelper: () => void;
  onSetLocation: () => void;
}

export function HelperEmptyState({
  hasCategories,
  hasLocation,
  onSetupHelper,
  onSetLocation,
}: HelperEmptyStateProps) {
  // No helper setup at all
  if (!hasCategories) {
    return (
      <div className="bg-white rounded-xl p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-[#CDFF00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-[#CDFF00]" />
        </div>
        <h3 className="text-xl font-bold mb-2">Become a Helper!</h3>
        <p className="text-gray-600 mb-6">
          Set up your helper profile to see tasks matching your skills. Get notified instantly when someone needs help!
        </p>
        <button
          onClick={onSetupHelper}
          className="w-full px-6 py-4 bg-[#CDFF00] text-black font-bold rounded-lg hover:bg-[#b8e600] transition-colors flex items-center justify-center gap-2"
        >
          <Tag className="w-5 h-5" />
          Set Up Helper Profile
        </button>
        <div className="mt-6 p-4 bg-[#CDFF00]/10 rounded-lg text-left">
          <p className="text-sm font-semibold mb-2">How it works:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Select skills you can help with</li>
            <li>✓ Set your preferred distance & budget</li>
            <li>✓ Get notified for matching tasks</li>
            <li>✓ Start earning by helping others!</li>
          </ul>
        </div>
      </div>
    );
  }

  // Has categories but no location
  if (!hasLocation) {
    return (
      <div className="bg-white rounded-xl p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">Location Required</h3>
        <p className="text-gray-600 mb-6">
          We need your location to show you nearby tasks. Don't worry, your exact address is never shared!
        </p>
        <button
          onClick={onSetLocation}
          className="w-full px-6 py-4 bg-[#CDFF00] text-black font-bold rounded-lg hover:bg-[#b8e600] transition-colors flex items-center justify-center gap-2"
        >
          <MapPin className="w-5 h-5" />
          Set Location
        </button>
      </div>
    );
  }

  // Has setup but no matching tasks
  return (
    <div className="bg-white rounded-xl p-8 text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-xl font-bold mb-2">No Matching Tasks Right Now</h3>
      <p className="text-gray-600 mb-6">
        There are no tasks matching your skills nearby at the moment. Keep Helper Mode ON to get instant notifications when tasks are posted!
      </p>
      
      <div className="bg-[#CDFF00]/10 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3 text-left">
          <Bell className="w-5 h-5 text-[#CDFF00] mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm mb-1">Helper Mode is Active</p>
            <p className="text-xs text-gray-600">
              You'll receive notifications as soon as someone posts a task matching your skills.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-left">
        <p className="text-sm font-semibold">💡 Tips to get more tasks:</p>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start gap-2">
            <Tag className="w-4 h-4 text-[#CDFF00] mt-0.5 shrink-0" />
            <span>Add more skills to your helper profile</span>
          </li>
          <li className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#CDFF00] mt-0.5 shrink-0" />
            <span>Increase your distance range in settings</span>
          </li>
          <li className="flex items-start gap-2">
            <IndianRupee className="w-4 h-4 text-[#CDFF00] mt-0.5 shrink-0" />
            <span>Adjust your budget range to see more opportunities</span>
          </li>
        </ul>
      </div>

      <button
        onClick={onSetupHelper}
        className="w-full mt-6 px-6 py-3 border-2 border-gray-300 text-black font-semibold rounded-lg hover:border-[#CDFF00] hover:bg-[#CDFF00]/10 transition-colors"
      >
        Update Helper Settings
      </button>
    </div>
  );
}
