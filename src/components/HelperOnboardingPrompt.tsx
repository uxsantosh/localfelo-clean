import { Zap, X } from 'lucide-react';
import { useState } from 'react';

interface HelperOnboardingPromptProps {
  onStartOnboarding: () => void;
  onDismiss?: () => void;
  profileCompletionPercent?: number;
}

export function HelperOnboardingPromptBanner({
  onStartOnboarding,
  onDismiss,
  profileCompletionPercent = 20,
}: HelperOnboardingPromptProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="bg-[#CDFF00] rounded-lg p-4 mb-4 relative">
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-[#CDFF00]" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-black mb-1">
            Get 5x More Relevant Tasks!
          </h3>
          <p className="text-sm text-black/80 mb-3">
            Complete your helper profile to receive personalized task notifications
          </p>
          
          {/* Progress bar */}
          <div className="mb-2">
            <div className="bg-white/30 rounded-full h-2 overflow-hidden">
              <div
                className="bg-black h-2 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletionPercent}%` }}
              />
            </div>
            <p className="text-xs text-black/70 mt-1">
              Profile {profileCompletionPercent}% complete
            </p>
          </div>
          
          <button
            onClick={onStartOnboarding}
            className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors"
          >
            Complete Setup (1 min)
          </button>
        </div>
      </div>
    </div>
  );
}

export function HelperOnboardingFloatingButton({
  onStartOnboarding,
}: {
  onStartOnboarding: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute -top-12 right-0 bg-black text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg animate-bounce">
          Complete your profile! →
          <button
            onClick={() => setShowTooltip(false)}
            className="ml-2 hover:text-gray-300"
          >
            ×
          </button>
        </div>
      )}
      
      {/* FAB */}
      <button
        onClick={onStartOnboarding}
        className="bg-[#CDFF00] text-black p-4 rounded-full shadow-lg hover:scale-110 transition-transform animate-pulse"
      >
        <Zap className="w-6 h-6" />
      </button>
    </div>
  );
}

export function HelperOnboardingModal({
  isOpen,
  onClose,
  onStartOnboarding,
}: {
  isOpen: boolean;
  onClose: () => void;
  onStartOnboarding: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#CDFF00] rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-black" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            Want to see more relevant tasks?
          </h2>
          <p className="text-gray-600 mb-6">
            You've viewed several tasks. Complete your profile to get better matches!
          </p>
          
          {/* Comparison */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="border border-gray-300 rounded-lg p-4">
              <p className="text-3xl mb-2">😕</p>
              <p className="text-sm text-gray-600 mb-1">Without profile</p>
              <p className="text-xl font-bold">~10 tasks/day</p>
            </div>
            <div className="border-2 border-[#CDFF00] bg-[#CDFF00]/10 rounded-lg p-4">
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-sm text-gray-600 mb-1">With profile</p>
              <p className="text-xl font-bold text-[#CDFF00]">~50 tasks/day</p>
            </div>
          </div>
          
          {/* Benefits */}
          <div className="text-left mb-6 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-[#CDFF00] text-xl">✓</span>
              <p className="text-sm text-gray-700">Get tasks matching your skills</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#CDFF00] text-xl">✓</span>
              <p className="text-sm text-gray-700">Receive instant notifications</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#CDFF00] text-xl">✓</span>
              <p className="text-sm text-gray-700">Higher chance of getting selected</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={onStartOnboarding}
              className="w-full bg-[#CDFF00] text-black py-3 rounded-lg font-bold hover:bg-[#CDFF00]/90 transition-colors"
            >
              Complete Profile (1 min)
            </button>
            <button
              onClick={onClose}
              className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HelperProfileCompletionCard({
  onContinue,
  hasCategories = false,
  hasSkills = false,
  hasAvailability = false,
}: {
  onContinue: () => void;
  hasCategories?: boolean;
  hasSkills?: boolean;
  hasAvailability?: boolean;
}) {
  const progress = [hasCategories, hasSkills, hasAvailability].filter(Boolean).length;
  const progressPercent = Math.round((progress / 3) * 100);

  if (progress === 3) return null; // Profile complete

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">Complete Your Profile</h3>
        <span className="text-sm font-semibold text-gray-600">{progressPercent}%</span>
      </div>
      
      <div className="bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-[#CDFF00] h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className={hasCategories ? 'text-[#CDFF00]' : 'text-gray-400'}>
            {hasCategories ? '✅' : '⭕'}
          </span>
          <span className={hasCategories ? 'text-gray-900' : 'text-gray-600'}>
            Select categories
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={hasSkills ? 'text-[#CDFF00]' : 'text-gray-400'}>
            {hasSkills ? '✅' : '⭕'}
          </span>
          <span className={hasSkills ? 'text-gray-900' : 'text-gray-600'}>
            Add custom skills
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={hasAvailability ? 'text-[#CDFF00]' : 'text-gray-400'}>
            {hasAvailability ? '✅' : '⭕'}
          </span>
          <span className={hasAvailability ? 'text-gray-900' : 'text-gray-600'}>
            Set availability
          </span>
        </div>
      </div>
      
      <button
        onClick={onContinue}
        className="w-full bg-[#CDFF00] text-black py-2 rounded-lg font-bold text-sm hover:bg-[#CDFF00]/90 transition-colors"
      >
        Continue Setup
      </button>
    </div>
  );
}
