import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { Mail, KeyRound, X, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const { sendPasswordReset } = useAuth();
  const { addToast } = useToast();
  
  const [email, setEmail] = useState<string>(defaultEmail);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await sendPasswordReset(email.trim());
    setIsLoading(false);

    if (result.success) {
      setIsSent(true);
      addToast('success', result.message, 'Reset Link Dispatched');
    } else {
      setError(result.message);
    }
  };

  const handleResetForm = () => {
    setIsSent(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleResetForm}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Password Reset Sent</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              We have dispatched instructions to <strong className="text-emerald-300 font-semibold">{email}</strong>. 
              Click the link inside that email to set a brand new password.
            </p>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-400 mb-6 text-left">
              <span className="font-semibold text-slate-300 block mb-1">Didn't receive it?</span>
              <ul className="list-disc pl-4 space-y-1">
                <li>Check your spam, junk, or promotions folder</li>
                <li>Make sure this email matches your Firebase account</li>
                <li>Wait 1-2 minutes for email delivery</li>
              </ul>
            </div>
            <button
              onClick={handleResetForm}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center mb-4 border border-cyan-500/20">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Reset your password</h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter your registered email address and Firebase Auth will send a secure password reset link.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? 'Sending reset link...' : 'Send Password Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel and return
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
