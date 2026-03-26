// =====================================================
// Stepper Component - LocalFelo
// Multi-step progress indicator
// =====================================================

import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  number: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className = '' }: StepperProps) {
  return (
    <div className={`flex items-center -space-x-0 ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all flex-shrink-0 ${
                isCompleted
                  ? 'bg-black text-[#CDFF00]'
                  : isCurrent
                  ? 'bg-[#CDFF00] text-black border-2 border-black'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{step.number}</span>
              )}
            </div>

            {/* Connector Line - Directly connected with NO gaps */}
            {!isLast && (
              <div
                className={`h-1 flex-shrink-0 transition-all ${
                  isCompleted ? 'bg-black' : 'bg-gray-200'
                }`}
                style={{ width: '120px' }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}