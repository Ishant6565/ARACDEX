import React from 'react';
import { UserStats } from '../types';
import { Brain, Flame, Target, Trophy } from 'lucide-react';

export const StatsStrip: React.FC<{ stats: UserStats }> = ({ stats }) => {
  return (
    <section id="stats" className="border-y border-white/[0.08] bg-[#070707] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Stat 1 */}
          <div className="p-4 bg-[#0a0a0a] border border-white/[0.06] rounded-[2px]">
            <div className="flex items-center justify-between text-white/40 mb-2 font-mono text-[10px] tracking-widest uppercase">
              <span>SOLVED PUZZLES</span>
              <Brain className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              {stats.totalSolved}
            </div>
            <span className="text-[10px] font-mono text-white/30 uppercase block mt-1">
              Verified local solutions
            </span>
          </div>

          {/* Stat 2 */}
          <div className="p-4 bg-[#0a0a0a] border border-white/[0.06] rounded-[2px]">
            <div className="flex items-center justify-between text-white/40 mb-2 font-mono text-[10px] tracking-widest uppercase">
              <span>ACTIVE STREAK</span>
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            </div>
            <div className="text-3xl sm:text-4xl font-display font-bold text-amber-400 tracking-tight">
              {stats.streak} <span className="text-base font-normal text-white/60 font-mono">DAYS</span>
            </div>
            <span className="text-[10px] font-mono text-white/30 uppercase block mt-1">
              Daily cognitive continuity
            </span>
          </div>

          {/* Stat 3 */}
          <div className="p-4 bg-[#0a0a0a] border border-white/[0.06] rounded-[2px]">
            <div className="flex items-center justify-between text-white/40 mb-2 font-mono text-[10px] tracking-widest uppercase">
              <span>ACCURACY RATE</span>
              <Target className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              {stats.accuracyRate}%
            </div>
            <span className="text-[10px] font-mono text-white/30 uppercase block mt-1">
              Zero-error validation
            </span>
          </div>

          {/* Stat 4 */}
          <div className="p-4 bg-[#0a0a0a] border border-white/[0.06] rounded-[2px]">
            <div className="flex items-center justify-between text-white/40 mb-2 font-mono text-[10px] tracking-widest uppercase">
              <span>ARCADE TIER</span>
              <Trophy className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight truncate">
              {stats.arcadeRank}
            </div>
            <span className="text-[10px] font-mono text-white/30 uppercase block mt-1">
              ISHANT STUDIO RATING
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
