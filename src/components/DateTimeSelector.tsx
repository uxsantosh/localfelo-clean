// =====================================================
// Date & Time Selector Component
// Simple, mobile-first, optional time selection
// =====================================================

import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { MobileDatePicker } from './MobileDatePicker';

interface DateTimeSelectorProps {
  label?: string;
  value: {
    option: 'anytime' | 'today' | 'custom';
    customDate?: string;
    time?: string;
    timeOption?: 'anytime' | 'specific';
  };
  onChange: (value: {
    option: 'anytime' | 'today' | 'custom';
    customDate?: string;
    time?: string;
    timeOption?: 'anytime' | 'specific';
  }) => void;
  disabled?: boolean;
}

export function DateTimeSelector({
  label = 'When do you need this?',
  value,
  onChange,
  disabled = false,
}: DateTimeSelectorProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleOptionChange = (option: 'anytime' | 'today' | 'custom') => {
    if (option === 'custom') {
      setShowDatePicker(true);
    }
    
    onChange({
      option,
      customDate: option === 'custom' ? value.customDate : undefined,
      time: option === 'anytime' ? undefined : value.time,
      timeOption: option === 'anytime' ? undefined : (value.timeOption || 'anytime'),
    });
  };

  const handleDateSelect = (date: string) => {
    onChange({
      ...value,
      option: 'custom',
      customDate: date,
    });
  };

  const handleTimeOptionChange = (timeOption: 'anytime' | 'specific') => {
    onChange({
      ...value,
      timeOption,
      time: timeOption === 'anytime' ? undefined : (value.time || '09:00'),
    });
  };

  const handleTimeSelect = (time: string) => {
    onChange({
      ...value,
      time,
      timeOption: 'specific',
    });
  };

  const showTimeOptions = value.option === 'today' || value.option === 'custom';

  // Format date for display
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <>
      <div className="bg-white border border-gray-200 p-4">
        <label className="block text-sm mb-2 text-muted">
          <Calendar className="w-4 h-4 inline mr-1 text-primary" />
          {label}
          <span className="text-gray-400 ml-1">(optional)</span>
        </label>

        {/* Date Options */}
        <div className="flex gap-2 mb-3">
          {(['anytime', 'today', 'custom'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleOptionChange(option)}
              className={`flex-1 px-4 py-3 text-sm transition-colors ${
                value.option === option
                  ? 'bg-black text-white font-medium'
                  : 'bg-white text-gray-600 hover:text-black hover:bg-gray-100 border border-gray-200'
              }`}
              disabled={disabled}
            >
              {option === 'anytime' ? 'Anytime' : option === 'today' ? 'Today' : 'Choose a date'}
            </button>
          ))}
        </div>

        {/* Selected Date Display */}
        {value.option === 'custom' && value.customDate && (
          <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-[6px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{formatDateDisplay(value.customDate)}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="text-xs text-primary hover:text-primary/80"
              disabled={disabled}
            >
              Change
            </button>
          </div>
        )}

        {/* Time Options (for "Today" or "Choose a date") */}
        {showTimeOptions && (
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <label className="block text-sm text-muted mt-3">
              <Clock className="w-4 h-4 inline mr-1 text-primary" />
              What time? (IST)
            </label>
            
            {/* Time Choice: Anytime or Specific */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTimeOptionChange('anytime')}
                className={`flex-1 px-4 py-3 text-sm transition-colors ${
                  (!value.timeOption || value.timeOption === 'anytime')
                    ? 'bg-black text-white font-medium'
                    : 'bg-white text-gray-600 hover:text-black hover:bg-gray-100 border border-gray-200'
                }`}
                disabled={disabled}
              >
                Anytime
              </button>
              <button
                type="button"
                onClick={() => handleTimeOptionChange('specific')}
                className={`flex-1 px-4 py-3 text-sm transition-colors ${
                  value.timeOption === 'specific'
                    ? 'bg-black text-white font-medium'
                    : 'bg-white text-gray-600 hover:text-black hover:bg-gray-100 border border-gray-200'
                }`}
                disabled={disabled}
              >
                Specific time
              </button>
            </div>

            {/* Native Time Input */}
            {value.timeOption === 'specific' && (
              <div className="space-y-2">
                <label className="block text-xs text-muted">Select time (IST)</label>
                <input
                  type="time"
                  value={value.time || ''}
                  onChange={(e) => handleTimeSelect(e.target.value)}
                  className="w-full p-4 text-base border border-gray-200 rounded-[6px] cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                  disabled={disabled}
                  style={{ minHeight: '48px' }}
                />
              </div>
            )}

            <p className="text-xs text-gray-500">
              You can discuss exact timing later in chat
            </p>
          </div>
        )}

        {/* Helper text for "Anytime" date option */}
        {value.option === 'anytime' && (
          <p className="text-xs text-gray-500 mt-2">
            You can discuss exact timing later in chat
          </p>
        )}
      </div>

      {/* Mobile Date Picker Modal */}
      <MobileDatePicker
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateSelect}
        selectedDate={value.customDate}
        minDate={new Date().toISOString().split('T')[0]}
      />
    </>
  );
}

// Helper function to convert selector value to timeWindow string
export function dateTimeSelectorToTimeWindow(value: {
  option: 'anytime' | 'today' | 'custom';
  customDate?: string;
  time?: string;
  timeOption?: 'anytime' | 'specific';
}): string {
  // Map to database constraint values: 'asap', 'today', 'tomorrow'
  if (value.option === 'anytime') {
    return 'asap';
  }

  if (value.option === 'today') {
    return 'today';
  }

  if (value.option === 'custom' && value.customDate) {
    // Check if the custom date is tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    if (value.customDate === tomorrowStr) {
      return 'tomorrow';
    }
    
    // For any other future date, use 'tomorrow' as closest match
    const selectedDate = new Date(value.customDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      return 'tomorrow';
    }
  }

  return 'asap'; // fallback
}

// Helper function to parse timeWindow string back to selector value
export function timeWindowToDateTimeSelector(timeWindow?: string): {
  option: 'anytime' | 'today' | 'custom';
  customDate?: string;
  time?: string;
  timeOption?: 'anytime' | 'specific';
} {
  // Handle database constraint values: 'asap', 'today', 'tomorrow'
  if (!timeWindow || timeWindow === 'asap' || timeWindow === 'anytime') {
    return { option: 'anytime' };
  }

  if (timeWindow === 'today') {
    return {
      option: 'today',
      timeOption: 'anytime',
    };
  }

  if (timeWindow === 'tomorrow') {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      option: 'custom',
      customDate: tomorrow.toISOString().split('T')[0],
      timeOption: 'anytime',
    };
  }

  // Legacy support for old format (if any exist)
  if (timeWindow.startsWith('today-')) {
    const parts = timeWindow.split('-');
    const time = parts[1] || undefined;
    return {
      option: 'today',
      time,
      timeOption: time ? 'specific' : 'anytime',
    };
  }

  // Check if it's a date (YYYY-MM-DD or YYYY-MM-DD-HH:MM)
  const dateParts = timeWindow.split('-');
  if (dateParts.length >= 3) {
    const date = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;
    const time = dateParts.length === 5 ? `${dateParts[3]}:${dateParts[4]}` : undefined;
    return {
      option: 'custom',
      customDate: date,
      time,
      timeOption: time ? 'specific' : 'anytime',
    };
  }

  return { option: 'anytime' };
}