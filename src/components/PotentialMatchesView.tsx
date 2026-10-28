import React, { lazy, Suspense, useState } from 'react';
import { CampusId, MatchCase, ViewTab } from '../types';

const CampusMapPicker = lazy(() =>
  import('./CampusMapPicker').then((module) => ({ default: module.CampusMapPicker }))
);

interface PotentialMatchesViewProps {
  matchCase: MatchCase | null;
  campusId: CampusId;
  onUniversityDetected: (name: string | null) => void;
  onNavigateToTab: (tab: ViewTab) => void;
  onSubmitClaimSuccess?: (claimId: string) => Promise<void>;
}

export const PotentialMatchesView: React.FC<PotentialMatchesViewProps> = ({
  matchCase,
  campusId,
  onUniversityDetected,
  onNavigateToTab,
  onSubmitClaimSuccess,
}) => {
  const [covertMarkers, setCovertMarkers] = useState(
    ''
  );
  const [lossContext, setLossContext] = useState('');
  const [honorCodeChecked, setHonorCodeChecked] = useState(false);
  const [honorCodeError, setHonorCodeError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [claimReference, setClaimReference] = useState<string | null>(null);
  const [claimSaved, setClaimSaved] = useState(false);
  const [matchRejected, setMatchRejected] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
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

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!honorCodeChecked) {
      setHonorCodeError('Please confirm the campus conduct statement to proceed.');
      return;
    }
    setHonorCodeError(null);

    setIsSubmitting(true);
    try {
      const claimId = `#CLM-${Date.now().toString().slice(-6)}`;
      await onSubmitClaimSuccess?.(claimId);
      setClaimReference(claimId);
      setClaimSubmitted(true);
      const toast = document.getElementById('claimSuccessToast');
      if (toast) {
        toast.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (error) {
      setHonorCodeError(error instanceof Error ? error.message : 'Could not submit the claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = () => {
    setMatchRejected(true);
    setIsRejectModalOpen(false);
  };

  const handleSaveForLater = () => {
    setClaimSaved(true);
  };

  if (!matchCase || matchCase.confidenceScore === 0 || matchRejected) {
    return (
      <div className="w-full flex flex-col gap-6 py-6 animate-in fade-in">
        <nav className="flex items-center gap-2 text-[13px] font-semibold text-[#414844]">
          <button
            type="button"
            onClick={() => onNavigateToTab('explore')}
            className="hover:text-[#012d1d] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Return to Explore Feed</span>
          </button>
        </nav>

        <div className="order-2 bg-white rounded-2xl p-10 text-center border border-[#d5e7da] shadow-sm flex flex-col items-center justify-center max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-[#e6f8eb] text-[#012d1d] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">radar</span>
          </div>
          <h2 className="text-2xl font-bold text-[#012d1d] tracking-tight">
            No Potential Matches Yet
          </h2>
          <p className="text-sm text-[#414844] mt-2 max-w-md leading-relaxed">
            {matchRejected
              ? 'This match was dismissed.'
              : 'Potential matches will appear here when live lost and found reports meet the matching criteria.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateToTab('report-lost')}
              className="px-5 py-2.5 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] transition-all cursor-pointer shadow-sm"
            >
              Report a Lost Item
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab('explore')}
              className="px-5 py-2.5 rounded-xl bg-[#e6f8eb] text-[#012d1d] text-xs font-bold hover:bg-[#dbede0] transition-all cursor-pointer border border-[#c1ecd4]"
            >
              Browse Campus Custody Feed
            </button>
          </div>
        </div>

        <section className="order-1 bg-white rounded-2xl p-5 border border-[#d5e7da] shadow-sm">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-[#012d1d]">Live location tracking</h3>
            <p className="text-sm text-[#536057]">Allow GPS access to show your current position and identify a nearby university.</p>
          </div>
          <Suspense fallback={<div className="h-80 rounded-xl bg-[#e6f8eb] animate-pulse" />}>
            <CampusMapPicker
              campusId={campusId}
              selectedLocationName="Live device location"
              onUniversityDetected={onUniversityDetected}
              onSelectLocation={() => {}}
            />
          </Suspense>
        </section>
      </div>
    );
  }

  const confidenceScore = matchCase.confidenceScore || 0;
  const lostItem = matchCase.lostItem;
  const foundItem = matchCase.foundItem;
  const formatCreatedAt = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
  };

  return (
    <div className="w-full flex flex-col gap-6 py-6">
      <header className="flex flex-col gap-2">
        <button type="button" onClick={() => onNavigateToTab('explore')} className="self-start text-sm font-semibold text-[#414844]">← Return to Explore</button>
        <h1 className="text-3xl font-bold text-[#012d1d]">Potential match</h1>
        <p className="text-sm text-[#536057]">Reports {lostItem.reportCode} and {foundItem.reportCode} have a {confidenceScore}% match score.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        {[lostItem, foundItem].map((item) => <article key={item.id} className="rounded-2xl border border-[#d5e7da] bg-white p-5">
          <div className="text-xs font-bold uppercase text-[#536057]">{item.type === 'lost' ? 'Lost report' : 'Found report'} · {item.reportCode}</div>
          <h2 className="mt-2 text-xl font-bold text-[#012d1d]">{item.title}</h2>
          {item.imageUrl && <img src={item.imageUrl} alt={item.imageAlt || item.title} className="mt-4 h-48 w-full rounded-xl object-cover" />}
          <p className="mt-3 text-sm text-[#414844]">{item.description || 'No public description provided.'}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#536057]"><div><dt className="font-bold">Location</dt><dd>{item.locationName || 'Not provided'}</dd></div><div><dt className="font-bold">Reported</dt><dd>{formatCreatedAt(item.createdAt)}</dd></div></dl>
        </article>)}
      </section>
      <section className="rounded-2xl border border-[#d5e7da] bg-white p-5">
        <h2 className="text-lg font-bold text-[#012d1d]">Live location tracking</h2>
        <p className="mb-3 text-sm text-[#536057]">Use your device GPS to view your current position and identify the nearby university.</p>
        <Suspense fallback={<div className="h-80 animate-pulse rounded-xl bg-[#e6f8eb]" />}><CampusMapPicker campusId={campusId} selectedLocationName="Live device location" onUniversityDetected={onUniversityDetected} onSelectLocation={() => {}} /></Suspense>
      </section>
      {!claimSubmitted ? <form onSubmit={handleSubmitClaim} className="rounded-2xl border border-[#d5e7da] bg-white p-5">
        <h2 className="text-lg font-bold text-[#012d1d]">Submit an ownership claim</h2>
        <label htmlFor="uniqueMarks" className="mt-3 block text-sm font-semibold text-[#101f17]">Private details that verify ownership</label>
        <textarea id="uniqueMarks" value={covertMarkers} onChange={(event) => setCovertMarkers(event.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-[#d5e7da] p-3 text-sm" placeholder="Describe identifying details that are not in the public report." />
        <label className="mt-3 flex items-start gap-2 text-sm text-[#414844]"><input type="checkbox" checked={honorCodeChecked} onChange={(event) => setHonorCodeChecked(event.target.checked)} />I confirm this item belongs to me and the details are accurate.</label>
        {honorCodeError && <p role="alert" className="mt-2 text-sm text-red-700">{honorCodeError}</p>}
        <button type="submit" disabled={isSubmitting} className="mt-4 rounded-xl bg-[#012d1d] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{isSubmitting ? 'Submitting…' : 'Submit claim'}</button>
      </form> : <p className="rounded-xl border border-[#c1ecd4] bg-[#e6f8eb] p-4 text-sm text-[#012d1d]">Claim {claimReference} was submitted for review.</p>}
    </div>
  );
};
