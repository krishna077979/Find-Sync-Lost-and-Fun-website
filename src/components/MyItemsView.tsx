import React, { useState, useMemo } from 'react';
import { Item, ClaimTracking, ViewTab } from '../types';

interface FinderClaim {
  id: string;
  foundItemId: string;
  itemTitle: string;
  itemReportCode: string;
  claimantName: string;
  claimantContact: string;
  submittedAt: string;
  secretClueSubmitted: string;
  status: 'pending_finder_review' | 'handover_scheduled' | 'returned_confirmed' | 'rejected';
  scheduledLocation?: string;
  scheduledTime?: string;
  handoverNotes?: string;
}

interface MyItemsViewProps {
  items: Item[];
  claimTracking: ClaimTracking;
  onNavigateToTab: (tab: ViewTab) => void;
  onNavigateToMatch: (caseId?: string) => void;
  onOpenReportFound: () => void;
  onOpenCampusDesk: () => void;
}

export const MyItemsView: React.FC<MyItemsViewProps> = ({
  items,
  claimTracking,
  onNavigateToTab,
  onNavigateToMatch,
  onOpenReportFound,
  onOpenCampusDesk,
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<
    'all' | 'lost' | 'found' | 'matches' | 'claims' | 'reunited'
  >('all');
  const [showAlertBanner, setShowAlertBanner] = useState(true);
  const [activeClaim, setActiveClaim] = useState<ClaimTracking>(claimTracking);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Finder claims management state
  const [finderClaims, setFinderClaims] = useState<FinderClaim[]>([
    {
      id: '#FCLM-8819',
      foundItemId: 'found-1082',
      itemTitle: 'Sony WH-1000XM4 Headphones',
      itemReportCode: '#F-1082',
      claimantName: 'Maya Lin',
      claimantContact: 'maya.lin@gmail.com',
      submittedAt: 'Today, 2:45 PM',
      secretClueSubmitted: "Device Bluetooth name is 'Maya's XM4'. Inside zipper mesh pocket is a silver USB-C to 3.5mm coiled adapter and a lavender guitar pick.",
      status: 'pending_finder_review',
    },
  ]);

  // Handover modal state
  const [handoverModalClaim, setHandoverModalClaim] = useState<FinderClaim | null>(null);
  const [handoverStation, setHandoverStation] = useState('SAGE University Bhopal - Admin & Campus Security Desk');
  const [handoverTimeSlot, setHandoverTimeSlot] = useState('Tomorrow, 11:30 AM – 1:00 PM');
  const [handoverSafetyNotes, setHandoverSafetyNotes] = useState('Bring your student ID card or photo verification.');

  // Return receipt confirmation modal state
  const [receiptClaim, setReceiptClaim] = useState<FinderClaim | null>(null);

  // Filter items belonging to user Maya Lin or found by user
  const userItems = items.filter((i) => i.ownerName === 'Maya Lin' || i.type === 'found');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleWithdrawClaim = () => {
    if (confirm('Are you sure you want to withdraw Claim ' + activeClaim.claimId + '?')) {
      showToast('Claim ' + activeClaim.claimId + ' has been withdrawn.');
    }
  };

  const handleProvideEvidence = () => {
    const detail = prompt('Enter additional distinctive marks or upload reference link:');
    if (detail) {
      showToast('Additional verification notes transmitted to Campus Security Desk.');
    }
  };

  const handleMessageDesk = () => {
    const msg = prompt('Send secure message to Campus Safety Desk:');
    if (msg) {
      showToast('Message sent to Campus Custody Desk.');
    }
  };

  // Finder Handover actions
  const handleOpenHandoverModal = (claim: FinderClaim) => {
    setHandoverModalClaim(claim);
  };

  const handleSaveHandoverCoordination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverModalClaim) return;

    setFinderClaims((prev) =>
      prev.map((c) =>
        c.id === handoverModalClaim.id
          ? {
              ...c,
              status: 'handover_scheduled',
              scheduledLocation: handoverStation,
              scheduledTime: handoverTimeSlot,
              handoverNotes: handoverSafetyNotes,
            }
          : c
      )
    );

    showToast(`Handover scheduled at ${handoverStation}. Notification transmitted to ${handoverModalClaim.claimantName}.`);
    setHandoverModalClaim(null);
  };

  const handleConfirmItemReturned = (claim: FinderClaim) => {
    setFinderClaims((prev) =>
      prev.map((c) =>
        c.id === claim.id
          ? { ...c, status: 'returned_confirmed' }
          : c
      )
    );
    setReceiptClaim(claim);
    showToast(`Official handover confirmed. Item ${claim.itemReportCode} returned to owner!`);
  };

  const handleDeclineClaim = (claimId: string) => {
    if (confirm('Are you sure the provided ownership evidence does not match?')) {
      setFinderClaims((prev) =>
        prev.map((c) =>
          c.id === claimId ? { ...c, status: 'rejected' } : c
        )
      );
      showToast(`Claim ${claimId} declined due to mismatched identifiers.`);
    }
  };

  const handleRequestMoreFinderEvidence = (claimId: string) => {
    const note = prompt('What additional evidence should the claimant provide?');
    if (note) {
      showToast(`Request for additional evidence sent to claimant.`);
    }
  };

  // Filter items by selected subtab
  const displayedItems = useMemo(() => {
    return userItems.filter((item) => {
      if (selectedSubTab === 'lost') return item.type === 'lost';
      if (selectedSubTab === 'found') return item.type === 'found';
      if (selectedSubTab === 'matches') return item.status === 'under_review' || Boolean(item.matchScore);
      if (selectedSubTab === 'claims') return item.submittedProof || activeClaim.reportNumber === item.reportCode;
      if (selectedSubTab === 'reunited') return item.status === 'reunited';
      return true;
    });
  }, [userItems, selectedSubTab, activeClaim]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#012d1d] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-[13px] font-semibold animate-in fade-in slide-in-from-bottom-2 border border-[#c1ecd4]">
          <span className="material-symbols-outlined text-lg text-[#c1ecd4]">task_alt</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Breadcrumb & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[#414844] text-[11px] uppercase tracking-wider font-bold">
            <span className="text-[#012d1d]">FindSync Personal Portal</span>
            <span>/</span>
            <span>Items &amp; Handover Center</span>
          </div>
          <h1 className="text-[28px] md:text-[34px] font-bold text-[#012d1d] tracking-tight">
            My Campus Items &amp; Claims
          </h1>
          <p className="text-[14px] text-[#414844] max-w-3xl leading-relaxed">
            Track your reported lost belongings, items you found and turned in, respond to claims, coordinate safe handovers, and confirm returns in real-time.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateToTab('report-lost')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#a23e18] text-white hover:bg-[#822801] transition-all shadow-xs text-[13px] font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Report Lost Item</span>
          </button>
          <button
            type="button"
            onClick={onOpenReportFound}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#012d1d] text-white hover:bg-[#1b4332] transition-all shadow-xs text-[13px] font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">inventory_2</span>
            <span>Report Found Item</span>
          </button>
        </div>
      </div>

      {/* Filter / Nav Tabs */}
      <div className="w-full bg-white rounded-xl p-1.5 shadow-xs border border-[#d5e7da] flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSelectedSubTab('all')}
          className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedSubTab === 'all'
              ? 'bg-[#012d1d] text-white shadow-xs'
              : 'text-[#414844] hover:bg-[#e0f2e6]'
          }`}
        >
          <span>All Activity</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${selectedSubTab === 'all' ? 'bg-[#1b4332] text-white' : 'bg-[#e0f2e6] text-[#012d1d]'}`}>
            {userItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubTab('lost')}
          className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedSubTab === 'lost'
              ? 'bg-[#012d1d] text-white shadow-xs'
              : 'text-[#414844] hover:bg-[#e0f2e6]'
          }`}
        >
          <span>Lost Reports</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#dbede0] text-[#101f17] text-[11px]">
            {userItems.filter((i) => i.type === 'lost').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubTab('found')}
          className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedSubTab === 'found'
              ? 'bg-[#012d1d] text-white shadow-xs'
              : 'text-[#414844] hover:bg-[#e0f2e6]'
          }`}
        >
          <span>Found Items &amp; Handover Hub</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#dbede0] text-[#101f17] text-[11px]">
            {userItems.filter((i) => i.type === 'found').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubTab('matches')}
          className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedSubTab === 'matches'
              ? 'bg-[#a23e18] text-white shadow-xs'
              : 'bg-[#ffdbcf] text-[#a23e18] hover:bg-[#ffdbcf]/80'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#a23e18] animate-pulse" />
          <span>Potential Matches</span>
          <span className="bg-[#a23e18] text-white px-1.5 py-0.2 rounded-full text-[10px] font-bold">1 New</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubTab('claims')}
          className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedSubTab === 'claims'
              ? 'bg-[#012d1d] text-white shadow-xs'
              : 'text-[#414844] hover:bg-[#e0f2e6]'
          }`}
        >
          <span>Active Claims</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#dbede0] text-[#101f17] text-[11px]">
            {finderClaims.length + 1}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubTab('reunited')}
          className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedSubTab === 'reunited'
              ? 'bg-[#012d1d] text-white shadow-xs'
              : 'text-[#414844] hover:bg-[#e0f2e6]'
          }`}
        >
          <span>Resolved &amp; Returned</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#dbede0] text-[#101f17] text-[11px]">
            {userItems.filter((i) => i.status === 'reunited').length}
          </span>
        </button>
      </div>

      {/* AI Match High Priority Alert Banner */}
      {showAlertBanner && (
        <div className="relative overflow-hidden rounded-xl bg-white p-5 sm:p-6 shadow-sm border border-[#d5e7da] border-l-4 border-l-[#a23e18]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ffdbcf] flex items-center justify-center shrink-0 text-[#a23e18]">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase px-2 py-0.5 rounded-full bg-[#a23e18] text-white font-bold">
                    Potential Match Candidate
                  </span>
                  <span className="text-[11px] text-[#414844]">Updated recently</span>
                </div>
                <h2 className="text-[18px] text-[#101f17] font-bold">
                  High-confidence match candidate identified for Sony Headphones
                </h2>
                <p className="text-[13px] text-[#414844] max-w-2xl leading-relaxed">
                  Campus Custodial Desk logged a matching black pair. Color, model, and physical markings correlate with your loss report.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={() => setShowAlertBanner(false)}
                className="px-4 py-2 rounded-lg bg-[#e0f2e6] hover:bg-[#d5e7da] text-[#101f17] text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Dismiss Alert
              </button>
              <button
                type="button"
                onClick={() => onNavigateToMatch('Case #PM-8429')}
                className="px-5 py-2.5 rounded-lg bg-[#a23e18] text-white hover:bg-[#822801] text-[13px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>Review Match Details</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINDER WORKFLOW SECTION: Claims on Found Items */}
      <section className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-[#d5e7da] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#e0f2e6] gap-2">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#e6f8eb] text-[#012d1d] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-xl">handshake</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] text-[#012d1d] font-bold">
                  Finder Workflow: Ownership Claims &amp; Handover Coordination
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#c1ecd4] text-[#002114]">
                  Finder Console
                </span>
              </div>
              <p className="text-[13px] text-[#414844]">
                Review ownership claims for items you found, respond to evidence, coordinate authorized handover stations, and confirm returns.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenReportFound}
            className="px-3.5 py-1.5 rounded-lg bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] transition-all cursor-pointer shrink-0"
          >
            + Log Another Found Item
          </button>
        </div>

        {finderClaims.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#717973] bg-[#fbfdf9] rounded-xl border border-dashed border-[#d5e7da]">
            No pending claims for items you have reported found.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {finderClaims.map((claim) => (
              <div
                key={claim.id}
                className="p-4 rounded-xl border border-[#d5e7da] bg-[#fbfdf9] flex flex-col gap-3 hover:border-[#012d1d]/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#e0f2e6] text-[#012d1d]">
                      {claim.id}
                    </span>
                    <span className="text-sm font-bold text-[#012d1d]">{claim.itemTitle}</span>
                    <span className="text-xs text-[#717973]">({claim.itemReportCode})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {claim.status === 'pending_finder_review' && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ffdbcf] text-[#a23e18] flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">hourglass_top</span>
                        <span>Pending Claimant Review</span>
                      </span>
                    )}
                    {claim.status === 'handover_scheduled' && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#e6f8eb] text-[#012d1d] flex items-center gap-1 border border-[#c1ecd4]">
                        <span className="material-symbols-outlined text-xs">event</span>
                        <span>Handover Scheduled</span>
                      </span>
                    )}
                    {claim.status === 'returned_confirmed' && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#c1ecd4] text-[#002114] flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        <span>Returned &amp; Reunited</span>
                      </span>
                    )}
                    {claim.status === 'rejected' && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#fde8e8] text-[#9b1c1c]">
                        Claim Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Secret Clue Box */}
                <div className="p-3 rounded-lg bg-white border border-[#d5e7da] text-xs flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[#414844] font-semibold">
                    <span>Claimant: <strong>{claim.claimantName}</strong> ({claim.claimantContact})</span>
                    <span>Submitted: {claim.submittedAt}</span>
                  </div>
                  <div className="pt-1 text-[#101f17]">
                    <span className="font-bold text-[#012d1d]">Confidential Ownership Proof: </span>
                    <span className="italic">"{claim.secretClueSubmitted}"</span>
                  </div>
                  {claim.scheduledLocation && (
                    <div className="mt-1 pt-1.5 border-t border-[#e0f2e6] text-[#012d1d] flex items-center gap-2 font-medium">
                      <span className="material-symbols-outlined text-sm text-[#a23e18]">location_on</span>
                      <span>Scheduled Handover: <strong>{claim.scheduledLocation}</strong> · {claim.scheduledTime}</span>
                    </div>
                  )}
                </div>

                {/* Finder Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 justify-end pt-1">
                  {claim.status === 'pending_finder_review' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRequestMoreFinderEvidence(claim.id)}
                        className="px-3 py-1.5 rounded-lg border border-[#d5e7da] bg-white text-[#414844] text-xs font-semibold hover:bg-[#e0f2e6] cursor-pointer"
                      >
                        Request More Clues
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclineClaim(claim.id)}
                        className="px-3 py-1.5 rounded-lg border border-[#f8b4b4] bg-white text-[#9b1c1c] text-xs font-semibold hover:bg-[#fde8e8] cursor-pointer"
                      >
                        Decline Claim
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenHandoverModal(claim)}
                        className="px-4 py-1.5 rounded-lg bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">schedule_send</span>
                        <span>Accept &amp; Coordinate Handover</span>
                      </button>
                    </>
                  )}

                  {claim.status === 'handover_scheduled' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenHandoverModal(claim)}
                        className="px-3 py-1.5 rounded-lg border border-[#d5e7da] bg-white text-[#414844] text-xs font-semibold hover:bg-[#e0f2e6] cursor-pointer"
                      >
                        Adjust Station / Time
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmItemReturned(claim)}
                        className="px-4 py-1.5 rounded-lg bg-[#1b4332] text-white text-xs font-bold hover:bg-[#012d1d] shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">verified</span>
                        <span>Confirm Item Returned to Owner</span>
                      </button>
                    </>
                  )}

                  {claim.status === 'returned_confirmed' && (
                    <button
                      type="button"
                      onClick={() => setReceiptClaim(claim)}
                      className="px-3 py-1.5 rounded-lg bg-[#e6f8eb] border border-[#c1ecd4] text-[#012d1d] text-xs font-bold hover:bg-[#dbede0] cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">receipt</span>
                      <span>View Turnover Receipt</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Main Layout: 8-col Claim & Items Table / 4-col Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Active Claim Status Tracker Card */}
          <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-[#d5e7da] flex flex-col gap-5">
            {/* Card Title & Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#e0f2e6] gap-2">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a23e18] animate-pulse" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[20px] text-[#012d1d] font-bold">{activeClaim.claimId}</span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#ffdbcf] text-[#390c00] font-bold">
                      Under Custody Review
                    </span>
                  </div>
                  <p className="text-[13px] text-[#414844]">{activeClaim.itemTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[#414844] text-[12px]">
                <span className="material-symbols-outlined text-base">schedule</span>
                <span>Updated {activeClaim.updatedAgo}</span>
              </div>
            </div>

            {/* Progress Stepper Component (6 Steps) */}
            <div className="py-2">
              <div className="relative flex items-center justify-between w-full">
                {/* Connecting Line Behind */}
                <div className="absolute left-6 right-6 top-4 h-0.5 bg-[#d5e7da] -z-0" />
                <div className="absolute left-6 top-4 h-0.5 bg-[#012d1d] -z-0 w-[24%]" />

                {/* Step 1: Submitted */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[70px]">
                  <div className="w-8 h-8 rounded-full bg-[#012d1d] text-white flex items-center justify-center text-[12px] shadow-sm font-bold">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <span className="text-[11px] text-[#012d1d] font-bold mt-1">Submitted</span>
                  <span className="text-[10px] text-[#414844] leading-none mt-0.5">Active</span>
                </div>

                {/* Step 2: Under Review (Active) */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[70px]">
                  <div className="w-8 h-8 rounded-full bg-[#a23e18] text-white flex items-center justify-center text-[12px] ring-4 ring-[#ffdbcf] shadow-sm font-bold">
                    <span className="material-symbols-outlined text-sm">hourglass_top</span>
                  </div>
                  <span className="text-[11px] text-[#a23e18] font-bold mt-1">Under Review</span>
                  <span className="text-[10px] text-[#a23e18] font-semibold leading-none mt-0.5">Active</span>
                </div>

                {/* Step 3: Evidence */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[70px]">
                  <div className="w-8 h-8 rounded-full bg-[#e0f2e6] text-[#414844] flex items-center justify-center text-[12px] font-bold">
                    <span>3</span>
                  </div>
                  <span className="text-[11px] text-[#414844] mt-1 font-semibold">Evidence</span>
                  <span className="text-[10px] text-[#717973] leading-none mt-0.5">Validated</span>
                </div>

                {/* Step 4: Approved */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[70px]">
                  <div className="w-8 h-8 rounded-full bg-[#e0f2e6] text-[#414844] flex items-center justify-center text-[12px] font-bold">
                    <span>4</span>
                  </div>
                  <span className="text-[11px] text-[#414844] mt-1 font-semibold">Approved</span>
                  <span className="text-[10px] text-[#717973] leading-none mt-0.5">Pending</span>
                </div>

                {/* Step 5: Handover */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[70px]">
                  <div className="w-8 h-8 rounded-full bg-[#e0f2e6] text-[#414844] flex items-center justify-center text-[12px] font-bold">
                    <span>5</span>
                  </div>
                  <span className="text-[11px] text-[#414844] mt-1 font-semibold">Handover</span>
                  <span className="text-[10px] text-[#717973] leading-none mt-0.5">Station</span>
                </div>

                {/* Step 6: Closed */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[70px]">
                  <div className="w-8 h-8 rounded-full bg-[#e0f2e6] text-[#414844] flex items-center justify-center text-[12px] font-bold">
                    <span>6</span>
                  </div>
                  <span className="text-[11px] text-[#414844] mt-1 font-semibold">Closed</span>
                  <span className="text-[10px] text-[#717973] leading-none mt-0.5">Resolved</span>
                </div>
              </div>
            </div>

            {/* Claim Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#e0f2e6]">
              <button
                type="button"
                onClick={handleProvideEvidence}
                className="px-3.5 py-1.5 rounded-lg bg-[#e6f8eb] hover:bg-[#dbede0] text-[#012d1d] text-xs font-bold cursor-pointer"
              >
                + Provide Additional Clues
              </button>
              <button
                type="button"
                onClick={handleMessageDesk}
                className="px-3.5 py-1.5 rounded-lg border border-[#d5e7da] bg-white text-[#414844] text-xs font-semibold hover:bg-[#e0f2e6] cursor-pointer"
              >
                Message Custody Officer
              </button>
              <button
                type="button"
                onClick={handleWithdrawClaim}
                className="px-3.5 py-1.5 rounded-lg border border-[#f8b4b4] bg-white text-[#9b1c1c] text-xs font-semibold hover:bg-[#fde8e8] cursor-pointer"
              >
                Withdraw Claim
              </button>
            </div>
          </div>

          {/* List of User's Items */}
          <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-[#d5e7da] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[18px] text-[#012d1d] font-bold">
                  {selectedSubTab === 'lost' && 'My Reported Lost Items'}
                  {selectedSubTab === 'found' && 'Items I Have Found & Logged'}
                  {selectedSubTab === 'matches' && 'Items with Active Matches'}
                  {selectedSubTab === 'reunited' && 'Reunited & Resolved Belongings'}
                  {selectedSubTab === 'all' && 'All My Registered Items'}
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#dbede0] text-[#101f17] font-bold">
                  {displayedItems.length}
                </span>
              </div>
            </div>

            {displayedItems.length === 0 ? (
              <div className="p-8 text-center bg-[#fbfdf9] rounded-xl border border-dashed border-[#d5e7da] flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl text-[#717973] mb-2">inbox</span>
                <p className="text-sm font-bold text-[#101f17]">No records in this category</p>
                <p className="text-xs text-[#717973] mt-0.5">Switch sub-tabs or log a new report above.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {displayedItems.map((item) => {
                  const hasMatch = item.status === 'under_review' || Boolean(item.matchScore);
                  const isReunited = item.status === 'reunited';

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl p-4 shadow-xs hover:shadow-md border border-[#d5e7da] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-20 h-20 rounded-lg object-cover shrink-0 bg-[#e0f2e6] border border-[#d5e7da]"
                        />
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {hasMatch && !isReunited && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#ffdbcf] text-[#a23e18] font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">search_check</span>
                                <span>{item.matchScore ? `1 Match Found (${item.matchScore}%)` : 'Match Detected'}</span>
                              </span>
                            )}
                            {!hasMatch && !isReunited && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#e0f2e6] text-[#012d1d] font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">radar</span>
                                <span>Active Searching</span>
                              </span>
                            )}
                            {isReunited && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#c1ecd4] text-[#002114] font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">task_alt</span>
                                <span>Reunited / Handed Over</span>
                              </span>
                            )}
                            <span className="text-[11px] text-[#414844]">
                              {item.type === 'lost' ? 'Lost' : 'Found'} {item.dateLostOrFound}
                            </span>
                          </div>

                          <h3 className="text-[16px] text-[#012d1d] font-bold truncate">
                            {item.title}
                          </h3>

                          <div className="flex items-center gap-2 text-[#414844] text-[13px]">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base text-[#012d1d]">location_on</span>
                              <span>{item.locationName}</span>
                            </span>
                            <span>·</span>
                            <span className="font-mono text-[11px]">{item.reportCode}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        {hasMatch && !isReunited && (
                          <button
                            type="button"
                            onClick={() => onNavigateToMatch(item.matchCaseId)}
                            className="px-3.5 py-2 rounded-lg bg-[#a23e18] text-white hover:bg-[#822801] text-[12px] font-bold transition-colors cursor-pointer"
                          >
                            View Match
                          </button>
                        )}

                        {!hasMatch && !isReunited && (
                          <button
                            type="button"
                            onClick={() => showToast(`Search extended for ${item.title} across campus network.`)}
                            className="px-3.5 py-2 rounded-lg bg-[#e0f2e6] hover:bg-[#dbede0] text-[#101f17] text-[12px] font-semibold transition-colors cursor-pointer"
                          >
                            Extend Search
                          </button>
                        )}

                        {isReunited && (
                          <button
                            type="button"
                            onClick={() => alert(`Official turnover receipt for ${item.title} logged in system records.`)}
                            className="px-3.5 py-2 rounded-lg bg-[#e6f8eb] hover:bg-[#dbede0] text-[#012d1d] text-[12px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-[#c1ecd4]"
                          >
                            <span className="material-symbols-outlined text-base">receipt_long</span>
                            <span>Turnover Receipt</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Handover Stations & Guidelines (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Handover Stations Card */}
          <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-[#d5e7da] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#e0f2e6]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#012d1d] text-xl">store</span>
                <h3 className="text-[17px] text-[#012d1d] font-bold">Authorized Handover Desks</h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#c1ecd4] text-[#002114] font-bold">
                Verified
              </span>
            </div>

            <p className="text-[13px] text-[#414844]">
              Official safe handover desks verified for student-finder returns.
            </p>

            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-lg bg-[#e6f8eb] flex flex-col gap-1 border border-[#c1ecd4]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#101f17] font-bold">1. Central University Library</span>
                  <span className="text-[11px] text-[#a23e18] font-bold">Desk 1</span>
                </div>
                <div className="flex items-center gap-1 text-[#414844] text-[12px]">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>Daily: 8:00 AM – 8:00 PM</span>
                </div>
                <span className="text-[11px] text-[#717973]">Ground Floor Circulation Counter</span>
              </div>

              <div className="p-3 rounded-lg bg-[#e6f8eb] flex flex-col gap-1 border border-[#c1ecd4]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#101f17] font-bold">2. Main Admin &amp; Security Desk</span>
                  <span className="text-[11px] text-[#012d1d] font-bold">Main Gate</span>
                </div>
                <div className="flex items-center gap-1 text-[#414844] text-[12px]">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>24/7 Campus Security Post</span>
                </div>
                <span className="text-[11px] text-[#717973]">SAGE University Bhopal Main Entrance</span>
              </div>
            </div>

            {/* Handover Safety Notice */}
            <div className="p-3 rounded-lg bg-[#e0f2e6] flex items-start gap-2.5 border border-[#c1ecd4]">
              <span className="material-symbols-outlined text-[#012d1d] text-base shrink-0 mt-0.5">verified_user</span>
              <div className="flex flex-col">
                <span className="text-[12px] text-[#012d1d] font-bold">Campus Safety Policy</span>
                <p className="text-[11px] text-[#414844] leading-relaxed">
                  Campus regulations recommend handovers take place at authorized security desks or library counters with student ID validation.
                </p>
              </div>
            </div>
          </div>

          {/* Need Help Card */}
          <div className="rounded-xl bg-[#012d1d] text-white p-5 sm:p-6 flex flex-col gap-3 shadow-md border border-[#1b4332]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c1ecd4]">contact_support</span>
              <span className="text-[17px] font-bold">Need Help With a Claim?</span>
            </div>
            <p className="text-[13px] text-white/80 leading-relaxed">
              Having trouble coordinating handover or need an escort? Campus security officers are available to assist.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={onOpenCampusDesk}
                className="w-full py-2.5 px-3 rounded-lg bg-white text-[#012d1d] text-[12px] font-bold text-center hover:bg-[#e0f2e6] transition-colors cursor-pointer"
              >
                View Campus Desk Directory
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HANDOVER COORDINATION MODAL */}
      {handoverModalClaim && (
        <div className="fixed inset-0 z-50 bg-[#012d1d]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#d5e7da] animate-in fade-in zoom-in-95 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e0f2e6]">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#e6f8eb] text-[#012d1d] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">handshake</span>
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#a23e18]">
                    Finder Handover Hub
                  </span>
                  <h3 className="text-[18px] font-bold text-[#012d1d]">
                    Coordinate Safe Handover
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHandoverModalClaim(null)}
                className="p-1.5 rounded-lg text-[#717973] hover:text-[#101f17] hover:bg-[#e0f2e6] cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveHandoverCoordination} className="flex flex-col gap-4">
              <div className="p-3 bg-[#fbfdf9] rounded-xl border border-[#d5e7da] text-xs">
                <span className="font-bold text-[#012d1d]">Claim Details:</span> {handoverModalClaim.itemTitle} ({handoverModalClaim.itemReportCode}) claimed by <strong>{handoverModalClaim.claimantName}</strong>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#101f17]">
                  Authorized Handover Meeting Point
                </label>
                <select
                  value={handoverStation}
                  onChange={(e) => setHandoverStation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#d5e7da] bg-white text-[#101f17] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                >
                  <option value="SAGE University Bhopal - Admin & Campus Security Desk">
                    SAGE University Bhopal - Admin &amp; Campus Security Desk
                  </option>
                  <option value="Central University Library - Circulation Counter">
                    Central University Library - Circulation Counter (Level 1)
                  </option>
                  <option value="Student Canteen / Cafeteria Information Desk">
                    Student Canteen / Cafeteria Information Desk
                  </option>
                  <option value="Engineering & Technology Block Entrance Foyer">
                    Engineering &amp; Technology Block Entrance Foyer
                  </option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#101f17]">
                  Scheduled Date &amp; Time Window
                </label>
                <input
                  type="text"
                  required
                  value={handoverTimeSlot}
                  onChange={(e) => setHandoverTimeSlot(e.target.value)}
                  placeholder="e.g. Tomorrow, 11:30 AM – 1:00 PM"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#d5e7da] bg-white text-[#101f17] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#101f17]">
                  Safety &amp; Verification Instructions for Claimant
                </label>
                <textarea
                  rows={2}
                  value={handoverSafetyNotes}
                  onChange={(e) => setHandoverSafetyNotes(e.target.value)}
                  placeholder="e.g., Please bring your student ID card or purchase receipt."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#d5e7da] bg-white text-[#101f17] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e0f2e6]">
                <button
                  type="button"
                  onClick={() => setHandoverModalClaim(null)}
                  className="px-4 py-2 rounded-xl border border-[#d5e7da] text-[#414844] text-xs font-semibold hover:bg-[#e0f2e6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">check</span>
                  <span>Confirm Handover Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TURNOVER RECEIPT CONFIRMATION MODAL */}
      {receiptClaim && (
        <div className="fixed inset-0 z-50 bg-[#012d1d]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#d5e7da] animate-in fade-in zoom-in-95 flex flex-col gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#def7ec] text-[#03543f] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">task_alt</span>
            </div>
            <h3 className="text-xl font-bold text-[#012d1d]">Item Reunited Successfully!</h3>
            <p className="text-xs text-[#414844] leading-relaxed">
              Official campus turnover record completed for <strong>{receiptClaim.itemTitle}</strong>. Thank you for being a responsible member of our campus community!
            </p>

            <div className="p-3 bg-[#fbfdf9] rounded-xl border border-[#d5e7da] text-left text-xs space-y-1 font-mono">
              <div><span className="text-[#717973]">Receipt Code:</span> #REC-{Math.floor(10000 + Math.random() * 90000)}</div>
              <div><span className="text-[#717973]">Recipient:</span> {receiptClaim.claimantName}</div>
              <div><span className="text-[#717973]">Handover Station:</span> {receiptClaim.scheduledLocation || 'SAGE University Security Desk'}</div>
              <div><span className="text-[#717973]">Timestamp:</span> {new Date().toLocaleString()}</div>
            </div>

            <button
              type="button"
              onClick={() => setReceiptClaim(null)}
              className="mt-2 w-full py-2.5 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] cursor-pointer"
            >
              Done &amp; Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
