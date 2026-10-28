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
              <span className="text-[18px] text-[#012d1d] font-bold tracking-tight">FindSync Campus Network</span>
            </div>
            <p className="text-[14px] text-[#414844] leading-relaxed">
              Location-based lost and found reports that help campus communities coordinate safe item handovers.
            </p>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-2">
            <span className="text-[14px] text-[#101f17] font-bold uppercase tracking-wider">
              Campus Handover Locations
            </span>
            <ul className="flex flex-col gap-1.5 text-[14px] text-[#414844]">
              <li className="flex items-center gap-1.5 hover:text-[#012d1d] cursor-pointer" onClick={onOpenCampusDesk}>
                <span className="text-[#a23e18]">•</span>
                <span>View available campus handover desks</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-[#012d1d] cursor-pointer" onClick={onOpenCampusDesk}>
                <span className="text-[#012d1d]">•</span>
                <span>Check selected campus locations</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-[#012d1d] cursor-pointer" onClick={onOpenCampusDesk}>
                <span className="text-[#012d1d]">•</span>
                <span>Use the map to find a nearby desk</span>
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
              © {new Date().getFullYear()} FindSync. Campus rules and handover procedures vary by location.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#414844] gap-2">
          <span>FindSync · Location-based lost and found support</span>
          <span className="font-semibold text-[#012d1d]">Confirm handover details with your campus</span>
        </div>
      </div>
    </footer>
  );
};
