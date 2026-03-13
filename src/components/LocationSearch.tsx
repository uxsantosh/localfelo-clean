import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { searchLocations, SearchResult } from '../services/geocoding';

interface LocationSearchProps {
  onSelect: (location: { lat: number; lng: number; address: string; city: string }) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({ onSelect, placeholder = 'Search for area, street, city...', className = '' }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const searchResults = await searchLocations(query, 10);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Fast response

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    const city = result.address?.city || 
                 result.address?.town || 
                 result.address?.village || 
                 '';
    
    onSelect({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
      city
    });

    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 focus:border-[#CDFF00] focus:outline-none text-[15px]"
          style={{ borderRadius: '12px', fontWeight: '500' }}
        />
        
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}

        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-[#CDFF00] animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 shadow-lg max-h-[320px] overflow-y-auto z-50"
          style={{ borderRadius: '12px' }}
        >
          {results.map((result, index) => {
            const locality = result.address?.suburb || 
                           result.address?.neighbourhood || 
                           result.address?.road;
            const city = result.address?.city || 
                        result.address?.town || 
                        result.address?.village;

            return (
              <button
                key={index}
                onClick={() => handleSelect(result)}
                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-left"
              >
                <MapPin className="w-5 h-5 text-[#CDFF00] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-black truncate" style={{ fontWeight: '600' }}>
                    {locality || city || 'Unknown Location'}
                  </div>
                  <div className="text-[12px] text-gray-500 line-clamp-2 mt-0.5" style={{ fontWeight: '500' }}>
                    {result.display_name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {showResults && !isSearching && query.length >= 2 && results.length === 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 shadow-lg p-3 z-50"
          style={{ borderRadius: '12px' }}
        >
          <p className="text-[13px] text-gray-600 text-center" style={{ fontWeight: '600' }}>
            No results. Try: Area, Bangalore or Pincode
          </p>
        </div>
      )}
    </div>
  );
}