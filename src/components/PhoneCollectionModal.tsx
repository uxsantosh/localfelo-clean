import React, { useState } from 'react';
import { Modal } from './Modal';
import { InputField } from './InputField';
import { User } from '../types';
import { Phone } from 'lucide-react';
import { updateUserProfileInDB } from '../services/auth.ts';
import { toast } from 'sonner';

interface PhoneCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PhoneCollectionModal({ isOpen, onClose, onSuccess }: PhoneCollectionModalProps) {
  const [phone, setPhone] = useState('');
  const [whatsappSame, setWhatsappSame] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (!whatsappSame && !whatsappNumber) {
      toast.error('Please enter your WhatsApp number');
      return;
    }

    setLoading(true);

    try {
      await updateUserProfileInDB({ 
        phone: phone,
        whatsappSame: whatsappSame 
      });
      
      toast.success('Phone number saved!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save phone:', error);
      toast.error('Failed to save phone number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {}} // Prevent closing - user must complete
      title="One Last Step!"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted">
            Add your phone number so buyers can reach you
          </p>
        </div>

        <InputField
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="9876543210"
          required
          disabled={loading}
        />

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={whatsappSame}
              onChange={(e) => setWhatsappSame(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
              disabled={loading}
            />
            <span className="text-sm text-body">
              Same number for WhatsApp
            </span>
          </label>

          {!whatsappSame && (
            <InputField
              label="WhatsApp Number"
              type="tel"
              value={whatsappNumber}
              onChange={setWhatsappNumber}
              placeholder="9876543210"
              required
              disabled={loading}
            />
          )}
        </div>

        <button 
          type="submit" 
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Complete Setup'}
        </button>
      </form>
    </Modal>
  );
}