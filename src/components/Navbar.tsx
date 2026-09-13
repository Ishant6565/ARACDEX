import React, { useState } from 'react';
import { Volume2, VolumeX, Flame, Zap, Music, Download, Smartphone, Sliders, BookOpen, Gamepad2, Trophy } from 'lucide-react';
import { sound } from '../services/audio';
import { haptics } from '../services/haptics';
import { UserStats, UserProfile } from '../types';
import { InstallPwaModal } from './InstallPwaModal';
import { SettingsModal } from './SettingsModal';

interface NavbarProps {
  stats: UserStats;
  currentUser: UserProfile;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRandom: () => void;
  onOpenAuth: () => void;
  onOpenStats: (tab?: 'tiers' | 'graphs' | 'streak' | 'vault' | 'leaderboard') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  currentUser,
  soundEnabled,
  onToggleSound,
  onOpenRandom,
  onOpenAuth,
  onOpenStats,
}) => {
  const [bgmState, setBgmState] = useState<boolean>(sound.isBgmPlaying);
  const [hapticsState, setHapticsState] = useState<boolean>(haptics.isEnabled());
  const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#060608]/95 backdrop-blur-md border-b border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.8)] transition-all select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo - Clean & Centered */}
        <div className="flex items-center">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-cyan-400 text-black flex items-center justify-center font-display font-black text-sm rounded-[2px] shadow-[0_0_12px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform">
              A
            </div>
            <span className="font-display font-bold text-base tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              ARCADEX
            </span>
          </a>
        </div>

        {/* Desktop Navigation Links - Modern Icons with Tooltips & Labels */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-[#0a0a0c] border border-white/[0.08] rounded-[3px]">
          <a
            href="#catalog"
            title="Arcade Games"
            className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-300 hover:text-cyan-400 hover:bg-white/[0.04] rounded-[2px] transition-all font-mono text-xs tracking-wider group"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden lg:inline">GAMES</span>
          </a>
          <button
            onClick={() => {
              sound.playClick();
              onOpenStats('tiers');
            }}
            title="Tiers & Analytics"
            className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-300 hover:text-cyan-400 hover:bg-white/[0.04] rounded-[2px] transition-all font-mono text-xs tracking-wider group"
          >
            <Trophy className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden lg:inline">TIERS & STATS</span>
          </button>
        </nav>

        {/* Action Widgets & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Streak Badge (Clickable -> Opens Streak Calendar) */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenStats('streak');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0d0d0d] hover:bg-[#161616] border border-cyan-500/30 hover:border-cyan-400 rounded-[2px] font-mono text-xs text-cyan-400 transition-all active:scale-95 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
            title="Inspect 30-Day Streak Matrix"
          >
            <Flame className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400 animate-pulse" />
            <span>{stats.streak}D STREAK</span>
          </button>

          {/* Quick Random Protocol */}
          <button
            onClick={onOpenRandom}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-[2px] font-mono text-xs text-cyan-300 tracking-wider transition-all"
            title="Launch Random Game"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            QUICK RUN
          </button>

          {/* Background Music Quick Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              sound.toggleBGM();
              setBgmState(sound.isBgmPlaying);
            }}
            className={`p-2 rounded-[2px] border font-mono text-xs transition-all ${
              bgmState
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] animate-pulse'
                : 'bg-[#0d0d0d] text-zinc-400 border-white/[0.1] hover:text-white'
            }`}
            title={bgmState ? 'BGM: Playing (Click to Pause)' : 'BGM: Paused (Click to Play)'}
          >
            <Music className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* Web Audio SFX Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-[2px] border font-mono text-xs transition-all ${
              soundEnabled
                ? 'bg-cyan-400 text-black border-cyan-400 font-semibold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-[#0d0d0d] text-white/50 border-white/[0.08] hover:text-white'
            }`}
            title={soundEnabled ? 'SFX: Enabled' : 'SFX: Muted'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          {/* PWA Install App Button */}
          <button
            onClick={() => {
              sound.playClick();
              haptics.medium();
              setIsInstallOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-cyan-500/20 via-cyan-400/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/50 hover:border-cyan-300 rounded-[2px] font-mono text-xs text-cyan-300 font-bold tracking-wider shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all active:scale-95 group"
            title="Install ARCADEX App to Home Screen"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
            <span className="hidden sm:inline text-[10px] tracking-wider">INSTALL APP</span>
          </button>

          {/* User Account / Profile Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAuth();
            }}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 bg-[#101010] hover:bg-[#181818] border border-white/[0.15] hover:border-cyan-400/60 rounded-[2px] transition-all group"
            title="Player Account & Friends Roster"
          >
            <div className="w-6 h-6 rounded-[2px] overflow-hidden border border-cyan-400/40 bg-black shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-mono text-[10px] font-bold text-white leading-tight truncate max-w-[90px]">
                {currentUser.username}
              </span>
              <span className="font-mono text-[8px] text-cyan-400 leading-tight">
                {currentUser.stats.arcadeRank.split('//')[0].trim()}
              </span>
            </div>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              sound.playClick();
              haptics.light();
              setIsSettingsOpen(true);
            }}
            className="p-2 bg-[#101010] hover:bg-[#181818] border border-white/[0.15] hover:border-cyan-400/60 rounded-[2px] text-white/60 hover:text-cyan-400 transition-all"
            title="System Audio & Engine Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>

    {/* PWA Install Modal */}
    <InstallPwaModal isOpen={isInstallOpen} onClose={() => setIsInstallOpen(false)} />

    {/* System Settings Modal */}
    <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
