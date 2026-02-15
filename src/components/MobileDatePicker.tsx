// =====================================================
// Mobile-Optimized Date Picker
// Bottom sheet with quick options + calendar
// =====================================================

import { X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MobileDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  selectedDate?: string;
  minDate?: string;
}

export function MobileDatePicker({
  isOpen,
  onClose,
  onSelect,
  selectedDate,
  minDate,
}: MobileDatePickerProps) {
  const [viewDate, setViewDate] = useState(new Date());
  
  useEffect(() => {
    if (selectedDate) {
      setViewDate(new Date(selectedDate));
    }
  }, [selectedDate]);

  if (!isOpen) return null;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const quickOptions = [
    { label: 'Today', date: formatDate(today), display: formatDisplayDate(today) },
    { label: 'Tomorrow', date: formatDate(tomorrow), display: formatDisplayDate(tomorrow) },
    { label: 'Day After', date: formatDate(dayAfter), display: formatDisplayDate(dayAfter) },
    { label: 'Next Week', date: formatDate(nextWeek), display: formatDisplayDate(nextWeek) },
  ];

  const handleQuickSelect = (date: string) => {
    onSelect(date);
    onClose();
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(viewDate);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const selectedDateObj = new Date(year, month, day);
    const dateStr = formatDate(selectedDateObj);
    
    // Check if date is before minDate
    if (minDate && dateStr < minDate) {
      return;
    }
    
    onSelect(dateStr);
    onClose();
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">Select Date</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Options */}
        <div className="p-4 space-y-2 border-b border-gray-200">
          <p className="text-sm text-muted mb-3">Quick Select</p>
          <div className="grid grid-cols-2 gap-2">
            {quickOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => handleQuickSelect(option.date)}
                className={`p-3 border rounded-[6px] text-left transition-colors ${
                  selectedDate === option.date
                    ? 'bg-[#CDFF00] border-[#CDFF00] text-black'
                    : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-gray-600 mt-1">{option.display}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="p-4">
          <p className="text-sm text-muted mb-3">Or Pick a Date</p>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="font-medium">
              {monthNames[month]} {year}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center text-xs text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            
            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(year, month, day);
              const dateStr = formatDate(dateObj);
              const isSelected = selectedDate === dateStr;
              const isToday = formatDate(today) === dateStr;
              const isPast = minDate ? dateStr < minDate : false;
              
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  disabled={isPast}
                  className={`
                    aspect-square p-2 text-sm rounded-[6px] transition-colors
                    ${isSelected ? 'bg-black text-white font-medium' : ''}
                    ${isToday && !isSelected ? 'border border-primary text-primary font-medium' : ''}
                    ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                    ${!isSelected && !isToday && !isPast ? 'text-gray-700' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}