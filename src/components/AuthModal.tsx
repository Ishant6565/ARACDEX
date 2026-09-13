import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { UserProfile } from '../types';
import {
  getAllAccounts,
  loginWithGoogle,
  registerCustomUser,
  switchAccount,
  AVAILABLE_AVATARS,
} from '../services/auth';
import { sound } from '../services/audio';
import { signInWithRealGoogle } from '../services/supabase';
import { X, Users, UserPlus, Flame } from 'lucide-react';

interface AuthModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUserChange: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onUserChange,
}) => {
  const [activeTab, setActiveTab] = useState<'google' | 'register' | 'switch'>('google');
  const [customName, setCustomName] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('/anime/kakashi.svg');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const accounts = getAllAccounts();
  const accountsList = Object.values(accounts);

  const handleGoogleSignIn = async () => {
    sound.playClick();
    setIsGoogleLoading(true);
    const { error } = await signInWithRealGoogle();
    if (error) {
      console.warn('[Supabase] Google OAuth Error:', error);
      setIsGoogleLoading(false);
      alert('Google Sign-in setup required in Supabase dashboard. Go to Supabase > Authentication > Providers > Google to enable it for your friends.');
    }
  };

  const handleCustomRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    sound.playClick();
    const user = registerCustomUser(customName, '', selectedAvatar);
    sound.playSuccess();
    onUserChange(user);
    onClose();
  };

  const handleSwitch = (userId: string) => {
    sound.playClick();
    const user = switchAccount(userId);
    sound.playSuccess();
    onUserChange(user);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in select-none p-3 sm:p-6">
      <div className="min-h-full flex items-center justify-center py-4">
        <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-cyan-500/30 rounded-[3px] shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_30px_rgba(6,182,212,0.15)] flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden my-auto">
          {/* Top Header */}
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0e0e0e] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-cyan-400 text-black flex items-center justify-center font-display font-black text-sm shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              A
            </div>
            <div>
              <span className="text-[9px] font-mono tracking-[0.25em] text-cyan-400 uppercase block">
                ARCADEX ID PROTOCOL
              </span>
              <h3 className="text-base font-bold font-display tracking-tight text-white flex items-center gap-2">
                PLAYER IDENTIFICATION
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 text-white/50 hover:text-white rounded-[2px] hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs in Cyan */}
        <div className="flex border-b border-white/[0.08] bg-[#070707] font-mono text-xs">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('google');
            }}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'google'
                ? 'border-cyan-400 text-white font-bold bg-cyan-500/10'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <span>GOOGLE AUTH</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('register');
            }}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'register'
                ? 'border-cyan-400 text-white font-bold bg-cyan-500/10'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>CUSTOM ID</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('switch');
            }}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'switch'
                ? 'border-cyan-400 text-white font-bold bg-cyan-500/10'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>ROSTER ({accountsList.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 scrollbar-thin">
          {/* TAB 1: GOOGLE AUTH */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-gradient-to-r from-cyan-950/30 to-blue-950/20 border border-cyan-500/30 rounded-[2px] text-left">
                <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase block font-bold">
                  ONE-TOUCH SYNC
                </span>
                <p className="text-xs text-white/80 font-sans mt-0.5">
                  Sign in with your Google Account to save puzzle streaks, 100-level checkpoints, and leaderboard positions.
                </p>
              </div>

              {/* Authentic Google Fast Sign-in Box */}
              <div className="p-6 bg-[#0e0e0e] border border-white/[0.12] rounded-[3px] text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white font-display">
                    GENUINE GOOGLE ACCOUNT
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                    Sign in with your real Gmail account to sync your 100-level progress across all phones and laptops.
                  </p>
                </div>

                {/* Continue with Real Google button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-3.5 px-4 bg-white hover:bg-zinc-100 text-black font-sans font-bold text-xs uppercase tracking-wider rounded-[2px] flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  {isGoogleLoading ? 'Connecting to Google...' : 'SIGN IN WITH GOOGLE'}
                </button>

                <p className="text-[10px] font-mono text-zinc-400">
                  SECURED BY SUPABASE AUTHENTICATION
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER CUSTOM ID */}
          {activeTab === 'register' && (
            <form onSubmit={handleCustomRegister} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                  OPERATOR CALLSIGN / USERNAME
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="e.g. CYBER_SHADOW"
                  className="w-full px-3 py-2 bg-black border border-white/[0.12] rounded-[2px] font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                  PIN CODE / PASSWORD
                </label>
                <input
                  type="password"
                  value={customPassword}
                  onChange={e => setCustomPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-black border border-white/[0.12] rounded-[2px] font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Avatar Selector */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                  CHOOSE AVATAR (22 TITANS)
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1 bg-black/60 border border-white/[0.08] rounded-[2px] scrollbar-thin">
                  {AVAILABLE_AVATARS.map(av => (
                    <button
                      type="button"
                      key={av.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedAvatar(av.src);
                      }}
                      className={`w-full aspect-square rounded-[2px] border overflow-hidden relative transition-all bg-black ${
                        selectedAvatar === av.src
                          ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      title={av.name}
                    >
                      <img src={av.src} alt={av.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-400 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-[2px] hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95"
              >
                INITIALIZE OPERATOR ID
              </button>
            </form>
          )}

          {/* TAB 3: SWITCH ROSTER / ACCOUNTS */}
          {activeTab === 'switch' && (
            <div className="space-y-3">
              <div className="text-left mb-2">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  LOCAL FRIENDS & PROFILES ON THIS DEVICE
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                {accountsList.map(acc => {
                  const isCurrent = acc.id === currentUser.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => !isCurrent && handleSwitch(acc.id)}
                      className={`p-3 rounded-[2px] border flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-cyan-400/10 border-cyan-400/60 ring-1 ring-cyan-400/30'
                          : 'bg-[#0d0d0d] border-white/[0.08] hover:border-cyan-400/40 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[2px] overflow-hidden border border-white/20 bg-black shrink-0">
                          <img src={acc.avatar} alt={acc.username} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-white">
                              {acc.username}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 bg-cyan-400 text-black font-mono text-[8px] font-bold rounded-[1px]">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-mono text-cyan-400/80 block">
                            {acc.stats.arcadeRank}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-xs">
                        <div className="text-right">
                          <span className="text-[9px] text-white/40 uppercase block">SOLVED</span>
                          <span className="font-bold text-white">{acc.stats.totalSolved}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-white/40 uppercase block">STREAK</span>
                          <span className="font-bold text-cyan-400 flex items-center gap-0.5">
                            <Flame className="w-3 h-3 fill-cyan-400 text-cyan-400" /> {acc.stats.streak}D
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-white/[0.08] flex justify-between">
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('register');
                  }}
                  className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-xs uppercase tracking-wider rounded-[2px] transition-all"
                >
                  + ADD NEW FRIEND PROFILE
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>,
  document.body
  );
};

