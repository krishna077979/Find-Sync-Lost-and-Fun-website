import React, { useState } from 'react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCampusDesk: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  isOpen,
  onClose,
  onOpenCampusDesk,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Where are found items physically secured on campus?',
      a: 'All reported found items are transferred to designated secure custody bins. The primary hub is at the Caldwell Student Union Central Counter #2 (Open 24/7), with secondary pickup stations at the Main Library Circulation Desk and Athletics Center Concierge.',
    },
    {
      q: 'How long does Caldwell University hold unclaimed property?',
      a: 'Under Caldwell Institutional Property Regulation Sec. 4B, high-value and electronic items are held securely in custody bins for 60 calendar days. Standard personal items are held for 30 days before being responsibly donated or transferred according to state university property laws.',
    },
    {
      q: 'How does the AI similarity matching engine work?',
      a: 'FindSync compares four distinct data dimensions: 1) Category & asset taxonomy, 2) Visual appearance and colorway matching, 3) Time proximity window, and 4) Geospatial walking corridors between buildings and transit routes. Match percentages are algorithmic indicators to aid verification and do not constitute legal proof of ownership.',
    },
    {
      q: 'What do I need to present when picking up my property?',
      a: 'You must present an active Caldwell Student, Faculty, or Staff ID card (physical card or Mobile Campus Pass) and successfully verify the confidential covert identifiers (such as serial numbers, passcodes, internal bag contents, or specific scratches) logged in your claim.',
    },
    {
      q: 'What should I do if the AI suggests an incorrect match?',
      a: 'Simply click "Flag Incorrect Match" on the Potential Matches comparison page. You will be prompted to select the discrepancy reason, and our matching algorithm will exclude that pairing and continue monitoring future intakes.',
    },
  ];

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSent(true);
    setTimeout(() => {
      setTicketSubject('');
      setTicketMessage('');
      setTicketSent(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#012d1d]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#d5e7da] animate-in fade-in zoom-in-95 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#e0f2e6]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#c1ecd4] text-[#012d1d] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">help</span>
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#a23e18]">
                Campus Support &amp; Knowledge Base
              </span>
              <h2 className="text-[22px] font-bold text-[#012d1d]">Help, FAQs &amp; Property Guidance</h2>
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

        {/* Quick Contact Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[#ecfef1] border border-[#c1ecd4] flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase text-[#012d1d] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">emergency</span>
              24/7 Police Dispatch
            </span>
            <span className="text-[14px] font-mono font-bold text-[#101f17]">(555) 019-2833</span>
            <span className="text-[11px] text-[#414844]">Emergencies &amp; Urgent Lockup</span>
          </div>

          <div className="p-3 rounded-xl bg-[#ecfef1] border border-[#c1ecd4] flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase text-[#012d1d] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">desk</span>
              Central Desk Counter
            </span>
            <span className="text-[14px] font-mono font-bold text-[#101f17]">(555) 019-2834</span>
            <span className="text-[11px] text-[#414844]">Student Union Suite 110</span>
          </div>

          <div className="p-3 rounded-xl bg-[#ecfef1] border border-[#c1ecd4] flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase text-[#012d1d] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              Handover Hours
            </span>
            <span className="text-[14px] font-bold text-[#101f17]">24 Hours / 7 Days</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCampusDesk();
              }}
              className="text-[11px] text-[#a23e18] font-bold hover:underline text-left cursor-pointer"
            >
              View All 5 Desk Locations →
            </button>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[15px] font-bold text-[#012d1d] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">quiz</span>
            Frequently Asked Questions
          </h3>

          <div className="flex flex-col gap-2">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="border border-[#d5e7da] rounded-xl overflow-hidden bg-white shadow-xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full text-left p-3.5 flex items-center justify-between text-[13px] font-bold text-[#101f17] hover:bg-[#eef8f1] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined text-base text-[#414844]">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 text-[13px] text-[#414844] leading-relaxed border-t border-[#e0f2e6] bg-[#f7fdf9]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Direct Contact Form */}
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#f0f9f3] border border-[#c1ecd4]">
          <h3 className="text-[14px] font-bold text-[#012d1d] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">support_agent</span>
            Need Officer Assistance with a Specific Case?
          </h3>

          {ticketSent ? (
            <div className="p-3 bg-[#c1ecd4] rounded-lg text-[#002114] text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Inquiry dispatched to Officer Ramirez. An officer will reply to your Caldwell email shortly.</span>
            </div>
          ) : (
            <form onSubmit={handleSendTicket} className="flex flex-col gap-2.5">
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Case or Item Reference Number (e.g., #L-2049 or #F-1082)..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#d5e7da] bg-white focus:outline-none focus:ring-1 focus:ring-[#012d1d]"
              />
              <textarea
                required
                rows={2}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Describe your inquiry or request to transfer an item between campuses..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#d5e7da] bg-white focus:outline-none focus:ring-1 focus:ring-[#012d1d]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] cursor-pointer shadow-xs"
                >
                  Send Inquiry to Custody Desk
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
