import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { MailCheck, RefreshCw, AlertTriangle, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

export const EmailVerificationBanner: React.FC = () => {
  const { user, emailVerified, reloadUser, sendVerificationEmail } = useAuth();
  const { addToast } = useToast();
  
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [justVerified, setJustVerified] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!user || emailVerified) {
    if (justVerified) {
      return (
        <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-4 py-3 text-emerald-200">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-sm font-medium">
                Awesome! Your email ({user?.email}) has been successfully verified.
              </span>
            </div>
            <button
              onClick={() => setJustVerified(false)}
              className="text-xs px-2 py-1 rounded bg-emerald-800/50 hover:bg-emerald-800 text-emerald-100 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);

    const result = await sendVerificationEmail();
    setIsResending(false);

    if (result.success) {
      addToast('success', result.message, 'Verification Email Sent');
      setResendCooldown(60);
    } else {
      addToast('error', result.message, 'Could Not Send Email');
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    const verified = await reloadUser();
    setIsChecking(false);

    if (verified) {
      setJustVerified(true);
      addToast('success', 'Your email is now verified! Full access unlocked.', 'Verification Complete');
    } else {
      addToast(
        'info', 
        'We checked, but your email is not verified yet. Please click the link inside the email we sent you, then click "Refresh Status" again.',
        'Not Yet Verified'
      );
    }
  };

  return (
    <div className="bg-amber-950/90 border-b border-amber-500/40 px-4 py-3.5 text-amber-200 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-amber-100">
                Action Required: Verify your email address
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40">
                Unverified
              </span>
            </div>
            <p className="text-xs text-amber-300/90 mt-0.5">
              A verification link was sent to <strong className="text-white underline decoration-amber-400/50">{user.email}</strong>. 
              Please check your inbox (or spam/junk folder) and click the link.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-1 md:pt-0">
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 text-xs font-medium transition cursor-pointer disabled:opacity-60"
            title="Reload user state from Firebase Auth"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Refresh Status'}
          </button>

          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            {isResending
              ? 'Sending...'
              : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : 'Resend Email'}
          </button>
        </div>
      </div>
    </div>
  );
};
