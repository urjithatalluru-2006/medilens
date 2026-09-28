import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup 
} from 'firebase/auth';
import { auth, googleProvider, sendUserEmailVerification, getFriendlyErrorMessage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Send, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onSuccess }) => {
  const { reloadUser } = useAuth();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Post-registration verification step state
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const strengthScore = [hasMinLength, hasUpperCase, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (password.length === 0) return { label: 'Empty', color: 'bg-slate-700' };
    if (strengthScore <= 1) return { label: 'Weak', color: 'bg-rose-500' };
    if (strengthScore <= 2) return { label: 'Fair', color: 'bg-amber-500' };
    if (strengthScore === 3) return { label: 'Good', color: 'bg-cyan-500' };
    return { label: 'Strong', color: 'bg-emerald-500' };
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms of Service to proceed.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create User
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // 2. Update Display Name
      if (fullName.trim()) {
        await updateProfile(userCredential.user, {
          displayName: fullName.trim()
        });
      }

      // 3. Send Email Verification immediately!
      try {
        await sendUserEmailVerification(userCredential.user);
        setVerificationSent(true);
      } catch (verifErr) {
        console.warn("Could not dispatch immediate verification:", verifErr);
      }

      setRegisteredEmail(userCredential.user.email);
      addToast('success', 'Account created! A verification email has been sent.', 'Welcome to MediLens');
      
      // Reload user in auth context
      await reloadUser();

      if (onSuccess) {
        // give user a moment to see the verification banner
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(getFriendlyErrorMessage(err));
      addToast('error', getFriendlyErrorMessage(err), 'Registration Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      addToast('success', 'Signed up successfully with Google!', 'Welcome');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(getFriendlyErrorMessage(err));
        addToast('error', getFriendlyErrorMessage(err), 'Google Sign In Error');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendInModal = async () => {
    if (!auth.currentUser || resendCooldown > 0) return;
    try {
      await sendUserEmailVerification(auth.currentUser);
      addToast('success', `Verification link resent to ${auth.currentUser.email}`, 'Resent');
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      addToast('error', getFriendlyErrorMessage(err), 'Error');
    }
  };

  // If user just registered, show the Verification Sent Screen
  if (registeredEmail) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-lg w-full mx-auto text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-500/30">
          <Mail className="w-8 h-8" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> Account Created
        </span>

        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Verify your email</h2>

        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          We sent a verification link to <br />
          <strong className="text-emerald-300 font-semibold text-base">{registeredEmail}</strong>
        </p>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 text-left text-xs text-slate-300 mb-6 space-y-2">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
            <span>Open your inbox and search for the email from <strong>noreply@medilens-ai-daab2.firebaseapp.com</strong></span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
            <span>Click the verification link in the message to confirm your identity</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
            <span>Return to MediLens and click <strong>"I've Verified My Email"</strong></span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={async () => {
              await reloadUser();
              if (onSuccess) onSuccess();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>I've Verified My Email</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleResendInModal}
            disabled={resendCooldown > 0}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl max-w-lg w-full mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-3">
          <UserPlus className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Create your account</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Join MediLens with secure Firebase Auth & email validation
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-start gap-3 text-xs sm:text-sm text-rose-200">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{error}</div>
        </div>
      )}

      {/* Social Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
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
        <span>{googleLoading ? 'Connecting Google...' : 'Sign up with Google'}</span>
      </button>

      <div className="relative flex items-center justify-center mb-6">
        <div className="border-t border-slate-800 w-full"></div>
        <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">
          Or register with email
        </span>
        <div className="border-t border-slate-800 w-full"></div>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Sarah Johnson"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            />
          </div>
        </div>

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
              placeholder="sarah.johnson@medilens.com"
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
            {password.length > 0 && (
              <span className="text-[11px] font-medium text-slate-400">
                Strength: <span className="font-semibold text-slate-200">{getStrengthLabel().label}</span>
              </span>
            )}
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

          {/* Password strength bar */}
          {password.length > 0 && (
            <div className="mt-2 space-y-2">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${
                      step <= strengthScore ? getStrengthLabel().color : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-400 pt-1">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <Check className="w-3 h-3" /> 8+ characters
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <Check className="w-3 h-3" /> Uppercase letter
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <Check className="w-3 h-3" /> Number (0-9)
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <Check className="w-3 h-3" /> Symbol (!@#$)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className={`w-full bg-slate-950 border rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition ${
                confirmPassword.length > 0
                  ? passwordsMatch
                    ? 'border-emerald-500/50 focus:border-emerald-500'
                    : 'border-rose-500/50 focus:border-rose-500'
                  : 'border-slate-800 focus:border-cyan-500'
              }`}
            />
            {confirmPassword.length > 0 && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {passwordsMatch ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Terms agreement checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-400 leading-snug">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
            />
            <span>
              I agree to the <span className="text-cyan-400 hover:underline">Terms of Service</span> and <span className="text-cyan-400 hover:underline">Privacy Policy</span>. An email verification link will be sent upon signup.
            </span>
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || googleLoading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              Creating Account & Dispatching Verification...
            </span>
          ) : (
            'Create Account & Send Verification'
          )}
        </button>
      </form>

      {/* Switch to login */}
      <div className="mt-8 text-center text-xs text-slate-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 transition cursor-pointer"
        >
          Sign in here
        </button>
      </div>
    </div>
  );
};
