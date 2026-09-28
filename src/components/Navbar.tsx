import React from 'react';
import { useAuth } from '../context/AuthContext';
import { firebaseConfig } from '../firebase';
import { 
  ShieldCheck, 
  ShieldAlert, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Activity, 
  Eye, 
  CheckCircle2, 
  Sparkles,
  Server
} from 'lucide-react';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin, onOpenRegister, onOpenGuide }) => {
  const { user, emailVerified, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-0.5 shadow-md shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Eye className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                Medi<span className="text-cyan-400">Lens</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Auth Portal
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden xs:block">
              Firebase Auth &bull; {firebaseConfig.projectId}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Email verification chip */}
              <div 
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  emailVerified 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}
              >
                {emailVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                <span>{emailVerified ? 'Verified' : 'Pending Verification'}</span>
              </div>

              {/* User avatar & name */}
              <div className="flex items-center gap-2.5 pl-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email?.charAt(0).toUpperCase() || 'U')
                  )}
                </div>
                <span className="text-xs font-medium text-slate-200 hidden md:block max-w-[120px] truncate">
                  {user.displayName || user.email}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4 text-cyan-400" />
                Sign In
              </button>
              <button
                onClick={onOpenRegister}
                className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-md shadow-cyan-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
