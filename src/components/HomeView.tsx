import React, { useState, useEffect } from 'react';
import { Item, ViewTab, CampusId } from '../types';
import { CAMPUS_SITES, HANDOVER_STATIONS } from '../data/mockData';
import { apiClient, SystemStats } from '../services/apiClient';

interface HomeViewProps {
  items: Item[];
  selectedCampus: CampusId;
  onNavigateToTab: (tab: ViewTab) => void;
  onOpenReportFound: () => void;
  onOpenCampusDesk: () => void;
  onOpenAuth: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  items,
  selectedCampus,
  onNavigateToTab,
  onOpenReportFound,
  onOpenCampusDesk,
  onOpenAuth,
}) => {
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    let active = true;
    apiClient.getStats().then((data) => {
      if (active) setStats(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const currentCampusInfo =
    CAMPUS_SITES.find((c) => c.id === selectedCampus) || CAMPUS_SITES[0];

  // Recently reported items (first 6)
  const recentItems = items.slice(0, 6);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToTab('explore');
  };

  return (
    <div className="w-full flex flex-col gap-10 md:gap-14 pb-12">
      {/* 1. HERO SECTION (Inspired by Dribbble Lost & Found Modern Hero) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#012d1d] via-[#103827] to-[#1b4332] text-white p-6 sm:p-10 md:p-14 shadow-xl border border-[#2b5943]">
        {/* Subtle decorative grid canvas */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c1ecd4_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
          {/* Institutional Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#c1ecd4] text-[12px] font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
            <span>Official Caldwell University Property Custody Hub</span>
            <span className="text-white/40">•</span>
            <span className="text-white">{currentCampusInfo.name}</span>
          </div>

          {/* Main Hero Headline */}
          <div className="flex flex-col gap-3">
            <h1 className="text-[34px] sm:text-[46px] md:text-[54px] font-extrabold tracking-tight leading-[1.1] text-white">
              Lost Something on Campus? <br className="hidden sm:inline" />
              <span className="text-[#c1ecd4] underline decoration-[#a23e18] decoration-wavy decoration-from-font">
                We'll Help You Find It.
              </span>
            </h1>
            <p className="text-[15px] sm:text-[17px] text-[#d5e7da] max-w-2xl mx-auto leading-relaxed font-normal">
              A centralized campus registry connecting students, faculty, transit shuttles, and safe custody desks with automated AI match verification.
            </p>
          </div>

          {/* Hero Search Box */}
          <form
            onSubmit={handleHeroSearch}
            className="w-full max-w-2xl bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row items-center gap-2 border-2 border-[#c1ecd4]"
          >
            <div className="flex items-center gap-2.5 px-3 w-full">
              <span className="material-symbols-outlined text-[#1b4332] text-2xl">search</span>
              <input
                type="text"
                value={heroSearchQuery}
                onChange={(e) => setHeroSearchQuery(e.target.value)}
                placeholder="What did you lose or find? (e.g. Sony XM4, Blue Line backpack, Hydro Flask...)"
                className="w-full py-2.5 bg-transparent text-[#101f17] placeholder:text-[#717973] text-[14px] sm:text-[15px] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#012d1d] hover:bg-[#1b4332] text-white text-[14px] font-bold transition-all shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <span>Explore Items</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </form>

          {/* Quick Action Category Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[12px] text-[#c1ecd4]">
            <span className="text-white/60 font-semibold">Popular categories:</span>
            {['Electronics', 'Backpacks', 'Keys & IDs', 'Earbuds', 'Wallets', 'Hydro Flasks'].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onNavigateToTab('explore')}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#e6f8eb] font-medium transition-colors border border-white/10"
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* 2. PRIMARY ACTION CTA CARDS (Report Lost / Report Found / Check Match) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Report Lost */}
        <div
          onClick={() => onNavigateToTab('report-lost')}
          className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-[#d5e7da] shadow-sm hover:shadow-xl hover:border-[#a23e18] transition-all cursor-pointer flex flex-col justify-between gap-4"
        >
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#ffdbcf] text-[#a23e18] flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">report_problem</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#a23e18]">
                Student Loss Filing
              </span>
              <h2 className="text-[20px] font-bold text-[#012d1d] group-hover:text-[#a23e18] transition-colors">
                I Lost an Item
              </h2>
            </div>
            <p className="text-[13px] text-[#414844] leading-relaxed">
              File a loss report with item photos, time window, and campus coordinates. Our AI scans new intakes automatically.
            </p>
          </div>
          <div className="flex items-center text-[13px] font-bold text-[#a23e18] group-hover:translate-x-1 transition-transform">
            <span>Start Lost Report</span>
            <span className="material-symbols-outlined text-base ml-1">chevron_right</span>
          </div>
        </div>

        {/* Card 2: Report Found */}
        <div
          onClick={onOpenReportFound}
          className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-[#d5e7da] shadow-sm hover:shadow-xl hover:border-[#1b4332] transition-all cursor-pointer flex flex-col justify-between gap-4"
        >
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#e6f8eb] text-[#012d1d] flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#012d1d]">
                Turned-In Property
              </span>
              <h2 className="text-[20px] font-bold text-[#012d1d] group-hover:text-[#1b4332] transition-colors">
                I Found an Item
              </h2>
            </div>
            <p className="text-[13px] text-[#414844] leading-relaxed">
              Log found belongings or hand them over to a campus safe custody desk. We securely store and notify the owner.
            </p>
          </div>
          <div className="flex items-center text-[13px] font-bold text-[#012d1d] group-hover:translate-x-1 transition-transform">
            <span>Log Turned-In Item</span>
            <span className="material-symbols-outlined text-base ml-1">chevron_right</span>
          </div>
        </div>

        {/* Card 3: AI Potential Matches */}
        <div
          onClick={() => onNavigateToTab('potential-matches')}
          className="group relative bg-[#012d1d] text-white rounded-2xl p-6 sm:p-7 border border-[#1b4332] shadow-sm hover:shadow-xl hover:border-[#c1ecd4] transition-all cursor-pointer flex flex-col justify-between gap-4"
        >
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-[#c1ecd4] flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform border border-white/10">
              <span className="material-symbols-outlined text-2xl">auto_awesome</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#c1ecd4]">
                  Match Engine
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#a23e18] text-white">
                  86% Match Alert
                </span>
              </div>
              <h2 className="text-[20px] font-bold text-white group-hover:text-[#c1ecd4] transition-colors">
                Inspect AI Matches
              </h2>
            </div>
            <p className="text-[13px] text-white/80 leading-relaxed">
              Review side-by-side comparison for Sony WH-1000XM4 headphones currently held in Student Union Bin #E-14.
            </p>
          </div>
          <div className="flex items-center text-[13px] font-bold text-[#c1ecd4] group-hover:translate-x-1 transition-transform">
            <span>Inspect Match Case #PM-8429</span>
            <span className="material-symbols-outlined text-base ml-1">chevron_right</span>
          </div>
        </div>
      </section>

      {/* 3. LIVE CAMPUS STATS BANNER */}
      <section className="bg-white rounded-2xl p-6 border border-[#d5e7da] shadow-xs grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[#e0f2e6]">
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="text-[32px] font-black text-[#012d1d] tabular-nums">
            {stats?.campusRecoveryRate || '78.4%'}
          </span>
          <span className="text-[12px] font-semibold text-[#414844] uppercase tracking-wider">
            Campus Recovery Rate
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 pt-4 md:pt-0">
          <span className="text-[32px] font-black text-[#a23e18] tabular-nums">
            {stats ? `${stats.reunitedItems} Items` : '14 Items'}
          </span>
          <span className="text-[12px] font-semibold text-[#414844] uppercase tracking-wider">
            Reunited Possessions
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 pt-4 md:pt-0">
          <span className="text-[32px] font-black text-[#012d1d] tabular-nums">
            {stats?.activeDesks || 7} Stations
          </span>
          <span className="text-[12px] font-semibold text-[#414844] uppercase tracking-wider">
            Staffed Custody Desks
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 pt-4 md:pt-0">
          <span className="text-[32px] font-black text-[#1b4332] tabular-nums">
            &lt; {stats?.avgReunionHours || '24h'}
          </span>
          <span className="text-[12px] font-semibold text-[#414844] uppercase tracking-wider">
            Average Resolution Time
          </span>
        </div>
      </section>

      {/* 4. RECENTLY REPORTED CAMPUS BELONGINGS */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#a23e18]">
              <span className="w-2 h-2 rounded-full bg-[#a23e18]" />
              <span>Real-Time Directory Feed</span>
            </div>
            <h2 className="text-[26px] font-bold text-[#012d1d] tracking-tight">
              Recently Reported Items on Campus
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('explore')}
            className="text-[13px] font-bold text-[#012d1d] hover:text-[#1b4332] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Registry Items ({items.length})</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>

        {/* Responsive Grid of Recent Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigateToTab('explore')}
              className="bg-white rounded-xl overflow-hidden border border-[#d5e7da] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative w-full aspect-[16/10] bg-[#e0f2e6] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {item.type === 'found' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#012d1d] text-white">
                      Found · In Custody
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#a23e18] text-white">
                      Lost Report
                    </span>
                  )}
                  {item.status === 'under_review' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ffdbcf] text-[#a23e18] border border-[#a23e18]/20">
                      86% Match
                    </span>
                  )}
                </div>
                {item.binNumber && (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-white/95 text-[10px] font-bold text-[#101f17] border border-[#d5e7da]">
                    {item.binNumber}
                  </span>
                )}
              </div>

              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] text-[#414844]">
                  <span className="font-bold uppercase tracking-wider text-[#012d1d]">{item.category}</span>
                  <span>{item.dateLostOrFound}</span>
                </div>
                <h3 className="text-[16px] font-bold text-[#101f17] group-hover:text-[#012d1d] transition-colors truncate">
                  {item.title}
                </h3>
                <div className="flex items-center gap-1.5 text-[12px] text-[#414844] truncate">
                  <span className="material-symbols-outlined text-sm text-[#a23e18]">location_on</span>
                  <span className="truncate">{item.locationName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW FINDSYNC WORKS (3-Step Lifecycle) */}
      <section className="bg-[#e6f8eb] rounded-3xl p-6 sm:p-10 border border-[#c1ecd4] flex flex-col gap-8">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#a23e18]">
            Automated Institutional Workflow
          </span>
          <h2 className="text-[28px] font-bold text-[#012d1d] tracking-tight">
            How Campus FindSync Reunited Property
          </h2>
          <p className="text-[14px] text-[#414844]">
            Transparent, audited procedures safeguarding student belongings from intake to physical handover.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#d5e7da] flex flex-col gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#012d1d] text-white flex items-center justify-center font-bold text-lg">
              1
            </span>
            <h3 className="text-[17px] font-bold text-[#012d1d]">Report or Intake</h3>
            <p className="text-[13px] text-[#414844] leading-relaxed">
              Submit a loss report with photos and coordinates, or staff log turned-in belongings into designated secure bin vaults.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#d5e7da] flex flex-col gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#a23e18] text-white flex items-center justify-center font-bold text-lg">
              2
            </span>
            <h3 className="text-[17px] font-bold text-[#012d1d]">AI Match Scoring</h3>
            <p className="text-[13px] text-[#414844] leading-relaxed">
              Our matching engine evaluates visual embeddings, model identifiers, transit times, and campus geospatial proximity.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#d5e7da] flex flex-col gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#1b4332] text-white flex items-center justify-center font-bold text-lg">
              3
            </span>
            <h3 className="text-[17px] font-bold text-[#012d1d]">Verified Handover</h3>
            <p className="text-[13px] text-[#414844] leading-relaxed">
              Submit private serial details or receipts. Once approved by custody officers, pick up at your chosen campus safety desk.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CAMPUS SAFETY DESKS QUICK DIRECTORY */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#d5e7da] shadow-xs flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e0f2e6]">
          <div>
            <h2 className="text-[22px] font-bold text-[#012d1d]">
              Staffed Handover Desks &amp; Safe Depots
            </h2>
            <p className="text-[13px] text-[#414844]">
              Physical locations authorized to intake lost items and release verified claims with student ID.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCampusDesk}
            className="px-4 py-2 rounded-lg bg-[#e6f8eb] hover:bg-[#dbede0] text-[#012d1d] text-[13px] font-bold border border-[#c1ecd4] self-start sm:self-auto cursor-pointer"
          >
            View All 7 Desk Locations
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HANDOVER_STATIONS.slice(0, 4).map((station) => (
            <div
              key={station.id}
              className="p-4 rounded-xl bg-[#ecfef1] border border-[#c1ecd4] flex flex-col justify-between gap-3"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#1b4332] text-white">
                    {station.badge}
                  </span>
                  <span className="text-[11px] font-bold text-[#012d1d] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1b4332] animate-pulse" />
                    {station.status}
                  </span>
                </div>
                <h4 className="text-[14px] font-bold text-[#101f17] mt-1">{station.name}</h4>
                <span className="text-[11px] text-[#717973] truncate">{station.location}</span>
                <span className="text-[11px] text-[#414844] font-medium">{station.hours}</span>
              </div>
              <a
                href={`tel:${station.phone}`}
                className="text-[11px] font-bold text-[#a23e18] hover:underline self-start"
              >
                Call {station.phone}
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
