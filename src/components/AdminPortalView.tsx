import React, { useState } from 'react';
import { Item, MatchCase } from '../types';

interface AdminPortalViewProps {
  items: Item[];
  matchCase: MatchCase;
  onApproveClaim: () => void;
  onNavigateToMatch: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  items,
  matchCase,
  onApproveClaim,
  onNavigateToMatch,
}) => {
  const [selectedHoldingTier, setSelectedHoldingTier] = useState<'all' | 'tier1' | 'tier2' | 'vault'>('all');
  const [selectedClaimStatus, setSelectedClaimStatus] = useState<'pending' | 'verified' | 'released'>('pending');
  const [isVerifying, setIsVerifying] = useState(false);
  const [claimApproved, setClaimApproved] = useState(false);

  const inCustodyItems = items.filter((i) => i.status === 'in_custody' || i.status === 'under_review');

  const handleVerifyAndRelease = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setClaimApproved(true);
      onApproveClaim();
    }, 900);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#d5e7da] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#c1ecd4] text-[#012d1d] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">shield_person</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#012d1d]">
                Staff Intake &amp; Claim Adjudication Console
              </span>
              <span className="text-[10px] bg-[#1b4332] text-white px-2 py-0.5 rounded-full font-bold">
                Officer Ramirez (#ST-44)
              </span>
            </div>
            <h1 className="text-[24px] font-bold text-[#012d1d]">
              Caldwell Student Union Custody Desk
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-[#414844] block">Holding Capacity</span>
            <span className="text-[14px] font-bold text-[#012d1d]">34 / 80 Bins Occupied</span>
          </div>
          <span className="h-8 w-px bg-[#d5e7da] hidden sm:block" />
          <button
            type="button"
            onClick={onNavigateToMatch}
            className="px-4 py-2 rounded-lg bg-[#012d1d] text-white text-[13px] font-bold hover:bg-[#1b4332] transition-colors"
          >
            Review Active Match #PM-8429
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Pending Claim Verification Queue (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-xl p-5 border border-[#d5e7da] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a23e18]">pending_actions</span>
                <h2 className="text-[17px] font-bold text-[#101f17]">
                  Pending Ownership Claim #CLM-9204
                </h2>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#ffdbcf] text-[#a23e18] font-bold">
                Awaiting Officer Review
              </span>
            </div>

            {/* Claim details */}
            <div className="flex flex-col gap-3">
              <div className="p-3.5 rounded-xl bg-[#e6f8eb] border border-[#c1ecd4] flex flex-col gap-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-bold text-[#012d1d]">Claimant: Maya Lin (ID #8492)</span>
                  <span className="text-[#414844]">Submitted: Oct 14, 4:45 PM</span>
                </div>
                <div className="text-[13px] text-[#101f17]">
                  <strong>Target Property:</strong> Black Over-Ear Headphones (Assigned Bin #E-14)
                </div>
                <div className="text-[12px] text-[#414844]">
                  <strong>Misplacement Context:</strong> "Packed laptop in a hurry to attend 2:30 PM Organic Chemistry Lab in Hall 3."
                </div>
              </div>

              {/* Secret Clue Cross-Examination */}
              <div className="p-4 rounded-xl bg-white border-2 border-[#1b4332] flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 text-[#012d1d] font-bold text-[13px]">
                  <span className="material-symbols-outlined text-base">lock</span>
                  <span>Confidential Covert Identifiers Provided by Claimant</span>
                </div>
                <p className="text-[13px] text-[#101f17] bg-[#ecfef1] p-3 rounded-lg border border-[#c1ecd4] font-medium leading-relaxed">
                  "Device Bluetooth name broadcast is 'Maya's XM4'. Inside the headphone case zipper mesh pocket there is a silver USB-C to 3.5mm coiled adapter and a lavender guitar pick."
                </p>

                <div className="flex items-start gap-2 pt-1 text-[12px] text-[#414844]">
                  <span className="material-symbols-outlined text-[#012d1d] text-base">fact_check</span>
                  <span>
                    Staff Check: Officer Ramirez inspected Bin #E-14 case mesh pocket — lavender guitar pick and coiled adapter confirmed present.
                  </span>
                </div>
              </div>

              {/* Physical Handover Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[12px] text-[#414844]">
                  Status: {claimApproved ? 'Released to Student' : 'Ready for In-Person Pickup Handover'}
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => alert('Claim flagged for additional Dean of Students review.')}
                    className="px-4 py-2 rounded-lg bg-[#e0f2e6] hover:bg-[#d5e7da] text-[#101f17] text-[12px] font-semibold"
                  >
                    Flag / Hold
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyAndRelease}
                    disabled={claimApproved || isVerifying}
                    className={`px-5 py-2.5 rounded-lg text-white text-[13px] font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                      claimApproved
                        ? 'bg-[#1b4332]'
                        : isVerifying
                        ? 'bg-[#1b4332] opacity-80 cursor-wait'
                        : 'bg-[#012d1d] hover:bg-[#1b4332]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span>{claimApproved ? 'Handover Completed & Logged' : 'Verify ID & Release Property'}</span>
                  </button>
                </div>
              </div>

              {claimApproved && (
                <div className="p-3.5 rounded-lg bg-[#c1ecd4] text-[#002114] text-[12px] font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-[#012d1d]">receipt</span>
                  <span>Turnover receipt #TR-8821 dispatched to Maya Lin. Bin #E-14 marked vacant and sanitized.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Custody Storage Bins Matrix (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-xl p-5 border border-[#d5e7da] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
              <h2 className="text-[16px] font-bold text-[#012d1d]">Active Inventory by Custody Bin</h2>
              <span className="text-[11px] font-bold text-[#414844]">Tier 1 Holding</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {inCustodyItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-[#e6f8eb] border border-[#c1ecd4] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2 py-1 rounded bg-[#012d1d] text-white font-mono text-[11px] font-bold shrink-0">
                      {item.binNumber || 'BIN #E-14'}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-bold text-[#101f17] truncate">{item.title}</span>
                      <span className="text-[11px] text-[#414844] truncate">{item.locationName}</span>
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#dbede0] text-[#012d1d] font-bold shrink-0">
                    {item.status === 'under_review' ? 'In Review' : 'Secured'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#e0f2e6] text-[12px] text-[#414844] leading-relaxed">
              <strong>Custody Protocol 4.2:</strong> High-value electronics must remain in locked metal lockers under Officer key custody.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
