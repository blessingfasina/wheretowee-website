'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Accessibility, Baby, Coins, Star, ExternalLink } from 'lucide-react';

// Fix for default markers in Next.js
const DefaultIcon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom toilet marker
const ToiletIcon = L.divIcon({
  className: 'custom-toilet-marker',
  html: `<div style="background: #1E3A5F; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 18px;">🚻</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

const AccessibleIcon = L.divIcon({
  className: 'custom-toilet-marker',
  html: `<div style="background: #3498DB; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 18px;">♿</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

interface Toilet {
  id: number;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  fee: string | null;
  wheelchair: string | null;
  baby_changing: string | null;
  average_rating: number | null;
}

// Component to handle location
function LocationHandler({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 15 });
    
    map.on('locationfound', (e) => {
      onLocationFound(e.latlng.lat, e.latlng.lng);
    });

    map.on('locationerror', () => {
      // Default to London if location fails
      map.setView([51.5074, -0.1278], 13);
      onLocationFound(51.5074, -0.1278);
    });
  }, [map, onLocationFound]);

  return null;
}

export default function ToiletMap() {
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [filters, setFilters] = useState({
    accessible: false,
    babyChanging: false,
    free: false,
  });

  const fetchToilets = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/toilets?lat=${lat}&lng=${lng}&radius=5`);
      const data = await response.json();
      setToilets(data.toilets || []);
    } catch (error) {
      console.error('Error fetching toilets:', error);
      // Show some demo data if API fails
      setToilets([
        {
          id: 1,
          name: 'Public Toilet - High Street',
          address: 'High Street, London',
          latitude: lat + 0.002,
          longitude: lng + 0.001,
          fee: 'no',
          wheelchair: 'yes',
          baby_changing: 'yes',
          average_rating: 4.2,
        },
        {
          id: 2,
          name: 'Costa Coffee',
          address: 'Market Square',
          latitude: lat - 0.001,
          longitude: lng + 0.002,
          fee: 'no',
          wheelchair: 'no',
          baby_changing: 'no',
          average_rating: 3.8,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationFound = (lat: number, lng: number) => {
    setUserLocation([lat, lng]);
    fetchToilets(lat, lng);
  };

  const filteredToilets = toilets.filter((toilet) => {
    if (filters.accessible && toilet.wheelchair !== 'yes') return false;
    if (filters.babyChanging && toilet.baby_changing !== 'yes') return false;
    if (filters.free && toilet.fee !== 'no' && toilet.fee !== 'free') return false;
    return true;
  });

  const getIcon = (toilet: Toilet) => {
    if (toilet.wheelchair === 'yes') return AccessibleIcon;
    return ToiletIcon;
  };

  return (
    <div className="relative">
      {/* Filters */}
      <div className="absolute top-4 left-4 right-4 md:left-4 md:right-auto z-[1000]">
        <div className="bg-white rounded-xl shadow-lg p-3 flex flex-wrap gap-2">
          <button
            onClick={() => setFilters((f) => ({ ...f, accessible: !f.accessible }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filters.accessible
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Accessibility className="w-4 h-4" />
            Accessible
          </button>
          <button
            onClick={() => setFilters((f) => ({ ...f, babyChanging: !f.babyChanging }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filters.babyChanging
                ? 'bg-coral-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Baby className="w-4 h-4" />
            Baby Change
          </button>
          <button
            onClick={() => setFilters((f) => ({ ...f, free: !f.free }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filters.free
                ? 'bg-mint-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            Free
          </button>
        </div>
      </div>

      {/* Count */}
      <div className="absolute top-20 left-4 z-[1000]">
        <div className="bg-white rounded-lg shadow px-3 py-1.5 text-sm">
          <span className="font-bold text-navy-600">{filteredToilets.length}</span>
          <span className="text-gray-600"> toilets found</span>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[51.5074, -0.1278]}
        zoom={13}
        className="w-full h-[calc(100vh-130px)]"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <LocationHandler onLocationFound={handleLocationFound} />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: 'user-marker',
              html: `<div style="background: #2ECC71; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              <div className="font-semibold">You are here</div>
            </Popup>
          </Marker>
        )}

        {/* Toilet markers */}
        {filteredToilets.map((toilet) => (
          <Marker
            key={toilet.id}
            position={[toilet.latitude, toilet.longitude]}
            icon={getIcon(toilet)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-navy-800 mb-1">{toilet.name}</h3>
                {toilet.address && (
                  <p className="text-sm text-gray-600 mb-2">{toilet.address}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {toilet.fee === 'no' || toilet.fee === 'free' ? (
                    <span className="bg-mint-100 text-mint-700 text-xs px-2 py-0.5 rounded-full">
                      Free
                    </span>
                  ) : (
                    <span className="bg-coral-100 text-coral-700 text-xs px-2 py-0.5 rounded-full">
                      Paid
                    </span>
                  )}
                  {toilet.wheelchair === 'yes' && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      ♿ Accessible
                    </span>
                  )}
                  {toilet.baby_changing === 'yes' && (
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                      🍼 Baby
                    </span>
                  )}
                </div>
                {toilet.average_rating && (
                  <div className="flex items-center gap-1 text-sm mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{toilet.average_rating.toFixed(1)}</span>
                  </div>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${toilet.latitude},${toilet.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-mint-600 text-sm font-medium hover:text-mint-700"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

