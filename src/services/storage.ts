import { UserStats, TierInfo } from '../types';
import { getCurrentUser, updateCurrentUserProfile, logActivity } from './auth';
import { sound } from './audio';
import { syncGameProgressToCloud, syncStatsToCloud } from './supabase';

export const TIERS_LADDER: TierInfo[] = [
  {
    tierNumber: 1,
    levelName: 'TIER 1',
    title: 'BEGINNER // NOVICE',
    minSolved: 0,
    maxSolved: 4,
    perk: 'Arcade Gateway & Basic Cognitive Diagnostics',
    badgeIcon: 'Sparkles',
    accentColor: '#94a3b8',
    description: 'Fresh initiate into ARCADEX protocols. Learning fundamental logic pathways.'
  },
  {
    tierNumber: 2,
    levelName: 'TIER 2',
    title: 'APPRENTICE // STRATEGIST',
    minSolved: 5,
    maxSolved: 14,
    perk: 'Speedrun Mode & Custom High-Contrast Tiles',
    badgeIcon: 'Zap',
    accentColor: '#38bdf8',
    description: 'Demonstrated tactical problem-solving across multiple cognitive matrices.'
  },
  {
    tierNumber: 3,
    levelName: 'TIER 3',
    title: 'ADEPT // TACTICIAN',
    minSolved: 15,
    maxSolved: 29,
    perk: 'Exclusive Anime Jigsaw Golden Gallery & SFX Soundpacks',
    badgeIcon: 'Shield',
    accentColor: '#06b6d4',
    description: 'Mastery over spatial assembly, memory indexing, and matrix operations.'
  },
  {
    tierNumber: 4,
    levelName: 'TIER 4',
    title: 'EXPERT // ARCHITECT',
    minSolved: 30,
    maxSolved: 49,
    perk: 'Cognitive Velocity Analytics & Tier Leaderboard Crown',
    badgeIcon: 'Award',
    accentColor: '#22d3ee',
    description: 'Rapid deduction under severe constraints. Exceptional spatial and logic agility.'
  },
  {
    tierNumber: 5,
    levelName: 'TIER 5',
    title: 'PRODIGY // MASTER',
    minSolved: 50,
    maxSolved: 99,
    perk: 'Zero-Latency Grand Matrix & Infinite Challenge Protocols',
    badgeIcon: 'Flame',
    accentColor: '#a855f7',
    description: 'Elite neural efficiency. Top 1% execution across all 100-level protocols.'
  },
  {
    tierNumber: 6,
    levelName: 'TIER MAX',
    title: 'CELESTIAL // GRANDMASTER',
    minSolved: 100,
    maxSolved: 99999,
    perk: 'Immortal Studio Hall of Fame & Custom Cipher Creation',
    badgeIcon: 'Crown',
    accentColor: '#ec4899',
    description: 'Transcended standard calculation. The absolute pinnacle of ARCADEX masters.'
  }
];

export function getTierForSolved(solvedCount: number): TierInfo {
  for (const tier of TIERS_LADDER) {
    if (solvedCount >= tier.minSolved && solvedCount <= tier.maxSolved) {
      return tier;
    }
  }
  return TIERS_LADDER[TIERS_LADDER.length - 1];
}

export function loadUserStats(): UserStats {
  const user = getCurrentUser();
  return user.stats;
}

export function saveUserStats(stats: UserStats): void {
  updateCurrentUserProfile({ stats });
}

export function getGameLevel(gameId: string): number {
  const stats = loadUserStats();
  if (stats.levels && stats.levels[gameId]) {
    return stats.levels[gameId];
  }
  return 1;
}

export function setGameLevel(gameId: string, level: number): void {
  const stats = loadUserStats();
  const currentLevels = stats.levels || {};
  currentLevels[gameId] = Math.max(1, level);
  stats.levels = currentLevels;
  saveUserStats(stats);

  const user = getCurrentUser();
  if (user && user.id !== 'guest_primary') {
    syncGameProgressToCloud(user.id, gameId, Math.max(1, level), stats.scores[gameId] || 0);
  }
}

export function recordGameWin(gameId: string, score: number, gameTitle?: string, levelWon?: number): UserStats {
  const user = getCurrentUser();
  const stats = { ...user.stats };
  const today = new Date().toISOString().slice(0, 10);
  const prevStreak = stats.streak || 0;
  
  // Calculate dynamic streak correctly
  const activeDays = new Set(stats.activeDays || []);
  activeDays.add(today);

  let streakIncreased = false;

  if (!stats.lastPlayedDate) {
    // First ever game played!
    stats.streak = 1;
    stats.lastPlayedDate = today;
    streakIncreased = true;
  } else if (stats.lastPlayedDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (stats.lastPlayedDate === yesterday) {
      stats.streak += 1;
      streakIncreased = true;
    } else {
      stats.streak = 1;
    }
    stats.lastPlayedDate = today;
  } else {
    // Already played today: maintain current streak (ensure at least 1)
    if (stats.streak < 1) {
      stats.streak = 1;
      streakIncreased = true;
    }
  }

  // Play streak sound if streak expanded, otherwise play victory win sound!
  if (streakIncreased && stats.streak > prevStreak) {
    sound.playStreak();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('arcadex_streak_unlocked', {
        detail: { streak: stats.streak, prevStreak }
      }));
    }
  } else {
    sound.playWin();
  }

  stats.activeDays = Array.from(activeDays);
  stats.totalSolved += 1;
  stats.totalTimeMinutes += Math.floor(Math.random() * 2) + 2;

  // Track high score for this game
  const currentBest = stats.scores[gameId] || 0;
  if (score > currentBest) {
    stats.scores[gameId] = score;
  }

  // Update level advancement if provided (Unlimited for arrow-escape, 100 for others)
  let updatedLevel = stats.levels?.[gameId] || 1;
  if (levelWon) {
    const currentLevels = stats.levels || {};
    const existing = currentLevels[gameId] || 1;
    if (levelWon >= existing) {
      currentLevels[gameId] = levelWon + 1;
      updatedLevel = levelWon + 1;
    }
    stats.levels = currentLevels;
  }

  // Update Tier Rank dynamically
  const tier = getTierForSolved(stats.totalSolved);
  stats.arcadeRank = tier.title;

  saveUserStats(stats);
  logActivity(gameId, gameTitle || gameId.toUpperCase(), score);

  // Background sync to Supabase cloud
  if (user && user.id !== 'guest_primary') {
    syncGameProgressToCloud(user.id, gameId, updatedLevel, Math.max(score, currentBest));
    syncStatsToCloud(user.id, stats);
  }

  return stats;
}
