import React, { useState, useEffect } from 'react';
import { ViewTab, Item, MatchCase, ClaimTracking, CampusId, AppNotification, UserProfile } from './types';
import { INITIAL_ITEMS, CURRENT_MATCH_CASE, INITIAL_CLAIM_TRACKING, INITIAL_NOTIFICATIONS } from './data/mockData';
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
import { reverseGeocodeUniversity } from './services/universityLocationService';
import { isSupabaseConfigured, supabase, testSupabaseConnection } from './lib/supabase';
import {
  seedInitialSupabaseDataIfEmpty,
  subscribeToSupabaseItems,
  saveItemToSupabase,
  saveClaimToSupabase,
  subscribeToSupabaseClaims,
} from './services/supabaseService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
  if (isSupabaseConfigured) return null;
  try {
    const stored = localStorage.getItem('findsync_user_session');
    if (stored) {
      const user = JSON.parse(stored) as UserProfile;
      const legacyDemo = user.name === 'Maya Lin' || user.email === 'maya.lin@example.edu' || user.email === 'maya.lin@gmail.com';
      if (legacyDemo) {
        localStorage.removeItem('findsync_user_session');
        return null;
      }
      return user;
    }
  } catch {
    // Ignore invalid saved session
  }
  return null;
});

  const [userRole, setUserRole] = useState<'student' | 'staff'>(() => {
    if (isSupabaseConfigured) return 'student';
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
  const [selectedCampus, setSelectedCampus] = useState<CampusId>('main-campus');
  const [detectedUniversity, setDetectedUniversity] = useState<string | null>(null);
  const [hasDetectedLocation, setHasDetectedLocation] = useState(false);
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [matchCase, setMatchCase] = useState<MatchCase | null>(CURRENT_MATCH_CASE);
  const [claimTracking, setClaimTracking] = useState<ClaimTracking | null>(INITIAL_CLAIM_TRACKING);
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

  const handleUniversityDetected = (name: string | null) => {
    setDetectedUniversity(name);
    setHasDetectedLocation(true);
  };

  const handleDetectUniversity = async () => {
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      showNotificationToast('Location detection requires a secure HTTPS connection.');
      return;
    }
    if (!navigator.geolocation) {
      showNotificationToast('Location is not available in this browser.');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });
      setHasDetectedLocation(true);
      setDetectedUniversity(null);
      const name = await reverseGeocodeUniversity(position.coords.latitude, position.coords.longitude);
      setDetectedUniversity(name);
      showNotificationToast(name ? `Nearby university identified: ${name}` : 'No nearby university was found for this GPS location.');
    } catch (error) {
      const message = error instanceof GeolocationPositionError && error.code === error.PERMISSION_DENIED
        ? 'Location permission was denied. Allow location access in your browser to identify a nearby university.'
        : 'Could not determine your location. Check GPS or network access and try again.';
      showNotificationToast(message);
    }
  };

  const handleReportLostCreated = async (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);
    try {
      await saveItemToSupabase(newItem);
      showNotificationToast(`Lost report ${newItem.reportCode} created successfully.`);
    } catch (error) {
      setItems((prev) => prev.filter((item) => item.id !== newItem.id));
      showNotificationToast(error instanceof Error ? error.message : 'Could not save the lost report.');
    }
  };

  const handleReportFoundCreated = async (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);
    try {
      await saveItemToSupabase(newItem);
      showNotificationToast(`Found item ${newItem.reportCode} logged into ${newItem.binNumber}.`);
    } catch (error) {
      setItems((prev) => prev.filter((item) => item.id !== newItem.id));
      showNotificationToast(error instanceof Error ? error.message : 'Could not save the found item.');
    }
  };

  const handleSubmitClaimSuccess = async (claimId: string) => {
    if (!matchCase) throw new Error('There is no active match to claim.');
    const updatedClaim: ClaimTracking = {
      claimId,
      itemTitle: matchCase.lostItem.title,
      reportNumber: matchCase.lostItem.reportCode,
      status: 'under_review',
      currentStep: 2,
      updatedAgo: 'Just now',
      submittedProof: matchCase.claimDetails?.covertMarkers ?? '',
      reviewingOfficer: '',
      officeLocation: '',
      estimatedVerification: '',
    };
    try {
      await saveClaimToSupabase(updatedClaim);
      setClaimTracking(updatedClaim);
      setMatchCase((prev) => prev ? ({ ...prev, status: 'claim_submitted' }) : prev);
      showNotificationToast(`Claim ${claimId} submitted for review.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save the claim.';
      showNotificationToast(message);
      throw new Error(message);
    }
  };

  const handleApproveClaimByStaff = async () => {
    if (!claimTracking) return;
    const updatedClaim: ClaimTracking = {
      ...claimTracking,
      currentStep: 5, // Handover stage
      status: 'handover_ready',
      updatedAgo: 'Just now',
    };
    try {
      await saveClaimToSupabase(updatedClaim, true);
      setClaimTracking(updatedClaim);
      showNotificationToast('Claim approved and ready for handover.');
    } catch (error) {
      showNotificationToast(error instanceof Error ? error.message : 'Could not update the claim.');
    }
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
    if (isSupabaseConfigured) {
      showNotificationToast('Use the sign-in screen to change authenticated accounts.');
      return;
    }
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

  const handleProfileUpdated = (user: UserProfile) => {
    setCurrentUser(user);
    if (!isSupabaseConfigured) {
      try {
        localStorage.setItem('findsync_user_session', JSON.stringify(user));
        const stored = localStorage.getItem('findsync_registered_users');
        const parsed: unknown = stored ? JSON.parse(stored) : [];
        if (Array.isArray(parsed)) {
          const alreadyRegistered = parsed.some((entry) =>
            entry && typeof entry === 'object' && 'id' in entry && entry.id === user.id
          );
          const next = alreadyRegistered
            ? parsed.map((entry) => entry && typeof entry === 'object' && 'id' in entry && entry.id === user.id ? user : entry)
            : [...parsed, user];
          localStorage.setItem('findsync_registered_users', JSON.stringify(next));
        } else {
          localStorage.setItem('findsync_registered_users', JSON.stringify([user]));
        }
      } catch {
        // Ignore local demo storage errors.
      }
    }
    showNotificationToast('Profile settings saved.');
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) showNotificationToast(`Could not sign out: ${error.message}`);
    }
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
        detectedUniversity={detectedUniversity}
        hasDetectedLocation={hasDetectedLocation}
        onDetectUniversity={handleDetectUniversity}
        onSelectCampus={handleSelectCampus}
        onOpenCampusDesk={() => setIsCampusDeskOpen(true)}
        onOpenReportFound={() => setIsReportFoundOpen(true)}
        onOpenNotificationsModal={() => setIsNotificationsOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        matchesCount={matchCase ? 1 : 0}
        unreadNotifications={unreadCount}
        notifications={notifications}
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
              detectedUniversity={detectedUniversity}
              hasDetectedLocation={hasDetectedLocation}
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
              campusId={selectedCampus}
              onUniversityDetected={handleUniversityDetected}
              onNavigateToTab={handleSelectTab}
              onSubmitClaimSuccess={handleSubmitClaimSuccess}
            />
          )}

          {activeTab === 'report-lost' && (
            <ReportLostView
              initialCampusId={selectedCampus}
              onUniversityDetected={handleUniversityDetected}
              currentUser={currentUser}
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
              currentUserId={currentUser.id}
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
              hasActiveClaim={Boolean(claimTracking)}
              claimTracking={claimTracking}
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
        onUniversityDetected={handleUniversityDetected}
        currentUser={currentUser}
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
      {currentUser && <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onProfileUpdated={handleProfileUpdated}
        onLogout={handleLogout}
      />}

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
