import React, { useEffect, useState } from 'react';
import { CampusId, UserProfile } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getCampusConfigurations } from '../data/campusConfig';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  onProfileUpdated: (user: UserProfile) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
  onProfileUpdated,
  onLogout,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password' | 'profile'>('profile');
  const [roleSelection, setRoleSelection] = useState<'student' | 'staff'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [maskPhone, setMaskPhone] = useState(true);
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone ?? '');
  const [profileDepartment, setProfileDepartment] = useState(currentUser.department ?? '');
  const [profileCampus, setProfileCampus] = useState<CampusId>(currentUser.campusId);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(currentUser.avatarUrl ?? '');
  const [profileAvatarFile, setProfileAvatarFile] = useState<File | null>(null);
  const [profileAvatarPreview, setProfileAvatarPreview] = useState(currentUser.avatarUrl ?? '');
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    setProfileName(currentUser.name);
    setProfileEmail(currentUser.email);
    setProfilePhone(currentUser.phone ?? '');
    setProfileDepartment(currentUser.department ?? '');
    setProfileCampus(currentUser.campusId);
    setProfileAvatarUrl(currentUser.avatarUrl ?? '');
    setProfileAvatarPreview(currentUser.avatarUrl ?? '');
    setProfileAvatarFile(null);
  }, [currentUser]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileError(null);
    const name = profileName.trim();
    const emailAddress = profileEmail.trim();
    if (!name || !emailAddress || !emailAddress.includes('@')) {
      setProfileError('Enter your name and a valid email address.');
      return;
    }

    setIsSavingProfile(true);
    try {
      let avatarUrl = profileAvatarUrl.trim() || undefined;
      if (profileAvatarFile && isSupabaseConfigured) {
        const extension = profileAvatarFile.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
        const objectPath = `${currentUser.id}/avatar.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(objectPath, profileAvatarFile, {
            cacheControl: '3600',
            contentType: profileAvatarFile.type,
            upsert: true,
          });
        if (uploadError) throw new Error(`Could not upload profile picture: ${uploadError.message}`);
        avatarUrl = supabase.storage.from('avatars').getPublicUrl(objectPath).data.publicUrl;
      } else if (profileAvatarFile) {
        const bitmap = await createImageBitmap(profileAvatarFile);
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not prepare the profile picture.');
        const scale = Math.min(size / bitmap.width, size / bitmap.height);
        const width = bitmap.width * scale;
        const height = bitmap.height * scale;
        context.drawImage(bitmap, (size - width) / 2, (size - height) / 2, width, height);
        bitmap.close();
        avatarUrl = canvas.toDataURL('image/jpeg', 0.78);
      }

      const updatedProfile: UserProfile = {
        ...currentUser,
        name,
        email: isSupabaseConfigured ? currentUser.email : emailAddress,
        phone: profilePhone.trim() || undefined,
        department: profileDepartment.trim() || undefined,
        campusId: profileCampus,
        avatarUrl,
      };

      if (isSupabaseConfigured) {
        const emailChanged = emailAddress.toLowerCase() !== currentUser.email.toLowerCase();
        const { error: authUpdateError } = await supabase.auth.updateUser({
          data: {
            full_name: name,
            phone: profilePhone.trim() || null,
            department: profileDepartment.trim() || null,
            campus_id: profileCampus,
            avatar_url: avatarUrl ?? null,
          },
        });
        if (authUpdateError) throw new Error(authUpdateError.message);

        // Auth metadata keeps personal settings available even when an older
        // Supabase database is missing the optional profile columns/table.
        let directorySyncIssue: string | null = null;
        const { data: savedProfile, error } = await supabase
          .from('profiles')
          .update({
            full_name: name,
            department: profileDepartment.trim() || null,
            campus_id: profileCampus,
            avatar_url: avatarUrl ?? null,
          })
          .eq('id', currentUser.id)
          .select('id')
          .maybeSingle();

        if (error) {
          directorySyncIssue = error.message;
        } else if (!savedProfile && currentUser.role === 'student') {
          const { error: insertError } = await supabase.from('profiles').insert({
            id: currentUser.id,
            email: currentUser.email,
            full_name: name,
            role: 'student',
            department: profileDepartment.trim() || null,
            campus_id: profileCampus,
            avatar_url: avatarUrl ?? null,
          });
          if (insertError) directorySyncIssue = insertError.message;
        } else if (!savedProfile) {
          directorySyncIssue = 'Your account profile is missing. Ask a campus administrator to restore it.';
        }

        onProfileUpdated(updatedProfile);
        if (emailChanged) {
          const { error: emailUpdateError } = await supabase.auth.updateUser({ email: emailAddress });
          if (emailUpdateError) {
            setFeedbackMsg(`Profile saved, but the email could not be changed: ${emailUpdateError.message}`);
          } else {
            setFeedbackMsg(directorySyncIssue
              ? `Profile saved. Confirm the email change; campus directory sync needs attention: ${directorySyncIssue}`
              : 'Profile saved. Confirm the email change using the link sent to your inbox.');
          }
        } else {
          setFeedbackMsg(directorySyncIssue
            ? `Profile saved to your account, but campus directory sync failed: ${directorySyncIssue}`
            : 'Profile settings saved.');
        }
      } else {
        onProfileUpdated({ ...updatedProfile, email: emailAddress });
        setFeedbackMsg('Profile settings saved on this device.');
      }
      setIsEditingProfile(false);
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error
        && typeof error.message === 'string'
        ? error.message
        : typeof error === 'string' ? error : 'Could not save profile settings.';
      setProfileError(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!isOpen) return null;

  const handleGoogleSignInModal = () => {
    onClose();
    onLogout();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    onLogout();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    onLogout();
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#012d1d]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#d5e7da] animate-in fade-in zoom-in-95 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e0f2e6]">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#e6f8eb] text-[#012d1d] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-xl">account_circle</span>
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#a23e18]">
                University account
              </span>
              <h2 className="text-[18px] font-bold text-[#012d1d]">
                {mode === 'profile' && 'Campus Account & Identity'}
                {mode === 'login' && 'Sign In to FindSync'}
                {mode === 'register' && 'Register Campus Account'}
                {mode === 'forgot_password' && 'Password Recovery'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#717973] hover:text-[#101f17] hover:bg-[#e0f2e6]"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Feedback message banner */}
        {feedbackMsg && (
          <div className="p-3 rounded-lg bg-[#e6f8eb] text-[#012d1d] text-[13px] font-semibold border border-[#c1ecd4] flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* MODE: PROFILE & SWITCHER */}
        {mode === 'profile' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#ecfef1] border border-[#c1ecd4]">
              <div className="w-12 h-12 rounded-full bg-[#1b4332] text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-bold text-[#101f17] truncate">{currentUser.name}</h3>
                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    currentUser.role === 'staff' ? 'bg-[#1b4332] text-white' : 'bg-[#e0f2e6] text-[#012d1d]'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
                <span className="text-[12px] text-[#414844] truncate">{currentUser.email}</span>
                <span className="text-[11px] text-[#717973]">ID: {currentUser.studentId || 'Not provided'}</span>
              </div>
            </div>

            {/* Account Information Details */}
            <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-[#d5e7da] text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[#717973]">Department:</span>
                <span className="font-semibold text-[#101f17]">{currentUser.department || 'Campus Community'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#717973]">Phone Contact:</span>
                <span className="font-semibold text-[#101f17]">{currentUser.phone || 'Not added'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#717973]">Campus:</span>
                <span className="font-semibold text-[#101f17]">{getCampusConfigurations().find((campus) => campus.id === currentUser.campusId)?.name ?? 'Not selected'}</span>
              </div>
            </div>

            {!isEditingProfile ? (
              <button
                type="button"
                onClick={() => {
                  setProfileError(null);
                  setProfileAvatarFile(null);
                  setProfileAvatarPreview(currentUser.avatarUrl ?? '');
                  setIsEditingProfile(true);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-[#012d1d] text-white text-[13px] font-bold hover:bg-[#1b4332] transition-colors"
              >
                <span className="material-symbols-outlined text-base mr-1 align-middle">manage_accounts</span>
                Profile settings
              </button>
            ) : (
              <form onSubmit={saveProfile} className="flex flex-col gap-3 p-4 rounded-xl border border-[#c1ecd4] bg-[#f7fdf9]">
                <h3 className="text-sm font-bold text-[#012d1d]">Edit profile information</h3>
                <label className="flex flex-col gap-1 text-xs font-semibold text-[#414844]">
                  Full name
                  <input value={profileName} onChange={(event) => setProfileName(event.target.value)} required className="px-3 py-2 rounded-lg border border-[#d5e7da] bg-white text-sm text-[#101f17]" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold text-[#414844]">
                  Email address
                  <input type="email" value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} required className="px-3 py-2 rounded-lg border border-[#d5e7da] bg-white text-sm text-[#101f17]" />
                </label>
                {isSupabaseConfigured && <p className="-mt-1 text-[11px] leading-relaxed text-[#717973]">Email changes take effect after you confirm the message sent to your inbox.</p>}
                <label className="flex flex-col gap-1 text-xs font-semibold text-[#414844]">
                  Phone number
                  <input type="tel" autoComplete="tel" value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} placeholder="Add a contact number" className="px-3 py-2 rounded-lg border border-[#d5e7da] bg-white text-sm text-[#101f17]" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold text-[#414844]">
                  Department or course
                  <input value={profileDepartment} onChange={(event) => setProfileDepartment(event.target.value)} placeholder="Optional" className="px-3 py-2 rounded-lg border border-[#d5e7da] bg-white text-sm text-[#101f17]" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold text-[#414844]">
                  Upload profile picture
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      if (!file) return;
                      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
                        setProfileError('Choose a PNG, JPG, or WebP image.');
                        event.currentTarget.value = '';
                        return;
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        setProfileError('Choose an image smaller than 5 MB.');
                        event.currentTarget.value = '';
                        return;
                      }
                      setProfileError(null);
                      setProfileAvatarFile(file);
                      setProfileAvatarUrl('');
                      setProfileAvatarPreview(URL.createObjectURL(file));
                    }}
                    className="px-3 py-2 rounded-lg border border-[#d5e7da] bg-white text-sm text-[#101f17] file:mr-3 file:rounded-md file:border-0 file:bg-[#e6f8eb] file:px-3 file:py-1 file:font-semibold"
                  />
                </label>
                {profileAvatarPreview && (
                  <img
                    src={profileAvatarPreview}
                    alt="Profile picture preview"
                    className="h-16 w-16 rounded-full border border-[#c1ecd4] object-cover"
                    onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }}
                    onLoad={(event) => { event.currentTarget.style.visibility = 'visible'; }}
                  />
                )}
                {profileAvatarPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileAvatarUrl('');
                      setProfileAvatarFile(null);
                      setProfileAvatarPreview('');
                    }}
                    className="self-start text-xs font-semibold text-[#a23e18] hover:underline"
                  >
                    Remove profile picture
                  </button>
                )}
                <label className="flex flex-col gap-1 text-xs font-semibold text-[#414844]">
                  Campus
                  <select value={profileCampus} onChange={(event) => setProfileCampus(event.target.value as CampusId)} className="px-3 py-2 rounded-lg border border-[#d5e7da] bg-white text-sm text-[#101f17]">
                    {getCampusConfigurations().filter((campus) => campus.id !== 'all-campuses').map((campus) => (
                      <option key={campus.id} value={campus.id}>{campus.name}</option>
                    ))}
                  </select>
                </label>
                {profileError && <p role="alert" className="text-xs font-semibold text-red-700">{profileError}</p>}
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 px-3 py-2 rounded-lg border border-[#d5e7da] text-xs font-bold text-[#414844]">Cancel</button>
                  <button type="submit" disabled={isSavingProfile} className="flex-1 px-3 py-2 rounded-lg bg-[#012d1d] text-xs font-bold text-white disabled:opacity-60">{isSavingProfile ? 'Saving…' : 'Save settings'}</button>
                </div>
              </form>
            )}

            {/* Privacy Controls & Account Settings */}
            <div className="flex flex-col gap-2 p-3.5 bg-[#f7fdf9] rounded-xl border border-[#c1ecd4] text-[12px]">
              <span className="font-bold text-[#012d1d] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">shield</span>
                Privacy &amp; Notification Settings
              </span>
              <label className="flex items-center justify-between gap-2 cursor-pointer select-none pt-1">
                <span className="text-[#414844]">Mask contact info on public cards</span>
                <input
                  type="checkbox"
                  checked={maskPhone}
                  onChange={(e) => setMaskPhone(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1b4332] accent-[#1b4332]"
                />
              </label>
              <label className="flex items-center justify-between gap-2 cursor-pointer select-none">
                <span className="text-[#414844]">Automated email match notifications</span>
                <input
                  type="checkbox"
                  checked={matchAlerts}
                  onChange={(e) => setMatchAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1b4332] accent-[#1b4332]"
                />
              </label>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#e0f2e6]">
              {isSupabaseConfigured ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="text-[12px] font-semibold text-[#012d1d] hover:underline cursor-pointer"
                >
                  Sign out to switch accounts
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { onClose(); onLogout(); }}
                  className="text-[12px] font-semibold text-[#012d1d] hover:underline cursor-pointer"
                >
                  Sign out to switch accounts
                </button>
              )}
              <button
                type="button"
                onClick={onLogout}
                className="px-3.5 py-1.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-[12px] font-bold hover:bg-[#ffb4ab] transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            {/* Student vs Staff toggle */}
            <div className="grid grid-cols-2 p-1 bg-[#e6f8eb] rounded-xl border border-[#c1ecd4]">
              <button
                type="button"
                onClick={() => setRoleSelection('student')}
                className={`py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                  roleSelection === 'student' ? 'bg-white text-[#012d1d] shadow-xs' : 'text-[#414844]'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRoleSelection('staff')}
                className={`py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                  roleSelection === 'staff' ? 'bg-white text-[#012d1d] shadow-xs' : 'text-[#414844]'
                }`}
              >
                Staff / Officer
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#101f17]" htmlFor="auth-email">
                Campus Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.edu"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#d5e7da] text-[14px] focus:ring-2 focus:ring-[#012d1d] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-semibold text-[#101f17]" htmlFor="auth-password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot_password')}
                  className="text-[11px] text-[#a23e18] font-bold hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-[#d5e7da] text-[14px] focus:ring-2 focus:ring-[#012d1d] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#717973] hover:text-[#101f17] cursor-pointer"
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
              className="w-full py-2.5 rounded-xl bg-[#012d1d] hover:bg-[#1b4332] text-white text-[13px] font-bold shadow-sm transition-all"
            >
              Sign In with University Credentials
            </button>

            {/* Google SSO button */}
            <button
              type="button"
              onClick={handleGoogleSignInModal}
              className="w-full py-2.5 rounded-xl border border-[#d5e7da] bg-white hover:bg-[#f4fbf6] active:bg-[#e6f8eb] text-[#101f17] text-[13px] font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google Account</span>
            </button>

            <div className="flex items-center justify-center gap-1 text-[12px] text-[#414844] pt-2">
              <span>Don't have an account yet?</span>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-[#a23e18] font-bold hover:underline"
              >
                Register
              </button>
            </div>
          </form>
        )}

        {/* MODE: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 p-1 bg-[#e6f8eb] rounded-xl border border-[#c1ecd4]">
              <button
                type="button"
                onClick={() => setRoleSelection('student')}
                className={`py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                  roleSelection === 'student' ? 'bg-white text-[#012d1d] shadow-xs' : 'text-[#414844]'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRoleSelection('staff')}
                className={`py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                  roleSelection === 'staff' ? 'bg-white text-[#012d1d] shadow-xs' : 'text-[#414844]'
                }`}
              >
                Staff Officer
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#101f17]" htmlFor="reg-name">
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#d5e7da] text-[14px] focus:ring-2 focus:ring-[#012d1d] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#101f17]" htmlFor="reg-id">
                {roleSelection === 'student' ? 'Student ID Card #' : 'Staff Badge ID #'}
              </label>
              <input
                id="reg-id"
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder={roleSelection === 'student' ? 'Student ID' : 'Staff ID'}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#d5e7da] text-[14px] focus:ring-2 focus:ring-[#012d1d] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#101f17]" htmlFor="reg-email">
                Campus Email
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.edu"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#d5e7da] text-[14px] focus:ring-2 focus:ring-[#012d1d] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#101f17]" htmlFor="reg-password">
                Create Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-[#d5e7da] text-[14px] focus:ring-2 focus:ring-[#012d1d] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#717973] hover:text-[#101f17] cursor-pointer"
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
              className="w-full py-2.5 rounded-xl bg-[#012d1d] hover:bg-[#1b4332] text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer"
            >
              Create FindSync Account
            </button>

            <div className="flex items-center justify-center gap-1 text-[12px] text-[#414844] pt-2">
              <span>Already registered?</span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#a23e18] font-bold hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* MODE: FORGOT PASSWORD */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
            {resetSent ? (
              <div className="p-4 rounded-xl bg-[#e6f8eb] border border-[#c1ecd4] flex flex-col gap-2 text-center">
                <span className="material-symbols-outlined text-3xl text-[#1b4332] mx-auto">mark_email_read</span>
                <h4 className="text-[15px] font-bold text-[#012d1d]">Recovery Email Dispatched</h4>
                <p className="text-[12px] text-[#414844]">
                  A password reset link was sent to the email address on your account. Follow its instructions to reset your password.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setResetSent(false);
                    setMode('login');
                  }}
                  className="mt-2 px-4 py-2 rounded-lg bg-[#012d1d] text-white text-[12px] font-bold"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                <p className="text-[13px] text-[#414844]">
                  Enter the email address on your account and we will send recovery instructions.
                </p>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#101f17]" htmlFor="forgot-email">
                    University Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.edu"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#d5e7da] text-[14px] focus:ring-2 focus:ring-[#012d1d] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#012d1d] hover:bg-[#1b4332] text-white text-[13px] font-bold shadow-sm transition-all"
                >
                  Send Reset Link
                </button>

                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[12px] font-semibold text-[#717973] hover:text-[#101f17] text-center"
                >
                  Cancel and return to sign in
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
