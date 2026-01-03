'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Accessibility, Baby, Coins, Star, ExternalLink, MapPin, Loader2 } from 'lucide-react';

// Custom toilet marker - Standard
const ToiletIcon = L.divIcon({
  className: 'custom-toilet-marker',
  html: `<div style="background: #1E3A5F; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 14px;">🚻</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Custom toilet marker - Accessible
const AccessibleIcon = L.divIcon({
  className: 'custom-toilet-marker',
  html: `<div style="background: #3498DB; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 14px;">♿</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Free toilet marker
const FreeIcon = L.divIcon({
  className: 'custom-toilet-marker',
  html: `<div style="background: #2ECC71; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 14px;">🚻</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export interface Toilet {
  id: number;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  fee: string | null;
  wheelchair: string | null;
  baby_changing: string | null;
  average_rating: number | null;
  distance?: number;
}

// Calculate distance using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format distance for display
function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

// Component to handle location
function LocationHandler({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 15 });

    const handleLocationFound = (e: L.LocationEvent) => {
      onLocationFound(e.latlng.lat, e.latlng.lng);
    };

    const handleLocationError = () => {
      // Default to London if location fails
      map.setView([51.5074, -0.1278], 13);
      onLocationFound(51.5074, -0.1278);
    };

    map.on('locationfound', handleLocationFound);
    map.on('locationerror', handleLocationError);

    return () => {
      map.off('locationfound', handleLocationFound);
      map.off('locationerror', handleLocationError);
    };
  }, [map, onLocationFound]);

  return null;
}

// Component to fly to a location
function FlyToLocation({ position }: { position: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { duration: 0.5 });
    }
  }, [map, position]);

  return null;
}

interface ToiletMapProps {
  onToiletsLoaded?: (toilets: Toilet[]) => void;
}

export default function ToiletMap({ onToiletsLoaded }: ToiletMapProps) {
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedToilet, setSelectedToilet] = useState<[number, number] | null>(null);
  const [filters, setFilters] = useState({
    accessible: false,
    babyChanging: false,
    free: false,
  });

  const fetchToilets = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/toilets?lat=${lat}&lng=${lng}&radius=3&limit=20`);
      const data = await response.json();

      // Calculate distance for each toilet
      const toiletsWithDistance = (data.toilets || []).map((toilet: Toilet) => ({
        ...toilet,
        distance: calculateDistance(lat, lng, toilet.latitude, toilet.longitude),
      }));

      // Sort by distance
      toiletsWithDistance.sort((a: Toilet, b: Toilet) => (a.distance || 0) - (b.distance || 0));

      setToilets(toiletsWithDistance);
      onToiletsLoaded?.(toiletsWithDistance);
    } catch (error) {
      console.error('Error fetching toilets:', error);
      setToilets([]);
    } finally {
      setLoading(false);
    }
  }, [onToiletsLoaded]);

  const handleLocationFound = useCallback((lat: number, lng: number) => {
    setUserLocation([lat, lng]);
    fetchToilets(lat, lng);
  }, [fetchToilets]);

  const filteredToilets = toilets.filter((toilet) => {
    if (filters.accessible && toilet.wheelchair !== 'yes') return false;
    if (filters.babyChanging && toilet.baby_changing !== 'yes') return false;
    if (filters.free && toilet.fee !== 'no' && toilet.fee !== 'free') return false;
    return true;
  });

  // Get top 5 closest
  const closestToilets = filteredToilets.slice(0, 5);

  const getIcon = (toilet: Toilet) => {
    if (toilet.fee === 'no' || toilet.fee === 'free') return FreeIcon;
    if (toilet.wheelchair === 'yes') return AccessibleIcon;
    return ToiletIcon;
  };

  const handleToiletClick = (toilet: Toilet) => {
    setSelectedToilet([toilet.latitude, toilet.longitude]);
  };

  const isFree = (toilet: Toilet) => toilet.fee === 'no' || toilet.fee === 'free';
  const isAccessible = (toilet: Toilet) => toilet.wheelchair === 'yes';
  const hasBabyChange = (toilet: Toilet) => toilet.baby_changing === 'yes';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Map Container */}
      <div className="relative">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilters((f) => ({ ...f, free: !f.free }))}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filters.free
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-400'
            }`}
          >
            <Coins className="w-4 h-4" />
            Free
          </button>
          <button
            onClick={() => setFilters((f) => ({ ...f, accessible: !f.accessible }))}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filters.accessible
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400'
            }`}
          >
            <Accessibility className="w-4 h-4" />
            Accessible
          </button>
          <button
            onClick={() => setFilters((f) => ({ ...f, babyChanging: !f.babyChanging }))}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filters.babyChanging
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-400'
            }`}
          >
            <Baby className="w-4 h-4" />
            Baby Change
          </button>
        </div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100">
          <MapContainer
            center={[51.5074, -0.1278]}
            zoom={14}
            className="w-full h-[400px] lg:h-[500px]"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationHandler onLocationFound={handleLocationFound} />
            <FlyToLocation position={selectedToilet} />

            {/* User location marker */}
            {userLocation && (
              <>
                <Circle
                  center={userLocation}
                  radius={100}
                  pathOptions={{
                    color: '#2ECC71',
                    fillColor: '#2ECC71',
                    fillOpacity: 0.1,
                  }}
                />
                <Marker
                  position={userLocation}
                  icon={L.divIcon({
                    className: 'user-marker',
                    html: `<div style="background: #2ECC71; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #2ECC71, 0 2px 8px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                  })}
                >
                  <Popup>
                    <div className="font-semibold text-center">📍 You are here</div>
                  </Popup>
                </Marker>
              </>
            )}

            {/* Toilet markers - only show top 10 for performance */}
            {filteredToilets.slice(0, 10).map((toilet) => (
              <Marker
                key={toilet.id}
                position={[toilet.latitude, toilet.longitude]}
                icon={getIcon(toilet)}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <h3 className="font-bold text-gray-800 mb-1 text-sm">{toilet.name}</h3>
                    {toilet.address && (
                      <p className="text-xs text-gray-500 mb-2">{toilet.address}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {isFree(toilet) ? (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          Free
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          Paid
                        </span>
                      )}
                      {isAccessible(toilet) && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          ♿
                        </span>
                      )}
                      {hasBabyChange(toilet) && (
                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          🍼
                        </span>
                      )}
                    </div>
                    {toilet.distance !== undefined && (
                      <p className="text-xs text-gray-600 mb-2">
                        📍 {formatDistance(toilet.distance)} away
                      </p>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${toilet.latitude},${toilet.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold hover:text-emerald-700"
                    >
                      <Navigation className="w-3 h-3" />
                      Get Directions
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
            Free
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            Accessible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-navy-600 rounded-full"></span>
            Standard
          </span>
        </div>
      </div>

      {/* Closest Toilets List */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-500" />
          Nearest Toilets
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : closestToilets.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No toilets found nearby.</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting filters or zooming out.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {closestToilets.map((toilet, index) => (
              <button
                key={toilet.id}
                onClick={() => handleToiletClick(toilet)}
                className="w-full text-left bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  {/* Rank Badge */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate group-hover:text-emerald-600 transition-colors">
                      {toilet.name}
                    </h3>
                    {toilet.address && (
                      <p className="text-sm text-gray-500 truncate mt-0.5">{toilet.address}</p>
                    )}

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {isFree(toilet) ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">
                          <Coins className="w-3 h-3" />
                          Free
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-medium">
                          <Coins className="w-3 h-3" />
                          Paid
                        </span>
                      )}
                      {isAccessible(toilet) && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                          <Accessibility className="w-3 h-3" />
                          Accessible
                        </span>
                      )}
                      {hasBabyChange(toilet) && (
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
                          <Baby className="w-3 h-3" />
                          Baby Change
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    {toilet.average_rating && toilet.average_rating > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-sm">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-medium text-gray-700">
                          {toilet.average_rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Distance */}
                  <div className="flex-shrink-0 text-right">
                    {toilet.distance !== undefined && (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                          toilet.distance < 0.5
                            ? 'bg-emerald-100 text-emerald-700'
                            : toilet.distance < 1
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {formatDistance(toilet.distance)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Get Directions Link */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${toilet.latitude},${toilet.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 inline-flex items-center gap-1.5 text-emerald-600 text-sm font-semibold hover:text-emerald-700"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                  <ExternalLink className="w-3 h-3" />
                </a>
              </button>
            ))}
          </div>
        )}

        {/* Join Waitlist CTA */}
        <div className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-5 text-white">
          <div className="flex items-start gap-3">
            <div className="text-3xl">📱</div>
            <div>
              <h3 className="font-bold text-lg">App Coming Soon!</h3>
              <p className="text-emerald-100 text-sm mt-1">
                Join the waitlist for offline access, save favourites, and get notified when near toilets.
              </p>
              <a
                href="/download"
                className="inline-block mt-3 bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-50 transition-colors"
              >
                Join Waitlist →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
