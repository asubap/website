import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Map } from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

export interface LocationObject {
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  location: LocationObject;
  onChange: (loc: LocationObject) => void;
  error?: string;
}

// Helper for reverse geocoding
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.display_name || '';
  } catch {
    return '';
  }
}

const LocationMarker = ({ position, setPositionAndName }: { position: { lat: number, lng: number }, setPositionAndName: (pos: { lat: number, lng: number }, name?: string) => void }) => {
  useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const name = await reverseGeocode(lat, lng);
      setPositionAndName({ lat, lng }, name);
    },
  });
  return <Marker position={position} />;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ location, onChange, error }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const mapRef = useRef<Map | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const provider = useRef(new OpenStreetMapProvider()).current;
  let debounceTimeout: NodeJS.Timeout;

  // Debounced search for suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setIsLoading(true);
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
      const results = await provider.search({ query: searchQuery });
      setSuggestions(results);
      // Only show dropdown if user is typing (input is focused)
      if (document.activeElement === inputRef.current) {
        setShowDropdown(true);
      }
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(debounceTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Handle selection from dropdown
  const handleSuggestionSelect = (loc: any) => {
    onChange({
      ...location,
      latitude: loc.y,
      longitude: loc.x,
      name: loc.label || location.name,
    });
    if (mapRef.current) {
      mapRef.current.setView([loc.y, loc.x], 15);
    }
    setSearchQuery(loc.label);
    setSuggestions([]);
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  // Keyboard navigation for dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      handleSuggestionSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Refined blur logic: only close if focus is outside input and dropdown
  const handleBlur = (e: React.FocusEvent) => {
    setTimeout(() => {
      const active = document.activeElement;
      if (
        active !== inputRef.current &&
        (!dropdownRef.current || !dropdownRef.current.contains(active))
      ) {
        setShowDropdown(false);
      }
    }, 100);
  };

  // Handler for map pin drop (with reverse geocode)
  const setPositionAndName = async (pos: { lat: number, lng: number }, name?: string) => {
    let displayName = name;
    if (!displayName) {
      displayName = await reverseGeocode(pos.lat, pos.lng);
    }
    onChange({ ...location, latitude: pos.lat, longitude: pos.lng, name: displayName || location.name });
    setSearchQuery(displayName || '');
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-3 relative">
        <label className="block text-xs text-gray-600 mb-1">Search for a place or address</label>
        <div className="flex gap-2 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="e.g., Memorial Union, Tempe, AZ"
            className="flex-1 border border-gray-300 rounded-lg p-2 pl-9 focus:outline-none focus:ring-2 focus:ring-bapred"
            autoComplete="off"
          />
        </div>
        {showDropdown && suggestions.length > 0 && (
          <ul ref={dropdownRef} className="absolute z-30 mt-1 mb-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-56 overflow-y-auto">
            {suggestions.map((s, idx) => (
              <li
                key={s.x + '-' + s.y}
                className={`px-4 py-2 cursor-pointer hover:bg-bapred hover:text-white ${activeIndex === idx ? 'bg-bapred text-white' : ''}`}
                onMouseDown={() => handleSuggestionSelect(s)}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                {s.label}
              </li>
            ))}
          </ul>
        )}
        {isLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>}
      </div>
      {/* Location Name */}
      <div className="mb-3">
        <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
        <input
          id="locationName"
          name="locationName"
          type="text"
          placeholder="e.g., Memorial Union, Room 202 (customizable)"
          value={location.name}
          onChange={e => onChange({ ...location, name: e.target.value })}
          className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${error ? 'border-red-500' : 'border-gray-300'}`}
          required
          aria-invalid={!!error}
          aria-describedby={error ? 'location-error' : undefined}
        />
        <div className="text-xs text-gray-500 mt-1">
          You can rename this to a specific room, building, or custom label. For example: <span className="italic">"Memorial Union, Room 202"</span> or <span className="italic">"Engineering Center Courtyard"</span>.
        </div>
        {error && <p id="location-error" className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
      {/* Map */}
      <div className="mb-2">
        <div className="mb-1 text-xs text-gray-600">Click anywhere on the map to drop a pin and select the event location.</div>
        <div className="w-full h-64 rounded-lg border border-gray-300 relative">
          <MapContainer
            center={{ lat: location.latitude, lng: location.longitude }}
            zoom={15}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={true}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              position={{ lat: location.latitude, lng: location.longitude }}
              setPositionAndName={setPositionAndName}
            />
          </MapContainer>
        </div>
      </div>
      {/* Coordinates */}
      <div className="mt-2 text-xs text-gray-600">
        Selected Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
      </div>
    </div>
  );
};

export default LocationPicker; 