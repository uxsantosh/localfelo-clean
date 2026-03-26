import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showClose?: boolean;
  preventClose?: boolean; // New prop to prevent closing
  maxWidth?: string; // Custom max-width class
}

export function Modal({ isOpen, onClose, title, children, showClose = true, preventClose = false, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!preventClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center" style={{ position: 'fixed', zIndex: 100 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      />

      {/* Modal Content - Flat Design */}
      <div 
        className={`relative w-full ${maxWidth} rounded-t-2xl md:rounded-2xl border-2 max-h-[90vh] overflow-hidden flex flex-col animate-in shadow-2xl`} 
        style={{ 
          backgroundColor: '#FFFFFF !important',
          borderColor: '#E0E0E0',
          position: 'relative',
          zIndex: 101
        }}
      >
        {/* Header */}
        {(title || showClose) && (
          <div 
            className="flex items-center justify-between p-5 border-b" 
            style={{ 
              backgroundColor: '#FFFFFF',
              borderBottomColor: '#E0E0E0'
            }}
          >
            {title && <h2 className="m-0 font-bold text-[20px]" style={{ color: '#000000' }}>{title}</h2>}
            {showClose && (
              <button
                onClick={handleClose}
                disabled={preventClose}
                className="p-2 -mr-2 hover:bg-gray-100 rounded-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <X className="w-5 h-5" style={{ color: '#000000' }} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div 
          className="flex-1 overflow-y-auto p-5" 
          style={{ backgroundColor: '#FFFFFF' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}