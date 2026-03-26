import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lightbulb, Sparkles } from 'lucide-react';
import { TypingAnimation } from './TypingAnimation';

interface SmartTaskInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
}

export function SmartTaskInputModal({
  isOpen,
  onClose,
  value,
  onChange,
  onContinue,
  isLoggedIn,
  onLoginRequired,
}: SmartTaskInputModalProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Auto-focus textarea when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const textarea = document.getElementById('task-input-modal-textarea');
        if (textarea) textarea.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleFocus = () => {
    if (!isLoggedIn) {
      onLoginRequired();
      onClose();
    } else {
      setIsFocused(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-3xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={onClose}
                  className="p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors rounded-full"
                  aria-label="Close"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Main Card */}
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative">
                {/* Futuristic animated glow border */}
                <div 
                  className="absolute -inset-[2px] rounded-3xl opacity-75 blur-sm"
                  style={{
                    background: 'linear-gradient(90deg, #CDFF00, #00d4ff, #CDFF00)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-shift 3s ease infinite',
                  }}
                />
                
                {/* Content Container */}
                <div className="relative bg-white rounded-3xl p-8 md:p-12">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-5xl font-black text-black mb-3">
                      What help do you need?
                    </h2>
                    <p className="text-gray-600 text-sm md:text-base">
                      Describe your task in detail. Be specific about what you need.
                    </p>
                  </div>

                  {/* Typing Animation Examples */}
                  <div className="mb-4 flex items-center justify-center gap-2 text-sm md:text-base min-h-[28px]">
                    <div className="flex items-center justify-center gap-2">
                      <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-[#CDFF00] flex-shrink-0" />
                      <TypingAnimation
                        phrases={[
                          'Need help with luggage from bus stop',
                          'Bring food from home to office',
                          'Clean my house this weekend',
                          'Looking for pest control',
                          'Need a plumber to fix leaking tap',
                          'Looking for Java developer for a project',
                          'Need someone to walk my dog',
                          'Pick up groceries from market',
                          'Need AC repair urgently',
                          'Looking for a carpenter',
                          'Deliver documents to office',
                          'Need bike repair',
                          'Looking for tutor for mathematics',
                          'Need beautician at home',
                          'Help me move furniture',
                        ]}
                        typingSpeed={40}
                        deletingSpeed={25}
                        pauseDuration={1500}
                        className="text-gray-500 italic"
                      />
                    </div>
                  </div>

                  {/* Textarea with futuristic glow */}
                  <div className="relative group">
                    {/* Outer glow effect */}
                    <div 
                      className={`absolute -inset-1 rounded-2xl transition-all duration-500 blur-md ${
                        isFocused 
                          ? 'opacity-60 bg-gradient-to-r from-[#CDFF00] via-[#00d4ff] to-[#CDFF00]' 
                          : 'opacity-0 bg-gradient-to-r from-[#CDFF00]/30 via-blue-400/30 to-[#CDFF00]/30'
                      }`}
                      style={{
                        backgroundSize: '200% 200%',
                        animation: isFocused ? 'gradient-shift 3s ease infinite' : 'none',
                      }}
                    />
                    
                    {/* Inner border glow */}
                    <div 
                      className={`absolute -inset-[2px] rounded-2xl transition-all duration-300 ${
                        isFocused 
                          ? 'opacity-100 bg-gradient-to-r from-[#CDFF00] via-[#00d4ff] to-[#CDFF00]' 
                          : 'opacity-0'
                      }`}
                      style={{
                        backgroundSize: '200% 200%',
                        animation: isFocused ? 'gradient-shift 3s ease infinite' : 'none',
                      }}
                    />
                    
                    {/* Animated cursor indicator - shows when empty */}
                    {!value && isFocused && (
                      <div className="absolute top-6 left-6 pointer-events-none flex items-center gap-2 z-10">
                        <div className="w-0.5 h-6 bg-gradient-to-b from-[#CDFF00] to-[#00d4ff] animate-pulse"></div>
                        <span className="text-gray-400 text-sm font-medium animate-pulse">Start typing...</span>
                      </div>
                    )}
                    
                    {/* Textarea */}
                    <textarea
                      id="task-input-modal-textarea"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      onFocus={handleFocus}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Describe your task in detail..."
                      className="relative w-full p-6 pb-20 bg-white text-black placeholder-gray-400 text-base md:text-lg resize-none leading-relaxed min-h-[280px] border-2 border-gray-200 rounded-2xl focus:border-transparent focus:outline-none transition-all duration-300 backdrop-blur-sm"
                      rows={8}
                      maxLength={500}
                    />

                    {/* Character count and Continue button - Inside textarea at bottom */}
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                      <span className="text-sm text-gray-500 font-medium bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                        {value.length}/500
                      </span>
                      
                      {/* Continue button with glow effect */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!isLoggedIn) {
                            onLoginRequired();
                            onClose();
                          } else if (value.trim().length >= 10) {
                            onContinue();
                          }
                        }}
                        disabled={value.trim().length < 10}
                        className={`group relative px-8 py-4 rounded-xl font-bold text-base transition-all flex items-center gap-3 overflow-hidden ${
                          value.trim().length >= 10
                            ? 'bg-gradient-to-r from-[#CDFF00] to-[#b8e600] text-black hover:shadow-[0_0_30px_rgba(205,255,0,0.8)] shadow-lg hover:scale-105'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                        }`}
                        title={value.trim().length < 10 ? 'Please enter at least 10 characters' : 'Continue to next step'}
                      >
                        {/* Shimmer effect on hover */}
                        {value.trim().length >= 10 && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        )}
                        
                        <Sparkles className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Continue</span>
                        
                        {/* Animated arrow */}
                        <svg 
                          className={`w-5 h-5 relative z-10 transition-transform ${
                            value.trim().length >= 10 ? 'group-hover:translate-x-1' : ''
                          }`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Add gradient animation keyframes */}
          <style>{`
            @keyframes gradient-shift {
              0%, 100% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
