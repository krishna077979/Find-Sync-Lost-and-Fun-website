import React, { useState } from 'react';
import { Item, MatchCase, ClaimTracking, UserProfile } from '../types';
import {
  CampusConfiguration,
  CampusLocationArea,
  CampusAreaCategory,
  CAMPUS_AREA_CATEGORIES,
  getCampusConfigurations,
  saveCampusConfigurations,
  resetCampusConfigurationsToDefault,
} from '../data/campusConfig';

interface AdminPortalViewProps {
  items: Item[];
  matchCase: MatchCase | null;
  hasActiveClaim?: boolean;
  claimTracking?: ClaimTracking | null;
  onApproveClaim: () => void;
  onNavigateToMatch: () => void;
  currentUser?: UserProfile;
  onSwitchToStaff?: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  items,
  matchCase,
  hasActiveClaim = false,
  claimTracking = null,
  onApproveClaim,
  onNavigateToMatch,
  currentUser,
  onSwitchToStaff,
}) => {
  const [adminTab, setAdminTab] = useState<'claims' | 'items' | 'moderation' | 'users' | 'audit_log' | 'campus_config'>('claims');
  
  // Campus Configuration state
  const [campusConfigs, setCampusConfigs] = useState<CampusConfiguration[]>(getCampusConfigurations());
  const [selectedCampusId, setSelectedCampusId] = useState<string>('main-campus');
  const [isAddingCampus, setIsAddingCampus] = useState(false);
  const [newCampusName, setNewCampusName] = useState('');
  const [newCampusShortCode, setNewCampusShortCode] = useState('');
  const [newCampusAddress, setNewCampusAddress] = useState('');
  const [newCampusLat, setNewCampusLat] = useState('');
  const [newCampusLng, setNewCampusLng] = useState('');

  // Building / Area creation state
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaCode, setNewAreaCode] = useState('');
  const [newAreaCategory, setNewAreaCategory] = useState<CampusAreaCategory>('academic');
  const [newAreaLat, setNewAreaLat] = useState('');
  const [newAreaLng, setNewAreaLng] = useState('');
  const [newAreaDesk, setNewAreaDesk] = useState('Campus Support Helpdesk');
  const [newAreaDesc, setNewAreaDesc] = useState('');

  const [isVerifying, setIsVerifying] = useState(false);
  const [claimApproved, setClaimApproved] = useState(false);
  const [claimRejected, setClaimRejected] = useState(false);
  const [evidenceRequested, setEvidenceRequested] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [moderationFilter, setModerationFilter] = useState<'all' | 'flagged' | 'duplicates'>('all');
  const [moderatedItems, setModeratedItems] = useState<Record<string, { status: string; note?: string }>>({});

  const [auditLog, setAuditLog] = useState<
    { id: string; action: string; target: string; officer: string; timestamp: string }[]
  >([]);

  const [usersList, setUsersList] = useState<UserProfile[]>([]);

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
      setActionNotice('Claim approved and handover recorded.');
      setAuditLog((prev) => [
        {
          id: `aud-${Date.now()}`,
          action: 'Handover Completed',
          target: `Claim ${claimTracking?.claimId ?? ''} approved`,
          officer: currentUser?.name ?? 'Staff member',
          timestamp: new Date().toLocaleString(),
        },
        ...prev,
      ]);
      onApproveClaim();
    }, 900);
  };

  const handleRejectClaim = () => {
    setClaimRejected(true);
    setClaimApproved(false);
    setActionNotice('Claim rejected.');
    setAuditLog((prev) => [
      {
        id: `aud-${Date.now()}`,
        action: 'Claim Rejected',
        target: `Claim ${claimTracking?.claimId ?? ''} rejected`,
        officer: currentUser?.name ?? 'Staff member',
        timestamp: new Date().toLocaleString(),
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
        target: `Additional evidence requested for ${claimTracking?.claimId ?? 'claim'}`,
        officer: currentUser?.name ?? 'Staff member',
        timestamp: new Date().toLocaleString(),
      },
      ...prev,
    ]);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Role Restriction Banner for Students */}
      {currentUser?.role === 'student' && (
        <div className="p-4 rounded-2xl bg-[#ffdbcf] border border-[#fe8357]/60 text-[#390c00] flex items-start gap-2.5 shadow-xs">
          <span className="material-symbols-outlined text-[#a23e18] text-xl shrink-0 mt-0.5">security</span>
          <div>
            <h4 className="text-xs font-bold text-[#a23e18] uppercase tracking-wider">
              Restricted Officer Console
            </h4>
            <p className="text-xs text-[#390c00] mt-0.5">
              You are currently signed in as <strong>{currentUser.name} (Student)</strong>. Administrator actions, custody bin unlock, and claim adjudication are restricted to authorized Campus Safety personnel.
            </p>
          </div>
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
                {currentUser?.name ?? 'Staff member'}
              </span>
            </div>
            <h1 className="text-[24px] font-bold text-[#012d1d]">
              Campus Custody Desk
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-[#414844] block">Holding Capacity</span>
            <span className="text-[14px] font-bold text-[#012d1d]">{inCustodyItems.length} items</span>
          </div>
          <span className="h-8 w-px bg-[#d5e7da] hidden sm:block" />
          {matchCase && <button
            type="button"
            onClick={onNavigateToMatch}
            className="px-4 py-2 rounded-lg bg-[#012d1d] text-white text-[13px] font-bold hover:bg-[#1b4332] transition-colors cursor-pointer"
          >
            Review Active Match
          </button>}
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

        <button
          type="button"
          onClick={() => setAdminTab('campus_config')}
          className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'campus_config'
              ? 'bg-[#012d1d] text-white shadow-xs'
              : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb]'
          }`}
        >
          <span className="material-symbols-outlined text-base">domain</span>
          <span>Campus &amp; Location Config</span>
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
        !hasActiveClaim ? <div className="rounded-2xl border border-dashed border-[#c1ecd4] bg-white p-10 text-center text-sm text-[#536057]">No claims are currently awaiting review.</div> : <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Pending Claim Verification Queue (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-6 border border-[#d5e7da] shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#a23e18]">pending_actions</span>
                  <h2 className="text-[17px] font-bold text-[#101f17]">
                    Pending Ownership Claim {claimTracking?.claimId ?? ''}
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
                    <span className="font-bold text-[#012d1d]">Claimant: {currentUser?.name ?? 'Signed-in user'}</span>
                    <span className="text-[#414844]">Status: {claimTracking?.status ?? 'Under review'}</span>
                  </div>
                  <div className="text-[13px] text-[#101f17]">
                    <strong>Target Property:</strong> {claimTracking?.itemTitle}
                  </div>
                  <div className="text-[12px] text-[#414844]">
                    <strong>Report:</strong> {claimTracking?.reportNumber}
                  </div>
                </div>

                {/* Secret Clue Cross-Examination */}
                <div className="p-4 rounded-xl bg-white border-2 border-[#1b4332] flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5 text-[#012d1d] font-bold text-[13px]">
                    <span className="material-symbols-outlined text-base">lock</span>
                    <span>Confidential Covert Identifiers Provided by Claimant</span>
                  </div>
                  <p className="text-[13px] text-[#101f17] bg-[#ecfef1] p-3 rounded-lg border border-[#c1ecd4] font-medium leading-relaxed">
                    {claimTracking?.submittedProof || 'No ownership evidence has been submitted yet.'}
                  </p>

                  <div className="flex items-start gap-2 pt-1 text-[12px] text-[#414844]">
                    <span className="material-symbols-outlined text-[#012d1d] text-base">fact_check</span>
                    <span>
                      Compare submitted ownership evidence with the intake record before making a decision.
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
                    <span>Handover status has been updated.</span>
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
                        {item.binNumber || 'Unassigned'}
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
              {items.slice(0, 5).map((item) => {
                const modStatus = moderatedItems[item.id] || {
                  status: 'Awaiting Review',
                  note: '',
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
                              [item.id]: { status: 'Verified Clean', note: `Verified by ${currentUser?.name ?? 'staff member'}.` },
                            }));
                            setActionNotice(`Report ${item.reportCode} verified as legitimate campus record.`);
                            setAuditLog((prev) => [
                              {
                                id: `aud-${Date.now()}`,
                                action: 'Report Cleared',
                                target: `${item.reportCode} verified clean`,
                                officer: currentUser?.name ?? 'Staff member',
                                timestamp: new Date().toLocaleString(),
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
                              [item.id]: { status: 'Under Duplicate Review', note: `Flagged by ${currentUser?.name ?? 'staff member'}.` },
                            }));
                            setActionNotice(`Report ${item.reportCode} flagged as duplicate candidate.`);
                            setAuditLog((prev) => [
                              {
                                id: `aud-${Date.now()}`,
                                action: 'Duplicate Flagged',
                                target: `${item.reportCode} merged with potential duplicate`,
                                officer: currentUser?.name ?? 'Staff member',
                                timestamp: new Date().toLocaleString(),
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
                                officer: currentUser?.name ?? 'Staff member',
                                timestamp: new Date().toLocaleString(),
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

      {/* TAB 5: CAMPUS & LOCATION CONFIGURATION */}
      {adminTab === 'campus_config' && (
        <div className="flex flex-col gap-6 animate-in fade-in">
          {/* Top Header Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#d5e7da] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1b4332]" />
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#012d1d]">
                  Geographic &amp; Infrastructure Governance
                </span>
              </div>
              <h2 className="text-[22px] font-bold text-[#012d1d] mt-1">Campus Configuration Hub</h2>
              <p className="text-[13px] text-[#414844] max-w-2xl mt-0.5">
                Configure campuses, building directories, verified GPS coordinates, and map pins. Changes instantly sync to the student loss/found reporting forms and automated matching engines.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const defaults = resetCampusConfigurationsToDefault();
                  setCampusConfigs(defaults);
                  setActionNotice('Restored the default campus configurations.');
                }}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Reset to factory verified coordinates"
              >
                <span className="material-symbols-outlined text-base">restart_alt</span>
                <span>Reset to Defaults</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  saveCampusConfigurations(campusConfigs);
                  setActionNotice('Campus configurations & verified coordinates saved and synced system-wide!');
                }}
                className="px-4 py-2 rounded-xl bg-[#012d1d] text-white hover:bg-[#1b4332] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>Save All Changes</span>
              </button>
            </div>
          </div>

          {/* Campus Selector Bar & Add Campus Action */}
          <div className="bg-white rounded-2xl p-4 border border-[#d5e7da] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-[#414844] mr-1 shrink-0">Configured Campuses:</span>
              {campusConfigs.map((c) => {
                const isSelected = selectedCampusId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCampusId(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#012d1d] text-white shadow-xs'
                        : 'bg-[#e6f8eb] text-[#012d1d] hover:bg-[#dbede0] border border-[#c1ecd4]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">domain</span>
                    <span>{c.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#c1ecd4] text-[#012d1d]'
                    }`}>
                      {c.areas.length} areas
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsAddingCampus(!isAddingCampus)}
              className="px-3.5 py-1.5 rounded-xl bg-[#ffdbcf] text-[#a23e18] hover:bg-[#fed3c4] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-base">add_business</span>
              <span>{isAddingCampus ? 'Cancel New Campus' : '+ Add New Campus'}</span>
            </button>
          </div>

          {/* Add Campus Modal Form */}
          {isAddingCampus && (
            <div className="bg-[#f7fdf9] rounded-2xl p-5 border border-[#85f8c4] shadow-sm flex flex-col gap-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#c1ecd4]">
                <h3 className="text-sm font-bold text-[#012d1d] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#a23e18]">add_location_alt</span>
                  <span>Provision New University Campus</span>
                </h3>
                <span className="text-[11px] text-[#414844]">Multi-Campus Support</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#101f17]">Campus Full Name *</label>
                  <input
                    type="text"
                    value={newCampusName}
                    onChange={(e) => setNewCampusName(e.target.value)}
                    placeholder="e.g., University campus"
                    className="px-3 py-2 rounded-lg bg-white border border-[#d5e7da] text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#101f17]">Campus Short Code *</label>
                  <input
                    type="text"
                    value={newCampusShortCode}
                    onChange={(e) => setNewCampusShortCode(e.target.value)}
                    placeholder="e.g., SUB"
                    className="px-3 py-2 rounded-lg bg-white border border-[#d5e7da] text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#101f17]">Address &amp; Landmark</label>
                  <input
                    type="text"
                    value={newCampusAddress}
                    onChange={(e) => setNewCampusAddress(e.target.value)}
                    placeholder="e.g., Campus center"
                    className="px-3 py-2 rounded-lg bg-white border border-[#d5e7da] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#101f17]">Center Latitude *</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newCampusLat}
                    onChange={(e) => setNewCampusLat(e.target.value)}
                    placeholder="Latitude (optional)"
                    className="px-3 py-2 rounded-lg bg-white border border-[#d5e7da] text-xs font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#101f17]">Center Longitude *</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newCampusLng}
                    onChange={(e) => setNewCampusLng(e.target.value)}
                    placeholder="Longitude (optional)"
                    className="px-3 py-2 rounded-lg bg-white border border-[#d5e7da] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingCampus(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#d5e7da] text-xs font-bold text-[#414844] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newCampusName.trim() || !newCampusShortCode.trim()) {
                      alert('Please specify campus name and code.');
                      return;
                    }
                    const newId = `campus-${Date.now()}`;
                    const latNum = newCampusLat.trim() ? Number(newCampusLat) : 0;
                    const lngNum = newCampusLng.trim() ? Number(newCampusLng) : 0;
                    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum) || Math.abs(latNum) > 90 || Math.abs(lngNum) > 180) {
                      alert('Enter valid latitude and longitude, or leave both blank until coordinates are available.');
                      return;
                    }
                    const latDir = latNum >= 0 ? 'N' : 'S';
                    const lngDir = lngNum >= 0 ? 'E' : 'W';
                    const newCampusObj: CampusConfiguration = {
                      id: newId,
                      name: newCampusName.trim(),
                      shortCode: newCampusShortCode.trim().toUpperCase(),
                      tagline: newCampusAddress.trim() || 'University Campus Location',
                      address: newCampusAddress.trim(),
                      centerCoordinates: {
                        lat: latNum,
                        lng: lngNum,
                        formatted: `${Math.abs(latNum).toFixed(4)}° ${latDir}, ${Math.abs(lngNum).toFixed(4)}° ${lngDir}`,
                      },
                      itemCount: 0,
                      desksCount: 0,
                      areas: [],
                    };
                    const updated = [...campusConfigs, newCampusObj];
                    setCampusConfigs(updated);
                    saveCampusConfigurations(updated);
                    setSelectedCampusId(newId);
                    setIsAddingCampus(false);
                    setNewCampusName('');
                    setNewCampusShortCode('');
                    setNewCampusAddress('');
                    setActionNotice(`Campus "${newCampusObj.name}" created and saved successfully!`);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] cursor-pointer shadow-xs"
                >
                  Confirm &amp; Add Campus
                </button>
              </div>
            </div>
          )}

          {/* Active Campus Configuration Details */}
          {(() => {
            const activeCampus = campusConfigs.find((c) => c.id === selectedCampusId) || campusConfigs[0];
            if (!activeCampus) return null;

            return (
              <div className="flex flex-col gap-6">
                {/* Campus Overview & Coordinates Card */}
                <div className="bg-white rounded-2xl p-6 border border-[#d5e7da] shadow-xs flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e0f2e6] gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-[#e6f8eb] text-[#012d1d] flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-2xl">account_balance</span>
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-[#012d1d]">{activeCampus.name}</h3>
                          <span className="px-2 py-0.5 rounded-md bg-[#dbede0] text-[#012d1d] font-bold text-xs">
                            {activeCampus.shortCode}
                          </span>
                        </div>
                        <p className="text-xs text-[#414844] mt-0.5">{activeCampus.address || activeCampus.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#f7fdf9] border border-[#d5e7da] text-xs font-mono text-[#012d1d]">
                        Center: {activeCampus.centerCoordinates.formatted}
                      </span>
                    </div>
                  </div>

                  {/* Editable Center Coordinates Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-[#101f17]">Campus Display Name</label>
                      <input
                        type="text"
                        value={activeCampus.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCampusConfigs((prev) =>
                            prev.map((c) => (c.id === activeCampus.id ? { ...c, name: val } : c))
                          );
                        }}
                        className="px-3 py-2 rounded-lg bg-white border border-[#d5e7da] text-[#101f17]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-[#101f17]">Short Code</label>
                      <input
                        type="text"
                        value={activeCampus.shortCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCampusConfigs((prev) =>
                            prev.map((c) => (c.id === activeCampus.id ? { ...c, shortCode: val } : c))
                          );
                        }}
                        className="px-3 py-2 rounded-lg bg-white border border-[#d5e7da] text-[#101f17]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-[#101f17]">Latitude Coordinate</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={activeCampus.centerCoordinates.lat}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const lng = activeCampus.centerCoordinates.lng;
                          const latDir = val >= 0 ? 'N' : 'S';
                          const lngDir = lng >= 0 ? 'E' : 'W';
                          setCampusConfigs((prev) =>
                            prev.map((c) =>
                              c.id === activeCampus.id
                                ? {
                                    ...c,
                                    centerCoordinates: {
                                      lat: val,
                                      lng,
                                      formatted: `${Math.abs(val).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`,
                                    },
                                  }
                                : c
                            )
                          );
                        }}
                        className="px-3 py-2 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-[#101f17]">Longitude Coordinate</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={activeCampus.centerCoordinates.lng}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const lat = activeCampus.centerCoordinates.lat;
                          const latDir = lat >= 0 ? 'N' : 'S';
                          const lngDir = val >= 0 ? 'E' : 'W';
                          setCampusConfigs((prev) =>
                            prev.map((c) =>
                              c.id === activeCampus.id
                                ? {
                                    ...c,
                                    centerCoordinates: {
                                      lat,
                                      lng: val,
                                      formatted: `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(val).toFixed(4)}° ${lngDir}`,
                                    },
                                  }
                                : c
                            )
                          );
                        }}
                        className="px-3 py-2 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Building / Campus Area Directory Management */}
                <div className="bg-white rounded-2xl p-6 border border-[#d5e7da] shadow-xs flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e0f2e6] gap-2">
                    <div>
                      <h3 className="text-base font-bold text-[#012d1d]">
                        Configured Buildings &amp; Campus Areas ({activeCampus.areas.length})
                      </h3>
                      <p className="text-xs text-[#414844] mt-0.5">
                        Students can select these locations from the Report Lost &amp; Report Found forms or click them directly on the campus map.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddingArea(!isAddingArea)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#012d1d] text-white hover:bg-[#1b4332] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      <span>{isAddingArea ? 'Cancel' : '+ Add Building / Area'}</span>
                    </button>
                  </div>

                  {/* Add New Area Form Drawer */}
                  {isAddingArea && (
                    <div className="p-4 rounded-xl bg-[#e6f8eb]/60 border border-[#c1ecd4] flex flex-col gap-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#012d1d] uppercase tracking-wider">
                          New Location Facility Profile
                        </span>
                        <span className="text-[11px] text-[#414844]">Auto-mapped to Interactive Canvas</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-[#101f17]">Building / Area Name *</label>
                          <input
                            type="text"
                            value={newAreaName}
                            onChange={(e) => setNewAreaName(e.target.value)}
                            placeholder="e.g., Computer Center Block C"
                            className="px-3 py-2 rounded-lg bg-white border border-[#d5e7da] text-xs"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-[#101f17]">Short Code *</label>
                          <input
                            type="text"
                            value={newAreaCode}
                            onChange={(e) => setNewAreaCode(e.target.value)}
                            placeholder="e.g., COMP-BLK-C"
                            className="px-3 py-2 rounded-lg bg-white border border-[#d5e7da] text-xs uppercase"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-[#101f17]">Category *</label>
                          <select
                            value={newAreaCategory}
                            onChange={(e) => setNewAreaCategory(e.target.value as CampusAreaCategory)}
                            className="px-3 py-2 rounded-lg bg-white border border-[#d5e7da] text-xs"
                          >
                            {CAMPUS_AREA_CATEGORIES.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-[#101f17]">Latitude Coordinate *</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={newAreaLat}
                            onChange={(e) => setNewAreaLat(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white border border-[#d5e7da] text-xs font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-[#101f17]">Longitude Coordinate *</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={newAreaLng}
                            onChange={(e) => setNewAreaLng(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white border border-[#d5e7da] text-xs font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-[#101f17]">Intake Desk Proximity</label>
                          <input
                            type="text"
                            value={newAreaDesk}
                            onChange={(e) => setNewAreaDesk(e.target.value)}
                            placeholder="e.g., Reception Counter #1"
                            className="px-3 py-2 rounded-lg bg-white border border-[#d5e7da] text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingArea(false)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#d5e7da] text-xs font-bold text-[#414844] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newAreaName.trim() || !newAreaCode.trim()) {
                              alert('Please provide building name and code.');
                              return;
                            }
                            const catObj = CAMPUS_AREA_CATEGORIES.find((c) => c.id === newAreaCategory);
                            const latVal = parseFloat(newAreaLat) || activeCampus.centerCoordinates.lat;
                            const lngVal = parseFloat(newAreaLng) || activeCampus.centerCoordinates.lng;
                            const newArea: CampusLocationArea = {
                              id: `area-${Date.now()}`,
                              name: newAreaName.trim(),
                              code: newAreaCode.trim().toUpperCase(),
                              category: newAreaCategory,
                              categoryLabel: catObj ? catObj.label : 'Academic Blocks',
                              x: 45 + Math.round((Math.random() - 0.5) * 30),
                              y: 45 + Math.round((Math.random() - 0.5) * 30),
                              lat: latVal,
                              lng: lngVal,
                              deskNearby: newAreaDesk.trim() || 'Nearest Lost & Found Station',
                              description: newAreaDesc.trim() || undefined,
                            };
                            setCampusConfigs((prev) =>
                              prev.map((c) =>
                                c.id === activeCampus.id
                                  ? { ...c, areas: [...c.areas, newArea] }
                                  : c
                              )
                            );
                            setIsAddingArea(false);
                            setNewAreaName('');
                            setNewAreaCode('');
                            setActionNotice(`Added "${newArea.name}" to ${activeCampus.name}. Remember to click "Save All Changes" to persist.`);
                          }}
                          className="px-4 py-1.5 rounded-lg bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] cursor-pointer shadow-xs"
                        >
                          Append Area
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Area Table List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeCampus.areas.map((area) => {
                      const catObj = CAMPUS_AREA_CATEGORIES.find((c) => c.id === area.category);
                      return (
                        <div
                          key={area.id}
                          className="p-3.5 rounded-xl bg-[#fbfdf9] border border-[#d5e7da] flex flex-col justify-between gap-2 shadow-xs hover:border-[#1b4332] transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-[#e6f8eb] text-[#012d1d] flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-base">
                                  {catObj?.icon || 'domain'}
                                </span>
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-[#101f17]">{area.name}</h4>
                                <span className="text-[11px] font-mono text-[#a23e18] font-bold">
                                  {area.code}
                                </span>
                              </div>
                            </div>

                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#dbede0] text-[#012d1d]">
                              {area.categoryLabel || area.category}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[#414844] pt-1 border-t border-[#e0f2e6]">
                            <span className="font-mono">
                              {area.lat.toFixed(4)}° N, {area.lng.toFixed(4)}° E
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[#717973]">{area.deskNearby}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Remove area "${area.name}"?`)) {
                                    setCampusConfigs((prev) =>
                                      prev.map((c) =>
                                        c.id === activeCampus.id
                                          ? { ...c, areas: c.areas.filter((a) => a.id !== area.id) }
                                          : c
                                      )
                                    );
                                  }
                                }}
                                className="text-[#a23e18] hover:underline font-bold text-[11px] cursor-pointer"
                                title="Remove this area"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
