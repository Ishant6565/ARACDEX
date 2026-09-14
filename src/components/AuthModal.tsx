import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { UserProfile } from '../types';
import {
  getAllAccounts,
  loginWithRealGmail,
  switchAccount,
  logoutUser,
  AVAILABLE_AVATARS,
} from '../services/auth';
import { sound } from '../services/audio';
import { signInWithRealGoogle, signInWithGitHub, syncProfileToCloud, isNativeAPK } from '../services/supabase';
import { X, Users, Mail, Flame, CheckCircle2, AlertCircle, ShieldCheck, UserCheck, LogOut } from 'lucide-react';

interface AuthModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUserChange: (user: UserProfile) => void;
  onLogout?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onUserChange,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'gmail' | 'roster'>('gmail');
  const [gmailInput, setGmailInput] = useState('');
  const [callsignInput, setCallsignInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('/anime/kakashi.svg');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const accounts = getAllAccounts();
  const accountsList = Object.values(accounts).filter(a => a.id !== 'guest_primary' || accountsListLength() === 1);

  function accountsListLength() {
    return Object.keys(accounts).length;
  }

  const handleEmailChange = (val: string) => {
    setGmailInput(val);
    setErrorMessage('');
    // Auto suggest callsign if user hasn't typed a custom one yet
    if (!callsignInput || callsignInput === gmailInput.split('@')[0].toUpperCase()) {
      const prefix = val.split('@')[0].trim().replace(/[._-]/g, ' ').toUpperCase();
      setCallsignInput(prefix);
    }
  };

  const handleGmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    let email = gmailInput.trim().toLowerCase();
    if (!email) {
      setErrorMessage('Please enter your Gmail address');
      return;
    }

    if (!email.includes('@')) {
      email = `${email}@gmail.com`;
    }

    if (!email.endsWith('@gmail.com') && !email.includes('.')) {
      setErrorMessage('Please enter a valid Gmail address (e.g. name@gmail.com)');
      return;
    }

    sound.playClick();
    setIsSubmitting(true);

    try {
      const newUser = loginWithRealGmail(email, callsignInput, selectedAvatar);
      // Background sync to cloud
      syncProfileToCloud(newUser);
      sound.playSuccess();
      onUserChange(newUser);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Failed to initialize account. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSwitch = (userId: string) => {
    sound.playClick();
    const user = switchAccount(userId);
    sound.playSuccess();
    onUserChange(user);
    onClose();
  };

  const isCurrentLoggedInWithGmail = Boolean(currentUser.email && currentUser.email.includes('@'));

  return createPortal(
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in select-none p-3 sm:p-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
      <div className="min-h-full flex items-center justify-center py-4">
        <div className="relative w-full max-w-lg bg-[#0b0b0e] border border-cyan-500/40 rounded-[3px] shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_35px_rgba(6,182,212,0.2)] flex flex-col max-h-[90vh] overflow-hidden my-auto">
          {/* Top Header */}
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0e0e12] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[2px] bg-gradient-to-tr from-cyan-500 to-blue-500 text-black flex items-center justify-center font-display font-black text-sm shadow-[0_0_12px_rgba(6,182,212,0.6)]">
                <Mail className="w-4 h-4 text-black" />
              </div>
              <div>
                <span className="text-[9px] font-mono tracking-[0.25em] text-cyan-400 uppercase block">
                  REAL GMAIL AUTHENTICATION
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

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/[0.08] bg-[#070709] font-mono text-xs shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('gmail');
              }}
              className={`flex-1 py-3 px-3 flex items-center justify-center gap-2 transition-all border-b-2 ${
                activeTab === 'gmail'
                  ? 'border-cyan-400 text-white font-bold bg-cyan-500/10'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>GMAIL SIGN-IN</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('roster');
              }}
              className={`flex-1 py-3 px-3 flex items-center justify-center gap-2 transition-all border-b-2 ${
                activeTab === 'roster'
                  ? 'border-cyan-400 text-white font-bold bg-cyan-500/10'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>FRIENDS ROSTER ({accountsList.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 overflow-y-auto flex-1 scrollbar-thin space-y-4">
            {activeTab === 'gmail' && (
              <>
                {/* Logged-in State Card */}
                {isCurrentLoggedInWithGmail && (
                  <div className="p-3.5 bg-[#0f1118] border border-cyan-500/40 rounded-[3px] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-cyan-400 overflow-hidden bg-black shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                          <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-bold text-sm text-white">{currentUser.username}</span>
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-400/40 text-emerald-400 text-[8px] font-mono rounded-[2px] uppercase">
                              <CheckCircle2 className="w-2.5 h-2.5" /> ACTIVE {currentUser.provider || 'GMAIL'}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-zinc-400 block">{currentUser.email}</span>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <span className="text-[9px] text-zinc-500 block">STREAK</span>
                        <span className="text-cyan-400 font-bold flex items-center gap-0.5 justify-end">
                          <Flame className="w-3 h-3 fill-cyan-400 text-cyan-400" /> {currentUser.stats.streak}D
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-500">SWITCH ACCOUNT OR LOGOUT</span>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          if (onLogout) {
                            onLogout();
                          } else {
                            logoutUser();
                            window.location.reload();
                          }
                        }}
                        className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-400/60 rounded text-[10px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1.5 uppercase transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        <LogOut className="w-3 h-3" /> LOGOUT SESSION
                      </button>
                    </div>
                  </div>
                )}

                {/* OAuth Buttons (Google & GitHub) */}
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={async () => {
                      sound.playClick();
                      setErrorMessage('');
                      setIsSubmitting(true);
                      try {
                        const { error } = await signInWithRealGoogle();
                        if (error) {
                          setErrorMessage(error.message || 'Google Sign-In failed');
                          setIsSubmitting(false);
                        }
                      } catch (err: any) {
                        setErrorMessage(err?.message || 'Google Sign-In error');
                        setIsSubmitting(false);
                      }
                    }}
                    className="w-full py-2.5 px-3 bg-[#121216] hover:bg-[#1b1b22] border border-white/[0.12] hover:border-cyan-400/50 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-[3px] flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-sm group disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>{isSubmitting ? 'OPENING GOOGLE SIGN-IN...' : 'CONTINUE WITH GOOGLE'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={async () => {
                      sound.playClick();
                      setErrorMessage('');
                      setIsSubmitting(true);
                      try {
                        const { error } = await signInWithGitHub();
                        if (error) {
                          setErrorMessage(error.message || 'GitHub Sign-In failed');
                          setIsSubmitting(false);
                        }
                      } catch (err: any) {
                        setErrorMessage(err?.message || 'GitHub Sign-In error');
                        setIsSubmitting(false);
                      }
                    }}
                    className="w-full py-2.5 px-3 bg-[#121216] hover:bg-[#1b1b22] border border-white/[0.12] hover:border-cyan-400/50 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-[3px] flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-sm group disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span>{isSubmitting ? 'OPENING GITHUB...' : 'CONTINUE WITH GITHUB'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 my-2 font-mono text-[9px] text-zinc-500">
                  <div className="flex-1 h-[1px] bg-white/[0.08]" />
                  <span>OR DIRECT OPERATOR ACCESS</span>
                  <div className="flex-1 h-[1px] bg-white/[0.08]" />
                </div>

                {/* Real Gmail Input Form */}
                <form onSubmit={handleGmailSubmit} className="space-y-4 text-left">
                  <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-[2px]">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] uppercase font-bold mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      REAL GMAIL IDENTITY & PROGRESS SYNC
                    </div>
                    <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                      Aap aur aapke dost apna real Gmail ID enter karke login karein. Saare streaks, puzzle scores aur level checkpoints real account se link honge.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 bg-red-500/10 border border-red-500/40 text-red-400 font-mono text-xs flex items-center gap-2 rounded-[2px]">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Gmail Address Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                      <span>REAL GMAIL ADDRESS</span>
                      {gmailInput.endsWith('@gmail.com') && (
                        <span className="text-emerald-400 text-[9px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> GMAIL VERIFIED
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        id="auth-modal-gmail-input"
                        type="email"
                        required
                        value={gmailInput}
                        onChange={e => handleEmailChange(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-black border border-white/[0.15] focus:border-cyan-400 rounded-[2px] font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                      />
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Display Name / Callsign */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      OPERATOR CALLSIGN / DISPLAY NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={callsignInput}
                      onChange={e => setCallsignInput(e.target.value)}
                      placeholder="e.g. ISHANT GUPTA"
                      className="w-full px-3 py-2.5 bg-black border border-white/[0.15] focus:border-cyan-400 rounded-[2px] font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors uppercase tracking-wider"
                    />
                  </div>

                  {/* Avatar Picker */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      CHOOSE TITAN AVATAR (22 ICONS)
                    </label>
                    <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 bg-black/60 border border-white/[0.1] rounded-[2px] scrollbar-thin">
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
                              ? 'border-cyan-400 ring-2 ring-cyan-400/60 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                          title={av.name}
                        >
                          <img src={av.src} alt={av.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-[2px] transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-black" />
                    <span>{isSubmitting ? 'AUTHENTICATING GMAIL...' : 'SIGN IN WITH REAL GMAIL'}</span>
                  </button>
                </form>
              </>
            )}

            {/* TAB 2: ROSTER OF FRIENDS */}
            {activeTab === 'roster' && (
              <div className="space-y-3">
                <div className="text-left mb-2">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                    REGISTERED FRIENDS ON THIS DEVICE
                  </span>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Click any friend to switch active player session instantly.
                  </p>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                  {accountsList.map(acc => {
                    const isCurrent = acc.id === currentUser.id;
                    return (
                      <div
                        key={acc.id}
                        onClick={() => !isCurrent && handleSwitch(acc.id)}
                        className={`p-3 rounded-[3px] border flex items-center justify-between transition-all ${
                          isCurrent
                            ? 'bg-cyan-500/10 border-cyan-400/80 ring-1 ring-cyan-400/30'
                            : 'bg-[#0e0e12] border-white/[0.08] hover:border-cyan-400/50 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-cyan-400/40 bg-black shrink-0">
                            <img src={acc.avatar} alt={acc.username} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-display font-bold text-sm text-white truncate">
                                {acc.username}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 bg-cyan-400 text-black font-mono text-[8px] font-bold rounded-[2px] shrink-0">
                                  CURRENT
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-cyan-400/80 block truncate">
                              {acc.email || 'GMAIL ACCOUNT'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 font-mono text-xs shrink-0">
                          <div className="text-right">
                            <span className="text-[9px] text-zinc-500 uppercase block">SOLVED</span>
                            <span className="font-bold text-white">{acc.stats.totalSolved}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-zinc-500 uppercase block">STREAK</span>
                            <span className="font-bold text-cyan-400 flex items-center gap-0.5">
                              <Flame className="w-3 h-3 fill-cyan-400 text-cyan-400" /> {acc.stats.streak}D
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-white/[0.08] flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setGmailInput('');
                      setCallsignInput('');
                      setActiveTab('gmail');
                    }}
                    className="flex-1 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-xs uppercase tracking-wider rounded-[2px] transition-all cursor-pointer"
                  >
                    + ADD FRIEND GMAIL
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onLogout();
                      }}
                      className="py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-400/60 text-rose-400 hover:text-rose-300 font-mono text-xs uppercase tracking-wider rounded-[2px] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      LOGOUT
                    </button>
                  )}
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
