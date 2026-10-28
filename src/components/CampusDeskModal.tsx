import React from 'react';
import { HANDOVER_STATIONS } from '../data/mockData';

interface CampusDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportFound: () => void;
}

export const CampusDeskModal: React.FC<CampusDeskModalProps> = ({
  isOpen,
  onClose,
  onOpenReportFound,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#012d1d]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#d5e7da] animate-in fade-in zoom-in-95 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-[#e0f2e6]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#c1ecd4] text-[#012d1d] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">support_agent</span>
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#a23e18]">
                Campus Safety &amp; Public Assistance
              </span>
              <h2 className="text-[20px] font-bold text-[#012d1d]">
                Campus Custody &amp; Handover Desks
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#717973] hover:text-[#101f17] hover:bg-[#e0f2e6]"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <p className="text-[14px] text-[#414844] leading-relaxed">
          Handover desks are listed for the selected campus. Check the location details and opening hours before visiting. Bring your campus ID when collecting an item.
        </p>

        {/* Handover Stations List */}
        <div className="flex flex-col gap-3">
          {HANDOVER_STATIONS.map((station) => (
            <div
              key={station.id}
              className="p-4 rounded-xl bg-[#e6f8eb] border border-[#c1ecd4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#101f17]">{station.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1b4332] text-white font-bold">
                    {station.badge}
                  </span>
                  <span className="text-[11px] text-[#012d1d] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1b4332] animate-pulse" />
                    {station.status}
                  </span>
                </div>
                <span className="text-[12px] text-[#414844] mt-0.5">{station.hours}</span>
                <span className="text-[11px] text-[#717973]">{station.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${station.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#c1ecd4] text-[#012d1d] text-[12px] font-bold hover:bg-[#dbede0] transition-colors"
                >
                  Call {station.phone}
                </a>
              </div>
            </div>
          ))}
        </div>

        {HANDOVER_STATIONS.length === 0 && <div className="p-4 rounded-xl bg-[#e6f8eb] border border-[#c1ecd4] text-sm text-[#536057]">No handover desks have been added for this campus yet.</div>}

        <div className="flex items-center justify-between pt-2 border-t border-[#e0f2e6]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenReportFound();
            }}
            className="text-[13px] font-bold text-[#a23e18] hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Turn In An Item at Desk</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#012d1d] text-white text-[13px] font-bold hover:bg-[#1b4332]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
