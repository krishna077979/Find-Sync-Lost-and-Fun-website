import React, { useState } from 'react';
import { UserProfile, CampusId } from '../types';
import {
  signInWithEmailPassword,
  signUpWithEmailPassword,
  signInWithGoogleOAuth,
  requestPasswordReset,
} from '../services/supabaseService';

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  
  // Login fields
  const [loginRole, setLoginRole] = useState<'student' | 'staff'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'student' | 'staff'>('student');
  const [signupCampus, setSignupCampus] = useState<CampusId>('main-campus');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  // Forgot password fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Google Sign-In with Supabase Auth
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      const { user, error } = await signInWithGoogleOAuth();
      setIsGoogleLoading(false);
      if (error) {
        setErrorMessage(error);
        return;
      }
      if (user) {
        setSuccessMessage(`Signed in as ${user.name}`);
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      setErrorMessage(err?.message || 'Google sign-in encountered an issue.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
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

    const emailToUse = trimmed.includes('@') ? trimmed : `${trimmed}@findsync.campus`;
    const { user, error } = await signInWithEmailPassword(emailToUse, password);
    setIsLoading(false);

    if (error) {
      setErrorMessage(error);
      return;
    }

    if (user) {
      setSuccessMessage(`Welcome back, ${user.name}!`);
      onLoginSuccess(user);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
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

    const { user, error, confirmationRequired } = await signUpWithEmailPassword(
      signupEmail.trim(),
      signupPassword,
      signupName.trim(),
      signupCampus
    );
    setIsLoading(false);

    if (error) {
      setErrorMessage(error);
      return;
    }

    if (confirmationRequired) {
      setSuccessMessage('Account registered! Please check your email inbox to verify your account.');
      return;
    }

    if (user) {
      setSuccessMessage(`Account created successfully for ${user.name}!`);
      onLoginSuccess(user);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address to receive password reset instructions.');
      return;
    }

    setIsLoading(true);
    const { success, error } = await requestPasswordReset(resetEmail.trim());
    setIsLoading(false);

    if (error) {
      setErrorMessage(error);
    } else if (success) {
      setResetSent(true);
    }
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
          <span>University Lost &amp; Found</span>
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
              {/* Login Role Option */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#101f17]">
                  Account Role Option
                </label>
                <div className="grid grid-cols-2 p-1 bg-[#e6f8eb] rounded-xl border border-[#c1ecd4]">
                  <button
                    type="button"
                    onClick={() => setLoginRole('student')}
                    className={`py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      loginRole === 'student' ? 'bg-white text-[#012d1d] shadow-xs' : 'text-[#414844] hover:text-[#012d1d]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">school</span>
                    <span>Student / Finder</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginRole('staff')}
                    className={`py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      loginRole === 'staff' ? 'bg-white text-[#a23e18] shadow-xs' : 'text-[#414844] hover:text-[#a23e18]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">shield_person</span>
                    <span>Campus Staff</span>
                  </button>
                </div>
              </div>

              {/* Login with Google Account */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || isGoogleLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#d5e7da] bg-white hover:bg-[#f4fbf6] active:bg-[#e6f8eb] text-[#101f17] font-semibold text-[13.5px] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs hover:border-[#012d1d]/40 disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#012d1d]/30 border-t-[#012d1d] rounded-full animate-spin" />
                      <span>Authenticating with Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Sign in with Google account</span>
                    </>
                  )}
                </button>

                <div className="relative my-1 flex items-center justify-center">
                  <div className="border-t border-[#e0f2e6] w-full" />
                  <span className="bg-white px-2.5 text-[11px] font-bold uppercase tracking-wider text-[#717973] absolute">
                    or continue with username / email
                  </span>
                </div>
              </div>

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
                    placeholder="Enter your email address"
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
                    <span>Sign In as {loginRole === 'student' ? 'Student' : 'Staff Officer'}</span>
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
              {/* Sign up with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-[#d5e7da] bg-white hover:bg-[#f4fbf6] active:bg-[#e6f8eb] text-[#101f17] font-semibold text-[13.5px] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs hover:border-[#012d1d]/40 disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#012d1d]/30 border-t-[#012d1d] rounded-full animate-spin" />
                    <span>Connecting Google profile...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign up with Google account</span>
                  </>
                )}
              </button>

              <div className="relative my-0.5 flex items-center justify-center">
                <div className="border-t border-[#e0f2e6] w-full" />
                <span className="bg-white px-2.5 text-[11px] font-bold uppercase tracking-wider text-[#717973] absolute">
                  or register with personal / college email
                </span>
              </div>

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
                  placeholder="Your full name"
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
                  <option value="main-campus">Main Campus</option>
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
          <span>FindSync</span>
        </div>
      </footer>
    </div>
  );
};
