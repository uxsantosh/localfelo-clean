// =====================================================
// WEEK TIMINGS EDITOR - Simple Open/Close Time Setup
// =====================================================
// Easy-to-use weekly schedule editor for shops

import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface DayTiming {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface WeekTimingsEditorProps {
  initialTimings?: DayTiming[];
  onChange: (timings: DayTiming[]) => void;
  weekTimings?: DayTiming[]; // For displaying current timings
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_TIMING: DayTiming = {
  day: '',
  isOpen: true,
  openTime: '09:00',
  closeTime: '18:00',
};

export function WeekTimingsEditor({ initialTimings, onChange, weekTimings }: WeekTimingsEditorProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [timings, setTimings] = useState<DayTiming[]>(() => {
    if (weekTimings && weekTimings.length === 7) {
      return weekTimings;
    }
    if (initialTimings && initialTimings.length === 7) {
      return initialTimings;
    }
    return DAYS.map(day => ({ ...DEFAULT_TIMING, day }));
  });

  useEffect(() => {
    onChange(timings);
  }, [timings, onChange]);

  const handleToggleDay = (index: number) => {
    const newTimings = [...timings];
    newTimings[index].isOpen = !newTimings[index].isOpen;
    setTimings(newTimings);
  };

  const handleTimeChange = (index: number, field: 'openTime' | 'closeTime', value: string) => {
    const newTimings = [...timings];
    newTimings[index][field] = value;
    setTimings(newTimings);
  };

  const applyToAll = () => {
    const firstDay = timings[0];
    const newTimings = timings.map(timing => ({
      ...timing,
      isOpen: firstDay.isOpen,
      openTime: firstDay.openTime,
      closeTime: firstDay.closeTime,
    }));
    setTimings(newTimings);
  };

  return (
    <div className="space-y-3">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-black" />
          <div className="text-left">
            <h3 className="text-sm font-bold text-black">Working Hours</h3>
            <p className="text-xs text-gray-600">
              {timings.filter(t => t.isOpen).length} days open
            </p>
          </div>
        </div>
        {isCollapsed ? (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Timings Grid - Collapsible */}
      {!isCollapsed && (
        <div className="space-y-3 pl-2">
          {/* Apply to All Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={applyToAll}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-medium transition-colors"
            >
              Apply Mon to All
            </button>
          </div>

          {/* Days */}
          <div className="space-y-2">
            {timings.map((timing, index) => (
          <div
            key={timing.day}
            className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${
              timing.isOpen
                ? 'bg-white border-gray-200'
                : 'bg-gray-50 border-gray-200 opacity-60'
            }`}
          >
            {/* Day Name & Toggle */}
            <div className="flex items-center gap-2 w-28">
              <input
                type="checkbox"
                checked={timing.isOpen}
                onChange={() => handleToggleDay(index)}
                className="w-4 h-4 rounded border-gray-300 text-[#CDFF00] focus:ring-[#CDFF00]"
              />
              <span className={`text-sm font-medium ${timing.isOpen ? 'text-black' : 'text-gray-400'}`}>
                {timing.day.slice(0, 3)}
              </span>
            </div>

            {/* Time Inputs */}
            {timing.isOpen ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={timing.openTime}
                  onChange={(e) => handleTimeChange(index, 'openTime', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                />
                <span className="text-gray-400 text-sm">to</span>
                <input
                  type="time"
                  value={timing.closeTime}
                  onChange={(e) => handleTimeChange(index, 'closeTime', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                />
              </div>
            ) : (
              <div className="flex-1">
                <span className="text-sm text-gray-400">Closed</span>
              </div>
            )}
          </div>
            ))}
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            const newTimings = timings.map(timing => ({
              ...timing,
              isOpen: true,
              openTime: '09:00',
              closeTime: '18:00',
            }));
            setTimings(newTimings);
          }}
          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black rounded-lg transition-colors"
        >
          9 AM - 6 PM (All Days)
        </button>
        <button
          type="button"
          onClick={() => {
            const newTimings = timings.map((timing, idx) => ({
              ...timing,
              isOpen: idx !== 6, // Close Sunday
              openTime: '10:00',
              closeTime: '21:00',
            }));
            setTimings(newTimings);
          }}
          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black rounded-lg transition-colors"
        >
          10 AM - 9 PM (Mon-Sat)
        </button>
        <button
          type="button"
          onClick={() => {
            const newTimings = timings.map(timing => ({
              ...timing,
              isOpen: true,
              openTime: '00:00',
              closeTime: '23:59',
            }));
            setTimings(newTimings);
          }}
          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black rounded-lg transition-colors"
        >
          24/7
        </button>
          </div>
        </div>
      )}
    </div>
  );
}
