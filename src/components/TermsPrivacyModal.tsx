import React, { useState } from 'react';

interface TermsPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'regulations';
}

export const TermsPrivacyModal: React.FC<TermsPrivacyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'regulations'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#012d1d]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#d5e7da] animate-in fade-in zoom-in-95 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#e0f2e6]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#c1ecd4] text-[#012d1d] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">gavel</span>
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#a23e18]">
                Institutional Policy &amp; Compliance
              </span>
              <h2 className="text-[20px] font-bold text-[#012d1d]">
                Terms of Use, Privacy &amp; Regulations
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#717973] hover:text-[#101f17] hover:bg-[#e0f2e6] cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#e0f2e6] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'text-[#414844] hover:bg-[#e0f2e6]'
            }`}
          >
            Privacy Notice &amp; FERPA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'text-[#414844] hover:bg-[#e0f2e6]'
            }`}
          >
            Terms of Use &amp; Honor Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('regulations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'regulations'
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'text-[#414844] hover:bg-[#e0f2e6]'
            }`}
          >
            Property Retention Regs (Sec. 4B)
          </button>
        </div>

        {/* Content based on Tab */}
        <div className="text-[13px] text-[#414844] leading-relaxed space-y-4">
          {activeTab === 'privacy' && (
            <>
              <div className="p-3 bg-[#e6f8eb] rounded-xl border border-[#c1ecd4] text-[#012d1d]">
                <h4 className="font-bold flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-base">lock</span>
                  Confidential Clue Protection Guarantee
                </h4>
                <p className="text-xs">
                  Covert identifiers (such as passwords, internal backpack contents, engraved names, or serial numbers) are strictly restricted from the public feed. Only sworn campus safety adjudicators can decrypt and view these fields during the verification phase.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#101f17] mb-1">1. Information Collection &amp; Purpose</h4>
                <p>
                  FindSync collects report descriptions, location tags, date/time approximations, and optional photographic attachments to support item recovery. Sign-in uses the provider configured for this deployment.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#101f17] mb-1">2. Family Educational Rights and Privacy Act (FERPA)</h4>
                <p>
                  Student contact information is never disclosed to finders or third parties without explicit authorization. Safe handovers occur strictly via university custody desks or official locker dropboxes.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#101f17] mb-1">3. Privacy Controls</h4>
                <p>
                  Users may toggle phone number masking and report anonymization directly within their account settings at any time.
                </p>
              </div>
            </>
          )}

          {activeTab === 'terms' && (
            <>
              <div className="p-3 bg-[#ffdbcf]/50 rounded-xl border border-[#fe8357]/40 text-[#390c00]">
                <h4 className="font-bold flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-base">verified</span>
                  Campus Code of Conduct
                </h4>
                <p className="text-xs">
                  False ownership claims may violate campus rules and can be referred to the relevant campus office.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#101f17] mb-1">1. Acceptance of Terms</h4>
                <p>
                  By reporting lost or found property, students, faculty, and campus visitors agree to provide accurate, honest, and verifiable information regarding custody and location.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#101f17] mb-1">2. Algorithm Similarity Scores</h4>
                <p>
                  FindSync AI match confidence scores indicate algorithmic visual, spatial, and temporal correlations. They do not constitute legal determinations of property ownership. Handover authorization requires affirmative review by Campus Safety personnel.
                </p>
              </div>
            </>
          )}

          {activeTab === 'regulations' && (
            <>
              <div>
                <h4 className="font-bold text-[#101f17] mb-1">Campus Lost Property Guidance</h4>
                <p>
                  All property found on university grounds, shuttle buses, academic buildings, or athletic facilities must be surrendered to an official custody desk within 24 hours of discovery.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-white rounded-lg border border-[#d5e7da]">
                  <span className="font-bold text-[#012d1d] block mb-1">High-Value Items (Electronics, Wallets, Jewelry)</span>
                  <p className="text-xs">Held in vault for <strong>60 calendar days</strong>. Unclaimed items undergo certified data wiping.</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#d5e7da]">
                  <span className="font-bold text-[#012d1d] block mb-1">Standard Items (Clothing, Books, Bottles)</span>
                  <p className="text-xs">Held for <strong>30 calendar days</strong> before donation to university community pantries.</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#e0f2e6]">
          <span className="text-[11px] text-[#717973]">Last Revised: October 2024 · Policy Ref #CP-REG-4B</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] cursor-pointer shadow-xs"
          >
            I Understand &amp; Agree
          </button>
        </div>
      </div>
    </div>
  );
};
