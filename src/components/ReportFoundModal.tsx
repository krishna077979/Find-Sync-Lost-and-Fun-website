import React, { useState, useEffect, useMemo } from 'react';
import { Item, ItemCategory, CampusId, FacilitySector } from '../types';
import { CameraCaptureWidget } from './CameraCaptureWidget';
import { CampusMapPicker } from './CampusMapPicker';

interface ReportFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemFoundCreated: (newItem: Item) => void;
  items?: Item[];
}

export const ReportFoundModal: React.FC<ReportFoundModalProps> = ({
  isOpen,
  onClose,
  onItemFoundCreated,
  items = [],
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
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA5sM9hoasQMK3tLsLR2E8FlCPG1tVSleLKsBh5dpWEVGxChfvJ67nZ0nJ4QwykZ00w7ua-BUALdP5j22wm7Kn_BRbp-RckooLmDvSaV_y3QcbJ57StJhYJ8VG5coRGkRWaqYdMtJnPm269F8nxKrA2kuS8qf2KZ8AlKy_HP8j4QHFUv5JywapFVuovAeC5dXcwU10Jxzap2_bo1Rd8IP8zdQXtx91ohV7P5ASGH2z-iCLGd0iBMwk-cA'
  );
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [officerNotes, setOfficerNotes] = useState('Cushioned headband, powered off, stored in custody bin.');
  const [binNumber, setBinNumber] = useState(`BIN #E-${Math.floor(10 + Math.random() * 89)}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);

  // Check for saved draft on open
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('findsync_found_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.title) {
            setHasDraft(true);
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }, [isOpen]);

  // Duplicate item warning check
  const duplicateWarnings = useMemo(() => {
    if (!title.trim() || title.trim().length < 3) return [];
    const keywords = title.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    return items
      .filter((item) => {
        const itemText = `${item.title} ${item.description} ${item.brand || ''}`.toLowerCase();
        const matchesWord = keywords.some((k) => itemText.includes(k));
        const sameCat = item.category === category;
        return matchesWord && sameCat;
      })
      .slice(0, 2);
  }, [title, category, items]);

  if (!isOpen) return null;

  const handleSaveDraft = () => {
    const draftData = {
      title,
      category,
      campusId,
      facilitySector,
      locationName,
      shuttleLine,
      roomZone,
      colorway,
      description,
      officerNotes,
      binNumber,
      photoUrl,
      savedAt: new Date().toLocaleTimeString(),
    };
    localStorage.setItem('findsync_found_draft', JSON.stringify(draftData));
    setDraftNotice('Draft saved to local browser storage.');
    setTimeout(() => setDraftNotice(null), 3000);
  };

  const handleRestoreDraft = () => {
    const saved = localStorage.getItem('findsync_found_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.locationName) setLocationName(parsed.locationName);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.photoUrl) setPhotoUrl(parsed.photoUrl);
        setHasDraft(false);
        setDraftNotice('Draft successfully restored!');
        setTimeout(() => setDraftNotice(null), 3000);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('findsync_found_draft');
    setHasDraft(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please specify an item name.');
      return;
    }

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
          photoUrl ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA5sM9hoasQMK3tLsLR2E8FlCPG1tVSleLKsBh5dpWEVGxChfvJ67nZ0nJ4QwykZ00w7ua-BUALdP5j22wm7Kn_BRbp-RckooLmDvSaV_y3QcbJ57StJhYJ8VG5coRGkRWaqYdMtJnPm269F8nxKrA2kuS8qf2KZ8AlKy_HP8j4QHFUv5JywapFVuovAeC5dXcwU10Jxzap2_bo1Rd8IP8zdQXtx91ohV7P5ASGH2z-iCLGd0iBMwk-cA',
        imageAlt: title,
        imageTagLabel: 'Staff Intake Photograph',
        officerNotes,
        officerName: 'Staff Officer R. Ramirez (#ST-44)',
        createdAt: new Date().toISOString(),
      };

      // Clear draft on successful submit
      localStorage.removeItem('findsync_found_draft');
      onItemFoundCreated(newItem);
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#012d1d]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-[#d5e7da] animate-in fade-in zoom-in-95 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
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
            className="p-1 rounded-lg text-[#717973] hover:text-[#101f17] hover:bg-[#e0f2e6] cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Draft Restore Notification */}
        {hasDraft && (
          <div className="p-3 bg-[#e6f8eb] rounded-xl border border-[#c1ecd4] flex items-center justify-between text-xs font-semibold text-[#012d1d]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">restore_page</span>
              <span>Unfinished intake draft detected from a previous session.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="underline font-bold hover:text-[#1b4332]"
              >
                Restore Draft
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="text-[#a23e18] hover:underline"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {draftNotice && (
          <div className="p-2.5 bg-[#c1ecd4] rounded-lg text-[#002114] text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check</span>
            <span>{draftNotice}</span>
          </div>
        )}

        {/* Duplicate Warning Banner */}
        {duplicateWarnings.length > 0 && (
          <div className="p-3.5 bg-[#ffdbcf]/70 rounded-xl border border-[#fe8357]/50 text-[#390c00] text-xs flex flex-col gap-1.5 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-[#a23e18]">
              <span className="material-symbols-outlined text-base">warning</span>
              <span>Potential Duplicate Intake Alert</span>
            </div>
            <p className="leading-relaxed">
              A similar <strong>{duplicateWarnings[0].category}</strong> item is already registered in the system:
              {' '}<em>"{duplicateWarnings[0].title}"</em> at {duplicateWarnings[0].locationName} ({duplicateWarnings[0].reportCode}). Please verify before creating a duplicate entry.
            </p>
          </div>
        )}

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
                <option value="Books & Notes">Books &amp; Notes</option>
                <option value="Jewelry / Watch">Jewelry / Watch</option>
                <option value="Other Asset">Other Asset</option>
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

          {/* Camera Capture and Photo Attachment */}
          <div className="pt-1 pb-1">
            <CameraCaptureWidget
              currentPhotoUrl={photoUrl}
              onPhotoCaptured={(url) => setPhotoUrl(url)}
              onPhotoRemoved={() => setPhotoUrl(null)}
            />
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
                  } else if (sec === 'athletics') setLocationName('Caldwell Sports Arena & Gym');
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
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-[#101f17]">Building / Zone</label>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className="text-[11px] text-[#012d1d] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">pin_drop</span>
                  <span>{showMapPicker ? 'Hide Pin Map' : 'Drop Map Pin'}</span>
                </button>
              </div>
              <input
                type="text"
                required
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

          {/* Interactive Map Pin Accordion */}
          {showMapPicker && (
            <div className="p-3 bg-[#e6f8eb]/60 rounded-xl border border-[#c1ecd4]">
              <CampusMapPicker
                campusId={campusId}
                selectedLocationName={locationName}
                onSelectLocation={(name) => setLocationName(name)}
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-[#101f17]">Intake Officer Inspection Notes</label>
            <textarea
              rows={2}
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#e6f8eb] border border-[#c1ecd4] text-[12px] text-[#012d1d] flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            <span>FindSync algorithm will immediately run cross-checks against student loss reports.</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="text-xs text-[#012d1d] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>Save Unfinished Draft</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#e0f2e6] text-[#101f17] text-[13px] font-semibold hover:bg-[#d5e7da] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-[#012d1d] text-white text-[13px] font-bold hover:bg-[#1b4332] shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? 'Registering In Custody...' : 'Deposit to Custody Registry'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
