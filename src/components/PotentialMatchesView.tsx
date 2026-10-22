import React, { useState } from 'react';
import { MatchCase, ViewTab } from '../types';

interface PotentialMatchesViewProps {
  matchCase: MatchCase;
  onNavigateToTab: (tab: ViewTab) => void;
  onSubmitClaimSuccess?: (claimId: string) => void;
}

export const PotentialMatchesView: React.FC<PotentialMatchesViewProps> = ({
  matchCase,
  onNavigateToTab,
  onSubmitClaimSuccess,
}) => {
  const [covertMarkers, setCovertMarkers] = useState(
    "Device Bluetooth name is set to 'Maya's XM4'. Inside the headphone case zipper mesh pocket there is a silver USB-C to 3.5mm coiled adapter and a lavender guitar pick."
  );
  const [lossContext, setLossContext] = useState(
    "Packed my laptop in a hurry to attend 2:30 PM Organic Chemistry Lab in Hall 3."
  );
  const [honorCodeChecked, setHonorCodeChecked] = useState(false);
  const [honorCodeError, setHonorCodeError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>({
    name: 'sony_connect_app_registered.png',
    size: '1.4 MB',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [claimSaved, setClaimSaved] = useState(false);
  const [matchRejected, setMatchRejected] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Color / finish discrepancy (e.g. Matte Black vs Silver)');
  const [handoverConfirmed, setHandoverConfirmed] = useState(false);

  const handleScrollToClaim = () => {
    const el = document.getElementById('claimDrawerSection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const textarea = document.getElementById('uniqueMarks');
      if (textarea) textarea.focus();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
    }
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!honorCodeChecked) {
      setHonorCodeError('Please check the Caldwell Student Honor Code attestation to proceed.');
      return;
    }
    setHonorCodeError(null);

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setClaimSubmitted(true);
      if (onSubmitClaimSuccess) {
        onSubmitClaimSuccess('#CLM-3091');
      }
      const toast = document.getElementById('claimSuccessToast');
      if (toast) {
        toast.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 1000);
  };

  const handleConfirmReject = () => {
    setMatchRejected(true);
    setIsRejectModalOpen(false);
  };

  const handleSaveForLater = () => {
    setClaimSaved(true);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Meta Breadcrumbs & Case Status Bar */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <nav className="flex items-center gap-2 text-[13px] font-semibold text-[#414844]">
            <button
              type="button"
              onClick={() => onNavigateToTab('explore')}
              className="hover:text-[#012d1d] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Potential Matches</span>
            </button>
            <span className="text-[#c1c8c2] font-medium">/</span>
            <span className="text-[#101f17] font-semibold tracking-tight">
              {matchCase.id} (Noise-Cancelling Headphones)
            </span>
          </nav>

          <div className="flex items-baseline gap-2.5 flex-wrap">
            <h1 className="text-[28px] md:text-[34px] font-bold text-[#012d1d] tracking-tight">
              Potential Item Match Found
            </h1>
            <span className="text-[11px] uppercase tracking-wider text-[#a23e18] font-bold bg-[#ffdbcf] px-2 py-0.5 rounded-full">
              Automated Cross-Check
            </span>
          </div>

          <p className="text-[14px] text-[#414844] max-w-3xl leading-relaxed">
            Our campus matching algorithm paired your lost item report with an intake record processed at the Caldwell Student Union Desk. Review visual discrepancies, location proximity, and file an ownership claim.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffdbcf] text-[#390c00] shadow-xs border border-[#fe8357]/30">
            <span className="w-2.5 h-2.5 rounded-full bg-[#a23e18] animate-pulse" />
            <span className="text-[13px] font-semibold tracking-tight">
              {claimSubmitted ? 'Claim Transmitted (Under Review)' : 'Potential Match Detected (Under Review)'}
            </span>
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison Hub with Central Floating Similarity Engine */}
      <section className="relative w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left Item: Reported Lost */}
          <article className="bg-white rounded-xl p-6 shadow-sm border border-[#d5e7da] flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#ffdbcf]/60 text-[#a23e18] font-bold">
                <span className="material-symbols-outlined text-sm">search_check</span>
                <span className="text-[11px] uppercase tracking-wider">Report #L-2049</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#dbede0] text-[#414844]">
                <span className="w-2 h-2 rounded-full bg-[#a23e18]" />
                Active Search
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-4">
              <div>
                <span className="text-[11px] text-[#a23e18] font-bold uppercase tracking-wider">
                  Your Registered Submission
                </span>
                <h2 className="text-[22px] text-[#101f17] mt-0.5 font-bold tracking-tight">
                  Sony WH-1000XM4 Headphones
                </h2>
              </div>

              {/* Image Wrap */}
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#e0f2e6]">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Sony WH-1000XM4 black headphones on desk"
                  src={matchCase.lostItem.imageUrl}
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[11px] text-[#012d1d] font-semibold flex items-center gap-1.5 shadow-xs">
                  <span className="material-symbols-outlined text-sm text-[#012d1d]">photo_camera</span>
                  <span>Original User Photo</span>
                </div>
              </div>

              {/* Metadata List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-lg bg-[#e6f8eb] flex flex-col gap-0.5 border border-[#c1ecd4]">
                  <span className="text-[11px] text-[#414844] font-semibold uppercase tracking-wider">Category</span>
                  <span className="text-[14px] text-[#101f17] font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#012d1d] text-base">headphones</span>
                    Electronics &amp; Audio
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#e6f8eb] flex flex-col gap-0.5 border border-[#c1ecd4]">
                  <span className="text-[11px] text-[#414844] font-semibold uppercase tracking-wider">Reported Lost Timestamp</span>
                  <span className="text-[14px] text-[#101f17] font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#012d1d] text-base">schedule</span>
                    Oct 14, 2024 · 2:15 PM
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#e6f8eb] flex flex-col gap-0.5 sm:col-span-2 border border-[#c1ecd4]">
                  <span className="text-[11px] text-[#414844] font-semibold uppercase tracking-wider">Reported Location</span>
                  <span className="text-[14px] text-[#101f17] font-medium flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#012d1d] text-base">pin_drop</span>
                    Caldwell Main Library, 2nd Floor Quiet Study Cubicle 14
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#e6f8eb] flex flex-col gap-0.5 sm:col-span-2 border border-[#c1ecd4]">
                  <span className="text-[11px] text-[#414844] font-semibold uppercase tracking-wider">Color &amp; Specific Details</span>
                  <p className="text-[14px] text-[#101f17]">
                    Matte Black, subtle scratch on left hinge, gold accent logos, original travel case reported missing alongside.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between border-t border-[#e0f2e6]">
              <span className="text-[12px] text-[#414844] font-mono">Owner Case ID: #USR-9102-MAYAL</span>
              <span className="text-[12px] text-[#012d1d] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>Verified Caldwell Account</span>
              </span>
            </div>
          </article>

          {/* Right Item: Matching Found Item */}
          <article className="bg-white rounded-xl p-6 shadow-sm border border-[#d5e7da] flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#c1ecd4] text-[#012d1d] font-bold">
                <span className="material-symbols-outlined text-sm">inventory_2</span>
                <span className="text-[11px] uppercase tracking-wider">Found Report #F-1082</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#1b4332] text-white">
                <span className="w-2 h-2 rounded-full bg-[#c1ecd4] animate-pulse" />
                In Safe Campus Custody
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-4">
              <div>
                <span className="text-[11px] text-[#012d1d] font-bold uppercase tracking-wider">
                  Turned-In Property
                </span>
                <h2 className="text-[22px] text-[#101f17] mt-0.5 font-bold tracking-tight">
                  Black Over-Ear Wireless Headphones
                </h2>
              </div>

              {/* Image Wrap */}
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#e0f2e6]">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Black wireless headphones in Bin 24"
                  src={matchCase.foundItem.imageUrl}
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[11px] text-[#012d1d] font-semibold flex items-center gap-1.5 shadow-xs">
                  <span className="material-symbols-outlined text-sm text-[#012d1d]">verified</span>
                  <span>Staff Intake Photograph</span>
                </div>
                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-[#012d1d] text-white text-[12px] font-mono font-bold tracking-wider shadow-md">
                  BIN #E-14
                </div>
              </div>

              {/* Metadata List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-lg bg-[#e6f8eb] flex flex-col gap-0.5 border border-[#c1ecd4]">
                  <span className="text-[11px] text-[#414844] font-semibold uppercase tracking-wider">Logged Category</span>
                  <span className="text-[14px] text-[#101f17] font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#012d1d] text-base">headphones</span>
                    Electronics &amp; Audio
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#e6f8eb] flex flex-col gap-0.5 border border-[#c1ecd4]">
                  <span className="text-[11px] text-[#414844] font-semibold uppercase tracking-wider">Discovered &amp; Logged</span>
                  <span className="text-[14px] text-[#101f17] font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#012d1d] text-base">event_available</span>
                    Oct 14, 2024 · 4:30 PM <span className="text-[#a23e18] font-bold text-xs">(+2h 15m)</span>
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#e6f8eb] flex flex-col gap-0.5 sm:col-span-2 border border-[#c1ecd4]">
                  <span className="text-[11px] text-[#414844] font-semibold uppercase tracking-wider">Intake Custody Location</span>
                  <span className="text-[14px] text-[#101f17] font-medium flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#012d1d] text-base">storefront</span>
                    Caldwell Student Union Lost &amp; Found Custody Desk (Tier 1 Holding)
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#e6f8eb] flex flex-col gap-0.5 sm:col-span-2 border border-[#c1ecd4]">
                  <span className="text-[11px] text-[#414844] font-semibold uppercase tracking-wider">Intake Officer Notes</span>
                  <p className="text-[14px] text-[#101f17]">
                    Black over-ear headset with cushioned headband and USB-C socket. Matching hard-shell protective travel pouch present. Powered off.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between border-t border-[#e0f2e6]">
              <span className="text-[12px] text-[#414844]">Logged by: Staff Officer R. Ramirez (#ST-44)</span>
              <span className="text-[12px] text-[#a23e18] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Safe Lockup Active</span>
              </span>
            </div>
          </article>
        </div>

        {/* Central Floating Match Dial Gauge */}
        <div className="my-6 lg:my-0 lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-20 flex justify-center pointer-events-none">
          <div className="bg-white p-4 rounded-full shadow-2xl border-4 border-[#e0f2e6] flex flex-col items-center justify-center text-center w-48 h-48 sm:w-52 sm:h-52 pointer-events-auto">
            {/* Animated Gauge SVG Ring */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  className="stroke-[#d5e7da]"
                  cx="60"
                  cy="60"
                  fill="none"
                  r="50"
                  strokeWidth="8"
                />
                <circle
                  className="stroke-[#012d1d] transition-all duration-1000 ease-out"
                  cx="60"
                  cy="60"
                  fill="none"
                  r="50"
                  strokeDasharray="314.15"
                  strokeDashoffset="44"
                  strokeLinecap="round"
                  strokeWidth="9"
                />
                <circle
                  className="stroke-[#a23e18] transition-all duration-1000 ease-out"
                  cx="60"
                  cy="60"
                  fill="none"
                  r="50"
                  strokeDasharray="314.15"
                  strokeDashoffset="290"
                  strokeLinecap="round"
                  strokeWidth="9"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[34px] font-bold text-[#012d1d] tracking-tight leading-none tabular-nums">
                  {matchCase.confidenceScore}%
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#a23e18] mt-1">
                  Match Confidence
                </span>
              </div>
            </div>
            <span className="text-[10px] leading-tight text-[#414844] max-w-[150px] mt-1 font-semibold">
              5 Weighted Factors · Not Proof of Ownership
            </span>
          </div>
        </div>
      </section>

      {/* Weighted Factors Match Breakdown Bento Grid */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase font-bold tracking-widest text-[#414844]">
              Algorithmic Correlation Matrix
            </span>
            <h2 className="text-[22px] text-[#012d1d] font-bold">Match Breakdown &amp; Analysis</h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[13px] font-semibold text-[#414844]">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#1b4332]" />
            <span>AI Model v4.2</span>
            <span className="mx-1">•</span>
            <span>Updated 18 min ago</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Parameter 1 */}
          <div className="bg-white p-5 rounded-xl border border-[#d5e7da] shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="p-2 rounded-lg bg-[#dbede0] text-[#012d1d]">
                <span className="material-symbols-outlined">devices_other</span>
              </span>
              <span className="text-[18px] font-bold text-[#012d1d] tabular-nums">100%</span>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <h3 className="text-[15px] font-bold text-[#101f17]">Category &amp; Device Type</h3>
              <p className="text-[13px] text-[#414844]">
                Consumer Audio / Wireless Bluetooth Headset verified through photographic neural tagging.
              </p>
            </div>
            <div className="mt-4 w-full bg-[#dbede0] h-2 rounded-full overflow-hidden">
              <div className="bg-[#012d1d] h-full rounded-full w-full" />
            </div>
          </div>

          {/* Parameter 2 */}
          <div className="bg-white p-5 rounded-xl border border-[#d5e7da] shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="p-2 rounded-lg bg-[#dbede0] text-[#012d1d]">
                <span className="material-symbols-outlined">palette</span>
              </span>
              <span className="text-[18px] font-bold text-[#012d1d] tabular-nums">90%</span>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <h3 className="text-[15px] font-bold text-[#101f17]">Visual &amp; Model Proximity</h3>
              <p className="text-[13px] text-[#414844]">
                Form factor, color tone, cushion contour, and headband hinges correlate with Sony WH-1000XM series.
              </p>
            </div>
            <div className="mt-4 w-full bg-[#dbede0] h-2 rounded-full overflow-hidden">
              <div className="bg-[#012d1d] h-full rounded-full w-[90%]" />
            </div>
          </div>

          {/* Parameter 3 */}
          <div className="bg-white p-5 rounded-xl border border-[#d5e7da] shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="p-2 rounded-lg bg-[#ffdbcf] text-[#a23e18]">
                <span className="material-symbols-outlined">schedule</span>
              </span>
              <span className="text-[18px] font-bold text-[#a23e18] tabular-nums">85%</span>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <h3 className="text-[15px] font-bold text-[#101f17]">Time Proximity</h3>
              <p className="text-[13px] text-[#414844]">
                Discovered 2 hours 15 minutes after logged loss, conforming to normal campus cleaning patrol cycles.
              </p>
            </div>
            <div className="mt-4 w-full bg-[#dbede0] h-2 rounded-full overflow-hidden">
              <div className="bg-[#a23e18] h-full rounded-full w-[85%]" />
            </div>
          </div>

          {/* Parameter 4 */}
          <div className="bg-white p-5 rounded-xl border border-[#d5e7da] shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="p-2 rounded-lg bg-[#dbede0] text-[#012d1d]">
                <span className="material-symbols-outlined">near_me</span>
              </span>
              <span className="text-[18px] font-bold text-[#012d1d] tabular-nums">80%</span>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <h3 className="text-[15px] font-bold text-[#101f17]">Geospatial Proximity</h3>
              <p className="text-[13px] text-[#414844]">
                Main Library 2nd Floor to Student Union represents a direct 180m pedestrian path through Central Quad.
              </p>
            </div>
            <div className="mt-4 w-full bg-[#dbede0] h-2 rounded-full overflow-hidden">
              <div className="bg-[#012d1d] h-full rounded-full w-[80%]" />
            </div>
          </div>
        </div>
      </section>

      {/* Geospatial Corridor & Handover Verification Timeline */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Campus Map & Walking Path Trajectory */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-[#d5e7da] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#a23e18]">
                Campus Movement Corridor
              </span>
              <h3 className="text-[18px] text-[#012d1d] font-bold">180-Meter Pedestrian Route</h3>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-[#e6f8eb] text-[12px] text-[#012d1d] font-bold flex items-center gap-1 border border-[#c1ecd4]">
              <span className="material-symbols-outlined text-sm text-[#012d1d]">directions_walk</span>
              <span>~3 min transit time</span>
            </span>
          </div>

          {/* Stylized Interactive Map Container */}
          <div className="relative w-full h-80 rounded-xl overflow-hidden bg-[#e0f2e6] mt-4 flex items-center justify-center border border-[#c1ecd4]">
            {/* Campus Background Grid & Graphic */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1b4332_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Route Graphic Overlay */}
            <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between pointer-events-none">
              {/* Lost Pin: Library */}
              <div className="self-start bg-white/95 backdrop-blur-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-2.5 pointer-events-auto border border-[#d5e7da]">
                <span className="w-8 h-8 rounded-full bg-[#ffdbcf] text-[#a23e18] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-lg">local_library</span>
                </span>
                <div className="flex flex-col text-left">
                  <span className="text-[13px] font-bold text-[#101f17]">Caldwell Main Library</span>
                  <span className="text-[11px] text-[#a23e18] font-bold">Lost Site · 2:15 PM</span>
                </div>
              </div>

              {/* Stylized Animated Trail Path (SVG) */}
              <div className="w-full px-8 py-2 flex items-center justify-center">
                <svg className="w-full max-w-md h-20" fill="none" viewBox="0 0 320 70">
                  <path
                    className="text-[#1b4332]"
                    d="M 20,50 C 90,50 110,15 170,25 C 230,35 250,55 300,18"
                    stroke="currentColor"
                    strokeDasharray="6 6"
                    strokeWidth="3.5"
                  />
                  <circle className="fill-[#a23e18]" cx="20" cy="50" r="6" />
                  <circle className="fill-[#012d1d]" cx="300" cy="18" r="6" />
                </svg>
              </div>

              {/* Found Pin: Student Union */}
              <div className="self-end bg-white/95 backdrop-blur-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-2.5 pointer-events-auto border border-[#d5e7da]">
                <div className="flex flex-col text-right">
                  <span className="text-[13px] font-bold text-[#101f17]">Caldwell Student Union</span>
                  <span className="text-[11px] text-[#012d1d] font-bold">Custody Intake · 4:30 PM</span>
                </div>
                <span className="w-8 h-8 rounded-full bg-[#012d1d] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-lg">meeting_room</span>
                </span>
              </div>
            </div>

            {/* Bottom Micro Map Bar */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-xs flex items-center justify-between text-[11px] text-[#414844] pointer-events-none border border-[#d5e7da]">
              <span className="flex items-center gap-1 font-semibold text-[#012d1d]">
                <span className="material-symbols-outlined text-xs text-[#012d1d]">my_location</span>
                Central Academic Quadrangle
              </span>
              <span className="font-medium">Intake Station: Desk Counter #2</span>
            </div>
          </div>

          <p className="text-[13px] text-[#414844] mt-4 leading-relaxed">
            Property was found unattended in the ground-floor vending lounge of the Student Union, directly on the corridor connecting from the Main Library exit plaza.
          </p>
        </div>

        {/* Verification Lifecycle Timeline & Handover Protocol */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-[#d5e7da] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#012d1d]">
              Institutional Audit Log
            </span>
            <h3 className="text-[18px] text-[#012d1d] font-bold mt-0.5">Chain of Custody Timeline</h3>

            <div className="mt-6 relative pl-6 flex flex-col gap-6">
              {/* Continuous vertical line */}
              <div className="absolute left-2.5 top-2 bottom-3 w-0.5 bg-[#d5e7da]" />

              {/* Event 1 */}
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#ffdbcf] flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-[#a23e18]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#101f17]">Oct 14, 2:15 PM</span>
                  <span className="text-[13px] text-[#414844]">Lost Item Logged by Maya Lin (Cubicle 14)</span>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#c1ecd4] flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-[#012d1d]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#101f17]">Oct 14, 4:30 PM</span>
                  <span className="text-[13px] text-[#414844]">Headphones turned in &amp; assigned Bin #E-14</span>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#c1ecd4] flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-[#012d1d]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#101f17]">Oct 14, 4:45 PM</span>
                  <span className="text-[13px] text-[#414844]">FindSync Algorithm paired Case #PM-8429</span>
                </div>
              </div>

              {/* Event 4 (Current) */}
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#a23e18] flex items-center justify-center ring-4 ring-[#ffdbcf]">
                  <span className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#a23e18]">
                    {claimSubmitted ? 'Claim Transmitted & In Officer Queue' : 'Awaiting Student Ownership Claim'}
                  </span>
                  <span className="text-[13px] text-[#414844]">
                    {claimSubmitted ? 'Assigned to Officer Ramirez for identifier review' : 'Pending distinctive proof verification by Staff'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Safe Handover Notice Card */}
          <div className="mt-6 p-4 rounded-xl bg-[#e6f8eb] border border-[#c1ecd4] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#012d1d] font-bold text-[14px]">
              <span className="material-symbols-outlined text-[#012d1d]">verified_user</span>
              <span>Mandatory Safe Pickup Protocol</span>
            </div>
            <p className="text-[13px] text-[#414844] leading-relaxed">
              Property releases require your physical Caldwell ID card and Bluetooth pairing confirmation or distinctive identifier verification at the Student Union desk.
            </p>
          </div>
        </div>
      </section>

      {/* Primary Action & Verification Launch Bar */}
      <section className="bg-white rounded-xl p-6 border border-[#d5e7da] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col">
          <h3 className="text-[18px] text-[#101f17] font-bold">Is this your lost property?</h3>
          <p className="text-[14px] text-[#414844]">
            Submit ownership verification to reserve this item for safe collection and prevent unauthorized claims.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsRejectModalOpen(true)}
            disabled={matchRejected}
            className={`px-4 py-2.5 rounded-lg text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              matchRejected
                ? 'bg-[#dbede0] text-[#717973] cursor-not-allowed'
                : 'text-[#414844] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40'
            }`}
          >
            <span className="material-symbols-outlined text-base">close</span>
            <span>{matchRejected ? 'Flagged as Incorrect Match' : 'Flag Incorrect Match'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveForLater}
            className={`px-4 py-2.5 rounded-lg text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              claimSaved
                ? 'bg-[#c1ecd4] text-[#012d1d] font-bold'
                : 'bg-[#e0f2e6] hover:bg-[#d5e7da] text-[#101f17]'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {claimSaved ? 'bookmark_added' : 'bookmark'}
            </span>
            <span>{claimSaved ? 'Saved to My Items' : 'Save for Later'}</span>
          </button>

          <button
            type="button"
            onClick={handleScrollToClaim}
            className="px-6 py-2.5 rounded-lg bg-[#012d1d] hover:bg-[#1b4332] text-white text-[13px] font-bold transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">verified</span>
            <span>Submit Ownership Claim</span>
          </button>
        </div>
      </section>

      {/* Inline Ownership Claim Verification Drawer */}
      <section
        id="claimDrawerSection"
        className="transition-all duration-500 ease-in-out flex flex-col gap-6 bg-white rounded-xl p-6 md:p-8 border border-[#d5e7da] shadow-sm scroll-mt-20"
      >
        {/* Drawer Header & Security Assurances */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-2 border-b border-[#e0f2e6]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-[#012d1d] text-white text-[11px] font-bold uppercase tracking-wider">
                Verification Step 1 of 2
              </span>
              <span className="text-[11px] text-[#a23e18] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">lock</span>
                Confidential Admin Review
              </span>
            </div>
            <h2 className="text-[24px] text-[#012d1d] font-bold mt-1">
              Verify Distinctive Ownership Identifiers
            </h2>
            <p className="text-[14px] text-[#414844] max-w-2xl">
              To prevent false claims and preserve student privacy, please specify characteristics that are not shown in public catalog photos. Do not submit PIN codes or financial details.
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-[#e6f8eb] p-3 rounded-xl max-w-sm border border-[#c1ecd4]">
            <span className="material-symbols-outlined text-[#012d1d] text-2xl shrink-0">shield</span>
            <p className="text-[12px] text-[#101f17] leading-snug">
              Protected by Caldwell Privacy Charter. Answers are locked exclusively to Staff Officer Ramirez during intake.
            </p>
          </div>
        </div>

        {/* Claim Submission Form */}
        <form onSubmit={handleSubmitClaim} className="flex flex-col gap-5">
          {/* Field 1: Distinctive Identifiers */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-[#101f17] font-semibold flex items-center justify-between" htmlFor="uniqueMarks">
              <span>
                1. Distinctive Identifiers &amp; Covert Markers <span className="text-[#a23e18]">*</span>
              </span>
              <span className="text-[11px] text-[#717973] font-normal">Required</span>
            </label>
            <p className="text-[13px] text-[#414844]">
              Describe details only the rightful owner would know: e.g., Bluetooth device name broadcast, sticker residue, custom EQ presets, serial number snippet, or contents inside the zipper case.
            </p>
            <textarea
              id="uniqueMarks"
              rows={3}
              required
              value={covertMarkers}
              onChange={(e) => setCovertMarkers(e.target.value)}
              placeholder="e.g., Device Bluetooth name is set to 'Maya's XM4'. Inside the headphone case zipper mesh pocket there is a silver USB-C to 3.5mm coiled adapter and a lavender guitar pick."
              className="w-full mt-1 p-3 rounded-lg bg-[#e6f8eb] text-[#101f17] placeholder:text-[#717973] focus:outline-none focus:ring-2 focus:ring-[#012d1d] border border-[#c1ecd4] text-[14px] font-sans"
            />
          </div>

          {/* Field 2: Proof of Purchase / App Dropzone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-[#101f17] font-semibold flex items-center justify-between">
              <span>2. Proof of Purchase, App Registration, or Device Receipt</span>
              <span className="text-[11px] text-[#012d1d] font-semibold">Optional · Accelerates Approval</span>
            </label>
            <p className="text-[13px] text-[#414844]">
              Upload a screenshot from the Sony Headphones Connect app, warranty card, electronic receipt, or original serial barcode.
            </p>

            <label
              htmlFor="claim-file-upload"
              className="mt-1 w-full p-6 rounded-xl bg-[#e6f8eb] hover:bg-[#dbede0] transition-colors flex flex-col items-center justify-center text-center cursor-pointer group border-2 border-dashed border-[#c1ecd4]"
            >
              <div className="w-12 h-12 rounded-full bg-white text-[#012d1d] flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">cloud_upload</span>
              </div>
              <div className="mt-2 flex flex-col items-center">
                <span className="text-[13px] text-[#101f17] font-bold">
                  Drag and drop your file here, or <span className="text-[#a23e18] underline">browse local files</span>
                </span>
                <span className="text-[11px] text-[#414844] mt-0.5">
                  PNG, JPG, HEIC, or PDF up to 12MB
                </span>
              </div>
              <input
                id="claim-file-upload"
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {/* Staged Upload Mock Attachment */}
            {uploadedFile && (
              <div className="mt-2 p-3 rounded-lg bg-[#e0f2e6] border border-[#c1ecd4] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#012d1d] text-2xl">image</span>
                  <div className="flex flex-col text-left">
                    <span className="text-[13px] text-[#101f17] font-bold">{uploadedFile.name}</span>
                    <span className="text-[11px] text-[#414844]">{uploadedFile.size} · Staged for upload</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="text-[#414844] hover:text-[#ba1a1a] p-1 cursor-pointer"
                  title="Remove file"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            )}
          </div>

          {/* Field 3: Additional Circumstances */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-[#101f17] font-semibold" htmlFor="lossContext">
              3. Context of Misplacement
            </label>
            <input
              id="lossContext"
              type="text"
              value={lossContext}
              onChange={(e) => setLossContext(e.target.value)}
              placeholder="e.g., Packed my laptop in a hurry to attend 2:30 PM Organic Chemistry Lab in Hall 3."
              className="w-full mt-1 p-3 rounded-lg bg-[#e6f8eb] text-[#101f17] placeholder:text-[#717973] focus:outline-none focus:ring-2 focus:ring-[#012d1d] border border-[#c1ecd4] text-[14px]"
            />
          </div>

          {/* Honor Code Attestation */}
          {honorCodeError && (
            <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold rounded-xl flex items-center gap-2 border border-[#ffb4ab]">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{honorCodeError}</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#e6f8eb] border border-[#c1ecd4] flex items-start gap-3">
            <input
              id="honorCodeCheck"
              type="checkbox"
              required
              checked={honorCodeChecked}
              onChange={(e) => setHonorCodeChecked(e.target.checked)}
              className="mt-1 h-4 w-4 rounded accent-[#012d1d] text-[#012d1d] focus:ring-[#012d1d] cursor-pointer"
            />
            <label htmlFor="honorCodeCheck" className="text-[13px] text-[#101f17] leading-relaxed cursor-pointer select-none">
              <span className="font-bold">I certify under the Caldwell University Student Honor Code</span> that I am the genuine, lawful owner of this property. Submitting fraudulent claims for institutional property is subject to Dean of Students disciplinary review and campus code violations.
            </label>
          </div>

          {/* Form Submission Button Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-[#414844] text-[12px] font-semibold">
              <span className="material-symbols-outlined text-[#a23e18] text-base">timer</span>
              <span>Intake Desk turnaround: Typically verified within 45 minutes</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#e0f2e6] text-[#101f17] hover:bg-[#d5e7da] transition-colors text-[13px] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || claimSubmitted}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-white text-[13px] font-bold transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer ${
                  claimSubmitted
                    ? 'bg-[#1b4332]'
                    : isSubmitting
                    ? 'bg-[#1b4332] opacity-80 cursor-wait'
                    : 'bg-[#012d1d] hover:bg-[#1b4332]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">sync</span>
                    <span>Transmitting Proof...</span>
                  </>
                ) : claimSubmitted ? (
                  <>
                    <span className="material-symbols-outlined text-base text-[#c1ecd4]">check_circle</span>
                    <span>Claim Under Desk Review</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">send</span>
                    <span>Transmit Claim to Desk</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Confirmation Banner & Handover Coordination */}
        {claimSubmitted && (
          <div id="claimSuccessToast" className="p-5 rounded-xl bg-[#c1ecd4] text-[#002114] flex flex-col gap-4 border border-[#85f8c4] animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-2xl shrink-0 text-[#012d1d]">task_alt</span>
              <div className="flex flex-col">
                <span className="text-[16px] font-bold text-[#012d1d]">Ownership Claim Transmitted Successfully!</span>
                <p className="text-[13px] text-[#274e3d] mt-0.5 leading-relaxed">
                  Claim reference <strong>#CLM-3091</strong> is logged with Officer Ramirez. You will receive an SMS and email notification once verified. You may proceed to Student Union Desk Counter #2 with your student ID card.
                </p>
              </div>
            </div>

            {/* Handover confirmation action */}
            <div className="p-3.5 bg-white/80 rounded-xl border border-[#a2dfbd] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <strong className="text-[#012d1d] block">Physical Pickup &amp; Return Handover:</strong>
                <span className="text-[#414844]">
                  {handoverConfirmed
                    ? 'Item return has been confirmed! Property case marked as successfully recovered.'
                    : 'Once you pick up your item at Desk #2, confirm receipt below to complete the chain of custody.'}
                </span>
              </div>
              {!handoverConfirmed ? (
                <button
                  type="button"
                  onClick={() => setHandoverConfirmed(true)}
                  className="px-4 py-2 rounded-lg bg-[#012d1d] text-white font-bold hover:bg-[#1b4332] shrink-0 cursor-pointer shadow-xs"
                >
                  Confirm Item Received &amp; Handover Complete
                </button>
              ) : (
                <span className="px-3 py-1 bg-[#1b4332] text-white font-bold rounded-lg shrink-0 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">done_all</span>
                  <span>Handover Verified</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateToTab('my-items')}
                className="px-3.5 py-1.5 rounded-lg bg-[#012d1d] text-white text-[12px] font-bold hover:bg-[#1b4332] cursor-pointer"
              >
                Track in My Items →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Report Incorrect Match / Flag False Positive Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#012d1d]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#d5e7da] animate-in fade-in zoom-in-95 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a23e18]">flag</span>
                <h3 className="text-[17px] font-bold text-[#012d1d]">Flag Incorrect Match</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1 rounded-lg text-[#717973] hover:text-[#101f17]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <p className="text-xs text-[#414844] leading-relaxed">
              Help calibrate the Caldwell matching algorithm. Why does this turned-in item not belong to your lost report?
            </p>

            <div className="flex flex-col gap-2">
              {[
                'Color / finish discrepancy (e.g. Matte Black vs Silver)',
                'Different brand or model variant',
                'Geographic corridor mismatch (different campus / transit line)',
                'Already retrieved my property through other means',
                'Other false correlation',
              ].map((reason) => (
                <label
                  key={reason}
                  className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all ${
                    rejectReason === reason
                      ? 'border-[#012d1d] bg-[#e6f8eb] text-[#012d1d]'
                      : 'border-[#d5e7da] text-[#414844] hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={rejectReason === reason}
                    onChange={() => setRejectReason(reason)}
                    className="accent-[#012d1d]"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e0f2e6]">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#e0f2e6] text-[#101f17] text-xs font-bold hover:bg-[#d5e7da]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg bg-[#a23e18] text-white text-xs font-bold hover:bg-[#853011] shadow-xs cursor-pointer"
              >
                Dismiss Pair as False Positive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
