import React, { useState } from 'react';
import { Item, ItemCategory, ViewTab, CampusId, FacilitySector } from '../types';

interface ReportLostViewProps {
  initialCampusId?: CampusId;
  onReportCreated: (newItem: Item) => void;
  onNavigateToTab: (tab: ViewTab) => void;
  onNavigateToMatch: (caseId?: string) => void;
}

export const ReportLostView: React.FC<ReportLostViewProps> = ({
  initialCampusId = 'main-campus',
  onReportCreated,
  onNavigateToTab,
  onNavigateToMatch,
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

  // Photo
  const [hasPhoto, setHasPhoto] = useState(true);
  const [photoName, setPhotoName] = useState('macbook_desk_ref.jpg');
  const [photoUrl, setPhotoUrl] = useState(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD8TN1h31vRiYwKoKD-LlLEYTr8dpaQr7ifc3TqEFWL9EcCi-PyG2CCSayHNfWDjFnp3ffW8kJr8GMnmp9ZU8cyXj0k52r6nobBt0au-3rN25lnGfngZ3xEU-COQI7uIr-xaLGOVCBy9J1rjCSsecVIs_Bslu_BfLppkHPgLDDeLgznu8mPIS9eOyNrptk_HluwVzcEKmTw_g6ROj-VKkW056K_heJHbxT2cVx8ehiarqVrwjFw3froQQ'
  );

  // Location & Campus
  const [campusId, setCampusId] = useState<CampusId>(
    initialCampusId === 'all-campuses' ? 'main-campus' : initialCampusId
  );
  const [facilitySector, setFacilitySector] = useState<FacilitySector>('academic');
  const [dateLost, setDateLost] = useState('2024-10-14');
  const [timeBracket, setTimeBracket] = useState('Midday (11:30 AM – 02:00 PM)');
  const [building, setBuilding] = useState('Caldwell Main Library');
  const [shuttleLine, setShuttleLine] = useState('Blue Line Shuttle #12');
  const [roomZone, setRoomZone] = useState('3rd Floor Quiet Study Pod #12, near elevator');
  const [mapRadius, setMapRadius] = useState('50 Meters');

  // Confidential Clues
  const [clue1, setClue1] = useState('Small holographic Yosemite sticker on base corner; serial ends in 9482');
  const [clue2, setClue2] = useState('Interior front sleeve contains Caldwell transit card + orange earplug case');

  // Alerts
  const [emailAlert, setEmailAlert] = useState(true);
  const [smsAlert, setSmsAlert] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const categories: { label: ItemCategory; icon: string }[] = [
    { label: 'Electronics', icon: 'laptop_chromebook' },
    { label: 'Bags & Backpacks', icon: 'backpack' },
    { label: 'Clothing', icon: 'apparel' },
    { label: 'Wallets & IDs', icon: 'account_balance_wallet' },
    { label: 'Keys & Badges', icon: 'vpn_key' },
    { label: 'Books & Notes', icon: 'menu_book' },
    { label: 'Jewelry / Watch', icon: 'watch' },
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoName(file.name);
      setHasPhoto(true);
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
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
        facilitySector,
        shuttleLine: facilitySector === 'transit' ? shuttleLine : undefined,
        locationName: building,
        roomZone,
        dateLostOrFound: 'Today',
        timeString: 'Just now',
        status: 'active_search',
        statusLabel: 'Active Searching',
        imageUrl: photoUrl,
        imageAlt: title,
        ownerName: 'Maya Lin',
        ownerId: '#USR-9102-MAYAL',
        confidentialClues: {
          uniqueMark: clue1,
          internalContents: clue2,
        },
        createdAt: new Date().toISOString(),
      };

      onReportCreated(newItem);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
    }, 1200);
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

        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl shadow-xs border border-[#d5e7da] shrink-0">
          <span className="material-symbols-outlined text-[#012d1d] text-2xl">encrypted</span>
          <div className="flex flex-col">
            <span className="text-[12px] text-[#012d1d] font-bold">Encrypted Case Vault</span>
            <span className="text-[11px] text-[#414844] font-mono">Institutional ID: #CP-89241</span>
          </div>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="w-full bg-white rounded-xl p-3 shadow-xs border border-[#d5e7da]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Step 1 */}
          <div
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all cursor-pointer ${
              activeStep === 1
                ? 'bg-[#1b4332] text-white'
                : 'bg-[#e6f8eb] text-[#101f17] hover:bg-[#dbede0]'
            }`}
          >
            <div className={`w-7 h-7 rounded-full text-[12px] flex items-center justify-center font-bold ${
              activeStep === 1 ? 'bg-white text-[#012d1d]' : 'bg-[#c1ecd4] text-[#012d1d]'
            }`}>
              1
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold leading-tight truncate">Item Specifics</span>
              <span className={`text-[11px] leading-none ${activeStep === 1 ? 'text-[#c1ecd4]' : 'text-[#414844]'}`}>
                Active Step
              </span>
            </div>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => setActiveStep(2)}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all cursor-pointer ${
              activeStep === 2
                ? 'bg-[#1b4332] text-white'
                : 'bg-[#e6f8eb] text-[#101f17] hover:bg-[#dbede0]'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-[#d5e7da] text-[#414844] text-[12px] flex items-center justify-center font-bold">
              2
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold leading-tight truncate">Campus Location</span>
              <span className="text-[11px] text-[#414844] leading-none">Date &amp; Zone</span>
            </div>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => setActiveStep(3)}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all cursor-pointer ${
              activeStep === 3
                ? 'bg-[#1b4332] text-white'
                : 'bg-[#e6f8eb] text-[#101f17] hover:bg-[#dbede0]'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-[#ffdbcf] text-[#a23e18] text-[12px] flex items-center justify-center font-bold">
              3
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-bold leading-tight truncate">Private Clues</span>
                <span className="material-symbols-outlined text-[#a23e18] text-sm">lock</span>
              </div>
              <span className="text-[11px] text-[#a23e18] font-medium leading-none">Crucial for Claims</span>
            </div>
          </div>

          {/* Step 4 */}
          <div
            onClick={() => setActiveStep(4)}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all cursor-pointer ${
              activeStep === 4
                ? 'bg-[#1b4332] text-white'
                : 'bg-[#e6f8eb] text-[#101f17] hover:bg-[#dbede0]'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-[#d5e7da] text-[#414844] text-[12px] flex items-center justify-center font-bold">
              4
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold leading-tight truncate">Review &amp; Submit</span>
              <span className="text-[11px] text-[#414844] leading-none">Final Step</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* SECTION 1: Item Identification */}
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
                  <span>Item Title or Short Name</span>
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                  <span className="text-[#717973] font-normal text-[11px]">Visible to campus community</span>
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

            {/* SECTION 2: Photographic Evidence & Reference */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-[#d5e7da] flex flex-col gap-5">
              <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-[#e0f2e6] text-[#012d1d] flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-xl">add_a_photo</span>
                  </span>
                  <div>
                    <h2 className="text-[18px] font-bold text-[#012d1d]">2. Photographic Evidence &amp; Reference</h2>
                    <p className="text-[13px] text-[#414844]">Uploading a reference photo increases automatic match rate by 84%.</p>
                  </div>
                </div>
                <span className="text-[11px] text-[#414844] bg-[#e0f2e6] px-2.5 py-1 rounded-full font-semibold">
                  Optional
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Drag & Drop Target */}
                <label
                  htmlFor="photo-upload-input"
                  className="md:col-span-7 bg-[#e6f8eb] rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:bg-[#dbede0] border-2 border-dashed border-[#c1ecd4]"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#012d1d] shadow-xs">
                    <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-[13px] text-[#101f17] font-bold">Drag &amp; drop reference photo here</p>
                    <p className="text-[12px] text-[#414844]">
                      or <span className="text-[#a23e18] font-bold underline">browse from library</span>
                    </p>
                  </div>
                  <span className="text-[11px] text-[#717973]">Supports JPG, PNG up to 10MB</span>
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>

                {/* Upload Preview Card */}
                {hasPhoto && (
                  <div className="md:col-span-5 bg-[#e0f2e6] rounded-xl p-3 flex flex-col gap-2 border border-[#c1ecd4]">
                    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-[#d5e7da]">
                      <img
                        src={photoUrl}
                        alt="Uploaded preview"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-[#012d1d]/90 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                        Primary Shot
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] font-bold text-[#101f17] truncate">{photoName}</span>
                        <span className="text-[11px] text-[#414844]">2.4 MB · Uploaded</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setHasPhoto(false)}
                          className="p-1 rounded-md hover:bg-[#ffdad6] text-[#ba1a1a] transition-colors"
                          title="Remove image"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* SECTION 3: Time & Campus Location */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-[#d5e7da] flex flex-col gap-5">
              <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-[#e0f2e6] text-[#012d1d] flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-xl">pin_drop</span>
                  </span>
                  <div>
                    <h2 className="text-[18px] font-bold text-[#012d1d]">3. Time &amp; Campus Location</h2>
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
                    Estimated Date Lost
                  </label>
                  <input
                    id="date-lost"
                    type="date"
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

              {/* Campus & Sector Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] text-[#101f17] font-semibold" htmlFor="campus-select">
                    Campus Location
                  </label>
                  <select
                    id="campus-select"
                    value={campusId}
                    onChange={(e) => setCampusId(e.target.value as CampusId)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d] cursor-pointer"
                  >
                    <option value="main-campus">Main Campus (Central Quad District)</option>
                    <option value="downtown-medical">Downtown Health Sciences &amp; Medical</option>
                    <option value="north-research">North Campus &amp; Tech Innovation Park</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] text-[#101f17] font-semibold" htmlFor="sector-select">
                    Facility Sector
                  </label>
                  <select
                    id="sector-select"
                    value={facilitySector}
                    onChange={(e) => {
                      const sec = e.target.value as FacilitySector;
                      setFacilitySector(sec);
                      if (sec === 'academic') setBuilding('Caldwell Main Library');
                      else if (sec === 'residence') setBuilding('South Tower Residence Hall');
                      else if (sec === 'transit') {
                        setBuilding('Campus Transit Shuttle Bus');
                        setShuttleLine('Blue Line Shuttle #12');
                      }
                      else if (sec === 'athletics') setBuilding('Caldwell Sports Arena & Gym');
                      else if (sec === 'student_life') setBuilding('Caldwell Student Union Center');
                    }}
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d] cursor-pointer"
                  >
                    <option value="academic">Academic Buildings &amp; Libraries</option>
                    <option value="residence">Residence Halls &amp; Dormitories</option>
                    <option value="transit">Campus Transit &amp; Shuttles</option>
                    <option value="athletics">Athletic Arenas &amp; Recreation</option>
                    <option value="student_life">Student Union, Dining &amp; Lawns</option>
                  </select>
                </div>
              </div>

              {/* Facility / Building / Shuttle Line & Precise Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] text-[#101f17] font-semibold" htmlFor="campus-building">
                    {facilitySector === 'transit' ? 'Campus Shuttle Line / Depot' : 'Building / Specific Zone'}
                  </label>
                  <select
                    id="campus-building"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d] cursor-pointer"
                  >
                    {facilitySector === 'academic' && (
                      <optgroup label="Academic Buildings">
                        <option>Caldwell Main Library</option>
                        <option>Hall of Science &amp; Chemistry Labs</option>
                        <option>Arts Pavilion &amp; Auditorium</option>
                        <option>Business Commons &amp; Case Study Rooms</option>
                        <option>Engineering &amp; Robotics Annex</option>
                        <option>Humanities &amp; Social Science Hall</option>
                      </optgroup>
                    )}
                    {facilitySector === 'residence' && (
                      <optgroup label="Residence Halls & Dorms">
                        <option>South Tower Residence Hall</option>
                        <option>North Quad Dormitory</option>
                        <option>Birch Hall Dorms</option>
                        <option>Oakwood Quad Dorms</option>
                        <option>Cedar Heights Suites</option>
                        <option>Elmwood Commons</option>
                      </optgroup>
                    )}
                    {facilitySector === 'transit' && (
                      <optgroup label="Campus Transit & Shuttles">
                        <option>Blue Line Shuttle Bus #12 (Library - Union Loop)</option>
                        <option>Blue Line Shuttle Bus #14 (Dorms & Transit Hub)</option>
                        <option>Red Line Express Shuttle #07 (Commuter Deck P4)</option>
                        <option>Gold Quad Express Shuttle</option>
                        <option>Night Owl Campus Safety Van</option>
                        <option>Transit Plaza Central Depot (Bay 3)</option>
                        <option>Campus Bike Share Station 2</option>
                      </optgroup>
                    )}
                    {facilitySector === 'athletics' && (
                      <optgroup label="Athletics & Recreation">
                        <option>Caldwell Sports Arena &amp; Court 1</option>
                        <option>Varsity Fieldhouse &amp; Locker Rooms</option>
                        <option>Recreation Wellness Center (Gym floor)</option>
                        <option>Campus Aquatic Center (Pool Deck)</option>
                        <option>Tennis Pavilion &amp; Courts</option>
                      </optgroup>
                    )}
                    {facilitySector === 'student_life' && (
                      <optgroup label="Student Life & Dining">
                        <option>Caldwell Student Union (Atrium & Lounge)</option>
                        <option>Campus Dining Hall East</option>
                        <option>University Bookstore &amp; Cafe</option>
                        <option>Alumni Quad Central Lawn</option>
                        <option>Student Activities Commons</option>
                      </optgroup>
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] text-[#101f17] font-semibold" htmlFor="room-zone">
                    Floor, Room, Bus Seat or Precise Spot
                  </label>
                  <input
                    id="room-zone"
                    type="text"
                    value={roomZone}
                    onChange={(e) => setRoomZone(e.target.value)}
                    placeholder="e.g., 3rd Floor Pod #12, Rear row seat 4, Locker 20..."
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] placeholder:text-[#717973] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                  />
                </div>
              </div>

              {/* Interactive Campus Pin Locator */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#101f17] font-semibold">Refine Coordinates on Campus Map</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#414844]">Radius:</span>
                    <span className="bg-[#e0f2e6] text-[#012d1d] text-[11px] px-2.5 py-0.5 rounded-md font-bold">
                      {mapRadius}
                    </span>
                  </div>
                </div>

                <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-xs bg-[#e0f2e6] border border-[#c1ecd4]">
                  {/* Grid canvas background */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1b4332_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Campus building labels */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg shadow-sm flex items-center gap-2 border border-[#d5e7da]">
                    <span className="material-symbols-outlined text-[#a23e18] text-base">explore</span>
                    <span className="text-[12px] text-[#101f17] font-bold">{building} Selected</span>
                  </div>

                  {/* Pin simulation */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#a23e18]/20 animate-ping absolute" />
                      <div className="w-10 h-10 rounded-full bg-[#a23e18]/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#a23e18] text-2xl drop-shadow-md">
                          location_on
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Zoom controls */}
                  <div className="absolute bottom-3 right-3 flex flex-col gap-1 bg-white rounded-lg shadow-sm p-1 border border-[#d5e7da]">
                    <button
                      type="button"
                      onClick={() => setMapRadius('25 Meters')}
                      className="w-7 h-7 flex items-center justify-center text-[#101f17] hover:bg-[#e0f2e6] rounded text-sm font-bold"
                      title="Zoom In / Narrow radius"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapRadius('100 Meters')}
                      className="w-7 h-7 flex items-center justify-center text-[#101f17] hover:bg-[#e0f2e6] rounded text-sm font-bold"
                      title="Zoom Out / Expand radius"
                    >
                      -
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: Private Verification Clues */}
            <section className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-l-[#a23e18] border border-[#d5e7da] flex flex-col gap-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg bg-[#ffdbcf] text-[#a23e18] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">vpn_key_alert</span>
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[18px] font-bold text-[#012d1d]">4. Private Verification Clues</h2>
                      <span className="bg-[#a23e18] text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                        Confidential
                      </span>
                    </div>
                    <p className="text-[13px] text-[#414844]">
                      Not displayed publicly. These details stay securely locked in encrypted storage, inspected exclusively by Caldwell Desk reviewers to validate incoming claims.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#e6f8eb] p-4 rounded-xl flex items-center gap-3 text-[#101f17] border border-[#c1ecd4]">
                <span className="material-symbols-outlined text-[#a23e18] text-2xl shrink-0">shield</span>
                <p className="text-[12px] leading-relaxed">
                  <strong>Zero-Knowledge Disclosure:</strong> Never disclose your passcode or master password. Describe specific invisible details: unique internal stickers, lock screen wallpaper, receipt tucked inside, or engraved digits.
                </p>
              </div>

              {/* Clue 1 */}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-[#101f17] font-semibold flex items-center gap-1.5" htmlFor="private-clue-1">
                  <span>Clue 1: Unique Mark, Engraving, or Serial Number</span>
                  <span className="material-symbols-outlined text-sm text-[#a23e18]">verified_user</span>
                </label>
                <input
                  id="private-clue-1"
                  type="text"
                  value={clue1}
                  onChange={(e) => setClue1(e.target.value)}
                  placeholder="e.g., Small holographic Yosemite sticker on base corner, or serial ends in 9482"
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] placeholder:text-[#717973] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                />
              </div>

              {/* Clue 2 */}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] text-[#101f17] font-semibold flex items-center gap-1.5" htmlFor="private-clue-2">
                  <span>Clue 2: Internal Contents or Custom Lockscreen Wallpaper</span>
                  <span className="material-symbols-outlined text-sm text-[#a23e18]">verified_user</span>
                </label>
                <input
                  id="private-clue-2"
                  type="text"
                  value={clue2}
                  onChange={(e) => setClue2(e.target.value)}
                  placeholder="e.g., Interior front zipper contains Caldwell transit card + orange earplug case"
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] placeholder:text-[#717973] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                />
              </div>
            </section>

            {/* SECTION 5: Match Alerts */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-[#d5e7da] flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-[#e0f2e6] text-[#012d1d] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">notifications_active</span>
                </span>
                <div>
                  <h2 className="text-[18px] font-bold text-[#012d1d]">5. Automated Match Alerts</h2>
                  <p className="text-[13px] text-[#414844]">Stay updated in real-time when a student or officer turns in an item.</p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                <label className="flex items-start gap-3 p-3 rounded-lg bg-[#e6f8eb] hover:bg-[#dbede0] transition-colors cursor-pointer border border-[#c1ecd4]">
                  <input
                    type="checkbox"
                    checked={emailAlert}
                    onChange={(e) => setEmailAlert(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#012d1d] accent-[#012d1d] cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-[13px] text-[#101f17] font-bold">Immediate Institutional Email Notification</span>
                    <span className="text-[12px] text-[#414844]">
                      Direct instant dispatch to m.lin@caldwell.edu with matching image and pickup desk details.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg bg-[#e6f8eb] hover:bg-[#dbede0] transition-colors cursor-pointer border border-[#c1ecd4]">
                  <input
                    type="checkbox"
                    checked={smsAlert}
                    onChange={(e) => setSmsAlert(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#012d1d] accent-[#012d1d] cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-[13px] text-[#101f17] font-bold">Urgent SMS Text Alerts</span>
                    <span className="text-[12px] text-[#414844]">
                      Send expedited text messages to verified campus mobile number (***) ***-4821.
                    </span>
                  </div>
                </label>
              </div>
            </section>

            {/* Form Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
              <button
                type="button"
                onClick={() => {
                  alert('Draft saved to local device. You can resume reporting anytime.');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white border border-[#d5e7da] text-[#101f17] text-[13px] font-semibold hover:bg-[#e6f8eb] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">save</span>
                <span>Save Draft for Later</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || submittedSuccess}
                className={`w-full sm:w-auto px-8 py-3 rounded-lg text-white text-[14px] font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  submittedSuccess
                    ? 'bg-[#1b4332]'
                    : isSubmitting
                    ? 'bg-[#1b4332] opacity-80 cursor-wait'
                    : 'bg-[#012d1d] hover:bg-[#1b4332] hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                    <span>Broadcasting to Campus Registry...</span>
                  </>
                ) : submittedSuccess ? (
                  <>
                    <span className="material-symbols-outlined text-lg text-[#c1ecd4]">check_circle</span>
                    <span>Report Filed Successfully!</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">verified</span>
                    <span>Submit Lost Item Report</span>
                  </>
                )}
              </button>
            </div>

            {/* Honor Code Notice */}
            <div className="p-4 rounded-xl bg-[#e6f8eb] border border-[#c1ecd4] flex items-start gap-2.5 text-[#414844]">
              <span className="material-symbols-outlined text-base mt-0.5 text-[#012d1d]">policy</span>
              <p className="text-[11px] leading-relaxed">
                By submitting this institutional claim, you affirm under the Caldwell University Academic &amp; Community Honor Code that you are the lawful owner or authorized representative of the stated property. Fraudulent item claims are subject to University Judiciary review.
              </p>
            </div>
          </form>

          {/* Success Toast */}
          {submittedSuccess && (
            <div className="p-5 rounded-xl bg-[#c1ecd4] border border-[#85f8c4] flex flex-col gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5 text-[#012d1d]">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
                <span className="text-[16px] font-bold">Lost Report Active &amp; Synced!</span>
              </div>
              <p className="text-[13px] text-[#274e3d]">
                Case <strong>#LR-8821</strong> is actively monitored by the Caldwell automated matching engine. We found 1 high-probability potential match turned in at the Student Union Desk.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateToMatch('Case #PM-8429')}
                  className="px-4 py-2 rounded-lg bg-[#012d1d] text-white text-[12px] font-bold hover:bg-[#1b4332]"
                >
                  View Potential Match (86%) →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToTab('my-items')}
                  className="px-4 py-2 rounded-lg bg-white text-[#012d1d] text-[12px] font-bold border border-[#d5e7da]"
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
              {/* Item Card 1 */}
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

              {/* Item Card 2 */}
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
              Check All 18 Unclaimed Laptops
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
