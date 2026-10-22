import React, { useState, useEffect } from 'react';
import { ViewTab, Item, MatchCase, ClaimTracking, CampusId, AppNotification, UserProfile } from './types';
import { INITIAL_ITEMS, CURRENT_MATCH_CASE, INITIAL_CLAIM_TRACKING, INITIAL_NOTIFICATIONS, INITIAL_USERS } from './data/mockData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { ExploreView } from './components/ExploreView';
import { PotentialMatchesView } from './components/PotentialMatchesView';
import { ReportLostView } from './components/ReportLostView';
import { MyItemsView } from './components/MyItemsView';
import { AdminPortalView } from './components/AdminPortalView';
import { ReportFoundModal } from './components/ReportFoundModal';
import { CampusDeskModal } from './components/CampusDeskModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AuthModal } from './components/AuthModal';
import { HelpSupportModal } from './components/HelpSupportModal';
import { TermsPrivacyModal } from './components/TermsPrivacyModal';
import { testConnection } from './lib/firebase';
import {
  seedInitialItemsIfEmpty,
  subscribeToItems,
  saveItemToFirestore,
  updateItemInFirestore,
  saveClaimToFirestore,
  subscribeToClaims,
} from './services/itemsService';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('home');
  const [selectedCampus, setSelectedCampus] = useState<CampusId>('all-campuses');
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [matchCase, setMatchCase] = useState<MatchCase>(CURRENT_MATCH_CASE);
  const [claimTracking, setClaimTracking] = useState<ClaimTracking>(INITIAL_CLAIM_TRACKING);
  const [isReportFoundOpen, setIsReportFoundOpen] = useState(false);
  const [isCampusDeskOpen, setIsCampusDeskOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [termsInitialTab, setTermsInitialTab] = useState<'privacy' | 'terms' | 'regulations'>('privacy');
  const [userRole, setUserRole] = useState<'student' | 'staff'>('student');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Firestore connection and real-time listeners on mount
  useEffect(() => {
    testConnection();
    seedInitialItemsIfEmpty();

    const unsubItems = subscribeToItems((updatedItems) => {
      setItems(updatedItems);
    });

    const unsubClaims = subscribeToClaims((updatedClaim) => {
      setClaimTracking(updatedClaim);
    });

    return () => {
      unsubItems();
      unsubClaims();
    };
  }, []);

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

  const handleReportLostCreated = async (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);
    showNotificationToast(`Lost report ${newItem.reportCode} created & broadcasting to campus matching engine.`);
    await saveItemToFirestore(newItem);
  };

  const handleReportFoundCreated = async (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);
    showNotificationToast(`Found item ${newItem.reportCode} logged into ${newItem.binNumber}. Match scan initiated.`);
    await saveItemToFirestore(newItem);
  };

  const handleSubmitClaimSuccess = async (claimId: string) => {
    const updatedClaim: ClaimTracking = {
      ...claimTracking,
      claimId,
      currentStep: 2,
      updatedAgo: 'Just now',
    };
    setClaimTracking(updatedClaim);
    setMatchCase((prev) => ({
      ...prev,
      status: 'claim_submitted',
    }));
    showNotificationToast(`Claim ${claimId} transmitted to Officer Ramirez at Student Union Desk Counter #2.`);
    await saveClaimToFirestore(updatedClaim);
  };

  const handleApproveClaimByStaff = async () => {
    const updatedClaim: ClaimTracking = {
      ...claimTracking,
      currentStep: 5, // Handover stage
      status: 'handover_ready',
      updatedAgo: 'Just now',
    };
    setClaimTracking(updatedClaim);
    showNotificationToast('Officer Ramirez approved ID and released headphones for Student Union pickup.');
    await saveClaimToFirestore(updatedClaim);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showNotificationToast('All notifications marked as read.');
  };

  const handleSelectNotification = (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);
    const role = user.role === 'staff' ? 'staff' : 'student';
    setUserRole(role);
    showNotificationToast(`Logged in as ${user.name} (${user.role.toUpperCase()})`);
  };

  const handleLogout = () => {
    setCurrentUser({
      id: 'guest',
      name: 'Guest Visitor',
      email: 'visitor@caldwell.edu',
      role: 'student',
      campusId: 'main-campus',
    });
    setUserRole('student');
    showNotificationToast('Signed out from Caldwell SSO session.');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#ecfef1] text-[#101f17] flex flex-col justify-between selection:bg-[#1b4332] selection:text-white font-sans">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#012d1d] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-[13px] font-semibold animate-in fade-in slide-in-from-bottom-2 border border-[#c1ecd4]">
          <span className="material-symbols-outlined text-lg text-[#c1ecd4]">task_alt</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navigation with Campus Switcher & Modals */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        selectedCampus={selectedCampus}
        onSelectCampus={handleSelectCampus}
        onOpenCampusDesk={() => setIsCampusDeskOpen(true)}
        onOpenReportFound={() => setIsReportFoundOpen(true)}
        onOpenNotificationsModal={() => setIsNotificationsOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        matchesCount={1}
        unreadNotifications={unreadCount}
        userRole={userRole}
        onToggleRole={() => {
          const next = userRole === 'student' ? 'staff' : 'student';
          setUserRole(next);
          if (next === 'staff') {
            setCurrentUser(INITIAL_USERS[1]);
            setActiveTab('admin-portal');
            showNotificationToast('Switched to Campus Safety Staff Officer Mode (#ST-44)');
          } else {
            setCurrentUser(INITIAL_USERS[0]);
            setActiveTab('home');
            showNotificationToast('Switched to Maya Lin (Student View)');
          }
        }}
      />

      {/* Main View Container */}
      <main className="w-full pt-20 pb-12 flex-1">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'home' && (
            <HomeView
              items={items}
              selectedCampus={selectedCampus}
              onNavigateToTab={handleSelectTab}
              onOpenReportFound={() => setIsReportFoundOpen(true)}
              onOpenCampusDesk={() => setIsCampusDeskOpen(true)}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )}

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
              items={items}
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
              currentUser={currentUser}
              onSwitchToStaff={() => {
                setUserRole('staff');
                setCurrentUser(INITIAL_USERS[1]);
                showNotificationToast('Switched to Campus Safety Staff Officer Mode (#ST-44)');
              }}
              onApproveClaim={handleApproveClaimByStaff}
              onNavigateToMatch={() => handleSelectTab('potential-matches')}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer
        onOpenCampusDesk={() => setIsCampusDeskOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenTerms={() => {
          setTermsInitialTab('regulations');
          setIsTermsOpen(true);
        }}
        onOpenPrivacy={() => {
          setTermsInitialTab('privacy');
          setIsTermsOpen(true);
        }}
      />

      {/* Report Found Item Modal */}
      <ReportFoundModal
        isOpen={isReportFoundOpen}
        onClose={() => setIsReportFoundOpen(false)}
        onItemFoundCreated={handleReportFoundCreated}
        items={items}
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

      {/* Notifications Hub Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onSelectNotification={handleSelectNotification}
        onDismissNotification={handleDismissNotification}
        onNavigateToTab={handleSelectTab}
      />

      {/* Campus Single Sign-On and User Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
      />

      {/* Help, FAQs & Campus Guidance Modal */}
      <HelpSupportModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onOpenCampusDesk={() => {
          setIsHelpOpen(false);
          setIsCampusDeskOpen(true);
        }}
      />

      {/* Terms of Use, Privacy Policy & Property Regulations Modal */}
      <TermsPrivacyModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        initialTab={termsInitialTab}
      />
    </div>
  );
}
