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
import { LoginView } from './components/LoginView';
import { testSupabaseConnection } from './lib/supabase';
import {
  seedInitialSupabaseDataIfEmpty,
  subscribeToSupabaseItems,
  saveItemToSupabase,
  updateItemInSupabase,
  saveClaimToSupabase,
  subscribeToSupabaseClaims,
} from './services/supabaseService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('findsync_user_session');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null; // Login screen appears first for unauthenticated users
  });

  const [userRole, setUserRole] = useState<'student' | 'staff'>(() => {
    try {
      const stored = localStorage.getItem('findsync_user_session');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role === 'staff' || u.role === 'admin') return 'staff';
      }
    } catch {
      // ignore
    }
    return 'student';
  });

  const [activeTab, setActiveTab] = useState<ViewTab>('home');
  const [selectedCampus, setSelectedCampus] = useState<CampusId>('sage-bhopal');
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
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Supabase connection and real-time listeners on mount
  useEffect(() => {
    testSupabaseConnection();
    seedInitialSupabaseDataIfEmpty();

    const unsubItems = subscribeToSupabaseItems((updatedItems) => {
      setItems(updatedItems);
    });

    const unsubClaims = subscribeToSupabaseClaims((updatedClaim) => {
      setClaimTracking(updatedClaim);
    });

    return () => {
      unsubItems();
      unsubClaims();
    };
  }, []);

  // Enforce role-based access control: regular students cannot access Admin Portal
  useEffect(() => {
    if (activeTab === 'admin-portal' && userRole !== 'staff') {
      setActiveTab('home');
      showNotificationToast('Admin Portal access is restricted to campus safety staff.');
    }
  }, [activeTab, userRole]);

  const showNotificationToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSelectTab = (tab: ViewTab) => {
    if (tab === 'admin-portal' && userRole !== 'staff') {
      showNotificationToast('Admin Portal access requires Campus Safety Officer credentials.');
      return;
    }
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
    await saveItemToSupabase(newItem);
  };

  const handleReportFoundCreated = async (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);
    showNotificationToast(`Found item ${newItem.reportCode} logged into ${newItem.binNumber}. Match scan initiated.`);
    await saveItemToSupabase(newItem);
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
    await saveClaimToSupabase(updatedClaim);
  };

  const handleApproveClaimByStaff = async () => {
    const updatedClaim: ClaimTracking = {
      ...claimTracking,
      currentStep: 5, // Handover stage
      status: 'handover_ready',
      updatedAgo: 'Just now',
    };
    setClaimTracking(updatedClaim);
    showNotificationToast('Officer Ramirez approved ID and released headphones for pickup.');
    await saveClaimToSupabase(updatedClaim);
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
    const role = user.role === 'staff' || user.role === 'admin' ? 'staff' : 'student';
    setUserRole(role);
    try {
      localStorage.setItem('findsync_user_session', JSON.stringify(user));
    } catch {
      // ignore
    }
    showNotificationToast(`Logged in as ${user.name} (${user.role.toUpperCase()})`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('findsync_user_session');
    } catch {
      // ignore
    }
    setActiveTab('home');
    showNotificationToast('Signed out from FindSync session.');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // CRITICAL: Unauthenticated users see the Login interface first.
  // No main navigation or private reports are displayed before authentication.
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#fbfdf9]">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#012d1d] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-[13px] font-semibold animate-in fade-in slide-in-from-bottom-2 border border-[#c1ecd4]">
            <span className="material-symbols-outlined text-lg text-[#c1ecd4]">task_alt</span>
            <span>{toastMessage}</span>
          </div>
        )}
        <LoginView
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            const role = user.role === 'staff' || user.role === 'admin' ? 'staff' : 'student';
            setUserRole(role);
            try {
              localStorage.setItem('findsync_user_session', JSON.stringify(user));
            } catch {
              // ignore
            }
            if (role === 'staff') {
              setActiveTab('admin-portal');
            } else {
              setActiveTab('home');
            }
            showNotificationToast(`Authenticated successfully as ${user.name}`);
          }}
        />
      </div>
    );
  }

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
        currentUser={currentUser}
        onLogout={handleLogout}
        onToggleRole={
          currentUser?.role === 'staff' || currentUser?.role === 'admin'
            ? () => {
                const next = userRole === 'student' ? 'staff' : 'student';
                setUserRole(next);
                if (next === 'staff') {
                  setActiveTab('admin-portal');
                  showNotificationToast('Returned to Campus Safety Staff Officer Mode');
                } else {
                  setActiveTab('home');
                  showNotificationToast('Previewing as Student / Finder View');
                }
              }
            : undefined
        }
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

          {activeTab === 'admin-portal' && userRole === 'staff' && (
            <AdminPortalView
              items={items}
              matchCase={matchCase}
              onApproveClaim={handleApproveClaimByStaff}
              onNavigateToMatch={() => handleSelectTab('potential-matches')}
              currentUser={currentUser || undefined}
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
        currentUser={currentUser || INITIAL_USERS[0]}
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
