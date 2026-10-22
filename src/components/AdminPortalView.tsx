import React, { useState } from 'react';
import { Item, MatchCase, UserProfile } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AdminPortalViewProps {
  items: Item[];
  matchCase: MatchCase;
  onApproveClaim: () => void;
  onNavigateToMatch: () => void;
  currentUser?: UserProfile;
  onSwitchToStaff?: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  items,
  matchCase,
  onApproveClaim,
  onNavigateToMatch,
  currentUser,
  onSwitchToStaff,
}) => {
  const [adminTab, setAdminTab] = useState<'claims' | 'items' | 'moderation' | 'users' | 'audit_log'>('claims');
  const [isVerifying, setIsVerifying] = useState(false);
  const [claimApproved, setClaimApproved] = useState(false);
  const [claimRejected, setClaimRejected] = useState(false);
  const [evidenceRequested, setEvidenceRequested] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [moderationFilter, setModerationFilter] = useState<'all' | 'flagged' | 'duplicates'>('all');
  const [moderatedItems, setModeratedItems] = useState<Record<string, { status: string; note?: string }>>({
    'item-1': { status: 'Verified Clean' },
    'item-2': { status: 'Under Duplicate Review', note: 'Matches Report #LR-8821' },
  });

  const [auditLog, setAuditLog] = useState<
    { id: string; action: string; target: string; officer: string; timestamp: string }[]
  >([
    {
      id: 'aud-1',
      action: 'Custody Intake',
      target: 'Item #F-1082 (Sony XM4 Headphones)',
      officer: 'Officer Ramirez (#ST-44)',
      timestamp: 'Oct 14, 4:30 PM',
    },
    {
      id: 'aud-2',
      action: 'Bi-Directional AI Match Scan',
      target: 'Matched #F-1082 with #L-2049 (86% Confidence)',
      officer: 'FindSync Core Engine',
      timestamp: 'Oct 14, 4:32 PM',
    },
    {
      id: 'aud-3',
      action: 'Ownership Claim Received',
      target: 'Claim #CLM-9204 filed by Maya Lin',
      officer: 'Officer Ramirez (#ST-44)',
      timestamp: 'Oct 14, 4:45 PM',
    },
    {
      id: 'aud-4',
      action: 'Bin Assignment',
      target: 'Secured into Bin #E-14 (Student Union Locker)',
      officer: 'Officer Ramirez (#ST-44)',
      timestamp: 'Oct 14, 4:48 PM',
    },
  ]);

  const [usersList, setUsersList] = useState<UserProfile[]>(INITIAL_USERS);

  const inCustodyItems = items.filter(
    (i) => i.status === 'in_custody' || i.status === 'under_review'
  );

  const handleVerifyAndRelease = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setClaimApproved(true);
      setClaimRejected(false);
      setEvidenceRequested(false);
      setActionNotice('Property released to Maya Lin. Handover logged to chain of custody audit.');
      setAuditLog((prev) => [
        {
          id: `aud-${Date.now()}`,
          action: 'Handover Completed',
          target: 'Item #F-1082 released to Maya Lin (ID #8492)',
          officer: 'Officer Ramirez (#ST-44)',
          timestamp: 'Just now',
        },
        ...prev,
      ]);
      onApproveClaim();
    }, 900);
  };

  const handleRejectClaim = () => {
    setClaimRejected(true);
    setClaimApproved(false);
    setActionNotice('Claim #CLM-9204 rejected. Insufficient proof of ownership.');
    setAuditLog((prev) => [
      {
        id: `aud-${Date.now()}`,
        action: 'Claim Rejected',
        target: 'Claim #CLM-9204 rejected for #F-1082',
        officer: 'Officer Ramirez (#ST-44)',
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  };

  const handleRequestMoreEvidence = () => {
    setEvidenceRequested(true);
    setActionNotice('Notification dispatched to claimant requesting original purchase receipt or photo.');
    setAuditLog((prev) => [
      {
        id: `aud-${Date.now()}`,
        action: 'Evidence Requested',
        target: 'Requested purchase receipt from Maya Lin for #CLM-9204',
        officer: 'Officer Ramirez (#ST-44)',
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Role Restriction Banner for Students */}
      {currentUser?.role === 'student' && (
        <div className="p-4 rounded-2xl bg-[#ffdbcf] border border-[#fe8357]/60 text-[#390c00] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#a23e18] text-xl shrink-0 mt-0.5">security</span>
            <div>
              <h4 className="text-xs font-bold text-[#a23e18] uppercase tracking-wider">
                Restricted Officer Mode Preview
              </h4>
              <p className="text-xs text-[#390c00] mt-0.5">
                You are currently signed in as <strong>{currentUser.name} (Student)</strong>. Administrator actions, custody bin unlock, and claim adjudication are restricted to authorized Campus Safety personnel.
              </p>
            </div>
          </div>
          {onSwitchToStaff && (
            <button
              type="button"
              onClick={onSwitchToStaff}
              className="px-4 py-2 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] shrink-0 cursor-pointer shadow-xs"
            >
              Switch to Officer Ramirez (#ST-44)
            </button>
          )}
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#d5e7da] shadow-xs">
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
            className="px-4 py-2 rounded-lg bg-[#012d1d] text-white text-[13px] font-bold hover:bg-[#1b4332] transition-colors cursor-pointer"
          >
            Review Active Match #PM-8429
          </button>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e0f2e6] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setAdminTab('claims')}
          className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'claims'
              ? 'bg-[#012d1d] text-white shadow-xs'
              : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb]'
          }`}
        >
          <span className="material-symbols-outlined text-base">fact_check</span>
          <span>Claims Adjudication</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#a23e18] text-white">1</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('moderation')}
          className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'moderation'
              ? 'bg-[#012d1d] text-white shadow-xs'
              : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb]'
          }`}
        >
          <span className="material-symbols-outlined text-base">policy</span>
          <span>Report Moderation &amp; Duplicates</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#a23e18] text-white">2</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('items')}
          className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'items'
              ? 'bg-[#012d1d] text-white shadow-xs'
              : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb]'
          }`}
        >
          <span className="material-symbols-outlined text-base">inventory</span>
          <span>Logged Items &amp; Custody Bins</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#e0f2e6] text-[#012d1d]">
            {items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'users'
              ? 'bg-[#012d1d] text-white shadow-xs'
              : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb]'
          }`}
        >
          <span className="material-symbols-outlined text-base">group</span>
          <span>Campus Users &amp; Permissions</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('audit_log')}
          className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'audit_log'
              ? 'bg-[#012d1d] text-white shadow-xs'
              : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb]'
          }`}
        >
          <span className="material-symbols-outlined text-base">history</span>
          <span>Custody Audit Trail</span>
        </button>
      </div>

      {/* Action Notice Banner */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-[#c1ecd4] text-[#002114] text-[13px] font-semibold flex items-center justify-between border border-[#a2dfbd]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-xs underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: CLAIMS ADJUDICATION */}
      {adminTab === 'claims' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Pending Claim Verification Queue (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-6 border border-[#d5e7da] shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#a23e18]">pending_actions</span>
                  <h2 className="text-[17px] font-bold text-[#101f17]">
                    Pending Ownership Claim #CLM-9204
                  </h2>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#ffdbcf] text-[#a23e18] font-bold">
                  {claimApproved ? 'Approved' : claimRejected ? 'Rejected' : 'Awaiting Officer Review'}
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

                {/* Officer Adjudication Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[12px] text-[#414844]">
                    Status: {claimApproved ? 'Released to Student' : claimRejected ? 'Claim Rejected' : 'Ready for Officer Determination'}
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleRejectClaim}
                      className="px-3.5 py-2 rounded-lg bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffb4ab] text-[12px] font-bold cursor-pointer"
                    >
                      Reject Claim
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestMoreEvidence}
                      className="px-3.5 py-2 rounded-lg bg-[#e0f2e6] hover:bg-[#d5e7da] text-[#101f17] text-[12px] font-semibold cursor-pointer"
                    >
                      Request More Proof
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyAndRelease}
                      disabled={claimApproved || isVerifying}
                      className={`px-5 py-2.5 rounded-lg text-white text-[13px] font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
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
            <div className="bg-white rounded-2xl p-6 border border-[#d5e7da] shadow-xs flex flex-col gap-4">
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
      )}

      {/* TAB: REPORT MODERATION & DUPLICATE MANAGEMENT */}
      {adminTab === 'moderation' && (
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-2xl p-6 border border-[#d5e7da] shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e0f2e6]">
              <div>
                <h2 className="text-[18px] font-bold text-[#012d1d]">
                  Report Moderation &amp; Duplicate Queue
                </h2>
                <p className="text-[13px] text-[#414844]">
                  Handle suspicious reports, merge duplicate entries, and preserve institutional integrity.
                </p>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModerationFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    moderationFilter === 'all'
                      ? 'bg-[#012d1d] text-white'
                      : 'bg-[#e6f8eb] text-[#414844] hover:bg-[#dbede0]'
                  }`}
                >
                  All Items ({items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setModerationFilter('duplicates')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    moderationFilter === 'duplicates'
                      ? 'bg-[#a23e18] text-white'
                      : 'bg-[#ffdbcf] text-[#a23e18] hover:bg-[#ffcdbe]'
                  }`}
                >
                  Potential Duplicates (2)
                </button>
                <button
                  type="button"
                  onClick={() => setModerationFilter('flagged')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    moderationFilter === 'flagged'
                      ? 'bg-[#ba1a1a] text-white'
                      : 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffb4ab]'
                  }`}
                >
                  Flagged Suspicious
                </button>
              </div>
            </div>

            {/* Moderation items list */}
            <div className="flex flex-col gap-4">
              {items.slice(0, 5).map((item, idx) => {
                const modStatus = moderatedItems[item.id] || {
                  status: idx === 1 ? 'Under Duplicate Review' : 'Verified Clean',
                  note: idx === 1 ? 'Possible duplicate of #LR-8821' : '',
                };

                if (moderationFilter === 'duplicates' && !modStatus.status.includes('Duplicate')) {
                  return null;
                }
                if (moderationFilter === 'flagged' && !modStatus.status.includes('Flagged')) {
                  return null;
                }

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-[#d5e7da] bg-[#fdfdfd] hover:border-[#1b4332]/40 transition-all flex flex-col gap-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#e0f2e6]">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-xs bg-[#e6f8eb] text-[#012d1d] px-2 py-0.5 rounded">
                          {item.reportCode}
                        </span>
                        <h4 className="text-[15px] font-bold text-[#101f17]">{item.title}</h4>
                        <span className="text-xs text-[#414844]">· {item.category}</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          modStatus.status.includes('Clean')
                            ? 'bg-[#c1ecd4] text-[#002114]'
                            : modStatus.status.includes('Duplicate')
                            ? 'bg-[#ffdbcf] text-[#a23e18]'
                            : 'bg-[#ffdad6] text-[#ba1a1a]'
                        }`}
                      >
                        {modStatus.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#414844]">
                      <p><strong>Campus / Zone:</strong> {item.locationName} ({item.campusId})</p>
                      <p><strong>Date Logged:</strong> {item.dateLostOrFound} at {item.timeString}</p>
                      <p><strong>Type:</strong> {item.type === 'lost' ? 'Lost Report' : 'Found Asset (In Custody)'}</p>
                    </div>

                    <p className="text-xs text-[#414844] bg-[#eef8f1] p-2.5 rounded-lg border border-[#c1ecd4]">
                      <strong>Public Description:</strong> {item.description}
                    </p>

                    {/* Moderation Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setModeratedItems((prev) => ({
                              ...prev,
                              [item.id]: { status: 'Verified Clean', note: 'Officer Ramirez cleared report.' },
                            }));
                            setActionNotice(`Report ${item.reportCode} verified as legitimate campus record.`);
                            setAuditLog((prev) => [
                              {
                                id: `aud-${Date.now()}`,
                                action: 'Report Cleared',
                                target: `${item.reportCode} verified clean`,
                                officer: 'Officer Ramirez (#ST-44)',
                                timestamp: 'Just now',
                              },
                              ...prev,
                            ]);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#e6f8eb] hover:bg-[#c1ecd4] text-[#012d1d] text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">verified</span>
                          <span>Mark Verified Clean</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setModeratedItems((prev) => ({
                              ...prev,
                              [item.id]: { status: 'Under Duplicate Review', note: 'Officer Ramirez marked as duplicate.' },
                            }));
                            setActionNotice(`Report ${item.reportCode} flagged as duplicate candidate.`);
                            setAuditLog((prev) => [
                              {
                                id: `aud-${Date.now()}`,
                                action: 'Duplicate Flagged',
                                target: `${item.reportCode} merged with potential duplicate`,
                                officer: 'Officer Ramirez (#ST-44)',
                                timestamp: 'Just now',
                              },
                              ...prev,
                            ]);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#ffdbcf] hover:bg-[#ffcdbe] text-[#a23e18] text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                          <span>Flag Duplicate</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setModeratedItems((prev) => ({
                              ...prev,
                              [item.id]: { status: 'Flagged Inappropriate', note: 'Violation of Community Terms' },
                            }));
                            setActionNotice(`Report ${item.reportCode} flagged as inappropriate / spam.`);
                            setAuditLog((prev) => [
                              {
                                id: `aud-${Date.now()}`,
                                action: 'Report Flagged Inappropriate',
                                target: `${item.reportCode} suppressed from feed`,
                                officer: 'Officer Ramirez (#ST-44)',
                                timestamp: 'Just now',
                              },
                              ...prev,
                            ]);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">flag</span>
                          <span>Flag Inappropriate</span>
                        </button>
                      </div>

                      <span className="text-[11px] text-[#717973] font-mono">Chain of Custody ID: #{item.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOGGED ITEMS & CUSTODY BINS */}
      {adminTab === 'items' && (
        <div className="bg-white rounded-2xl p-6 border border-[#d5e7da] shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
            <div>
              <h2 className="text-[18px] font-bold text-[#012d1d]">Complete Campus Property Inventory</h2>
              <p className="text-[12px] text-[#414844]">Manage status, assigned locker bins, and officer notes.</p>
            </div>
            <span className="text-[12px] font-bold text-[#1b4332]">{items.length} Registered Items</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#d5e7da] text-[#717973] text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-2.5 px-3">Report Code</th>
                  <th className="py-2.5 px-3">Item Title</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Sector &amp; Location</th>
                  <th className="py-2.5 px-3">Locker Bin</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0f2e6]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f9fbf9] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#012d1d]">{item.reportCode}</td>
                    <td className="py-3 px-3 font-bold text-[#101f17]">{item.title}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.type === 'found' ? 'bg-[#e0f2e6] text-[#012d1d]' : 'bg-[#ffdbcf] text-[#a23e18]'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#414844]">{item.locationName}</td>
                    <td className="py-3 px-3 font-mono font-bold">{item.binNumber || 'Unassigned'}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#dbede0] text-[#012d1d]">
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Inspection notes for ${item.reportCode}: ${item.description}`)}
                        className="text-[12px] text-[#012d1d] font-bold hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CAMPUS USERS & PERMISSIONS */}
      {adminTab === 'users' && (
        <div className="bg-white rounded-2xl p-6 border border-[#d5e7da] shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
            <div>
              <h2 className="text-[18px] font-bold text-[#012d1d]">Authorized Campus Users</h2>
              <p className="text-[12px] text-[#414844]">Manage student claimants and safety officer credentials.</p>
            </div>
            <button
              type="button"
              onClick={() => alert('Add Officer/Student credential invitation dialog.')}
              className="px-3.5 py-1.5 rounded-lg bg-[#012d1d] text-white text-[12px] font-bold hover:bg-[#1b4332]"
            >
              Add User Role
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usersList.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-xl border border-[#d5e7da] bg-[#fdfdfd] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1b4332] text-white flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#101f17]">{user.name}</h4>
                    <span className="text-[12px] text-[#414844] block">{user.email}</span>
                    <span className="text-[11px] text-[#717973]">ID: {user.studentId}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    user.role === 'staff' ? 'bg-[#1b4332] text-white' : 'bg-[#e0f2e6] text-[#012d1d]'
                  }`}>
                    {user.role}
                  </span>
                  <span className="text-[10px] text-[#1b4332] font-semibold">Active SSO</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CUSTODY AUDIT TRAIL */}
      {adminTab === 'audit_log' && (
        <div className="bg-white rounded-2xl p-6 border border-[#d5e7da] shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
            <div>
              <h2 className="text-[18px] font-bold text-[#012d1d]">Chain of Custody Immutable Audit Log</h2>
              <p className="text-[12px] text-[#414844]">Every intake, match scan, claim decision, and release is time-stamped.</p>
            </div>
            <span className="text-[11px] font-mono text-[#717973]">Audit Ledger #CAL-2024</span>
          </div>

          <div className="flex flex-col divide-y divide-[#e0f2e6]">
            {auditLog.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#e6f8eb] text-[#012d1d] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-base">verified</span>
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#101f17]">{log.action}</span>
                      <span className="text-[11px] text-[#717973]">•</span>
                      <span className="text-[11px] text-[#414844] font-medium">{log.officer}</span>
                    </div>
                    <p className="text-[12px] text-[#414844] mt-0.5">{log.target}</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#717973] shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
