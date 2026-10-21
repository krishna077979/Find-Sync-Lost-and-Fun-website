import React, { useState } from 'react';
import { ViewTab, Item, MatchCase, ClaimTracking, CampusId } from './types';
import { INITIAL_ITEMS, CURRENT_MATCH_CASE, INITIAL_CLAIM_TRACKING } from './data/mockData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ExploreView } from './components/ExploreView';
import { PotentialMatchesView } from './components/PotentialMatchesView';
import { ReportLostView } from './components/ReportLostView';
import { MyItemsView } from './components/MyItemsView';
import { AdminPortalView } from './components/AdminPortalView';
import { ReportFoundModal } from './components/ReportFoundModal';
import { CampusDeskModal } from './components/CampusDeskModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('explore');
  const [selectedCampus, setSelectedCampus] = useState<CampusId>('all-campuses');
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [matchCase, setMatchCase] = useState<MatchCase>(CURRENT_MATCH_CASE);
  const [claimTracking, setClaimTracking] = useState<ClaimTracking>(INITIAL_CLAIM_TRACKING);
  const [isReportFoundOpen, setIsReportFoundOpen] = useState(false);
  const [isCampusDeskOpen, setIsCampusDeskOpen] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'staff'>('student');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotificationToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSelectTab = (tab: ViewTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCampus = (campusId: CampusId) => {
    setSelectedCampus(campusId);
    showNotificationToast(
      campusId === 'all-campuses'
        ? 'Switched to System-Wide View (All Campuses, Dorms & Transit)'
        : `Switched campus view: ${campusId.replace('-', ' ').toUpperCase()}`
    );
  };

  const handleReportLostCreated = (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);
    showNotificationToast(`Lost report ${newItem.reportCode} created & broadcasting to campus matching engine.`);
  };

  const handleReportFoundCreated = (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);
    showNotificationToast(`Found item ${newItem.reportCode} logged into ${newItem.binNumber}. Match scan initiated.`);
  };

  const handleSubmitClaimSuccess = (claimId: string) => {
    setClaimTracking((prev) => ({
      ...prev,
      claimId,
      currentStep: 2,
      updatedAgo: 'Just now',
    }));
    setMatchCase((prev) => ({
      ...prev,
      status: 'claim_submitted',
    }));
    showNotificationToast(`Claim ${claimId} transmitted to Officer Ramirez at Student Union Desk Counter #2.`);
  };

  const handleApproveClaimByStaff = () => {
    setClaimTracking((prev) => ({
      ...prev,
      currentStep: 5, // Handover stage
      status: 'handover_ready',
      updatedAgo: 'Just now',
    }));
    showNotificationToast('Officer Ramirez approved ID and released headphones for Student Union pickup.');
  };

  return (
    <div className="min-h-screen bg-[#ecfef1] text-[#101f17] flex flex-col justify-between selection:bg-[#1b4332] selection:text-white font-sans">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#012d1d] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-[13px] font-semibold animate-in fade-in slide-in-from-bottom-2 border border-[#c1ecd4]">
          <span className="material-symbols-outlined text-lg text-[#c1ecd4]">task_alt</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navigation with Campus Switcher */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        selectedCampus={selectedCampus}
        onSelectCampus={handleSelectCampus}
        onOpenCampusDesk={() => setIsCampusDeskOpen(true)}
        onOpenReportFound={() => setIsReportFoundOpen(true)}
        matchesCount={1}
        unreadNotifications={2}
        userRole={userRole}
        onToggleRole={() => {
          const next = userRole === 'student' ? 'staff' : 'student';
          setUserRole(next);
          if (next === 'staff') {
            setActiveTab('admin-portal');
            showNotificationToast('Switched to Campus Safety Staff Officer Mode (#ST-44)');
          } else {
            setActiveTab('explore');
            showNotificationToast('Switched to Maya Lin (Student View)');
          }
        }}
      />

      {/* Main View Container */}
      <main className="w-full pt-20 pb-12 flex-1">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'explore' && (
            <ExploreView
              items={items}
              selectedCampus={selectedCampus}
              onSelectCampus={handleSelectCampus}
              onNavigateToMatch={() => handleSelectTab('potential-matches')}
              onNavigateToReportLost={() => handleSelectTab('report-lost')}
              onOpenReportFound={() => setIsReportFoundOpen(true)}
              onOpenCampusDesk={() => setIsCampusDeskOpen(true)}
            />
          )}

          {activeTab === 'potential-matches' && (
            <PotentialMatchesView
              matchCase={matchCase}
              onNavigateToTab={handleSelectTab}
              onSubmitClaimSuccess={handleSubmitClaimSuccess}
            />
          )}

          {activeTab === 'report-lost' && (
            <ReportLostView
              initialCampusId={selectedCampus}
              onReportCreated={handleReportLostCreated}
              onNavigateToTab={handleSelectTab}
              onNavigateToMatch={() => handleSelectTab('potential-matches')}
            />
          )}

          {activeTab === 'my-items' && (
            <MyItemsView
              items={items}
              claimTracking={claimTracking}
              onNavigateToTab={handleSelectTab}
              onNavigateToMatch={() => handleSelectTab('potential-matches')}
              onOpenReportFound={() => setIsReportFoundOpen(true)}
              onOpenCampusDesk={() => setIsCampusDeskOpen(true)}
            />
          )}

          {activeTab === 'admin-portal' && (
            <AdminPortalView
              items={items}
              matchCase={matchCase}
              onApproveClaim={handleApproveClaimByStaff}
              onNavigateToMatch={() => handleSelectTab('potential-matches')}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer onOpenCampusDesk={() => setIsCampusDeskOpen(true)} />

      {/* Report Found Item Modal */}
      <ReportFoundModal
        isOpen={isReportFoundOpen}
        onClose={() => setIsReportFoundOpen(false)}
        onItemFoundCreated={handleReportFoundCreated}
      />

      {/* Campus Handover Desks & Dispatch Info Modal */}
      <CampusDeskModal
        isOpen={isCampusDeskOpen}
        onClose={() => setIsCampusDeskOpen(false)}
        onOpenReportFound={() => {
          setIsCampusDeskOpen(false);
          setIsReportFoundOpen(true);
        }}
      />
    </div>
  );
}
