import React from 'react';
import { UserStats } from '../types';
import { Brain, Flame, Target, Trophy, ChevronRight } from 'lucide-react';
import { sound } from '../services/audio';

interface StatsStripProps {
  stats: UserStats;
  onOpenStats: (tab?: 'tiers' | 'graphs' | 'streak' | 'vault' | 'leaderboard') => void;
}

export const StatsStrip: React.FC<StatsStripProps> = ({ stats, onOpenStats }) => {
  return (
    <section id="stats" className="border-y border-white/[0.08] bg-[#070707]/90 backdrop-blur-sm py-8 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] tracking-[0.25em] text-cyan-400/80 uppercase">
            // LIVE COGNITIVE TELEMETRY (100 LEVEL REPOSITORY)
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onOpenStats('tiers');
            }}
            className="flex items-center gap-1 font-mono text-xs text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider"
          >
            INSPECT TIERS & ANALYTICS <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Stat 1: Solved Puzzles */}
          <div
            onClick={() => {
              sound.playClick();
              onOpenStats('graphs');
            }}
            className="p-4 bg-[#0a0a0a] hover:bg-[#111111] border border-white/[0.08] hover:border-cyan-400/40 rounded-[2px] cursor-pointer transition-all duration-200 group active:scale-[0.98] shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
            title="Click to view weekly activity charts"
          >
            <div className="flex items-center justify-between text-zinc-400 mb-2 font-mono text-[10px] tracking-widest uppercase">
              <span>SOLVED PUZZLES</span>
              <Brain className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              {stats.totalSolved}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                Verified solutions
              </span>
              <span className="text-[9px] font-mono text-cyan-400 group-hover:underline">
                VIEW GRAPHS →
              </span>
            </div>
          </div>

          {/* Stat 2: Active Streak */}
          <div
            onClick={() => {
              sound.playClick();
              onOpenStats('streak');
            }}
            className="p-4 bg-[#0a0a0a] hover:bg-[#111111] border border-white/[0.08] hover:border-cyan-400/40 rounded-[2px] cursor-pointer transition-all duration-200 group active:scale-[0.98] shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
            title="Click to view 30-day streak calendar"
          >
            <div className="flex items-center justify-between text-zinc-400 mb-2 font-mono text-[10px] tracking-widest uppercase">
              <span>ACTIVE STREAK</span>
              <Flame className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 group-hover:scale-110 transition-transform animate-pulse" />
            </div>
            <div className="text-3xl sm:text-4xl font-display font-bold text-cyan-400 tracking-tight">
              {stats.streak} <span className="text-base font-normal text-white/70 font-mono">DAYS</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                {stats.streak === 0 ? 'START TODAY' : 'DAILY CONTINUITY'}
              </span>
              <span className="text-[9px] font-mono text-cyan-400 group-hover:underline">
                STREAK MATRIX →
              </span>
            </div>
          </div>

          {/* Stat 3: Accuracy */}
          <div
            onClick={() => {
              sound.playClick();
              onOpenStats('graphs');
            }}
            className="p-4 bg-[#0a0a0a] hover:bg-[#111111] border border-white/[0.08] hover:border-cyan-400/40 rounded-[2px] cursor-pointer transition-all duration-200 group active:scale-[0.98] shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
            title="Click to view cognitive accuracy radar"
          >
            <div className="flex items-center justify-between text-zinc-400 mb-2 font-mono text-[10px] tracking-widest uppercase">
              <span>ACCURACY RATE</span>
              <Target className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              {stats.accuracyRate}%
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                Cognitive precision
              </span>
              <span className="text-[9px] font-mono text-cyan-400 group-hover:underline">
                RADAR STATS →
              </span>
            </div>
          </div>

          {/* Stat 4: Arcade Tier */}
          <div
            onClick={() => {
              sound.playClick();
              onOpenStats('tiers');
            }}
            className="p-4 bg-[#0a0a0a] hover:bg-[#111111] border border-white/[0.08] hover:border-cyan-400/40 rounded-[2px] cursor-pointer transition-all duration-200 group active:scale-[0.98] shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
            title="Click to view full Tiers Ladder"
          >
            <div className="flex items-center justify-between text-zinc-400 mb-2 font-mono text-[10px] tracking-widest uppercase">
              <span>ARCADE TIER</span>
              <Trophy className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-lg sm:text-xl font-display font-bold text-white tracking-tight truncate">
              {stats.arcadeRank}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                STUDIO RATING
              </span>
              <span className="text-[9px] font-mono text-cyan-400 font-bold group-hover:underline">
                LEVEL PROGRESS →
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
