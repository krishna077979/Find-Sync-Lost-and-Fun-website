import React, { useState, useMemo, useEffect } from 'react';
import { Item, ViewTab, CampusId, FacilitySector } from '../types';
import { CAMPUS_SITES } from '../data/mockData';

interface ExploreViewProps {
  items: Item[];
  selectedCampus: CampusId;
  onSelectCampus: (campusId: CampusId) => void;
  onNavigateToMatch: (caseId?: string) => void;
  onNavigateToReportLost: () => void;
  onOpenReportFound: () => void;
  onOpenCampusDesk: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  items,
  selectedCampus,
  onSelectCampus,
  onNavigateToMatch,
  onNavigateToReportLost,
  onOpenReportFound,
  onOpenCampusDesk,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPill, setSelectedPill] = useState<'all' | 'lost' | 'found' | 'matches' | 'reunited'>('all');
  const [selectedSector, setSelectedSector] = useState<'all' | FacilitySector>('all');
  const [selectedFacilityChip, setSelectedFacilityChip] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'confidence' | 'location' | 'category'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetailItem, setSelectedDetailItem] = useState<Item | null>(null);

  // Filter States
  const [statusFilters, setStatusFilters] = useState<{
    in_custody: boolean;
    active_search: boolean;
    under_review: boolean;
  }>({
    in_custody: true,
    active_search: true,
    under_review: true,
  });

  const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>({
    Electronics: true,
    'Bags & Backpacks': true,
    'Keys & Badges': true,
    'Personal Essentials': true,
    Clothing: true,
    'Wallets & IDs': true,
  });

  const [timeHorizon, setTimeHorizon] = useState<'24h' | '7d' | '30d' | 'custom'>('7d');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const currentCampusInfo = CAMPUS_SITES.find((c) => c.id === selectedCampus) || CAMPUS_SITES[0];

  // Keyboard shortcut for Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('explore-search-input');
        if (input) {
          input.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Campus filter
      if (selectedCampus !== 'all-campuses' && item.campusId !== selectedCampus) {
        return false;
      }

      // Sector filter
      if (selectedSector !== 'all' && item.facilitySector !== selectedSector) {
        return false;
      }

      // Specific Facility / Dorm / Shuttle chip filter
      if (selectedFacilityChip) {
        const query = selectedFacilityChip.toLowerCase();
        const matchesChip =
          item.locationName.toLowerCase().includes(query) ||
          (item.shuttleLine && item.shuttleLine.toLowerCase().includes(query)) ||
          (item.roomZone && item.roomZone.toLowerCase().includes(query));
        if (!matchesChip) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.locationName.toLowerCase().includes(q) ||
          (item.shuttleLine && item.shuttleLine.toLowerCase().includes(q)) ||
          item.reportCode.toLowerCase().includes(q) ||
          (item.brand && item.brand.toLowerCase().includes(q)) ||
          (item.model && item.model.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Quick filter pill
      if (selectedPill === 'lost' && item.type !== 'lost') return false;
      if (selectedPill === 'found' && item.type !== 'found') return false;
      if (selectedPill === 'matches' && item.status !== 'under_review') return false;
      if (selectedPill === 'reunited' && item.status !== 'reunited') return false;

      // Status filters
      if (item.status === 'in_custody' && !statusFilters.in_custody) return false;
      if (item.status === 'active_search' && !statusFilters.active_search) return false;
      if (item.status === 'under_review' && !statusFilters.under_review) return false;

      // Category filters
      const checkedCategories = Object.keys(categoryFilters).filter((cat) => categoryFilters[cat]);
      if (checkedCategories.length > 0 && !categoryFilters[item.category]) {
        return false;
      }

      // Dominant color filter
      if (selectedColor && !item.colorway.toLowerCase().includes(selectedColor.toLowerCase())) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'confidence') {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      if (sortBy === 'location') {
        return a.locationName.localeCompare(b.locationName);
      }
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [items, selectedCampus, selectedSector, selectedFacilityChip, searchQuery, selectedPill, sortBy, statusFilters, categoryFilters, selectedColor]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedPill('all');
    setSelectedSector('all');
    setSelectedFacilityChip(null);
    setSortBy('recent');
    setStatusFilters({ in_custody: true, active_search: true, under_review: true });
    setCategoryFilters({
      Electronics: true,
      'Bags & Backpacks': true,
      'Keys & Badges': true,
      'Personal Essentials': true,
      Clothing: true,
      'Wallets & IDs': true,
    });
    setSelectedColor(null);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Ambient Glow & Hero Zone */}
      <section className="relative w-full pt-2 pb-2">
        <div className="max-w-7xl mx-auto flex flex-col gap-5">
          {/* Header Typography Hierarchy */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[#012d1d] text-[12px] font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#a23e18] animate-pulse" />
                <span>All-Campus Property Custody &amp; Registry</span>
                <span className="text-[#c1c8c2]">•</span>
                <span className="text-[#012d1d] font-bold">{currentCampusInfo.name}</span>
              </div>
              <h1 className="text-[32px] md:text-[38px] font-bold text-[#012d1d] tracking-tight leading-tight">
                Search Campus Lost &amp; Found Registry
              </h1>
              <p className="text-[15px] text-[#414844] leading-relaxed">
                Browse publicly logged items across academic buildings, residence dorms, campus transit shuttles, and athletic complexes.
              </p>
            </div>

            {/* Quick Action Metric Bar */}
            <div className="flex items-center gap-2 bg-[#e6f8eb] p-1.5 rounded-xl shrink-0 border border-[#c1ecd4]">
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white rounded-lg shadow-xs">
                <span className="material-symbols-outlined text-[#012d1d] text-xl">domain</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#414844] uppercase tracking-wider font-semibold leading-none">Sector View</span>
                  <span className="text-[15px] text-[#012d1d] font-bold leading-tight truncate max-w-[120px]">
                    {selectedSector === 'all' ? 'All Sectors' : selectedSector}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white rounded-lg shadow-xs">
                <span className="material-symbols-outlined text-[#a23e18] text-xl">security</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#414844] uppercase tracking-wider font-semibold leading-none">Safe Desks</span>
                  <span className="text-[15px] text-[#101f17] font-bold leading-tight">
                    {currentCampusInfo.desksCount} Open
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Prominent Elevated Search Input */}
          <div className="relative w-full">
            <div className="relative flex items-center bg-white rounded-xl shadow-sm border border-[#d5e7da] hover:shadow-md focus-within:ring-2 focus-within:ring-[#1b4332] transition-all">
              <span className="material-symbols-outlined absolute left-4 text-[#717973] text-2xl pointer-events-none">
                search
              </span>
              <input
                id="explore-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all buildings, dorms, shuttle lines (e.g., Blue Line, South Tower, MacBook, Hydro Flask)..."
                className="w-full pl-12 pr-32 py-3.5 bg-transparent text-[15px] text-[#101f17] placeholder:text-[#717973] focus:outline-none rounded-xl"
              />
              <div className="absolute right-3 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-lg text-[#717973] hover:text-[#101f17] hover:bg-[#e6f8eb] transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded border border-[#d5e7da] bg-[#e6f8eb] text-[11px] text-[#414844] font-medium">
                  <span>⌘</span>K
                </kbd>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-3 py-1.5 rounded-lg bg-[#1b4332] text-white text-[12px] font-semibold hover:bg-[#012d1d] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Filter</span>
                  <span className="material-symbols-outlined text-sm">tune</span>
                </button>
              </div>
            </div>
          </div>

          {/* Campus Sector Filter Tabs (Academic, Housing, Transit, Athletics, Student Life) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-nowrap">
            <button
              type="button"
              onClick={() => setSelectedSector('all')}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedSector === 'all'
                  ? 'bg-[#012d1d] text-white shadow-xs'
                  : 'bg-white text-[#414844] border border-[#d5e7da] hover:bg-[#e6f8eb]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">hub</span>
              <span>All Campus Sectors</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSector('academic')}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedSector === 'academic'
                  ? 'bg-[#012d1d] text-white shadow-xs'
                  : 'bg-white text-[#414844] border border-[#d5e7da] hover:bg-[#e6f8eb]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">menu_book</span>
              <span>Academic &amp; Libraries</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSector('residence')}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedSector === 'residence'
                  ? 'bg-[#012d1d] text-white shadow-xs'
                  : 'bg-white text-[#414844] border border-[#d5e7da] hover:bg-[#e6f8eb]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">apartment</span>
              <span>Residence Halls &amp; Dorms</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSector('transit')}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedSector === 'transit'
                  ? 'bg-[#a23e18] text-white shadow-xs'
                  : 'bg-white text-[#414844] border border-[#d5e7da] hover:bg-[#ffdbcf]/50'
              }`}
            >
              <span className="material-symbols-outlined text-sm">airport_shuttle</span>
              <span>Campus Transit &amp; Shuttles</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSector('athletics')}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedSector === 'athletics'
                  ? 'bg-[#012d1d] text-white shadow-xs'
                  : 'bg-white text-[#414844] border border-[#d5e7da] hover:bg-[#e6f8eb]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">fitness_center</span>
              <span>Athletics &amp; Gyms</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSector('student_life')}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedSector === 'student_life'
                  ? 'bg-[#012d1d] text-white shadow-xs'
                  : 'bg-white text-[#414844] border border-[#d5e7da] hover:bg-[#e6f8eb]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">restaurant</span>
              <span>Student Union &amp; Dining</span>
            </button>
          </div>

          {/* Sub-Facility & Zone Quick Chips (Buildings, Dorms, Transit lines, Arenas) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-nowrap">
            <span className="text-[11px] font-bold text-[#414844] uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-[#a23e18]">place</span>
              Facility Zone:
            </span>
            <button
              type="button"
              onClick={() => setSelectedFacilityChip(null)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                selectedFacilityChip === null
                  ? 'bg-[#1b4332] text-white'
                  : 'bg-[#e0f2e6] text-[#012d1d] hover:bg-[#dbede0]'
              }`}
            >
              All Zones ({filteredItems.length})
            </button>

            {(selectedSector === 'all' || selectedSector === 'academic') && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedFacilityChip(selectedFacilityChip === 'Library' ? null : 'Library')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedFacilityChip === 'Library'
                      ? 'bg-[#1b4332] text-white'
                      : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb]'
                  }`}
                >
                  Main Library
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFacilityChip(selectedFacilityChip === 'Science' ? null : 'Science')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedFacilityChip === 'Science'
                      ? 'bg-[#1b4332] text-white'
                      : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb]'
                  }`}
                >
                  Hall of Science
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFacilityChip(selectedFacilityChip === 'Arts' ? null : 'Arts')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedFacilityChip === 'Arts'
                      ? 'bg-[#1b4332] text-white'
                      : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb]'
                  }`}
                >
                  Arts Pavilion
                </button>
              </>
            )}

            {(selectedSector === 'all' || selectedSector === 'residence') && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedFacilityChip(selectedFacilityChip === 'Birch' ? null : 'Birch')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedFacilityChip === 'Birch'
                      ? 'bg-[#1b4332] text-white'
                      : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb]'
                  }`}
                >
                  Birch Hall Dorms
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFacilityChip(selectedFacilityChip === 'South Tower' ? null : 'South Tower')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedFacilityChip === 'South Tower'
                      ? 'bg-[#1b4332] text-white'
                      : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb]'
                  }`}
                >
                  South Tower Dorms
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFacilityChip(selectedFacilityChip === 'North Quad' ? null : 'North Quad')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedFacilityChip === 'North Quad'
                      ? 'bg-[#1b4332] text-white'
                      : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb]'
                  }`}
                >
                  North Quad Dorms
                </button>
              </>
            )}

            {(selectedSector === 'all' || selectedSector === 'transit') && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedFacilityChip(selectedFacilityChip === 'Blue Line' ? null : 'Blue Line')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedFacilityChip === 'Blue Line'
                      ? 'bg-[#a23e18] text-white'
                      : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#ffdbcf]/50'
                  }`}
                >
                  Blue Line Shuttle (#12 &amp; #14)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFacilityChip(selectedFacilityChip === 'Red Line' ? null : 'Red Line')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedFacilityChip === 'Red Line'
                      ? 'bg-[#a23e18] text-white'
                      : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#ffdbcf]/50'
                  }`}
                >
                  Red Line Express (#07)
                </button>
              </>
            )}

            {(selectedSector === 'all' || selectedSector === 'athletics') && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedFacilityChip(selectedFacilityChip === 'Arena' ? null : 'Arena')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedFacilityChip === 'Arena'
                      ? 'bg-[#1b4332] text-white'
                      : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb]'
                  }`}
                >
                  Caldwell Sports Arena
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFacilityChip(selectedFacilityChip === 'Gym' ? null : 'Gym')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedFacilityChip === 'Gym'
                      ? 'bg-[#1b4332] text-white'
                      : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb]'
                  }`}
                >
                  Varsity Locker &amp; Gym
                </button>
              </>
            )}

            {(selectedSector === 'all' || selectedSector === 'student_life') && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedFacilityChip(selectedFacilityChip === 'Student Union' ? null : 'Student Union')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedFacilityChip === 'Student Union'
                      ? 'bg-[#1b4332] text-white'
                      : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb]'
                  }`}
                >
                  Student Union Center
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFacilityChip(selectedFacilityChip === 'Dining' ? null : 'Dining')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedFacilityChip === 'Dining'
                      ? 'bg-[#1b4332] text-white'
                      : 'bg-white border border-[#d5e7da] text-[#414844] hover:bg-[#e6f8eb]'
                  }`}
                >
                  Dining Hall East
                </button>
              </>
            )}
          </div>

          {/* Quick Filter Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-nowrap border-t border-[#e0f2e6] pt-2">
            <button
              type="button"
              onClick={() => setSelectedPill('all')}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedPill === 'all'
                  ? 'bg-[#012d1d] text-white shadow-xs'
                  : 'bg-white text-[#101f17] border border-[#d5e7da] hover:bg-[#e6f8eb]'
              }`}
            >
              <span>All Statuses</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedPill === 'all' ? 'bg-[#1b4332] text-white' : 'bg-[#e0f2e6] text-[#012d1d]'}`}>
                {filteredItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPill('lost')}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedPill === 'lost'
                  ? 'bg-[#a23e18] text-white shadow-xs'
                  : 'bg-white text-[#101f17] border border-[#d5e7da] hover:bg-[#ffdbcf]/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#a23e18]" />
              <span>Lost Reports</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#ffdbcf] text-[#a23e18] text-[10px] font-bold">
                {filteredItems.filter((i) => i.type === 'lost').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPill('found')}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedPill === 'found'
                  ? 'bg-[#1b4332] text-white shadow-xs'
                  : 'bg-white text-[#101f17] border border-[#d5e7da] hover:bg-[#e6f8eb]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#c1ecd4]" />
              <span>Found in Custody</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#e0f2e6] text-[#012d1d] text-[10px]">
                {filteredItems.filter((i) => i.type === 'found').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPill('matches')}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedPill === 'matches'
                  ? 'bg-[#5e3000] text-white shadow-xs'
                  : 'bg-white text-[#101f17] border border-[#d5e7da] hover:bg-[#ffdcc3]/50'
              }`}
            >
              <span className="material-symbols-outlined text-base text-[#a23e18]">auto_awesome</span>
              <span>Potential Matches</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#ffdcc3] text-[#5e3000] text-[10px] font-bold">
                12
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Body Grid: Sidebar (280px) + Results Feed (Flex 1) */}
      <section className="w-full">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column / Filter Controls */}
          <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4">
            {/* Safe Custody Widget */}
            <div className="w-full p-4 rounded-xl bg-white border border-[#d5e7da] shadow-sm flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#012d1d] text-xl">desk</span>
                  <span className="text-[16px] text-[#012d1d] font-bold">Custody Stations</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#c1ecd4] text-[#002114] text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1b4332] animate-pulse" />
                  5 Campus Desks
                </span>
              </div>
              <p className="text-[13px] text-[#414844] leading-snug">
                <strong>{currentCampusInfo.name}</strong><br />
                Connected with student union, dorms, and transit dispatch.
              </p>
              <div className="pt-2 flex items-center justify-between text-[12px] text-[#012d1d] font-semibold border-t border-[#e0f2e6]">
                <button
                  type="button"
                  onClick={onOpenCampusDesk}
                  className="underline hover:text-[#1b4332] cursor-pointer flex items-center gap-1"
                >
                  <span>View All 5 Handover Desks</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Filter Card */}
            <div className="w-full bg-white p-4 rounded-xl border border-[#d5e7da] shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#012d1d] text-lg">filter_alt</span>
                  <span className="text-[16px] font-bold text-[#101f17]">Filters</span>
                </div>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-[12px] text-[#a23e18] hover:underline font-semibold cursor-pointer"
                >
                  Reset all
                </button>
              </div>

              {/* Status Accordion */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#414844]">
                  Item Status
                </span>
                <div className="flex flex-col gap-2 text-[13px] text-[#101f17]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={statusFilters.in_custody}
                      onChange={(e) => setStatusFilters({ ...statusFilters, in_custody: e.target.checked })}
                      className="w-4 h-4 rounded text-[#1b4332] accent-[#1b4332] cursor-pointer"
                    />
                    <span>Found in Safe Custody</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={statusFilters.active_search}
                      onChange={(e) => setStatusFilters({ ...statusFilters, active_search: e.target.checked })}
                      className="w-4 h-4 rounded text-[#1b4332] accent-[#1b4332] cursor-pointer"
                    />
                    <span>Lost Reports (Searching)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={statusFilters.under_review}
                      onChange={(e) => setStatusFilters({ ...statusFilters, under_review: e.target.checked })}
                      className="w-4 h-4 rounded text-[#1b4332] accent-[#1b4332] cursor-pointer"
                    />
                    <span>Under Claim Review</span>
                  </label>
                </div>
              </div>

              {/* Category Multi-Select */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#e0f2e6]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#414844]">
                  Category
                </span>
                <div className="flex flex-col gap-2 text-[13px] text-[#101f17]">
                  {Object.keys(categoryFilters).map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={categoryFilters[cat]}
                        onChange={(e) => setCategoryFilters({ ...categoryFilters, [cat]: e.target.checked })}
                        className="w-4 h-4 rounded text-[#1b4332] accent-[#1b4332] cursor-pointer"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Horizon */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#e0f2e6]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#414844]">
                  Time Horizon
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[12px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setTimeHorizon('24h')}
                    className={`px-2 py-1.5 rounded-lg transition-colors text-center cursor-pointer ${
                      timeHorizon === '24h' ? 'bg-[#1b4332] text-white' : 'bg-[#e0f2e6] text-[#101f17] hover:bg-[#d5e7da]'
                    }`}
                  >
                    Past 24h
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeHorizon('7d')}
                    className={`px-2 py-1.5 rounded-lg transition-colors text-center cursor-pointer ${
                      timeHorizon === '7d' ? 'bg-[#1b4332] text-white' : 'bg-[#e0f2e6] text-[#101f17] hover:bg-[#d5e7da]'
                    }`}
                  >
                    Past 7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeHorizon('30d')}
                    className={`px-2 py-1.5 rounded-lg transition-colors text-center cursor-pointer ${
                      timeHorizon === '30d' ? 'bg-[#1b4332] text-white' : 'bg-[#e0f2e6] text-[#101f17] hover:bg-[#d5e7da]'
                    }`}
                  >
                    Past 30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeHorizon('custom')}
                    className={`px-2 py-1.5 rounded-lg transition-colors text-center cursor-pointer ${
                      timeHorizon === 'custom' ? 'bg-[#1b4332] text-white' : 'bg-[#e0f2e6] text-[#101f17] hover:bg-[#d5e7da]'
                    }`}
                  >
                    All Semesters
                  </button>
                </div>
              </div>
            </div>

            {/* Cross-Campus Dispatch Reassurance Notice */}
            <div className="w-full p-4 rounded-xl bg-[#dbede0]/70 border border-[#c1ecd4] flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#012d1d] text-lg shrink-0 mt-0.5">policy</span>
              <p className="text-[12px] text-[#414844] leading-relaxed">
                Campus safety coordinates cross-campus transfers. If an item is found at Downtown Medical, you can request delivery to Student Union Desk.
              </p>
            </div>
          </aside>

          {/* Right Main Feed */}
          <main className="flex-1 w-full flex flex-col gap-4">
            {/* Results Bar */}
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 px-4 rounded-xl border border-[#d5e7da] shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-bold text-[#012d1d]">Campus Listings</span>
                <span className="text-[13px] text-[#414844]">
                  Showing <strong className="text-[#101f17]">{filteredItems.length}</strong> verified records
                </span>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-[12px] font-semibold text-[#414844] whitespace-nowrap" htmlFor="sortSelector">
                  Sort:
                </label>
                <div className="relative inline-flex items-center">
                  <select
                    id="sortSelector"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-[#e6f8eb] text-[13px] font-semibold text-[#101f17] pl-3 pr-8 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b4332] cursor-pointer border border-[#c1ecd4]"
                  >
                    <option value="recent">Most Recent First</option>
                    <option value="confidence">Highest Match Confidence</option>
                    <option value="location">Building (A-Z)</option>
                    <option value="category">Category</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 text-[#414844] text-base pointer-events-none">
                    expand_more
                  </span>
                </div>

                <div className="hidden md:flex items-center bg-[#e6f8eb] rounded-lg p-0.5 border border-[#c1ecd4]">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1 rounded cursor-pointer ${
                      viewMode === 'grid' ? 'bg-white text-[#012d1d] shadow-xs font-bold' : 'text-[#414844] hover:text-[#101f17]'
                    }`}
                    title="Grid view"
                  >
                    <span className="material-symbols-outlined text-lg">grid_view</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1 rounded cursor-pointer ${
                      viewMode === 'list' ? 'bg-white text-[#012d1d] shadow-xs font-bold' : 'text-[#414844] hover:text-[#101f17]'
                    }`}
                    title="List view"
                  >
                    <span className="material-symbols-outlined text-lg">view_list</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <div className="py-12 text-center bg-white border border-[#d5e7da] rounded-xl p-8 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-[#717973] text-5xl mb-2">search_off</span>
                <h3 className="text-[20px] font-bold text-[#101f17]">No items found matching this campus filter</h3>
                <p className="text-[14px] text-[#414844] max-w-md mx-auto mt-1 mb-4">
                  Try switching to "All Campuses (System-Wide)" or clearing sector filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCampus('all-campuses');
                    resetAllFilters();
                  }}
                  className="px-4 py-2 rounded-lg bg-[#1b4332] text-white text-[13px] font-semibold hover:bg-[#012d1d] transition-colors"
                >
                  View All Campus Records
                </button>
              </div>
            )}

            {/* Responsive Items Grid / List */}
            <div
              className={`w-full ${
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'flex flex-col gap-3'
              }`}
            >
              {filteredItems.map((item) => {
                const isFound = item.type === 'found';
                const isLost = item.type === 'lost';
                const hasMatch = item.status === 'under_review' || Boolean(item.matchScore);
                const isReunited = item.status === 'reunited';

                return (
                  <article
                    key={item.id}
                    className="flex flex-col bg-white rounded-xl overflow-hidden border border-[#d5e7da] shadow-xs hover:shadow-md hover:border-[#1b4332]/40 transition-all duration-200 group"
                  >
                    {/* Media Container */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#e0f2e6]">
                      <img
                        src={item.imageUrl}
                        alt={item.imageAlt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />

                      {/* Status Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                        {isFound && !isReunited && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#012d1d] text-white text-[11px] font-bold shadow-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c1ecd4]" />
                            Found · Custody
                          </span>
                        )}
                        {isLost && !hasMatch && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#a23e18] text-white text-[11px] font-bold shadow-md">
                            <span className="material-symbols-outlined text-xs">report_problem</span>
                            Lost Report
                          </span>
                        )}
                        {hasMatch && !isReunited && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffdbcf] text-[#a23e18] text-[11px] font-bold shadow-md border border-[#a23e18]/20">
                            <span className="material-symbols-outlined text-xs text-[#a23e18]">auto_awesome</span>
                            Potential Match ({item.matchScore || 86}%)
                          </span>
                        )}
                        {isReunited && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#dbede0] text-[#012d1d] text-[11px] font-bold shadow-md">
                            <span className="material-symbols-outlined text-xs text-[#012d1d]">check_circle</span>
                            Reunited with Owner
                          </span>
                        )}
                      </div>

                      {/* Transit shuttle tag or bin badge */}
                      {item.shuttleLine ? (
                        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-[#a23e18] text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                          <span className="material-symbols-outlined text-xs">airport_shuttle</span>
                          <span>{item.shuttleLine}</span>
                        </span>
                      ) : (
                        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-white/95 backdrop-blur-xs text-[#101f17] text-[11px] font-semibold border border-[#d5e7da] shadow-xs">
                          {item.binNumber || item.reportCode}
                        </span>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[#414844] text-[11px]">
                          <span className="uppercase tracking-wider font-bold text-[#012d1d]">
                            {item.category}
                          </span>
                          <span className="flex items-center gap-1 text-[#414844] font-medium">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {item.dateLostOrFound}
                          </span>
                        </div>

                        <h2 className="text-[17px] text-[#101f17] font-bold line-clamp-1 group-hover:text-[#012d1d] transition-colors">
                          {item.title}
                        </h2>

                        <div className="flex items-center gap-1.5 text-[#414844] text-[12px]">
                          <span className="material-symbols-outlined text-base text-[#a23e18]">location_on</span>
                          <span className="truncate">{item.locationName}</span>
                          {item.roomZone && <span className="text-[#717973] truncate">· {item.roomZone}</span>}
                        </div>

                        <p className="text-[13px] text-[#414844] line-clamp-2 leading-snug mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      {/* Action Triggers */}
                      <div className="pt-2 border-t border-[#e0f2e6] flex flex-col gap-2">
                        {hasMatch ? (
                          <button
                            type="button"
                            onClick={() => onNavigateToMatch(item.matchCaseId)}
                            className="w-full py-2.5 px-4 rounded-lg bg-[#1b4332] text-white text-[13px] font-semibold hover:bg-[#012d1d] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base text-[#c1ecd4]">compare_arrows</span>
                            <span>View Comparison &amp; Claim</span>
                          </button>
                        ) : isFound && !isReunited ? (
                          <button
                            type="button"
                            onClick={() => setSelectedDetailItem(item)}
                            className="w-full py-2 px-4 rounded-lg bg-[#e6f8eb] hover:bg-[#dbede0] text-[#012d1d] text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5 border border-[#c1ecd4] cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">verified</span>
                            <span>Claim Ownership</span>
                          </button>
                        ) : isLost ? (
                          <button
                            type="button"
                            onClick={() => {
                              alert(`Thank you! A match tip for ${item.title} has been sent to Caldwell Safety.`);
                            }}
                            className="w-full py-2 px-4 rounded-lg bg-[#a23e18] hover:bg-[#822801] text-white text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                            <span>I Found This Item / Report Match</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="w-full py-2 px-4 rounded-lg bg-[#e0f2e6] text-[#717973] text-[12px] font-medium flex items-center justify-center gap-1.5 cursor-not-allowed"
                          >
                            <span className="material-symbols-outlined text-base">lock</span>
                            <span>Case Closed &amp; Archived</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <nav aria-label="Directory pagination" className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-4 border-t border-[#d5e7da]">
              <span className="text-[13px] text-[#414844]">
                Showing <strong className="text-[#101f17]">1–{filteredItems.length}</strong> campus items
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-[#d5e7da] bg-white text-[#414844] text-[12px] font-semibold flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg text-[13px] font-bold flex items-center justify-center bg-[#1b4332] text-white shadow-xs"
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(2)}
                  className="w-8 h-8 rounded-lg text-[13px] font-bold flex items-center justify-center bg-white border border-[#d5e7da] text-[#101f17] hover:bg-[#e0f2e6] cursor-pointer"
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-[#d5e7da] bg-white text-[#012d1d] hover:bg-[#e0f2e6] text-[12px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Next Page</span>
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            </nav>
          </main>
        </div>
      </section>

      {/* Item Quick Claim Modal */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 bg-[#012d1d]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#d5e7da] animate-in fade-in zoom-in-95 flex flex-col gap-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#e0f2e6]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#a23e18]">
                  Custody Record {selectedDetailItem.binNumber || selectedDetailItem.reportCode}
                </span>
                <h3 className="text-[20px] font-bold text-[#012d1d]">{selectedDetailItem.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="p-1 rounded-lg text-[#717973] hover:text-[#101f17] hover:bg-[#e0f2e6]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="w-full h-44 rounded-xl overflow-hidden bg-[#e0f2e6]">
              <img
                src={selectedDetailItem.imageUrl}
                alt={selectedDetailItem.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-[13px] text-[#414844] space-y-1.5">
              <p><strong>Found At:</strong> {selectedDetailItem.locationName} ({selectedDetailItem.roomZone})</p>
              {selectedDetailItem.shuttleLine && (
                <p><strong>Transit Line:</strong> {selectedDetailItem.shuttleLine}</p>
              )}
              <p><strong>Description:</strong> {selectedDetailItem.description}</p>
            </div>

            <div className="p-3 rounded-lg bg-[#e6f8eb] border border-[#c1ecd4] text-[12px] text-[#012d1d] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-[#012d1d]">verified_user</span>
              <span>Pickup requires valid student ID and distinctive identifier verification at the desk.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="px-4 py-2 rounded-lg bg-[#e0f2e6] text-[#101f17] text-[13px] font-semibold hover:bg-[#d5e7da]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDetailItem(null);
                  onNavigateToMatch();
                }}
                className="px-5 py-2 rounded-lg bg-[#012d1d] text-white text-[13px] font-bold hover:bg-[#1b4332] flex items-center gap-1.5"
              >
                <span>Proceed to Verification</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
