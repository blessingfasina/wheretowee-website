'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Accessibility, Baby, Coins, ExternalLink, MapPin, Loader2, LocateFixed, Search, Plus, AlertTriangle, X, Target, Crosshair, Star, ChevronDown, ChevronUp, Clock, Key, Info, CheckCircle, ShieldCheck, Megaphone, Heart, Share2, ThumbsUp, Handshake } from 'lucide-react';
import { trackGetDirections, trackMapSearch, trackInaccuracyReport } from '@/lib/analytics';
import { resolveVerificationTier, type VerificationTier } from '@/lib/supabase';

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

// Council-verified marker — sky blue with a badge ring so official data
// stands out from community entries at a glance.
const CouncilIcon = L.divIcon({
  className: 'custom-toilet-marker',
  html: `<div style="position: relative; background: #0284C7; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 0 0 2px #0284C7, 0 2px 6px rgba(0,0,0,0.35); font-size: 14px;">🚻<div style="position: absolute; top: -5px; right: -5px; background: white; border-radius: 50%; width: 15px; height: 15px; display: flex; align-items: center; justify-content: center; font-size: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">✔️</div></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17],
});

// Temporarily-closed marker — greyed out with a warning dot.
const ClosedIcon = L.divIcon({
  className: 'custom-toilet-marker',
  html: `<div style="position: relative; background: #9CA3AF; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 14px; opacity: 0.9;">🚻<div style="position: absolute; top: -5px; right: -5px; background: #F59E0B; color: white; border-radius: 50%; width: 15px; height: 15px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">!</div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Cluster marker — navy bubble with the number of toilets inside.
const clusterIcon = (count: number) => {
  const size = count >= 20 ? 46 : count >= 10 ? 42 : 38;
  return L.divIcon({
    className: 'toilet-cluster-marker',
    html: `<div style="background: #1E3A5F; color: white; width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 0 0 2px rgba(30,58,95,0.35), 0 2px 8px rgba(0,0,0,0.35); font-size: 13px; font-weight: 700;">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

interface MarkerCluster {
  lat: number;
  lng: number;
  toilets: Toilet[];
}

// Stop clustering once the user is zoomed in close enough to tell
// neighbouring toilets apart.
const CLUSTER_MAX_ZOOM = 15;

/**
 * Tiny grid-based clusterer. With max 50 markers on this map a
 * full clustering library is overkill — bucket markers into cells
 * sized relative to the current zoom, and any cell with 3+ toilets
 * becomes a numbered cluster bubble.
 */
function clusterToilets(
  toilets: Toilet[],
  zoom: number,
): { clusters: MarkerCluster[]; singles: Toilet[] } {
  if (zoom > CLUSTER_MAX_ZOOM) return { clusters: [], singles: toilets };
  const cellDeg = 360 / Math.pow(2, zoom + 2); // roughly a quarter map tile
  const cells = new Map<string, Toilet[]>();
  for (const t of toilets) {
    const key = `${Math.floor(t.latitude / cellDeg)}:${Math.floor(t.longitude / cellDeg)}`;
    const bucket = cells.get(key);
    if (bucket) bucket.push(t);
    else cells.set(key, [t]);
  }
  const clusters: MarkerCluster[] = [];
  const singles: Toilet[] = [];
  for (const group of Array.from(cells.values())) {
    if (group.length >= 3) {
      clusters.push({
        lat: group.reduce((s: number, t: Toilet) => s + t.latitude, 0) / group.length,
        lng: group.reduce((s: number, t: Toilet) => s + t.longitude, 0) / group.length,
        toilets: group,
      });
    } else {
      singles.push(...group);
    }
  }
  return { clusters, singles };
}

// Reports the current zoom level up to the parent so clustering can
// re-bucket as the user zooms in and out.
function ZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMap();
  useEffect(() => {
    onZoomChange(map.getZoom());
    const handler = () => onZoomChange(map.getZoom());
    map.on('zoomend', handler);
    return () => {
      map.off('zoomend', handler);
    };
  }, [map, onZoomChange]);
  return null;
}

// Fly to a position at a specific zoom (used when a cluster is clicked).
function FlyToZoom({ target }: { target: { pos: [number, number]; zoom: number; seq: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target.pos, target.zoom, { duration: 0.5 });
    }
  }, [map, target]);
  return null;
}

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
  // Trust signals + expanded accessibility (merged in by /api/toilets)
  verified_source?: string | null;   // 'council' | 'partner' | 'official'
  hoist?: string | null;             // Changing Places hoist
  adult_changing?: string | null;
  gender_neutral?: string | null;
  public_note?: string | null;       // "update from the team" (e.g. closures)
  public_note_at?: string | null;
  rating_count?: number | null;
  operator_name?: string | null;
  confirmation_count?: number | null;
  not_found_count?: number | null;
  last_confirmed_at?: string | null;
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
    changingPlaces: false,
    verified: false,
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

  // Clustering state — current map zoom, updated by ZoomTracker
  const [mapZoom, setMapZoom] = useState(14);
  const [clusterFlyTarget, setClusterFlyTarget] = useState<{ pos: [number, number]; zoom: number; seq: number } | null>(null);

  // Shareable-link state (/map?toilet=1234). Read once, synchronously —
  // this component is client-only so window exists on first render.
  const [deepLinkId] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const raw = new URLSearchParams(window.location.search).get('toilet');
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  });
  const deepLinkHandled = useRef(false);
  const [copiedToiletId, setCopiedToiletId] = useState<number | null>(null);

  // "Is this loo still here?" state — one reversible answer per toilet
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [loStatusAnswers, setLoStatusAnswers] = useState<Record<number, 'exists' | 'not_found'>>({});

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

  const fetchToilets = useCallback(async (lat: number, lng: number, ensureToilet?: Toilet) => {
    try {
      const response = await fetch(`/api/toilets?lat=${lat}&lng=${lng}&radius=5&limit=50`);
      const data = await response.json();

      // Calculate distance for each toilet
      let toiletsWithDistance = (data.toilets || []).map((toilet: Toilet) => ({
        ...toilet,
        distance: calculateDistance(lat, lng, toilet.latitude, toilet.longitude),
      }));

      // Guarantee a deep-linked toilet is present even if the nearby
      // query missed it (e.g. radius edge cases).
      if (ensureToilet && !toiletsWithDistance.some((t: Toilet) => t.id === ensureToilet.id)) {
        toiletsWithDistance = [
          { ...ensureToilet, distance: calculateDistance(lat, lng, ensureToilet.latitude, ensureToilet.longitude) },
          ...toiletsWithDistance,
        ];
      }

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

  // Handle a shared /map?toilet=1234 link: fetch that toilet, fly to it,
  // load its neighbourhood, and expand its card.
  useEffect(() => {
    if (!deepLinkId || deepLinkHandled.current) return;
    deepLinkHandled.current = true;
    (async () => {
      try {
        const res = await fetch(`/api/toilets?id=${deepLinkId}`);
        if (!res.ok) return;
        const { toilet } = await res.json();
        if (!toilet) return;
        setSelectedToilet([toilet.latitude, toilet.longitude]);
        setExpandedToiletId(toilet.id);
        await fetchToilets(toilet.latitude, toilet.longitude, toilet);
      } catch (error) {
        console.error('Deep link error:', error);
      }
    })();
  }, [deepLinkId, fetchToilets]);

  // Copy (or natively share) a link that reopens the map on this toilet.
  const shareToilet = async (toilet: Toilet) => {
    const url = `${window.location.origin}/map?toilet=${toilet.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${toilet.name} — Where To Wee`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopiedToiletId(toilet.id);
      setTimeout(() => setCopiedToiletId(null), 2000);
    } catch {
      // user dismissed the share sheet — nothing to do
    }
  };

  // Anonymous per-browser id, mirroring the app's device id, so the
  // confirm_toilet RPC can dedupe one confirmation per device.
  const getDeviceId = (): string => {
    let id = localStorage.getItem('wtw_device_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('wtw_device_id', id);
    }
    return id;
  };

  // "Is this loo still here?" Yes/No → same set_toilet_status pipeline
  // as the mobile app. Answering again overwrites the previous answer.
  const handleConfirmToilet = async (toilet: Toilet, status: 'exists' | 'not_found') => {
    setConfirmingId(toilet.id);
    try {
      const res = await fetch('/api/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toilet_id: toilet.id, device_id: getDeviceId(), status }),
      });
      if (res.ok) {
        const data = await res.json();
        setLoStatusAnswers((prev) => ({ ...prev, [toilet.id]: status }));
        // Reflect the answer locally so the trust badge updates
        // without a refetch.
        setToilets((prev) => prev.map((t) => t.id === toilet.id
          ? {
              ...t,
              confirmation_count: data.confirmation_count ?? t.confirmation_count,
              not_found_count: data.not_found_count ?? t.not_found_count,
              last_confirmed_at: status === 'exists'
                ? (data.last_confirmed_at ?? new Date().toISOString())
                : t.last_confirmed_at,
            }
          : t));
      }
    } catch (error) {
      console.error('Confirmation error:', error);
    } finally {
      setConfirmingId(null);
    }
  };

  const filteredToilets = toilets.filter((toilet) => {
    if (filters.accessible && toilet.wheelchair !== 'yes') return false;
    if (filters.babyChanging && toilet.baby_changing !== 'yes') return false;
    if (filters.free && toilet.fee !== 'no' && toilet.fee !== 'free') return false;
    if (filters.openNow && isOpenNow(toilet.opening_hours) !== true) return false;
    if (filters.radarKey && toilet.radar_key !== 'yes') return false;
    if (filters.changingPlaces && toilet.hoist !== 'yes') return false;
    if (filters.verified && verificationTier(toilet) === 'unverified') return false;
    return true;
  });

  // Get top 7 closest
  const closestToilets = filteredToilets.slice(0, 7);

  // Bucket markers into clusters at the current zoom level.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { clusters, singles } = useMemo(
    () => clusterToilets(filteredToilets, mapZoom),
    // filteredToilets is derived fresh each render; toilets + filters are
    // its real inputs.
    [toilets, filters, mapZoom],
  );

  // Council partners represented in the current results — drives the
  // "Data partner" attribution strip under the map.
  const councilPartners = useMemo(() => {
    const names = new Set<string>();
    for (const t of toilets) {
      if (t.verified_source === 'council' && t.operator_name) {
        names.add(t.operator_name);
      }
    }
    return Array.from(names);
  }, [toilets]);

  const getIcon = (toilet: Toilet) => {
    if (isTemporarilyClosed(toilet)) return ClosedIcon;
    if (isCouncilVerified(toilet)) return CouncilIcon;
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
  const isChangingPlaces = (toilet: Toilet) => toilet.hoist === 'yes';
  const isGenderNeutral = (toilet: Toilet) => toilet.gender_neutral === 'yes';
  const verificationTier = (toilet: Toilet): VerificationTier => resolveVerificationTier(toilet);
  const isCouncilVerified = (toilet: Toilet) => verificationTier(toilet) === 'council_verified';
  const isTemporarilyClosed = (toilet: Toilet) =>
    !!toilet.public_note && /closed/i.test(toilet.public_note);
  const hasRating = (toilet: Toilet) =>
    (toilet.rating_count ?? 0) > 0 && (toilet.average_rating ?? 0) > 0;

  // Single source of truth for the trust badge shown on cards + popups.
  const VerificationBadge = ({ toilet, size = 'sm' }: { toilet: Toilet; size?: 'sm' | 'xs' }) => {
    const tier = verificationTier(toilet);
    if (tier === 'unverified') return null;
    const cls = size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-xs px-2 py-1';
    if (tier === 'council_verified') {
      return (
        <span className={`inline-flex items-center gap-1 bg-sky-100 text-sky-700 rounded-full font-semibold ${cls}`}>
          <ShieldCheck className="w-3 h-3" />
          Council verified
        </span>
      );
    }
    if (tier === 'community_verified') {
      return (
        <span className={`inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 rounded-full font-medium ${cls}`}>
          <CheckCircle className="w-3 h-3" />
          Community verified
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 bg-teal-50 text-teal-600 rounded-full font-medium ${cls}`}>
        <CheckCircle className="w-3 h-3" />
        Recently confirmed
      </span>
    );
  };

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
          <button
            onClick={() => setFilters((f) => ({ ...f, changingPlaces: !f.changingPlaces }))}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filters.changingPlaces
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-rose-400'
            }`}
            title="Changing Places toilets with hoist and adult changing bench"
          >
            <Heart className="w-4 h-4" />
            Changing Places
          </button>
          <button
            onClick={() => setFilters((f) => ({ ...f, verified: !f.verified }))}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filters.verified
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-sky-400'
            }`}
            title="Only show council-verified, community-verified or recently confirmed toilets"
          >
            <ShieldCheck className="w-4 h-4" />
            Verified
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

            {/* Skip auto-locate when following a shared toilet link; the
                "My Location" button (refreshTrigger) re-enables it. */}
            {(!deepLinkId || refreshTrigger > 0) && (
              <LocationHandler 
                onLocationFound={handleLocationFound} 
                onLocating={handleLocating}
                refreshTrigger={refreshTrigger}
                highAccuracy={highAccuracyMode}
                onAccuracyDetected={handleAccuracyDetected}
              />
            )}
            <FlyToLocation position={selectedToilet} />
            <FlyToSearch position={searchLocation} onComplete={handleSearchComplete} />
            <ZoomTracker onZoomChange={setMapZoom} />
            <FlyToZoom target={clusterFlyTarget} />

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

            {/* Cluster bubbles — click to zoom in */}
            {clusters.map((cluster, i) => (
              <Marker
                key={`cluster-${i}-${cluster.toilets[0]?.id}`}
                position={[cluster.lat, cluster.lng]}
                icon={clusterIcon(cluster.toilets.length)}
                eventHandlers={{
                  click: () => setClusterFlyTarget({
                    pos: [cluster.lat, cluster.lng],
                    zoom: Math.min(mapZoom + 2, CLUSTER_MAX_ZOOM + 1),
                    seq: Date.now(),
                  }),
                }}
              />
            ))}

            {/* Individual toilet markers */}
            {singles.map((toilet) => (
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
                    {isTemporarilyClosed(toilet) && (
                      <p className="text-xs font-semibold text-amber-700 bg-amber-50 rounded px-2 py-1 mb-2">
                        ⚠️ Temporarily closed
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mb-2">
                      <VerificationBadge toilet={toilet} size="xs" />
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
            <span className="w-3 h-3 bg-sky-600 rounded-full ring-2 ring-sky-300"></span>
            Council verified
          </span>
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
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
            Temporarily closed
          </span>
        </div>

        {/* Data partner attribution — shown when council-verified listings
            are in view (e.g. Brighton & Hove) */}
        {councilPartners.length > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 text-xs text-sky-800">
            <Handshake className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <span>
              <span className="font-semibold">Data partner:</span>{' '}
              {councilPartners.join(', ')} — official facility data supplied directly to Where To Wee.
            </span>
          </div>
        )}
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

                      {/* Temporarily closed notice */}
                      {isTemporarilyClosed(toilet) && (
                        <p className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-amber-700 bg-amber-50 rounded-full px-2 py-1">
                          <AlertTriangle className="w-3 h-3" />
                          Temporarily closed
                        </p>
                      )}

                      {/* Features */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <VerificationBadge toilet={toilet} />
                        {/* Rating */}
                        {hasRating(toilet) && (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-medium">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {(toilet.average_rating ?? 0).toFixed(1)}
                            <span className="text-amber-500">({toilet.rating_count})</span>
                          </span>
                        )}
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
                        {isChangingPlaces(toilet) && (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded-full font-medium">
                            <Heart className="w-3 h-3" />
                            Changing Places
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
                      {/* Update from the team (e.g. temporary closures) */}
                      {toilet.public_note && (
                        <div className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <Megaphone className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-amber-800 mb-0.5">Update from the team</p>
                            <p className="text-xs text-amber-700 leading-relaxed">{toilet.public_note}</p>
                          </div>
                        </div>
                      )}

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
                      {(toilet.men === 'yes' || toilet.women === 'yes' || toilet.unisex === 'yes' || isGenderNeutral(toilet)) && (
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
                            {isGenderNeutral(toilet) && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-600">Gender Neutral</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Changing Places details */}
                      {isChangingPlaces(toilet) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Heart className="w-4 h-4 text-rose-500 flex-shrink-0" />
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                            Changing Places: hoist{toilet.adult_changing === 'yes' ? ' + adult changing bench' : ''}
                          </span>
                        </div>
                      )}
                      
                      {/* Notes */}
                      {toilet.notes && (
                        <div className="flex items-start gap-2 text-sm">
                          <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-600 text-xs leading-relaxed">{toilet.notes}</p>
                        </div>
                      )}
                      
                      {/* Trust / verification row */}
                      {verificationTier(toilet) !== 'unverified' && (
                        <div className="flex items-center gap-2 text-sm">
                          {verificationTier(toilet) === 'council_verified' ? (
                            <>
                              <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0" />
                              <span className="text-sky-700 text-xs font-medium">
                                Verified by {toilet.operator_name || 'the local council'} — facility details supplied directly to Where To Wee
                              </span>
                            </>
                          ) : verificationTier(toilet) === 'community_verified' ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              <span className="text-emerald-600 text-xs font-medium">Community verified location</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                              <span className="text-teal-600 text-xs font-medium">Recently confirmed by a visitor</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Community "is this loo still here?" prompt — Yes/No,
                          mirroring the app. Answering again changes the answer. */}
                      <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-2.5">
                        {loStatusAnswers[toilet.id] === 'exists' ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="text-emerald-700 text-xs font-medium">
                              Thanks! You confirmed this loo is still here.
                            </span>
                          </div>
                        ) : loStatusAnswers[toilet.id] === 'not_found' ? (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <span className="text-red-600 text-xs font-medium">
                              Thanks! You reported this loo as no longer there — we&apos;ll look into it.
                            </span>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs font-semibold text-teal-800 mb-2">
                              Been here recently? Is this loo still here?
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirmToilet(toilet, 'exists');
                                }}
                                disabled={confirmingId === toilet.id}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-emerald-500 rounded-lg px-3 py-2 hover:bg-emerald-600 transition-colors disabled:opacity-60"
                              >
                                {confirmingId === toilet.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                )}
                                Yes, still here
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirmToilet(toilet, 'not_found');
                                }}
                                disabled={confirmingId === toilet.id}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-red-600 bg-white border border-red-300 rounded-lg px-3 py-2 hover:bg-red-50 transition-colors disabled:opacity-60"
                              >
                                <X className="w-3.5 h-3.5" />
                                No, it&apos;s gone
                              </button>
                            </div>
                          </>
                        )}
                        {(loStatusAnswers[toilet.id]) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmToilet(
                                toilet,
                                loStatusAnswers[toilet.id] === 'exists' ? 'not_found' : 'exists',
                              );
                            }}
                            disabled={confirmingId === toilet.id}
                            className="mt-1.5 text-[11px] text-teal-700 underline underline-offset-2 hover:text-teal-900 disabled:opacity-60"
                          >
                            Change my answer
                          </button>
                        )}
                      </div>
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

                      {/* Share Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          shareToilet(toilet);
                        }}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                          copiedToiletId === toilet.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-sky-600 text-white hover:bg-sky-700'
                        }`}
                      >
                        {copiedToiletId === toilet.id ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4" />
                            Share
                          </>
                        )}
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

        {/* Download App CTA */}
        <div className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-5 text-white">
          <div className="flex items-start gap-3">
            <div className="text-3xl">📱</div>
            <div>
              <h3 className="font-bold text-lg">Get the App!</h3>
              <p className="text-emerald-100 text-sm mt-1">
                Download for free on the App Store and Google Play. Save favourites, get directions, and more.
              </p>
              <a
                href="/download"
                className="inline-block mt-3 bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-50 transition-colors"
              >
                Download App →
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
