// =====================================================
// Smart Job Input - Live suggestions as you type
// =====================================================

import { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, Loader2 } from 'lucide-react';
import { searchJobSuggestions, JobSuggestion } from '../services/jobSuggestions';

interface SmartJobInputProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect: (suggestion: JobSuggestion) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SmartJobInput({
  value,
  onChange,
  onSuggestionSelect,
  placeholder = 'What work do you need done?',
  autoFocus = false,
}: SmartJobInputProps) {
  const [suggestions, setSuggestions] = useState<JobSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fetch suggestions when value changes
  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce search
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchJobSuggestions(value, 5);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: JobSuggestion) => {
    onSuggestionSelect(suggestion);
    setShowSuggestions(false);
  };

  // Handle clear
  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      {/* Input Field */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-[#CDFF00] focus:outline-none transition-colors"
          autoFocus={autoFocus}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-[#CDFF00] animate-spin" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id || index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-[#CDFF00]/10 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{suggestion.title}</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  ₹{suggestion.typicalBudgetMin}-{suggestion.typicalBudgetMax} • {suggestion.effortLevel}
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-[#CDFF00] flex-shrink-0 ml-2" />
            </button>
          ))}
        </div>
      )}

      {/* Helper Text */}
      {!value && (
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-500">
          <span>Examples:</span>
          <span className="text-gray-700">Bring groceries</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-700">Fix fan</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-700">Pickup parcel</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-700">Clean house</span>
        </div>
      )}
    </div>
  );
}
