import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { HelperAvailabilityConfirmDialog } from './HelperAvailabilityConfirmDialog';

interface HelperAvailabilitySliderProps {
  isAvailable: boolean;
  todayCompletionCount: number;
  onToggle: () => void;
  isMobile?: boolean;
  isLoggedIn?: boolean;
}

export function HelperAvailabilitySlider({
  isAvailable,
  todayCompletionCount,
  onToggle,
  isMobile = false,
  isLoggedIn = false,
}: HelperAvailabilitySliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'activate' | 'deactivate' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const threshold = 0.7; // 70% of the slider width

  const handleToggleRequest = () => {
    // Determine if we're activating or deactivating
    const action = isAvailable ? 'deactivate' : 'activate';
    setPendingAction(action);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
    onToggle();
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  useEffect(() => {
    if (!isMobile) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !sliderRef.current || !handleRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const rect = sliderRef.current.getBoundingClientRect();
      const handleWidth = handleRef.current.offsetWidth;
      const maxOffset = rect.width - handleWidth;
      
      let newOffset = clientX - rect.left - handleWidth / 2;
      newOffset = Math.max(0, Math.min(newOffset, maxOffset));
      
      setDragOffset(newOffset);
    };

    const handleMouseUp = () => {
      if (!isDragging || !sliderRef.current || !handleRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const handleWidth = handleRef.current.offsetWidth;
      const maxOffset = rect.width - handleWidth;
      const progress = dragOffset / maxOffset;

      console.log('[HelperAvailabilitySlider] Swipe completed', {
        progress,
        threshold,
        willActivate: progress >= threshold
      });

      if (progress >= threshold) {
        console.log('[HelperAvailabilitySlider] Threshold met, showing confirmation');
        setPendingAction('activate');
        setShowConfirmDialog(true);
      }

      setIsDragging(false);
      setDragOffset(0);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragOffset, onToggle]);

  const handleMouseDown = () => {
    if (!isMobile || isAvailable) return;
    setIsDragging(true);
  };

  if (isMobile) {
    // Mobile: Uber-style slider
    return (
      <>
        <style>{`
          @keyframes helperSlideHintAnim {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(20px); }
          }
          .helper-slider-handle-animated {
            animation: helperSlideHintAnim 2s ease-in-out infinite !important;
          }
          .helper-slider-handle-dragging {
            animation: none !important;
          }
        `}</style>
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {/* Header with instructional text */}
          {!isAvailable && (
            <div style={{ padding: '12px 16px 8px 16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>
                ⚡ Get nearby tasks instantly
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                Turn this on to receive alerts when someone posts a task nearby.
              </div>
            </div>
          )}

          {/* Slider Track */}
          <div
            ref={sliderRef}
            style={{
              position: 'relative',
              height: '56px',
              backgroundColor: isAvailable ? '#CDFF00' : '#f3f4f6',
              transition: 'background-color 0.3s'
            }}
          >
            {/* Background Text */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <span style={{
                fontWeight: 'bold',
                fontSize: '14px',
                color: isAvailable ? '#000' : '#6b7280',
                opacity: isDragging ? 0.5 : 1,
                transition: 'opacity 0.3s'
              }}>
                {isAvailable
                  ? 'You are available for nearby tasks'
                  : 'Swipe to go available →'}
              </span>
            </div>

            {/* Draggable Handle */}
            {!isAvailable && (
              <div
                ref={handleRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                className={isDragging ? 'helper-slider-handle-dragging' : 'helper-slider-handle-animated'}
                style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  bottom: '4px',
                  width: '80px',
                  backgroundColor: '#fff',
                  borderRadius: '6px',
                  boxShadow: isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'grab',
                  transform: isDragging ? `translateX(${dragOffset}px)` : 'translateX(0)',
                  transition: isDragging ? 'none' : undefined
                }}
              >
                <ArrowRight style={{ width: '20px', height: '20px', color: '#374151' }} />
              </div>
            )}

            {/* Tap to disable when available */}
            {isAvailable && (
              <button
                onClick={handleToggleRequest}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'transparent'
                }}
                aria-label="Tap to go unavailable"
              />
            )}
          </div>

          {/* Footer Info */}
          {isAvailable && (
            <div style={{ padding: '12px 16px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Tap green area to go unavailable
              </div>
            </div>
          )}

          {/* Confirmation Dialog */}
          {showConfirmDialog && (
            <HelperAvailabilityConfirmDialog
              isOpen={showConfirmDialog}
              isActivating={pendingAction === 'activate'}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          )}
        </div>
      </>
    );
  }

  // Desktop: Pure inline styles toggle (NO CSS classes)
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>
            ⚡ Get nearby tasks instantly
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.4' }}>
            {isAvailable
              ? 'You are available for nearby tasks'
              : 'Turn this on to receive alerts when someone posts a task nearby.'}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <button
            onClick={handleToggleRequest}
            style={{
              width: '56px',
              height: '32px',
              backgroundColor: isAvailable ? '#CDFF00' : '#e5e7eb',
              borderRadius: '4px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: isAvailable ? '2px solid #B8E600' : '2px solid #d1d5db',
              padding: '0',
              outline: 'none',
              display: 'block',
              boxShadow: isAvailable 
                ? 'inset 0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(205, 255, 0, 0.3)'
                : 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
            }}
            aria-label={isAvailable ? 'Go unavailable' : 'Go available'}
          >
            <div
              style={{
                width: '22px',
                height: '22px',
                backgroundColor: '#fff',
                borderRadius: '3px',
                position: 'absolute',
                top: '3px',
                left: isAvailable ? '29px' : '3px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isAvailable
                  ? '0 4px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                  : '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            />
          </button>
        </div>
      </div>
      {showConfirmDialog && (
        <HelperAvailabilityConfirmDialog
          isOpen={showConfirmDialog}
          isActivating={pendingAction === 'activate'}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}