import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  loginWithRealGmail,
  loginWithGitHubAccount,
  switchAccount,
  getSavedRealAccounts,
  AVAILABLE_AVATARS,
} from '../services/auth';
import {
  signInWithRealGoogle,
  signInWithGitHub,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  syncProfileToCloud,
} from '../services/supabase';
import { sound } from '../services/audio';
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Flame,
  ArrowRight,
  UserPlus,
  Zap,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface GatekeeperLoginProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const GatekeeperLogin: React.FC<GatekeeperLoginProps> = ({ onLoginSuccess }) => {
  const savedAccounts = getSavedRealAccounts();
  const [showNewAccountForm, setShowNewAccountForm] = useState<boolean>(savedAccounts.length === 0);
  const [authMode, setAuthMode] = useState<'google' | 'password' | 'github'>('google');

  // Password form state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisteringPassword, setIsRegisteringPassword] = useState(false);
  const [callsignInput, setCallsignInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('/anime/kakashi.svg');

  // GitHub form state
  const [githubInput, setGithubInput] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResumeSavedAccount = (acc: UserProfile) => {
    sound.playClick();
    const switched = switchAccount(acc.id);
    sound.playSuccess();
    onLoginSuccess(switched);
  };

  const handleGoogleClick = async () => {
    sound.playClick();
    setErrorMessage('');
    setAuthMode('google');
    setIsSubmitting(true);

    try {
      const res = await signInWithRealGoogle();
      if (res.error) {
        setErrorMessage(res.error.message || 'Google authorization failed. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google sign-in error.');
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    sound.playClick();
    setIsSubmitting(true);

    try {
      if (isRegisteringPassword) {
        const username = callsignInput.trim() || email.split('@')[0].toUpperCase();
        const { data, error } = await signUpWithEmailPassword(
          email,
          password,
          username,
          selectedAvatar
        );

        if (error) {
          setErrorMessage(error.message);
          setIsSubmitting(false);
          return;
        }

        const newUser = loginWithRealGmail(email, username, selectedAvatar);
        syncProfileToCloud(newUser);
        sound.playSuccess();
        onLoginSuccess(newUser);
      } else {
        const { data, error } = await signInWithEmailPassword(email, password);

        if (error) {
          setErrorMessage(error.message || 'Invalid email or password');
          setIsSubmitting(false);
          return;
        }

        const u = data.user;
        const username =
          u?.user_metadata?.full_name ||
          u?.user_metadata?.user_name ||
          email.split('@')[0].toUpperCase();
        const avatar = u?.user_metadata?.avatar_url || selectedAvatar;

        const user = loginWithRealGmail(email, username, avatar);
        syncProfileToCloud(user);
        sound.playSuccess();
        onLoginSuccess(user);
      }
    } catch (err: any) {
      console.error('Password auth error:', err);
      setErrorMessage(err?.message || 'Authentication failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  const handleGitHubOAuthClick = async () => {
    sound.playClick();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await signInWithGitHub();
      if (res.error) {
        setErrorMessage(res.error.message || 'GitHub OAuth failed');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'GitHub login error');
      setIsSubmitting(false);
    }
  };

  const handleGitHubUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const raw = githubInput.trim();
    if (!raw) {
      setErrorMessage('Please enter your GitHub username or email');
      return;
    }

    sound.playClick();
    setIsSubmitting(true);

    try {
      let displayName = raw.toUpperCase();
      let avatarUrl = '/anime/jinwoo.svg';
      let email = raw.includes('@') ? raw.toLowerCase() : `${raw.toLowerCase()}@github.com`;

      try {
        const res = await fetch(`https://api.github.com/users/${encodeURIComponent(raw)}`);
        if (res.ok) {
          const ghData = await res.json();
          if (ghData.avatar_url) avatarUrl = ghData.avatar_url;
          if (ghData.name) displayName = ghData.name.toUpperCase();
          if (ghData.email) email = ghData.email;
        }
      } catch (ghErr) {
        console.debug('GitHub public fetch note:', ghErr);
      }

      const newUser = loginWithGitHubAccount(email, displayName, avatarUrl);
      syncProfileToCloud(newUser);
      sound.playSuccess();
      onLoginSuccess(newUser);
    } catch (err) {
      console.error('GitHub login error:', err);
      setErrorMessage('Failed to connect GitHub account. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-[#050508] overflow-y-auto select-none animate-fade-in pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
      {/* Ambient Lighting */}
      <div className="fixed top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/3 w-96 h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="min-h-full w-full flex flex-col items-center justify-start sm:justify-center p-4 py-6 sm:py-10">
        <div className="relative z-10 w-full max-w-md my-auto flex flex-col items-center text-center">
          {/* Glowing Snowflake Logo & Title */}
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-black/80 border border-cyan-500/40 p-1 flex items-center justify-center shadow-[0_0_35px_rgba(6,182,212,0.7)]">
              <img src="/logo.png" alt="ARCADEX Logo" className="w-full h-full object-contain" />
            </div>
            <div className="absolute -inset-1.5 rounded-2xl border border-cyan-400/30 animate-ping pointer-events-none" />
          </div>

          <span className="font-mono text-[9px] text-cyan-400 tracking-[0.3em] uppercase block font-bold mb-1">
            // OPERATOR AUTHENTICATION GATEWAY
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mb-1">
            PLAYER IDENTIFICATION
          </h1>
          <p className="font-sans text-xs text-zinc-400 mb-4 leading-relaxed max-w-sm">
            Har ek player ka apna personal game database hota hai. Level checkpoints, streaks aur scores aapki ID par alag save rehte hain.
          </p>

          {/* SECTION 1: SAVED OPERATOR PROFILES (Quick Switch) */}
          {savedAccounts.length > 0 && !showNewAccountForm && (
            <div className="w-full space-y-3 mb-4 animate-fade-in">
              <div className="flex items-center justify-between text-left">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> SAVED PLAYERS ON THIS DEVICE
                </span>
                <span className="text-[9px] font-mono text-zinc-500">1-TAP RESUME</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5 scrollbar-thin">
                {savedAccounts.map(acc => (
                  <div
                    key={acc.id}
                    onClick={() => handleResumeSavedAccount(acc)}
                    className="p-3 bg-[#0c0d12] hover:bg-[#12141c] border border-cyan-500/40 hover:border-cyan-400 rounded-[3px] flex items-center justify-between transition-all cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.6)] group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full border border-cyan-400 overflow-hidden bg-black shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                        <img src={acc.avatar} alt={acc.username} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left min-w-0">
                        <span className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors truncate block">
                          {acc.username}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400 truncate block">
                          {acc.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right font-mono text-xs">
                        <span className="text-[9px] text-zinc-500 uppercase block">STREAK</span>
                        <span className="font-bold text-cyan-400 flex items-center gap-0.5 justify-end">
                          <Flame className="w-3 h-3 fill-cyan-400 text-cyan-400" /> {acc.stats?.streak || 0}D
                        </span>
                      </div>
                      <div className="w-7 h-7 rounded bg-cyan-500/10 group-hover:bg-cyan-500/20 text-cyan-400 flex items-center justify-center transition-colors">
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowNewAccountForm(true);
                }}
                className="w-full py-2.5 px-3 bg-[#101015] hover:bg-[#181822] border border-white/[0.12] hover:border-cyan-400/50 text-cyan-300 font-mono text-xs uppercase tracking-wider rounded-[3px] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>+ LOGIN WITH ANOTHER ACCOUNT</span>
              </button>
            </div>
          )}

          {/* SECTION 2: NEW LOGIN FORM */}
          {showNewAccountForm && (
            <div className="w-full space-y-3 animate-fade-in">
              {savedAccounts.length > 0 && (
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setShowNewAccountForm(false);
                      setErrorMessage('');
                    }}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 uppercase transition-colors mb-1 cursor-pointer"
                  >
                    ← BACK TO SAVED PLAYERS ({savedAccounts.length})
                  </button>
                </div>
              )}

              {/* Provider Selectors: Google, Password, GitHub */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAuthMode('google');
                    setErrorMessage('');
                  }}
                  className={`py-2 px-2 border rounded-[3px] flex items-center justify-center gap-1.5 font-sans font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                    authMode === 'google'
                      ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-[#0f0f14] border-white/[0.12] hover:border-white/30 text-zinc-300'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>GOOGLE</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAuthMode('password');
                    setErrorMessage('');
                  }}
                  className={`py-2 px-2 border rounded-[3px] flex items-center justify-center gap-1.5 font-sans font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                    authMode === 'password'
                      ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-[#0f0f14] border-white/[0.12] hover:border-white/30 text-zinc-300'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>PASSWORD</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAuthMode('github');
                    setErrorMessage('');
                  }}
                  className={`py-2 px-2 border rounded-[3px] flex items-center justify-center gap-1.5 font-sans font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                    authMode === 'github'
                      ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-[#0f0f14] border-white/[0.12] hover:border-white/30 text-zinc-300'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 fill-white shrink-0" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GITHUB</span>
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-2.5 bg-rose-950/40 border border-rose-500/50 rounded-[3px] text-left text-xs font-mono text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* MODE 1: OFFICIAL GOOGLE OAUTH */}
              {authMode === 'google' && (
                <div className="space-y-3 text-left bg-[#09090c] border border-cyan-500/30 p-4 rounded-[4px] shadow-[0_0_30px_rgba(0,0,0,0.7)]">
                  <div className="text-center py-2 space-y-2">
                    <p className="text-xs font-mono text-zinc-300">
                      Official Google Authorization (OAuth 2.0)
                    </p>
                    <p className="text-[11px] font-sans text-zinc-500">
                      Tap below to open Google's real account picker and authorization screen.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleClick}
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-white hover:bg-zinc-100 text-zinc-900 font-sans font-bold text-xs uppercase tracking-wider rounded-[3px] transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>{isSubmitting ? 'OPENING GOOGLE SIGN-IN...' : 'CONTINUE WITH GOOGLE'}</span>
                  </button>
                </div>
              )}

              {/* MODE 2: EMAIL & PASSWORD AUTHENTICATION */}
              {authMode === 'password' && (
                <form
                  onSubmit={handlePasswordSubmit}
                  className="space-y-3 text-left bg-[#09090c] border border-cyan-500/30 p-4 rounded-[4px] shadow-[0_0_30px_rgba(0,0,0,0.7)]"
                >
                  <div className="flex bg-black/60 p-1 rounded-[3px] border border-white/[0.08] text-center font-mono text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsRegisteringPassword(false);
                        setErrorMessage('');
                      }}
                      className={`flex-1 py-1.5 rounded-[2px] transition-colors ${
                        !isRegisteringPassword ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-zinc-500'
                      }`}
                    >
                      SIGN IN
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsRegisteringPassword(true);
                        setErrorMessage('');
                      }}
                      className={`flex-1 py-1.5 rounded-[2px] transition-colors ${
                        isRegisteringPassword ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-zinc-500'
                      }`}
                    >
                      CREATE ACCOUNT
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      EMAIL ADDRESS
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="operator@domain.com"
                        className="w-full pl-9 pr-3 py-2 bg-black border border-white/[0.15] focus:border-cyan-400 rounded-[2px] font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                      />
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordInput}
                        onChange={e => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 bg-black border border-white/[0.15] focus:border-cyan-400 rounded-[2px] font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                      />
                      <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isRegisteringPassword && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                          CALLSIGN / USERNAME
                        </label>
                        <input
                          type="text"
                          required
                          value={callsignInput}
                          onChange={e => setCallsignInput(e.target.value)}
                          placeholder="e.g. TITAN OPERATOR"
                          className="w-full px-3 py-2 bg-black border border-white/[0.15] focus:border-cyan-400 rounded-[2px] font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors uppercase tracking-wider"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                          CHOOSE AVATAR
                        </label>
                        <div className="grid grid-cols-6 gap-1.5 max-h-20 overflow-y-auto p-1 bg-black/60 border border-white/[0.1] rounded-[2px] scrollbar-thin">
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
                                  ? 'border-cyan-400 ring-2 ring-cyan-400/60 scale-105'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                              title={av.name}
                            >
                              <img src={av.src} alt={av.name} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-[2px] transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
                  >
                    <UserCheck className="w-4 h-4 text-black" />
                    <span>
                      {isSubmitting
                        ? 'PROCESSING...'
                        : isRegisteringPassword
                        ? 'CREATE ACCOUNT & PLAY'
                        : 'SIGN IN & ENTER ARCADEX'}
                    </span>
                  </button>
                </form>
              )}

              {/* MODE 3: GITHUB AUTH */}
              {authMode === 'github' && (
                <div className="space-y-3 text-left bg-[#09090c] border border-cyan-500/30 p-4 rounded-[4px] shadow-[0_0_30px_rgba(0,0,0,0.7)]">
                  <button
                    type="button"
                    onClick={handleGitHubOAuthClick}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-[#1f2328] hover:bg-[#2b313a] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-[3px] transition-all border border-white/20 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                  >
                    <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span>{isSubmitting ? 'CONNECTING GITHUB...' : 'CONTINUE WITH GITHUB OAUTH'}</span>
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-2 text-[9px] font-mono text-zinc-500 uppercase">OR VIA USERNAME</span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>

                  <form onSubmit={handleGitHubUsernameSubmit} className="space-y-2">
                    <input
                      type="text"
                      required
                      value={githubInput}
                      onChange={e => {
                        setGithubInput(e.target.value);
                        setErrorMessage('');
                      }}
                      placeholder="e.g. Ishant6565"
                      className="w-full px-3 py-2 bg-black border border-white/[0.15] focus:border-cyan-400 rounded-[2px] font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2 bg-[#12141c] hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-xs uppercase tracking-wider rounded-[2px] transition-all cursor-pointer"
                    >
                      SYNC GITHUB PROFILE & PLAY
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400/70" />
            <span>PERSONAL GAME DATABASE // ZERO DATA LEAKAGE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
