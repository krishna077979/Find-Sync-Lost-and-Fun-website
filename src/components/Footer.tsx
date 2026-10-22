import React from 'react';

interface FooterProps {
  onOpenCampusDesk: () => void;
  onOpenHelp?: () => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCampusDesk,
  onOpenHelp,
  onOpenTerms,
  onOpenPrivacy,
}) => {
  return (
    <footer className="w-full bg-[#e6f8eb] mt-auto py-10 border-t border-[#d5e7da] text-[#101f17]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pb-8 border-b border-[#c1ecd4]">
          {/* Column 1 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#012d1d] text-2xl">verified_user</span>
              <span className="text-[18px] text-[#012d1d] font-bold tracking-tight">Campus Security &amp; Safety</span>
            </div>
            <p className="text-[14px] text-[#414844] leading-relaxed">
              In official partnership with Caldwell University Campus Police, Student Union Staff, and Facilities Operations.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[13px] font-semibold text-[#012d1d]">
              <span className="material-symbols-outlined text-sm text-[#a23e18]">call</span>
              <span>Campus Police 24/7 Dispatch: (555) 019-2833</span>
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-2">
            <span className="text-[14px] text-[#101f17] font-bold uppercase tracking-wider">
              Safe Handover Stations
            </span>
            <ul className="flex flex-col gap-1.5 text-[14px] text-[#414844]">
              <li className="flex items-center gap-1.5 hover:text-[#012d1d] cursor-pointer" onClick={onOpenCampusDesk}>
                <span className="text-[#a23e18]">•</span>
                <span>Student Union Front Desk (Open 24/7)</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-[#012d1d] cursor-pointer" onClick={onOpenCampusDesk}>
                <span className="text-[#012d1d]">•</span>
                <span>Main Campus Library Circulation Desk</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-[#012d1d] cursor-pointer" onClick={onOpenCampusDesk}>
                <span className="text-[#012d1d]">•</span>
                <span>Caldwell Health &amp; Athletics Center Concierge</span>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-2">
            <span className="text-[14px] text-[#101f17] font-bold uppercase tracking-wider">
              Compliance &amp; Guidance
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] font-semibold text-[#414844]">
              <button
                type="button"
                onClick={onOpenTerms}
                className="hover:text-[#012d1d] transition-colors underline cursor-pointer"
              >
                Lost Property Regulations
              </button>
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="hover:text-[#012d1d] transition-colors underline cursor-pointer"
              >
                Privacy Notice &amp; FERPA
              </button>
              <button
                type="button"
                onClick={onOpenHelp}
                className="hover:text-[#012d1d] transition-colors underline cursor-pointer"
              >
                Help &amp; FAQs
              </button>
            </div>
            <p className="text-[11px] text-[#414844] mt-2 leading-relaxed">
              © 2025 Caldwell University FindSync Initiative. All institutional property claims are logged under state university regulations.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#414844] gap-2">
          <span>FindSync Engine v4.2 · Secured with Institutional Zero-Knowledge Clue Encryption</span>
          <span className="font-semibold text-[#012d1d]">Caldwell University Public Safety</span>
        </div>
      </div>
    </footer>
  );
};
