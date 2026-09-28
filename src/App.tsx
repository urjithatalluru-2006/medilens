import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { firebaseConfig } from './firebase';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Server, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  KeyRound, 
  Eye,
  Layers,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showConfigDrawer, setShowConfigDrawer] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse">
            <Eye className="w-8 h-8 text-cyan-400" />
          </div>
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin absolute -bottom-2 -right-2"></div>
        </div>
        <p className="text-sm font-medium text-slate-400 mt-4 tracking-wide">
          Connecting to Firebase Auth...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navbar */}
      <Navbar
        onOpenLogin={() => setAuthMode('login')}
        onOpenRegister={() => setAuthMode('register')}
      />

      {/* Email Verification Sticky Alert (shows if user is logged in & email is unverified) */}
      <EmailVerificationBanner />

      {/* Main Content Area */}
      <main className="flex-1">
        {user ? (
          // Authenticated Dashboard
          <Dashboard />
        ) : (
          // Unauthenticated Landing & Auth Forms
          <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
            {/* Hero Header */}
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Firebase Auth &bull; Project {firebaseConfig.projectId}
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-4">
                Secure User Management & <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                  Email Verification
                </span>
              </h1>

              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                Full-featured authentication portal featuring robust user registration, automatic email verification links, password reset workflows, and secure credential handling.
              </p>

              {/* Mode Toggle Switcher */}
              <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800 mt-8 shadow-inner">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register New Account
                </button>
              </div>
            </div>

            {/* Active Auth Form Container */}
            <div className="mb-14">
              {authMode === 'login' ? (
                <LoginForm
                  onSwitchToRegister={() => setAuthMode('register')}
                  onSuccess={() => {}}
                />
              ) : (
                <RegisterForm
                  onSwitchToLogin={() => setAuthMode('login')}
                  onSuccess={() => {}}
                />
              )}
            </div>

            {/* Features Highlight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-800/80">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 border border-cyan-500/20">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Email Verification</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatic email verification links dispatched via Firebase Auth with real-time reload listeners and spam delivery safety guidance.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 border border-teal-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Password Strength & Security</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interactive real-time password strength meter checking length, capital letters, digits, and special characters.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Self-Service Account Center</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Authenticated users can change passwords, update profile details, resend confirmation links, and manage their credentials.
                </p>
              </div>
            </div>

            {/* Firebase Project Info Footer Card */}
            <div className="mt-8 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span>
                  Connected to Firebase Project: <strong className="text-slate-200 font-mono">{firebaseConfig.projectId}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Auth Domain:</span>
                <span className="font-mono text-slate-300">{firebaseConfig.authDomain}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MediLens AI Auth Portal &bull; Powered by Firebase Authentication SDK</span>
          <span className="text-[11px] text-slate-600">Secure User Management & Email Verification</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
