import { UserStats } from '../types';

const STORAGE_KEY = 'arcadex_user_stats';

const DEFAULT_STATS: UserStats = {
  streak: 3,
  lastPlayedDate: new Date().toISOString().slice(0, 10),
  totalSolved: 14,
  totalTimeMinutes: 48,
  accuracyRate: 98,
  arcadeRank: 'PRODIGY // TIER 1',
  scores: {
    '2048': 2048,
    'sudoku': 1,
    'minesweeper': 1,
    'chimp': 8,
    'flood': 18,
    'corsi': 7,
  }
};

export function loadUserStats(): UserStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveUserStats(DEFAULT_STATS);
      return DEFAULT_STATS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATS, ...parsed };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveUserStats(stats: UserStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

export function recordGameWin(gameId: string, score: number): UserStats {
  const stats = loadUserStats();
  const today = new Date().toISOString().slice(0, 10);
  
  // Update streak if new day
  if (stats.lastPlayedDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (stats.lastPlayedDate === yesterday) {
      stats.streak += 1;
    } else {
      stats.streak = 1;
    }
    stats.lastPlayedDate = today;
  }

  stats.totalSolved += 1;
  const currentBest = stats.scores[gameId] || 0;
  if (score > currentBest) {
    stats.scores[gameId] = score;
  }

  // Update rank based on total solved
  if (stats.totalSolved >= 50) {
    stats.arcadeRank = 'GRANDMASTER // LVL MAX';
  } else if (stats.totalSolved >= 25) {
    stats.arcadeRank = 'ARCHITECT // LVL 3';
  } else if (stats.totalSolved >= 10) {
    stats.arcadeRank = 'STRATEGIST // LVL 2';
  }

  saveUserStats(stats);
  return stats;
}
