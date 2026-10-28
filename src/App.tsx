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
import { LiveCampusRadarModal } from './components/LiveCampusRadarModal';
import { reverseGeocodeUniversity } from './services/universityLocationService';
import { supabase, testSupabaseConnection, isSupabaseConfigured } from './lib/supabase';
import {
  seedInitialSupabaseDataIfEmpty,
  subscribeToSupabaseItems,
  saveItemToSupabase,
  updateItemInSupabase,
  saveClaimToSupabase,
  subscribeToSupabaseClaims,
  getOrCreateUserProfile,
  signOutFromSupabase,
  fetchUserNotificationsFromSupabase,
} from './services/supabaseService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'staff'>('student');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [activeTab, setActiveTab] = useState<ViewTab>('home');
  const [selectedCampus, setSelectedCampus] = useState<CampusId>('main-campus');
  const [detectedUniversity, setDetectedUniversity] = useState<string | null>(null);
  const [hasDetectedLocation, setHasDetectedLocation] = useState(false);
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [matchCase, setMatchCase] = useState<MatchCase | null>(CURRENT_MATCH_CASE);
  const [claimTracking, setClaimTracking] = useState<ClaimTracking | null>(INITIAL_CLAIM_TRACKING);
  const [isReportFoundOpen, setIsReportFoundOpen] = useState(false);
  const [isLiveRadarOpen, setIsLiveRadarOpen] = useState(false);
  const [isCampusDeskOpen, setIsCampusDeskOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [termsInitialTab, setTermsInitialTab] = useState<'privacy' | 'terms' | 'regulations'>('privacy');
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Supabase Auth state, connection, and real-time listeners on mount
  useEffect(() => {
    let isMounted = true;

    testSupabaseConnection();
    seedInitialSupabaseDataIfEmpty();

    // 1. Initial Auth Session Restoration & Verification
    const restoreSession = async () => {
      try {
        if (!isSupabaseConfigured) {
          // In disconnected dev/preview fallback, check saved session or allow quick start
          const stored = localStorage.getItem('findsync_user_session');
          if (stored && isMounted) {
            try {
              const u = JSON.parse(stored) as UserProfile;
              if (u.name === 'Maya Lin' || u.email === 'maya.lin@example.edu' || u.email === 'maya.lin@gmail.com') {
                localStorage.removeItem('findsync_user_session');
                setIsAuthChecking(false);
                return;
              }
              setCurrentUser(u);
              setUserRole(u.role === 'staff' || u.role === 'admin' ? 'staff' : 'student');
            } catch {
              // ignore
            }
          }
          if (isMounted) setIsAuthChecking(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          const profile = await getOrCreateUserProfile(session.user);
          if (isMounted) {
            setCurrentUser(profile);
            setUserRole(profile.role === 'staff' || profile.role === 'admin' ? 'staff' : 'student');
          }
        }
      } catch (err) {
        console.warn('Initial session check note:', err);
      } finally {
        if (isMounted) {
          setIsAuthChecking(false);
        }
      }
    };

    restoreSession();

    // 2. Real-time Auth State Subscription
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        try {
          const profile = await getOrCreateUserProfile(session.user);
          if (isMounted) {
            setCurrentUser(profile);
            setUserRole(profile.role === 'staff' || profile.role === 'admin' ? 'staff' : 'student');
            setIsAuthChecking(false);

            // Clean OAuth redirect fragments from URL
            if (window.location.hash || window.location.search.includes('code=')) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }
        } catch (e) {
          console.warn('Profile resolution on auth state change note:', e);
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setCurrentUser(null);
          setUserRole('student');
          setIsAuthChecking(false);
          try {
            localStorage.removeItem('findsync_user_session');
          } catch {
            // ignore
          }
        }
      }
    });

    // 3. Real-time Data Subscriptions
    const unsubItems = subscribeToSupabaseItems((updatedItems) => {
      if (isMounted) setItems(updatedItems);
    });

    const unsubClaims = subscribeToSupabaseClaims((updatedClaim) => {
      if (isMounted) setClaimTracking(updatedClaim);
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
      unsubItems();
      unsubClaims();
    };
  }, []);

  // Sync user notifications when authenticated user changes
  useEffect(() => {
    if (currentUser?.id) {
      fetchUserNotificationsFromSupabase(currentUser.id).then((liveNotifs) => {
        if (liveNotifs && liveNotifs.length > 0) {
          setNotifications(liveNotifs);
        }
      });
    }
  }, [currentUser?.id]);

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
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
      });
      setHasDetectedLocation(true);
      setDetectedUniversity(null);
      const name = await reverseGeocodeUniversity(position.coords.latitude, position.coords.longitude);
      setDetectedUniversity(name);
      showNotificationToast(name ? `Nearby university identified: ${name}` : 'No nearby university was found for this GPS location.');
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
      showNotificationToast(code === 1
        ? 'Location permission was denied. Allow location access in your browser to identify a nearby university.'
        : 'Could not determine your location. Check GPS or network access and try again.');
    }
  };

  const handleReportLostCreated = async (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);
    showNotificationToast(`Lost report ${newItem.reportCode} created & broadcasting to campus matching engine.`);
    const result = await saveItemToSupabase(newItem, currentUser?.id);
    if (result.error) {
      showNotificationToast(`Note: ${result.error}`);
    }
  };

  const handleReportFoundCreated = async (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);
    showNotificationToast(`Found item ${newItem.reportCode} logged into ${newItem.binNumber}. Match scan initiated.`);
    const result = await saveItemToSupabase(newItem, currentUser?.id);
    if (result.error) {
      showNotificationToast(`Note: ${result.error}`);
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
    setClaimTracking(updatedClaim);
    setMatchCase((prev) => prev ? ({
      ...prev,
      status: 'claim_submitted',
    }) : prev);
    showNotificationToast(`Claim ${claimId} submitted for review.`);
    await saveClaimToSupabase(updatedClaim, matchCase.foundItem.id);
  };

  const handleApproveClaimByStaff = async () => {
    if (!claimTracking) return;
    const updatedClaim: ClaimTracking = {
      ...claimTracking,
      currentStep: 5,
      status: 'handover_ready',
      updatedAgo: 'Just now',
    };
    setClaimTracking(updatedClaim);
    showNotificationToast('Claim approved and ready for handover.');
    await saveClaimToSupabase(updatedClaim, matchCase?.foundItem.id);
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

  const handleLogout = async () => {
    await signOutFromSupabase();
    setCurrentUser(null);
    setUserRole('student');
    try {
      localStorage.removeItem('findsync_user_session');
    } catch {
      // ignore
    }
    setActiveTab('home');
    showNotificationToast('Signed out from FindSync session.');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Render authenticating screen while restoring session on initial load
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#fbfdf9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#e6f8eb] text-[#012d1d] flex items-center justify-center mb-4 shadow-sm border border-[#c1ecd4] animate-pulse">
          <span className="material-symbols-outlined text-3xl">verified_user</span>
        </div>
        <h2 className="text-xl font-bold text-[#012d1d]">Verifying Campus Session...</h2>
        <p className="text-sm text-[#414844] mt-1">Connecting to FindSync Institutional Auth</p>
      </div>
    );
  }

  // Unauthenticated users see the Login interface first
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
        onOpenLiveRadar={() => setIsLiveRadarOpen(true)}
        onOpenReportFound={() => setIsReportFoundOpen(true)}
        onOpenNotificationsModal={() => setIsNotificationsOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        detectedUniversity={detectedUniversity}
        hasDetectedLocation={hasDetectedLocation}
        onDetectUniversity={handleDetectUniversity}
        onOpenHelp={() => setIsHelpOpen(true)}
        matchesCount={matchCase ? 1 : 0}
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
              items={items}
              currentUser={currentUser}
              onReportCreated={handleReportLostCreated}
              onNavigateToTab={handleSelectTab}
              onNavigateToMatch={() => handleSelectTab('potential-matches')}
              onUniversityDetected={handleUniversityDetected}
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
              claimTracking={claimTracking}
              hasActiveClaim={Boolean(claimTracking)}
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
        currentUser={currentUser}
        onUniversityDetected={handleUniversityDetected}
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
      {currentUser && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          onProfileUpdated={setCurrentUser}
          onLogout={handleLogout}
        />
      )}

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

      {/* Real-time Campus Leaflet Radar Modal */}
      <LiveCampusRadarModal
        isOpen={isLiveRadarOpen}
        onClose={() => setIsLiveRadarOpen(false)}
        initialCampusId={selectedCampus}
        items={items}
        onSelectItem={(_item) => {
          setActiveTab('explore');
        }}
        onOpenReportLost={() => {
          setIsLiveRadarOpen(false);
          setActiveTab('report-lost');
        }}
        onOpenReportFound={() => {
          setIsLiveRadarOpen(false);
          setIsReportFoundOpen(true);
        }}
      />
    </div>
  );
}
