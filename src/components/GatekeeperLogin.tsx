import React, { useState } from 'react';
import { UserProfile } from '../types';
import { loginWithRealGmail, loginWithGitHubAccount, AVAILABLE_AVATARS } from '../services/auth';
import { signInWithRealGoogle, signInWithGitHub, syncProfileToCloud } from '../services/supabase';
import { sound } from '../services/audio';
import { Mail, ShieldCheck, CheckCircle2, AlertCircle, UserCheck, Sparkles, Terminal } from 'lucide-react';

interface GatekeeperLoginProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const GatekeeperLogin: React.FC<GatekeeperLoginProps> = ({ onLoginSuccess }) => {
  const [gmailInput, setGmailInput] = useState('');
  const [callsignInput, setCallsignInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('/anime/kakashi.svg');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (val: string) => {
    setGmailInput(val);
    setErrorMessage('');
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
      syncProfileToCloud(newUser);
      sound.playSuccess();
      onLoginSuccess(newUser);
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Failed to initialize account. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-[#050508] overflow-y-auto select-none animate-fade-in">
      {/* Ambient Lighting */}
      <div className="fixed top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/3 w-96 h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="min-h-full w-full flex flex-col items-center justify-start sm:justify-center p-4 py-8 sm:py-10">
        <div className="relative z-10 w-full max-w-md my-auto flex flex-col items-center text-center">
          {/* Glowing Logo & Title */}
          <div className="relative mb-3">
            <div className="w-13 h-13 rounded-[4px] bg-gradient-to-tr from-cyan-400 to-blue-500 text-black flex items-center justify-center font-display font-black text-2xl shadow-[0_0_35px_rgba(6,182,212,0.7)]">
              A
            </div>
            <div className="absolute -inset-1.5 rounded-[6px] border border-cyan-400/40 animate-ping pointer-events-none" />
          </div>

          <span className="font-mono text-[10px] text-cyan-400 tracking-[0.3em] uppercase block font-bold mb-1">
            // OPERATOR ONBOARDING PROTOCOL
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mb-1.5">
            INITIALIZE OPERATOR ID
          </h1>
          <p className="font-sans text-xs text-zinc-400 mb-4 leading-relaxed max-w-sm">
            Ek baar apna real ID set karein — aapke saare 100-level checkpoints, daily streaks aur scores is device par permanently save rahenge.
          </p>

          {/* OAuth Buttons (Google & GitHub) */}
          <div className="w-full space-y-2 mb-4">
          {/* Google Sign-in Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={async () => {
              sound.playClick();
              setIsSubmitting(true);
              setErrorMessage('');
              const { error } = await signInWithRealGoogle();
              if (error) {
                setErrorMessage(error.message || 'Failed to connect to Google OAuth');
                setIsSubmitting(false);
              }
            }}
            className="w-full py-3 px-4 bg-[#0f0f14] hover:bg-[#181822] border border-white/[0.12] hover:border-cyan-400/50 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-[3px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm group disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{isSubmitting ? 'CONNECTING TO GOOGLE...' : 'CONTINUE WITH GOOGLE'}</span>
          </button>

          {/* GitHub Sign-in Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={async () => {
              sound.playClick();
              setIsSubmitting(true);
              setErrorMessage('');
              const { error } = await signInWithGitHub();
              if (error) {
                setErrorMessage(error.message || 'Failed to connect to GitHub OAuth');
                setIsSubmitting(false);
              }
            }}
            className="w-full py-3 px-4 bg-[#0f0f14] hover:bg-[#181822] border border-white/[0.12] hover:border-cyan-400/50 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-[3px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm group disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>{isSubmitting ? 'CONNECTING TO GITHUB...' : 'CONTINUE WITH GITHUB'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3 mb-5 font-mono text-[10px] text-zinc-500">
          <div className="flex-1 h-[1px] bg-white/[0.08]" />
          <span>OR DIRECT GMAIL ACCESS</span>
          <div className="flex-1 h-[1px] bg-white/[0.08]" />
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="w-full mb-4 p-3 bg-rose-950/40 border border-rose-500/50 rounded-[3px] text-left text-xs font-mono text-rose-300 flex items-start gap-2 animate-fade-in shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Direct Gmail Input Form */}
        <form onSubmit={handleGmailSubmit} className="w-full space-y-4 text-left bg-[#09090c] border border-cyan-500/30 p-4 sm:p-5 rounded-[4px] shadow-[0_0_30px_rgba(0,0,0,0.7)]">
          {/* Gmail Address */}
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
                id="gatekeeper-gmail-input"
                type="email"
                required
                value={gmailInput}
                onChange={e => handleEmailChange(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 bg-black border border-white/[0.15] focus:border-cyan-400 rounded-[2px] font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[10px] font-mono text-cyan-400/80 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Direct Supabase Sync: Profiles, Stats & Game Levels automatically cloud stored</span>
            </p>
          </div>

          {/* Callsign */}
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

          {/* Avatar Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              CHOOSE TITAN AVATAR (22 ICONS)
            </label>
            <div className="grid grid-cols-6 gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-black/60 border border-white/[0.1] rounded-[2px] scrollbar-thin">
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-[2px] transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <UserCheck className="w-4 h-4 text-black" />
            <span>{isSubmitting ? 'INITIALIZING ID...' : 'ENTER ARCADEX SUITE'}</span>
          </button>
        </form>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400/70" />
          <span>SESSION PERSISTS PERMANENTLY IN YOUR BROWSER</span>
        </div>
      </div>
    </div>
  </div>
);
};
