import React, { useState } from 'react';
import { Item, ItemCategory, CampusId, FacilitySector } from '../types';

interface ReportFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemFoundCreated: (newItem: Item) => void;
}

export const ReportFoundModal: React.FC<ReportFoundModalProps> = ({
  isOpen,
  onClose,
  onItemFoundCreated,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [campusId, setCampusId] = useState<CampusId>('main-campus');
  const [facilitySector, setFacilitySector] = useState<FacilitySector>('academic');
  const [locationName, setLocationName] = useState('Caldwell Main Library');
  const [shuttleLine, setShuttleLine] = useState('');
  const [roomZone, setRoomZone] = useState('2nd Floor Study Booth');
  const [colorway, setColorway] = useState('Matte Black');
  const [description, setDescription] = useState('');
  const [officerNotes, setOfficerNotes] = useState('Cushioned headband, powered off, stored in custody bin.');
  const [binNumber, setBinNumber] = useState(`BIN #E-${Math.floor(10 + Math.random() * 89)}`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newItem: Item = {
        id: `found-${Date.now()}`,
        reportCode: `#F-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'found',
        title: title || 'Turned-In Property',
        category,
        colorway,
        description: description || 'Property turned in at custody desk. Safe lockup active.',
        campusId,
        facilitySector,
        shuttleLine: facilitySector === 'transit' ? shuttleLine : undefined,
        locationName,
        roomZone,
        dateLostOrFound: 'Oct 14, 2024',
        timeString: 'Just now',
        status: 'in_custody',
        statusLabel: 'Found · In Safe Custody',
        binNumber,
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA5sM9hoasQMK3tLsLR2E8FlCPG1tVSleLKsBh5dpWEVGxChfvJ67nZ0nJ4QwykZ00w7ua-BUALdP5j22wm7Kn_BRbp-RckooLmDvSaV_y3QcbJ57StJhYJ8VG5coRGkRWaqYdMtJnPm269F8nxKrA2kuS8qf2KZ8AlKy_HP8j4QHFUv5JywapFVuovAeC5dXcwU10Jxzap2_bo1Rd8IP8zdQXtx91ohV7P5ASGH2z-iCLGd0iBMwk-cA',
        imageAlt: title,
        imageTagLabel: 'Staff Intake Photograph',
        officerNotes,
        officerName: 'Staff Officer R. Ramirez (#ST-44)',
        createdAt: new Date().toISOString(),
      };

      onItemFoundCreated(newItem);
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#012d1d]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#d5e7da] animate-in fade-in zoom-in-95 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-[#e0f2e6]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#c1ecd4] text-[#012d1d] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#012d1d]">
                Campus Custodial Intake
              </span>
              <h2 className="text-[20px] font-bold text-[#012d1d]">Report a Found Item</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#717973] hover:text-[#101f17] hover:bg-[#e0f2e6]"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-[#101f17]" htmlFor="found-title">
              Item Name / Description <span className="text-[#a23e18]">*</span>
            </label>
            <input
              id="found-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Wireless Over-Ear Headphones, Hydro Flask, Keys..."
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-[#101f17]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
              >
                <option value="Electronics">Electronics</option>
                <option value="Bags & Backpacks">Bags &amp; Backpacks</option>
                <option value="Keys & Badges">Keys &amp; Badges</option>
                <option value="Wallets & IDs">Wallets &amp; IDs</option>
                <option value="Personal Essentials">Personal Essentials</option>
                <option value="Clothing">Clothing</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-[#101f17]">Assigned Custody Bin</label>
              <input
                type="text"
                value={binNumber}
                onChange={(e) => setBinNumber(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#e6f8eb] border border-[#c1ecd4] text-[#012d1d] font-mono font-bold text-[14px]"
              />
            </div>
          </div>

          {/* Campus and Facility Sector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-[#101f17]">Campus Location</label>
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value as CampusId)}
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[13px]"
              >
                <option value="main-campus">Main Campus (Central Quad District)</option>
                <option value="downtown-medical">Downtown Health Sciences &amp; Medical</option>
                <option value="north-research">North Campus &amp; Tech Innovation Park</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-[#101f17]">Sector</label>
              <select
                value={facilitySector}
                onChange={(e) => {
                  const sec = e.target.value as FacilitySector;
                  setFacilitySector(sec);
                  if (sec === 'academic') setLocationName('Caldwell Main Library');
                  else if (sec === 'residence') setLocationName('South Tower Residence Hall');
                  else if (sec === 'transit') {
                    setLocationName('Campus Transit Shuttle Bus');
                    setShuttleLine('Blue Line Shuttle #12');
                  }
                  else if (sec === 'athletics') setLocationName('Caldwell Sports Arena & Gym');
                  else if (sec === 'student_life') setLocationName('Caldwell Student Union Desk');
                }}
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[13px]"
              >
                <option value="academic">Academic Buildings &amp; Libraries</option>
                <option value="residence">Residence Halls &amp; Dormitories</option>
                <option value="transit">Campus Transit &amp; Shuttles</option>
                <option value="athletics">Athletic Arenas &amp; Gyms</option>
                <option value="student_life">Student Union &amp; Dining</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-[#101f17]">Building / Route / Zone</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g., Birch Hall, Blue Line Shuttle #12, Sports Arena..."
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[14px]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-[#101f17]">Room / Seat / Locker</label>
              <input
                type="text"
                value={roomZone}
                onChange={(e) => setRoomZone(e.target.value)}
                placeholder="e.g., 2nd Floor Study Booth, Rear seat, Room 204..."
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[14px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-[#101f17]">Intake Officer Inspection Notes</label>
            <textarea
              rows={2}
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#e6f8eb] border border-[#c1ecd4] text-[12px] text-[#012d1d] flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            <span>FindSync algorithm will immediately run cross-checks against student loss reports.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#e0f2e6] text-[#101f17] text-[13px] font-semibold hover:bg-[#d5e7da]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-[#012d1d] text-white text-[13px] font-bold hover:bg-[#1b4332] shadow-sm flex items-center gap-1.5"
            >
              {isSubmitting ? 'Registering In Custody...' : 'Deposit to Custody Registry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
