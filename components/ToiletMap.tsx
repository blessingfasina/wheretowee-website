'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Accessibility, Baby, Coins, ExternalLink, MapPin, Loader2, LocateFixed, Search, Plus, AlertTriangle, X, Target, Crosshair, Star, ChevronDown, ChevronUp, Clock, Key, Info, CheckCircle } from 'lucide-react';
import { trackGetDirections, trackMapSearch, trackInaccuracyReport } from '@/lib/analytics';

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
  // V2 fields
  opening_hours?: string | null;
  notes?: string | null;
  payment_details?: string | null;
  radar_key?: string | null;
  verified_at?: string | null;
  men?: string | null;
  women?: string | null;
  unisex?: string | null;
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

// Check if toilet is currently open based on opening_hours string
function isOpenNow(openingHours: string | null | undefined): boolean | null {
  if (!openingHours) return null; // Unknown
  
  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDay = dayNames[now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight
  
  // Handle "Daily: HH:MM-HH:MM" format
  const dailyMatch = openingHours.match(/Daily:\s*(\d{2}):(\d{2})-(\d{2}):(\d{2})/i);
  if (dailyMatch) {
    const openTime = parseInt(dailyMatch[1]) * 60 + parseInt(dailyMatch[2]);
    const closeTime = parseInt(dailyMatch[3]) * 60 + parseInt(dailyMatch[4]);
    return currentTime >= openTime && currentTime <= closeTime;
  }
  
  // Handle "Mon: HH:MM-HH:MM, Tue: ..." format
  const dayPattern = new RegExp(`${currentDay}:\\s*(\\d{2}):(\\d{2})-(\\d{2}):(\\d{2})`, 'i');
  const dayMatch = openingHours.match(dayPattern);
  if (dayMatch) {
    const openTime = parseInt(dayMatch[1]) * 60 + parseInt(dayMatch[2]);
    const closeTime = parseInt(dayMatch[3]) * 60 + parseInt(dayMatch[4]);
    return currentTime >= openTime && currentTime <= closeTime;
  }
  
  // Check if explicitly closed today
  const closedPattern = new RegExp(`${currentDay}:\\s*Closed`, 'i');
  if (closedPattern.test(openingHours)) {
    return false;
  }
  
  return null; // Unknown
}

// Get open status label
function getOpenStatus(openingHours: string | null | undefined): { label: string; color: string } {
  const isOpen = isOpenNow(openingHours);
  if (isOpen === true) return { label: 'Open Now', color: 'emerald' };
  if (isOpen === false) return { label: 'Closed', color: 'red' };
  return { label: 'Hours Unknown', color: 'gray' };
}

// Component to handle location
function LocationHandler({ 
  onLocationFound, 
  onLocating,
  refreshTrigger,
  highAccuracy,
  onAccuracyDetected,
}: { 
  onLocationFound: (lat: number, lng: number) => void;
  onLocating: (isLocating: boolean) => void;
  refreshTrigger: number;
  highAccuracy: boolean;
  onAccuracyDetected: (accuracy: number | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    onLocating(true);
    onAccuracyDetected(null);
    
    map.locate({ 
      setView: true, 
      maxZoom: 15, 
      enableHighAccuracy: highAccuracy,
      timeout: highAccuracy ? 15000 : 5000, // Longer timeout for high accuracy
      maximumAge: highAccuracy ? 0 : 60000, // No cache for high accuracy
    });

    const handleLocationFound = (e: L.LocationEvent) => {
      onLocationFound(e.latlng.lat, e.latlng.lng);
      onAccuracyDetected(e.accuracy); // Accuracy in meters
      onLocating(false);
    };

    const handleLocationError = () => {
      // Default to London if location fails
      map.setView([51.5074, -0.1278], 13);
      onLocationFound(51.5074, -0.1278);
      onAccuracyDetected(null);
      onLocating(false);
    };

    map.on('locationfound', handleLocationFound);
    map.on('locationerror', handleLocationError);

    return () => {
      map.off('locationfound', handleLocationFound);
      map.off('locationerror', handleLocationError);
    };
  }, [map, onLocationFound, onLocating, refreshTrigger, highAccuracy, onAccuracyDetected]);

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

// Search result interface
interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

// Component to fly to search location
function FlyToSearch({ position, onComplete }: { position: [number, number] | null; onComplete: () => void }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1 });
      // Call onComplete after animation
      setTimeout(onComplete, 1000);
    }
  }, [map, position, onComplete]);

  return null;
}

