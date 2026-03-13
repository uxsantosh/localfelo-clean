import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

interface TaskRatingBottomSheetProps {
  taskTitle: string;
  helperName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment?: string) => void;
}

export function TaskRatingBottomSheet({
  taskTitle,
  helperName,
  onClose,
  onSubmit,
}: TaskRatingBottomSheetProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    onSubmit(rating, comment.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white w-full max-w-2xl rounded-t-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Rate Helper</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Info */}
        <div className="bg-white border border-gray-200 p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Task</p>
          <p className="font-medium text-gray-900">{taskTitle}</p>
          <p className="text-sm text-gray-600 mt-2">Helper</p>
          <p className="font-medium text-gray-900">{helperName}</p>
        </div>

        {/* Star Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            How was your experience?
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => {
                  setRating(star);
                  setError('');
                }}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-12 h-12 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-primary text-primary'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        {/* Comment Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share your feedback (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={4}
            placeholder="Tell us about your experience with this helper..."
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-primary text-black py-3 rounded-xl font-medium hover:bg-primary/90"
        >
          Submit Rating
        </button>
      </div>
    </div>
  );
}