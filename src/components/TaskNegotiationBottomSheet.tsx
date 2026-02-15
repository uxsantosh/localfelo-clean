import React, { useState } from 'react';
import { X, IndianRupee, AlertCircle } from 'lucide-react';
import { Task } from '../types';

interface TaskNegotiationBottomSheetProps {
  task: Task;
  onClose: () => void;
  onSubmit: (offeredPrice: number, message?: string) => void;
  maxRoundsReached?: boolean;
}

export function TaskNegotiationBottomSheet({
  task,
  onClose,
  onSubmit,
  maxRoundsReached = false,
}: TaskNegotiationBottomSheetProps) {
  const [offeredPrice, setOfferedPrice] = useState<string>(task.price?.toString() || '0');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string>('');

  const handleSubmit = () => {
    const price = parseInt(offeredPrice);
    
    if (!price || price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    if (task.price && price >= task.price) {
      setError('Your offer should be less than the original price');
      return;
    }

    onSubmit(price, message.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white w-full max-w-2xl rounded-t-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Negotiate Price</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {maxRoundsReached ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Maximum Negotiation Rounds Reached</p>
              <p className="text-sm text-red-700 mt-1">
                You've reached the maximum of 2 negotiation rounds for this task.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Original Price */}
            <div className="bg-white border border-gray-200 p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Original Price</p>
              <div className="flex items-center gap-1 text-2xl font-bold text-gray-900">
                <IndianRupee className="w-6 h-6" />
                <span>₹{task.price?.toLocaleString() || '0'}</span>
              </div>
            </div>

            {/* Offered Price Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Offer Price *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={offeredPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setOfferedPrice(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your price"
                />
              </div>
            </div>

            {/* Message Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={3}
                placeholder="Add a message to explain your offer..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-700">
              💡 You can negotiate up to 2 times for this task. The task owner will review your offer.
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-primary text-black py-3 rounded-xl font-medium hover:bg-primary/90"
            >
              Submit Offer
            </button>
          </>
        )}
      </div>
    </div>
  );
}