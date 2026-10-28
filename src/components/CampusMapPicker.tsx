import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CampusId, ItemLocationCoordinates } from '../types';
import { getCampusById, CampusLocationArea } from '../data/campusConfig';
import { reverseGeocodeUniversity } from '../services/universityLocationService';

interface CampusMapPickerProps {
  campusId: CampusId;
  selectedLocationName: string;
  selectedCoordinates?: ItemLocationCoordinates | null;
  onUniversityDetected?: (name: string | null) => void;
  onSelectLocation: (
    name: string,
    pinCoord?: string,
    coordsObj?: ItemLocationCoordinates,
    areaObj?: CampusLocationArea
  ) => void;
}

const formatCoordinates = (lat: number, lng: number) =>
  `${Math.abs(lat).toFixed(5)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(5)}° ${lng >= 0 ? 'E' : 'W'}`;

const makePinIcon = () => L.divIcon({
  className: 'findsync-map-pin',
  html: '<span class="material-symbols-outlined">location_on</span>',
  iconSize: [36, 42],
  iconAnchor: [18, 40],
});

const makePopupContent = (name: string, details: string) => {
  const container = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = name;
  const text = document.createElement('div');
  text.textContent = details;
  container.append(title, text);
  return container;
};

const distanceInMeters = (first: L.LatLng, second: L.LatLng) =>
  first.distanceTo(second);

