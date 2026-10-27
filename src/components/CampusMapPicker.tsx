import React, { useState } from "react";
import { CampusId, ItemLocationCoordinates } from "../types";
import { getCampusById, CampusLocationArea } from "../data/campusConfig";
import { LeafletRealtimeMap } from "./LeafletRealtimeMap";

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
  const [mapMode, setMapMode] = useState<"leaflet" | "schematic">("leaflet");

  // Schematic state
  const [customPin, setCustomPin] = useState<{ x: number; y: number } | null>(
    initialPin || null
  );

  const formatCoordString = (lat: number, lng: number) => {
    const latDir = lat >= 0 ? "N" : "S";
    const lngDir = lng >= 0 ? "E" : "W";
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
  };

  const handleSchematicClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    let closest: CampusLocationArea | null = null;
    let minDist = 9999;
    for (const p of areas) {
      const dist = Math.hypot(p.x - x, p.y - y);
      if (dist < minDist) {
        minDist = dist;
        closest = p;
      }
    }

    if (closest && minDist <= 10) {
      setCustomPin({ x: closest.x, y: closest.y });
      const coordStr = formatCoordString(closest.lat, closest.lng);
      onSelectLocation(
        closest.name,
        `Pin: ${closest.name} (${closest.code}) · ${coordStr}`,
        { lat: closest.lat, lng: closest.lng, formatted: coordStr },
        closest
      );
    } else {
      const offsetLat = campus.centerCoordinates.lat + (50 - y) * 0.00008;
      const offsetLng = campus.centerCoordinates.lng + (x - 50) * 0.00008;
      const coordStr = formatCoordString(offsetLat, offsetLng);

      setCustomPin({ x, y });
      onSelectLocation(
        selectedLocationName || `${campus.shortCode} Campus Grounds`,
        `Pin: Custom Point (${x}% W, ${y}% H) · ${coordStr}`,
        { lat: Number(offsetLat.toFixed(5)), lng: Number(offsetLng.toFixed(5)), formatted: coordStr }
      );
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Header with Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px]">
        <div className="flex items-center gap-1.5 font-bold text-[#012d1d]">
          <span className="material-symbols-outlined text-sm text-[#012d1d]">pin_drop</span>
          <span>Campus Map &amp; Real-time GPS Location</span>
          <span className="text-[10px] font-normal text-[#414844] bg-[#e6f8eb] border border-[#c1ecd4] px-2 py-0.5 rounded-full">
            {campus.name}
          </span>
        </div>

        {/* View Switcher: Leaflet Realtime vs Schematic */}
        <div className="flex items-center gap-1 bg-[#e6f8eb] p-0.5 rounded-lg border border-[#c1ecd4]">
          <button
            type="button"
            onClick={() => setMapMode("leaflet")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              mapMode === "leaflet"
                ? "bg-[#012d1d] text-white shadow-xs"
                : "text-[#414844] hover:text-[#012d1d]"
            }`}
          >
            <span className="material-symbols-outlined text-xs">radar</span>
            <span>Leaflet Real-time Map</span>
          </button>
          <button
            type="button"
            onClick={() => setMapMode("schematic")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              mapMode === "schematic"
                ? "bg-[#012d1d] text-white shadow-xs"
                : "text-[#414844] hover:text-[#012d1d]"
            }`}
          >
            <span className="material-symbols-outlined text-xs">schema</span>
            <span>2D Schematic</span>
          </button>
        </div>
      </div>

      {/* Render Leaflet Realtime Map */}
      {mapMode === "leaflet" ? (
        <div className="w-full">
          <LeafletRealtimeMap
            campusId={campusId}
            selectedLocationName={selectedLocationName}
            onLocationSelected={onSelectLocation}
            height="320px"
            interactivePinPlacement={true}
            showAllCampusAreas={true}
          />
        </div>
      ) : (
        /* Render Fallback 2D Schematic */
        <div className="flex flex-col gap-2">
          <div
            onClick={handleSchematicClick}
            className="relative w-full h-64 sm:h-72 rounded-xl border border-[#c1ecd4] bg-[#eef8f1] overflow-hidden cursor-crosshair select-none shadow-inner"
            style={{
              backgroundImage:
                "radial-gradient(#c1ecd4 1.5px, transparent 1.5px), linear-gradient(to right, #e0f2e6 1px, transparent 1px), linear-gradient(to bottom, #e0f2e6 1px, transparent 1px)",
              backgroundSize: "24px 24px, 48px 48px, 48px 48px",
            }}
            title="Click anywhere to place or adjust your pin"
          >
            {/* Walking corridors */}
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

            {/* Campus Points */}
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
                  }}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-transform ${
                    isSelected ? "scale-110 z-20" : "hover:scale-110 z-10"
                  }`}
                  title={`${p.name} (${p.categoryLabel}) - ${p.deskNearby}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 transition-colors ${
                      isSelected
                        ? "bg-[#a23e18] text-white border-white ring-2 ring-[#a23e18]"
                        : "bg-[#012d1d] text-white border-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">domain</span>
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold whitespace-nowrap shadow-xs pointer-events-none bg-white text-[#101f17] border border-[#d5e7da]">
                    {p.name.split(" ")[0]}
                  </div>
                </button>
              );
            })}

            {/* Custom dropped pin */}
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#414844] px-1 gap-1">
            <div className="flex items-center gap-1.5 truncate">
              <span>Active Pin:</span>
              <strong className="text-[#012d1d] font-bold truncate">
                {selectedLocationName || "None selected"}
              </strong>
            </div>
            <span className="text-[10px] text-[#717973]">{campus.address}</span>
          </div>
        </div>
      )}
    </div>
  );
};
