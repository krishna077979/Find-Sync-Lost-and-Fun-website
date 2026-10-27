import React, { useState, useMemo } from "react";
import { CampusId, Item } from "../types";
import { LeafletRealtimeMap } from "./LeafletRealtimeMap";
import { getCampusConfigurations, getCampusById } from "../data/campusConfig";

interface LiveCampusRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCampusId?: CampusId;
  items?: Item[];
  onSelectItem?: (item: Item) => void;
  onOpenReportLost?: () => void;
  onOpenReportFound?: () => void;
}

export const LiveCampusRadarModal: React.FC<LiveCampusRadarModalProps> = ({
  isOpen,
  onClose,
  initialCampusId = "sage-bhopal",
  items = [],
  onSelectItem,
  onOpenReportLost,
  onOpenReportFound,
}) => {
  const campuses = getCampusConfigurations();
  const [selectedCampusId, setSelectedCampusId] = useState<CampusId>(
    initialCampusId === "all-campuses" ? "sage-bhopal" : initialCampusId
  );
  const campus = getCampusById(selectedCampusId);
  const [filterType, setFilterType] = useState<"all" | "lost" | "found">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterType !== "all" && item.type !== filterType) return false;
      if (filterCategory !== "all" && item.category !== filterCategory) return false;
      return true;
    });
  }, [items, filterType, filterCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#012d1d]/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-[#fbfdf9] rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-[#c1ecd4] flex flex-col gap-3 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#e0f2e6]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#012d1d] text-[#85f8c4] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-2xl">radar</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#a23e18]">
                  Leaflet Real-Time Geolocation
                </span>
                <span className="text-[10px] bg-[#e6f8eb] text-[#012d1d] px-2 py-0.5 rounded-full font-bold border border-[#c1ecd4]">
                  Live GPS
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#012d1d]">
                Campus Real-Time Location Radar
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#717973] hover:text-[#101f17] hover:bg-[#e0f2e6] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Campus & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-[#d5e7da]">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#012d1d] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-[#1b4332]">location_city</span>
              <span>Campus:</span>
            </label>
            <select
              value={selectedCampusId}
              onChange={(e) => setSelectedCampusId(e.target.value as CampusId)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-[#c1ecd4] bg-[#e6f8eb] font-semibold text-[#012d1d] cursor-pointer"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.shortCode})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Filter Lost / Found */}
            <div className="flex items-center gap-1 bg-[#f4faf5] p-0.5 rounded-lg border border-[#d5e7da]">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  filterType === "all" ? "bg-[#012d1d] text-white shadow-xs" : "text-[#414844]"
                }`}
              >
                All Records
              </button>
              <button
                type="button"
                onClick={() => setFilterType("lost")}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  filterType === "lost" ? "bg-[#dc2626] text-white shadow-xs" : "text-[#414844]"
                }`}
              >
                Lost Only
              </button>
              <button
                type="button"
                onClick={() => setFilterType("found")}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  filterType === "found" ? "bg-[#059669] text-white shadow-xs" : "text-[#414844]"
                }`}
              >
                Turned-In
              </button>
            </div>
          </div>
        </div>

        {/* Leaflet Real-Time Map Instance */}
        <div className="w-full">
          <LeafletRealtimeMap
            campusId={selectedCampusId}
            height="440px"
            showAllCampusAreas={true}
            showRecentItems={true}
            items={filteredItems}
            autoDetectLocationOnMount={true}
            onItemSelect={(item) => {
              if (onSelectItem) {
                onSelectItem(item);
                onClose();
              }
            }}
          />
        </div>

        {/* Bottom Fast Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#e0f2e6]">
          <div className="text-xs text-[#414844]">
            <span>Click <strong>Detect Realtime Location</strong> to stream GPS coordinates or tap any building marker to inspect custody points.</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenReportLost && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReportLost();
                }}
                className="px-3.5 py-2 rounded-xl bg-[#a23e18] text-white text-xs font-bold hover:bg-[#853011] transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">search</span>
                <span>Report Lost Item</span>
              </button>
            )}
            {onOpenReportFound && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReportFound();
                }}
                className="px-3.5 py-2 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">inventory</span>
                <span>Report Found Item</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