export const CampusMapPicker: React.FC<CampusMapPickerProps> = ({
  campusId,
  selectedLocationName,
  selectedCoordinates,
  onUniversityDetected,
  onSelectLocation,
}) => {
  const campus = useMemo(() => getCampusById(campusId), [campusId]);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const areasLayerRef = useRef<L.LayerGroup | null>(null);
  const pinMarkerRef = useRef<L.Marker | null>(null);
  const liveMarkerRef = useRef<L.CircleMarker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const stopTrackingRef = useRef<() => void>(() => {});
  const campusRef = useRef(campus);
  const onSelectRef = useRef(onSelectLocation);
  const onUniversityRef = useRef(onUniversityDetected);
  const lastUniversityLookupRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const universityLookupInProgressRef = useRef(false);
  const [isTracking, setIsTracking] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [hasLiveLocation, setHasLiveLocation] = useState(false);
  const [detectedUniversity, setDetectedUniversity] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<{
    type: 'success' | 'error' | 'tracking' | null;
    message: string;
  } | null>(null);

  useEffect(() => {
    campusRef.current = campus;
  }, [campus]);

  useEffect(() => {
    onSelectRef.current = onSelectLocation;
  }, [onSelectLocation]);

  useEffect(() => {
    onUniversityRef.current = onUniversityDetected;
  }, [onUniversityDetected]);

  const stopLiveTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setLocationAccuracy(null);
    liveMarkerRef.current?.remove();
    accuracyCircleRef.current?.remove();
    liveMarkerRef.current = null;
    accuracyCircleRef.current = null;
  };

  useEffect(() => {
    stopTrackingRef.current = stopLiveTracking;
  });

  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
  }, []);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const map = L.map(mapElementRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView(
      [campus.centerCoordinates.lat, campus.centerCoordinates.lng],
      campus.centerCoordinates.lat === 0 && campus.centerCoordinates.lng === 0 ? 2 : 17
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
    }).addTo(map);

    const areasLayer = L.layerGroup().addTo(map);
    mapRef.current = map;
    areasLayerRef.current = areasLayer;

    map.on('click', (event: L.LeafletMouseEvent) => {
      stopTrackingRef.current();
      const currentCampus = campusRef.current;
      const clicked = event.latlng;
      const closest = currentCampus.areas.reduce<{
        area: CampusLocationArea | null;
        distance: number;
      }>((result, area) => {
        const distance = distanceInMeters(clicked, L.latLng(area.lat, area.lng));
        return distance < result.distance ? { area, distance } : result;
      }, { area: null, distance: Number.POSITIVE_INFINITY });

      const area = closest.distance <= 70 ? closest.area : null;
      const name = area?.name ?? `${currentCampus.shortCode} Campus Grounds`;
      const formatted = formatCoordinates(clicked.lat, clicked.lng);
      const coords = {
        lat: Number(clicked.lat.toFixed(6)),
        lng: Number(clicked.lng.toFixed(6)),
        formatted,
      };

      pinMarkerRef.current?.remove();
      pinMarkerRef.current = L.marker(clicked, { icon: makePinIcon(), keyboard: true })
        .addTo(map)
        .bindPopup(makePopupContent(name, formatted));
      onSelectRef.current(
        name,
        `Pin: ${name} · ${formatted}`,
        coords,
        area ?? undefined
      );
      setLocationStatus({ type: 'success', message: `Pin placed at ${formatted}` });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      areasLayerRef.current = null;
      pinMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const areasLayer = areasLayerRef.current;
    if (!map || !areasLayer) return;

    const center = L.latLng(campus.centerCoordinates.lat, campus.centerCoordinates.lng);
    map.setView(center, campus.centerCoordinates.lat === 0 && campus.centerCoordinates.lng === 0 ? 2 : 17);
    areasLayer.clearLayers();

    campus.areas.forEach((area) => {
      const selected = selectedLocationName.toLowerCase() === area.name.toLowerCase();
      const marker = L.circleMarker([area.lat, area.lng], {
        radius: selected ? 8 : 6,
        color: '#ffffff',
        weight: 2,
        fillColor: selected ? '#a23e18' : '#012d1d',
        fillOpacity: 0.95,
      }).bindTooltip(`${area.name} (${area.code})`);

      marker.on('click', (event: L.LeafletMouseEvent) => {
        event.originalEvent?.stopPropagation();
        stopTrackingRef.current();
        const formatted = formatCoordinates(area.lat, area.lng);
        const coords = { lat: area.lat, lng: area.lng, formatted };
        pinMarkerRef.current?.remove();
        pinMarkerRef.current = L.marker([area.lat, area.lng], { icon: makePinIcon() }).addTo(map);
        onSelectRef.current(
          area.name,
          `Pin: ${area.name} (${area.code}) · ${formatted}`,
          coords,
          area
        );
        setLocationStatus({ type: 'success', message: `Selected ${area.name} · ${formatted}` });
      });
      marker.addTo(areasLayer);
    });
  }, [campus, selectedLocationName]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedCoordinates) return;
    if (isTracking) {
      pinMarkerRef.current?.remove();
      pinMarkerRef.current = null;
      return;
    }
    const position = L.latLng(selectedCoordinates.lat, selectedCoordinates.lng);
    pinMarkerRef.current?.remove();
    pinMarkerRef.current = L.marker(position, { icon: makePinIcon() }).addTo(map);
  }, [selectedCoordinates, isTracking]);

  const handleToggleLiveLocation = () => {
    if (isTracking) {
      stopLiveTracking();
      setLocationStatus({ type: 'success', message: 'Live tracking stopped. The report pin is fixed at the last location.' });
      return;
    }

    setLocationStatus(null);
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setLocationStatus({ type: 'error', message: 'Live location requires a secure HTTPS connection. You can still click the map to place the report pin.' });
      return;
    }
    if (!navigator.geolocation) {
      setLocationStatus({ type: 'error', message: 'Geolocation is not available in this browser.' });
      return;
    }

    setIsTracking(true);
    setLocationAccuracy(null);
    setLocationStatus({ type: 'tracking', message: 'Requesting location permission and waiting for a GPS fix...' });
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const point = L.latLng(latitude, longitude);
        const currentCampus = campusRef.current;
        const nearest = currentCampus.areas.reduce<{
          area: CampusLocationArea | null;
          distance: number;
        }>((result, area) => {
          const distance = distanceInMeters(point, L.latLng(area.lat, area.lng));
          return distance < result.distance ? { area, distance } : result;
        }, { area: null, distance: Number.POSITIVE_INFINITY });
        const nearbyArea = nearest.distance <= 800 ? nearest.area : null;
        const name = nearbyArea?.name ?? `${currentCampus.shortCode} Campus Grounds`;
        const formatted = formatCoordinates(latitude, longitude);
        const coords = {
          lat: latitude,
          lng: longitude,
          formatted,
          accuracyMeters: accuracy,
        };

        const map = mapRef.current;
        if (map) {
          if (!liveMarkerRef.current) {
            liveMarkerRef.current = L.circleMarker(point, {
              radius: 9,
              color: '#ffffff',
              weight: 3,
              fillColor: '#2563eb',
              fillOpacity: 1,
            }).addTo(map).bindTooltip('Your live location');
            accuracyCircleRef.current = L.circle(point, {
              radius: Math.max(accuracy, 10),
              color: '#2563eb',
              weight: 1,
              fillColor: '#3b82f6',
              fillOpacity: 0.12,
            }).addTo(map);
            map.setView(point, 18);
          } else {
            liveMarkerRef.current.setLatLng(point);
            accuracyCircleRef.current?.setLatLng(point).setRadius(Math.max(accuracy, 10));
            if (map.getCenter().distanceTo(point) > 20) map.panTo(point, { animate: true, duration: 0.35 });
          }
        }
        setLocationAccuracy(Math.round(accuracy));
        setHasLiveLocation(true);
        const previousLookup = lastUniversityLookupRef.current;
        const lookupDistance = previousLookup
          ? distanceInMeters(point, L.latLng(previousLookup.lat, previousLookup.lng))
          : Number.POSITIVE_INFINITY;
        const now = Date.now();
        const shouldLookupUniversity = !previousLookup
          || (lookupDistance >= 1000 && now - previousLookup.time >= 60_000);
        if (shouldLookupUniversity && !universityLookupInProgressRef.current) {
          universityLookupInProgressRef.current = true;
          setDetectedUniversity(null);
          onUniversityRef.current?.(null);
          lastUniversityLookupRef.current = { lat: latitude, lng: longitude, time: Date.now() };
          void reverseGeocodeUniversity(latitude, longitude)
            .then((university) => {
              setDetectedUniversity(university);
              onUniversityRef.current?.(university);
            })
            .catch(() => {
              setDetectedUniversity(null);
              onUniversityRef.current?.(null);
            })
            .finally(() => {
              universityLookupInProgressRef.current = false;
            });
        }

        onSelectRef.current(
          name,
          `GPS: ${name} · ${formatted} (±${Math.round(accuracy)}m)`,
          coords,
          nearbyArea ?? undefined
        );
        setLocationStatus({
          type: 'tracking',
          message: `Live location is updating · accuracy ±${Math.round(accuracy)}m`,
        });
      },
      (error) => {
        stopLiveTracking();
        const message = error.code === error.PERMISSION_DENIED
          ? 'Location access was denied. Allow location in your browser settings, or click the map to set a pin.'
          : error.code === error.POSITION_UNAVAILABLE
            ? 'Your device could not determine its location. Check GPS or network access and try again.'
            : 'Location request timed out. Try again or click the map to set a pin.';
        setLocationStatus({ type: 'error', message });
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 1000 }
    );
    watchIdRef.current = watchId;
  };

  const openStreetMapUrl = selectedCoordinates
    ? `https://www.openstreetmap.org/?mlat=${selectedCoordinates.lat}&mlon=${selectedCoordinates.lng}#map=18/${selectedCoordinates.lat}/${selectedCoordinates.lng}`
    : null;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px]">
        <div className="flex items-center gap-1.5 font-bold text-[#012d1d]">
          <span className="material-symbols-outlined text-sm">pin_drop</span>
          <span>Map location</span>
          <span className="text-[10px] font-normal text-[#414844] bg-[#e6f8eb] border border-[#c1ecd4] px-2 py-0.5 rounded-full">
            {detectedUniversity ?? (hasLiveLocation ? 'University not identified' : campus.name)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleLiveLocation}
            aria-pressed={isTracking}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg font-bold text-[11px] border transition-colors ${isTracking ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700' : 'bg-[#e6f8eb] hover:bg-[#dbede0] text-[#012d1d] border-[#c1ecd4]'}`}
          >
            <span className={`material-symbols-outlined text-sm ${isTracking ? 'animate-pulse' : ''}`}>{isTracking ? 'location_on' : 'my_location'}</span>
            {isTracking ? 'Stop live tracking' : 'Use live location'}
          </button>
          {openStreetMapUrl && (
            <a
              href={openStreetMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-[#f4fbf6] text-[#012d1d] font-bold text-[11px] border border-[#c1ecd4]"
            >
              <span className="material-symbols-outlined text-xs">map</span>
              Open in OpenStreetMap
            </a>
          )}
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-[#536057]">
        Click the map to place a report pin, or allow location access to follow the blue live pointer. Stop tracking to keep the last position.
      </p>
      <p className="text-[10px] text-[#717973]">
        Nearby university names use OpenStreetMap data via Photon; lookups are limited to once per minute while GPS updates live.
      </p>

      <div className="relative rounded-xl overflow-hidden">
        <div
          ref={mapElementRef}
          className="h-72 sm:h-80 w-full rounded-xl border border-[#c1ecd4] overflow-hidden z-0"
          aria-label={`Map for ${campus.name}. Click to place a location pin.`}
        />
        <div className="absolute bottom-3 right-3 z-[500] flex flex-col gap-1.5 rounded-lg border border-[#d5e7da] bg-white/95 px-2.5 py-2 text-[10px] font-semibold text-[#27332b] shadow-sm pointer-events-none">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600 shadow" /> Live device location</span>
          <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm leading-none text-[#a23e18]">location_on</span> Report pin</span>
        </div>
      </div>

      {locationStatus && (
        <div role="status" className={`p-2.5 rounded-lg text-xs border ${locationStatus.type === 'success' ? 'bg-[#c1ecd4]/50 border-[#85d3a7] text-[#002114]' : locationStatus.type === 'tracking' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-[#ffdad6]/70 border-[#ffb4ab] text-[#ba1a1a]'}`}>
          <span className="inline-flex items-center gap-1.5">
            {locationStatus.type === 'tracking' && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
          {locationStatus.message}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#414844] px-1 gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span>Selected:</span>
          <strong className="text-[#012d1d] truncate">{selectedLocationName || 'Click the map to place a pin'}</strong>
          {selectedCoordinates?.formatted && <span className="text-[#717973] truncate">({selectedCoordinates.formatted})</span>}
          {isTracking && locationAccuracy !== null && <span className="text-blue-700 font-semibold">Live · ±{locationAccuracy} m</span>}
        </div>
        <span className="text-[10px] text-[#717973]">{campus.address}</span>
      </div>
    </div>
  );
};
