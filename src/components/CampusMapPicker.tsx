import React, { useState } from 'react';
import { CampusId, ItemLocationCoordinates } from '../types';
import { getCampusById, CampusLocationArea } from '../data/campusConfig';

interface CampusMapPickerProps {
  campusId: CampusId;
  selectedLocationName: string;
  onSelectLocation: (
    name: string,
    pinCoord?: string,
    coordsObj?: ItemLocationCoordinates,
    areaObj?: CampusLocationArea
  ) => void;
  initialPin?: { x: number; y: number };
}

export const CampusMapPicker: React.FC<CampusMapPickerProps> = ({
  campusId,
  selectedLocationName,
  onSelectLocation,
  initialPin,
}) => {
  const campus = getCampusById(campusId);
  const areas = campus.areas || [];
  const [customPin, setCustomPin] = useState<{ x: number; y: number } | null>(
    initialPin || null
  );

  // Geolocation state
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<{
    type: 'success' | 'denied' | 'error' | null;
    message: string;
    coords?: { lat: number; lng: number };
  }>({ type: null, message: '' });

  const formatCoordString = (lat: number, lng: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    // Find closest area or set custom coordinate
    let closest: CampusLocationArea | null = null;
    let minDist = 9999;
    areas.forEach((p) => {
      const dist = Math.hypot(p.x - x, p.y - y);
      if (dist < minDist) {
        minDist = dist;
        closest = p;
      }
    });

    if (closest && minDist <= 10) {
      setCustomPin({ x: closest.x, y: closest.y });
      const coordStr = formatCoordString(closest.lat, closest.lng);
      onSelectLocation(
        closest.name,
        `Pin: ${closest.name} (${closest.code}) · ${coordStr}`,
        { lat: closest.lat, lng: closest.lng, formatted: coordStr },
        closest
      );
      setLocationStatus({
        type: 'success',
        message: `Selected area: ${closest.name} (${coordStr})`,
        coords: { lat: closest.lat, lng: closest.lng },
      });
    } else {
      // Calculate realistic coordinates based on campus center offset
      // 1% x offset ~ 0.0001 deg lng, 1% y offset ~ -0.0001 deg lat
      const offsetLat = campus.centerCoordinates.lat + (50 - y) * 0.00008;
      const offsetLng = campus.centerCoordinates.lng + (x - 50) * 0.00008;
      const coordStr = formatCoordString(offsetLat, offsetLng);

      setCustomPin({ x, y });
      onSelectLocation(
        selectedLocationName || `${campus.shortCode} Campus Grounds`,
        `Pin: Custom Point (${x}% W, ${y}% H) · ${coordStr}`,
        { lat: Number(offsetLat.toFixed(5)), lng: Number(offsetLng.toFixed(5)), formatted: coordStr }
      );
      setLocationStatus({
        type: 'success',
        message: `Manual Pin Placed: ${coordStr}`,
        coords: { lat: offsetLat, lng: offsetLng },
      });
    }
  };

  const handleUseMyLocation = () => {
    setLocationStatus({ type: null, message: '' });

    if (!('geolocation' in navigator)) {
      setLocationStatus({
        type: 'error',
        message: 'GPS geolocation is not supported in this browser. Please use the manual building dropdown or click on the campus map below.',
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        const coordStr = formatCoordString(latitude, longitude);

        // Find nearest campus building if within campus bounds
        let closestArea: CampusLocationArea | null = null;
        let minGeoDist = 999999;
        areas.forEach((a) => {
          const d = Math.hypot(a.lat - latitude, a.lng - longitude);
          if (d < minGeoDist) {
            minGeoDist = d;
            closestArea = a;
          }
        });

        // If reasonably close to campus (within ~0.02 deg ~ 2km), snap or place pin
        if (closestArea && minGeoDist < 0.008) {
          setCustomPin({ x: closestArea.x, y: closestArea.y });
          onSelectLocation(
            closestArea.name,
            `GPS: ${closestArea.name} · ${coordStr} (±${Math.round(accuracy)}m)`,
            { lat: latitude, lng: longitude, formatted: coordStr, accuracyMeters: accuracy },
            closestArea
          );
          setLocationStatus({
            type: 'success',
            message: `GPS Location detected: Near ${closestArea.name} (${coordStr}) · Accuracy ±${Math.round(accuracy)}m`,
            coords: { lat: latitude, lng: longitude },
          });
        } else {
          // Centered custom pin with real GPS
          setCustomPin({ x: 50, y: 50 });
          onSelectLocation(
            selectedLocationName || `${campus.name} (GPS Verified)`,
            `GPS Coordinates: ${coordStr} (±${Math.round(accuracy)}m)`,
            { lat: latitude, lng: longitude, formatted: coordStr, accuracyMeters: accuracy }
          );
          setLocationStatus({
            type: 'success',
            message: `GPS Locked: ${coordStr} (Accuracy: ±${Math.round(accuracy)}m)`,
            coords: { lat: latitude, lng: longitude },
          });
        }
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Location access was denied or timed out. Please select an area from the building dropdown or click directly on the map below.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can manually select an area from the building dropdown or click anywhere on the campus map below.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'GPS signal unavailable. Please select your building manually from the list or map.';
        }
        setLocationStatus({
          type: 'denied',
          message: msg,
        });
      },
      { timeout: 9000, enableHighAccuracy: true, maximumAge: 30000 }
    );
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Map Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px]">
        <div className="flex items-center gap-1.5 font-bold text-[#012d1d]">
          <span className="material-symbols-outlined text-sm text-[#012d1d]">pin_drop</span>
          <span>Interactive Campus Map Pin</span>
          <span className="text-[10px] font-normal text-[#414844] bg-[#e6f8eb] border border-[#c1ecd4] px-2 py-0.5 rounded-full">
            {campus.name}
          </span>
        </div>

        {/* Optional "Use my location" button - requested only after click */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e6f8eb] hover:bg-[#dbede0] text-[#012d1d] font-bold text-[11px] border border-[#c1ecd4] transition-all cursor-pointer shadow-xs disabled:opacity-60"
            title="Locate me using device GPS coordinates"
          >
            <span className={`material-symbols-outlined text-xs text-[#a23e18] ${isLocating ? 'animate-spin' : ''}`}>
              {isLocating ? 'progress_activity' : 'my_location'}
            </span>
            <span>{isLocating ? 'Requesting GPS...' : 'Use my location'}</span>
          </button>
        </div>
      </div>

      {/* GPS Status or Manual Fallback Notification */}
      {locationStatus.message && (
        <div
          className={`p-2.5 rounded-lg text-xs flex items-start gap-2 border animate-in fade-in ${
            locationStatus.type === 'success'
              ? 'bg-[#c1ecd4]/50 border-[#85d3a7] text-[#002114]'
              : 'bg-[#ffdad6]/70 border-[#ffb4ab] text-[#ba1a1a]'
          }`}
        >
          <span className="material-symbols-outlined text-sm mt-0.5 shrink-0">
            {locationStatus.type === 'success' ? 'check_circle' : 'info'}
          </span>
          <div className="flex-1 leading-relaxed">
            <span className="font-semibold">{locationStatus.message}</span>
            {locationStatus.type === 'denied' && (
              <span className="block mt-0.5 text-[11px] text-[#414844]">
                Tip: Click any building icon or open ground point on the map canvas to place your pin manually.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Map Graphic Canvas */}
      <div
        onClick={handleMapClick}
        className="relative w-full h-64 sm:h-72 rounded-xl border border-[#c1ecd4] bg-[#eef8f1] overflow-hidden cursor-crosshair select-none shadow-inner"
        style={{
          backgroundImage:
            'radial-gradient(#c1ecd4 1.5px, transparent 1.5px), linear-gradient(to right, #e0f2e6 1px, transparent 1px), linear-gradient(to bottom, #e0f2e6 1px, transparent 1px)',
          backgroundSize: '24px 24px, 48px 48px, 48px 48px',
        }}
        title="Click anywhere to place or adjust your pin"
      >
        {/* Walking corridors / campus paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <line x1="20%" y1="78%" x2="48%" y2="36%" stroke="#1b4332" strokeWidth="2.5" strokeDasharray="4 3" />
          <line x1="32%" y1="42%" x2="48%" y2="36%" stroke="#1b4332" strokeWidth="3" />
          <line x1="48%" y1="36%" x2="65%" y2="44%" stroke="#1b4332" strokeWidth="3" />
          <line x1="48%" y1="36%" x2="52%" y2="58%" stroke="#1b4332" strokeWidth="4" />
          <line x1="26%" y1="52%" x2="52%" y2="58%" stroke="#1b4332" strokeWidth="2.5" strokeDasharray="4 3" />
          <line x1="52%" y1="58%" x2="82%" y2="68%" stroke="#a23e18" strokeWidth="3" strokeDasharray="6 3" />
          <line x1="60%" y1="20%" x2="48%" y2="36%" stroke="#1b4332" strokeWidth="2.5" />
          <line x1="65%" y1="44%" x2="74%" y2="35%" stroke="#1b4332" strokeWidth="2.5" />
          <line x1="82%" y1="68%" x2="72%" y2="76%" stroke="#1b4332" strokeWidth="2.5" />
        </svg>

        {/* Compass rose & Verified Campus Coordinates */}
        <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-[#012d1d] border border-[#c1ecd4] pointer-events-none flex flex-col items-end shadow-xs">
          <div className="flex items-center gap-1 text-[#012d1d]">
            <span className="material-symbols-outlined text-xs text-[#a23e18]">navigation</span>
            <span>N · {campus.shortCode} CAMPUS</span>
          </div>
          <span className="text-[9px] text-[#717973] font-mono mt-0.5">
            {campus.centerCoordinates.formatted}
          </span>
        </div>

        {/* Top-left Verified Badge */}
        <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2 py-1 rounded text-[10px] text-[#012d1d] border border-[#c1ecd4] pointer-events-none flex items-center gap-1">
          <span className="material-symbols-outlined text-xs text-[#1b4332]">verified</span>
          <span className="font-semibold">{campus.name}</span>
        </div>

        {/* Campus points */}
        {areas.map((p) => {
          const isSelected = selectedLocationName.toLowerCase().includes(p.name.toLowerCase());
          return (
            <button
              key={p.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCustomPin({ x: p.x, y: p.y });
                const coordStr = formatCoordString(p.lat, p.lng);
                onSelectLocation(
                  p.name,
                  `Pin: ${p.name} (${p.code}) · ${coordStr}`,
                  { lat: p.lat, lng: p.lng, formatted: coordStr },
                  p
                );
                setLocationStatus({
                  type: 'success',
                  message: `Selected: ${p.name} · ${coordStr}`,
                  coords: { lat: p.lat, lng: p.lng },
                });
              }}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-transform ${
                isSelected ? 'scale-110 z-20' : 'hover:scale-110 z-10'
              }`}
              title={`${p.name} (${p.categoryLabel}) - ${p.deskNearby}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 transition-colors ${
                  isSelected
                    ? 'bg-[#a23e18] text-white border-white ring-2 ring-[#a23e18]'
                    : p.category === 'canteen'
                    ? 'bg-[#c85a32] text-white border-white'
                    : p.category === 'library'
                    ? 'bg-[#012d1d] text-white border-white'
                    : p.category === 'sports'
                    ? 'bg-[#1b4332] text-white border-white'
                    : p.category === 'laboratories'
                    ? 'bg-[#0f402c] text-white border-white'
                    : p.category === 'parking'
                    ? 'bg-[#374151] text-white border-white'
                    : 'bg-[#012d1d] text-white border-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {p.category === 'library'
                    ? 'local_library'
                    : p.category === 'canteen'
                    ? 'restaurant'
                    : p.category === 'laboratories'
                    ? 'science'
                    : p.category === 'sports'
                    ? 'sports_soccer'
                    : p.category === 'parking'
                    ? 'local_parking'
                    : p.category === 'common'
                    ? 'groups'
                    : 'domain'}
                </span>
              </div>
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold whitespace-nowrap shadow-xs pointer-events-none transition-all ${
                  isSelected
                    ? 'bg-[#012d1d] text-white ring-1 ring-white/50'
                    : 'bg-white/95 text-[#101f17] border border-[#d5e7da]'
                }`}
              >
                {p.name.split(' ')[0]} {p.code ? `(${p.code.split('-')[0]})` : ''}
              </div>
            </button>
          );
        })}

        {/* Custom dropped pin (placed by user click or GPS) */}
        {customPin && (
          <div
            style={{ left: `${customPin.x}%`, top: `${customPin.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-full z-30 pointer-events-none animate-bounce"
          >
            <span className="material-symbols-outlined text-[#a23e18] text-3xl drop-shadow-md">
              location_on
            </span>
          </div>
        )}
      </div>

      {/* Footer Details & Manual Quick Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#414844] px-1 gap-1">
        <div className="flex items-center gap-1.5 truncate">
          <span>Active Pin:</span>
          <strong className="text-[#012d1d] font-bold truncate">
            {selectedLocationName || 'None selected (Click map to drop pin)'}
          </strong>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-[#717973]">
            {campus.address}
          </span>
          {areas.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const first = areas[0];
                setCustomPin({ x: first.x, y: first.y });
                const coordStr = formatCoordString(first.lat, first.lng);
                onSelectLocation(
                  first.name,
                  `Pin: ${first.name} (${first.code}) · ${coordStr}`,
                  { lat: first.lat, lng: first.lng, formatted: coordStr },
                  first
                );
              }}
              className="text-[#a23e18] hover:underline font-semibold cursor-pointer"
            >
              Reset Pin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
