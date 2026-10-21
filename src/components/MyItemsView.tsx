import React, { useState } from 'react';
import { Item, ClaimTracking, ViewTab } from '../types';

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

  // Filter items belonging to user Maya Lin
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
      showToast('Additional verification notes transmitted to Officer Martinez.');
    }
  };

  const handleMessageDesk = () => {
    const msg = prompt('Send secure message to Officer Martinez:');
    if (msg) {
      showToast('Message sent to Student Union Custody Desk.');
    }
  };

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
            <span>Claim Verification Center</span>
          </div>
          <h1 className="text-[28px] md:text-[34px] font-bold text-[#012d1d] tracking-tight">
            My Campus Items &amp; Claims
          </h1>
          <p className="text-[14px] text-[#414844] max-w-3xl leading-relaxed">
            Track your reported lost belongings, items you found and turned in, potential AI matches, and active ownership verification claims in real-time.
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
          <span>All My Activity</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${selectedSubTab === 'all' ? 'bg-[#1b4332] text-white' : 'bg-[#e0f2e6] text-[#012d1d]'}`}>
            5
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
          <span className="px-1.5 py-0.2 rounded-full bg-[#dbede0] text-[#101f17] text-[11px]">2</span>
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
          <span>Found Items Logged</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#dbede0] text-[#101f17] text-[11px]">1</span>
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
          <span className="bg-[#a23e18] text-white px-1.5 py-0.2 rounded-full text-[10px] font-bold">1 New!</span>
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
          <span className="px-1.5 py-0.2 rounded-full bg-[#dbede0] text-[#101f17] text-[11px]">1</span>
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
          <span>Resolved &amp; Reunited</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#dbede0] text-[#101f17] text-[11px]">1</span>
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
                    86% Confidence Match
                  </span>
                  <span className="text-[11px] text-[#414844]">Logged 35m ago</span>
                </div>
                <h2 className="text-[18px] text-[#101f17] font-bold">
                  Good news Maya! High-confidence match found for your Sony Headphones
                </h2>
                <p className="text-[13px] text-[#414844] max-w-2xl leading-relaxed">
                  Caldwell Student Union Custodial Desk logged a matching black pair found near 2nd Floor Study Lounges. Color, model, and physical ear-cup markings align with your loss report.
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
                  <span className="text-[10px] text-[#414844] leading-none mt-0.5">Oct 14</span>
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
                  <span className="text-[10px] text-[#717973] leading-none mt-0.5">Optional</span>
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

            {/* Claim Details Highlight Box */}
            <div className="bg-[#e6f8eb] rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border border-[#c1ecd4]">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-[#414844] font-bold uppercase tracking-wider">
                  Submitted Proof
                </span>
                <p className="text-[13px] text-[#101f17] font-medium leading-snug">
                  {activeClaim.submittedProof}
                </p>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-[#414844] font-bold uppercase tracking-wider">
                  Reviewing Staff Custodian
                </span>
                <p className="text-[13px] text-[#012d1d] font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">badge</span>
                  <span>{activeClaim.reviewingOfficer}</span>
                </p>
                <span className="text-[11px] text-[#414844]">{activeClaim.officeLocation}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-[#414844] font-bold uppercase tracking-wider">
                  Estimated Verification
                </span>
                <p className="text-[13px] text-[#a23e18] font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">timer</span>
                  <span>{activeClaim.estimatedVerification}</span>
                </p>
                <span className="text-[11px] text-[#414844]">{activeClaim.resolutionDate}</span>
              </div>
            </div>

            {/* Claim Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleProvideEvidence}
                  className="px-3.5 py-2 rounded-lg bg-[#e0f2e6] hover:bg-[#d5e7da] text-[#101f17] text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#c1ecd4]"
                >
                  <span className="material-symbols-outlined text-base">attach_file</span>
                  <span>Provide Additional Evidence</span>
                </button>
                <button
                  type="button"
                  onClick={handleMessageDesk}
                  className="px-3.5 py-2 rounded-lg bg-[#012d1d] text-white hover:bg-[#1b4332] text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  <span>Message Custody Desk</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleWithdrawClaim}
                className="px-3 py-2 text-[#414844] hover:text-[#ba1a1a] text-[12px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">cancel</span>
                <span>Withdraw Claim</span>
              </button>
            </div>
          </div>

          {/* My Active Lost & Found Reports Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[18px] text-[#012d1d] font-bold">My Active Lost &amp; Found Reports</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#dbede0] text-[#101f17] font-bold">
                  {userItems.length} Total
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[#414844] text-[12px]">
                <span>Sort by:</span>
                <span className="font-bold text-[#012d1d] cursor-pointer inline-flex items-center">
                  Most Recent
                  <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                </span>
              </div>
            </div>

            {/* List of Items */}
            <div className="flex flex-col gap-3">
              {userItems.map((item) => {
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
                              <span>1 Match Found (86%)</span>
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
                              <span>Handed Over to Staff (Resolved)</span>
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
                          className="px-3.5 py-2 rounded-lg bg-[#e0f2e6] hover:bg-[#d5e7da] text-[#101f17] text-[12px] font-semibold transition-colors cursor-pointer"
                        >
                          Extend Search
                        </button>
                      )}

                      {isReunited && (
                        <button
                          type="button"
                          onClick={() => alert(`Official turnover receipt #TR-3419 logged at Caldwell Arts Hall. Student ID verified.`)}
                          className="px-3.5 py-2 rounded-lg bg-[#e6f8eb] hover:bg-[#dbede0] text-[#012d1d] text-[12px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-[#c1ecd4]"
                        >
                          <span className="material-symbols-outlined text-base">receipt_long</span>
                          <span>Turnover Receipt</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => alert(`Edit report for ${item.title}`)}
                        className="p-2 rounded-lg bg-[#e0f2e6] hover:bg-[#d5e7da] text-[#101f17] transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => showToast(`Marked ${item.title} as resolved.`)}
                        className="p-2 rounded-lg bg-[#e0f2e6] hover:bg-[#d5e7da] text-[#101f17] transition-colors cursor-pointer"
                        title="Mark as Found Elsewhere"
                      >
                        <span className="material-symbols-outlined text-base">check_circle</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Handover Stations & Resolution Rate (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Handover Stations Card */}
          <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-[#d5e7da] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#e0f2e6]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#012d1d] text-xl">store</span>
                <h3 className="text-[17px] text-[#012d1d] font-bold">Handover Stations</h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#c1ecd4] text-[#002114] font-bold">
                Authorized
              </span>
            </div>

            <p className="text-[13px] text-[#414844]">
              Official safe handover desks verified by Caldwell University Safety Officers.
            </p>

            <div className="flex flex-col gap-3">
              {/* Station 1 */}
              <div className="p-3 rounded-lg bg-[#e6f8eb] flex flex-col gap-1 border border-[#c1ecd4]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#101f17] font-bold">1. Student Union Info Hub</span>
                  <span className="text-[11px] text-[#a23e18] font-bold">Desk 1</span>
                </div>
                <div className="flex items-center gap-1 text-[#414844] text-[12px]">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>Open Daily: 8:00 AM – 8:00 PM</span>
                </div>
                <span className="text-[11px] text-[#717973]">Building Level 1, Main Atrium Entrance</span>
              </div>

              {/* Station 2 */}
              <div className="p-3 rounded-lg bg-[#e6f8eb] flex flex-col gap-1 border border-[#c1ecd4]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#101f17] font-bold">2. Main Library Circulation Desk</span>
                  <span className="text-[11px] text-[#012d1d] font-bold">East Wing</span>
                </div>
                <div className="flex items-center gap-1 text-[#414844] text-[12px]">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>Open Mon–Sun: 8:00 AM – 10:00 PM</span>
                </div>
                <span className="text-[11px] text-[#717973]">North Quad Wing, Turnstile Security Booth</span>
              </div>
            </div>

            {/* Handover Safety Notice */}
            <div className="p-3 rounded-lg bg-[#e0f2e6] flex items-start gap-2.5 border border-[#c1ecd4]">
              <span className="material-symbols-outlined text-[#012d1d] text-base shrink-0 mt-0.5">verified_user</span>
              <div className="flex flex-col">
                <span className="text-[12px] text-[#012d1d] font-bold">Safety First Policy</span>
                <p className="text-[11px] text-[#414844] leading-relaxed">
                  Campus regulations require all personal item transfers to be confirmed in person with an official Caldwell University student or staff ID badge.
                </p>
              </div>
            </div>
          </div>

          {/* Claim Activity Analytics Widget */}
          <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-[#d5e7da] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#e0f2e6]">
              <h3 className="text-[17px] text-[#012d1d] font-bold">My Resolution Rate</h3>
              <span className="text-[11px] text-[#414844]">Semester 2024</span>
            </div>

            {/* Inline Visual Ring & Stats */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#e0f2e6]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-[#012d1d]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="75, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-[18px] text-[#012d1d] font-bold leading-none tabular-nums">75%</span>
                  <span className="text-[9px] text-[#414844] uppercase font-bold">Success</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#414844]">Items Handed Over</span>
                  <span className="font-bold text-[#012d1d]">1 item</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#414844]">Claims Underway</span>
                  <span className="font-bold text-[#a23e18]">1 item</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#414844]">Average Claim Return</span>
                  <span className="font-bold text-[#012d1d]">3.2 days</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#e0f2e6] flex justify-between items-center text-[#414844] text-[12px]">
              <span>FindSync Campus Score: <strong>Gold Steward</strong></span>
              <span className="material-symbols-outlined text-[#a23e18] text-base">stars</span>
            </div>
          </div>

          {/* Need Help With a Claim Card */}
          <div className="rounded-xl bg-[#012d1d] text-white p-5 sm:p-6 flex flex-col gap-3 shadow-md border border-[#1b4332]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c1ecd4]">contact_support</span>
              <span className="text-[17px] font-bold">Need Help With a Claim?</span>
            </div>
            <p className="text-[13px] text-white/80 leading-relaxed">
              Having trouble confirming ownership or need an expedited release for academic gear? Campus security officers are available to assist.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href="tel:5550199201"
                className="w-full py-2.5 px-3 rounded-lg bg-white text-[#012d1d] text-[12px] font-bold text-center hover:bg-[#e0f2e6] transition-colors"
              >
                Call Security Dispatch: (555) 019-9201
              </a>
              <button
                type="button"
                onClick={onOpenCampusDesk}
                className="w-full py-2.5 px-3 rounded-lg bg-[#1b4332] text-white text-[12px] font-bold text-center hover:bg-[#002114] transition-colors cursor-pointer border border-[#c1ecd4]/20"
              >
                Open Campus Safety Live Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
