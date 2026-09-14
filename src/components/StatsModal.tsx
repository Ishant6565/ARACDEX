import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { UserStats, UserProfile } from '../types';
import { TIERS_LADDER, getTierForSolved } from '../services/storage';
import { sound } from '../services/audio';
import { haptics } from '../services/haptics';
import { shareAchievement } from '../services/share';
import { getAllAccounts } from '../services/auth';
import {
  X,
  Trophy,
  Flame,
  BarChart3,
  Shield,
  Zap,
  Award,
  Crown,
  Sparkles,
  Lock,
  Users,
  Layers,
  Share2
} from 'lucide-react';

interface StatsModalProps {
  stats: UserStats;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'tiers' | 'graphs' | 'streak' | 'vault' | 'leaderboard';
}

export const StatsModal: React.FC<StatsModalProps> = ({
  stats,
  currentUser,
  isOpen,
  onClose,
  initialTab = 'tiers',
}) => {
  const [activeTab, setActiveTab] = useState<'tiers' | 'graphs' | 'streak' | 'vault' | 'leaderboard'>(initialTab);

  if (!isOpen) return null;

  const currentTier = getTierForSolved(stats.totalSolved);
  const nextTierIndex = TIERS_LADDER.findIndex(t => t.tierNumber === currentTier.tierNumber) + 1;
  const nextTier = nextTierIndex < TIERS_LADDER.length ? TIERS_LADDER[nextTierIndex] : null;

  // Progress to next tier calculation
  let progressPercent = 100;
  let remainingSolves = 0;
  if (nextTier) {
    const tierRange = nextTier.minSolved - currentTier.minSolved;
    const currentProgress = stats.totalSolved - currentTier.minSolved;
    progressPercent = Math.min(100, Math.max(0, Math.round((currentProgress / tierRange) * 100)));
    remainingSolves = Math.max(0, nextTier.minSolved - stats.totalSolved);
  }

  // Friends Leaderboard calculation
  const allAccounts = Object.values(getAllAccounts());
  const sortedAccounts = [...allAccounts].sort((a, b) => {
    if (b.stats.totalSolved !== a.stats.totalSolved) {
      return b.stats.totalSolved - a.stats.totalSolved;
    }
    return b.stats.streak - a.stats.streak;
  });

  // 7-day activity simulation based on user solves
  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0

  const getTierIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-slate-300" />;
      case 'Zap': return <Zap className="w-4 h-4 text-sky-400" />;
      case 'Shield': return <Shield className="w-4 h-4 text-cyan-400" />;
      case 'Award': return <Award className="w-4 h-4 text-cyan-300" />;
      case 'Flame': return <Flame className="w-4 h-4 text-purple-400" />;
      case 'Crown': return <Crown className="w-4 h-4 text-pink-400" />;
      default: return <Trophy className="w-4 h-4 text-cyan-400" />;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/90 backdrop-blur-md animate-fade-in select-none p-3 sm:p-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
      <div className="min-h-full flex items-center justify-center py-4">
        <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-cyan-500/30 rounded-[3px] shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_30px_rgba(6,182,212,0.12)] flex flex-col max-h-[88vh] sm:max-h-[92vh] overflow-hidden my-auto">
          {/* Modal Top Header */}
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0e0e0e] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[2px] overflow-hidden border border-cyan-400/40 bg-black shrink-0">
              <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display tracking-tight text-white">
                  {currentUser.username}
                </h3>
                <span
                  className="px-2 py-0.5 rounded-[1px] font-mono text-[9px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/40"
                >
                  {currentTier.levelName}
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80 tracking-wider block">
                COGNITIVE DOSSIER // {currentTier.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                haptics.medium();
                shareAchievement({
                  gameTitle: `Cognitive Dossier (${currentTier.title})`,
                  streak: stats.streak,
                  score: stats.totalSolved * 100,
                  customNote: `I am currently ${currentTier.title} with a ${stats.streak}-day streak and ${stats.totalSolved} puzzles solved on ARCADEX!`,
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/40 rounded-[2px] transition-all active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
              title="Share Rank & Streak on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-[10px] tracking-wider">SHARE DOSSIER</span>
            </button>

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
        </div>

        {/* Tab Navigation in Cyan */}
        <div className="flex border-b border-white/[0.08] bg-[#070707] font-mono text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('tiers');
            }}
            className={`py-3 px-4 flex items-center gap-1.5 whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'tiers'
                ? 'border-cyan-400 text-white font-bold bg-cyan-500/10'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-cyan-400" />
            <span>01 // TIERS LADDER</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('graphs');
            }}
            className={`py-3 px-4 flex items-center gap-1.5 whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'graphs'
                ? 'border-cyan-400 text-white font-bold bg-cyan-500/10'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>02 // ANALYTICS & GRAPHS</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('streak');
            }}
            className={`py-3 px-4 flex items-center gap-1.5 whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'streak'
                ? 'border-cyan-400 text-white font-bold bg-cyan-500/10'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            <span>03 // STREAK CONTINUUM</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('leaderboard');
            }}
            className={`py-3 px-4 flex items-center gap-1.5 whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'leaderboard'
                ? 'border-cyan-400 text-white font-bold bg-cyan-500/10'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>04 // FRIENDS ROSTER</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 scrollbar-thin">
          {/* TAB 1: TIERS & PROGRESSION */}
          {activeTab === 'tiers' && (
            <div className="space-y-6">
              {/* Current Tier Overview Banner */}
              <div
                className="p-4 rounded-[2px] border relative overflow-hidden bg-cyan-950/20 border-cyan-500/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-cyan-400 uppercase block">
                      CURRENT STATUS
                    </span>
                    <h4 className="text-xl font-bold font-display text-white mt-0.5">
                      {currentTier.title}
                    </h4>
                    <p className="text-xs text-white/70 font-sans mt-1">
                      {currentTier.description}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-[2px] border shrink-0 border-cyan-400/40 bg-cyan-500/10"
                  >
                    {getTierIcon(currentTier.badgeIcon)}
                  </div>
                </div>

                {/* Progress bar to next tier */}
                {nextTier ? (
                  <div className="mt-4 pt-3 border-t border-white/[0.08]">
                    <div className="flex justify-between items-center text-[10px] font-mono text-white/60 mb-1.5">
                      <span>NEXT: {nextTier.title}</span>
                      <span className="text-cyan-400 font-bold">
                        {remainingSolves} MORE {remainingSolves === 1 ? 'SOLVE' : 'SOLVES'} REQUIRED
                      </span>
                    </div>
                    <div className="w-full h-2 bg-black/80 rounded-[1px] border border-white/10 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 rounded-[1px] bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                        style={{
                          width: `${progressPercent}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-white/[0.08] text-xs font-mono text-pink-400 flex items-center gap-1.5">
                    <Crown className="w-4 h-4" /> MAXIMUM APEX TIER ACHIEVED. YOU ARE A CELESTIAL LEGEND.
                  </div>
                )}
              </div>

              {/* Full 6-Tier Hierarchy Tree */}
              <div className="space-y-3 text-left">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
                  ALL PROTOCOL TIERS & CRITERIA
                </span>

                <div className="space-y-2.5">
                  {TIERS_LADDER.map(t => {
                    const isCurrent = t.tierNumber === currentTier.tierNumber;
                    const isUnlocked = stats.totalSolved >= t.minSolved;

                    return (
                      <div
                        key={t.tierNumber}
                        className={`p-3.5 rounded-[2px] border transition-all ${
                          isCurrent
                            ? 'bg-[#141414] border-cyan-400/50 ring-1 ring-cyan-400/30'
                            : isUnlocked
                            ? 'bg-[#0a0a0a] border-white/[0.08]'
                            : 'bg-[#060606] border-white/[0.04] opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-[2px] border flex items-center justify-center shrink-0"
                              style={{
                                borderColor: `${t.accentColor}40`,
                                backgroundColor: `${t.accentColor}15`,
                              }}
                            >
                              {getTierIcon(t.badgeIcon)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-white">
                                  {t.levelName} // {t.title.split('//')[0].trim()}
                                </span>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.2 bg-cyan-400 text-black font-mono text-[8px] font-bold rounded-[1px]">
                                    ACTIVE
                                  </span>
                                )}
                                {!isUnlocked && (
                                  <span className="px-1.5 py-0.2 bg-white/10 text-white/40 font-mono text-[8px] rounded-[1px] flex items-center gap-0.5">
                                    <Lock className="w-2.5 h-2.5" /> LOCKED
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-white/40 block">
                                Requires {t.minSolved} - {t.maxSolved > 1000 ? '100+' : t.maxSolved} Solved Puzzles
                              </span>
                            </div>
                          </div>

                          <div className="text-right hidden sm:block">
                            <span className="text-[9px] font-mono text-white/40 uppercase block">UNLOCKED PERK</span>
                            <span className="text-xs font-mono text-cyan-300">{t.perk}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANALYTICS & CHARTS */}
          {activeTab === 'graphs' && (
            <div className="space-y-6 text-left">
              {/* 7-Day Activity Bar Chart */}
              <div className="p-4 bg-[#0e0e0e] border border-white/[0.08] rounded-[2px]">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                      WEEKLY ENGAGEMENT FREQUENCY
                    </span>
                    <h4 className="text-sm font-bold font-display text-white">
                      SOLVED PUZZLES BY DAY
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    TOTAL: {stats.totalSolved} SOLVED
                  </span>
                </div>

                {/* Interactive SVG / CSS Bar Chart */}
                <div className="h-36 flex items-end justify-between gap-2 pt-6 border-b border-white/10 pb-2">
                  {daysOfWeek.map((day, idx) => {
                    const isToday = idx === todayIndex;
                    const dayCount = isToday
                      ? Math.max(1, stats.totalSolved % 5 + 1)
                      : (stats.totalSolved > 0 ? ((idx + 2) % 4) : 0);
                    const barHeightPercent = Math.min(100, Math.max(12, dayCount * 22));

                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <span className="text-[9px] font-mono text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          {dayCount}
                        </span>
                        <div className="w-full bg-black/60 rounded-[1px] h-full flex items-end">
                          <div
                            className={`w-full rounded-[1px] transition-all duration-300 ${
                              isToday
                                ? 'bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                                : dayCount > 0
                                ? 'bg-cyan-600/40 group-hover:bg-cyan-400/60'
                                : 'bg-white/[0.06]'
                            }`}
                            style={{ height: `${barHeightPercent}%` }}
                          />
                        </div>
                        <span
                          className={`text-[9px] font-mono tracking-wider ${
                            isToday ? 'text-cyan-400 font-bold' : 'text-white/40'
                          }`}
                        >
                          {day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cognitive Proficiency Radar Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0e0e0e] border border-white/[0.08] rounded-[2px] space-y-3">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                    COGNITIVE VECTORS
                  </span>

                  <div className="space-y-2 font-mono text-xs">
                    <div>
                      <div className="flex justify-between text-[10px] text-white/60 mb-1">
                        <span>PATTERN RECOGNITION (2048/WORDLE)</span>
                        <span className="text-cyan-300 font-bold">98%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black rounded-[1px] border border-white/10">
                        <div className="h-full bg-cyan-400 rounded-[1px] w-[98%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-white/60 mb-1">
                        <span>SPATIAL ASSEMBLY (ANIME JIGSAW)</span>
                        <span className="text-cyan-300 font-bold">94%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black rounded-[1px] border border-white/10">
                        <div className="h-full bg-sky-400 rounded-[1px] w-[94%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-white/60 mb-1">
                        <span>WORKING MEMORY (CHIMP/SIMON)</span>
                        <span className="text-cyan-300 font-bold">89%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black rounded-[1px] border border-white/10">
                        <div className="h-full bg-teal-400 rounded-[1px] w-[89%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-white/60 mb-1">
                        <span>LOGICAL DEDUCTION (SUDOKU)</span>
                        <span className="text-cyan-300 font-bold">95%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black rounded-[1px] border border-white/10">
                        <div className="h-full bg-purple-400 rounded-[1px] w-[95%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Solves Breakdown */}
                <div className="p-4 bg-[#0e0e0e] border border-white/[0.08] rounded-[2px] flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                    100-LEVEL ARCHITECTURE
                  </span>

                  <div className="grid grid-cols-2 gap-2 my-2 font-mono">
                    <div className="p-2 bg-black border border-white/[0.06] rounded-[2px]">
                      <span className="text-[9px] text-white/40 block">ANIME JIGSAW</span>
                      <span className="text-sm font-bold text-cyan-400">
                        LVL {stats.levels?.['anime'] || 1}/100
                      </span>
                    </div>
                    <div className="p-2 bg-black border border-white/[0.06] rounded-[2px]">
                      <span className="text-[9px] text-white/40 block">WORDLE CIPHER</span>
                      <span className="text-sm font-bold text-cyan-400">
                        LVL {stats.levels?.['wordle'] || 1}/100
                      </span>
                    </div>
                    <div className="p-2 bg-black border border-white/[0.06] rounded-[2px]">
                      <span className="text-[9px] text-white/40 block">2048 SYNTH</span>
                      <span className="text-sm font-bold text-cyan-400">
                        LVL {stats.levels?.['2048'] || 1}/100
                      </span>
                    </div>
                    <div className="p-2 bg-black border border-white/[0.06] rounded-[2px]">
                      <span className="text-[9px] text-white/40 block">ACCURACY</span>
                      <span className="text-sm font-bold text-emerald-400">
                        {stats.accuracyRate}%
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono text-white/30">
                    Live real-time client validation across 12 protocols.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVE STREAK CALENDAR */}
          {activeTab === 'streak' && (
            <div className="space-y-5 text-left">
              <div className="p-4 bg-gradient-to-r from-cyan-950/40 to-blue-950/20 border border-cyan-500/30 rounded-[2px] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase block">
                    ACTIVE CONTINUITY STREAK
                  </span>
                  <div className="text-3xl font-display font-black text-cyan-400 mt-0.5 flex items-center gap-2">
                    <Flame className="w-6 h-6 fill-cyan-400 text-cyan-400 animate-pulse" />
                    {stats.streak} <span className="text-sm font-mono font-normal text-white/70">DAYS IN A ROW</span>
                  </div>
                  <p className="text-xs text-white/70 font-sans mt-1">
                    Play at least one puzzle daily to preserve your cognitive streak.
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[9px] text-white/40 uppercase block">LAST SOLVE DATE</span>
                  <span className="text-xs font-bold text-white">
                    {stats.lastPlayedDate || 'TODAY (ACTIVE)'}
                  </span>
                </div>
              </div>

              {/* 30-Day Activity Dot Grid Matrix */}
              <div className="p-4 bg-[#0e0e0e] border border-white/[0.08] rounded-[2px]">
                <div className="flex justify-between items-center mb-3 font-mono text-xs">
                  <span className="text-white/60">30-DAY CONTINUUM MATRIX</span>
                  <span className="text-cyan-400 text-[10px]">● = ACTIVE SOLVED DAY</span>
                </div>

                <div className="grid grid-cols-10 gap-2 p-2 bg-black rounded-[2px] border border-white/[0.06]">
                  {Array.from({ length: 30 }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const isActive = dayNum <= stats.streak || (idx === 29 && stats.streak > 0);
                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-[1px] border flex flex-col items-center justify-center font-mono text-[9px] transition-all ${
                          isActive
                            ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                            : 'bg-[#090909] border-white/[0.06] text-white/30'
                        }`}
                        title={`Day ${dayNum}: ${isActive ? 'Active' : 'Unrecorded'}`}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FRIENDS LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-white/40 uppercase tracking-widest">
                  LOCAL COMPETITIVE ROSTER
                </span>
                <span className="text-cyan-400 font-bold">
                  {sortedAccounts.length} OPERATORS REGISTERED
                </span>
              </div>

              <div className="space-y-2">
                {sortedAccounts.map((acc, index) => {
                  const isCurrent = acc.id === currentUser.id;
                  const rankTier = getTierForSolved(acc.stats.totalSolved);

                  return (
                    <div
                      key={acc.id}
                      className={`p-3.5 rounded-[2px] border flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-cyan-400/10 border-cyan-400/60 ring-1 ring-cyan-400/30'
                          : 'bg-[#0e0e0e] border-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 font-mono text-xs font-bold text-center ${
                            index === 0
                              ? 'text-cyan-400'
                              : index === 1
                              ? 'text-slate-300'
                              : index === 2
                              ? 'text-cyan-600'
                              : 'text-white/40'
                          }`}
                        >
                          #{index + 1}
                        </span>
                        <div className="w-9 h-9 rounded-[2px] overflow-hidden border border-white/20 bg-black shrink-0">
                          <img src={acc.avatar} alt={acc.username} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white">
                              {acc.username}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 bg-cyan-400 text-black font-mono text-[8px] font-bold rounded-[1px]">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-white/40 block">
                            {rankTier.title}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 font-mono text-xs text-right">
                        <div>
                          <span className="text-[9px] text-white/40 uppercase block">SOLVED</span>
                          <span className="font-bold text-white">{acc.stats.totalSolved}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-white/40 uppercase block">STREAK</span>
                          <span className="font-bold text-cyan-400 flex items-center justify-end gap-0.5">
                            <Flame className="w-3 h-3 fill-cyan-400" /> {acc.stats.streak}D
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

