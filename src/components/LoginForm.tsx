import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';
import { auth, googleProvider, getFriendlyErrorMessage, sendUserEmailVerification } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ShieldCheck, 
  Send, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSuccess }) => {
  const { reloadUser } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Unverified email reminder state if login succeeded but user is not verified
  const [showUnverifiedWarning, setShowUnverifiedWarning] = useState<boolean>(false);
  const [resendingVerif, setResendingVerif] = useState<boolean>(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowUnverifiedWarning(false);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setShowUnverifiedWarning(true);
        addToast(
          'info',
          `Welcome back! Please note your email (${user.email}) is not verified yet.`,
          'Verification Notice'
        );
      } else {
        addToast('success', `Signed in as ${user.displayName || user.email}!`, 'Authentication Successful');
      }

      await reloadUser();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Login error:", err);
      const friendly = getFriendlyErrorMessage(err);
      setError(friendly);
      addToast('error', friendly, 'Sign In Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      addToast('success', `Signed in as ${result.user.displayName || result.user.email}!`, 'Google Sign In');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        const friendly = getFriendlyErrorMessage(err);
        setError(friendly);
        addToast('error', friendly, 'Google Sign In Error');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendVerificationFromLogin = async () => {
    if (!auth.currentUser) return;
    setResendingVerif(true);
    try {
      await sendUserEmailVerification(auth.currentUser);
      addToast('success', `Verification email sent to ${auth.currentUser.email}!`, 'Verification Sent');
    } catch (err: any) {
      addToast('error', getFriendlyErrorMessage(err), 'Send Error');
    } finally {
      setResendingVerif(false);
    }
  };

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl max-w-lg w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Welcome back</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access your MediLens portal with your Firebase credentials
          </p>
        </div>

        {/* Unverified notice if user logged in without verification */}
        {showUnverifiedWarning && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Email verification is pending</span>
            </div>
            <p className="text-amber-200/90 leading-relaxed">
              Your email hasn't been verified yet. Check your inbox for the link, or click below to receive a new one.
            </p>
            <button
              type="button"
              onClick={handleResendVerificationFromLogin}
              disabled={resendingVerif}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-medium cursor-pointer transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {resendingVerif ? 'Sending...' : 'Resend Verification Link'}
            </button>
          </div>
        )}

        {/* Error alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-start gap-3 text-xs sm:text-sm text-rose-200">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Google sign-in */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || isLoading}
          className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800/90 border border-slate-700/80 text-white font-medium text-sm flex items-center justify-center gap-3 transition shadow-sm mb-6 cursor-pointer disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>{googleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Or sign in with email
          </span>
          <div className="border-t border-slate-800 w-full"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@medilens.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
              />
              <span>Remember me on this browser</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || googleLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                Authenticating...
              </span>
            ) : (
              'Sign In to Portal'
            )}
          </button>
        </form>

        {/* Switch to register */}
        <div className="mt-8 text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 transition cursor-pointer"
          >
            Register with Email Verification
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={email}
      />
    </>
  );
};
