import React, { useState } from 'react';
import { UserProfile, CampusId } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  
  // Login fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'student' | 'staff'>('student');
  const [signupCampus, setSignupCampus] = useState<CampusId>('sage-bhopal');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  // Forgot password fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick fill demo user
  const handleSelectDemoUser = (role: 'student' | 'staff') => {
    const demo = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setIdentifier(demo.email);
    setPassword('campusPass123!');
    setErrorMessage(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your email or username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Check if email matches existing or staff pattern
      const matched = INITIAL_USERS.find(
        (u) => u.email.toLowerCase() === trimmed.toLowerCase() || u.name.toLowerCase() === trimmed.toLowerCase()
      );

      const isStaffPattern =
        trimmed.toLowerCase().includes('admin') ||
        trimmed.toLowerCase().includes('officer') ||
        trimmed.toLowerCase().includes('staff') ||
        (matched && matched.role === 'staff');

      const authenticatedUser: UserProfile = matched || {
        id: `usr-${Date.now()}`,
        name: trimmed.includes('@') ? trimmed.split('@')[0] : trimmed,
        email: trimmed.includes('@') ? trimmed : `${trimmed}@gmail.com`,
        role: isStaffPattern ? 'staff' : 'student',
        studentId: isStaffPattern ? 'STAFF-AUTH-01' : `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        campusId: 'sage-bhopal',
        department: isStaffPattern ? 'Campus Safety Desk' : 'Undergraduate Member',
      };

      setSuccessMessage(`Welcome back, ${authenticatedUser.name}!`);
      setTimeout(() => {
        onLoginSuccess(authenticatedUser);
      }, 600);
    }, 800);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signupName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address (personal or university emails accepted).');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: signupName.trim(),
        email: signupEmail.trim(),
        role: signupRole,
        studentId: signupRole === 'staff' ? `STAFF-${Date.now().toString().slice(-4)}` : `STU-${Date.now().toString().slice(-4)}`,
        campusId: signupCampus,
        department: signupRole === 'staff' ? 'Campus Safety Department' : 'University Studies',
      };

      setSuccessMessage(`Account created successfully for ${newUser.name}!`);
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 700);
    }, 900);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address to receive password reset instructions.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResetSent(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#fbfdf9] flex flex-col justify-between selection:bg-[#1b4332] selection:text-white">
      {/* Top institution brand banner */}
      <header className="w-full border-b border-[#e0f2e6] bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#012d1d] text-white flex items-center justify-center font-bold shadow-md shadow-[#012d1d]/20">
            <span className="material-symbols-outlined text-2xl">sync_saved_locally</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-extrabold tracking-tight text-[#012d1d]">FindSync</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#a23e18] bg-[#ffdbcf] px-2 py-0.5 rounded-full">
                Campus Portal
              </span>
            </div>
            <p className="text-[11px] text-[#717973] font-medium leading-none">
              Institutional Lost &amp; Found Network
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#414844] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#1b4332] animate-pulse" />
          <span>SAGE University Bhopal &amp; Associated Campuses</span>
        </div>
      </header>

      {/* Main Authentication Card Center */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl p-7 sm:p-9 shadow-xl border border-[#d5e7da] transition-all">
          {/* Header Title & Subtitle */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#e6f8eb] text-[#012d1d] mb-3">
              <span className="material-symbols-outlined text-2xl">
                {authMode === 'login' ? 'login' : authMode === 'signup' ? 'person_add' : 'lock_reset'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#012d1d] tracking-tight">
              {authMode === 'login' && 'Sign in to FindSync'}
              {authMode === 'signup' && 'Create Campus Account'}
              {authMode === 'forgot_password' && 'Reset your password'}
            </h1>
            <p className="text-[13px] text-[#717973] mt-1">
              {authMode === 'login' && 'Access reports, view matches, coordinate handovers and claim items'}
              {authMode === 'signup' && 'Personal or university email accepted. No mandatory college email'}
              {authMode === 'forgot_password' && 'Enter your email to receive recovery instructions'}
            </p>
          </div>

          {/* Quick Demo Selector for fast evaluation */}
          {authMode === 'login' && (
            <div className="mb-5 p-3 rounded-xl bg-[#f4fbf6] border border-[#c1ecd4]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#012d1d] block mb-1.5">
                Quick Demo Accounts (1-Click Fill):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectDemoUser('student')}
                  className="px-2.5 py-1.5 text-left rounded-lg bg-white border border-[#d5e7da] hover:border-[#012d1d] hover:bg-[#e6f8eb] transition-all cursor-pointer group"
                >
                  <div className="text-[12px] font-bold text-[#012d1d] group-hover:text-[#012d1d] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#012d1d]">school</span>
                    <span>Student / Finder</span>
                  </div>
                  <div className="text-[10px] text-[#717973] truncate">maya.lin@gmail.com</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDemoUser('staff')}
                  className="px-2.5 py-1.5 text-left rounded-lg bg-white border border-[#d5e7da] hover:border-[#a23e18] hover:bg-[#ffdbcf]/40 transition-all cursor-pointer group"
                >
                  <div className="text-[12px] font-bold text-[#a23e18] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#a23e18]">shield_person</span>
                    <span>Campus Staff Admin</span>
                  </div>
                  <div className="text-[10px] text-[#717973] truncate">officer.ramirez@bhopal...</div>
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-[#fde8e8] border border-[#f8b4b4] text-[#9b1c1c] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-[#def7ec] border border-[#84e1bc] text-[#03543f] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#101f17]" htmlFor="login-identifier">
                  Email Address or Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717973] material-symbols-outlined text-lg">
                    mail
                  </span>
                  <input
                    id="login-identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g., student@gmail.com or username"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#d5e7da] bg-white text-[#101f17] text-[14px] placeholder:text-[#717973] focus:outline-none focus:ring-2 focus:ring-[#012d1d] transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-[#101f17]" htmlFor="login-password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setAuthMode('forgot_password');
                    }}
                    className="text-[12px] font-bold text-[#a23e18] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717973] material-symbols-outlined text-lg">
                    lock
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#d5e7da] bg-white text-[#101f17] text-[14px] placeholder:text-[#717973] focus:outline-none focus:ring-2 focus:ring-[#012d1d] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717973] hover:text-[#101f17] p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#012d1d] text-white font-bold text-[14px] hover:bg-[#1b4332] active:scale-[0.99] transition-all shadow-md shadow-[#012d1d]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in securely...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-[#e0f2e6] text-center">
                <p className="text-[13px] text-[#717973]">
                  Don't have a campus account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setAuthMode('signup');
                    }}
                    className="font-bold text-[#012d1d] hover:underline cursor-pointer"
                  >
                    Create account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* SIGNUP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-[#101f17]" htmlFor="signup-name">
                  Full Name <span className="text-[#a23e18]">*</span>
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g., Maya Lin or Rahul Sharma"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#d5e7da] bg-white text-[#101f17] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-[#101f17]" htmlFor="signup-email">
                  Email Address <span className="text-[#a23e18]">*</span>
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Personal (e.g. Gmail) or campus email"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#d5e7da] bg-white text-[#101f17] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                />
                <span className="text-[11px] text-[#717973]">
                  Personal emails (Gmail, Outlook, etc.) are fully accepted.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#101f17]" htmlFor="signup-pwd">
                    Password <span className="text-[#a23e18]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="signup-pwd"
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-3 pr-8 py-2 rounded-xl border border-[#d5e7da] bg-white text-[#101f17] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#717973] hover:text-[#101f17] p-0.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">
                        {showSignupPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#101f17]" htmlFor="signup-confirm-pwd">
                    Confirm Password <span className="text-[#a23e18]">*</span>
                  </label>
                  <input
                    id="signup-confirm-pwd"
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3 py-2 rounded-xl border border-[#d5e7da] bg-white text-[#101f17] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-[#101f17]">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole('student')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      signupRole === 'student'
                        ? 'border-[#012d1d] bg-[#e6f8eb] text-[#012d1d]'
                        : 'border-[#d5e7da] bg-white text-[#414844] hover:bg-[#f4fbf6]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">school</span>
                      <span>Regular Student / Finder</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupRole('staff')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      signupRole === 'staff'
                        ? 'border-[#a23e18] bg-[#ffdbcf] text-[#a23e18]'
                        : 'border-[#d5e7da] bg-white text-[#414844] hover:bg-[#f4fbf6]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">security</span>
                      <span>Staff / Safety Officer</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-[#101f17]">Primary Campus</label>
                <select
                  value={signupCampus}
                  onChange={(e) => setSignupCampus(e.target.value as CampusId)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d5e7da] bg-white text-[#101f17] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                >
                  <option value="sage-bhopal">SAGE University, Bhopal (Main Campus)</option>
                  <option value="sage-indore">SAGE University, Indore Campus</option>
                  <option value="main-campus">Caldwell University - Main Quad</option>
                  <option value="medical-center">Health Sciences &amp; Medical Center</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#012d1d] text-white font-bold text-[14px] hover:bg-[#1b4332] active:scale-[0.99] transition-all shadow-md shadow-[#012d1d]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <span className="material-symbols-outlined text-base">check</span>
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-[#e0f2e6] text-center">
                <p className="text-[13px] text-[#717973]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setAuthMode('login');
                    }}
                    className="font-bold text-[#012d1d] hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {authMode === 'forgot_password' && (
            <div className="flex flex-col gap-4">
              {resetSent ? (
                <div className="p-4 rounded-xl bg-[#def7ec] border border-[#84e1bc] text-center flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-[#03543f]">mark_email_read</span>
                  <h3 className="text-sm font-bold text-[#03543f]">Recovery Email Transmitted</h3>
                  <p className="text-xs text-[#046c4e] leading-relaxed">
                    We've dispatched password reset instructions to <strong>{resetEmail}</strong>. Please check your inbox and spam folder.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setResetSent(false);
                      setAuthMode('login');
                    }}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] cursor-pointer"
                  >
                    Return to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-[#101f17]" htmlFor="reset-email">
                      Account Email Address
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g., student@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5e7da] bg-white text-[#101f17] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-[#012d1d] text-white font-bold text-[14px] hover:bg-[#1b4332] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending reset link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Recovery Link</span>
                        <span className="material-symbols-outlined text-base">forward_to_inbox</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setAuthMode('login');
                      }}
                      className="text-xs font-bold text-[#717973] hover:text-[#012d1d] cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full border-t border-[#e0f2e6] bg-white/50 px-6 py-4 text-center text-xs text-[#717973]">
        <div className="max-w-md mx-auto flex items-center justify-center gap-4 flex-wrap">
          <span>Official FindSync Institutional Campus Network</span>
          <span>·</span>
          <span>Encrypted Session</span>
          <span>·</span>
          <span>SAGE University Bhopal</span>
        </div>
      </footer>
    </div>
  );
};
