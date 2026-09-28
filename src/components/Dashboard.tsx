import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { firebaseConfig } from '../firebase';
import { 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Lock, 
  KeyRound, 
  LogOut, 
  CheckCircle2, 
  RefreshCw, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Server, 
  Key, 
  Send,
  Sparkles,
  Info,
  ChevronRight,
  Fingerprint
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    user, 
    emailVerified, 
    reloadUser, 
    sendVerificationEmail, 
    logout, 
    updateUserProfile, 
    updateUserPassword, 
    deleteAccount 
  } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'firebase-guide'>('overview');
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState<string>(user?.photoURL || '');
  const [profileSaving, setProfileSaving] = useState<boolean>(false);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [passwordSaving, setPasswordSaving] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Verification resend & check state
  const [isResending, setIsResending] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isReloading, setIsReloading] = useState<boolean>(false);

  // Delete account modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Copied UID state
  const [copiedUid, setCopiedUid] = useState<boolean>(false);

  if (!user) return null;

  const handleCopyUid = () => {
    navigator.clipboard.writeText(user.uid);
    setCopiedUid(true);
    addToast('info', 'User ID copied to clipboard');
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    const result = await updateUserProfile(displayName, photoURL);
    setProfileSaving(false);

    if (result.success) {
      setIsEditingProfile(false);
      addToast('success', result.message, 'Profile Updated');
    } else {
      addToast('error', result.message, 'Update Failed');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    const result = await updateUserPassword(currentPassword, newPassword);
    setPasswordSaving(false);

    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      addToast('success', result.message, 'Password Changed');
    } else {
      setPasswordError(result.message);
      addToast('error', result.message, 'Password Change Failed');
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    const result = await sendVerificationEmail();
    setIsResending(false);

    if (result.success) {
      addToast('success', result.message, 'Verification Sent');
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      addToast('error', result.message, 'Could Not Send');
    }
  };

  const handleCheckStatus = async () => {
    setIsReloading(true);
    const verified = await reloadUser();
    setIsReloading(false);

    if (verified) {
      addToast('success', 'Your email is verified! Account is fully active.', 'Verified');
    } else {
      addToast('info', 'Email is not verified yet. Please click the link in your inbox and click Refresh again.', 'Verification Pending');
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleting(true);
    const result = await deleteAccount(deleteConfirmPassword);
    setIsDeleting(false);

    if (result.success) {
      setIsDeleteModalOpen(false);
      addToast('info', 'Your account has been deleted.', 'Account Deleted');
    } else {
      addToast('error', result.message, 'Could Not Delete');
    }
  };

  // Provider display helpers
  const primaryProvider = user.providerData?.[0]?.providerId || 'password';
  const isGoogleUser = primaryProvider === 'google.com';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User Avatar'}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-md"
                />
              ) : (
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-lg border border-cyan-400/30">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email?.charAt(0).toUpperCase() || 'U')}
                </div>
              )}
              {/* Verification mini badge */}
              <div 
                className={`absolute -bottom-1.5 -right-1.5 p-1 rounded-full border-2 border-slate-900 ${
                  emailVerified ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                }`}
                title={emailVerified ? 'Email Verified' : 'Email Unverified'}
              >
                {emailVerified ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {user.displayName || 'MediLens Member'}
                </h1>
                {/* Verification badge */}
                {emailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <ShieldAlert className="w-3.5 h-3.5" /> Unverified
                  </span>
                )}
                {/* Provider badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {isGoogleUser ? 'Google OAuth' : 'Email & Password'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {user.email}
                </span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <button
                  onClick={handleCopyUid}
                  className="flex items-center gap-1 hover:text-slate-200 transition cursor-pointer font-mono text-xs"
                  title="Click to copy UID"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-slate-500" />
                  UID: {user.uid.slice(0, 10)}...
                  {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setIsEditingProfile(true)}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-cyan-400" />
              Edit Profile
            </button>
            <button
              onClick={logout}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-800/80 overflow-x-auto text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Account Overview
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer shrink-0 ${
              activeTab === 'security'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Security & Passwords
          </button>
          <button
            onClick={() => setActiveTab('firebase-guide')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'firebase-guide'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Firebase Status & Console Guide
          </button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Email Verification Card */}
          <div className={`p-6 rounded-3xl border shadow-xl ${
            emailVerified 
              ? 'bg-emerald-950/20 border-emerald-500/30' 
              : 'bg-amber-950/20 border-amber-500/40'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`p-2 rounded-2xl shrink-0 mt-0.5 ${
                  emailVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {emailVerified ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {emailVerified ? 'Email Verification Status: Verified' : 'Email Verification Status: Pending'}
                    {emailVerified && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Secure
                      </span>
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    {emailVerified
                      ? `Your email address (${user.email}) has been confirmed. You have full authenticated privileges across MediLens.`
                      : `A verification link has been dispatched to ${user.email}. Check your inbox or click below to refresh verification status after clicking the link.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={handleCheckStatus}
                  disabled={isReloading}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
                  {isReloading ? 'Checking...' : 'Refresh Status'}
                </button>

                {!emailVerified && (
                  <button
                    onClick={handleResendVerification}
                    disabled={resendCooldown > 0 || isResending}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isResending ? 'Sending...' : resendCooldown > 0 ? `Wait ${resendCooldown}s` : 'Resend Email'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                User Profile Attributes
              </h3>
              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Display Name</span>
                  <span className="font-semibold text-slate-200">{user.displayName || 'Not configured'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Primary Email</span>
                  <span className="font-mono text-slate-200">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Email Verified</span>
                  <span className={`font-semibold ${emailVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {emailVerified ? 'Yes (Verified)' : 'No (Pending)'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Auth Provider</span>
                  <span className="font-mono uppercase text-slate-200">{primaryProvider}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Account Type</span>
                  <span className="font-semibold text-cyan-400">Standard User</span>
                </div>
              </div>
            </div>

            {/* Session & Timestamp Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Session & Metadata
              </h3>
              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Account Created</span>
                  <span className="text-slate-200">
                    {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Last Signed In</span>
                  <span className="text-slate-200">
                    {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'Just now'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Firebase Project</span>
                  <span className="font-mono text-cyan-300 font-semibold">{firebaseConfig.projectId}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Auth Domain</span>
                  <span className="font-mono text-slate-300 text-xs">{firebaseConfig.authDomain}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Security & Password Management */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password Card (Only relevant for email/password users) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Change Account Password</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                Update your login password securely. You must provide your current password to verify your identity.
              </p>

              {passwordError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-xs text-rose-200">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      New Password (min 6 chars)
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-60"
                >
                  {passwordSaving ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h3 className="text-base font-bold text-rose-300 mb-1 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              Danger Zone: Delete Account
            </h3>
            <p className="text-xs text-rose-200/80 mb-4 max-w-xl">
              Permanently delete your MediLens account and all associated authentication credentials from Firebase Auth. This action cannot be undone.
            </p>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-rose-600/20"
            >
              Delete My Account
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Firebase Status & Console Guide */}
      {activeTab === 'firebase-guide' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Active Firebase Configuration</h3>
                <p className="text-xs text-slate-400">Directly connected to project <strong className="text-cyan-400 font-mono">{firebaseConfig.projectId}</strong></p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto mb-6">
              <pre>{JSON.stringify(firebaseConfig, null, 2)}</pre>
            </div>

            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              Firebase Console Checklist for Email Verification & Sign-in
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block mb-0.5">1. Enable "Email/Password" Provider</span>
                  <span>In Firebase Console &gt; Authentication &gt; Sign-in method, ensure <strong>Email/Password</strong> status is set to <strong>Enabled</strong>.</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block mb-0.5">2. Check Email Verification Delivery</span>
                  <span>Firebase sends verification emails automatically via <strong>noreply@{firebaseConfig.authDomain}</strong>. Please check your spam, junk, or promotions tabs if you don't see it immediately.</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block mb-0.5">3. Email Templates Customization (Optional)</span>
                  <span>In Firebase Console &gt; Authentication &gt; Templates, you can customize the Email Address Verification and Password Reset subject lines and message body.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100">
            <h3 className="text-xl font-bold text-white mb-2">Edit User Profile</h3>
            <p className="text-xs text-slate-400 mb-6">
              Update your display identity and avatar URL stored in Firebase Auth.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Dr. Alex Mercer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Avatar Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-60"
                >
                  {profileSaving ? 'Saving...' : 'Save Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete MediLens Account</h3>
            <p className="text-xs text-rose-200 mb-6 leading-relaxed">
              This will permanently eradicate your user account from Firebase Auth. Please confirm your password below to proceed.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md shadow-rose-600/20 transition cursor-pointer disabled:opacity-60"
                >
                  {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
