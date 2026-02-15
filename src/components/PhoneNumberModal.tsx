import React, { useState } from 'react';
import { Modal } from './Modal';
import { InputField } from './InputField';
import { Loader2 } from 'lucide-react';

interface PhoneNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phone: string, whatsappSame: boolean) => Promise<void>;
  userName?: string;
}

export function PhoneNumberModal({ isOpen, onClose, onSubmit, userName }: PhoneNumberModalProps) {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [whatsappSame, setWhatsappSame] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate phone
  const validatePhone = (phoneValue: string): boolean => {
    const digitsOnly = phoneValue.replace(/\D/g, '');
    
    if (digitsOnly.length === 0) {
      setPhoneError('');
      return false;
    }
    
    if (digitsOnly.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 10) {
      setPhone(digitsOnly);
      validatePhone(digitsOnly);
    }
  };

  const handleSubmit = async () => {
    if (!validatePhone(phone)) return;

    setIsSubmitting(true);
    try {
      await onSubmit(phone, whatsappSame);
      // Reset form
      setPhone('');
      setPhoneError('');
      setWhatsappSame(true);
    } catch (error: any) {
      setPhoneError(error.message || 'Failed to update phone number');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
    >
      <div className="space-y-5 py-2">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📱</span>
          </div>
          <h3 className="text-heading mb-2">Add Phone Number</h3>
          <p className="text-muted text-sm">
            Required for buyers to contact you
          </p>
        </div>

        {/* Phone Input Form */}
        <div className="space-y-4">
          <div>
            <InputField
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="10-digit mobile number"
              required
            />
            {phoneError && (
              <p className="text-xs text-rose-500 mt-1.5 ml-1">{phoneError}</p>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                checked={whatsappSame}
                onChange={(e) => setWhatsappSame(e.target.checked)}
                className="w-5 h-5 cursor-pointer accent-primary"
              />
            </div>
            <div className="flex-1">
              <span className="text-body text-sm">
                This is my WhatsApp number
              </span>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={phone.length !== 10 || !!phoneError || isSubmitting}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Continue to Create Listing'
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full text-center text-sm text-muted hover:text-foreground transition-colors py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}