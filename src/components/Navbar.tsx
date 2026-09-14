import React, { useState } from 'react';
import { Flame, Zap, Sliders, Gamepad2, Trophy } from 'lucide-react';
import { sound } from '../services/audio';
import { haptics } from '../services/haptics';
import { UserStats, UserProfile } from '../types';
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
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#060608]/95 backdrop-blur-md border-b border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.8)] transition-all select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand / Logo replaced with Player Avatar */}
        <div className="flex items-center min-w-0">
          <button
            onClick={() => {
              sound.playClick();
              onOpenAuth();
            }}
            className="flex items-center gap-2 group p-1 -ml-1 rounded-[4px] hover:bg-white/[0.04] transition-all min-w-0"
            title="Player Profile & Account"
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-cyan-400 bg-black shadow-[0_0_14px_rgba(6,182,212,0.6)] group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.9)] transition-all">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#060608] rounded-full shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            </div>
            <div className="flex flex-col text-left truncate max-w-[110px] sm:max-w-[180px]">
              <span className="font-display font-bold text-xs sm:text-sm tracking-tight text-white group-hover:text-cyan-400 transition-colors leading-tight truncate">
                {currentUser.username}
              </span>
              <span className="font-mono text-[8px] sm:text-[9px] text-cyan-400 leading-tight truncate">
                {currentUser.stats.arcadeRank.split('//')[0].trim()}
              </span>
            </div>
          </button>
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

        {/* Action Widgets */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Daily Streak Badge (Clickable -> Opens Streak Calendar) */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenStats('streak');
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 bg-[#0d0d0d] hover:bg-[#161616] border border-cyan-500/30 hover:border-cyan-400 rounded-[2px] font-mono text-[11px] sm:text-xs text-cyan-400 transition-all active:scale-95 shadow-[0_0_10px_rgba(6,182,212,0.15)] shrink-0 whitespace-nowrap"
            title="Inspect 30-Day Streak Matrix"
          >
            <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-cyan-400 text-cyan-400 animate-pulse shrink-0" />
            <span className="font-bold">{stats.streak}D STREAK</span>
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

          {/* Settings Button (Controls Master Volume, BGM, Haptics) */}
          <button
            onClick={() => {
              sound.playClick();
              haptics.light();
              setIsSettingsOpen(true);
            }}
            className="p-1.5 sm:p-2 bg-[#101010] hover:bg-[#181818] border border-white/[0.15] hover:border-cyan-400/60 rounded-[2px] text-white/60 hover:text-cyan-400 transition-all shrink-0"
            title="System Audio & Engine Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>

    {/* System Settings Modal */}
    <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
