import React, { useState } from 'react';
import { UserProfile, ViewTab, CampusId } from '../types';
import { CAMPUS_SITES } from '../data/mockData';
import { getCampusConfigurations } from '../data/campusConfig';

interface HeaderProps {
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenCampusDesk: () => void;
  onOpenReportFound: () => void;
  onOpenNotificationsModal?: () => void;
  onOpenAuthModal?: () => void;
  onOpenHelp?: () => void;
  selectedCampus: CampusId;
  onSelectCampus: (campusId: CampusId) => void;
  matchesCount?: number;
  unreadNotifications?: number;
  userRole: 'student' | 'staff';
  onToggleRole: () => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenCampusDesk,
  onOpenReportFound,
  onOpenNotificationsModal,
  onOpenAuthModal,
  onOpenHelp,
  selectedCampus,
  onSelectCampus,
  matchesCount = 1,
  unreadNotifications = 2,
  userRole,
  onToggleRole,
  currentUser,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCampusMenu, setShowCampusMenu] = useState(false);

  const campusConfigs = getCampusConfigurations();
  const currentCampus = campusConfigs.find((c) => c.id === selectedCampus) || campusConfigs[0] || CAMPUS_SITES[0];

  const baseNavItems: { id: ViewTab; label: string; badge?: string; isStaff?: boolean; action?: () => void }[] = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore & Search' },
    { id: 'potential-matches', label: 'Potential Matches', badge: matchesCount > 0 ? `${matchesCount} New` : undefined },
    { id: 'report-lost', label: 'Report Lost' },
    { id: 'report-found', label: 'Report Found', action: onOpenReportFound },
    { id: 'my-items', label: 'My Items & Claims' },
  ];

  if (userRole === 'staff') {
    baseNavItems.push({ id: 'admin-portal', label: 'Admin Portal', isStaff: true });
  }

  const navItems = baseNavItems;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff] shadow-[0_1px_8px_rgba(27,42,34,0.05)] border-b border-[#e0f2e6]">
      <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Brand Logo & Campus Switcher Lockup */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onSelectTab('home')}
          >
            <img
              alt="FindSync Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida/AEtjO1VwGbx8ssHDW91GqGR5gN87gcswDMO74hwi4XSHvdIKEvS3XJkNNFBBXO0iaffraiyV07KpSbnGAQGsiAIv-xNejIDcIbbYw8KtbFKv_X4MtAcWON76Bfu3gPh3gA2qMUOp5zJM7KyKIAjP8jqMObiLqcZ29hdYa-wTLAxGvUHvbY7FLPJUZdMGhImJ9FDJ8KHq26iaQq_ZoK9oxfmE7AXtinS5G612JyqHu_tIDBUzu8FRpNE0vmQGzGLR"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <span className="text-[17px] text-[#012d1d] tracking-tight font-bold leading-none">
                FindSync
              </span>
              <span className="text-[10px] text-[#414844] leading-tight font-semibold">
                Campus Hub
              </span>
            </div>
          </div>

          {/* Vertical Divider */}
          <span className="hidden sm:inline-block h-6 w-px bg-[#d5e7da]" />

          {/* Top-Bar Campus Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCampusMenu(!showCampusMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#e6f8eb] hover:bg-[#dbede0] text-[#012d1d] text-[12px] font-bold transition-all border border-[#c1ecd4] cursor-pointer"
              title="Switch University Campus or Facility"
            >
              <span className="material-symbols-outlined text-base text-[#a23e18]">location_on</span>
              <span className="max-w-[130px] sm:max-w-[180px] truncate text-left">
                {currentCampus.name}
              </span>
              <span className="material-symbols-outlined text-sm">unfold_more</span>
            </button>

            {/* Campus Dropdown Menu */}
            {showCampusMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowCampusMenu(false)}
                />
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#d5e7da] p-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="p-2 border-b border-[#e0f2e6]">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#a23e18] block">
                      Campus Network Switcher
                    </span>
                    <span className="text-[12px] text-[#414844]">Select university location or transit network</span>
                  </div>

                  <div className="py-1 flex flex-col gap-1">
                    {campusConfigs.map((site) => {
                      const isSelected = selectedCampus === site.id;
                      return (
                        <button
                          key={site.id}
                          type="button"
                          onClick={() => {
                            onSelectCampus(site.id);
                            setShowCampusMenu(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#1b4332] text-white shadow-xs'
                              : 'hover:bg-[#e0f2e6] text-[#101f17]'
                          }`}
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="text-[13px] font-bold leading-tight truncate">{site.name}</span>
                            <span className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-[#c1ecd4]' : 'text-[#717973]'}`}>
                              {site.address || site.tagline}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-[#e0f2e6] text-[#012d1d]'
                            }`}>
                              {site.areas.length} areas
                            </span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-base text-[#c1ecd4]">check</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    onSelectTab(item.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#1b4332] text-white shadow-sm'
                    : 'text-[#414844] hover:bg-[#dbede0] hover:text-[#101f17]'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#a23e18] text-white">
                    {item.badge}
                  </span>
                )}
                {item.isStaff && (
                  <span className="bg-[#dbede0] text-[#101f17] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    Staff
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Utility Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Campus Desk Button */}
          <button
            type="button"
            onClick={onOpenCampusDesk}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e6f8eb] text-[#101f17] hover:bg-[#dbede0] transition-colors text-[13px] font-semibold cursor-pointer border border-[#c1ecd4]"
          >
            <span className="material-symbols-outlined text-lg text-[#a23e18]">support_agent</span>
            <span>Campus Desks</span>
          </button>

          {/* Help & FAQs Button */}
          {onOpenHelp && (
            <button
              type="button"
              onClick={onOpenHelp}
              className="p-2 rounded-full text-[#414844] hover:bg-[#dbede0] hover:text-[#101f17] transition-colors cursor-pointer"
              title="Help, FAQs & Campus Guidelines"
            >
              <span className="material-symbols-outlined text-[22px]">help</span>
            </button>
          )}

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              aria-label="Notifications"
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full text-[#414844] hover:bg-[#dbede0] hover:text-[#101f17] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#a23e18] ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notification popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#d5e7da] p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#e0f2e6]">
                  <span className="text-[13px] font-bold text-[#012d1d]">Notifications</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenNotificationsModal) onOpenNotificationsModal();
                      setShowNotifications(false);
                    }}
                    className="text-[11px] text-[#a23e18] font-bold hover:underline"
                  >
                    View All Hub
                  </button>
                </div>
                <div className="flex flex-col gap-2 mt-2 max-h-72 overflow-y-auto">
                  <div
                    onClick={() => {
                      onSelectTab('potential-matches');
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-lg bg-[#ecfef1] hover:bg-[#e0f2e6] transition-colors cursor-pointer flex items-start gap-2.5 border border-[#c1ecd4]"
                  >
                    <span className="material-symbols-outlined text-[#a23e18] text-lg mt-0.5">auto_awesome</span>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-[#101f17]">86% Match Detected!</span>
                      <span className="text-[11px] text-[#414844]">Sony WH-1000XM4 pair logged at Student Union Desk Bin #E-14.</span>
                      <span className="text-[10px] text-[#a23e18] font-semibold mt-1">Click to view comparison →</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#faf8f5] hover:bg-[#f4f1ea] transition-colors cursor-pointer flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#012d1d] text-lg mt-0.5">airport_shuttle</span>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-[#101f17]">Transit Route Property Logged</span>
                      <span className="text-[11px] text-[#414844]">Blue Line Shuttle #12 turned in an Olive Green Kånken backpack.</span>
                      <span className="text-[10px] text-[#414844] mt-0.5">35 mins ago</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenNotificationsModal) onOpenNotificationsModal();
                    setShowNotifications(false);
                  }}
                  className="w-full mt-2 py-1.5 rounded-lg bg-[#e6f8eb] hover:bg-[#dbede0] text-[#012d1d] text-[11px] font-bold text-center block"
                >
                  Open Full Notification Center
                </button>
              </div>
            )}
          </div>

          {/* Profile & Role Switcher */}
          <div className="relative">
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-1 py-1 pr-2 rounded-full hover:bg-[#dbede0] transition-colors cursor-pointer border border-transparent hover:border-[#c1ecd4]"
            >
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#c1ecd4]"
                src={
                  userRole === 'student'
                    ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbf3G8HSF-ivKo4tb4pr1yc9N2z3g5MjMlZ1zlxGTrUICAsSqyPLbMYvMCHgXvSZtn_69uXi9Qk73gzkaflf7kDMJzpUh1wiqbRKMkrLN2jG5j6LTY7Z2gpJjjoJaWvTSRPiRHoNd3iMEMzDrELyvtp3e3BEKzQm_O8MBOpA5H_eJXeeLyBnr5lLY0kImxZQVN80sYF1V-gTJRzDXQyvqmZ5Bh_ByMZ8nG5SMX1RGsWIfBYgQIL74N-Q'
                    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
                }
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[13px] text-[#101f17] leading-tight font-bold">
                  {currentUser?.name || (userRole === 'student' ? 'Maya Lin' : 'Officer Ramirez')}
                </span>
                <span className="text-[11px] text-[#414844] leading-none">
                  {userRole === 'student' ? 'Student / Finder' : 'Campus Safety Officer'}
                </span>
              </div>
              <span className="material-symbols-outlined text-[#414844] text-base">expand_more</span>
            </div>

            {/* Profile Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#d5e7da] p-2 z-50 animate-in fade-in">
                <div className="p-2 border-b border-[#e0f2e6]">
                  <p className="text-[11px] text-[#414844] font-medium">Signed in as</p>
                  <p className="text-[13px] font-bold text-[#012d1d] truncate">
                    {currentUser?.email || (userRole === 'student' ? 'm.lin@gmail.com' : 'officer.ramirez@bhopal.edu')}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e6f8eb] text-[#012d1d]">
                    {userRole === 'staff' ? 'Campus Safety Admin' : 'Student / Finder Member'}
                  </span>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAuthModal) onOpenAuthModal();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-[#012d1d] hover:bg-[#e0f2e6] flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">manage_accounts</span>
                    <span>Account Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleRole();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-[#a23e18] hover:bg-[#ffdbcf]/50 flex items-center justify-between cursor-pointer"
                  >
                    <span>Switch Role View:</span>
                    <span className="font-bold underline">{userRole === 'student' ? 'Officer View' : 'Student View'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('my-items');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-[#101f17] hover:bg-[#e0f2e6] flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">inventory_2</span>
                    <span>My Reports &amp; Claims</span>
                  </button>
                  {userRole === 'staff' && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab('admin-portal');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-[#101f17] hover:bg-[#e0f2e6] flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">shield</span>
                      <span>Admin Portal</span>
                    </button>
                  )}
                  {onLogout && (
                    <div className="pt-1 mt-1 border-t border-[#e0f2e6]">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] font-bold text-[#a23e18] hover:bg-[#fde8e8] flex items-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        <span>Sign Out / Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-[#414844] hover:bg-[#dbede0]"
            aria-label="Toggle navigation"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#e0f2e6] bg-white px-4 py-3 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    onSelectTab(item.id);
                  }
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-[14px] font-semibold flex items-center justify-between ${
                  isActive ? 'bg-[#1b4332] text-white' : 'text-[#414844] hover:bg-[#e0f2e6]'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#a23e18] text-white">
                    {item.badge}
                  </span>
                )}
                {item.isStaff && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#dbede0] text-[#012d1d]">
                    Staff
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#e0f2e6] flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onOpenCampusDesk();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#e6f8eb] text-[#101f17] text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[#a23e18] text-base">support_agent</span>
              <span>All Campus Desks &amp; Shuttles</span>
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full py-2 px-3 rounded-lg bg-[#fde8e8] text-[#9b1c1c] text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Sign Out / Log Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
