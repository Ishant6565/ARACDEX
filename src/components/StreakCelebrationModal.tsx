import React, { useEffect, useState } from 'react';
import { Flame, Share2, ArrowRight, Sparkles } from 'lucide-react';
import { sound } from '../services/audio';
import { haptics } from '../services/haptics';
import { shareAchievement } from '../services/share';
import { createPortal } from 'react-dom';

export const StreakCelebrationModal: React.FC = () => {
  const [streakData, setStreakData] = useState<{ streak: number } | null>(null);

  useEffect(() => {
    const handleStreakEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ streak: number; prevStreak: number }>;
      if (customEvent.detail && customEvent.detail.streak) {
        setStreakData({ streak: customEvent.detail.streak });
        haptics.streak();
      }
    };

    window.addEventListener('arcadex_streak_unlocked', handleStreakEvent);
    return () => {
      window.removeEventListener('arcadex_streak_unlocked', handleStreakEvent);
    };
  }, []);

  if (!streakData) return null;

  const handleClose = () => {
    sound.playClick();
    setStreakData(null);
  };

  const handleShare = () => {
    sound.playClick();
    haptics.medium();
    shareAchievement({
      gameTitle: 'ARCADEX STREAK',
      streak: streakData.streak,
      customNote: `🔥 Boom! Just achieved a ${streakData.streak}-Day active streak on ARCADEX! Can your brain keep up with mine?`,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
      <div 
        className="relative w-full max-w-sm bg-[#0a0a0d] border-2 border-cyan-400/80 rounded-[4px] p-6 text-center shadow-[0_0_60px_rgba(6,182,212,0.35)] overflow-hidden animate-arena-enter"
        onClick={e => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-cyan-500/20 blur-[40px] pointer-events-none rounded-full" />

        {/* Animated Celebration Icon */}
        <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping pointer-events-none" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-cyan-400/30 to-blue-600/30 border border-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.7)]">
            <Flame className="w-8 h-8 fill-cyan-300 text-cyan-300 animate-bounce" />
          </div>
        </div>

        {/* Tagline */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full font-mono text-[10px] text-cyan-300 font-bold tracking-widest uppercase mb-2">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>STREAK MULTIPLIER UNLOCKED</span>
        </div>

        {/* Big Congrats Heading */}
        <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
          CONGRATULATIONS!
        </h2>

        <div className="my-3 py-2 px-3 bg-[#111116] border border-cyan-500/30 rounded-[2px]">
          <span className="font-mono text-cyan-400 font-black text-lg sm:text-xl tracking-wider block">
            🔥 DAY {streakData.streak} STREAK ACTIVE!
          </span>
        </div>

        <p className="font-sans text-xs text-zinc-300 mb-6 leading-relaxed max-w-xs mx-auto">
          Cognitive continuity sustained! Consistent daily problem-solving sharpens memory recall and unlocks titan-tier mental speed.
        </p>

        {/* Action Buttons */}
        <div className="space-y-2 font-mono text-xs">
          <button
            onClick={handleShare}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold uppercase tracking-wider rounded-[2px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Share2 className="w-4 h-4 text-black" />
            <span>SHARE STREAK ON WHATSAPP</span>
          </button>

          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-[#16161c] hover:bg-[#202028] border border-white/[0.1] hover:border-cyan-400/50 text-zinc-300 hover:text-white font-bold uppercase tracking-wider rounded-[2px] flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <span>CONTINUE PLAYING</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