export default function ToiletMap({ onToiletsLoaded }: ToiletMapProps) {
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedToilet, setSelectedToilet] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState({
    accessible: false,
    babyChanging: false,
    free: false,
    openNow: false,
    radarKey: false,
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLocation, setSearchLocation] = useState<[number, number] | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportToiletId, setReportToiletId] = useState<number | null>(null);
  const [reportType, setReportType] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // GPS accuracy state
  const [highAccuracyMode, setHighAccuracyMode] = useState(true);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  // Expanded toilet state
  const [expandedToiletId, setExpandedToiletId] = useState<number | null>(null);

  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingToiletId, setRatingToiletId] = useState<number | null>(null);
  const [ratingToiletName, setRatingToiletName] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const handleRefreshLocation = useCallback(() => {
    setLoading(true);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleLocating = useCallback((locating: boolean) => {
    setIsLocating(locating);
  }, []);

  const handleAccuracyDetected = useCallback((accuracy: number | null) => {
    setGpsAccuracy(accuracy);
  }, []);

  const toggleHighAccuracy = useCallback(() => {
    setHighAccuracyMode(prev => !prev);
    // Trigger location refresh when toggling
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Search for locations using OpenStreetMap Nominatim
  const searchLocation_fn = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=gb&limit=5`,
        { headers: { 'Accept-Language': 'en-GB' } }
      );
      const data = await response.json();
      setSearchResults(data);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocation_fn(value);
    }, 300);
  }, [searchLocation_fn]);

  // Handle search result selection
  const handleSelectSearchResult = useCallback((result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSearchLocation([lat, lng]);
    setSearchQuery(result.display_name.split(',')[0]);
    setShowSearchResults(false);
    setLoading(true);
  }, []);

  // Callback when search fly completes
  const handleSearchComplete = useCallback(() => {
    if (searchLocation) {
      fetchToilets(searchLocation[0], searchLocation[1]);
      setSearchLocation(null);
    }
  }, [searchLocation]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle report submission
  const handleSubmitReport = async () => {
    if (!reportType || !reportDetails.trim()) return;

    setIsSubmittingReport(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toilet_id: reportToiletId,
          type: reportType,
          details: reportDetails,
        }),
      });

      if (response.ok) {
        setReportSubmitted(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportSubmitted(false);
          setReportType('');
          setReportDetails('');
          setReportToiletId(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Report submission error:', error);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Open report modal
  const openReportModal = (toiletId?: number) => {
    setReportToiletId(toiletId || null);
    setShowReportModal(true);
  };

  // Toggle expanded toilet
  const toggleExpandedToilet = (toiletId: number) => {
    setExpandedToiletId(prev => prev === toiletId ? null : toiletId);
  };

  // Open rating modal
  const openRatingModal = (toiletId: number, toiletName: string) => {
    setRatingToiletId(toiletId);
    setRatingToiletName(toiletName);
    setShowRatingModal(true);
  };

  // Handle rating submission
  const handleSubmitRating = async () => {
    if (!ratingToiletId || selectedRating === 0) return;

    setIsSubmittingRating(true);
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toilet_id: ratingToiletId,
          rating: selectedRating,
          comment: ratingComment || null,
        }),
      });

      if (response.ok) {
        setRatingSubmitted(true);
        setTimeout(() => {
          setShowRatingModal(false);
          setRatingSubmitted(false);
          setSelectedRating(0);
          setRatingComment('');
          setRatingToiletId(null);
          setRatingToiletName('');
        }, 2000);
      }
    } catch (error) {
      console.error('Rating submission error:', error);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const fetchToilets = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/toilets?lat=${lat}&lng=${lng}&radius=5&limit=50`);
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
    if (filters.openNow && isOpenNow(toilet.opening_hours) !== true) return false;
    if (filters.radarKey && toilet.radar_key !== 'yes') return false;
    return true;
  });

  // Get top 7 closest
  const closestToilets = filteredToilets.slice(0, 7);

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
  const needsRadarKey = (toilet: Toilet) => toilet.radar_key === 'yes';
  const isVerified = (toilet: Toilet) => !!toilet.verified_at;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Map Container */}
      <div className="relative">
        {/* Filters and Actions */}
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
          <button
            onClick={() => setFilters((f) => ({ ...f, openNow: !f.openNow }))}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filters.openNow
                ? 'bg-teal-500 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-teal-400'
            }`}
          >
            <Clock className="w-4 h-4" />
            Open Now
          </button>
          <button
            onClick={() => setFilters((f) => ({ ...f, radarKey: !f.radarKey }))}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filters.radarKey
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-400'
            }`}
            title="Show toilets that accept RADAR keys"
          >
            <Key className="w-4 h-4" />
            RADAR
          </button>

          {/* High Accuracy Toggle */}
          <button
            onClick={toggleHighAccuracy}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              highAccuracyMode
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-400'
            }`}
            title={highAccuracyMode ? 'Using GPS (more accurate, slower)' : 'Using WiFi/Network (faster, less accurate)'}
          >
            <Crosshair className="w-4 h-4" />
            {highAccuracyMode ? 'GPS' : 'Fast'}
          </button>

          {/* Refresh Location Button */}
          <button
            onClick={handleRefreshLocation}
            disabled={isLocating}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ml-auto ${
              isLocating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg'
            }`}
          >
            <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-pulse' : ''}`} />
            {isLocating ? 'Locating...' : 'My Location'}
          </button>
        </div>

        {/* GPS Accuracy Indicator */}
        {gpsAccuracy !== null && (
          <div className={`mb-3 flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
            gpsAccuracy <= 50 
              ? 'bg-emerald-50 text-emerald-700' 
              : gpsAccuracy <= 200 
              ? 'bg-amber-50 text-amber-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            <Target className="w-4 h-4" />
            <span className="font-medium">
              Location accuracy: ±{gpsAccuracy < 1000 ? `${Math.round(gpsAccuracy)}m` : `${(gpsAccuracy / 1000).toFixed(1)}km`}
            </span>
            {gpsAccuracy > 200 && (
              <span className="text-xs opacity-75">
                (Try enabling GPS mode for better accuracy)
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          <a
            href="/submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-navy-600 text-white hover:bg-navy-700 shadow-md hover:shadow-lg transition-all"
            style={{ backgroundColor: '#1E3A5F' }}
          >
            <Plus className="w-4 h-4" />
            Add a Toilet
          </a>
          <button
            onClick={() => openReportModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            Report Inaccuracy
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

            <LocationHandler 
              onLocationFound={handleLocationFound} 
              onLocating={handleLocating}
              refreshTrigger={refreshTrigger}
              highAccuracy={highAccuracyMode}
              onAccuracyDetected={handleAccuracyDetected}
            />
            <FlyToLocation position={selectedToilet} />
            <FlyToSearch position={searchLocation} onComplete={handleSearchComplete} />

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
                      {isAccessible(toilet) ? (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          ♿ Accessible
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium">
                          Not Accessible
                        </span>
                      )}
                      {hasBabyChange(toilet) ? (
                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          🍼 Baby Change
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium">
                          No Baby Change
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
                      onClick={() => trackGetDirections(toilet.name, toilet.id)}
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

        {/* Search Bar - Positioned here for mobile visibility */}
        <div className="mb-4 relative" ref={searchContainerRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search location"
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-gray-800"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
              </div>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 line-clamp-2">{result.display_name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

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
              <div
                key={toilet.id}
                className={`bg-white rounded-xl border-2 transition-all ${
                  expandedToiletId === toilet.id 
                    ? 'border-emerald-400 shadow-md' 
                    : 'border-gray-100 hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                {/* Main Card - Clickable */}
                <button
                  onClick={() => {
                    handleToiletClick(toilet);
                    toggleExpandedToilet(toilet.id);
                  }}
                  className="w-full text-left p-4 group"
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
                        {/* Open/Closed Status */}
                        {toilet.opening_hours && (
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                            isOpenNow(toilet.opening_hours) === true 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : isOpenNow(toilet.opening_hours) === false 
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {getOpenStatus(toilet.opening_hours).label}
                          </span>
                        )}
                        {/* Free Badge */}
                        {isFree(toilet) && (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">
                            <Coins className="w-3 h-3" />
                            Free
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
                        {needsRadarKey(toilet) && (
                          <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium">
                            <Key className="w-3 h-3" />
                            RADAR
                          </span>
                        )}
                        {isVerified(toilet) && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-xs px-2 py-1 rounded-full font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Distance & Expand Icon */}
                    <div className="flex-shrink-0 text-right flex flex-col items-end gap-2">
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
                      {expandedToiletId === toilet.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Details & Actions */}
                {expandedToiletId === toilet.id && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                    {/* Detailed Information */}
                    <div className="mt-3 space-y-3">
                      {/* Open Status & Hours */}
                      {toilet.opening_hours && (
                        <div className="flex items-start gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mr-2 ${
                              isOpenNow(toilet.opening_hours) === true 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : isOpenNow(toilet.opening_hours) === false 
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {getOpenStatus(toilet.opening_hours).label}
                            </span>
                            <span className="text-gray-600 text-xs">{toilet.opening_hours}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Fee Information */}
                      <div className="flex items-start gap-2 text-sm">
                        <Coins className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          {isFree(toilet) ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                              Free to use
                            </span>
                          ) : toilet.payment_details ? (
                            <span className="text-gray-700">{toilet.payment_details}</span>
                          ) : toilet.fee === 'yes' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                              Fee required
                            </span>
                          ) : (
                            <span className="text-gray-500 text-xs">Fee info not available</span>
                          )}
                        </div>
                      </div>
                      
                      {/* RADAR Key */}
                      {needsRadarKey(toilet) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Key className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                            🔑 RADAR Key Required
                          </span>
                        </div>
                      )}
                      
                      {/* Gender Info */}
                      {(toilet.men === 'yes' || toilet.women === 'yes' || toilet.unisex === 'yes') && (
                        <div className="flex items-center gap-2 text-sm">
                          <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {toilet.men === 'yes' && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">Men</span>
                            )}
                            {toilet.women === 'yes' && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-600">Women</span>
                            )}
                            {toilet.unisex === 'yes' && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600">Unisex</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Notes */}
                      {toilet.notes && (
                        <div className="flex items-start gap-2 text-sm">
                          <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-600 text-xs leading-relaxed">{toilet.notes}</p>
                        </div>
                      )}
                      
                      {/* Verified Badge */}
                      {isVerified(toilet) && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-emerald-600 text-xs font-medium">Verified location</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {/* Get Directions */}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${toilet.latitude},${toilet.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          trackGetDirections(toilet.name, toilet.id);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors"
                      >
                        <Navigation className="w-4 h-4" />
                        Get Directions
                      </a>
                      
                      {/* Rate Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openRatingModal(toilet.id, toilet.name);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-amber-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors"
                      >
                        <Star className="w-4 h-4" />
                        Rate
                      </button>
                      
                      {/* Report Inaccuracy Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openReportModal(toilet.id);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

      {/* Report Inaccuracy Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Report Inaccuracy
              </h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportType('');
                  setReportDetails('');
                  setReportToiletId(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {reportSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">Thank You!</h4>
                  <p className="text-gray-600">Your report has been submitted. We&apos;ll review it shortly.</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 text-sm mb-4">
                    Help us keep our data accurate. Let us know what&apos;s wrong and we&apos;ll fix it.
                  </p>

                  {/* Report Type */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      What&apos;s the issue? *
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none transition-colors"
                    >
                      <option value="">Select an issue type</option>
                      <option value="wrong_location">Wrong location</option>
                      <option value="permanently_closed">Toilet permanently closed</option>
                      <option value="temporarily_closed">Toilet temporarily closed</option>
                      <option value="wrong_accessibility">Incorrect accessibility info</option>
                      <option value="wrong_baby_change">Incorrect baby change info</option>
                      <option value="wrong_fee">Incorrect fee information</option>
                      <option value="duplicate">Duplicate listing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Report Details */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Details *
                    </label>
                    <textarea
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      placeholder="Please describe the issue in detail..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitReport}
                    disabled={!reportType || !reportDetails.trim() || isSubmittingReport}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      !reportType || !reportDetails.trim() || isSubmittingReport
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isSubmittingReport ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      'Submit Report'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Rate This Toilet
              </h3>
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setSelectedRating(0);
                  setRatingComment('');
                  setRatingToiletId(null);
                  setRatingToiletName('');
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {ratingSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">Thank You!</h4>
                  <p className="text-gray-600">Your rating has been submitted.</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 text-sm mb-2">
                    Rating: <span className="font-semibold text-gray-800">{ratingToiletName}</span>
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    How was your experience at this toilet?
                  </p>

                  {/* Star Rating */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Your Rating *
                    </label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setSelectedRating(star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-10 h-10 transition-colors ${
                              star <= selectedRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-300 hover:text-amber-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      {selectedRating === 0 && 'Tap a star to rate'}
                      {selectedRating === 1 && 'Poor'}
                      {selectedRating === 2 && 'Fair'}
                      {selectedRating === 3 && 'Good'}
                      {selectedRating === 4 && 'Very Good'}
                      {selectedRating === 5 && 'Excellent'}
                    </p>
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Comment (optional)
                    </label>
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Share your experience..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitRating}
                    disabled={selectedRating === 0 || isSubmittingRating}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      selectedRating === 0 || isSubmittingRating
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isSubmittingRating ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      'Submit Rating'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
