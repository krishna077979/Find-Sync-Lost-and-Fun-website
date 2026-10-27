import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CampusId, ItemLocationCoordinates, Item } from "../types";
import { getCampusById, CampusLocationArea } from "../data/campusConfig";

// Ensure Leaflet default asset urls are cleanly set
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LeafletRealtimeMapProps {
  campusId: CampusId;
  selectedLocationName?: string;
  selectedCoordinates?: ItemLocationCoordinates | null;
  onLocationSelected?: (
    name: string,
    pinCoord: string,
    coords: ItemLocationCoordinates,
    area?: CampusLocationArea
  ) => void;
  items?: Item[];
  onItemSelect?: (item: Item) => void;
  height?: string;
  interactivePinPlacement?: boolean;
  showAllCampusAreas?: boolean;
  showRecentItems?: boolean;
  autoDetectLocationOnMount?: boolean;
}

export const LeafletRealtimeMap: React.FC<LeafletRealtimeMapProps> = ({
  campusId,
  selectedLocationName,
  selectedCoordinates,
  onLocationSelected,
  items = [],
  onItemSelect,
  height = "380px",
  interactivePinPlacement = true,
  showAllCampusAreas = true,
  showRecentItems = false,
  autoDetectLocationOnMount = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups and markers
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const pinMarkerRef = useRef<L.Marker | null>(null);
  const areasLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const itemsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const corridorsLayerRef = useRef<L.LayerGroup | null>(null);

  const campus = getCampusById(campusId);
  const areas = campus.areas || [];

  // Geolocation tracking state
  const watchIdRef = useRef<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [geoStatus, setGeoStatus] = useState<{
    state: "idle" | "requesting" | "locked" | "denied" | "error";
    message: string;
    coords?: { lat: number; lng: number; accuracy: number };
    timestamp?: Date;
  }>({ state: "idle", message: "" });

  // Map view layer type: street or satellite/topo
  const [tileMode, setTileMode] = useState<"standard" | "topo">("standard");
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const formatCoord = (lat: number, lng: number) => {
    const latDir = lat >= 0 ? "N" : "S";
    const lngDir = lng >= 0 ? "E" : "W";
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
  };

  // Helper to create pulsing live user location HTML icon
  const createUserLocationIcon = (accuracyMeters: number) => {
    return L.divIcon({
      className: "custom-user-location-marker",
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: -8px; background: rgba(16, 185, 129, 0.4); border-radius: 9999px; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 0; background: #059669; border: 3px solid #ffffff; border-radius: 9999px; box-shadow: 0 4px 10px rgba(0,0,0,0.35);"></div>
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 6px; height: 6px; background: #ffffff; border-radius: 9999px;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Helper to create Pin marker HTML icon
  const createPinIcon = (label?: string) => {
    return L.divIcon({
      className: "custom-selected-pin-marker",
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="background: #a23e18; color: #ffffff; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.25); border: 1.5px solid white; transform: translateY(-2px);">
            ${label || "Selected Pin"}
          </div>
          <div style="width: 30px; height: 30px; background: #a23e18; border: 3px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(162, 62, 24, 0.45); margin-top: -6px;">
            <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>
        </div>
      `,
      iconSize: [36, 48],
      iconAnchor: [18, 48],
      popupAnchor: [0, -48],
    });
  };

  // Helper to create POI marker HTML icon
  const createAreaPoiIcon = (area: CampusLocationArea, isSelected: boolean) => {
    const bg = isSelected
      ? "#a23e18"
      : area.category === "library"
      ? "#012d1d"
      : area.category === "canteen"
      ? "#c85a32"
      : area.category === "laboratories"
      ? "#0f402c"
      : area.category === "sports"
      ? "#1b4332"
      : "#2d3748";

    const symbolIcon =
      area.category === "library"
        ? "local_library"
        : area.category === "canteen"
        ? "restaurant"
        : area.category === "laboratories"
        ? "science"
        : area.category === "sports"
        ? "sports_soccer"
        : area.category === "parking"
        ? "local_parking"
        : "domain";

    return L.divIcon({
      className: "custom-area-poi-marker",
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translateY(-50%);">
          <div style="width: 28px; height: 28px; background: ${bg}; border: 2.5px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.25); color: #ffffff;">
            <span class="material-symbols-outlined" style="font-size: 15px; line-height: 1;">${symbolIcon}</span>
          </div>
          <div style="background: rgba(255,255,255,0.96); color: #012d1d; border: 1px solid #c1ecd4; padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; white-space: nowrap; margin-top: 2px; box-shadow: 0 1px 4px rgba(0,0,0,0.12);">
            ${area.code ? area.code.split("-")[0] : area.name.split(" ")[0]}
          </div>
        </div>
      `,
      iconSize: [32, 44],
      iconAnchor: [16, 22],
      popupAnchor: [0, -22],
    });
  };

  // Helper for reported items on campus
  const createItemMarkerIcon = (item: Item) => {
    const isLost = item.type === "lost";
    const bg = isLost ? "#dc2626" : "#059669";
    return L.divIcon({
      className: "custom-item-marker",
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="background: ${bg}; color: white; padding: 2px 6px; border-radius: 6px; font-size: 9px; font-weight: 800; text-transform: uppercase; border: 1.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
            ${isLost ? "Lost" : "Found"}
          </div>
          <div style="width: 14px; height: 14px; background: ${bg}; border: 2px solid white; border-radius: 9999px; margin-top: -3px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [44, 32],
      iconAnchor: [22, 16],
      popupAnchor: [0, -16],
    });
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const centerLat = campus.centerCoordinates.lat || 23.1787;
      const centerLng = campus.centerCoordinates.lng || 77.4922;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 17,
        minZoom: 12,
        maxZoom: 19,
        zoomControl: false,
      });

      L.control.zoom({ position: "topright" }).addTo(map);

      const tileUrl =
        tileMode === "topo"
          ? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

      const tiles = L.tileLayer(tileUrl, {
        attribution: "OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tiles;

      areasLayerGroupRef.current = L.layerGroup().addTo(map);
      itemsLayerGroupRef.current = L.layerGroup().addTo(map);
      corridorsLayerRef.current = L.layerGroup().addTo(map);

      if (interactivePinPlacement) {
        map.on("click", (e: L.LeafletMouseEvent) => {
          handleMapPinDrop(e.latlng.lat, e.latlng.lng);
        });
      }

      mapInstanceRef.current = map;
    }
  }, []);

  // Update Tile Layer if tileMode changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tileUrl =
      tileMode === "topo"
        ? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: "OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  }, [tileMode]);

  // Recenter map when campusId changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const centerLat = campus.centerCoordinates.lat || 23.1787;
    const centerLng = campus.centerCoordinates.lng || 77.4922;
    mapInstanceRef.current.setView([centerLat, centerLng], 17, { animate: true });
  }, [campusId]);

  // Render walking corridors and campus perimeter
  useEffect(() => {
    if (!mapInstanceRef.current || !corridorsLayerRef.current) return;
    corridorsLayerRef.current.clearLayers();

    if (areas.length >= 2) {
      const pathPoints: [number, number][] = areas.map((a) => [a.lat, a.lng]);
      const spine = L.polyline(pathPoints.slice(0, 5), {
        color: "#1b4332",
        weight: 3.5,
        opacity: 0.55,
        dashArray: "6, 8",
        lineCap: "round",
      });
      corridorsLayerRef.current.addLayer(spine);

      const campusCenter = [campus.centerCoordinates.lat, campus.centerCoordinates.lng] as [number, number];
      const campusBoundary = L.circle(campusCenter, {
        radius: 450,
        color: "#012d1d",
        weight: 1.5,
        opacity: 0.4,
        fillColor: "#c1ecd4",
        fillOpacity: 0.06,
        dashArray: "4, 6",
      });
      corridorsLayerRef.current.addLayer(campusBoundary);
    }
  }, [campusId, areas]);

  // Render Campus Area POI markers
  useEffect(() => {
    if (!mapInstanceRef.current || !areasLayerGroupRef.current) return;
    areasLayerGroupRef.current.clearLayers();

    if (!showAllCampusAreas) return;

    areas.forEach((area) => {
      const isSelected = selectedLocationName
        ? selectedLocationName.toLowerCase().includes(area.name.toLowerCase())
        : false;

      const marker = L.marker([area.lat, area.lng], {
        icon: createAreaPoiIcon(area, isSelected),
        title: area.name,
      });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; color: #101f17; padding: 4px; min-width: 180px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <span style="font-weight: 800; color: #012d1d; font-size: 13px;">${area.name}</span>
            <span style="font-size: 10px; background: #e6f8eb; color: #012d1d; padding: 1px 6px; border-radius: 4px; font-weight: 700;">${area.code || "CAMPUS"}</span>
          </div>
          <p style="margin: 2px 0 6px 0; color: #414844; font-size: 11px; line-height: 1.3;">${area.description || area.categoryLabel}</p>
          <div style="font-size: 10px; color: #717973; margin-bottom: 6px;">
            <strong style="color: #a23e18;">Desk:</strong> ${area.deskNearby}
          </div>
          <button id="btn-select-${area.id}" style="width: 100%; padding: 5px 8px; background: #1b4332; color: white; border: none; border-radius: 6px; font-weight: 700; font-size: 11px; cursor: pointer;">
            Select This Location
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("popupopen", () => {
        const btn = document.getElementById(`btn-select-${area.id}`);
        if (btn) {
          btn.onclick = () => {
            const coordStr = formatCoord(area.lat, area.lng);
            if (onLocationSelected) {
              onLocationSelected(
                area.name,
                `Pin: ${area.name} (${area.code}) · ${coordStr}`,
                { lat: area.lat, lng: area.lng, formatted: coordStr },
                area
              );
            }
            marker.closePopup();
            handleMapPinDrop(area.lat, area.lng, area.name);
          };
        }
      });

      areasLayerGroupRef.current?.addLayer(marker);
    });
  }, [areas, selectedLocationName, showAllCampusAreas]);

  // Render recent items on map (if enabled)
  useEffect(() => {
    if (!mapInstanceRef.current || !itemsLayerGroupRef.current) return;
    itemsLayerGroupRef.current.clearLayers();

    if (!showRecentItems || items.length === 0) return;

    items.forEach((item) => {
      let lat: number | undefined;
      let lng: number | undefined;
      if (typeof item.locationCoordinates === "object" && item.locationCoordinates !== null) {
        lat = item.locationCoordinates.lat;
        lng = item.locationCoordinates.lng;
      }

      if (!lat || !lng) {
        const match = areas.find((a) =>
          item.locationName.toLowerCase().includes(a.name.toLowerCase())
        );
        if (match) {
          lat = match.lat + (Math.random() - 0.5) * 0.0004;
          lng = match.lng + (Math.random() - 0.5) * 0.0004;
        } else {
          lat = campus.centerCoordinates.lat + (Math.random() - 0.5) * 0.001;
          lng = campus.centerCoordinates.lng + (Math.random() - 0.5) * 0.001;
        }
      }

      const marker = L.marker([lat, lng], {
        icon: createItemMarkerIcon(item),
        title: item.title,
      });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; color: #101f17; padding: 4px; min-width: 170px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="font-weight: 800; font-size: 10px; background: ${item.type === "lost" ? "#dc2626" : "#059669"}; color: white; padding: 1px 5px; border-radius: 4px; text-transform: uppercase;">
              ${item.type}
            </span>
            <span style="font-weight: 700; color: #012d1d; font-size: 12px;">${item.title}</span>
          </div>
          <div style="font-size: 11px; color: #414844; margin-bottom: 4px;">${item.locationName}</div>
          <div style="font-size: 10px; color: #717973; margin-bottom: 6px;">Reported: ${item.dateLostOrFound || item.timeString || "Recently"}</div>
          <button id="btn-view-item-${item.id}" style="width: 100%; padding: 4px 6px; background: #012d1d; color: white; border: none; border-radius: 6px; font-weight: 700; font-size: 10px; cursor: pointer;">
            Inspect Item Record
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("popupopen", () => {
        const btn = document.getElementById(`btn-view-item-${item.id}`);
        if (btn && onItemSelect) {
          btn.onclick = () => {
            onItemSelect(item);
          };
        }
      });

      itemsLayerGroupRef.current?.addLayer(marker);
    });
  }, [items, showRecentItems, areas]);

  // Synchronize pin with selectedCoordinates prop
  useEffect(() => {
    if (!selectedCoordinates || !mapInstanceRef.current) return;
    const { lat, lng } = selectedCoordinates;
    if (lat && lng) {
      if (pinMarkerRef.current) {
        pinMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const pin = L.marker([lat, lng], {
          icon: createPinIcon(selectedLocationName || "Report Pin"),
          draggable: true,
          zIndexOffset: 1000,
        }).addTo(mapInstanceRef.current);

        pin.on("dragend", (event) => {
          const newLatLng = event.target.getLatLng();
          handleMapPinDrop(newLatLng.lat, newLatLng.lng);
        });

        pinMarkerRef.current = pin;
      }
    }
  }, [selectedCoordinates]);

  // Handle dropping or clicking a pin on the map
  const handleMapPinDrop = useCallback(
    (lat: number, lng: number, manualName?: string) => {
      if (!mapInstanceRef.current) return;

      let closest: CampusLocationArea | null = null;
      let minDist = 999999;
      for (const a of areas) {
        const d = Math.hypot(a.lat - lat, a.lng - lng);
        if (d < minDist) {
          minDist = d;
          closest = a;
        }
      }

      const coordStr = formatCoord(lat, lng);
      const isCloseToArea = closest && minDist < 0.00035;
      const resolvedName = manualName || (isCloseToArea ? closest!.name : `${campus.shortCode} Campus Grounds`);
      const pinLabel = isCloseToArea ? closest!.code : "Custom Pin";

      if (pinMarkerRef.current) {
        pinMarkerRef.current.setLatLng([lat, lng]);
        pinMarkerRef.current.setIcon(createPinIcon(resolvedName));
      } else {
        const pin = L.marker([lat, lng], {
          icon: createPinIcon(resolvedName),
          draggable: true,
          zIndexOffset: 1000,
        }).addTo(mapInstanceRef.current);

        pin.on("dragend", (event) => {
          const newLatLng = event.target.getLatLng();
          handleMapPinDrop(newLatLng.lat, newLatLng.lng);
        });

        pinMarkerRef.current = pin;
      }

      if (onLocationSelected) {
        onLocationSelected(
          resolvedName,
          `Pin: ${resolvedName} (${pinLabel}) · ${coordStr}`,
          { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)), formatted: coordStr },
          isCloseToArea ? closest! : undefined
        );
      }
    },
    [areas, campus, onLocationSelected]
  );

  // REALTIME GEOLOCATION WATCH / CURRENT POSITION HANDLER
  const startRealtimeTracking = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGeoStatus({
        state: "error",
        message: "Geolocation is not supported by your current browser.",
      });
      return;
    }

    setIsLocating(true);
    setGeoStatus({
      state: "requesting",
      message: "Accessing device GPS receiver for high-accuracy coordinates...",
    });

    const onLocationSuccess = (position: GeolocationPosition) => {
      setIsLocating(false);
      setIsLiveTracking(true);
      const { latitude, longitude, accuracy } = position.coords;
      const coordStr = formatCoord(latitude, longitude);

      setGeoStatus({
        state: "locked",
        message: `GPS Locked: ${coordStr} · Accuracy: ±${Math.round(accuracy)}m`,
        coords: { lat: latitude, lng: longitude, accuracy },
        timestamp: new Date(),
      });

      if (!mapInstanceRef.current) return;

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([latitude, longitude]);
      } else {
        const marker = L.marker([latitude, longitude], {
          icon: createUserLocationIcon(accuracy),
          zIndexOffset: 2000,
          title: "Your Real-Time Location",
        }).addTo(mapInstanceRef.current);

        marker.bindPopup(`
          <div style="font-size: 11px; padding: 4px;">
            <strong style="color: #059669;">Your Real-Time Location</strong><br/>
            <span>${coordStr}</span><br/>
            <span style="color: #717973;">Accuracy: ±${Math.round(accuracy)}m</span>
          </div>
        `);

        userMarkerRef.current = marker;
      }

      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([latitude, longitude]);
        accuracyCircleRef.current.setRadius(accuracy);
      } else {
        const circle = L.circle([latitude, longitude], {
          radius: accuracy,
          color: "#059669",
          weight: 1.5,
          opacity: 0.6,
          fillColor: "#10b981",
          fillOpacity: 0.12,
        }).addTo(mapInstanceRef.current);
        accuracyCircleRef.current = circle;
      }

      mapInstanceRef.current.panTo([latitude, longitude], { animate: true });
    };

    const onLocationError = (error: GeolocationPositionError) => {
      setIsLocating(false);
      setIsLiveTracking(false);
      let msg = "Unable to acquire GPS signal. Click anywhere on the map to place your pin manually.";
      let stateType: "denied" | "error" = "error";

      if (error.code === error.PERMISSION_DENIED) {
        stateType = "denied";
        msg = "Location permission denied. Please allow location access or click on the map to pin manually.";
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        msg = "GPS signal unavailable. Ensure location services are enabled on your device.";
      } else if (error.code === error.TIMEOUT) {
        msg = "Location request timed out. Retrying with network fallback...";
      }

      setGeoStatus({
        state: stateType,
        message: msg,
      });
    };

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      onLocationSuccess,
      onLocationError,
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 1000,
      }
    );
  }, []);

  const stopRealtimeTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLiveTracking(false);
    setGeoStatus((prev) => ({
      ...prev,
      state: "idle",
      message: "Live GPS tracking paused.",
    }));
  };

  useEffect(() => {
    if (autoDetectLocationOnMount) {
      startRealtimeTracking();
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [autoDetectLocationOnMount, startRealtimeTracking]);

  const dropPinAtUserLocation = () => {
    if (geoStatus.coords) {
      handleMapPinDrop(geoStatus.coords.lat, geoStatus.coords.lng);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([geoStatus.coords.lat, geoStatus.coords.lng], 18, {
          animate: true,
        });
      }
    } else {
      startRealtimeTracking();
    }
  };

  const centerOnCampus = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(
      [campus.centerCoordinates.lat, campus.centerCoordinates.lng],
      17,
      { animate: true }
    );
  };

  return (
    <div className="flex flex-col gap-2 relative w-full">
      {/* Top Map Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {!isLiveTracking ? (
            <button
              type="button"
              onClick={startRealtimeTracking}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-60"
              title="Track your real-time coordinates using device GPS"
            >
              <span
                className={`material-symbols-outlined text-sm text-[#85f8c4] ${
                  isLocating ? "animate-spin" : ""
                }`}
              >
                {isLocating ? "progress_activity" : "my_location"}
              </span>
              <span>{isLocating ? "Detecting GPS..." : "Detect Realtime Location"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={stopRealtimeTracking}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#ffdbcf] text-[#a23e18] hover:bg-[#ffcdbe] font-bold text-xs border border-[#fe8357]/40 transition-all cursor-pointer"
                title="Pause live GPS updates"
              >
                <span className="material-symbols-outlined text-sm">pause_circle</span>
                <span>Stop Tracking</span>
              </button>

              <button
                type="button"
                onClick={dropPinAtUserLocation}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#e6f8eb] text-[#012d1d] hover:bg-[#dbede0] font-bold text-xs border border-[#c1ecd4] transition-all cursor-pointer"
                title="Place loss/found pin right at your current GPS spot"
              >
                <span className="material-symbols-outlined text-sm text-[#a23e18]">add_location</span>
                <span>Pin At My Location</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={centerOnCampus}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#f2f8f4] text-[#101f17] font-semibold text-xs border border-[#d5e7da] transition-all cursor-pointer shadow-2xs"
            title="Center view on campus grounds"
          >
            <span className="material-symbols-outlined text-sm text-[#1b4332]">domain</span>
            <span className="hidden sm:inline">Center Campus</span>
          </button>
        </div>

        <div className="flex items-center gap-1 bg-[#e6f8eb] p-0.5 rounded-lg border border-[#c1ecd4]">
          <button
            type="button"
            onClick={() => setTileMode("standard")}
            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              tileMode === "standard"
                ? "bg-[#012d1d] text-white shadow-xs"
                : "text-[#414844] hover:text-[#012d1d]"
            }`}
          >
            Street View
          </button>
          <button
            type="button"
            onClick={() => setTileMode("topo")}
            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              tileMode === "topo"
                ? "bg-[#012d1d] text-white shadow-xs"
                : "text-[#414844] hover:text-[#012d1d]"
            }`}
          >
            Topographic
          </button>
        </div>
      </div>

      {/* Geolocation Live Banner */}
      {geoStatus.message && (
        <div
          className={`p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 border transition-all animate-in fade-in ${
            geoStatus.state === "locked"
              ? "bg-[#e6f8eb] border-[#85d3a7] text-[#002114]"
              : geoStatus.state === "requesting"
              ? "bg-[#e0f2fe] border-[#bae6fd] text-[#0369a1]"
              : "bg-[#ffdad6]/70 border-[#ffb4ab] text-[#ba1a1a]"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">
              {geoStatus.state === "locked"
                ? "radar"
                : geoStatus.state === "requesting"
                ? "satellite_alt"
                : "location_off"}
            </span>
            <div className="flex flex-col">
              <span className="font-bold">{geoStatus.message}</span>
              {geoStatus.coords && (
                <span className="text-[10px] text-[#414844] mt-0.5">
                  Real-time GPS coordinates detected via Leaflet &amp; Browser Navigator Geolocation API
                </span>
              )}
            </div>
          </div>
          {geoStatus.state === "locked" && (
            <button
              type="button"
              onClick={dropPinAtUserLocation}
              className="px-2 py-1 rounded-md bg-[#012d1d] text-white text-[11px] font-bold hover:bg-[#1b4332] shrink-0 cursor-pointer"
            >
              Set Pin Here
            </button>
          )}
        </div>
      )}

      {/* Map Container */}
      <div className="relative w-full rounded-2xl border-2 border-[#c1ecd4] overflow-hidden shadow-inner bg-[#eef8f1]">
        <div
          ref={mapContainerRef}
          style={{ height, width: "100%" }}
          className="z-0 select-none"
        />

        {/* Realtime Detection Radar Pulse Indicator */}
        <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#c1ecd4] shadow-md flex items-center gap-2 pointer-events-none">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isLiveTracking ? "bg-[#059669]" : "bg-[#a23e18]"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isLiveTracking ? "bg-[#059669]" : "bg-[#a23e18]"
              }`}
            />
          </span>
          <span className="text-[11px] font-bold text-[#012d1d]">
            {isLiveTracking ? "Live GPS Active" : "Click Map to Pin"}
          </span>
          <span className="text-[10px] text-[#717973] border-l border-[#d5e7da] pl-2 font-mono">
            {campus.shortCode}
          </span>
        </div>

        {/* Bottom Legend Overlay */}
        <div className="absolute bottom-2 left-2 right-2 sm:right-auto z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#d5e7da] shadow-md flex items-center gap-3 text-[10px] font-bold text-[#414844] flex-wrap pointer-events-none">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669] inline-block border border-white"></span>
            <span>Your Position</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#a23e18] inline-block border border-white"></span>
            <span>Selected Pin</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#012d1d] inline-block border border-white"></span>
            <span>Custody / POI</span>
          </div>
        </div>
      </div>

      {/* Map Footer Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#414844] px-1 gap-1">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-semibold text-[#012d1d]">Active Location:</span>
          <strong className="text-[#a23e18] truncate">
            {selectedLocationName || "Click any campus building or drag pin to select"}
          </strong>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#717973] shrink-0 font-mono">
          {selectedCoordinates?.formatted || campus.centerCoordinates.formatted}
        </div>
      </div>
    </div>
  );
};
