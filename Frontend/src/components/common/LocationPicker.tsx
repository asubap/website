import { useState, useRef } from 'react';
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

const LocationMarker = ({ position, setPosition }: { position: { lat: number, lng: number }, setPosition: (pos: { lat: number, lng: number }) => void }) => {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return <Marker position={position} />;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ location, onChange, error }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<Map | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const provider = new OpenStreetMapProvider();
    const results = await provider.search({ query: searchQuery });
    if (results && results.length > 0) {
      const loc = results[0];
      onChange({
        ...location,
        latitude: loc.y,
        longitude: loc.x,
        name: loc.label || location.name,
      });
      if (mapRef.current && 'setView' in mapRef.current) {
        mapRef.current.setView([loc.y, loc.x], 15);
      }
    }
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-3">
        <label className="block text-xs text-gray-600 mb-1">Search for a place or address</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="e.g., Memorial Union, Tempe, AZ"
            className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-bapred text-white rounded-lg hover:bg-bapreddark transition-colors"
            type="button"
          >
            Search
          </button>
        </div>
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
          You can rename this to a specific room, building, or custom label. For example: <span className="italic">“Memorial Union, Room 202”</span> or <span className="italic">“Engineering Center Courtyard”</span>.
        </div>
        {error && <p id="location-error" className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
      {/* Map */}
      <div className="mb-2">
        <div className="mb-1 text-xs text-gray-600">Click anywhere on the map to drop a pin and select the event location.</div>
        <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300">
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
              setPosition={({ lat, lng }) => onChange({ ...location, latitude: lat, longitude: lng })}
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