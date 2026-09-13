import React from 'react';
import { Volume2, VolumeX, Flame, Zap, Shield } from 'lucide-react';
import { sound } from '../services/audio';
import { UserStats } from '../types';

interface NavbarProps {
  stats: UserStats;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRandom: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  soundEnabled,
  onToggleSound,
  onOpenRandom,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-display font-black text-sm rounded-[2px] shadow-sm group-hover:scale-105 transition-transform">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                ARCADEX
                <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 bg-white/[0.08] text-white/60 rounded-[1px]">
                  STUDIO
                </span>
              </span>
              <span className="text-[8px] font-mono tracking-[0.2em] text-white/40 uppercase">
                BY ISHANT
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-xs text-white/60 tracking-wider">
          <a href="#manifesto" className="hover:text-white transition-colors">
            // 01 MANIFESTO
          </a>
          <a href="#catalog" className="hover:text-white transition-colors">
            // 02 CATALOG
          </a>
          <a href="#stats" className="hover:text-white transition-colors">
            // 03 STATS
          </a>
        </nav>

        {/* Action Widgets */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Streak Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#0d0d0d] border border-white/[0.08] rounded-[2px] font-mono text-xs text-amber-400">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{stats.streak}D STREAK</span>
          </div>

          {/* Quick Random Protocol */}
          <button
            onClick={onOpenRandom}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-[2px] font-mono text-xs text-white tracking-wider transition-all"
            title="Launch Random Game"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            QUICK RUN
          </button>

          {/* Web Audio Toggle */}
          <button
            onClick={onToggleSound}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] border font-mono text-xs transition-all ${
              soundEnabled
                ? 'bg-white text-black border-white font-semibold'
                : 'bg-[#0d0d0d] text-white/50 border-white/[0.08] hover:text-white'
            }`}
            title={soundEnabled ? 'Mute Audio Synth' : 'Enable Audio Synth'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px] tracking-wider">SYNTH ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px] tracking-wider">MUTED</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
