import React, { useState, useEffect, useMemo } from 'react';
import { Item, ItemCategory, ViewTab, CampusId, FacilitySector, ItemLocationCoordinates } from '../types';
import { CameraCaptureWidget } from './CameraCaptureWidget';
import { CampusMapPicker } from './CampusMapPicker';
import {
  getCampusConfigurations,
  getCampusById,
  CAMPUS_AREA_CATEGORIES,
  CampusAreaCategory,
  CampusLocationArea,
} from '../data/campusConfig';

interface ReportLostViewProps {
  initialCampusId?: CampusId;
  onReportCreated: (newItem: Item) => void;
  onNavigateToTab: (tab: ViewTab) => void;
  onNavigateToMatch: (caseId?: string) => void;
  items?: Item[];
}

export const ReportLostView: React.FC<ReportLostViewProps> = ({
  initialCampusId = 'sage-bhopal',
  onReportCreated,
  onNavigateToTab,
  onNavigateToMatch,
  items = [],
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [title, setTitle] = useState('MacBook Air M2 (Space Gray)');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('14-inch Space Gray M2 2023');
  const [colorway, setColorway] = useState('Matte Black');
  const [description, setDescription] = useState(
    'Minor hairline scuff on bottom casing near vent, matte finish, black silicone keyboard membrane installed.'
  );

  // Photo state
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD8TN1h31vRiYwKoKD-LlLEYTr8dpaQr7ifc3TqEFWL9EcCi-PyG2CCSayHNfWDjFnp3ffW8kJr8GMnmp9ZU8cyXj0k52r6nobBt0au-3rN25lnGfngZ3xEU-COQI7uIr-xaLGOVCBy9J1rjCSsecVIs_Bslu_BfLppkHPgLDDeLgznu8mPIS9eOyNrptk_HluwVzcEKmTw_g6ROj-VKkW056K_heJHbxT2cVx8ehiarqVrwjFw3froQQ'
  );

  // Campus & Configurable Location
  const allCampuses = getCampusConfigurations();
  const [campusId, setCampusId] = useState<CampusId>(
    initialCampusId === 'all-campuses' ? 'sage-bhopal' : initialCampusId
  );
  const currentCampusConfig = getCampusById(campusId);

  const [locationCategory, setLocationCategory] = useState<CampusAreaCategory | 'all'>('academic');
  const [building, setBuilding] = useState('Central University Library');
  const [isOtherLocation, setIsOtherLocation] = useState(false);
  const [otherLocationDescription, setOtherLocationDescription] = useState('');
  const [facilitySector, setFacilitySector] = useState<FacilitySector>('academic');
  const [dateLost, setDateLost] = useState('2024-10-14');
  const [timeBracket, setTimeBracket] = useState('Midday (11:30 AM – 02:00 PM)');
  const [shuttleLine, setShuttleLine] = useState('Campus Transit Shuttle Bus');
  const [roomZone, setRoomZone] = useState('Reading Hall 2, near circulation counter');
  const [pinCoordinates, setPinCoordinates] = useState<string | null>(
    'Pin: Central University Library (LIB-CENTRAL) · 23.1787° N, 77.4922° E'
  );
  const [locationCoordinates, setLocationCoordinates] = useState<ItemLocationCoordinates | null>({
    lat: 23.1787,
    lng: 77.4922,
    formatted: '23.1787° N, 77.4922° E',
  });

  // Confidential Clues
  const [clue1, setClue1] = useState('Small holographic Yosemite sticker on base corner; serial ends in 9482');
  const [clue2, setClue2] = useState('Interior front sleeve contains Caldwell transit card + orange earplug case');

  // Alerts
  const [emailAlert, setEmailAlert] = useState(true);
  const [smsAlert, setSmsAlert] = useState(true);
  const [maskContactInfo, setMaskContactInfo] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Check for saved draft on mount
  useEffect(() => {
    const saved = localStorage.getItem('findsync_lost_draft');
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
  }, []);

  // Real-time duplicate detection
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

  const categories: { label: ItemCategory; icon: string }[] = [
    { label: 'Electronics', icon: 'laptop_chromebook' },
    { label: 'Bags & Backpacks', icon: 'backpack' },
    { label: 'Clothing', icon: 'apparel' },
    { label: 'Wallets & IDs', icon: 'account_balance_wallet' },
    { label: 'Keys & Badges', icon: 'vpn_key' },
    { label: 'Books & Notes', icon: 'menu_book' },
    { label: 'Jewelry / Watch', icon: 'watch' },
    { label: 'Personal Essentials', icon: 'sanitizer' },
    { label: 'Other Asset', icon: 'interests' },
  ];

  const colorways = [
    { label: 'Matte Black', hex: '#18181b' },
    { label: 'Forest Green', hex: '#1b4332' },
    { label: 'Terracotta', hex: '#c85a32' },
    { label: 'Navy Blue', hex: '#1e3a8a' },
    { label: 'Silver / Gray', hex: '#e2e8f0' },
    { label: 'White / Off-White', hex: '#ffffff' },
    { label: 'Multicolor', hex: 'linear' },
  ];

  const handleSaveDraft = () => {
    const draftData = {
      title,
      category,
      brand,
      model,
      colorway,
      description,
      campusId,
      facilitySector,
      dateLost,
      timeBracket,
      building,
      shuttleLine,
      roomZone,
      pinCoordinates,
      clue1,
      clue2,
      photoUrl,
      savedAt: new Date().toLocaleTimeString(),
    };
    localStorage.setItem('findsync_lost_draft', JSON.stringify(draftData));
    setDraftNotice('Progress saved! You can resume filing this report anytime.');
    setTimeout(() => setDraftNotice(null), 3500);
  };

  const handleRestoreDraft = () => {
    const saved = localStorage.getItem('findsync_lost_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.brand) setBrand(parsed.brand);
        if (parsed.model) setModel(parsed.model);
        if (parsed.colorway) setColorway(parsed.colorway);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.building) setBuilding(parsed.building);
        if (parsed.roomZone) setRoomZone(parsed.roomZone);
        if (parsed.clue1) setClue1(parsed.clue1);
        if (parsed.clue2) setClue2(parsed.clue2);
        if (parsed.photoUrl) setPhotoUrl(parsed.photoUrl);
        setHasDraft(false);
        setDraftNotice('Draft successfully restored into form.');
        setTimeout(() => setDraftNotice(null), 3500);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('findsync_lost_draft');
    setHasDraft(false);
  };

  const validateStep = (step: number): boolean => {
    setValidationError(null);
    if (step === 1) {
      if (!title.trim()) {
        setValidationError('Please enter a clear item title before proceeding.');
        return false;
      }
    }
    if (step === 2) {
      if (isOtherLocation) {
        if (!otherLocationDescription.trim()) {
          setValidationError('Please provide a description of the specific campus location.');
          return false;
        }
      } else {
        if (!building.trim()) {
          setValidationError('Please select or pin the campus building where the item was lost.');
          return false;
        }
      }
    }
    if (step === 3) {
      if (!clue1.trim() && !clue2.trim()) {
        setValidationError('At least one confidential clue is required for ownership verification.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setValidationError(null);
    setActiveStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const resolvedLocationName = isOtherLocation ? otherLocationDescription : building;
      const newItem: Item = {
        id: `lost-${Date.now()}`,
        reportCode: `#LR-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'lost',
        title: title || 'Lost Asset',
        category,
        brand,
        model,
        colorway,
        description,
        campusId,
        campusName: currentCampusConfig.name,
        buildingArea: resolvedLocationName,
        locationCategory: isOtherLocation ? 'other' : locationCategory,
        isOtherLocation,
        otherLocationDescription: isOtherLocation ? otherLocationDescription : undefined,
        locationCoordinates: locationCoordinates || undefined,
        facilitySector,
        shuttleLine: facilitySector === 'transit' ? shuttleLine : undefined,
        locationName: resolvedLocationName,
        roomZone: pinCoordinates ? `${roomZone} (${pinCoordinates})` : roomZone,
        dateLostOrFound: 'Today',
        timeString: 'Just now',
        status: 'active_search',
        statusLabel: 'Active Searching',
        imageUrl:
          photoUrl ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuD8TN1h31vRiYwKoKD-LlLEYTr8dpaQr7ifc3TqEFWL9EcCi-PyG2CCSayHNfWDjFnp3ffW8kJr8GMnmp9ZU8cyXj0k52r6nobBt0au-3rN25lnGfngZ3xEU-COQI7uIr-xaLGOVCBy9J1rjCSsecVIs_Bslu_BfLppkHPgLDDeLgznu8mPIS9eOyNrptk_HluwVzcEKmTw_g6ROj-VKkW056K_heJHbxT2cVx8ehiarqVrwjFw3froQQ',
        imageAlt: title,
        ownerName: 'Maya Lin',
        ownerId: '#USR-9102-MAYAL',
        confidentialClues: {
          uniqueMark: clue1,
          internalContents: clue2,
        },
        createdAt: new Date().toISOString(),
      };

      // Discard draft on successful submit
      localStorage.removeItem('findsync_lost_draft');
      onReportCreated(newItem);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
    }, 1000);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-[#414844]">
            <button
              type="button"
              onClick={() => onNavigateToTab('explore')}
              className="hover:text-[#012d1d] cursor-pointer transition-colors"
            >
              FindSync
            </button>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-[#a23e18] font-bold">Report Lost Item</span>
          </div>
          <h1 className="text-[28px] md:text-[34px] font-bold text-[#012d1d] tracking-tight">
            Report a Lost Item
          </h1>
          <p className="text-[15px] text-[#414844] leading-relaxed">
            Provide accurate details to help our campus community and smart matching engine locate your belongings quickly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#d5e7da] text-[#012d1d] text-xs font-bold hover:bg-[#e6f8eb] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>Save Draft</span>
          </button>

          <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-xl shadow-xs border border-[#d5e7da] shrink-0">
            <span className="material-symbols-outlined text-[#012d1d] text-xl">encrypted</span>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#012d1d] font-bold">Encrypted Case Vault</span>
              <span className="text-[10px] text-[#414844] font-mono">Institutional ID: #CP-89241</span>
            </div>
          </div>
        </div>
      </div>

      {/* Draft Notification Banner */}
      {hasDraft && (
        <div className="p-3.5 bg-[#e6f8eb] rounded-xl border border-[#c1ecd4] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-[#012d1d] shadow-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">restore_page</span>
            <span>You have an unfinished lost item draft saved in this browser.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-3 py-1 rounded-lg bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] cursor-pointer"
            >
              Resume Saved Draft
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="text-[#a23e18] hover:underline font-bold cursor-pointer"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {draftNotice && (
        <div className="p-3 bg-[#c1ecd4] rounded-xl text-[#002114] text-xs font-bold flex items-center gap-2 border border-[#85f8c4] animate-in fade-in">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{draftNotice}</span>
        </div>
      )}

      {/* Real-Time Duplicate Warning Alert */}
      {duplicateWarnings.length > 0 && (
        <div className="p-4 bg-[#ffdbcf]/80 rounded-xl border border-[#fe8357]/60 text-[#390c00] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#a23e18] text-xl shrink-0 mt-0.5">warning</span>
            <div>
              <h4 className="text-xs font-bold text-[#a23e18] uppercase tracking-wider">
                Potential Duplicate Report Warning
              </h4>
              <p className="text-xs text-[#390c00] mt-0.5">
                A similar item already exists in the system:{' '}
                <strong>"{duplicateWarnings[0].title}"</strong> reported at {duplicateWarnings[0].locationName} ({duplicateWarnings[0].reportCode}). Check to prevent filing duplicate campus records.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToMatch('Case #PM-8429')}
            className="px-3.5 py-1.5 rounded-lg bg-[#a23e18] text-white text-xs font-bold hover:bg-[#853011] shrink-0 cursor-pointer shadow-xs"
          >
            Review Potential Match →
          </button>
        </div>
      )}

      {/* Stepper Navigation */}
      <div className="w-full bg-white rounded-xl p-3 shadow-xs border border-[#d5e7da]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all text-left cursor-pointer ${
              activeStep === 1
                ? 'bg-[#1b4332] text-white shadow-xs'
                : 'bg-[#e6f8eb] text-[#101f17] hover:bg-[#dbede0]'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full text-[12px] flex items-center justify-center font-bold ${
                activeStep === 1 ? 'bg-white text-[#012d1d]' : 'bg-[#c1ecd4] text-[#012d1d]'
              }`}
            >
              1
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold leading-tight truncate">Item Specifics</span>
              <span className={`text-[11px] leading-none ${activeStep === 1 ? 'text-[#c1ecd4]' : 'text-[#414844]'}`}>
                Category &amp; Photo
              </span>
            </div>
          </button>

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => {
              if (validateStep(1)) setActiveStep(2);
            }}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all text-left cursor-pointer ${
              activeStep === 2
                ? 'bg-[#1b4332] text-white shadow-xs'
                : 'bg-[#e6f8eb] text-[#101f17] hover:bg-[#dbede0]'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full text-[12px] flex items-center justify-center font-bold ${
                activeStep === 2 ? 'bg-white text-[#012d1d]' : 'bg-[#d5e7da] text-[#414844]'
              }`}
            >
              2
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold leading-tight truncate">Campus Location</span>
              <span className={`text-[11px] leading-none ${activeStep === 2 ? 'text-[#c1ecd4]' : 'text-[#414844]'}`}>
                Building &amp; Pin
              </span>
            </div>
          </button>

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => {
              if (validateStep(1) && validateStep(2)) setActiveStep(3);
            }}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all text-left cursor-pointer ${
              activeStep === 3
                ? 'bg-[#1b4332] text-white shadow-xs'
                : 'bg-[#e6f8eb] text-[#101f17] hover:bg-[#dbede0]'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full text-[12px] flex items-center justify-center font-bold ${
                activeStep === 3 ? 'bg-white text-[#012d1d]' : 'bg-[#ffdbcf] text-[#a23e18]'
              }`}
            >
              3
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-bold leading-tight truncate">Private Clues</span>
                <span className="material-symbols-outlined text-xs">lock</span>
              </div>
              <span className={`text-[11px] leading-none ${activeStep === 3 ? 'text-[#c1ecd4]' : 'text-[#a23e18]'}`}>
                Crucial for Claims
              </span>
            </div>
          </button>

          {/* Step 4 */}
          <button
            type="button"
            onClick={() => {
              if (validateStep(1) && validateStep(2) && validateStep(3)) setActiveStep(4);
            }}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all text-left cursor-pointer ${
              activeStep === 4
                ? 'bg-[#1b4332] text-white shadow-xs'
                : 'bg-[#e6f8eb] text-[#101f17] hover:bg-[#dbede0]'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full text-[12px] flex items-center justify-center font-bold ${
                activeStep === 4 ? 'bg-white text-[#012d1d]' : 'bg-[#d5e7da] text-[#414844]'
              }`}
            >
              4
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold leading-tight truncate">Review &amp; Submit</span>
              <span className={`text-[11px] leading-none ${activeStep === 4 ? 'text-[#c1ecd4]' : 'text-[#414844]'}`}>
                Final Verification
              </span>
            </div>
          </button>
        </div>
      </div>

      {validationError && (
        <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold rounded-xl flex items-center gap-2 border border-[#ffb4ab]">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* STEP 1: Item Specifics & Camera Photo */}
            {activeStep === 1 && (
              <div className="flex flex-col gap-6 animate-in fade-in">
                <section className="bg-white rounded-xl p-6 shadow-sm border border-[#d5e7da] flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg bg-[#e0f2e6] text-[#012d1d] flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-xl">category</span>
                      </span>
                      <div>
                        <h2 className="text-[18px] font-bold text-[#012d1d]">1. Item Identification</h2>
                        <p className="text-[13px] text-[#414844]">General physical specifications to run our campus matching engine.</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#a23e18] bg-[#ffdbcf] px-2.5 py-1 rounded-full font-bold">
                      Required
                    </span>
                  </div>

                  {/* Title */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] text-[#101f17] font-semibold flex justify-between" htmlFor="item-title">
                      <span>Item Title or Short Name <span className="text-[#a23e18]">*</span></span>
                      <span className="text-[#717973] font-normal text-[11px]">Max 70 chars</span>
                    </label>
                    <input
                      id="item-title"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Hydro Flask 32oz, MacBook Air M2, Leather Wallet"
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] placeholder:text-[#717973] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                    />
                  </div>

                  {/* Category */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] text-[#101f17] font-semibold">Category Classification</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {categories.map((cat) => {
                        const isSelected = category === cat.label;
                        return (
                          <button
                            key={cat.label}
                            type="button"
                            onClick={() => setCategory(cat.label)}
                            className={`flex items-center gap-2 p-2.5 rounded-lg text-[13px] font-semibold transition-all text-left cursor-pointer ${
                              isSelected
                                ? 'bg-[#1b4332] text-white shadow-xs'
                                : 'bg-[#e6f8eb] text-[#101f17] hover:bg-[#dbede0] border border-[#c1ecd4]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                            <span className="truncate">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Photo Capture & Upload Area - Placed immediately after Title and Category */}
                  <div className="pt-2 pb-1 border-t border-[#e0f2e6]">
                    <CameraCaptureWidget
                      currentPhotoUrl={photoUrl}
                      onPhotoCaptured={(url) => setPhotoUrl(url)}
                      onPhotoRemoved={() => setPhotoUrl(null)}
                    />
                  </div>

                  {/* Brand & Model */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] text-[#101f17] font-semibold" htmlFor="brand-input">
                        Primary Brand / Manufacturer
                      </label>
                      <input
                        id="brand-input"
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="e.g., Apple, Patagonia, Sony"
                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] placeholder:text-[#717973] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] text-[#101f17] font-semibold" htmlFor="model-input">
                        Model / Variant
                      </label>
                      <input
                        id="model-input"
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="e.g., 14-inch Space Gray M2 2023"
                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] placeholder:text-[#717973] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                      />
                    </div>
                  </div>

                  {/* Colorway Chips */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] text-[#101f17] font-semibold">Primary Colorway</label>
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {colorways.map((c) => {
                        const isSelected = colorway === c.label;
                        return (
                          <button
                            key={c.label}
                            type="button"
                            onClick={() => setColorway(c.label)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#1b4332] text-white shadow-xs'
                                : 'bg-[#e6f8eb] text-[#101f17] hover:bg-[#dbede0] border border-[#c1ecd4]'
                            }`}
                          >
                            {c.hex === 'linear' ? (
                              <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400" />
                            ) : (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/10"
                                style={{ backgroundColor: c.hex }}
                              />
                            )}
                            <span>{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Physical Description */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] text-[#101f17] font-semibold flex justify-between" htmlFor="desc-input">
                      <span>Public Physical Description</span>
                      <span className="text-[#717973] font-normal text-[11px]">Visible on campus feed</span>
                    </label>
                    <textarea
                      id="desc-input"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide visible physical details (e.g., minor scuff on front cover, transparent silicone case, woven red cord attached)..."
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] placeholder:text-[#717973] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                    />
                  </div>
                </section>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 rounded-xl bg-[#012d1d] text-white text-sm font-bold hover:bg-[#1b4332] flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Continue to Campus Location</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Time & Campus Location with Map Pin */}
            {activeStep === 2 && (
              <div className="flex flex-col gap-6 animate-in fade-in">
                <section className="bg-white rounded-xl p-6 shadow-sm border border-[#d5e7da] flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg bg-[#e0f2e6] text-[#012d1d] flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-xl">pin_drop</span>
                      </span>
                      <div>
                        <h2 className="text-[18px] font-bold text-[#012d1d]">2. Time &amp; Campus Location</h2>
                        <p className="text-[13px] text-[#414844]">Specify where and when you last remember having the possession.</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#a23e18] bg-[#ffdbcf] px-2.5 py-1 rounded-full font-bold">
                      Required
                    </span>
                  </div>

                  {/* Time Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] text-[#101f17] font-semibold" htmlFor="date-lost">
                        Estimated Date Lost <span className="text-[#a23e18]">*</span>
                      </label>
                      <input
                        id="date-lost"
                        type="date"
                        required
                        value={dateLost}
                        onChange={(e) => setDateLost(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] text-[#101f17] font-semibold" htmlFor="time-bracket">
                        Approximate Time Window
                      </label>
                      <select
                        id="time-bracket"
                        value={timeBracket}
                        onChange={(e) => setTimeBracket(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d] cursor-pointer"
                      >
                        <option>Morning (08:00 AM – 11:30 AM)</option>
                        <option>Midday (11:30 AM – 02:00 PM)</option>
                        <option>Afternoon (02:00 PM – 05:00 PM)</option>
                        <option>Evening / Night (05:00 PM – 10:00 PM)</option>
                        <option>Uncertain / Late Night</option>
                      </select>
                    </div>
                  </div>

                  {/* Campus Selection & Category Filter */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] text-[#101f17] font-semibold flex items-center justify-between">
                        <span>Campus <span className="text-[#a23e18]">*</span></span>
                        <span className="text-[11px] text-[#012d1d] font-bold bg-[#e6f8eb] px-2 py-0.5 rounded-md">
                          {currentCampusConfig.shortCode}
                        </span>
                      </label>
                      <select
                        value={campusId}
                        onChange={(e) => {
                          const newId = e.target.value as CampusId;
                          setCampusId(newId);
                          const cfg = getCampusById(newId);
                          if (cfg.areas && cfg.areas.length > 0) {
                            setBuilding(cfg.areas[0].name);
                            setLocationCategory(cfg.areas[0].category);
                            setIsOtherLocation(false);
                            const coordStr = `${cfg.areas[0].lat.toFixed(4)}° N, ${cfg.areas[0].lng.toFixed(4)}° E`;
                            setLocationCoordinates({
                              lat: cfg.areas[0].lat,
                              lng: cfg.areas[0].lng,
                              formatted: coordStr,
                            });
                            setPinCoordinates(`Pin: ${cfg.areas[0].name} (${cfg.areas[0].code}) · ${coordStr}`);
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d] cursor-pointer"
                      >
                        {allCampuses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.shortCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] text-[#101f17] font-semibold">Location Category</label>
                      <select
                        value={locationCategory}
                        onChange={(e) => {
                          const cat = e.target.value as CampusAreaCategory | 'all';
                          setLocationCategory(cat);
                          if (cat === 'other') {
                            setIsOtherLocation(true);
                          } else {
                            setIsOtherLocation(false);
                            const matching = cat === 'all'
                              ? currentCampusConfig.areas
                              : currentCampusConfig.areas.filter((a) => a.category === cat);
                            if (matching.length > 0) {
                              setBuilding(matching[0].name);
                              const coordStr = `${matching[0].lat.toFixed(4)}° N, ${matching[0].lng.toFixed(4)}° E`;
                              setLocationCoordinates({
                                lat: matching[0].lat,
                                lng: matching[0].lng,
                                formatted: coordStr,
                              });
                              setPinCoordinates(`Pin: ${matching[0].name} (${matching[0].code}) · ${coordStr}`);
                            }
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d] cursor-pointer"
                      >
                        <option value="all">All Categories (Show All Areas)</option>
                        {CAMPUS_AREA_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Building / Campus Area Dropdown & Specific Spot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] text-[#101f17] font-semibold flex items-center justify-between" htmlFor="building-select">
                        <span>Building / Campus Area <span className="text-[#a23e18]">*</span></span>
                        {isOtherLocation && (
                          <span className="text-[11px] text-[#a23e18] font-bold bg-[#ffdbcf] px-2 py-0.5 rounded-full">
                            Custom Location Active
                          </span>
                        )}
                      </label>
                      <select
                        id="building-select"
                        value={isOtherLocation ? '__other__' : building}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__other__') {
                            setIsOtherLocation(true);
                          } else {
                            setIsOtherLocation(false);
                            setBuilding(val);
                            const matched = currentCampusConfig.areas.find((a) => a.name === val);
                            if (matched) {
                              const coordStr = `${matched.lat.toFixed(4)}° N, ${matched.lng.toFixed(4)}° E`;
                              setLocationCoordinates({
                                lat: matched.lat,
                                lng: matched.lng,
                                formatted: coordStr,
                              });
                              setPinCoordinates(`Pin: ${matched.name} (${matched.code}) · ${coordStr}`);
                              setLocationCategory(matched.category);
                            }
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d] cursor-pointer"
                      >
                        {(locationCategory === 'all'
                          ? currentCampusConfig.areas
                          : currentCampusConfig.areas.filter((a) => a.category === locationCategory)
                        ).map((a) => (
                          <option key={a.id} value={a.name}>
                            {a.name} ({a.code})
                          </option>
                        ))}
                        <option value="__other__">Other (Enter custom campus location)</option>
                      </select>
                    </div>

                    {isOtherLocation ? (
                      <div className="flex flex-col gap-1 animate-in fade-in">
                        <label className="text-[13px] text-[#101f17] font-semibold flex justify-between" htmlFor="other-desc-input">
                          <span>Custom Location Description <span className="text-[#a23e18]">*</span></span>
                          <span className="text-[11px] text-[#a23e18] font-semibold">Describe spot</span>
                        </label>
                        <input
                          id="other-desc-input"
                          type="text"
                          required
                          value={otherLocationDescription}
                          onChange={(e) => setOtherLocationDescription(e.target.value)}
                          placeholder="e.g., Near fountain in Central Quad, behind canteen lawn..."
                          className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#a23e18] text-[#101f17] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#a23e18]"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <label className="text-[13px] text-[#101f17] font-semibold" htmlFor="room-input">
                          Specific Room / Pod / Seat
                        </label>
                        <input
                          id="room-input"
                          type="text"
                          value={roomZone}
                          onChange={(e) => setRoomZone(e.target.value)}
                          placeholder="e.g., 3rd Floor Quiet Study Pod #12, Table near window"
                          className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                        />
                      </div>
                    )}
                  </div>

                  {/* If Other location description is chosen, also provide optional sub-spot input */}
                  {isOtherLocation && (
                    <div className="flex flex-col gap-1 animate-in fade-in">
                      <label className="text-[13px] text-[#101f17] font-semibold" htmlFor="room-input-other">
                        Specific Point / Landmark Reference (Optional)
                      </label>
                      <input
                        id="room-input-other"
                        type="text"
                        value={roomZone}
                        onChange={(e) => setRoomZone(e.target.value)}
                        placeholder="e.g., Near column #4, north entrance walkway, bicycle stand..."
                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                      />
                    </div>
                  )}

                  {/* Interactive Map Pin Selector */}
                  <div className="pt-2">
                    <CampusMapPicker
                      campusId={campusId}
                      selectedLocationName={isOtherLocation ? otherLocationDescription : building}
                      onSelectLocation={(name, pinCoord, coordsObj, areaObj) => {
                        if (areaObj) {
                          setBuilding(name);
                          setIsOtherLocation(false);
                          setLocationCategory(areaObj.category);
                        } else {
                          if (!isOtherLocation) {
                            setBuilding(name);
                          }
                        }
                        if (pinCoord) setPinCoordinates(pinCoord);
                        if (coordsObj) setLocationCoordinates(coordsObj);
                      }}
                    />
                  </div>
                </section>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-2 rounded-xl bg-white border border-[#d5e7da] text-[#101f17] text-xs font-bold hover:bg-[#e6f8eb] flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 rounded-xl bg-[#012d1d] text-white text-sm font-bold hover:bg-[#1b4332] flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Continue to Private Clues</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Confidential Ownership Proof */}
            {activeStep === 3 && (
              <div className="flex flex-col gap-6 animate-in fade-in">
                <section className="bg-white rounded-xl p-6 shadow-sm border border-[#d5e7da] flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg bg-[#ffdbcf] text-[#a23e18] flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-xl">lock</span>
                      </span>
                      <div>
                        <h2 className="text-[18px] font-bold text-[#012d1d]">3. Private Verification Clues</h2>
                        <p className="text-[13px] text-[#414844]">
                          Covert markers hidden from public catalogues. Used by desk officers to authenticate claims.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#a23e18] bg-[#ffdbcf] px-2.5 py-1 rounded-full font-bold">
                      Encrypted
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#e6f8eb] rounded-xl border border-[#c1ecd4] text-xs text-[#012d1d] flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">verified_user</span>
                    <span>
                      These details are strictly encrypted and NEVER visible on the public lost-and-found board.
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] text-[#101f17] font-semibold flex justify-between" htmlFor="clue-1">
                      <span>Unique Covert Markings / Serial Number / Passcode Clue <span className="text-[#a23e18]">*</span></span>
                    </label>
                    <textarea
                      id="clue-1"
                      rows={2}
                      required
                      value={clue1}
                      onChange={(e) => setClue1(e.target.value)}
                      placeholder="e.g., Serial number ends in 9482, engraved initials M.L. on hinge, lock screen wallpaper is a golden retriever..."
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] text-[#101f17] font-semibold" htmlFor="clue-2">
                      Internal Bag / Case Contents
                    </label>
                    <textarea
                      id="clue-2"
                      rows={2}
                      value={clue2}
                      onChange={(e) => setClue2(e.target.value)}
                      placeholder="e.g., Inside zippered pocket: orange earplug case, Caldwell transit card, student ID..."
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#e0f2e6]">
                    <input
                      type="checkbox"
                      id="mask-contact"
                      checked={maskContactInfo}
                      onChange={(e) => setMaskContactInfo(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1b4332] accent-[#1b4332]"
                    />
                    <label htmlFor="mask-contact" className="text-xs font-semibold text-[#101f17] cursor-pointer">
                      Mask my phone and personal email on public reports (Only visible to Campus Safety desk officers)
                    </label>
                  </div>
                </section>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-2 rounded-xl bg-white border border-[#d5e7da] text-[#101f17] text-xs font-bold hover:bg-[#e6f8eb] flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 rounded-xl bg-[#012d1d] text-white text-sm font-bold hover:bg-[#1b4332] flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Review Report Summary</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Review & Final Submission */}
            {activeStep === 4 && (
              <div className="flex flex-col gap-6 animate-in fade-in">
                <section className="bg-white rounded-xl p-6 shadow-sm border border-[#d5e7da] flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg bg-[#e0f2e6] text-[#012d1d] flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-xl">fact_check</span>
                      </span>
                      <div>
                        <h2 className="text-[18px] font-bold text-[#012d1d]">4. Summary &amp; Attestation</h2>
                        <p className="text-[13px] text-[#414844]">Confirm your details before activating matching across all campuses.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#101f17]">
                    <div className="p-3.5 bg-[#f7fdf9] rounded-xl border border-[#d5e7da] flex flex-col gap-1.5">
                      <span className="font-bold text-[#012d1d] text-sm">{title}</span>
                      <p><strong>Category:</strong> {category} · {brand} {model}</p>
                      <p><strong>Color:</strong> {colorway}</p>
                      <p><strong>Description:</strong> {description}</p>
                    </div>

                    <div className="p-3.5 bg-[#f7fdf9] rounded-xl border border-[#d5e7da] flex flex-col gap-1.5">
                      <span className="font-bold text-[#012d1d] text-sm">Campus Location &amp; Window</span>
                      <p><strong>Campus:</strong> {currentCampusConfig.name} ({currentCampusConfig.shortCode})</p>
                      <p><strong>Area / Building:</strong> {isOtherLocation ? `${otherLocationDescription} (Custom Location)` : building}</p>
                      <p><strong>Category:</strong> {CAMPUS_AREA_CATEGORIES.find((c) => c.id === locationCategory)?.label || locationCategory}</p>
                      <p><strong>Room / Specific Spot:</strong> {roomZone || 'Not specified'}</p>
                      <p><strong>Coordinates:</strong> {locationCoordinates?.formatted || 'Verified campus center'}</p>
                      <p><strong>Date &amp; Time:</strong> {dateLost} ({timeBracket})</p>
                    </div>
                  </div>

                  {photoUrl && (
                    <div className="flex items-center gap-3 p-3 bg-[#e6f8eb] rounded-xl border border-[#c1ecd4]">
                      <img src={photoUrl} alt="Attached" className="w-16 h-12 object-cover rounded-lg" />
                      <div className="text-xs">
                        <span className="font-bold text-[#012d1d] block">Intake Reference Photo Attached</span>
                        <span className="text-[#414844]">Assigned for automated visual feature vectorization</span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-[#e6f8eb] border border-[#c1ecd4] flex items-start gap-2.5 text-[#414844]">
                    <span className="material-symbols-outlined text-base mt-0.5 text-[#012d1d]">policy</span>
                    <p className="text-[11px] leading-relaxed">
                      By submitting this institutional claim, you affirm under the Caldwell University Academic &amp; Community Honor Code that you are the lawful owner or authorized representative of the stated property.
                    </p>
                  </div>
                </section>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-2 rounded-xl bg-white border border-[#d5e7da] text-[#101f17] text-xs font-bold hover:bg-[#e6f8eb] flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-xl bg-[#012d1d] text-white text-sm font-bold hover:bg-[#1b4332] flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Broadcasting to Campus Desks...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Lost Item Report</span>
                        <span className="material-symbols-outlined text-base">send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Success Toast */}
          {submittedSuccess && (
            <div className="p-6 rounded-2xl bg-[#c1ecd4] border border-[#85f8c4] flex flex-col gap-3 animate-in fade-in shadow-md">
              <div className="flex items-center gap-2.5 text-[#012d1d]">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
                <span className="text-[18px] font-bold">Lost Report Active &amp; Synced!</span>
              </div>
              <p className="text-[13px] text-[#274e3d] leading-relaxed">
                Case <strong>#LR-8821</strong> is actively monitored by the Caldwell automated matching engine. We found 1 high-probability potential match turned in at the Student Union Desk.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToMatch('Case #PM-8429')}
                  className="px-5 py-2.5 rounded-xl bg-[#012d1d] text-white text-[13px] font-bold hover:bg-[#1b4332] shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>View Potential Match (86%)</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToTab('my-items')}
                  className="px-5 py-2.5 rounded-xl bg-white text-[#012d1d] text-[13px] font-bold border border-[#d5e7da] hover:bg-[#f0f9f3] cursor-pointer"
                >
                  View in My Items
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Right (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5 sticky top-20">
          {/* Instant Match Diagnostic Widget */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#d5e7da] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3 border-[#e0f2e6]">
              <span className="text-[12px] font-bold text-[#101f17] uppercase tracking-wider">
                Matching Readiness
              </span>
              <span className="text-[11px] text-[#012d1d] bg-[#c1ecd4] px-2.5 py-0.5 rounded-full font-bold">
                Strong 85%
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#414844]">Profile Completeness</span>
                <span className="text-[#012d1d] font-bold">4 / 5 Checkpoints</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#e0f2e6] overflow-hidden">
                <div className="h-full bg-[#012d1d] rounded-full w-[85%]" />
              </div>
            </div>

            <ul className="flex flex-col gap-2 text-[13px] text-[#101f17]">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#012d1d] text-base font-bold">check_circle</span>
                <span className="text-[12px]">High-Resolution Reference Image</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#012d1d] text-base font-bold">check_circle</span>
                <span className="text-[12px]">Campus Geofence Configured</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#012d1d] text-base font-bold">check_circle</span>
                <span className="text-[12px]">Encrypted Private Clue Recorded</span>
              </li>
              <li className="flex items-center gap-2 text-[#414844]">
                <span className="material-symbols-outlined text-[#a23e18] text-base">radio_button_unchecked</span>
                <span className="text-[12px]">Pending Verification Review</span>
              </li>
            </ul>
          </div>

          {/* Recent Campus Turn-ins Widget */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#d5e7da] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a23e18] text-lg">auto_awesome</span>
                <h3 className="text-[13px] font-bold text-[#101f17]">Potential Near Matches</h3>
              </div>
              <span className="text-[11px] text-[#414844] font-medium">Past 48h</span>
            </div>

            <div className="flex flex-col gap-3">
              <div
                onClick={() => onNavigateToMatch('Case #PM-8429')}
                className="p-3 rounded-lg bg-[#e6f8eb] hover:bg-[#dbede0] transition-all flex items-center gap-3 cursor-pointer border border-[#c1ecd4]"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#d5e7da] shrink-0">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkT8JsP2dWCnQAn9Hg3ALeVR1mmroq3SLIZTf7xfd_-1gH2KwAmQj3T-xlmanwVpXoKMDYL52otUsCUhBIFCOZRFxxC7yZW8vNVkVlLEZBO6Yj_W383kkiijph4RD2oxsBzeAVaXdZz6pag1UhYUKL_kBVg6L1-lOw0Di5ua40SCV4MDxCjDY6ctI95WtUvxMzwG7fiDsK5eE1PhOg9jEZpkHvND7rh3DoanZJfViz84_Y4NHE6-xbcQ"
                    alt="MacBook Air"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-bold text-[#012d1d] truncate">MacBook Air (Midnight)</span>
                  <span className="text-[11px] text-[#414844]">Found at Student Union 2h ago</span>
                  <span className="text-[11px] text-[#a23e18] font-bold">92% AI Similarity Score</span>
                </div>
              </div>

              <div
                onClick={() => onNavigateToMatch('Case #PM-8429')}
                className="p-3 rounded-lg bg-[#e6f8eb] hover:bg-[#dbede0] transition-all flex items-center gap-3 cursor-pointer border border-[#c1ecd4]"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#d5e7da] shrink-0">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4MMoeB6mqQpekxCTyKDTxoGh0l0bz4T5lZzDA_rCE66nhSVRs3JEO56zpdViJnafAPEZW46OsYQ7ucOGtRPxVyTUXws5mUMm67tmnw_iR_tMPr84DngeZyf-oTuB--BmTH2-3TnTAlqQvW8k-efkps3Edzhh568ckJf9x19huGesppQAFTeqsACEHRhixsXwCtjYEahnz5f6FApvStnM1UGetYjyuDEPWNVijmvd_PFGJ3RT9gbMvvg"
                    alt="iPad Pro"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-bold text-[#012d1d] truncate">iPad Pro 11-inch</span>
                  <span className="text-[11px] text-[#414844]">Found at Main Library 4h ago</span>
                  <span className="text-[11px] text-[#414844]">64% Match Score</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTab('explore')}
              className="w-full py-2 rounded-lg bg-[#e0f2e6] text-[#012d1d] text-[12px] font-bold hover:bg-[#d5e7da] transition-colors cursor-pointer"
            >
              Check All Unclaimed Laptops
            </button>
          </div>

          {/* Need In-Person Assistance */}
          <div className="bg-white rounded-xl p-5 flex flex-col gap-2 text-[#101f17] shadow-sm border border-[#d5e7da]">
            <div className="flex items-center gap-2 text-[#012d1d] font-bold text-[14px]">
              <span className="material-symbols-outlined text-lg">storefront</span>
              <span>Need In-Person Assistance?</span>
            </div>
            <p className="text-[13px] text-[#414844]">
              Visit the Student Union Information Desk (Ground Floor, Room 102). Staffed 24/7 for immediate physical check-in.
            </p>
            <div className="pt-2 flex items-center justify-between text-[12px] border-t border-[#e0f2e6]">
              <span className="font-bold text-[#012d1d]">Tel: (555) 019-4820</span>
              <span className="text-[#a23e18] font-bold underline cursor-pointer">Station Map</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
