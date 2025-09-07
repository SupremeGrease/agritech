import React, { useState } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { LocationData } from '../../hooks/useWeather';

interface LocationSelectorProps {
  selectedLocation: LocationData | null;
  onLocationChange: (location: LocationData) => void;
  onDetectLocation: () => void;
  onSearchLocation?: (cityName: string) => void;
  locationLoading: boolean;
  className?: string;
}

export default function LocationSelector({
  selectedLocation,
  onLocationChange,
  onDetectLocation,
  onSearchLocation,
  locationLoading,
  className = ''
}: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchLocation) {
      onSearchLocation(searchQuery.trim());
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const formatLocationName = (location: LocationData | null) => {
    if (!location) return 'Unknown Location';
    if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    }
    return `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-1">
        <button
          onClick={onDetectLocation}
          disabled={locationLoading}
          className="flex items-center space-x-1 px-2 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          title="Detect current location"
        >
          {locationLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <MapPin className="w-3 h-3" />
          )}
          <span className="hidden sm:inline">Detect</span>
        </button>
        
        {onSearchLocation && (
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center space-x-1 px-2 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
            title="Search for a city"
          >
            <Search className="w-3 h-3" />
            <span className="hidden sm:inline">Search</span>
          </button>
        )}
      </div>

      {showSearch && onSearchLocation && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <form onSubmit={handleSearch} className="p-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter city name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={!searchQuery.trim() || locationLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {locationLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedLocation && (
        <div className="mt-1 text-xs text-gray-500 hidden lg:block">
          <MapPin className="w-3 h-3 inline mr-1" />
          {formatLocationName(selectedLocation)}
        </div>
      )}
    </div>
  );
}
