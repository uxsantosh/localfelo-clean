import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showClose?: boolean;
  preventClose?: boolean; // New prop to prevent closing
}

export function Modal({ isOpen, onClose, title, children, showClose = true, preventClose = false }: ModalProps) {
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
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
      />

      {/* Modal Content - Flat Design */}
      <div className="relative w-full max-w-lg bg-card rounded-t md:rounded border border-border max-h-[90vh] overflow-hidden flex flex-col animate-in">
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between p-5 border-b border-border">
            {title && <h2 className="text-heading m-0 font-bold text-[20px]">{title}</h2>}
            {showClose && (
              <button
                onClick={handleClose}
                disabled={preventClose}
                className="p-2 -mr-2 hover:bg-input rounded active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-heading" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}