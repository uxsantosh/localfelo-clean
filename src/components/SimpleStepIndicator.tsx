// =====================================================
// Simple Step Indicator - Mobile-friendly progress
// =====================================================

interface SimpleStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function SimpleStepIndicator({ currentStep, totalSteps, steps }: SimpleStepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className="absolute top-0 left-0 h-full bg-[#CDFF00] transition-all duration-300 rounded-full"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      
      {/* Step Text */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-900">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-gray-500">
          {steps[currentStep - 1]}
        </span>
      </div>
    </div>
  );
}
